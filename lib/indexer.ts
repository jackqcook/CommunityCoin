// Blockchain indexer service for syncing on-chain data to Supabase

import { createServerSupabaseClient } from './supabase';
import { 
  CommunityTokenABI, 
  GroupFactoryABI, 
  getChainConfig, 
  formatEther,
  calculateTokenPrice,
  DEFAULT_CHAIN_ID
} from './contracts';
import type { GroupUpdate, ActivityInsert, MemberInsert } from './types/database';
import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { polygonMumbai, polygon } from 'viem/chains';

// Get viem chain from chain ID
function getViemChain(chainId: number) {
  switch (chainId) {
    case 80001:
      return polygonMumbai;
    case 137:
      return polygon;
    default:
      return polygonMumbai;
  }
}

// Create viem client for reading blockchain data
export function createBlockchainClient(chainId: number = DEFAULT_CHAIN_ID) {
  const config = getChainConfig(chainId);
  const rpcUrl = config.rpcUrl || `https://polygon-mumbai.g.alchemy.com/v2/demo`;
  return createPublicClient({
    chain: getViemChain(chainId),
    transport: http(rpcUrl),
  });
}

// Event types from our contracts
interface TokensPurchasedEvent {
  buyer: string;
  ethIn: bigint;
  tokensOut: bigint;
  newPrice: bigint;
}

interface TokensSoldEvent {
  seller: string;
  tokensIn: bigint;
  ethOut: bigint;
  newPrice: bigint;
}

interface GroupCreatedEvent {
  tokenAddress: string;
  treasuryAddress: string;
  creator: string;
  name: string;
  symbol: string;
  charterCid: string;
  isPublic: boolean;
}

// Parse TokensPurchased event
function parseTokensPurchasedEvent(log: Log): TokensPurchasedEvent {
  const args = log as unknown as { args: TokensPurchasedEvent };
  return args.args;
}

// Parse TokensSold event
function parseTokensSoldEvent(log: Log): TokensSoldEvent {
  const args = log as unknown as { args: TokensSoldEvent };
  return args.args;
}

// Handle GroupCreated event
export async function handleGroupCreated(
  event: GroupCreatedEvent,
  txHash: string,
  blockNumber: bigint,
  chainId: number = DEFAULT_CHAIN_ID
) {
  const supabase = createServerSupabaseClient();
  const client = createBlockchainClient(chainId);
  
  const {
    tokenAddress,
    treasuryAddress,
    creator,
    name,
    symbol,
    charterCid,
    isPublic,
  } = event;
  
  try {
    // Fetch initial on-chain state
    const [totalSupply, reserveBalance, treasuryBalance] = await Promise.all([
      client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: [parseAbiItem('function totalSupply() view returns (uint256)')],
        functionName: 'totalSupply',
      }),
      client.readContract({
        address: tokenAddress as `0x${string}`,
        abi: [parseAbiItem('function reserveBalance() view returns (uint256)')],
        functionName: 'reserveBalance',
      }),
      client.getBalance({ address: treasuryAddress as `0x${string}` }),
    ]);
    
    // Calculate initial price
    const tokenPrice = calculateTokenPrice(reserveBalance as bigint, totalSupply as bigint);
    
    // Create group record
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        contract_address: tokenAddress,
        treasury_address: treasuryAddress,
        chain_id: chainId,
        created_tx_hash: txHash,
        created_block: Number(blockNumber),
        creator_address: creator,
        charter_cid: charterCid,
        name,
        description: null, // Will be fetched from IPFS if available
        token_symbol: symbol,
        token_price: tokenPrice,
        total_supply: formatEther(totalSupply as bigint),
        reserve_balance: formatEther(reserveBalance as bigint),
        treasury_balance: formatEther(treasuryBalance),
        is_public: isPublic,
        funding_type: 'token',
        token_launched_at: new Date().toISOString(),
        last_indexed_block: Number(blockNumber),
        last_indexed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (groupError) {
      console.error('Error creating group:', groupError);
      throw groupError;
    }
    
    // Get creator's token balance
    const creatorBalance = await client.readContract({
      address: tokenAddress as `0x${string}`,
      abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
      functionName: 'balanceOf',
      args: [creator as `0x${string}`],
    });
    
    // Create initial member (creator)
    const memberInsert: MemberInsert = {
      group_id: group.id,
      wallet_address: creator,
      token_balance: formatEther(creatorBalance as bigint),
      role: 'founder',
      joined_at: new Date().toISOString(),
    };
    
    await supabase.from('members').insert(memberInsert);
    
    // Create activity entry
    const activityInsert: ActivityInsert = {
      group_id: group.id,
      event_type: 'group_created',
      actor_address: creator,
      tx_hash: txHash,
      block_number: Number(blockNumber),
      metadata: {
        tokenAddress,
        treasuryAddress,
        symbol,
        charterCid,
      },
    };
    
    await supabase.from('activity').insert(activityInsert);
    
    console.log(`Indexed new group: ${name} (${symbol}) at ${tokenAddress}`);
    return group;
  } catch (error) {
    console.error('Error handling GroupCreated event:', error);
    throw error;
  }
}

// Handle TokensPurchased event
export async function handleTokensPurchased(
  contractAddress: string,
  event: TokensPurchasedEvent,
  txHash: string,
  blockNumber: bigint,
  logIndex: number
) {
  const supabase = createServerSupabaseClient();
  
  const { buyer, ethIn, tokensOut, newPrice } = event;
  
  try {
    // Find the group by contract address
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, total_supply, treasury_balance')
      .eq('contract_address', contractAddress)
      .single();
    
    if (groupError || !group) {
      console.error('Group not found for contract:', contractAddress);
      return;
    }
    
    const ethAmount = formatEther(ethIn);
    const tokenAmount = formatEther(tokensOut);
    const priceNum = formatEther(newPrice);
    const fee = ethAmount * 0.02; // 2% fee
    
    // Update group with new price and supply
    const groupUpdate: GroupUpdate = {
      token_price: priceNum,
      total_supply: group.total_supply + tokenAmount,
      treasury_balance: group.treasury_balance + fee,
      last_indexed_block: Number(blockNumber),
      last_indexed_at: new Date().toISOString(),
    };
    
    await supabase
      .from('groups')
      .update(groupUpdate)
      .eq('id', group.id);
    
    // Update or create member
    const { data: existingMember } = await supabase
      .from('members')
      .select('id, token_balance')
      .eq('group_id', group.id)
      .eq('wallet_address', buyer)
      .single();
    
    if (existingMember) {
      await supabase
        .from('members')
        .update({
          token_balance: existingMember.token_balance + tokenAmount,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', existingMember.id);
    } else {
      // New member
      await supabase.from('members').insert({
        group_id: group.id,
        wallet_address: buyer,
        token_balance: tokenAmount,
        role: 'newcomer',
      });
      
      // Increment member count
      await supabase.rpc('increment_member_count', { group_id: group.id });
    }
    
    // Create activity entry
    await supabase.from('activity').insert({
      group_id: group.id,
      event_type: 'token_buy',
      actor_address: buyer,
      tx_hash: txHash,
      block_number: Number(blockNumber),
      log_index: logIndex,
      metadata: {
        ethIn: ethAmount,
        tokensOut: tokenAmount,
        newPrice: priceNum,
      },
    });
    
    console.log(`Indexed token purchase: ${buyer} bought ${tokenAmount} tokens`);
  } catch (error) {
    console.error('Error handling TokensPurchased event:', error);
    throw error;
  }
}

// Handle TokensSold event
export async function handleTokensSold(
  contractAddress: string,
  event: TokensSoldEvent,
  txHash: string,
  blockNumber: bigint,
  logIndex: number
) {
  const supabase = createServerSupabaseClient();
  
  const { seller, tokensIn, ethOut, newPrice } = event;
  
  try {
    // Find the group by contract address
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, total_supply')
      .eq('contract_address', contractAddress)
      .single();
    
    if (groupError || !group) {
      console.error('Group not found for contract:', contractAddress);
      return;
    }
    
    const ethAmount = formatEther(ethOut);
    const tokenAmount = formatEther(tokensIn);
    const priceNum = formatEther(newPrice);
    
    // Update group with new price and supply
    await supabase
      .from('groups')
      .update({
        token_price: priceNum,
        total_supply: Math.max(0, group.total_supply - tokenAmount),
        last_indexed_block: Number(blockNumber),
        last_indexed_at: new Date().toISOString(),
      })
      .eq('id', group.id);
    
    // Update member balance
    const { data: member } = await supabase
      .from('members')
      .select('id, token_balance')
      .eq('group_id', group.id)
      .eq('wallet_address', seller)
      .single();
    
    if (member) {
      const newBalance = Math.max(0, member.token_balance - tokenAmount);
      await supabase
        .from('members')
        .update({
          token_balance: newBalance,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', member.id);
      
      // If balance is 0, optionally remove member
      if (newBalance === 0) {
        await supabase
          .from('members')
          .delete()
          .eq('id', member.id);
        
        // Decrement member count
        await supabase.rpc('decrement_member_count', { group_id: group.id });
      }
    }
    
    // Create activity entry
    await supabase.from('activity').insert({
      group_id: group.id,
      event_type: 'token_sell',
      actor_address: seller,
      tx_hash: txHash,
      block_number: Number(blockNumber),
      log_index: logIndex,
      metadata: {
        tokensIn: tokenAmount,
        ethOut: ethAmount,
        newPrice: priceNum,
      },
    });
    
    console.log(`Indexed token sale: ${seller} sold ${tokenAmount} tokens`);
  } catch (error) {
    console.error('Error handling TokensSold event:', error);
    throw error;
  }
}

// Batch index a group from a specific block range
export async function indexGroupFromBlock(
  contractAddress: string,
  fromBlock: bigint,
  toBlock: bigint,
  chainId: number = DEFAULT_CHAIN_ID
) {
  const client = createBlockchainClient(chainId);
  const supabase = createServerSupabaseClient();
  
  try {
    // Get TokensPurchased events
    const purchaseEvents = await client.getLogs({
      address: contractAddress as `0x${string}`,
      event: parseAbiItem('event TokensPurchased(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 newPrice)'),
      fromBlock,
      toBlock,
    });
    
    // Get TokensSold events
    const sellEvents = await client.getLogs({
      address: contractAddress as `0x${string}`,
      event: parseAbiItem('event TokensSold(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 newPrice)'),
      fromBlock,
      toBlock,
    });
    
    // Process purchase events
    for (const log of purchaseEvents) {
      const event = parseTokensPurchasedEvent(log);
      await handleTokensPurchased(
        contractAddress,
        event,
        log.transactionHash!,
        log.blockNumber!,
        log.logIndex!
      );
    }
    
    // Process sell events
    for (const log of sellEvents) {
      const event = parseTokensSoldEvent(log);
      await handleTokensSold(
        contractAddress,
        event,
        log.transactionHash!,
        log.blockNumber!,
        log.logIndex!
      );
    }
    
    // Update last indexed block
    await supabase
      .from('groups')
      .update({
        last_indexed_block: Number(toBlock),
        last_indexed_at: new Date().toISOString(),
      })
      .eq('contract_address', contractAddress);
    
    console.log(`Indexed ${purchaseEvents.length + sellEvents.length} events for ${contractAddress}`);
  } catch (error) {
    console.error('Error indexing group:', error);
    throw error;
  }
}

// Get current on-chain state for a group (for refreshing/verifying)
export async function getOnChainGroupState(
  contractAddress: string,
  chainId: number = DEFAULT_CHAIN_ID
) {
  const client = createBlockchainClient(chainId);
  
  const [totalSupply, reserveBalance, currentPrice, charterCid] = await Promise.all([
    client.readContract({
      address: contractAddress as `0x${string}`,
      abi: [parseAbiItem('function totalSupply() view returns (uint256)')],
      functionName: 'totalSupply',
    }),
    client.readContract({
      address: contractAddress as `0x${string}`,
      abi: [parseAbiItem('function reserveBalance() view returns (uint256)')],
      functionName: 'reserveBalance',
    }),
    client.readContract({
      address: contractAddress as `0x${string}`,
      abi: [parseAbiItem('function currentPrice() view returns (uint256)')],
      functionName: 'currentPrice',
    }),
    client.readContract({
      address: contractAddress as `0x${string}`,
      abi: [parseAbiItem('function charterCid() view returns (string)')],
      functionName: 'charterCid',
    }),
  ]);
  
  return {
    totalSupply: formatEther(totalSupply as bigint),
    reserveBalance: formatEther(reserveBalance as bigint),
    currentPrice: formatEther(currentPrice as bigint),
    charterCid: charterCid as string,
  };
}

// Get token balance for a wallet
export async function getTokenBalance(
  contractAddress: string,
  walletAddress: string,
  chainId: number = DEFAULT_CHAIN_ID
): Promise<number> {
  const client = createBlockchainClient(chainId);
  
  const balance = await client.readContract({
    address: contractAddress as `0x${string}`,
    abi: [parseAbiItem('function balanceOf(address) view returns (uint256)')],
    functionName: 'balanceOf',
    args: [walletAddress as `0x${string}`],
  });
  
  return formatEther(balance as bigint);
}
