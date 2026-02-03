"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

type Tab = "chat" | "token" | "treasury" | "governance";

// GitHub-like progress view for non-members
function PublicProgressView({ group, onJoin, isMember }: { 
  group: NonNullable<ReturnType<typeof useStore>["currentGroup"]>;
  onJoin: () => void;
  isMember: boolean;
}) {
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  // Mock activity data for the progress view
  const activityFeed = [
    ...group.proposals.map(p => ({
      type: "proposal" as const,
      title: p.title,
      description: p.status === "active" ? "New proposal created" : `Proposal ${p.status}`,
      time: p.endDate,
      status: p.status,
      icon: Vote,
    })),
    { type: "treasury" as const, title: "Treasury grew to $" + group.treasuryBalance.toLocaleString(), description: "From trading fees", time: new Date(Date.now() - 86400000 * 2), icon: Wallet },
    { type: "milestone" as const, title: `${group.memberCount.toLocaleString()} members reached`, description: "Community growing", time: new Date(Date.now() - 86400000 * 5), icon: Users },
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

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
              <div className="text-smoke text-sm mb-1">Treasury</div>
              <div className="font-mono text-gold text-lg">${group.treasuryBalance.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Charter / README Section */}
          <div className="col-span-2 space-y-6">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                <p className="text-smoke text-sm mb-4">Join to chat, vote, and contribute to the community.</p>
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
    sellTokens,
    vote,
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messageInput, setMessageInput] = useState("");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

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

    if (tradeType === "buy") {
      buyTokens(group.id, amount);
    } else {
      sellTokens(group.id, amount);
    }
    setTradeAmount("");
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const channelMessages = group.messages.filter(m => m.channel === currentChannel);

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
            <span className="text-smoke text-sm">Treasury</span>
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
                onClick={() => setCurrentChannel(channel)}
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
              <div className="text-smoke text-sm">{currentUser?.tokensHeld.toLocaleString()} ${group.tokenSymbol}</div>
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
              { id: "treasury", icon: Wallet, label: "Treasury" },
              { id: "governance", icon: Vote, label: "Governance" },
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
                    <div className="flex rounded-xl bg-slate p-1 mb-6">
                      <button
                        onClick={() => setTradeType("buy")}
                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                          tradeType === "buy" ? "bg-mint text-white" : "text-smoke"
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setTradeType("sell")}
                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                          tradeType === "sell" ? "bg-ember text-white" : "text-smoke"
                        }`}
                      >
                        Sell
                      </button>
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
                            <span className="text-smoke">Total {tradeType === "buy" ? "cost" : "received"}</span>
                            <span className="font-mono text-pearl">
                              ${(parseFloat(tradeAmount || "0") * group.tokenPrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-smoke">Treasury fee (2%)</span>
                            <span className="font-mono text-gold">
                              ${(parseFloat(tradeAmount || "0") * group.tokenPrice * 0.02).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleTrade}
                        disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                        className={`w-full py-4 rounded-xl font-semibold disabled:opacity-30 transition-colors ${
                          tradeType === "buy"
                            ? "bg-mint text-white hover:bg-mint/90"
                            : "bg-ember text-white hover:bg-ember/90"
                        }`}
                      >
                        {tradeType === "buy" ? "Buy" : "Sell"} ${group.tokenSymbol}
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-graphite">
                      <h3 className="text-sm text-smoke mb-3">Your Holdings</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg text-pearl">{currentUser?.tokensHeld.toLocaleString()}</span>
                        <span className="text-smoke">${group.tokenSymbol}</span>
                      </div>
                      <div className="text-smoke text-sm mt-1">
                        ≈ ${((currentUser?.tokensHeld || 0) * group.tokenPrice).toFixed(2)}
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

            {/* Treasury Tab */}
            {activeTab === "treasury" && (
              <motion.div
                key="treasury"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Treasury Balance */}
                  <div className="glass rounded-2xl p-8 text-center">
                    <div className="text-smoke mb-2">Community Treasury</div>
                    <div className="font-mono text-5xl text-gold mb-4">
                      ${group.treasuryBalance.toLocaleString()}
                    </div>
                    <div className="text-smoke">
                      Funded by 2% fees on all ${group.tokenSymbol} trades
                    </div>
                  </div>

                  {/* Treasury Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-mint/10 flex items-center justify-center">
                          <ArrowUpRight className="w-5 h-5 text-mint" />
                        </div>
                        <div>
                          <div className="text-smoke text-sm">This Month</div>
                          <div className="font-mono text-lg text-pearl">+$4,250</div>
                        </div>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <div className="text-smoke text-sm">Allocated</div>
                          <div className="font-mono text-lg text-pearl">$45,000</div>
                        </div>
                      </div>
                    </div>
                    <div className="glass rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-ember/10 flex items-center justify-center">
                          <Vote className="w-5 h-5 text-ember" />
                        </div>
                        <div>
                          <div className="text-smoke text-sm">Pending Proposals</div>
                          <div className="font-mono text-lg text-pearl">2</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-display text-xl font-semibold mb-4 text-pearl">Recent Activity</h3>
                    <div className="space-y-4">
                      {[
                        { type: "in", amount: 250, description: "Trade fees", time: "2 hours ago" },
                        { type: "out", amount: 5000, description: "Proposal #12: Community Garden Toolkit", time: "3 days ago" },
                        { type: "in", amount: 180, description: "Trade fees", time: "4 days ago" },
                        { type: "in", amount: 320, description: "Trade fees", time: "1 week ago" },
                      ].map((activity, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-graphite last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === "in" ? "bg-mint/10" : "bg-ember/10"
                            }`}>
                              {activity.type === "in" ? (
                                <ArrowUpRight className="w-4 h-4 text-mint" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-ember" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-pearl">{activity.description}</div>
                              <div className="text-smoke text-sm">{activity.time}</div>
                            </div>
                          </div>
                          <div className={`font-mono ${activity.type === "in" ? "text-mint" : "text-ember"}`}>
                            {activity.type === "in" ? "+" : "-"}${activity.amount.toLocaleString()}
                          </div>
                        </div>
                      ))}
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
                  {/* Voting Power */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-smoke mb-1">Your Voting Power</div>
                        <div className="font-mono text-2xl text-pearl">{currentUser?.tokensHeld.toLocaleString()} votes</div>
                        <div className="text-smoke text-sm mt-1">
                          Based on your ${group.tokenSymbol} holdings
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-ember rounded-xl font-medium flex items-center gap-2 hover:bg-ember/90 transition-colors text-white">
                        <Plus className="w-4 h-4" />
                        New Proposal
                      </button>
                    </div>
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
