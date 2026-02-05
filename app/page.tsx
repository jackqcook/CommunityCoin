"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { usePrivy } from "@privy-io/react-auth";
import {
  Coins,
  Search,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut,
  User
} from "lucide-react";

export default function LandingPage() {
  const { groups } = useStore();
  const { login, logout, authenticated, user } = usePrivy();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [howItWorksSlide, setHowItWorksSlide] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterTabs = ["All", "Most Visited", "Technology", "Politics", "Culture", "Business", "Science"];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar - Pump.fun style */}
        <aside className={`border-r border-graphite bg-white flex flex-col transition-all duration-300 flex-shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          {/* Logo Section */}
          <div className="border-b border-graphite">
            <div className={`flex items-center justify-between ${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
              <Link href="/" className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ember to-flame flex items-center justify-center flex-shrink-0">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <span className="font-display text-xl font-semibold text-pearl">CommunityCoin</span>
                )}
              </Link>
              {!sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 rounded-lg hover:bg-slate transition-colors text-smoke"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Expand button when collapsed */}
            {sidebarCollapsed && (
              <div className="px-3 pb-2">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="w-full py-1.5 rounded-lg bg-slate hover:bg-graphite transition-colors flex items-center justify-center text-smoke"
                  title="Expand sidebar"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Main Navigation - Scrollable */}
          <nav className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'px-3 py-3' : 'p-4'}`}>
            <div className={`${sidebarCollapsed ? 'space-y-3' : 'space-y-2'}`}>
              <Link 
                href="/" 
                className={`flex items-center gap-3 rounded-xl bg-slate text-pearl transition-colors ${
                  sidebarCollapsed ? 'justify-center aspect-square' : 'px-4 py-3'
                }`}
                title="Home"
              >
                <Home className={`flex-shrink-0 ${sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`} />
                {!sidebarCollapsed && <span className="font-medium">Home</span>}
              </Link>

              {!sidebarCollapsed && groups.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-xs font-semibold text-smoke uppercase tracking-wider mb-2 px-4">RECENT</h3>
                  <div className="space-y-1">
                    {groups.slice(0, 5).map((group) => (
                      <Link
                        key={group.id}
                        href={`/group/${group.id}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate transition-colors"
                        title={group.name}
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ember to-flame flex items-center justify-center flex-shrink-0">
                          <Coins className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-pearl truncate">{group.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {sidebarCollapsed && groups.length > 0 && (
                <div className="space-y-3">
                  {groups.slice(0, 5).map((group) => (
                    <Link
                      key={group.id}
                      href={`/group/${group.id}`}
                      className="flex items-center justify-center aspect-square rounded-xl hover:bg-slate transition-colors group"
                      title={group.name}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ember to-flame flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Coins className="w-4 h-4 text-white" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!sidebarCollapsed && (
                <div className="pt-4">
                  <Link
                    href="/create"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ember hover:bg-ember/90 transition-colors text-white font-semibold w-full"
                    title="Create Community"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Community</span>
                  </Link>
                </div>
              )}

              {sidebarCollapsed && (
                <div className="pt-4">
                  <Link
                    href="/create"
                    className="flex items-center justify-center aspect-square rounded-xl bg-ember hover:bg-ember/90 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    title="Create Community"
                  >
                    <Plus className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col h-screen">
          {/* Top Header */}
          <header className="bg-white border-b border-graphite flex-shrink-0">
            <div className="px-6 py-3 flex items-center justify-between">
              {/* Search Bar + How it works */}
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-smoke" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search communities"
                      className="w-full pl-10 pr-4 py-2 bg-slate border border-graphite rounded-full focus:outline-none focus:border-ember transition-colors text-sm text-pearl placeholder:text-smoke/50"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowHowItWorks(true)}
                  className="flex items-center gap-2 px-3 py-2 text-smoke hover:text-pearl hover:bg-slate rounded-lg transition-colors text-sm whitespace-nowrap"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>How it works</span>
                </button>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-3 ml-4">
                <Link
                  href="/create"
                  className="px-4 py-2 bg-ember text-white rounded-lg hover:bg-ember/90 transition-colors text-sm font-medium"
                >
                  Create Community
                </Link>
                {authenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate rounded-lg hover:bg-graphite transition-colors text-sm font-medium text-pearl"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-ember to-flame flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="max-w-24 truncate">
                        {user?.email?.address || user?.wallet?.address?.slice(0, 6) + "..." || "User"}
                      </span>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg border border-graphite shadow-lg py-1 z-50">
                        <div className="px-4 py-2 border-b border-graphite">
                          <p className="text-xs text-smoke">Signed in as</p>
                          <p className="text-sm text-pearl truncate font-medium">
                            {user?.email?.address || user?.wallet?.address?.slice(0, 10) + "..."}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-pearl hover:bg-slate transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={login}
                    className="px-4 py-2 bg-ember text-white rounded-lg hover:bg-ember/90 transition-colors text-sm font-medium"
                  >
                    Log In
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-6">
          {/* Page Title */}
          <h1 className="text-xl font-bold text-pearl mb-4">Explore Communities</h1>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
            {filterTabs.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? "bg-slate text-pearl"
                    : "text-smoke hover:bg-slate/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Recommended for you */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-pearl mb-4">Recommended for you</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.slice(0, 6).map((group, i) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={`/group/${group.id}`}
                    className="block bg-white rounded-xl border border-graphite p-5 hover:border-ember hover:shadow-lg transition-all h-full"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember to-flame flex items-center justify-center flex-shrink-0">
                        <Coins className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-pearl text-lg">{group.name}</h3>
                        <p className="text-xs text-smoke">
                          {group.memberCount.toLocaleString()} members · ${group.tokenSymbol}
                        </p>
                      </div>
                    </div>

                    {/* Mission Statement */}
                    <p className="text-sm text-smoke leading-relaxed mb-4 line-clamp-2">
                      {group.description}
                    </p>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-graphite">
                        <div>
                          <p className="text-xs text-smoke">Market Cap</p>
                          <p className="text-sm font-semibold text-pearl">${(group.tokenPrice * group.tokenSupply).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-smoke">Treasure</p>
                          <p className="text-sm font-semibold text-emerald-600">${group.treasuryBalance.toLocaleString()}</p>
                        </div>
                        <span className="px-3 py-1.5 bg-ember rounded-full text-white text-xs font-medium">
                          Join
                        </span>
                      </div>
                    </Link>
                  </motion.div>
              ))}
            </div>
            {filteredGroups.length > 6 && (
              <button className="mt-4 text-sm text-ember font-medium hover:underline">
                Show more
              </button>
            )}
          </section>

          {/* More like [first group] */}
          {filteredGroups.length > 6 && (
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-pearl mb-4">
                More like {filteredGroups[0]?.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGroups.slice(6, 12).map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/group/${group.id}`}
                      className="block bg-white rounded-xl border border-graphite p-5 hover:border-ember hover:shadow-lg transition-all h-full"
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember to-flame flex items-center justify-center flex-shrink-0">
                          <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-pearl text-lg">{group.name}</h3>
                          <p className="text-xs text-smoke">
                            {group.memberCount.toLocaleString()} members · ${group.tokenSymbol}
                          </p>
                        </div>
                      </div>

                      {/* Mission Statement */}
                      <p className="text-sm text-smoke leading-relaxed mb-4 line-clamp-2">
                        {group.description}
                      </p>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-graphite">
                        <div>
                          <p className="text-xs text-smoke">Market Cap</p>
                          <p className="text-sm font-semibold text-pearl">${(group.tokenPrice * group.tokenSupply).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-smoke">Treasure</p>
                          <p className="text-sm font-semibold text-emerald-600">${group.treasuryBalance.toLocaleString()}</p>
                        </div>
                        <span className="px-3 py-1.5 bg-ember rounded-full text-white text-xs font-medium">
                          Join
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {filteredGroups.length > 12 && (
                <button className="mt-4 text-sm text-ember font-medium hover:underline">
                  Show more
                </button>
              )}
            </section>
          )}

          {filteredGroups.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-graphite flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-smoke" />
              </div>
              <h3 className="font-display text-xl mb-2 text-pearl">No communities found</h3>
              <p className="text-smoke mb-6">Try adjusting your search</p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ember rounded-lg font-medium hover:bg-ember/90 transition-colors text-white text-sm"
              >
                Create Your Own
              </Link>
            </div>
          )}
            </div>
          </div>
        </main>
      </div>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowHowItWorks(false); setHowItWorksSlide(0); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="p-6">
              {/* Slide indicators */}
              <div className="flex justify-center gap-1.5 mb-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === howItWorksSlide ? 'w-6 bg-ember' : 'w-1.5 bg-graphite'
                    }`}
                  />
                ))}
              </div>

              {/* Slides */}
              <div className="h-24">
                <motion.div
                  key={howItWorksSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center h-full flex flex-col justify-center"
                >
                  {howItWorksSlide === 0 && (
                    <>
                      <h3 className="font-semibold text-pearl text-lg mb-2">Create or Join</h3>
                      <p className="text-smoke text-sm leading-relaxed">
                        Start a community around any shared interest or join an existing one. Each community has its own token for membership and voting.
                      </p>
                    </>
                  )}
                  {howItWorksSlide === 1 && (
                    <>
                      <h3 className="font-semibold text-pearl text-lg mb-2">Build the Treasure</h3>
                      <p className="text-smoke text-sm leading-relaxed">
                        Token purchases fund a shared treasure. This collective pool grows with your community and gets spent on what members vote for.
                      </p>
                    </>
                  )}
                  {howItWorksSlide === 2 && (
                    <>
                      <h3 className="font-semibold text-pearl text-lg mb-2">Build Together</h3>
                      <p className="text-smoke text-sm leading-relaxed">
                        Vote on decisions, prioritize tasks, collaborate in chat, and turn collective energy into real results.
                      </p>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Button */}
              <div className="mt-6">
                {howItWorksSlide < 2 ? (
                  <button
                    onClick={() => setHowItWorksSlide(howItWorksSlide + 1)}
                    className="w-full py-3 bg-ember text-white rounded-xl font-semibold hover:bg-ember/90 transition-colors text-sm"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowHowItWorks(false); setHowItWorksSlide(0); }}
                    className="w-full py-3 bg-ember text-white rounded-xl font-semibold hover:bg-ember/90 transition-colors text-sm"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
