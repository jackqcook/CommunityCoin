"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { 
  Coins, 
  ArrowRight
} from "lucide-react";

export default function LandingPage() {
  const { groups } = useStore();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-white" />
      <div className="fixed inset-0 noise" />
      
      {/* Animated orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-ember/10 rounded-full blur-[128px] animate-pulse-slow" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-gold/5 rounded-full blur-[128px] animate-pulse-slow" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember to-flame flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-semibold text-pearl">CommunityCoin</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/explore" className="text-smoke hover:text-pearl transition-colors">
            Explore
          </Link>
          <Link 
            href="/create" 
            className="px-5 py-2.5 bg-gradient-to-r from-ember to-flame rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
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
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-8 text-pearl">
            Mobilize Your
            <br />Movement
          </h1>
          
          <p className="text-xl md:text-2xl text-smoke leading-relaxed mb-12 max-w-2xl mx-auto">
            Give your community the tools to coordinate, fund projects, and build real-world influence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/create"
              className="group px-8 py-4 bg-gradient-to-r from-ember to-flame rounded-xl font-semibold text-lg flex items-center gap-3 hover:scale-105 transition-transform text-white"
            >
              Start a Community
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/explore"
              className="px-8 py-4 glass rounded-xl font-semibold text-lg hover:bg-graphite transition-colors text-pearl"
            >
              Explore Groups
            </Link>
          </div>
        </motion.div>

        {/* Live communities preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 relative"
        >
          <p className="text-center text-smoke mb-6 text-sm uppercase tracking-wider font-medium">Live Communities — Click to Explore</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groups.slice(0, 3).map((group, i) => (
              <Link href={`/group/${group.id}`} key={group.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold mb-1 text-pearl">{group.name}</h3>
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
                      <span className="text-mint font-mono">${group.tokenPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-smoke">Treasury:</span>{" "}
                      <span className="text-gold font-mono">${group.treasuryBalance.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 border-t border-graphite py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ember to-flame flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg text-pearl">CommunityCoin</span>
          </div>
          <p className="text-smoke text-sm">
            Building infrastructure for collective action.
          </p>
        </div>
      </footer>
    </div>
  );
}
