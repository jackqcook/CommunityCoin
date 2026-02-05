import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallets } from '@privy-io/react-auth';
import { GroupFactoryABI, getChainConfig, DEFAULT_CHAIN_ID } from '../contracts';

export interface CreateGroupParams {
  name: string;
  symbol: string;
  charterCid: string;
  isPublic: boolean;
}

export interface CreateGroupResult {
  tokenAddress: string;
  treasuryAddress: string;
  transactionHash: string;
}

export type CreateGroupStatus = 
  | 'idle' 
  | 'uploading_charter' 
  | 'awaiting_signature' 
  | 'pending' 
  | 'success' 
  | 'error';

export function useCreateGroup() {
  const { wallets } = useWallets();
  const [status, setStatus] = useState<CreateGroupStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateGroupResult | null>(null);

  const createGroup = useCallback(async (params: CreateGroupParams): Promise<CreateGroupResult | null> => {
    const wallet = wallets[0];
    
    if (!wallet) {
      setError('No wallet connected');
      setStatus('error');
      return null;
    }

    try {
      setStatus('awaiting_signature');
      setError(null);
      
      // Get the chain config
      const chainConfig = getChainConfig(DEFAULT_CHAIN_ID);
      
      if (!chainConfig.groupFactoryAddress) {
        throw new Error('GroupFactory contract not deployed. Please deploy contracts first.');
      }

      // Get the provider and signer from Privy wallet
      const provider = await wallet.getEthersProvider();
      const signer = provider.getSigner();
      
      // Create contract instance
      const factory = new ethers.Contract(
        chainConfig.groupFactoryAddress,
        GroupFactoryABI,
        signer
      );
      
      // Call createGroup on the factory
      setStatus('pending');
      const tx = await factory.createGroup(
        params.name,
        params.symbol,
        params.charterCid,
        params.isPublic
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Parse the GroupCreated event to get addresses
      const groupCreatedEvent = receipt.logs.find((log: ethers.Log) => {
        try {
          const parsed = factory.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          return parsed?.name === 'GroupCreated';
        } catch {
          return false;
        }
      });
      
      if (!groupCreatedEvent) {
        throw new Error('GroupCreated event not found in transaction');
      }
      
      const parsedEvent = factory.interface.parseLog({
        topics: groupCreatedEvent.topics as string[],
        data: groupCreatedEvent.data,
      });
      
      const createResult: CreateGroupResult = {
        tokenAddress: parsedEvent?.args?.tokenAddress || '',
        treasuryAddress: parsedEvent?.args?.treasuryAddress || '',
        transactionHash: receipt.hash,
      };
      
      setResult(createResult);
      setStatus('success');
      
      return createResult;
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Handle user rejection
      if (errorMessage.includes('user rejected') || errorMessage.includes('ACTION_REJECTED')) {
        setError('Transaction was rejected');
      } else if (errorMessage.includes('insufficient funds')) {
        setError('Insufficient funds for gas');
      } else {
        setError(errorMessage);
      }
      
      setStatus('error');
      return null;
    }
  }, [wallets]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  return {
    createGroup,
    status,
    error,
    result,
    reset,
    isLoading: status === 'awaiting_signature' || status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
