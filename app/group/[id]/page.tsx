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
} from "lucide-react";

type Tab = "chat" | "token" | "treasury" | "governance";

export default function GroupDashboard() {
  const params = useParams();
  const { 
    groups, 
    currentGroup, 
    currentChannel, 
    currentUser,
    setCurrentGroup, 
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

  useEffect(() => {
    if (params.id) {
      setCurrentGroup(params.id as string);
    }
  }, [params.id, setCurrentGroup]);

  if (!currentGroup) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-graphite animate-pulse mx-auto mb-4" />
          <p className="text-smoke">Loading community...</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentUser) return;
    
    addMessage(currentGroup.id, {
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
      buyTokens(currentGroup.id, amount);
    } else {
      sellTokens(currentGroup.id, amount);
    }
    setTradeAmount("");
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const channelMessages = currentGroup.messages.filter(m => m.channel === currentChannel);

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Sidebar */}
      <aside className="w-72 bg-obsidian border-r border-graphite flex flex-col">
        {/* Group Header */}
        <div className="p-4 border-b border-graphite">
          <Link href="/" className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ember to-gold flex items-center justify-center">
              <Coins className="w-4 h-4 text-midnight" />
            </div>
            <span className="font-display text-lg">CommunityCoin</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-lg font-semibold truncate">{currentGroup.name}</h1>
              <div className="flex items-center gap-2 text-smoke text-sm">
                {currentGroup.isPublic ? (
                  <Globe className="w-3 h-3" />
                ) : (
                  <Lock className="w-3 h-3" />
                )}
                <span>{currentGroup.memberCount.toLocaleString()} members</span>
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
            <span className="font-mono text-mint text-sm">${currentGroup.tokenSymbol}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-smoke text-sm">Price</span>
            <span className="font-mono text-sm">${formatPrice(currentGroup.tokenPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-smoke text-sm">Treasury</span>
            <span className="font-mono text-gold text-sm">${currentGroup.treasuryBalance.toLocaleString()}</span>
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
            {currentGroup.channels.map((channel) => (
              <button
                key={channel}
                onClick={() => setCurrentChannel(channel)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentChannel === channel
                    ? "bg-graphite text-pearl"
                    : "text-smoke hover:bg-graphite/50 hover:text-pearl"
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
            <div className="w-10 h-10 rounded-full bg-graphite flex items-center justify-center text-lg">
              {currentUser?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{currentUser?.name}</div>
              <div className="text-smoke text-sm">{currentUser?.tokensHeld.toLocaleString()} ${currentGroup.tokenSymbol}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <header className="h-14 border-b border-graphite flex items-center justify-between px-6">
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
                    ? "bg-graphite text-pearl"
                    : "text-smoke hover:text-pearl"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <Link
            href={`/group/${currentGroup.id}/charter`}
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
                        <h3 className="font-display text-xl mb-2">Welcome to #{currentChannel}</h3>
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
                        <div className="w-10 h-10 rounded-full bg-graphite flex items-center justify-center flex-shrink-0">
                          {currentGroup.members.find(m => m.id === message.userId)?.avatar || "👤"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{message.userName}</span>
                            <span className="text-smoke text-xs">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-pearl/90 leading-relaxed">{message.content}</p>
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
                      className="flex-1 px-4 py-3 bg-graphite/50 border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="p-3 bg-ember rounded-xl disabled:opacity-30 hover:bg-ember/90 transition-colors"
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
                          <span className="font-mono text-2xl">${currentGroup.tokenSymbol}</span>
                          <span className="px-2 py-0.5 rounded bg-mint/10 text-mint text-xs">Live</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-3xl">${formatPrice(currentGroup.tokenPrice)}</span>
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
                              period === "1M" ? "bg-graphite text-pearl" : "text-smoke hover:text-pearl"
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
                            <stop offset="0%" stopColor="rgba(255, 107, 53, 0.3)" />
                            <stop offset="100%" stopColor="rgba(255, 107, 53, 0)" />
                          </linearGradient>
                        </defs>
                        {/* Area */}
                        <path
                          d={`M 0 200 ${currentGroup.priceHistory.map((p, i) => {
                            const x = (i / (currentGroup.priceHistory.length - 1)) * 400;
                            const minPrice = Math.min(...currentGroup.priceHistory.map(h => h.price));
                            const maxPrice = Math.max(...currentGroup.priceHistory.map(h => h.price));
                            const y = 200 - ((p.price - minPrice) / (maxPrice - minPrice)) * 180 - 10;
                            return `L ${x} ${y}`;
                          }).join(" ")} L 400 200 Z`}
                          fill="url(#chartGradient)"
                        />
                        {/* Line */}
                        <path
                          d={`M ${currentGroup.priceHistory.map((p, i) => {
                            const x = (i / (currentGroup.priceHistory.length - 1)) * 400;
                            const minPrice = Math.min(...currentGroup.priceHistory.map(h => h.price));
                            const maxPrice = Math.max(...currentGroup.priceHistory.map(h => h.price));
                            const y = 200 - ((p.price - minPrice) / (maxPrice - minPrice)) * 180 - 10;
                            return `${i === 0 ? "" : "L "}${x} ${y}`;
                          }).join(" ")}`}
                          fill="none"
                          stroke="#ff6b35"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Trade Panel */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex rounded-xl bg-graphite/50 p-1 mb-6">
                      <button
                        onClick={() => setTradeType("buy")}
                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                          tradeType === "buy" ? "bg-mint text-midnight" : "text-smoke"
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
                            className="w-full px-4 py-3 bg-graphite/50 border border-graphite rounded-xl focus:outline-none focus:border-ember transition-colors font-mono text-xl"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-smoke">
                            ${currentGroup.tokenSymbol}
                          </span>
                        </div>
                      </div>

                      {tradeAmount && (
                        <div className="p-4 bg-graphite/30 rounded-xl space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-smoke">Price per token</span>
                            <span className="font-mono">${formatPrice(currentGroup.tokenPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-smoke">Total {tradeType === "buy" ? "cost" : "received"}</span>
                            <span className="font-mono">
                              ${(parseFloat(tradeAmount || "0") * currentGroup.tokenPrice).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-smoke">Treasury fee (2%)</span>
                            <span className="font-mono text-gold">
                              ${(parseFloat(tradeAmount || "0") * currentGroup.tokenPrice * 0.02).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleTrade}
                        disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                        className={`w-full py-4 rounded-xl font-semibold disabled:opacity-30 transition-colors ${
                          tradeType === "buy"
                            ? "bg-mint text-midnight hover:bg-mint/90"
                            : "bg-ember hover:bg-ember/90"
                        }`}
                      >
                        {tradeType === "buy" ? "Buy" : "Sell"} ${currentGroup.tokenSymbol}
                      </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-graphite">
                      <h3 className="text-sm text-smoke mb-3">Your Holdings</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg">{currentUser?.tokensHeld.toLocaleString()}</span>
                        <span className="text-smoke">${currentGroup.tokenSymbol}</span>
                      </div>
                      <div className="text-smoke text-sm mt-1">
                        ≈ ${((currentUser?.tokensHeld || 0) * currentGroup.tokenPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Token Stats */}
                  <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Market Cap", value: `$${(currentGroup.tokenSupply * currentGroup.tokenPrice).toLocaleString()}` },
                      { label: "Total Supply", value: currentGroup.tokenSupply.toLocaleString() },
                      { label: "Holders", value: currentGroup.memberCount.toLocaleString() },
                      { label: "24h Volume", value: "$12,450" },
                    ].map((stat) => (
                      <div key={stat.label} className="glass rounded-xl p-4">
                        <div className="text-smoke text-sm mb-1">{stat.label}</div>
                        <div className="font-mono text-lg">{stat.value}</div>
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
                      ${currentGroup.treasuryBalance.toLocaleString()}
                    </div>
                    <div className="text-smoke">
                      Funded by 2% fees on all ${currentGroup.tokenSymbol} trades
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
                          <div className="font-mono text-lg">+$4,250</div>
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
                          <div className="font-mono text-lg">$45,000</div>
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
                          <div className="font-mono text-lg">2</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-display text-xl font-semibold mb-4">Recent Activity</h3>
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
                              <div className="font-medium">{activity.description}</div>
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
                        <div className="font-mono text-2xl">{currentUser?.tokensHeld.toLocaleString()} votes</div>
                        <div className="text-smoke text-sm mt-1">
                          Based on your ${currentGroup.tokenSymbol} holdings
                        </div>
                      </div>
                      <button className="px-6 py-3 bg-ember rounded-xl font-medium flex items-center gap-2 hover:bg-ember/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        New Proposal
                      </button>
                    </div>
                  </div>

                  {/* Active Proposals */}
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-4">Active Proposals</h3>
                    <div className="space-y-4">
                      {currentGroup.proposals.filter(p => p.status === "active").map((proposal) => {
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
                                <h4 className="font-display text-lg font-semibold">{proposal.title}</h4>
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
                              <div className="h-2 bg-graphite rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-mint rounded-full transition-all"
                                  style={{ width: `${forPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Vote Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => vote(currentGroup.id, proposal.id, true)}
                                className="flex-1 py-3 bg-mint/10 text-mint rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-mint/20 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                                Vote For
                              </button>
                              <button
                                onClick={() => vote(currentGroup.id, proposal.id, false)}
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
                    <h3 className="font-display text-xl font-semibold mb-4">Past Proposals</h3>
                    <div className="space-y-3">
                      {currentGroup.proposals.filter(p => p.status !== "active").map((proposal) => (
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
                              <div className="font-medium">{proposal.title}</div>
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
