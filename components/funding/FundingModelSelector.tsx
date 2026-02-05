'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Heart,
  Calendar,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import type { FundingModel, FundingModelType, TokenConfig, DonationConfig, SubscriptionConfig } from '@/lib/types/funding';
import {
  FUNDING_MODEL_OPTIONS,
  DEFAULT_TOKEN_CONFIG,
  DEFAULT_DONATION_CONFIG,
  DEFAULT_SUBSCRIPTION_CONFIG,
} from '@/lib/types/funding';

interface FundingModelSelectorProps {
  value: FundingModel;
  onChange: (model: FundingModel) => void;
  groupName?: string;
}

const ICON_MAP = {
  Coins: Coins,
  Heart: Heart,
  Calendar: Calendar,
  Users: Users,
};

export function FundingModelSelector({ value, onChange, groupName }: FundingModelSelectorProps) {
  const [expandedType, setExpandedType] = useState<FundingModelType | null>(value.type !== 'none' ? value.type : null);
  
  const handleTypeSelect = (type: FundingModelType) => {
    setExpandedType(type);
    
    const newModel: FundingModel = { type };
    
    switch (type) {
      case 'token':
        newModel.tokenConfig = value.tokenConfig || { ...DEFAULT_TOKEN_CONFIG };
        break;
      case 'donation':
        newModel.donationConfig = value.donationConfig || { ...DEFAULT_DONATION_CONFIG };
        break;
      case 'subscription':
        newModel.subscriptionConfig = value.subscriptionConfig || { ...DEFAULT_SUBSCRIPTION_CONFIG };
        break;
    }
    
    onChange(newModel);
  };
  
  const updateTokenConfig = (updates: Partial<TokenConfig>) => {
    onChange({
      ...value,
      tokenConfig: {
        ...(value.tokenConfig || DEFAULT_TOKEN_CONFIG),
        ...updates,
      },
    });
  };
  
  const updateDonationConfig = (updates: Partial<DonationConfig>) => {
    onChange({
      ...value,
      donationConfig: {
        ...(value.donationConfig || DEFAULT_DONATION_CONFIG),
        ...updates,
      },
    });
  };
  
  const updateSubscriptionConfig = (updates: Partial<SubscriptionConfig>) => {
    onChange({
      ...value,
      subscriptionConfig: {
        ...(value.subscriptionConfig || DEFAULT_SUBSCRIPTION_CONFIG),
        ...updates,
      },
    });
  };
  
  return (
    <div className="space-y-4">
      {FUNDING_MODEL_OPTIONS.map((option) => {
        const Icon = ICON_MAP[option.icon as keyof typeof ICON_MAP];
        const isSelected = value.type === option.type;
        const isExpanded = expandedType === option.type;
        
        return (
          <motion.div
            key={option.type}
            initial={false}
            className={`rounded-xl border-2 transition-all overflow-hidden ${
              isSelected
                ? 'border-ember bg-ember/5'
                : 'border-graphite hover:border-smoke bg-white'
            }`}
          >
            {/* Option Header */}
            <button
              type="button"
              onClick={() => handleTypeSelect(option.type)}
              className="w-full p-4 flex items-start gap-4 text-left"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-ember/10' : 'bg-slate'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-ember' : 'text-smoke'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isSelected ? 'text-pearl' : 'text-pearl'}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-ember flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.span>
                  )}
                </div>
                <p className="text-smoke text-sm mt-1">{option.description}</p>
              </div>
              
              {option.type !== 'none' && (
                <div className="shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-smoke" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-smoke" />
                  )}
                </div>
              )}
            </button>
            
            {/* Configuration Panel */}
            <AnimatePresence>
              {isSelected && isExpanded && option.type !== 'none' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-graphite"
                >
                  <div className="p-4 space-y-4">
                    {/* Token Configuration */}
                    {option.type === 'token' && (
                      <TokenConfigPanel
                        config={value.tokenConfig || DEFAULT_TOKEN_CONFIG}
                        onChange={updateTokenConfig}
                        groupName={groupName}
                      />
                    )}
                    
                    {/* Donation Configuration */}
                    {option.type === 'donation' && (
                      <DonationConfigPanel
                        config={value.donationConfig || DEFAULT_DONATION_CONFIG}
                        onChange={updateDonationConfig}
                      />
                    )}
                    
                    {/* Subscription Configuration */}
                    {option.type === 'subscription' && (
                      <SubscriptionConfigPanel
                        config={value.subscriptionConfig || DEFAULT_SUBSCRIPTION_CONFIG}
                        onChange={updateSubscriptionConfig}
                      />
                    )}
                    
                    {/* Pros/Cons */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-graphite">
                      <div>
                        <div className="text-xs font-medium text-mint mb-2">Pros</div>
                        <ul className="space-y-1">
                          {option.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-smoke flex items-start gap-1">
                              <span className="text-mint">+</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-ember mb-2">Cons</div>
                        <ul className="space-y-1">
                          {option.cons.map((con, i) => (
                            <li key={i} className="text-xs text-smoke flex items-start gap-1">
                              <span className="text-ember">-</span> {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 bg-slate rounded-lg">
                      <Info className="w-4 h-4 text-smoke shrink-0 mt-0.5" />
                      <p className="text-xs text-smoke">
                        <strong>Best for:</strong> {option.bestFor}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// Token Configuration Panel
function TokenConfigPanel({
  config,
  onChange,
  groupName,
}: {
  config: TokenConfig;
  onChange: (updates: Partial<TokenConfig>) => void;
  groupName?: string;
}) {
  const generateSymbol = (name: string) => {
    const words = name.trim().toUpperCase().split(' ');
    if (words.length === 1) {
      return words[0].slice(0, 4);
    }
    return words.map((w) => w[0]).join('').slice(0, 5);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-pearl">Token Symbol</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke">$</span>
          <input
            type="text"
            value={config.symbol}
            onChange={(e) => onChange({ symbol: e.target.value.toUpperCase().slice(0, 5) })}
            placeholder={groupName ? generateSymbol(groupName) : 'TOKEN'}
            className="w-full pl-8 pr-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors font-mono uppercase text-pearl placeholder:text-smoke/50"
          />
        </div>
        <p className="text-xs text-smoke mt-1">2-5 characters, like a stock ticker</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate rounded-lg">
          <div className="text-xs text-smoke mb-1">Starting Price</div>
          <div className="font-mono text-lg text-pearl">${config.initialPrice.toFixed(2)}</div>
        </div>
        <div className="p-3 bg-slate rounded-lg">
          <div className="text-xs text-smoke mb-1">Treasury Fee</div>
          <div className="font-mono text-lg text-gold">2%</div>
        </div>
      </div>
      
      <p className="text-xs text-smoke">
        Token price increases as more people buy (bonding curve). 2% of each trade goes to the community treasury.
      </p>
    </div>
  );
}

// Donation Configuration Panel
function DonationConfigPanel({
  config,
  onChange,
}: {
  config: DonationConfig;
  onChange: (updates: Partial<DonationConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-pearl">
          Minimum Donation (optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke">$</span>
          <input
            type="number"
            min="0"
            step="1"
            value={config.minAmount || ''}
            onChange={(e) => onChange({ minAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="No minimum"
            className="w-full pl-8 pr-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-pearl">
          Suggested Amounts
        </label>
        <div className="flex flex-wrap gap-2">
          {(config.suggestedAmounts || DEFAULT_DONATION_CONFIG.suggestedAmounts)?.map((amount) => (
            <span
              key={amount}
              className="px-3 py-1 bg-slate rounded-full text-sm font-mono text-pearl"
            >
              ${amount}
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-pearl">
          Message (optional)
        </label>
        <input
          type="text"
          value={config.message || ''}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="Support our community"
          className="w-full px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
        />
      </div>
      
      <p className="text-xs text-smoke">
        Donations go directly to a multi-sig treasury controlled by group admins.
      </p>
    </div>
  );
}

// Subscription Configuration Panel
function SubscriptionConfigPanel({
  config,
  onChange,
}: {
  config: SubscriptionConfig;
  onChange: (updates: Partial<SubscriptionConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-pearl">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={config.price}
              onChange={(e) => onChange({ price: parseFloat(e.target.value) || 10 })}
              className="w-full pl-8 pr-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors font-mono text-pearl"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-pearl">Period</label>
          <select
            value={config.period}
            onChange={(e) => onChange({ period: e.target.value as 'monthly' | 'yearly' })}
            className="w-full px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-pearl">
          Member Benefits
        </label>
        <div className="space-y-2">
          {(config.benefits || DEFAULT_SUBSCRIPTION_CONFIG.benefits)?.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-pearl">
              <Check className="w-4 h-4 text-mint" />
              {benefit}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-3 bg-mint/10 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-pearl">
            {config.period === 'monthly' ? 'Monthly' : 'Yearly'} membership
          </span>
          <span className="font-mono text-lg text-mint">
            ${config.price}/{config.period === 'monthly' ? 'mo' : 'yr'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default FundingModelSelector;
