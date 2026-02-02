"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { 
  Shield, 
  Coins, 
  Vote, 
  Users, 
  Lock, 
  TrendingUp,
  ArrowRight,
  Zap,
  Globe,
  MessageSquare
} from "lucide-react";

export default function LandingPage() {
  const { groups } = useStore();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-midnight via-obsidian to-slate" />
      <div className="fixed inset-0 noise" />
      
      {/* Animated orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-ember/20 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-gold/10 rounded-full blur-[128px] animate-pulse-slow" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember to-gold flex items-center justify-center">
            <Coins className="w-5 h-5 text-midnight" />
          </div>
          <span className="font-display text-2xl font-semibold">CommunityCoin</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/explore" className="text-smoke hover:text-pearl transition-colors">
            Explore
          </Link>
          <Link 
            href="/create" 
            className="px-5 py-2.5 bg-gradient-to-r from-ember to-flame rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Group
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8">
            <span className="gradient-text">Mobilize</span> Your
            <br />Movement
          </h1>
          
          <p className="text-xl md:text-2xl text-smoke leading-relaxed mb-12 max-w-2xl mx-auto">
            Turn online communities into coordinated action. Encrypted groups, liquid tokens, 
            shared treasuries, and collective decision-making.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/create"
              className="group px-8 py-4 bg-gradient-to-r from-ember to-flame rounded-xl font-semibold text-lg flex items-center gap-3 hover:scale-105 transition-transform"
            >
              Start a Community
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/explore"
              className="px-8 py-4 glass rounded-xl font-semibold text-lg hover:bg-graphite/50 transition-colors"
            >
              Explore Groups
            </Link>
          </div>
        </motion.div>

        {/* Floating cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groups.slice(0, 3).map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-graphite/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-1">{group.name}</h3>
                    <p className="text-smoke text-sm">{group.memberCount.toLocaleString()} members</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-mint/10 text-mint text-sm font-mono">
                    ${group.tokenSymbol}
                  </div>
                </div>
                <p className="text-smoke text-sm leading-relaxed mb-4 line-clamp-2">
                  {group.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-graphite">
                  <div className="text-sm">
                    <span className="text-smoke">Price:</span>{" "}
                    <span className="text-mint font-mono">${group.tokenPrice.toFixed(4)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-smoke">Treasury:</span>{" "}
                    <span className="text-gold font-mono">${group.treasuryBalance.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-32 border-t border-graphite">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              How It Works
            </h2>
            <p className="text-smoke text-lg max-w-2xl mx-auto">
              From idea to action in four steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Create a Group",
                description: "Start public or private. A token automatically deploys when you create.",
                color: "ember",
              },
              {
                icon: MessageSquare,
                title: "Build Together",
                description: "End-to-end encrypted chat. Shape your identity, norms, and charter.",
                color: "mint",
              },
              {
                icon: TrendingUp,
                title: "Grow & Trade",
                description: "Believers buy in. Bonding curve ensures instant liquidity. Treasury grows.",
                color: "gold",
              },
              {
                icon: Vote,
                title: "Govern & Act",
                description: "Vote on proposals. Deploy treasury. Fund research, events, campaigns.",
                color: "ember",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-8 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-${step.color}/10 flex items-center justify-center mb-6`}>
                    <step.icon className={`w-7 h-7 text-${step.color}`} />
                  </div>
                  <div className="text-smoke text-sm font-mono mb-2">0{i + 1}</div>
                  <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-smoke leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 border-t border-graphite">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Built for <span className="gradient-text">Real</span> Communities
            </h2>
            <p className="text-smoke text-lg max-w-2xl mx-auto">
              The tools you need to go from group chat to global movement
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "End-to-End Encryption",
                description: "Your conversations stay private. Built on Signal protocol. Only members can read messages.",
              },
              {
                icon: Coins,
                title: "Automatic Token Launch",
                description: "Every group gets a token. No setup required. Bonding curve provides instant liquidity.",
              },
              {
                icon: Shield,
                title: "On-Chain Governance",
                description: "Proposals and votes live on-chain. Transparent, immutable, and resistant to capture.",
              },
              {
                icon: Zap,
                title: "Instant Settlement",
                description: "Buy and sell tokens instantly. No order books. No waiting for counterparties.",
              },
              {
                icon: Globe,
                title: "Public Charters",
                description: "Publish your mission to the world. Let outsiders understand what you're building.",
              },
              {
                icon: TrendingUp,
                title: "Growing Treasury",
                description: "2% of every trade flows to the treasury. The community decides how to spend it.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-8 hover:bg-graphite/30 transition-all group"
              >
                <feature.icon className="w-8 h-8 text-ember mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-smoke leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 border-t border-graphite">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              The Web Was Meant for Collaboration
            </h2>
            <p className="text-smoke text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
              This restores that promise. Give your community the tools to form, 
              fund its ideas, and build real influence—starting from the most fundamental 
              social primitive we have online: the group chat.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-ember to-flame rounded-xl font-semibold text-xl hover:scale-105 transition-transform animate-glow"
            >
              Create Your Community
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-graphite py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ember to-gold flex items-center justify-center">
              <Coins className="w-4 h-4 text-midnight" />
            </div>
            <span className="font-display text-lg">CommunityCoin</span>
          </div>
          <p className="text-smoke text-sm">
            Building infrastructure for collective action.
          </p>
        </div>
      </footer>
    </div>
  );
}
