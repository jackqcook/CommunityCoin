"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { 
  Coins, 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  Lock,
  Users,
  FileText,
  Sparkles,
  Check
} from "lucide-react";

export default function CreateGroupPage() {
  const router = useRouter();
  const { createGroup, buyTokens, joinGroup } = useStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    charter: "",
    isPublic: true,
    tokenSymbol: "",
    channels: ["general", "announcements"],
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
    setFormData(prev => ({
      ...prev,
      name,
      tokenSymbol: prev.tokenSymbol || generateSymbol(name),
    }));
  };

  const launch = (opts: { buy: boolean }) => {
    const newGroup = createGroup({
      name: formData.name,
      description: formData.description,
      charter: formData.charter,
      isPublic: formData.isPublic,
      tokenSymbol: formData.tokenSymbol,
      tokenPrice: 0.01,
      tokenSupply: 100000,
      treasuryBalance: 0,
      memberCount: 0,
      channels: formData.channels,
    });

    const buyAmount = parseFloat(initialBuyAmount);
    if (opts.buy && !isNaN(buyAmount) && buyAmount > 0) {
      buyTokens(newGroup.id, buyAmount);
    }

    // After launch, take creator directly into the member experience (chat)
    joinGroup(newGroup.id);
    
    router.push(`/group/${newGroup.id}`);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.length >= 3 && formData.description.length >= 10;
      case 2:
        return formData.tokenSymbol.length >= 2;
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
                    <div className="text-smoke text-sm">Anyone can see and buy tokens</div>
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
                    <div className="text-smoke text-sm">Invite-only, tokens don't grant votes</div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Token Setup */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-mint/10 flex items-center justify-center mx-auto mb-6">
                <Coins className="w-8 h-8 text-mint" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3 text-pearl">Configure Your Token</h1>
              <p className="text-smoke">Your community token launches automatically</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-pearl">Token Symbol</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke">$</span>
                  <input
                    type="text"
                    value={formData.tokenSymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, tokenSymbol: e.target.value.toUpperCase().slice(0, 5) }))}
                    placeholder="SYMBOL"
                    className="w-full pl-8 pr-4 py-4 bg-white border border-graphite rounded-xl focus:outline-none focus:border-mint transition-colors text-lg font-mono uppercase text-pearl placeholder:text-smoke/50"
                  />
                </div>
                <p className="text-smoke text-sm mt-2">2-5 characters, like a stock ticker</p>
              </div>

              <div className="glass rounded-xl p-6 space-y-4">
                <h3 className="font-medium text-lg text-pearl">Token Economics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate rounded-lg">
                    <div className="text-smoke mb-1">Starting Price</div>
                    <div className="font-mono text-lg text-pearl">$0.01</div>
                  </div>
                  <div className="p-4 bg-slate rounded-lg">
                    <div className="text-smoke mb-1">Initial Supply</div>
                    <div className="font-mono text-lg text-pearl">100,000</div>
                  </div>
                  <div className="p-4 bg-slate rounded-lg">
                    <div className="text-smoke mb-1">Curve Type</div>
                    <div className="font-mono text-lg text-pearl">Bonding</div>
                  </div>
                  <div className="p-4 bg-slate rounded-lg">
                    <div className="text-smoke mb-1">Treasury Fee</div>
                    <div className="font-mono text-lg text-pearl">2%</div>
                  </div>
                </div>
                <p className="text-smoke text-sm">
                  Price increases as more people buy. 2% of each trade goes to the community treasury.
                </p>
              </div>

              {formData.tokenSymbol && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-6 glass rounded-xl"
                >
                  <div className="text-smoke mb-2">Your token preview</div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-mint/20 to-mint/10 rounded-full">
                    <Sparkles className="w-5 h-5 text-mint" />
                    <span className="font-mono text-xl text-mint">${formData.tokenSymbol}</span>
                  </div>
                </motion.div>
              )}
            </div>
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
                  <div className="px-3 py-1 rounded-full bg-mint/10 text-mint text-sm font-mono">
                    ${formData.tokenSymbol}
                  </div>
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
                </div>

                <div className="border-t border-graphite pt-4">
                  <h3 className="font-medium mb-2 text-pearl">Charter</h3>
                  <p className="text-smoke text-sm leading-relaxed">{formData.charter}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-4 text-center">
                  <div className="text-smoke text-sm mb-1">Token Price</div>
                  <div className="font-mono text-lg text-mint">$0.01</div>
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

              {/* Optional: Buy tokens at launch (without joining) */}
              <div className="glass rounded-xl p-6">
                <h3 className="font-medium text-pearl mb-2">Buy at launch (optional)</h3>
                <p className="text-smoke text-sm mb-4">
                  Buy some ${formData.tokenSymbol || "tokens"} right as you launch.
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
                      ${formData.tokenSymbol || "TOKEN"}
                    </span>
                  </div>

                  {initialBuyAmount && !isNaN(parseFloat(initialBuyAmount)) && parseFloat(initialBuyAmount) > 0 && (
                    <div className="p-4 bg-slate rounded-xl space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-smoke">Price per token</span>
                        <span className="font-mono text-pearl">$0.01</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-smoke">Total cost</span>
                        <span className="font-mono text-pearl">
                          ${(parseFloat(initialBuyAmount) * 0.01).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-smoke">Treasury fee (2%)</span>
                        <span className="font-mono text-gold">
                          ${(parseFloat(initialBuyAmount) * 0.01 * 0.02).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  onClick={() => launch({ buy: true })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isNaN(parseFloat(initialBuyAmount)) || parseFloat(initialBuyAmount) <= 0}
                  className="w-full py-4 bg-mint rounded-xl font-semibold text-lg flex items-center justify-center gap-3 text-white disabled:opacity-30"
                >
                  Buy
                </motion.button>
                <motion.button
                  onClick={() => launch({ buy: false })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 glass rounded-xl font-semibold text-lg flex items-center justify-center gap-3 text-pearl hover:bg-graphite transition-colors"
                >
                  Skip
                </motion.button>
              </div>

              <p className="text-center text-smoke text-sm">
                Your token will deploy instantly and your group chat will be ready
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
