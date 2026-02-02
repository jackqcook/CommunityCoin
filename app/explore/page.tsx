"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  Coins,
  Search,
  Globe,
  Lock,
  TrendingUp,
  Users,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export default function ExplorePage() {
  const { groups } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "public" && group.isPublic) ||
      (filter === "private" && !group.isPublic);
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-midnight via-obsidian to-slate" />
      <div className="fixed inset-0 noise" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ember to-gold flex items-center justify-center">
            <Coins className="w-5 h-5 text-midnight" />
          </div>
          <span className="font-display text-2xl font-semibold">CommunityCoin</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/explore" className="text-pearl font-medium">
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

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Explore Communities
          </h1>
          <p className="text-smoke text-lg max-w-2xl mx-auto">
            Discover movements building the future. Join groups, buy tokens, and help shape what comes next.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-smoke" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search communities..."
              className="w-full pl-12 pr-4 py-3 bg-graphite/50 border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-smoke" />
            {["all", "public", "private"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as "all" | "public" | "private")}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === f
                    ? "bg-graphite text-pearl"
                    : "text-smoke hover:text-pearl"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Total Groups", value: groups.length },
            { label: "Total Members", value: groups.reduce((acc, g) => acc + g.memberCount, 0).toLocaleString() },
            { label: "Total Treasury", value: `$${groups.reduce((acc, g) => acc + g.treasuryBalance, 0).toLocaleString()}` },
            { label: "24h Volume", value: "$48,230" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-4 text-center">
              <div className="text-smoke text-sm mb-1">{stat.label}</div>
              <div className="font-mono text-xl">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/group/${group.id}`}>
                <div className="glass rounded-2xl p-6 hover:bg-graphite/30 transition-all cursor-pointer group h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-xl font-semibold truncate">
                          {group.name}
                        </h3>
                        {group.isPublic ? (
                          <Globe className="w-4 h-4 text-smoke flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-smoke flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-smoke text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {group.memberCount.toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(group.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-mint/10 text-mint text-sm font-mono flex-shrink-0">
                      ${group.tokenSymbol}
                    </div>
                  </div>

                  <p className="text-smoke text-sm leading-relaxed mb-4 line-clamp-2">
                    {group.description}
                  </p>

                  <div className="pt-4 border-t border-graphite">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-smoke mb-1">Price</div>
                        <div className="font-mono text-mint flex items-center gap-1">
                          ${formatPrice(group.tokenPrice)}
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                      </div>
                      <div>
                        <div className="text-smoke mb-1">MCap</div>
                        <div className="font-mono">
                          ${Math.round(group.tokenSupply * group.tokenPrice / 1000)}K
                        </div>
                      </div>
                      <div>
                        <div className="text-smoke mb-1">Treasury</div>
                        <div className="font-mono text-gold">
                          ${Math.round(group.treasuryBalance / 1000)}K
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mt-4 h-12 opacity-50 group-hover:opacity-100 transition-opacity">
                    <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
                      <path
                        d={`M ${group.priceHistory.slice(-20).map((p, i) => {
                          const x = (i / 19) * 200;
                          const prices = group.priceHistory.slice(-20).map((h) => h.price);
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          const range = maxPrice - minPrice || 1;
                          const y = 50 - ((p.price - minPrice) / range) * 45 - 2.5;
                          return `${i === 0 ? "" : "L "}${x} ${y}`;
                        }).join(" ")}`}
                        fill="none"
                        stroke="#ff6b35"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-graphite flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-smoke" />
            </div>
            <h3 className="font-display text-xl mb-2">No communities found</h3>
            <p className="text-smoke mb-6">Try adjusting your search or filters</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ember rounded-xl font-medium hover:bg-ember/90 transition-colors"
            >
              Create Your Own
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
