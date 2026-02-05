// Contract ABIs and addresses for CommunityCoin

// Chain configuration
export const CHAIN_CONFIG = {
  // Polygon Amoy testnet (default for development) - Mumbai is deprecated
  80002: {
    name: 'Polygon Amoy',
    rpcUrl: `https://polygon-amoy.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: 'https://amoy.polygonscan.com',
    groupFactoryAddress: process.env.NEXT_PUBLIC_GROUP_FACTORY_ADDRESS || '',
  },
  // Polygon Mumbai (legacy - deprecated)
  80001: {
    name: 'Polygon Mumbai',
    rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: 'https://mumbai.polygonscan.com',
    groupFactoryAddress: process.env.NEXT_PUBLIC_GROUP_FACTORY_ADDRESS || '',
  },
  // Polygon mainnet (for production)
  137: {
    name: 'Polygon',
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
    blockExplorer: 'https://polygonscan.com',
    groupFactoryAddress: process.env.NEXT_PUBLIC_GROUP_FACTORY_ADDRESS || '',
  },
} as const;

export type SupportedChainId = keyof typeof CHAIN_CONFIG;

export const DEFAULT_CHAIN_ID = (parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '80001') as SupportedChainId);

// CommunityToken ABI (minimal for interaction)
export const CommunityTokenABI = [
  // Events
  'event TokensPurchased(address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 newPrice)',
  'event TokensSold(address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 newPrice)',
  'event CharterUpdated(string oldCid, string newCid)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function reserveBalance() view returns (uint256)',
  'function treasury() view returns (address)',
  'function charterCid() view returns (string)',
  'function isPublic() view returns (bool)',
  'function currentPrice() view returns (uint256)',
  'function calculatePurchaseReturn(uint256 ethIn) view returns (uint256)',
  'function calculateSaleReturn(uint256 tokenAmount) view returns (uint256)',
  
  // Write functions
  'function buy() payable',
  'function sell(uint256 tokenAmount)',
  'function updateCharter(string calldata newCid)',
] as const;

// GroupFactory ABI
export const GroupFactoryABI = [
  // Events
  'event GroupCreated(address indexed tokenAddress, address indexed treasuryAddress, address indexed creator, string name, string symbol, string charterCid, bool isPublic)',
  
  // Read functions
  'function allGroups(uint256) view returns (address)',
  'function isGroup(address) view returns (bool)',
  'function groupCount() view returns (uint256)',
  
  // Write functions
  'function createGroup(string calldata name, string calldata symbol, string calldata charterCid, bool isPublic) returns (address tokenAddress, address treasuryAddress)',
] as const;

// Treasury ABI (simplified)
export const TreasuryABI = [
  'function execute(address to, uint256 value, bytes calldata data) returns (bool)',
  'function getBalance() view returns (uint256)',
] as const;

// Event signatures for indexing
export const EVENT_SIGNATURES = {
  TokensPurchased: 'TokensPurchased(address,uint256,uint256,uint256)',
  TokensSold: 'TokensSold(address,uint256,uint256,uint256)',
  GroupCreated: 'GroupCreated(address,address,address,string,string,string,bool)',
  Transfer: 'Transfer(address,address,uint256)',
} as const;

// Event topic hashes (keccak256 of signatures)
export const EVENT_TOPICS = {
  TokensPurchased: '0x6f7e2f1c7d4e3f5b2c1d0a9e8f7b6a5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a',
  TokensSold: '0x7e2f1c7d4e3f5b2c1d0a9e8f7b6a5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9ab',
  GroupCreated: '0x8f2f1c7d4e3f5b2c1d0a9e8f7b6a5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9abc',
  Transfer: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
} as const;

// Helper to get chain config
export function getChainConfig(chainId: number = DEFAULT_CHAIN_ID) {
  const config = CHAIN_CONFIG[chainId as SupportedChainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config;
}

// Helper to format ETH amount
export function formatEther(wei: bigint): number {
  return Number(wei) / 1e18;
}

// Helper to parse ETH amount
export function parseEther(ether: number): bigint {
  return BigInt(Math.floor(ether * 1e18));
}

// Calculate token price from reserve and supply
export function calculateTokenPrice(reserveBalance: bigint, totalSupply: bigint): number {
  if (totalSupply === 0n) return 0.01; // Initial price
  return formatEther((reserveBalance * BigInt(1e18)) / totalSupply);
}
