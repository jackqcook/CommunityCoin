"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  Coins,
  ArrowLeft,
  Globe,
  Lock,
  Users,
  Calendar,
  TrendingUp,
  ExternalLink,
  Shield,
  Target,
  Sparkles,
} from "lucide-react";

export default function CharterPage() {
  const params = useParams();
  const { groups, currentGroup, setCurrentGroup } = useStore();

  useEffect(() => {
    if (params.id) {
      setCurrentGroup(params.id as string);
    }
  }, [params.id, setCurrentGroup]);

  if (!currentGroup) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate animate-pulse mx-auto mb-4" />
          <p className="text-smoke">Loading charter...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-white" />
      <div className="fixed inset-0 noise" />
      
      {/* Decorative elements */}
      <div className="fixed top-1/4 -left-48 w-96 h-96 bg-ember/5 rounded-full blur-[128px]" />
      <div className="fixed bottom-1/4 -right-48 w-96 h-96 bg-gold/5 rounded-full blur-[128px]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember to-flame flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-semibold text-pearl">CommunityCoin</span>
        </Link>

        <Link
          href={`/group/${currentGroup.id}`}
          className="flex items-center gap-2 text-smoke hover:text-pearl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Group
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-6">
            {currentGroup.isPublic ? (
              <>
                <Globe className="w-4 h-4 text-mint" />
                <span className="text-sm">Public Community</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-ember" />
                <span className="text-sm">Private Community</span>
              </>
            )}
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 text-pearl">
            {currentGroup.name}
          </h1>
          <p className="text-smoke text-xl max-w-2xl mx-auto">
            {currentGroup.description}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          <div className="glass rounded-xl p-5 text-center">
            <Users className="w-6 h-6 text-ember mx-auto mb-2" />
            <div className="font-mono text-2xl mb-1 text-pearl">{currentGroup.memberCount.toLocaleString()}</div>
            <div className="text-smoke text-sm">Members</div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <TrendingUp className="w-6 h-6 text-mint mx-auto mb-2" />
            <div className="font-mono text-2xl mb-1 text-pearl">${formatPrice(currentGroup.tokenPrice)}</div>
            <div className="text-smoke text-sm">${currentGroup.tokenSymbol} Price</div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <Coins className="w-6 h-6 text-gold mx-auto mb-2" />
            <div className="font-mono text-2xl mb-1 text-pearl">${currentGroup.treasuryBalance.toLocaleString()}</div>
            <div className="text-smoke text-sm">Treasury</div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <Calendar className="w-6 h-6 text-smoke mx-auto mb-2" />
            <div className="font-mono text-2xl mb-1 text-pearl">
              {new Date(currentGroup.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </div>
            <div className="text-smoke text-sm">Founded</div>
          </div>
        </motion.div>

        {/* Charter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember to-flame flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-pearl">Our Charter</h2>
              <p className="text-smoke text-sm">What we believe and what we're building</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <p className="text-lg leading-relaxed whitespace-pre-wrap text-smoke">
              {currentGroup.charter}
            </p>
          </div>
        </motion.div>

        {/* How to Join */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-mint" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-pearl">How to Participate</h2>
              <p className="text-smoke text-sm">Get involved in the community</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-6">
              <div className="text-3xl mb-3 text-ember">1</div>
              <h3 className="font-medium mb-2 text-pearl">Buy ${currentGroup.tokenSymbol}</h3>
              <p className="text-smoke text-sm">
                {currentGroup.isPublic
                  ? "Holding tokens grants voting power proportional to your stake."
                  : "Tokens are freely tradable but don't grant voting rights in private groups."}
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-3xl mb-3 text-ember">2</div>
              <h3 className="font-medium mb-2 text-pearl">Join the Conversation</h3>
              <p className="text-smoke text-sm">
                Connect with members in encrypted group chat. Share ideas, collaborate, and build together.
              </p>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-3xl mb-3 text-ember">3</div>
              <h3 className="font-medium mb-2 text-pearl">Shape the Future</h3>
              <p className="text-smoke text-sm">
                Create and vote on proposals. Help decide how the treasury is deployed.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Token Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-pearl">${currentGroup.tokenSymbol} Token</h2>
              <p className="text-smoke text-sm">Community token economics</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-smoke text-sm mb-1">Current Price</div>
                <div className="font-mono text-xl text-mint">${formatPrice(currentGroup.tokenPrice)}</div>
              </div>
              <div>
                <div className="text-smoke text-sm mb-1">Total Supply</div>
                <div className="font-mono text-xl text-pearl">{currentGroup.tokenSupply.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-smoke text-sm mb-1">Market Cap</div>
                <div className="font-mono text-xl text-pearl">
                  ${Math.round(currentGroup.tokenSupply * currentGroup.tokenPrice).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-smoke text-sm mb-1">Treasury Fee</div>
                <div className="font-mono text-xl text-gold">2%</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-graphite">
              <h4 className="font-medium mb-2 text-pearl">Bonding Curve</h4>
              <p className="text-smoke text-sm leading-relaxed">
                ${currentGroup.tokenSymbol} uses an automated bonding curve for instant liquidity. 
                The price increases as more tokens are purchased and decreases as tokens are sold. 
                2% of every trade goes to the community treasury, which members govern collectively.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            href={`/group/${currentGroup.id}`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-ember to-flame rounded-xl font-semibold text-lg hover:scale-105 transition-transform text-white"
          >
            Enter Community
            <ExternalLink className="w-5 h-5" />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
