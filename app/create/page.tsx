"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useStore } from "@/lib/store";
import { useCreateGroup } from "@/lib/hooks/useCreateGroup";
import { uploadCharterToIPFS } from "@/lib/ipfs";
import { FundingModelSelector } from "@/components/funding/FundingModelSelector";
import type { FundingModel, GroupCreationData } from "@/lib/types/funding";
import { 
  Coins, 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  Lock,
  Users,
  FileText,
  Sparkles,
  Check,
  Wallet,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function CreateGroupPage() {
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const { createGroup, buyTokens, joinGroup } = useStore();
  const { 
    createGroup: createOnChain, 
    status: deployStatus, 
    error: deployError,
    isLoading: isDeploying 
  } = useCreateGroup();
  
  const [step, setStep] = useState(1);
  const [isLaunching, setIsLaunching] = useState(false);
  const [formData, setFormData] = useState<GroupCreationData>({
    name: "",
    description: "",
    charter: "",
    isPublic: true,
    channels: ["general", "announcements"],
    fundingModel: {
      type: "none",
    },
  });
  const [initialBuyAmount, setInitialBuyAmount] = useState("");

  const generateSymbol = (name: string) => {
    const words = name.trim().toUpperCase().split(" ");
    if (words.length === 1) {
      return words[0].slice(0, 4);
    }
    return words.map(w => w[0]).join("").slice(0, 5);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const newData = { ...prev, name };
      // Auto-generate token symbol if using token funding
      if (prev.fundingModel.type === "token" && prev.fundingModel.tokenConfig) {
        newData.fundingModel = {
          ...prev.fundingModel,
          tokenConfig: {
            ...prev.fundingModel.tokenConfig,
            symbol: prev.fundingModel.tokenConfig.symbol || generateSymbol(name),
          },
        };
      }
      return newData;
    });
  };

  const handleFundingModelChange = (model: FundingModel) => {
    setFormData(prev => ({
      ...prev,
      fundingModel: model,
    }));
  };

  const launch = async (opts: { buy: boolean }) => {
    setIsLaunching(true);
    
    try {
      // Determine token symbol based on funding model
      const tokenSymbol = formData.fundingModel.type === "token"
        ? formData.fundingModel.tokenConfig?.symbol || generateSymbol(formData.name)
        : generateSymbol(formData.name);

      // For token-funded groups, deploy on-chain
      if (formData.fundingModel.type === "token") {
        // Check if wallet is connected
        if (!authenticated) {
          login();
          setIsLaunching(false);
          return;
        }

        // Upload charter to IPFS
        const charterCid = await uploadCharterToIPFS({
          name: formData.name,
          description: formData.description,
          charter: formData.charter,
          createdAt: new Date().toISOString(),
          version: "1.0.0",
        });

        // Deploy contracts on-chain
        const result = await createOnChain({
          name: formData.name,
          symbol: tokenSymbol,
          charterCid,
          isPublic: formData.isPublic,
        });

        if (!result) {
          // Error handled by hook
          setIsLaunching(false);
          return;
        }

        // Create local group entry (will be synced from blockchain via indexer)
        const newGroup = createGroup({
          name: formData.name,
          description: formData.description,
          charter: formData.charter,
          isPublic: formData.isPublic,
          tokenSymbol,
          tokenPrice: formData.fundingModel.tokenConfig?.initialPrice || 0.01,
          tokenSupply: 0, // Will be updated by indexer
          treasuryBalance: 0,
          memberCount: 0,
          channels: formData.channels,
          governanceRules: [],
          updates: [],
          tickets: [],
          libraryCollections: [],
          libraryAssets: [],
        });

        // Store the contract addresses (for future reference)
        console.log('Group deployed:', {
          tokenAddress: result.tokenAddress,
          treasuryAddress: result.treasuryAddress,
          txHash: result.transactionHash,
        });

        // Buy tokens if opted in
        if (opts.buy) {
          const buyAmount = parseFloat(initialBuyAmount);
          if (!isNaN(buyAmount) && buyAmount > 0) {
            buyTokens(newGroup.id, buyAmount);
          }
        }

        joinGroup(newGroup.id);
        router.push(`/group/${newGroup.id}`);
      } else {
        // Non-token groups: just create locally for now
        const newGroup = createGroup({
          name: formData.name,
          description: formData.description,
          charter: formData.charter,
          isPublic: formData.isPublic,
          tokenSymbol,
          tokenPrice: 0,
          tokenSupply: 0,
          treasuryBalance: 0,
          memberCount: 0,
          channels: formData.channels,
          governanceRules: [],
          updates: [],
          tickets: [],
          libraryCollections: [],
          libraryAssets: [],
        });

        joinGroup(newGroup.id);
        router.push(`/group/${newGroup.id}`);
      }
    } catch (error) {
      console.error('Launch error:', error);
    } finally {
      setIsLaunching(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.length >= 3 && formData.description.length >= 10;
      case 2:
        // Funding model validation
        if (formData.fundingModel.type === "token") {
          return (formData.fundingModel.tokenConfig?.symbol?.length || 0) >= 2;
        }
        if (formData.fundingModel.type === "subscription") {
          return (formData.fundingModel.subscriptionConfig?.price || 0) > 0;
        }
        return true; // donation and none are always valid
      case 3:
        return formData.charter.length >= 50;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-white" />
      <div className="fixed inset-0 noise" />
      <div className="fixed top-1/3 -left-32 w-96 h-96 bg-ember/5 rounded-full blur-[128px]" />
      <div className="fixed bottom-1/3 -right-32 w-96 h-96 bg-mint/5 rounded-full blur-[128px]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember to-flame flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-semibold text-pearl">CommunityCoin</span>
        </Link>
        
        <Link href="/" className="text-smoke hover:text-pearl transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm transition-colors ${
                  s < step
                    ? "bg-mint text-midnight"
                    : s === step
                    ? "bg-ember text-white"
                    : "bg-graphite text-smoke"
                }`}
                animate={{ scale: s === step ? 1.1 : 1 }}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </motion.div>
              {s < 4 && (
                <div className={`w-12 h-0.5 ${s < step ? "bg-mint" : "bg-graphite"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-ember/10 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-ember" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3 text-pearl">Name Your Community</h1>
              <p className="text-smoke">What movement are you building?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-pearl">Community Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Solarpunk Builders"
                  className="w-full px-4 py-4 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-lg text-pearl placeholder:text-smoke/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-pearl">Short Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A one-liner about what your community does..."
                  rows={3}
                  className="w-full px-4 py-4 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors resize-none text-pearl placeholder:text-smoke/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4 text-pearl">Visibility</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.isPublic
                        ? "border-ember bg-ember/10"
                        : "border-graphite hover:border-smoke bg-white"
                    }`}
                  >
                    <Globe className={`w-6 h-6 mb-2 ${formData.isPublic ? "text-ember" : "text-smoke"}`} />
                    <div className="font-medium text-pearl">Public</div>
                    <div className="text-smoke text-sm">Anyone can see and join</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      !formData.isPublic
                        ? "border-ember bg-ember/10"
                        : "border-graphite hover:border-smoke bg-white"
                    }`}
                  >
                    <Lock className={`w-6 h-6 mb-2 ${!formData.isPublic ? "text-ember" : "text-smoke"}`} />
                    <div className="font-medium text-pearl">Private</div>
                    <div className="text-smoke text-sm">Invite-only membership</div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Funding Model */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-mint/10 flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-mint" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3 text-pearl">Choose Your Funding Model</h1>
              <p className="text-smoke">How will your community raise and manage funds?</p>
            </div>

            <FundingModelSelector
              value={formData.fundingModel}
              onChange={handleFundingModelChange}
              groupName={formData.name}
            />
          </motion.div>
        )}

        {/* Step 3: Charter */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-gold" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3 text-pearl">Write Your Charter</h1>
              <p className="text-smoke">What does your community believe and build?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-pearl">Community Charter</label>
                <textarea
                  value={formData.charter}
                  onChange={(e) => setFormData(prev => ({ ...prev, charter: e.target.value }))}
                  placeholder="We believe in... Our mission is to... We aim to achieve..."
                  rows={8}
                  className="w-full px-4 py-4 bg-white border border-graphite rounded-xl focus:outline-none focus:border-gold transition-colors resize-none leading-relaxed text-pearl placeholder:text-smoke/50"
                />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-smoke">This will be public on your group's page</span>
                  <span className={formData.charter.length >= 50 ? "text-mint" : "text-smoke"}>
                    {formData.charter.length} / 50+ characters
                  </span>
                </div>
              </div>

              <div className="glass rounded-xl p-6">
                <h3 className="font-medium mb-3 text-pearl">Charter Tips</h3>
                <ul className="space-y-2 text-smoke text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-ember">•</span>
                    State your core beliefs and values
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ember">•</span>
                    Describe what you're building together
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ember">•</span>
                    Explain why someone should join
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-ember">•</span>
                    Set expectations for members
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review & Launch */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-ember/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-ember" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3 text-pearl">Ready to Launch</h1>
              <p className="text-smoke">Review your community details</p>
            </div>

            <div className="space-y-6">
              <div className="glass rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-pearl">{formData.name}</h2>
                    <p className="text-smoke">{formData.description}</p>
                  </div>
                  {formData.fundingModel.type === "token" && (
                    <div className="px-3 py-1 rounded-full bg-mint/10 text-mint text-sm font-mono">
                      ${formData.fundingModel.tokenConfig?.symbol || generateSymbol(formData.name)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  {formData.isPublic ? (
                    <span className="flex items-center gap-1 text-sm text-smoke">
                      <Globe className="w-4 h-4" /> Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-smoke">
                      <Lock className="w-4 h-4" /> Private
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-smoke">
                    <Wallet className="w-4 h-4" /> 
                    {formData.fundingModel.type === "token" && "Token Launch"}
                    {formData.fundingModel.type === "donation" && "Donations"}
                    {formData.fundingModel.type === "subscription" && "Subscription"}
                    {formData.fundingModel.type === "none" && "Free Community"}
                  </span>
                </div>

                <div className="border-t border-graphite pt-4">
                  <h3 className="font-medium mb-2 text-pearl">Charter</h3>
                  <p className="text-smoke text-sm leading-relaxed">{formData.charter}</p>
                </div>
              </div>

              {/* Funding Model Summary */}
              {formData.fundingModel.type === "token" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-smoke text-sm mb-1">Token Price</div>
                    <div className="font-mono text-lg text-mint">
                      ${formData.fundingModel.tokenConfig?.initialPrice?.toFixed(2) || "0.01"}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-smoke text-sm mb-1">Supply</div>
                    <div className="font-mono text-lg text-pearl">100K</div>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <div className="text-smoke text-sm mb-1">Treasury Fee</div>
                    <div className="font-mono text-lg text-gold">2%</div>
                  </div>
                </div>
              )}

              {formData.fundingModel.type === "subscription" && (
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-pearl">Membership Price</span>
                    <span className="font-mono text-lg text-mint">
                      ${formData.fundingModel.subscriptionConfig?.price || 10}/
                      {formData.fundingModel.subscriptionConfig?.period === "yearly" ? "yr" : "mo"}
                    </span>
                  </div>
                </div>
              )}

              {formData.fundingModel.type === "donation" && (
                <div className="glass rounded-xl p-4">
                  <div className="text-sm text-smoke">
                    Accepting donations with suggested amounts: 
                    {(formData.fundingModel.donationConfig?.suggestedAmounts || [10, 50, 100, 500])
                      .map(a => ` $${a}`)
                      .join(",")}
                  </div>
                </div>
              )}

              {/* Optional: Buy tokens at launch (only for token model) */}
              {formData.fundingModel.type === "token" && (
                <div className="glass rounded-xl p-6">
                  <h3 className="font-medium text-pearl mb-2">Buy at launch (optional)</h3>
                  <p className="text-smoke text-sm mb-4">
                    Buy some ${formData.fundingModel.tokenConfig?.symbol || generateSymbol(formData.name)} right as you launch.
                  </p>

                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={initialBuyAmount}
                        onChange={(e) => setInitialBuyAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-4 bg-white border border-graphite rounded-xl focus:outline-none focus:border-mint transition-colors font-mono text-lg text-pearl placeholder:text-smoke/50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke font-mono">
                        ${formData.fundingModel.tokenConfig?.symbol || "TOKEN"}
                      </span>
                    </div>

                    {initialBuyAmount && !isNaN(parseFloat(initialBuyAmount)) && parseFloat(initialBuyAmount) > 0 && (
                      <div className="p-4 bg-slate rounded-xl space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-smoke">Price per token</span>
                          <span className="font-mono text-pearl">
                            ${formData.fundingModel.tokenConfig?.initialPrice?.toFixed(2) || "0.01"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-smoke">Total cost</span>
                          <span className="font-mono text-pearl">
                            ${(parseFloat(initialBuyAmount) * (formData.fundingModel.tokenConfig?.initialPrice || 0.01)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-smoke">Treasury fee (2%)</span>
                          <span className="font-mono text-gold">
                            ${(parseFloat(initialBuyAmount) * (formData.fundingModel.tokenConfig?.initialPrice || 0.01) * 0.02).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Deploy Status Messages */}
              {deployError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="text-red-700 text-sm">{deployError}</div>
                </div>
              )}

              {isDeploying && (
                <div className="p-4 bg-mint/10 border border-mint/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="w-5 h-5 text-mint animate-spin" />
                    <span className="font-medium text-pearl">
                      {deployStatus === 'awaiting_signature' && 'Waiting for wallet signature...'}
                      {deployStatus === 'pending' && 'Deploying contracts...'}
                      {deployStatus === 'uploading_charter' && 'Uploading charter to IPFS...'}
                    </span>
                  </div>
                  <p className="text-smoke text-sm">
                    This may take a minute. Please don&apos;t close this page.
                  </p>
                </div>
              )}

              {/* Launch Buttons */}
              {formData.fundingModel.type === "token" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => launch({ buy: true })}
                    whileHover={{ scale: isLaunching ? 1 : 1.02 }}
                    whileTap={{ scale: isLaunching ? 1 : 0.98 }}
                    disabled={isLaunching || isNaN(parseFloat(initialBuyAmount)) || parseFloat(initialBuyAmount) <= 0}
                    className="w-full py-4 bg-mint rounded-xl font-semibold text-lg flex items-center justify-center gap-3 text-white disabled:opacity-30"
                  >
                    {isLaunching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      'Buy & Launch'
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => launch({ buy: false })}
                    whileHover={{ scale: isLaunching ? 1 : 1.02 }}
                    whileTap={{ scale: isLaunching ? 1 : 0.98 }}
                    disabled={isLaunching}
                    className="w-full py-4 glass rounded-xl font-semibold text-lg flex items-center justify-center gap-3 text-pearl hover:bg-graphite transition-colors disabled:opacity-30"
                  >
                    {isLaunching ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      'Launch Without Buying'
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => launch({ buy: false })}
                  whileHover={{ scale: isLaunching ? 1 : 1.02 }}
                  whileTap={{ scale: isLaunching ? 1 : 0.98 }}
                  disabled={isLaunching}
                  className="w-full py-4 bg-ember rounded-xl font-semibold text-lg flex items-center justify-center gap-3 text-white disabled:opacity-30"
                >
                  {isLaunching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Launch Community
                    </>
                  )}
                </motion.button>
              )}

              <p className="text-center text-smoke text-sm">
                {formData.fundingModel.type === "token" 
                  ? "Your token will deploy instantly and your group chat will be ready"
                  : "Your community will be created and your group chat will be ready"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-12">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-30 hover:bg-graphite transition-colors text-pearl"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={() => setStep(s => Math.min(4, s + 1))}
              disabled={!canProceed()}
              className="px-6 py-3 bg-ember rounded-xl font-medium flex items-center gap-2 disabled:opacity-30 hover:bg-ember/90 transition-colors text-white"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
