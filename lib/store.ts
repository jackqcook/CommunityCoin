import { create } from "zustand";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  channel: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  reputation: number;
  role: "founder" | "elder" | "member" | "newcomer";
  joinedAt: Date;
  tokensHeld: number;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: "active" | "passed" | "rejected" | "pending";
  votesFor: number;
  votesAgainst: number;
  endDate: Date;
  category: "treasury" | "governance" | "charter" | "other";
}

export interface Group {
  id: string;
  name: string;
  description: string;
  charter: string;
  isPublic: boolean;
  createdAt: Date;
  memberCount: number;
  tokenSymbol: string;
  tokenPrice: number;
  tokenSupply: number;
  treasuryBalance: number;
  priceHistory: { time: number; price: number }[];
  channels: string[];
  members: Member[];
  messages: Message[];
  proposals: Proposal[];
}

interface AppState {
  currentUser: Member | null;
  groups: Group[];
  currentGroup: Group | null;
  currentChannel: string;
  
  // Actions
  setCurrentUser: (user: Member) => void;
  createGroup: (group: Omit<Group, "id" | "createdAt" | "priceHistory" | "members" | "messages" | "proposals">) => Group;
  setCurrentGroup: (groupId: string) => void;
  setCurrentChannel: (channel: string) => void;
  addMessage: (groupId: string, message: Omit<Message, "id" | "timestamp">) => void;
  buyTokens: (groupId: string, amount: number) => void;
  sellTokens: (groupId: string, amount: number) => void;
  createProposal: (groupId: string, proposal: Omit<Proposal, "id" | "status" | "votesFor" | "votesAgainst">) => void;
  vote: (groupId: string, proposalId: string, support: boolean) => void;
}

// Generate mock price history
const generatePriceHistory = (basePrice: number, days: number = 30) => {
  const history = [];
  let price = basePrice * 0.3;
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    price = price * (1 + (Math.random() - 0.45) * 0.1);
    price = Math.max(0.001, Math.min(price, basePrice * 1.5));
    history.push({
      time: now - i * 24 * 60 * 60 * 1000,
      price: price,
    });
  }
  
  // Ensure last price matches current
  history[history.length - 1].price = basePrice;
  return history;
};

// Mock data for demo
const mockGroups: Group[] = [
  {
    id: "1",
    name: "Solarpunk Builders",
    description: "Designing regenerative futures through technology and community action.",
    charter: "We believe in building technology that serves humanity and heals the planet. Our mission is to fund and develop open-source tools for sustainable living, support local food systems, and create blueprints for regenerative communities.",
    isPublic: true,
    createdAt: new Date("2024-06-15"),
    memberCount: 1247,
    tokenSymbol: "SOLAR",
    tokenPrice: 0.42,
    tokenSupply: 1000000,
    treasuryBalance: 125000,
    priceHistory: generatePriceHistory(0.42),
    channels: ["general", "projects", "governance", "random"],
    members: [
      { id: "u1", name: "Maya Chen", avatar: "🌱", reputation: 9500, role: "founder", joinedAt: new Date("2024-06-15"), tokensHeld: 50000 },
      { id: "u2", name: "Alex Rivera", avatar: "☀️", reputation: 7200, role: "elder", joinedAt: new Date("2024-07-01"), tokensHeld: 25000 },
      { id: "u3", name: "Jordan Kim", avatar: "🔧", reputation: 4100, role: "member", joinedAt: new Date("2024-08-20"), tokensHeld: 8000 },
      { id: "u4", name: "Sam Okonkwo", avatar: "🌿", reputation: 1200, role: "newcomer", joinedAt: new Date("2025-01-10"), tokensHeld: 500 },
    ],
    messages: [
      { id: "m1", userId: "u1", userName: "Maya Chen", content: "Just published the updated roadmap for Q1. Check the #projects channel for details!", channel: "general", timestamp: new Date(Date.now() - 3600000) },
      { id: "m2", userId: "u2", userName: "Alex Rivera", content: "Amazing work on the solar toolkit documentation everyone 🎉", channel: "general", timestamp: new Date(Date.now() - 1800000) },
      { id: "m3", userId: "u3", userName: "Jordan Kim", content: "Anyone interested in collaborating on the community garden mapping project?", channel: "general", timestamp: new Date(Date.now() - 900000) },
    ],
    proposals: [
      { id: "p1", title: "Fund Community Garden Toolkit", description: "Allocate 5,000 USDC to develop open-source tools for urban farming coordination.", proposer: "Maya Chen", status: "active", votesFor: 42000, votesAgainst: 8000, endDate: new Date(Date.now() + 86400000 * 3), category: "treasury" },
      { id: "p2", title: "Add 'Research' Channel", description: "Create a dedicated space for sharing academic papers and research findings.", proposer: "Alex Rivera", status: "passed", votesFor: 38000, votesAgainst: 2000, endDate: new Date(Date.now() - 86400000), category: "governance" },
    ],
  },
  {
    id: "2",
    name: "Weird Catholicism",
    description: "Exploring the intersection of traditional faith and postmodern culture.",
    charter: "A space for those who find meaning in ancient traditions while living in the digital age. We discuss theology, art, architecture, and the search for the sacred in a secular world.",
    isPublic: true,
    createdAt: new Date("2024-09-01"),
    memberCount: 892,
    tokenSymbol: "CREDO",
    tokenPrice: 0.18,
    tokenSupply: 500000,
    treasuryBalance: 34000,
    priceHistory: generatePriceHistory(0.18),
    channels: ["general", "theology", "art", "memes"],
    members: [],
    messages: [],
    proposals: [],
  },
  {
    id: "3",
    name: "AI Alignment Collective",
    description: "Independent researchers working on AI safety outside institutional constraints.",
    charter: "We believe AI alignment research is too important to be siloed in a few organizations. Our collective funds independent research, hosts reading groups, and builds tools to democratize safety work.",
    isPublic: false,
    createdAt: new Date("2024-03-10"),
    memberCount: 156,
    tokenSymbol: "ALIGN",
    tokenPrice: 2.34,
    tokenSupply: 100000,
    treasuryBalance: 89000,
    priceHistory: generatePriceHistory(2.34),
    channels: ["general", "research", "papers", "grants"],
    members: [],
    messages: [],
    proposals: [],
  },
];

export const useStore = create<AppState>((set, get) => ({
  currentUser: {
    id: "current",
    name: "You",
    avatar: "🌟",
    reputation: 2500,
    role: "member",
    joinedAt: new Date(),
    tokensHeld: 1000,
  },
  groups: mockGroups,
  currentGroup: null,
  currentChannel: "general",

  setCurrentUser: (user) => set({ currentUser: user }),

  createGroup: (groupData) => {
    const newGroup: Group = {
      ...groupData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      priceHistory: generatePriceHistory(0.01),
      members: [get().currentUser!],
      messages: [],
      proposals: [],
    };
    set((state) => ({ groups: [...state.groups, newGroup] }));
    return newGroup;
  },

  setCurrentGroup: (groupId) => {
    const group = get().groups.find((g) => g.id === groupId) || null;
    set({ currentGroup: group, currentChannel: "general" });
  },

  setCurrentChannel: (channel) => set({ currentChannel: channel }),

  addMessage: (groupId, message) => {
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, messages: [...g.messages, newMessage] }
          : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? { ...state.currentGroup, messages: [...state.currentGroup.messages, newMessage] }
          : state.currentGroup,
    }));
  },

  buyTokens: (groupId, amount) => {
    set((state) => {
      const group = state.groups.find((g) => g.id === groupId);
      if (!group) return state;

      // Simple bonding curve: price increases with supply
      const newSupply = group.tokenSupply + amount;
      const avgPrice = group.tokenPrice * (1 + amount / group.tokenSupply * 0.1);
      const cost = amount * avgPrice;
      const fee = cost * 0.02; // 2% fee to treasury

      const updatedGroup = {
        ...group,
        tokenSupply: newSupply,
        tokenPrice: group.tokenPrice * (1 + amount / group.tokenSupply * 0.05),
        treasuryBalance: group.treasuryBalance + fee,
        priceHistory: [
          ...group.priceHistory,
          { time: Date.now(), price: group.tokenPrice * (1 + amount / group.tokenSupply * 0.05) },
        ],
      };

      return {
        groups: state.groups.map((g) => (g.id === groupId ? updatedGroup : g)),
        currentGroup: state.currentGroup?.id === groupId ? updatedGroup : state.currentGroup,
      };
    });
  },

  sellTokens: (groupId, amount) => {
    set((state) => {
      const group = state.groups.find((g) => g.id === groupId);
      if (!group || amount > group.tokenSupply * 0.1) return state; // Can't sell more than 10% at once

      const newSupply = group.tokenSupply - amount;
      const newPrice = group.tokenPrice * (1 - amount / group.tokenSupply * 0.05);

      const updatedGroup = {
        ...group,
        tokenSupply: newSupply,
        tokenPrice: Math.max(0.001, newPrice),
        priceHistory: [
          ...group.priceHistory,
          { time: Date.now(), price: Math.max(0.001, newPrice) },
        ],
      };

      return {
        groups: state.groups.map((g) => (g.id === groupId ? updatedGroup : g)),
        currentGroup: state.currentGroup?.id === groupId ? updatedGroup : state.currentGroup,
      };
    });
  },

  createProposal: (groupId, proposal) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Math.random().toString(36).substr(2, 9),
      status: "active",
      votesFor: 0,
      votesAgainst: 0,
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, proposals: [...g.proposals, newProposal] }
          : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? { ...state.currentGroup, proposals: [...state.currentGroup.proposals, newProposal] }
          : state.currentGroup,
    }));
  },

  vote: (groupId, proposalId, support) => {
    const user = get().currentUser;
    if (!user) return;

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              proposals: g.proposals.map((p) =>
                p.id === proposalId
                  ? {
                      ...p,
                      votesFor: support ? p.votesFor + user.tokensHeld : p.votesFor,
                      votesAgainst: !support ? p.votesAgainst + user.tokensHeld : p.votesAgainst,
                    }
                  : p
              ),
            }
          : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              proposals: state.currentGroup.proposals.map((p) =>
                p.id === proposalId
                  ? {
                      ...p,
                      votesFor: support ? p.votesFor + user.tokensHeld : p.votesFor,
                      votesAgainst: !support ? p.votesAgainst + user.tokensHeld : p.votesAgainst,
                    }
                  : p
              ),
            }
          : state.currentGroup,
    }));
  },
}));
