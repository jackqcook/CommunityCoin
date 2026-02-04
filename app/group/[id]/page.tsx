"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  Coins,
  MessageSquare,
  TrendingUp,
  Vote,
  Settings,
  Hash,
  Send,
  Users,
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Check,
  X,
  Wallet,
  FileText,
  Shield,
  Globe,
  Lock,
  GitCommit,
  Calendar,
  Eye,
  UserPlus,
  ArrowLeft,
  Target,
} from "lucide-react";

type Tab = "chat" | "token" | "treasure" | "directory" | "governance" | "public" | "library";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

function AssetPreview({ objectUrl, mimeType, fileName, textContent }: { objectUrl?: string; mimeType: string; fileName: string; textContent?: string }) {
  const safeMime = mimeType || "application/octet-stream";
  const isImage = safeMime.startsWith("image/");
  const isVideo = safeMime.startsWith("video/");
  const isAudio = safeMime.startsWith("audio/");
  const isPdf = safeMime === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
  const isText = typeof textContent === "string" && textContent.length > 0;

  if (isText) {
    return (
      <pre className="whitespace-pre-wrap text-sm text-pearl bg-slate rounded-xl p-4 overflow-auto max-h-80">
        {textContent}
      </pre>
    );
  }

  if (!objectUrl) {
    return (
      <div className="p-6 bg-slate rounded-xl text-smoke">
        Preview unavailable in this MVP (file data isn’t persisted yet).
      </div>
    );
  }

  if (isImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={objectUrl} alt={fileName} className="w-full max-h-96 object-contain bg-slate rounded-xl" />;
  }
  if (isVideo) {
    return (
      <video src={objectUrl} controls className="w-full max-h-96 bg-slate rounded-xl" />
    );
  }
  if (isAudio) {
    return (
      <audio src={objectUrl} controls className="w-full bg-slate rounded-xl p-4" />
    );
  }
  if (isPdf) {
    return (
      <iframe src={objectUrl} className="w-full h-96 bg-slate rounded-xl" title={fileName} />
    );
  }

  return (
    <div className="p-6 bg-slate rounded-xl">
      <div className="text-pearl font-medium mb-2">{fileName}</div>
      <a href={objectUrl} download className="text-mint hover:underline text-sm">
        Download to view
      </a>
    </div>
  );
}

// GitHub-like progress view for non-members
function PublicProgressView({ group, onJoin, isMember }: { 
  group: NonNullable<ReturnType<typeof useStore>["currentGroup"]>;
  onJoin: () => void;
  isMember: boolean;
}) {
  const { buyTokens, getHoldings } = useStore();
  const [tradeAmount, setTradeAmount] = useState("");

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const holdings = getHoldings(group.id);
  const publicUpdates = useMemo(() => group.updates.filter((u) => u.isPublic), [group.updates]);
  const topPriorities = useMemo(() => {
    const sorted = [...group.tickets].sort((a, b) => b.votes - a.votes);
    return sorted.slice(0, 5);
  }, [group.tickets]);

  const publicCollections = useMemo(() => group.libraryCollections.filter((c) => c.isPublic), [group.libraryCollections]);
  const publicAssetsCount = useMemo(() => {
    if (publicCollections.length === 0) return 0;
    const ids = new Set(publicCollections.map((c) => c.id));
    return group.libraryAssets.filter((a) => ids.has(a.collectionId)).length;
  }, [group.libraryAssets, publicCollections]);

  const handleTrade = () => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) return;
    buyTokens(group.id, amount);
    setTradeAmount("");
  };

  const activityFeed = useMemo(() => {
    return [
      ...group.proposals.map((p) => ({
        type: "proposal" as const,
        title: p.title,
        description: p.status === "active" ? "New proposal created" : `Proposal ${p.status}`,
        time: p.endDate,
        status: p.status,
        icon: Vote,
      })),
      {
        type: "treasury" as const,
        title: "Treasure reached $" + group.treasuryBalance.toLocaleString(),
        description: "Accumulated cash from trading fees",
        time: new Date(Date.now() - 86400000 * 2),
        icon: Wallet,
      },
      {
        type: "milestone" as const,
        title: `${group.memberCount.toLocaleString()} members reached`,
        description: "Community growing",
        time: new Date(Date.now() - 86400000 * 5),
        icon: Users,
      },
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [group.proposals, group.treasuryBalance, group.memberCount]);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 bg-white" />
      <div className="fixed inset-0 noise" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <Link href="/explore" className="flex items-center gap-2 text-smoke hover:text-pearl transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ember to-flame flex items-center justify-center">
            <Coins className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg text-pearl">CommunityCoin</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-8 pb-20">
        {/* Header Section */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="font-display text-3xl font-bold text-pearl">{group.name}</h1>
                {group.isPublic ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-mint/10 text-mint text-sm">
                    <Globe className="w-3 h-3" />
                    Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm">
                    <Lock className="w-3 h-3" />
                    Invite Only
                  </span>
                )}
              </div>
              <p className="text-smoke text-lg leading-relaxed mb-4">{group.description}</p>
              <div className="flex items-center gap-6 text-sm text-smoke">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {group.memberCount.toLocaleString()} members
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(group.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Viewing as guest
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {group.isPublic ? (
                <button
                  onClick={onJoin}
                  className="px-6 py-3 bg-gradient-to-r from-ember to-flame rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity text-white"
                >
                  <UserPlus className="w-5 h-5" />
                  Join Community
                </button>
              ) : (
                <div className="px-6 py-3 bg-slate rounded-xl text-smoke text-center">
                  <Lock className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Invite Only</span>
                </div>
              )}
              <Link
                href={`/group/${group.id}/charter`}
                className="px-6 py-3 glass rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate transition-colors text-pearl"
              >
                <FileText className="w-4 h-4" />
                View Charter
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 pt-6 border-t border-graphite">
            <div>
              <div className="text-smoke text-sm mb-1">Token</div>
              <div className="font-mono text-mint text-lg">${group.tokenSymbol}</div>
            </div>
            <div>
              <div className="text-smoke text-sm mb-1">Price</div>
              <div className="font-mono text-lg flex items-center gap-1 text-pearl">
                ${formatPrice(group.tokenPrice)}
                <ArrowUpRight className="w-4 h-4 text-mint" />
              </div>
            </div>
            <div>
              <div className="text-smoke text-sm mb-1">Market Cap</div>
              <div className="font-mono text-lg text-pearl">${Math.round(group.tokenSupply * group.tokenPrice).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-smoke text-sm mb-1">Treasure</div>
              <div className="font-mono text-gold text-lg">${group.treasuryBalance.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Charter / README Section */}
          <div className="col-span-2 space-y-6">
            {/* Top Priorities */}
            {topPriorities.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-mint" />
                  <h2 className="font-display text-xl font-semibold text-pearl">Top Priorities</h2>
                </div>
                <div className="space-y-3">
                  {topPriorities.map((t) => (
                    <div key={t.id} className="p-4 bg-slate rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium text-pearl truncate">{t.title}</div>
                          <div className="text-smoke text-sm mt-1 line-clamp-2">{t.description}</div>
                          <div className="text-xs text-smoke mt-3">
                            {t.status.replace("_", " ")} • priority {t.priority.toUpperCase()} • {t.votes.toLocaleString()} votes
                            {typeof t.requestedBudgetUsd === "number" ? ` • $${t.requestedBudgetUsd.toLocaleString()} requested` : ""}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {t.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded bg-white text-smoke text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Works In Progress (Public Updates) */}
            {publicUpdates.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <GitCommit className="w-5 h-5 text-ember" />
                  <h2 className="font-display text-xl font-semibold text-pearl">Works in Progress</h2>
                </div>
                <div className="space-y-4">
                  {publicUpdates.slice(0, 6).map((u) => (
                      <div key={u.id} className="p-4 bg-slate rounded-xl">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-medium text-pearl truncate">{u.title}</div>
                            <div className="text-smoke text-sm mt-1 line-clamp-3">{u.content}</div>
                            <div className="text-xs text-smoke mt-3">
                              {u.authorName} •{" "}
                              {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end">
                            {u.tags.slice(0, 3).map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded bg-white text-smoke text-xs">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Charter Preview */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-ember" />
                <h2 className="font-display text-xl font-semibold text-pearl">Charter</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-smoke leading-relaxed">{group.charter}</p>
              </div>
            </div>

            {/* Activity Feed / Progress */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <GitCommit className="w-5 h-5 text-ember" />
                <h2 className="font-display text-xl font-semibold text-pearl">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {activityFeed.map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 relative"
                  >
                    {/* Timeline line */}
                    {i < activityFeed.length - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-full bg-graphite" />
                    )}
                    
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === "proposal" 
                        ? activity.status === "passed" ? "bg-mint/10" : activity.status === "active" ? "bg-ember/10" : "bg-slate"
                        : activity.type === "treasury" ? "bg-gold/10" : "bg-mint/10"
                    }`}>
                      <activity.icon className={`w-5 h-5 ${
                        activity.type === "proposal"
                          ? activity.status === "passed" ? "text-mint" : activity.status === "active" ? "text-ember" : "text-smoke"
                          : activity.type === "treasury" ? "text-gold" : "text-mint"
                      }`} />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-pearl">{activity.title}</h3>
                        <span className="text-smoke text-sm">
                          {new Date(activity.time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-smoke text-sm">{activity.description}</p>
                      {activity.type === "proposal" && activity.status && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                          activity.status === "passed" ? "bg-mint/10 text-mint" :
                          activity.status === "active" ? "bg-ember/10 text-ember" :
                          "bg-slate text-smoke"
                        }`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Public Library Preview */}
            {publicCollections.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ember" />
                    <h2 className="font-display text-xl font-semibold text-pearl">Library</h2>
                  </div>
                  <span className="text-sm text-smoke">
                    {publicCollections.length} collections • {publicAssetsCount} assets
                  </span>
                </div>
                <div className="space-y-3">
                  {publicCollections.slice(0, 3).map((c) => (
                    <div key={c.id} className="p-4 bg-slate rounded-xl">
                      <div className="font-medium text-pearl">{c.name}</div>
                      <div className="text-smoke text-sm mt-1">{c.description}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-graphite text-sm text-smoke">
                  Join to upload files, version them, and collaborate.
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Directory Preview */}
            {group.members.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-pearl">Directory</h3>
                  <span className="text-sm text-smoke">{group.members.length} listed</span>
                </div>
                <div className="space-y-3">
                  {group.members.slice(0, 8).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate flex items-center justify-center">
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-pearl">{member.name}</div>
                        <div className="text-smoke text-xs">{member.role}</div>
                      </div>
                      <span className="font-mono text-xs text-smoke">{member.tokensHeld.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                {group.isPublic && (
                  <div className="mt-4 pt-4 border-t border-graphite text-sm text-smoke">
                    Join to see the full directory, roles, and participation stats.
                  </div>
                )}
              </div>
            )}

            {/* Trade Panel (available without joining) */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold mb-4 text-pearl">Buy ${group.tokenSymbol}</h3>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors font-mono text-xl text-pearl placeholder:text-smoke/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke">
                    ${group.tokenSymbol}
                  </span>
                </div>

                {tradeAmount && (
                  <div className="p-4 bg-slate rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-smoke">Price per token</span>
                      <span className="font-mono text-pearl">${formatPrice(group.tokenPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-smoke">Total cost</span>
                      <span className="font-mono text-pearl">
                        ${(parseFloat(tradeAmount || "0") * group.tokenPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-smoke">Treasure fee (2%)</span>
                      <span className="font-mono text-gold">
                        ${(parseFloat(tradeAmount || "0") * group.tokenPrice * 0.02).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleTrade}
                  disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                  className="w-full py-3 rounded-xl font-semibold disabled:opacity-30 transition-colors bg-mint text-white hover:bg-mint/90"
                >
                  Buy ${group.tokenSymbol}
                </button>

                <div className="pt-4 border-t border-graphite">
                  <div className="text-sm text-smoke mb-1">Your holdings</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg text-pearl">{holdings.toLocaleString()}</span>
                    <span className="text-smoke">${group.tokenSymbol}</span>
                  </div>
                  <div className="text-smoke text-sm mt-1">
                    ≈ ${(holdings * group.tokenPrice).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Token Chart Mini */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-pearl">Token Performance</h3>
                <span className="text-mint text-sm flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +12.4%
                </span>
              </div>
              <div className="h-32">
                <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="miniChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(220, 20, 60, 0.2)" />
                      <stop offset="100%" stopColor="rgba(220, 20, 60, 0)" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M 0 80 ${group.priceHistory.slice(-20).map((p, i) => {
                      const x = (i / 19) * 200;
                      const prices = group.priceHistory.slice(-20).map(h => h.price);
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      const range = maxPrice - minPrice || 1;
                      const y = 80 - ((p.price - minPrice) / range) * 70 - 5;
                      return `L ${x} ${y}`;
                    }).join(" ")} L 200 80 Z`}
                    fill="url(#miniChartGradient)"
                  />
                  <path
                    d={`M ${group.priceHistory.slice(-20).map((p, i) => {
                      const x = (i / 19) * 200;
                      const prices = group.priceHistory.slice(-20).map(h => h.price);
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      const range = maxPrice - minPrice || 1;
                      const y = 80 - ((p.price - minPrice) / range) * 70 - 5;
                      return `${i === 0 ? "" : "L "}${x} ${y}`;
                    }).join(" ")}`}
                    fill="none"
                    stroke="#dc143c"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>

            {/* Active Proposals */}
            {group.proposals.filter(p => p.status === "active").length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4 text-pearl">Active Proposals</h3>
                <div className="space-y-3">
                  {group.proposals.filter(p => p.status === "active").map((proposal) => {
                    const totalVotes = proposal.votesFor + proposal.votesAgainst;
                    const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                    return (
                      <div key={proposal.id} className="p-3 bg-slate rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded bg-ember/10 text-ember text-xs uppercase">
                            {proposal.category}
                          </span>
                        </div>
                        <h4 className="font-medium text-sm mb-2 text-pearl">{proposal.title}</h4>
                        <div className="h-1.5 bg-graphite rounded-full overflow-hidden">
                          <div
                            className="h-full bg-mint rounded-full"
                            style={{ width: `${forPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-smoke mt-1">
                          <span>{proposal.votesFor.toLocaleString()} for</span>
                          <span>{proposal.votesAgainst.toLocaleString()} against</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Contributors */}
            {group.members.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold mb-4 text-pearl">Top Contributors</h3>
                <div className="space-y-3">
                  {group.members.slice(0, 5).map((member, i) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate flex items-center justify-center">
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-pearl">{member.name}</div>
                        <div className="text-smoke text-xs">{member.tokensHeld.toLocaleString()} ${group.tokenSymbol}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        member.role === "founder" ? "bg-gold/10 text-gold" :
                        member.role === "elder" ? "bg-mint/10 text-mint" :
                        "bg-slate text-smoke"
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Join CTA for public groups */}
            {group.isPublic && (
              <div className="glass rounded-2xl p-6 text-center">
                <h3 className="font-display font-semibold mb-2 text-pearl">Ready to participate?</h3>
                <p className="text-smoke text-sm mb-4">Join to chat, create proposals, and vote.</p>
                <button
                  onClick={onJoin}
                  className="w-full py-3 bg-gradient-to-r from-ember to-flame rounded-xl font-semibold hover:opacity-90 transition-opacity text-white"
                >
                  Join Community
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Member dashboard view (existing functionality)
function MemberDashboard({ group }: { group: NonNullable<ReturnType<typeof useStore>["currentGroup"]> }) {
  const { 
    currentChannel, 
    currentUser,
    setCurrentChannel, 
    addMessage,
    buyTokens,
    addGroupUpdate,
    createTicket,
    moveTicket,
    voteTicket,
    createLibraryCollection,
    addFilesToLibraryCollection,
    addLibraryAssetVersion,
    vote,
    getHoldings,
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messageInput, setMessageInput] = useState("");
  const [tradeAmount, setTradeAmount] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalBody, setProposalBody] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [updateTags, setUpdateTags] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketBody, setTicketBody] = useState("");
  const [ticketTags, setTicketTags] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"p0" | "p1" | "p2" | "p3">("p2");
  const [ticketBudget, setTicketBudget] = useState("");

  const [collectionName, setCollectionName] = useState("");
  const [collectionDesc, setCollectionDesc] = useState("");
  const [collectionIsPublic, setCollectionIsPublic] = useState(true);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(group.libraryCollections[0]?.id ?? null);
  const [assetQuery, setAssetQuery] = useState("");
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [versionNotes, setVersionNotes] = useState("");

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentUser) return;
    
    addMessage(group.id, {
      userId: currentUser.id,
      userName: currentUser.name,
      content: messageInput,
      channel: currentChannel,
    });
    setMessageInput("");
  };

  const handleTrade = () => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) return;

    buyTokens(group.id, amount);
    setTradeAmount("");
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const holdings = getHoldings(group.id);
  const channelMessages = useMemo(() => {
    // Keep chat extremely efficient for large histories: render only the most recent slice.
    const all = group.messages.filter((m) => m.channel === currentChannel);
    const MAX = 200;
    return all.length > MAX ? all.slice(all.length - MAX) : all;
  }, [group.messages, currentChannel]);

  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return group.members;
    return group.members.filter((m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
  }, [group.members, memberQuery]);

  const handleCreateTicket = () => {
    if (!ticketTitle.trim() || !ticketBody.trim()) return;
    const tags = ticketTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
    const requestedBudgetUsd = ticketBudget.trim() ? Number(ticketBudget) : undefined;
    createTicket(group.id, {
      title: ticketTitle.trim(),
      description: ticketBody.trim(),
      tags,
      status: "backlog",
      priority: ticketPriority,
      requestedBudgetUsd: typeof requestedBudgetUsd === "number" && !Number.isNaN(requestedBudgetUsd) ? requestedBudgetUsd : undefined,
    });
    setTicketTitle("");
    setTicketBody("");
    setTicketTags("");
    setTicketBudget("");
    setTicketPriority("p2");
  };

  const handlePostUpdate = () => {
    if (!updateTitle.trim() || !updateBody.trim()) return;
    const tags = updateTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
    addGroupUpdate(group.id, {
      title: updateTitle.trim(),
      content: updateBody.trim(),
      tags,
      isPublic: true,
    });
    setUpdateTitle("");
    setUpdateBody("");
    setUpdateTags("");
  };

  const ticketsByStatus = useMemo(() => {
    const by = {
      backlog: [] as typeof group.tickets,
      in_progress: [] as typeof group.tickets,
      done: [] as typeof group.tickets,
    };
    for (const t of group.tickets) by[t.status].push(t);
    for (const key of Object.keys(by) as Array<keyof typeof by>) {
      by[key].sort((a, b) => b.votes - a.votes);
    }
    return by;
  }, [group.tickets]);

  const selectedCollection = useMemo(() => {
    return group.libraryCollections.find((c) => c.id === selectedCollectionId) ?? null;
  }, [group.libraryCollections, selectedCollectionId]);

  const assetsForSelectedCollection = useMemo(() => {
    if (!selectedCollectionId) return [];
    const q = assetQuery.trim().toLowerCase();
    const assets = group.libraryAssets.filter((a) => a.collectionId === selectedCollectionId);
    if (!q) return assets;
    return assets.filter((a) => a.title.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q)));
  }, [group.libraryAssets, selectedCollectionId, assetQuery]);

  const activeAsset = useMemo(() => {
    return group.libraryAssets.find((a) => a.id === activeAssetId) ?? null;
  }, [group.libraryAssets, activeAssetId]);

  const activeVersions = activeAsset?.versions ?? [];
  const versionA = useMemo(() => activeVersions.find((v) => v.id === compareA) ?? null, [activeVersions, compareA]);
  const versionB = useMemo(() => activeVersions.find((v) => v.id === compareB) ?? null, [activeVersions, compareB]);

  const handleCreateCollection = () => {
    if (!collectionName.trim()) return;
    createLibraryCollection(group.id, {
      name: collectionName.trim(),
      description: collectionDesc.trim(),
      isPublic: collectionIsPublic,
    });
    setCollectionName("");
    setCollectionDesc("");
    setCollectionIsPublic(true);
  };

  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!selectedCollectionId) return;
    await addFilesToLibraryCollection(group.id, selectedCollectionId, Array.from(files));
  };

  const handleAddVersion = async (file: File | null) => {
    if (!file || !activeAsset) return;
    await addLibraryAssetVersion(group.id, activeAsset.id, file, { notes: versionNotes.trim() || undefined });
    setVersionNotes("");
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate border-r border-graphite flex flex-col">
        {/* Group Header */}
        <div className="p-4 border-b border-graphite">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ember to-flame flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg text-pearl">CommunityCoin</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg font-semibold truncate text-pearl">{group.name}</h1>
              <div className="flex items-center gap-2 text-smoke text-sm">
                {group.isPublic ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                <span>{group.memberCount.toLocaleString()} members</span>
              </div>
            </div>
            <button className="p-2 rounded-lg hover:bg-graphite transition-colors">
              <Settings className="w-4 h-4 text-smoke" />
            </button>
          </div>
        </div>

        {/* Token Quick Stats */}
        <div className="p-4 border-b border-graphite">
          <div className="flex items-center justify-between mb-2">
            <span className="text-smoke text-sm">Token</span>
            <span className="font-mono text-mint text-sm">${group.tokenSymbol}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-smoke text-sm">Price</span>
            <span className="font-mono text-sm text-pearl">${formatPrice(group.tokenPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-smoke text-sm">Treasure</span>
            <span className="font-mono text-gold text-sm">${group.treasuryBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-smoke text-xs uppercase tracking-wider">Channels</span>
            <button className="p-1 rounded hover:bg-graphite transition-colors">
              <Plus className="w-3 h-3 text-smoke" />
            </button>
          </div>
          <div className="space-y-1">
            {group.channels.map((channel) => (
              <button
                key={channel}
                onClick={() => {
                  setCurrentChannel(channel);
                  setActiveTab("chat");
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentChannel === channel
                    ? "bg-white text-pearl shadow-sm"
                    : "text-smoke hover:bg-white/50 hover:text-pearl"
                }`}
              >
                <Hash className="w-4 h-4" />
                <span>{channel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-graphite">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg">
              {currentUser?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-pearl">{currentUser?.name}</div>
              <div className="text-smoke text-sm">{holdings.toLocaleString()} ${group.tokenSymbol}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Tab Navigation */}
        <header className="h-14 border-b border-graphite flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-1">
            {[
              { id: "chat", icon: MessageSquare, label: "Chat" },
              { id: "token", icon: TrendingUp, label: "Token" },
              { id: "treasure", icon: Wallet, label: "Treasure" },
              { id: "directory", icon: Users, label: "Directory" },
              { id: "governance", icon: Target, label: "Mobilize" },
              { id: "library", icon: FileText, label: "Library" },
              { id: "public", icon: Globe, label: "Public" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate text-pearl"
                    : "text-smoke hover:text-pearl"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <Link
            href={`/group/${group.id}/charter`}
            className="flex items-center gap-2 px-4 py-2 text-smoke hover:text-pearl transition-colors"
          >
            <FileText className="w-4 h-4" />
            Charter
          </Link>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Chat Tab */}
            {activeTab === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {group.messages.filter((m) => m.channel === currentChannel).length > channelMessages.length && (
                    <div className="text-center text-sm text-smoke">
                      Showing last {channelMessages.length} messages in #{currentChannel}
                    </div>
                  )}
                  {channelMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Hash className="w-12 h-12 text-graphite mx-auto mb-4" />
                        <h3 className="font-display text-xl mb-2 text-pearl">Welcome to #{currentChannel}</h3>
                        <p className="text-smoke">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    channelMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate flex items-center justify-center flex-shrink-0">
                          {group.members.find(m => m.id === message.userId)?.avatar || "👤"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-pearl">{message.userName}</span>
                            <span className="text-smoke text-xs">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-smoke leading-relaxed">{message.content}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-graphite">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={`Message #${currentChannel}`}
                      className="flex-1 px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="p-3 bg-ember rounded-xl disabled:opacity-30 hover:bg-ember/90 transition-colors text-white"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Token Tab */}
            {activeTab === "token" && (
              <motion.div
                key="token"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Price Chart */}
                  <div className="lg:col-span-2 glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-2xl text-pearl">${group.tokenSymbol}</span>
                          <span className="px-2 py-0.5 rounded bg-mint/10 text-mint text-xs">Live</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-3xl text-pearl">${formatPrice(group.tokenPrice)}</span>
                          <span className="flex items-center gap-1 text-mint text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            +12.4%
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {["1D", "1W", "1M", "ALL"].map((period) => (
                          <button
                            key={period}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              period === "1M" ? "bg-slate text-pearl" : "text-smoke hover:text-pearl"
                            }`}
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simple SVG Chart */}
                    <div className="h-64 relative">
                      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(220, 20, 60, 0.2)" />
                            <stop offset="100%" stopColor="rgba(220, 20, 60, 0)" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path
                          d={`M 0 200 ${group.priceHistory.map((p, i) => {
                            const x = (i / (group.priceHistory.length - 1)) * 400;
                            const minPrice = Math.min(...group.priceHistory.map(h => h.price));
                            const maxPrice = Math.max(...group.priceHistory.map(h => h.price));
                            const y = 200 - ((p.price - minPrice) / (maxPrice - minPrice)) * 180 - 10;
                            return `L ${x} ${y}`;
                          }).join(" ")} L 400 200 Z`}
                          fill="url(#chartGradient)"
                        />
                        {/* Line */}
                        <path
                          d={`M ${group.priceHistory.map((p, i) => {
                            const x = (i / (group.priceHistory.length - 1)) * 400;
                            const minPrice = Math.min(...group.priceHistory.map(h => h.price));
                            const maxPrice = Math.max(...group.priceHistory.map(h => h.price));
                            const y = 200 - ((p.price - minPrice) / (maxPrice - minPrice)) * 180 - 10;
                            return `${i === 0 ? "" : "L "}${x} ${y}`;
                          }).join(" ")}`}
                          fill="none"
                          stroke="#dc143c"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Trade Panel */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-pearl">Buy</h3>
                      <span className="text-smoke text-sm">Instant via bonding curve</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-smoke mb-2">Amount</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors font-mono text-xl text-pearl placeholder:text-smoke/50"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke">
                            ${group.tokenSymbol}
                          </span>
                        </div>
                      </div>

                      {tradeAmount && (
                        <div className="p-4 bg-slate rounded-xl space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-smoke">Price per token</span>
                            <span className="font-mono text-pearl">${formatPrice(group.tokenPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-smoke">Total cost</span>
                            <span className="font-mono text-pearl">
                              ${(parseFloat(tradeAmount || "0") * group.tokenPrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                          <span className="text-smoke">Treasure fee (2%)</span>
                            <span className="font-mono text-gold">
                              ${(parseFloat(tradeAmount || "0") * group.tokenPrice * 0.02).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleTrade}
                        disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                        className="w-full py-4 rounded-xl font-semibold disabled:opacity-30 transition-colors bg-mint text-white hover:bg-mint/90"
                      >
                        Buy ${group.tokenSymbol}
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-graphite">
                      <h3 className="text-sm text-smoke mb-3">Your Holdings</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg text-pearl">{holdings.toLocaleString()}</span>
                        <span className="text-smoke">${group.tokenSymbol}</span>
                      </div>
                      <div className="text-smoke text-sm mt-1">
                        ≈ ${(holdings * group.tokenPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Token Stats */}
                  <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Market Cap", value: `$${(group.tokenSupply * group.tokenPrice).toLocaleString()}` },
                      { label: "Total Supply", value: group.tokenSupply.toLocaleString() },
                      { label: "Holders", value: group.memberCount.toLocaleString() },
                      { label: "24h Volume", value: "$12,450" },
                    ].map((stat) => (
                      <div key={stat.label} className="glass rounded-xl p-4">
                        <div className="text-smoke text-sm mb-1">{stat.label}</div>
                        <div className="font-mono text-lg text-pearl">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Treasure Tab (cash only) */}
            {activeTab === "treasure" && (
              <motion.div
                key="treasure"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Treasure Balance (accumulated cash) */}
                  <div className="glass rounded-2xl p-8 text-center">
                    <div className="text-smoke mb-2">Community Treasure</div>
                    <div className="font-mono text-5xl text-gold mb-4">
                      ${group.treasuryBalance.toLocaleString()}
                    </div>
                    <div className="text-smoke">
                      Accumulated cash from 2% fees on ${group.tokenSymbol} trades
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Directory Tab */}
            {activeTab === "directory" && (
              <motion.div
                key="directory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-display text-xl font-semibold text-pearl">Member Directory</div>
                        <div className="text-smoke text-sm">{group.members.length} members</div>
                      </div>
                      <div className="w-72 max-w-full">
                        <input
                          value={memberQuery}
                          onChange={(e) => setMemberQuery(e.target.value)}
                          placeholder="Search members…"
                          className="w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-2">
                    <div className="divide-y divide-graphite">
                      {filteredMembers.map((m) => (
                        <div key={m.id} className="flex items-center gap-4 p-4">
                          <div className="w-10 h-10 rounded-full bg-slate flex items-center justify-center text-lg flex-shrink-0">
                            {m.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-pearl truncate">{m.name}</div>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                m.role === "founder" ? "bg-gold/10 text-gold" :
                                m.role === "elder" ? "bg-mint/10 text-mint" :
                                "bg-slate text-smoke"
                              }`}>
                                {m.role}
                              </span>
                            </div>
                            <div className="text-smoke text-sm">
                              Joined {new Date(m.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-pearl">{m.tokensHeld.toLocaleString()}</div>
                            <div className="text-xs text-smoke">${group.tokenSymbol}</div>
                          </div>
                        </div>
                      ))}
                      {filteredMembers.length === 0 && (
                        <div className="p-8 text-center text-smoke">No matches.</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Governance Tab */}
            {activeTab === "governance" && (
              <motion.div
                key="governance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Mobilization header */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-5 h-5 text-mint" />
                          <h3 className="font-display text-xl font-semibold text-pearl">Mobilization</h3>
                        </div>
                        <div className="text-smoke text-sm">
                          Prioritize tasks like Jira tickets. Upvote with your token-weighted voting power.
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-smoke text-sm">Your voting power</div>
                        <div className="font-mono text-xl text-pearl">{holdings.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Create ticket */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-xl font-semibold text-pearl">Create a Ticket</h3>
                      <span className="text-sm text-smoke">Backlog by default</span>
                    </div>
                    <div className="space-y-3">
                      <input
                        value={ticketTitle}
                        onChange={(e) => setTicketTitle(e.target.value)}
                        placeholder="Ticket title (e.g., ‘Ship onboarding docs’)"
                        className="w-full px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                      />
                      <textarea
                        value={ticketBody}
                        onChange={(e) => setTicketBody(e.target.value)}
                        placeholder="Describe the work, acceptance criteria, and any dependencies…"
                        className="w-full min-h-28 px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          value={ticketTags}
                          onChange={(e) => setTicketTags(e.target.value)}
                          placeholder="Tags (comma): docs, bounty"
                          className="w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                        />
                        <select
                          value={ticketPriority}
                          onChange={(e) => setTicketPriority(e.target.value as any)}
                          className="w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl"
                        >
                          <option value="p0">P0 (urgent)</option>
                          <option value="p1">P1 (high)</option>
                          <option value="p2">P2 (normal)</option>
                          <option value="p3">P3 (low)</option>
                        </select>
                        <input
                          type="number"
                          value={ticketBudget}
                          onChange={(e) => setTicketBudget(e.target.value)}
                          placeholder="Requested budget (USD)"
                          className="w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                        />
                      </div>
                      <button
                        onClick={handleCreateTicket}
                        disabled={!ticketTitle.trim() || !ticketBody.trim()}
                        className="px-6 py-3 bg-mint rounded-xl font-medium flex items-center gap-2 hover:bg-mint/90 transition-colors text-white disabled:opacity-30"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Backlog
                      </button>
                    </div>
                  </div>

                  {/* Kanban */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                      { key: "backlog" as const, title: "Backlog" },
                      { key: "in_progress" as const, title: "In Progress" },
                      { key: "done" as const, title: "Done" },
                    ].map((col) => (
                      <div key={col.key} className="glass rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-display font-semibold text-pearl">{col.title}</div>
                          <div className="text-sm text-smoke">{ticketsByStatus[col.key].length}</div>
                        </div>
                        <div className="space-y-3">
                          {ticketsByStatus[col.key].map((t) => (
                            <div key={t.id} className="p-4 bg-slate rounded-xl">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="font-medium text-pearl truncate">{t.title}</div>
                                  <div className="text-smoke text-sm mt-1 line-clamp-3">{t.description}</div>
                                  <div className="flex flex-wrap gap-1 mt-3">
                                    <span className="px-2 py-0.5 rounded bg-white text-smoke text-xs">
                                      {t.priority.toUpperCase()}
                                    </span>
                                    {typeof t.requestedBudgetUsd === "number" && (
                                      <span className="px-2 py-0.5 rounded bg-white text-smoke text-xs">
                                        ${t.requestedBudgetUsd.toLocaleString()}
                                      </span>
                                    )}
                                    {t.tags.slice(0, 3).map((tag) => (
                                      <span key={tag} className="px-2 py-0.5 rounded bg-white text-smoke text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-mono text-pearl">{t.votes.toLocaleString()}</div>
                                  <div className="text-xs text-smoke">votes</div>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  onClick={() => voteTicket(group.id, t.id)}
                                  className="px-3 py-2 rounded-lg bg-mint/10 text-mint text-sm hover:bg-mint/20 transition-colors"
                                >
                                  Upvote (+{Math.max(1, Math.floor(holdings)).toLocaleString()})
                                </button>
                                {t.status !== "backlog" && (
                                  <button
                                    onClick={() => moveTicket(group.id, t.id, "backlog")}
                                    className="px-3 py-2 rounded-lg bg-white text-smoke text-sm hover:text-pearl transition-colors"
                                  >
                                    Backlog
                                  </button>
                                )}
                                {t.status !== "in_progress" && (
                                  <button
                                    onClick={() => moveTicket(group.id, t.id, "in_progress")}
                                    className="px-3 py-2 rounded-lg bg-white text-smoke text-sm hover:text-pearl transition-colors"
                                  >
                                    In Progress
                                  </button>
                                )}
                                {t.status !== "done" && (
                                  <button
                                    onClick={() => moveTicket(group.id, t.id, "done")}
                                    className="px-3 py-2 rounded-lg bg-white text-smoke text-sm hover:text-pearl transition-colors"
                                  >
                                    Done
                                  </button>
                                )}
                              </div>

                              <div className="mt-4 pt-4 border-t border-graphite text-xs text-smoke">
                                Created by {t.createdByName} •{" "}
                                {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          ))}
                          {ticketsByStatus[col.key].length === 0 && (
                            <div className="p-6 text-center text-smoke">No tickets.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Active Proposals */}
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-4 text-pearl">Active Proposals</h3>
                    <div className="space-y-4">
                      {group.proposals.filter(p => p.status === "active").map((proposal) => {
                        const totalVotes = proposal.votesFor + proposal.votesAgainst;
                        const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                        const timeLeft = Math.max(0, Math.ceil((new Date(proposal.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                        return (
                          <div key={proposal.id} className="glass rounded-2xl p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded bg-ember/10 text-ember text-xs uppercase">
                                    {proposal.category}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-mint/10 text-mint text-xs">
                                    Active
                                  </span>
                                </div>
                                <h4 className="font-display text-lg font-semibold text-pearl">{proposal.title}</h4>
                                <p className="text-smoke text-sm mt-1">{proposal.description}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-smoke text-sm">
                                  <Clock className="w-4 h-4" />
                                  {timeLeft} days left
                                </div>
                              </div>
                            </div>

                            {/* Vote Progress */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-mint">For: {proposal.votesFor.toLocaleString()}</span>
                                <span className="text-ember">Against: {proposal.votesAgainst.toLocaleString()}</span>
                              </div>
                              <div className="h-2 bg-slate rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-mint rounded-full transition-all"
                                  style={{ width: `${forPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Vote Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => vote(group.id, proposal.id, true)}
                                className="flex-1 py-3 bg-mint/10 text-mint rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-mint/20 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                Vote For
                              </button>
                              <button
                                onClick={() => vote(group.id, proposal.id, false)}
                                className="flex-1 py-3 bg-ember/10 text-ember rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-ember/20 transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Vote Against
                              </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-graphite text-sm text-smoke">
                              Proposed by {proposal.proposer}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Past Proposals */}
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-4 text-pearl">Past Proposals</h3>
                    <div className="space-y-3">
                      {group.proposals.filter(p => p.status !== "active").map((proposal) => (
                        <div key={proposal.id} className="glass rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              proposal.status === "passed" ? "bg-mint/10" : "bg-ember/10"
                            }`}>
                              {proposal.status === "passed" ? (
                                <Check className="w-4 h-4 text-mint" />
                              ) : (
                                <X className="w-4 h-4 text-ember" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-pearl">{proposal.title}</div>
                              <div className="text-smoke text-sm">{proposal.category}</div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm ${
                            proposal.status === "passed"
                              ? "bg-mint/10 text-mint"
                              : "bg-ember/10 text-ember"
                          }`}>
                            {proposal.status === "passed" ? "Passed" : "Rejected"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Public Tab (manage public page WIP updates) */}
            {activeTab === "public" && (
              <motion.div
                key="public"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-5 h-5 text-mint" />
                      <h3 className="font-display text-xl font-semibold text-pearl">Public Page Updates</h3>
                    </div>
                    <p className="text-smoke text-sm">
                      Post works-in-progress so guests can see what the community is cooking up.
                    </p>
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <div className="font-display text-lg font-semibold text-pearl mb-4">Post a WIP</div>
                    <div className="space-y-3">
                      <input
                        value={updateTitle}
                        onChange={(e) => setUpdateTitle(e.target.value)}
                        placeholder="Title (e.g., ‘We shipped v0.1 of…’)"
                        className="w-full px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                      />
                      <textarea
                        value={updateBody}
                        onChange={(e) => setUpdateBody(e.target.value)}
                        placeholder="What’s new? What’s next? Any asks?"
                        className="w-full min-h-28 px-4 py-3 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                      />
                      <input
                        value={updateTags}
                        onChange={(e) => setUpdateTags(e.target.value)}
                        placeholder="Tags (comma-separated): projects, wip, funding"
                        className="w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                      />
                      <button
                        onClick={handlePostUpdate}
                        disabled={!updateTitle.trim() || !updateBody.trim()}
                        className="px-6 py-3 bg-mint rounded-xl font-medium hover:bg-mint/90 transition-colors text-white disabled:opacity-30"
                      >
                        Publish Update
                      </button>
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-6">
                    <div className="font-display text-lg font-semibold text-pearl mb-4">Recent Public Updates</div>
                    <div className="space-y-3">
                      {group.updates.filter((u) => u.isPublic).length === 0 ? (
                        <div className="text-smoke">No public updates yet.</div>
                      ) : (
                        group.updates
                          .filter((u) => u.isPublic)
                          .slice(0, 12)
                          .map((u) => (
                            <div key={u.id} className="p-4 bg-slate rounded-xl">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="font-medium text-pearl truncate">{u.title}</div>
                                  <div className="text-smoke text-sm mt-1 whitespace-pre-wrap">{u.content}</div>
                                  <div className="text-xs text-smoke mt-3">
                                    {u.authorName} •{" "}
                                    {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 justify-end">
                                  {u.tags.slice(0, 6).map((t) => (
                                    <span key={t} className="px-2 py-0.5 rounded bg-white text-smoke text-xs">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Library Tab */}
            {activeTab === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-6xl mx-auto space-y-6">
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-5 h-5 text-ember" />
                          <h3 className="font-display text-xl font-semibold text-pearl">Library</h3>
                        </div>
                        <div className="text-smoke text-sm">
                          Universal assets (docs, photos, videos, PDFs, audio) with version history and compare.
                        </div>
                      </div>
                      <div className="text-right text-sm text-smoke max-w-sm">
                        MVP note: files are stored in-memory for preview in this session. In production this would be backed by durable object storage.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Collections */}
                    <div className="space-y-4">
                      <div className="glass rounded-2xl p-4">
                        <div className="font-display font-semibold text-pearl mb-3">Collections</div>
                        <div className="space-y-2">
                          {group.libraryCollections.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSelectedCollectionId(c.id);
                                setActiveAssetId(null);
                                setCompareA(null);
                                setCompareB(null);
                              }}
                              className={`w-full text-left p-3 rounded-xl transition-colors ${
                                selectedCollectionId === c.id ? "bg-slate" : "hover:bg-slate/60"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-medium text-pearl truncate">{c.name}</div>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  c.isPublic ? "bg-mint/10 text-mint" : "bg-amber-500/10 text-amber-600"
                                }`}>
                                  {c.isPublic ? "Public" : "Private"}
                                </span>
                              </div>
                              <div className="text-smoke text-sm mt-1 line-clamp-2">{c.description}</div>
                            </button>
                          ))}
                          {group.libraryCollections.length === 0 && (
                            <div className="text-smoke text-sm">No collections yet.</div>
                          )}
                        </div>
                      </div>

                      <div className="glass rounded-2xl p-4">
                        <div className="font-display font-semibold text-pearl mb-3">New Collection</div>
                        <div className="space-y-2">
                          <input
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                            placeholder="Name (e.g., ‘Campaign Assets’)"
                            className="w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                          />
                          <textarea
                            value={collectionDesc}
                            onChange={(e) => setCollectionDesc(e.target.value)}
                            placeholder="Description"
                            className="w-full min-h-20 px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                          />
                          <label className="flex items-center gap-2 text-sm text-smoke">
                            <input
                              type="checkbox"
                              checked={collectionIsPublic}
                              onChange={(e) => setCollectionIsPublic(e.target.checked)}
                            />
                            Public (visible to guests)
                          </label>
                          <button
                            onClick={handleCreateCollection}
                            disabled={!collectionName.trim()}
                            className="w-full py-2 bg-ember rounded-xl text-white font-medium disabled:opacity-30 hover:bg-ember/90 transition-colors"
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Assets */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="glass rounded-2xl p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-display font-semibold text-pearl">
                              {selectedCollection ? selectedCollection.name : "Select a collection"}
                            </div>
                            <div className="text-smoke text-sm">
                              {selectedCollection ? `${assetsForSelectedCollection.length} assets` : "—"}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              value={assetQuery}
                              onChange={(e) => setAssetQuery(e.target.value)}
                              placeholder="Search assets…"
                              className="w-64 max-w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                            />
                            <label className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                              selectedCollectionId ? "bg-mint text-white hover:bg-mint/90 cursor-pointer" : "bg-slate text-smoke cursor-not-allowed"
                            }`}>
                              Upload files
                              <input
                                type="file"
                                multiple
                                className="hidden"
                                disabled={!selectedCollectionId}
                                onChange={(e) => {
                                  void handleBulkUpload(e.target.files);
                                  e.currentTarget.value = "";
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assetsForSelectedCollection.map((a) => {
                          const latest = a.versions[0];
                          return (
                            <button
                              key={a.id}
                              onClick={() => {
                                setActiveAssetId(a.id);
                                setCompareA(null);
                                setCompareB(null);
                              }}
                              className={`text-left glass rounded-2xl p-4 hover:bg-slate/40 transition-colors ${
                                activeAssetId === a.id ? "ring-1 ring-ember" : ""
                              }`}
                            >
                              <div className="font-medium text-pearl truncate">{a.title}</div>
                              <div className="text-smoke text-sm mt-1">
                                {latest ? `${latest.fileName} • ${formatBytes(latest.sizeBytes)}` : "No versions"}
                              </div>
                              <div className="text-xs text-smoke mt-3">
                                {a.versions.length} versions • created by {a.createdByName}
                              </div>
                            </button>
                          );
                        })}
                        {selectedCollectionId && assetsForSelectedCollection.length === 0 && (
                          <div className="col-span-full p-10 text-center glass rounded-2xl text-smoke">
                            No assets yet. Upload files to get started.
                          </div>
                        )}
                      </div>

                      {/* Asset detail */}
                      {activeAsset && (
                        <div className="glass rounded-2xl p-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="min-w-0">
                              <div className="font-display text-2xl font-semibold text-pearl truncate">{activeAsset.title}</div>
                              <div className="text-smoke text-sm mt-1">
                                {activeAsset.versions.length} versions • tags:{" "}
                                {activeAsset.tags.length ? activeAsset.tags.join(", ") : "—"}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                value={versionNotes}
                                onChange={(e) => setVersionNotes(e.target.value)}
                                placeholder="Notes for new version (optional)"
                                className="w-64 max-w-full px-4 py-2 bg-white border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors text-pearl placeholder:text-smoke/50"
                              />
                              <label className="px-4 py-2 rounded-xl font-medium bg-ember text-white hover:bg-ember/90 cursor-pointer transition-colors">
                                Upload new version
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    void handleAddVersion(e.target.files?.[0] ?? null);
                                    e.currentTarget.value = "";
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                            <div>
                              <div className="text-smoke text-sm mb-2">Latest preview</div>
                              {activeAsset.versions[0] && (
                                <AssetPreview
                                  objectUrl={activeAsset.versions[0].objectUrl}
                                  mimeType={activeAsset.versions[0].mimeType}
                                  fileName={activeAsset.versions[0].fileName}
                                  textContent={activeAsset.versions[0].textContent}
                                />
                              )}
                            </div>
                            <div>
                              <div className="text-smoke text-sm mb-2">Compare versions</div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <select
                                  value={compareA ?? ""}
                                  onChange={(e) => setCompareA(e.target.value || null)}
                                  className="w-full px-3 py-2 bg-white border border-graphite rounded-xl text-pearl"
                                >
                                  <option value="">Select A…</option>
                                  {activeAsset.versions.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {v.fileName}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={compareB ?? ""}
                                  onChange={(e) => setCompareB(e.target.value || null)}
                                  className="w-full px-3 py-2 bg-white border border-graphite rounded-xl text-pearl"
                                >
                                  <option value="">Select B…</option>
                                  {activeAsset.versions.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {v.fileName}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {versionA && versionB ? (
                                <div className="grid grid-cols-1 gap-3">
                                  <div className="p-3 bg-slate rounded-xl">
                                    <div className="text-sm text-pearl font-medium mb-1">Version A</div>
                                    <div className="text-xs text-smoke mb-3">
                                      {versionA.fileName} • {formatBytes(versionA.sizeBytes)} • {versionA.mimeType}
                                    </div>
                                    <AssetPreview objectUrl={versionA.objectUrl} mimeType={versionA.mimeType} fileName={versionA.fileName} textContent={versionA.textContent} />
                                  </div>
                                  <div className="p-3 bg-slate rounded-xl">
                                    <div className="text-sm text-pearl font-medium mb-1">Version B</div>
                                    <div className="text-xs text-smoke mb-3">
                                      {versionB.fileName} • {formatBytes(versionB.sizeBytes)} • {versionB.mimeType}
                                    </div>
                                    <AssetPreview objectUrl={versionB.objectUrl} mimeType={versionB.mimeType} fileName={versionB.fileName} textContent={versionB.textContent} />
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6 bg-slate rounded-xl text-smoke text-sm">
                                  Pick two versions to compare. For media, compare is side-by-side preview; for text, it shows both contents (true line diffs come later).
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="font-display font-semibold text-pearl mb-3">Version history</div>
                            <div className="space-y-2">
                              {activeAsset.versions.map((v) => (
                                <div key={v.id} className="p-3 bg-slate rounded-xl flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="font-medium text-pearl truncate">{v.fileName}</div>
                                    <div className="text-xs text-smoke mt-1">
                                      {new Date(v.createdAt).toLocaleString()} • {formatBytes(v.sizeBytes)} • {v.mimeType} • by {v.createdByName}
                                    </div>
                                    {v.notes && <div className="text-smoke text-sm mt-2">{v.notes}</div>}
                                  </div>
                                  {v.objectUrl && (
                                    <a href={v.objectUrl} download className="text-mint text-sm hover:underline flex-shrink-0">
                                      Download
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Main component that determines which view to show
export default function GroupPage() {
  const params = useParams();
  const { 
    currentGroup, 
    setCurrentGroup,
    joinGroup,
    isMember,
  } = useStore();

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
          <p className="text-smoke">Loading community...</p>
        </div>
      </div>
    );
  }

  const userIsMember = isMember(currentGroup.id);

  const handleJoin = () => {
    joinGroup(currentGroup.id);
  };

  if (userIsMember) {
    return <MemberDashboard group={currentGroup} />;
  }

  return <PublicProgressView group={currentGroup} onJoin={handleJoin} isMember={userIsMember} />;
}
