// Funding model types for group creation

export type FundingModelType = 'token' | 'donation' | 'subscription' | 'none';

export interface TokenConfig {
  symbol: string;
  initialPrice: number;
  reserveRatio?: number; // Default 50% for Bancor-style curve
}

export interface DonationConfig {
  address?: string; // Multi-sig address (auto-generate if not provided)
  minAmount?: number;
  suggestedAmounts?: number[];
  message?: string;
}

export interface SubscriptionConfig {
  price: number;
  period: 'monthly' | 'yearly';
  benefits?: string[];
}

export interface FundingModel {
  type: FundingModelType;
  tokenConfig?: TokenConfig;
  donationConfig?: DonationConfig;
  subscriptionConfig?: SubscriptionConfig;
}

export interface GroupCreationData {
  name: string;
  description: string;
  charter: string;
  isPublic: boolean;
  channels: string[];
  fundingModel: FundingModel;
}

// Funding model options for UI
export interface FundingModelOption {
  type: FundingModelType;
  label: string;
  description: string;
  icon: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export const FUNDING_MODEL_OPTIONS: FundingModelOption[] = [
  {
    type: 'token',
    label: 'Launch Token',
    description: 'Create a tradable membership token with bonding curve pricing',
    icon: 'Coins',
    pros: [
      'Price discovery through market',
      'Built-in liquidity',
      'Economic alignment',
    ],
    cons: [
      'Speculation risk',
      'More complex for users',
    ],
    bestFor: 'Communities wanting skin-in-the-game economic alignment',
  },
  {
    type: 'donation',
    label: 'Accept Donations',
    description: 'One-time contributions to community treasury',
    icon: 'Heart',
    pros: [
      'Simple and familiar',
      'No speculation',
      'Flexible amounts',
    ],
    cons: [
      'No membership token',
      'Less recurring funding',
    ],
    bestFor: 'Causes and projects needing one-time support',
  },
  {
    type: 'subscription',
    label: 'Monthly Membership',
    description: 'Recurring membership fees for access',
    icon: 'Calendar',
    pros: [
      'Predictable income',
      'Clear value exchange',
      'Sustainable model',
    ],
    cons: [
      'Requires ongoing value',
      'More commitment from users',
    ],
    bestFor: 'Communities offering ongoing content or services',
  },
  {
    type: 'none',
    label: 'Free Community',
    description: 'No funding model—just chat and governance',
    icon: 'Users',
    pros: [
      'No barrier to entry',
      'Quick to set up',
      'Can add funding later',
    ],
    cons: [
      'No treasury',
      'Limited mobilization',
    ],
    bestFor: 'Casual communities or groups testing the waters',
  },
];

// Default configurations
export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  symbol: '',
  initialPrice: 0.01,
  reserveRatio: 0.5,
};

export const DEFAULT_DONATION_CONFIG: DonationConfig = {
  suggestedAmounts: [10, 50, 100, 500],
  message: 'Support our community',
};

export const DEFAULT_SUBSCRIPTION_CONFIG: SubscriptionConfig = {
  price: 10,
  period: 'monthly',
  benefits: ['Access to private channels', 'Voting rights', 'Exclusive content'],
};
