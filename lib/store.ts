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

export interface GovernanceRule {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface GroupUpdate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  isPublic: boolean;
}

export type TicketStatus = "backlog" | "in_progress" | "done";
export type TicketPriority = "p0" | "p1" | "p2" | "p3";

export interface MobilizationTicket {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: TicketStatus;
  priority: TicketPriority;
  requestedBudgetUsd?: number;
  votes: number;
  createdAt: Date;
  createdByUserId: string;
  createdByName: string;
}

export interface LibraryCollection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  createdByUserId: string;
  createdByName: string;
}

export interface LibraryAssetVersion {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  objectUrl?: string; // MVP: local object URL for preview (non-persistent)
  textContent?: string; // MVP: for small text/markdown files only
  notes?: string;
  createdAt: Date;
  createdByUserId: string;
  createdByName: string;
}

export interface LibraryAsset {
  id: string;
  collectionId: string;
  title: string;
  tags: string[];
  createdAt: Date;
  createdByUserId: string;
  createdByName: string;
  versions: LibraryAssetVersion[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  charter: string;
  isPublic: boolean;
  creatorId: string;
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
  governanceRules: GovernanceRule[];
  updates: GroupUpdate[];
  tickets: MobilizationTicket[];
  libraryCollections: LibraryCollection[];
  libraryAssets: LibraryAsset[];
}

interface AppState {
  currentUser: Member | null;
  groups: Group[];
  currentGroup: Group | null;
  currentChannel: string;
  joinedGroupIds: string[];
  tokenHoldings: Record<string, number>; // groupId -> tokens held
  
  // Actions
  setCurrentUser: (user: Member) => void;
  createGroup: (group: Omit<Group, "id" | "creatorId" | "createdAt" | "priceHistory" | "members" | "messages" | "proposals">) => Group;
  setCurrentGroup: (groupId: string) => void;
  setCurrentChannel: (channel: string) => void;
  addMessage: (groupId: string, message: Omit<Message, "id" | "timestamp">) => void;
  buyTokens: (groupId: string, amount: number) => void;
  createProposal: (groupId: string, proposal: Omit<Proposal, "id" | "status" | "votesFor" | "votesAgainst">) => void;
  addGroupUpdate: (groupId: string, update: Omit<GroupUpdate, "id" | "authorId" | "authorName" | "createdAt">) => void;
  createTicket: (groupId: string, ticket: Omit<MobilizationTicket, "id" | "votes" | "createdAt" | "createdByUserId" | "createdByName">) => void;
  moveTicket: (groupId: string, ticketId: string, status: TicketStatus) => void;
  voteTicket: (groupId: string, ticketId: string) => void;
  createLibraryCollection: (groupId: string, collection: Omit<LibraryCollection, "id" | "createdAt" | "createdByUserId" | "createdByName">) => void;
  addFilesToLibraryCollection: (groupId: string, collectionId: string, files: File[], options?: { tags?: string[] }) => Promise<void>;
  addLibraryAssetVersion: (groupId: string, assetId: string, file: File, options?: { notes?: string }) => Promise<void>;
  vote: (groupId: string, proposalId: string, support: boolean) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  isMember: (groupId: string) => boolean;
  getHoldings: (groupId: string) => number;
}

const isProbablyText = (mimeType: string, fileName: string) => {
  if (mimeType.startsWith("text/")) return true;
  const lower = fileName.toLowerCase();
  return lower.endsWith(".md") || lower.endsWith(".txt") || lower.endsWith(".csv") || lower.endsWith(".json");
};

const readFileAsText = (file: File, maxChars: number) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      resolve(text.length > maxChars ? text.slice(0, maxChars) : text);
    };
    reader.readAsText(file);
  });

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
    creatorId: "u1",
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
    governanceRules: [
      { id: "r1", title: "Treasury spend requires a proposal", description: "Any spend over $1,000 must pass governance voting.", createdAt: new Date("2024-06-15") },
      { id: "r2", title: "Voting power is token-weighted", description: "1 token = 1 vote. Votes are snapshotted at proposal creation time (demo).", createdAt: new Date("2024-06-15") },
      { id: "r3", title: "Be constructive", description: "Assume good faith. Critique ideas, not people.", createdAt: new Date("2024-06-15") },
    ],
    updates: [
      {
        id: "up1",
        title: "Garden Mapping MVP (WIP)",
        content: "We shipped the first clickable map + data schema. Next: import/export and neighborhood “needs” overlays.",
        tags: ["projects", "wip"],
        authorId: "u3",
        authorName: "Jordan Kim",
        createdAt: new Date(Date.now() - 86400000 * 2),
        isPublic: true,
      },
      {
        id: "up2",
        title: "Solar Toolkit Docs Sprint",
        content: "Looking for reviewers on the installation guide + diagrams. If you can test on a Raspberry Pi, jump in.",
        tags: ["docs"],
        authorId: "u2",
        authorName: "Alex Rivera",
        createdAt: new Date(Date.now() - 86400000 * 6),
        isPublic: true,
      },
    ],
    tickets: [
      {
        id: "t1",
        title: "Ship Garden Mapping v0.1",
        description: "Clickable map + import/export + neighborhood needs overlay. Define a simple contribution guide for volunteers.",
        tags: ["projects", "wip"],
        status: "in_progress",
        priority: "p1",
        requestedBudgetUsd: 2500,
        votes: 1800,
        createdAt: new Date(Date.now() - 86400000 * 7),
        createdByUserId: "u3",
        createdByName: "Jordan Kim",
      },
      {
        id: "t2",
        title: "Fund Solar Toolkit doc sprint",
        description: "Pay bounties for tests on Raspberry Pi + diagrams. Publish install guide v1.",
        tags: ["docs", "bounty"],
        status: "backlog",
        priority: "p2",
        requestedBudgetUsd: 1500,
        votes: 950,
        createdAt: new Date(Date.now() - 86400000 * 10),
        createdByUserId: "u2",
        createdByName: "Alex Rivera",
      },
      {
        id: "t3",
        title: "Set a monthly treasury cadence",
        description: "Create a lightweight monthly cycle: propose tickets → prioritize → fund top N → retro.",
        tags: ["process"],
        status: "backlog",
        priority: "p3",
        votes: 420,
        createdAt: new Date(Date.now() - 86400000 * 14),
        createdByUserId: "u1",
        createdByName: "Maya Chen",
      },
      {
        id: "t4",
        title: "Community garden toolkit proposal",
        description: "Draft a spec + deliverables for the garden toolkit; define acceptance criteria and timeline.",
        tags: ["treasure", "planning"],
        status: "done",
        priority: "p2",
        votes: 610,
        createdAt: new Date(Date.now() - 86400000 * 20),
        createdByUserId: "u1",
        createdByName: "Maya Chen",
      },
    ],
    libraryCollections: [
      {
        id: "c1",
        name: "WIP Assets",
        description: "Docs + media for current projects. Upload new versions as you iterate.",
        isPublic: true,
        createdAt: new Date("2024-06-15"),
        createdByUserId: "u1",
        createdByName: "Maya Chen",
      },
    ],
    libraryAssets: [],
  },
  {
    id: "2",
    name: "Weird Catholicism",
    description: "Exploring the intersection of traditional faith and postmodern culture.",
    charter: "A space for those who find meaning in ancient traditions while living in the digital age. We discuss theology, art, architecture, and the search for the sacred in a secular world.",
    isPublic: true,
    creatorId: "u1",
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
    governanceRules: [
      { id: "r1", title: "Cite sources", description: "If you're making a historical claim, link the text when possible.", createdAt: new Date("2024-09-01") },
      { id: "r2", title: "No dunking", description: "Discuss traditions respectfully; avoid pile-ons.", createdAt: new Date("2024-09-01") },
    ],
    updates: [],
    tickets: [],
    libraryCollections: [],
    libraryAssets: [],
  },
  {
    id: "3",
    name: "AI Alignment Collective",
    description: "Independent researchers working on AI safety outside institutional constraints.",
    charter: "We believe AI alignment research is too important to be siloed in a few organizations. Our collective funds independent research, hosts reading groups, and builds tools to democratize safety work.",
    isPublic: false,
    creatorId: "u1",
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
    governanceRules: [
      { id: "r1", title: "No sensitive data", description: "Do not share private logs or proprietary model weights in chat.", createdAt: new Date("2024-03-10") },
      { id: "r2", title: "Grant decisions via vote", description: "All grants require a passed proposal before funds move.", createdAt: new Date("2024-03-10") },
    ],
    updates: [],
    tickets: [],
    libraryCollections: [],
    libraryAssets: [],
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
  joinedGroupIds: [], // Demo: start as guest; join is separate from token ownership
  tokenHoldings: { "1": 1000 }, // Demo: user holds 1,000 SOLAR

  setCurrentUser: (user) => set({ currentUser: user }),

  createGroup: (groupData) => {
    const user = get().currentUser!;
    const groupId = Math.random().toString(36).substr(2, 9);
    
    // Creator is automatically a founder member
    const creatorMember: Member = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      reputation: user.reputation,
      role: "founder",
      joinedAt: new Date(),
      tokensHeld: 0,
    };
    
    const newGroup: Group = {
      ...groupData,
      id: groupId,
      createdAt: new Date(),
      creatorId: user.id,
      priceHistory: generatePriceHistory(0.01),
      members: [creatorMember], // Creator starts as a member
      messages: [],
      proposals: [],
      governanceRules: [],
      updates: [],
      tickets: [],
      libraryCollections: [],
      libraryAssets: [],
      memberCount: 1, // Start with 1 member (creator)
    };
    
    // Add group to state AND mark creator as joined
    set((state) => ({ 
      groups: [...state.groups, newGroup],
      joinedGroupIds: [...state.joinedGroupIds, groupId], // Auto-join creator
    }));
    
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
      const userId = state.currentUser?.id;
      const prevHoldings = state.tokenHoldings[groupId] || 0;
      const nextHoldings = prevHoldings + amount;

      // Simple bonding curve: price increases with supply
      const newSupply = group.tokenSupply + amount;
      const avgPrice = group.tokenPrice * (1 + amount / group.tokenSupply * 0.1);
      const cost = amount * avgPrice;
      const fee = cost * 0.02; // 2% fee to treasury

      const nextPrice = group.tokenPrice * (1 + amount / group.tokenSupply * 0.05);

      const updatedGroup = {
        ...group,
        tokenSupply: newSupply,
        tokenPrice: nextPrice,
        treasuryBalance: group.treasuryBalance + fee,
        priceHistory: [
          ...group.priceHistory,
          { time: Date.now(), price: nextPrice },
        ],
        members: userId
          ? group.members.map((m) => (m.id === userId ? { ...m, tokensHeld: nextHoldings } : m))
          : group.members,
      };

      return {
        groups: state.groups.map((g) => (g.id === groupId ? updatedGroup : g)),
        currentGroup: state.currentGroup?.id === groupId ? updatedGroup : state.currentGroup,
        tokenHoldings: {
          ...state.tokenHoldings,
          [groupId]: nextHoldings,
        },
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

  addGroupUpdate: (groupId, update) => {
    const user = get().currentUser;
    if (!user) return;
    const newUpdate: GroupUpdate = {
      ...update,
      id: Math.random().toString(36).substr(2, 9),
      authorId: user.id,
      authorName: user.name,
      createdAt: new Date(),
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, updates: [newUpdate, ...g.updates] } : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? { ...state.currentGroup, updates: [newUpdate, ...state.currentGroup.updates] }
          : state.currentGroup,
    }));
  },

  createTicket: (groupId, ticket) => {
    const user = get().currentUser;
    if (!user) return;
    const newTicket: MobilizationTicket = {
      ...ticket,
      id: Math.random().toString(36).substr(2, 9),
      votes: 0,
      createdAt: new Date(),
      createdByUserId: user.id,
      createdByName: user.name,
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, tickets: [newTicket, ...g.tickets] } : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? { ...state.currentGroup, tickets: [newTicket, ...state.currentGroup.tickets] }
          : state.currentGroup,
    }));
  },

  moveTicket: (groupId, ticketId, status) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, tickets: g.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)) }
          : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              tickets: state.currentGroup.tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)),
            }
          : state.currentGroup,
    }));
  },

  voteTicket: (groupId, ticketId) => {
    const votes = get().tokenHoldings[groupId] || 0;
    const weight = Math.max(1, Math.floor(votes)); // demo: at least 1 vote
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, tickets: g.tickets.map((t) => (t.id === ticketId ? { ...t, votes: t.votes + weight } : t)) }
          : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              tickets: state.currentGroup.tickets.map((t) => (t.id === ticketId ? { ...t, votes: t.votes + weight } : t)),
            }
          : state.currentGroup,
    }));
  },

  createLibraryCollection: (groupId, collection) => {
    const user = get().currentUser;
    if (!user) return;
    const newCollection: LibraryCollection = {
      ...collection,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      createdByUserId: user.id,
      createdByName: user.name,
    };
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, libraryCollections: [newCollection, ...g.libraryCollections] } : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? { ...state.currentGroup, libraryCollections: [newCollection, ...state.currentGroup.libraryCollections] }
          : state.currentGroup,
    }));
  },

  addFilesToLibraryCollection: async (groupId, collectionId, files, options) => {
    const user = get().currentUser;
    if (!user) return;
    const tags = options?.tags ?? [];

    const newAssets: LibraryAsset[] = [];
    for (const file of files) {
      const versionId = Math.random().toString(36).substr(2, 9);
      const objectUrl = URL.createObjectURL(file);
      const shouldReadText = isProbablyText(file.type || "", file.name) && file.size <= 300_000;
      const textContent = shouldReadText ? await readFileAsText(file, 200_000) : undefined;
      const version: LibraryAssetVersion = {
        id: versionId,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        objectUrl,
        textContent,
        createdAt: new Date(),
        createdByUserId: user.id,
        createdByName: user.name,
      };

      const asset: LibraryAsset = {
        id: Math.random().toString(36).substr(2, 9),
        collectionId,
        title: file.name,
        tags,
        createdAt: new Date(),
        createdByUserId: user.id,
        createdByName: user.name,
        versions: [version],
      };
      newAssets.push(asset);
    }

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, libraryAssets: [...newAssets, ...g.libraryAssets] } : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? { ...state.currentGroup, libraryAssets: [...newAssets, ...state.currentGroup.libraryAssets] }
          : state.currentGroup,
    }));
  },

  addLibraryAssetVersion: async (groupId, assetId, file, options) => {
    const user = get().currentUser;
    if (!user) return;
    const objectUrl = URL.createObjectURL(file);
    const shouldReadText = isProbablyText(file.type || "", file.name) && file.size <= 300_000;
    const textContent = shouldReadText ? await readFileAsText(file, 200_000) : undefined;

    const newVersion: LibraryAssetVersion = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      objectUrl,
      textContent,
      notes: options?.notes,
      createdAt: new Date(),
      createdByUserId: user.id,
      createdByName: user.name,
    };

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              libraryAssets: g.libraryAssets.map((a) =>
                a.id === assetId ? { ...a, versions: [newVersion, ...a.versions] } : a
              ),
            }
          : g
      ),
      currentGroup:
        state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              libraryAssets: state.currentGroup.libraryAssets.map((a) =>
                a.id === assetId ? { ...a, versions: [newVersion, ...a.versions] } : a
              ),
            }
          : state.currentGroup,
    }));
  },

  vote: (groupId, proposalId, support) => {
    const user = get().currentUser;
    if (!user) return;
    const votes = get().tokenHoldings[groupId] || 0;
    if (votes <= 0) return;

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              proposals: g.proposals.map((p) =>
                p.id === proposalId
                  ? {
                      ...p,
                      votesFor: support ? p.votesFor + votes : p.votesFor,
                      votesAgainst: !support ? p.votesAgainst + votes : p.votesAgainst,
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
                      votesFor: support ? p.votesFor + votes : p.votesFor,
                      votesAgainst: !support ? p.votesAgainst + votes : p.votesAgainst,
                    }
                  : p
              ),
            }
          : state.currentGroup,
    }));
  },

  joinGroup: (groupId) => {
    const group = get().groups.find((g) => g.id === groupId);
    const user = get().currentUser;
    if (!user) return;
    if (!group) return;
    const canJoin = group.isPublic || group.creatorId === user.id;
    if (!canJoin) return; // Private groups are invite-only (creator can always join)
    
    set((state) => ({
      joinedGroupIds: state.joinedGroupIds.includes(groupId) 
        ? state.joinedGroupIds 
        : [...state.joinedGroupIds, groupId],
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        const alreadyMember = g.members.some((m) => m.id === user.id);
        if (alreadyMember) return g;
        return {
          ...g,
          members: [
            ...g.members,
            {
              ...user,
              joinedAt: new Date(),
              role: "newcomer",
              tokensHeld: state.tokenHoldings[groupId] || 0,
            },
          ],
          memberCount: g.memberCount + 1,
        };
      }),
      currentGroup:
        state.currentGroup?.id === groupId
          ? (() => {
              const alreadyMember = state.currentGroup.members.some((m) => m.id === user.id);
              if (alreadyMember) return state.currentGroup;
              return {
                ...state.currentGroup,
                members: [
                  ...state.currentGroup.members,
                  {
                    ...user,
                    joinedAt: new Date(),
                    role: "newcomer",
                    tokensHeld: state.tokenHoldings[groupId] || 0,
                  },
                ],
                memberCount: state.currentGroup.memberCount + 1,
              };
            })()
          : state.currentGroup,
    }));
  },

  leaveGroup: (groupId) => {
    const user = get().currentUser;
    if (!user) return;
    set((state) => ({
      joinedGroupIds: state.joinedGroupIds.filter((id) => id !== groupId),
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        const wasMember = g.members.some((m) => m.id === user.id);
        if (!wasMember) return g;
        return {
          ...g,
          members: g.members.filter((m) => m.id !== user.id),
          memberCount: Math.max(0, g.memberCount - 1),
        };
      }),
      currentGroup:
        state.currentGroup?.id === groupId
          ? {
              ...state.currentGroup,
              members: state.currentGroup.members.filter((m) => m.id !== user.id),
              memberCount: Math.max(0, state.currentGroup.memberCount - 1),
            }
          : state.currentGroup,
    }));
  },

  isMember: (groupId) => {
    return get().joinedGroupIds.includes(groupId);
  },

  getHoldings: (groupId) => {
    return get().tokenHoldings[groupId] || 0;
  },
}));
