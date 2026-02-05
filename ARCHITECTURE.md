# CommunityCoin Architecture Document

> A decentralized platform for online communities to mobilize through encrypted communication, tokenized membership, and collective governance.

**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Vision & Principles](#vision--principles)
2. [System Overview](#system-overview)
3. [Technology Stack](#technology-stack)
4. [Core Components](#core-components)
5. [Data Architecture](#data-architecture)
6. [Smart Contracts](#smart-contracts)
7. [Security Model](#security-model)
8. [Scaling Strategy](#scaling-strategy)
9. [Implementation Phases](#implementation-phases)
10. [Infrastructure & DevOps](#infrastructure--devops)

---

## Vision & Principles

### Core Thesis

Online communities have immense latent energy but lack the infrastructure to mobilize. CommunityCoin provides:

- **Encrypted spaces** for authentic discussion (Dark Forest protection)
- **Tokenized membership** for skin-in-the-game alignment
- **Shared treasuries** for collective resource deployment
- **Governance tools** for democratic decision-making

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Decentralization where it matters** | Tokens, voting, and messages are trustless; indexing is centralized for UX |
| **Privacy by default** | E2E encryption for all group communication |
| **Progressive decentralization** | Start pragmatic, decentralize as we scale |
| **Verify, don't trust** | All cached data links back to on-chain/IPFS proofs |
| **Composability** | Open protocols, open contracts, forkable |

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Web App   │  │ Mobile App  │  │   CLI       │  │  3rd Party  │    │
│  │  (Next.js)  │  │   (Future)  │  │  (Future)   │  │   Clients   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          └────────────────┴────────────────┴────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌───────────────┐  ┌──────────────┐  ┌─────────────┐
        │   API Layer   │  │    XMTP      │  │  Blockchain │
        │   (Supabase)  │  │   Network    │  │   (Polygon) │
        │               │  │              │  │             │
        │  • REST/GQL   │  │  • E2E Chat  │  │  • Tokens   │
        │  • Realtime   │  │  • Groups    │  │  • Voting   │
        │  • Auth proxy │  │  • Files     │  │  • Treasury │
        └───────┬───────┘  └──────────────┘  └──────┬──────┘
                │                                    │
                │          ┌─────────────┐          │
                └─────────►│   Indexer   │◄─────────┘
                           │   Service   │
                           └──────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
             ┌──────────┐  ┌──────────┐  ┌──────────┐
             │ Postgres │  │   IPFS   │  │  Redis   │
             │(Supabase)│  │ (Pinata) │  │ (Cache)  │
             └──────────┘  └──────────┘  └──────────┘
```

### Data Flow Principles

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SOURCE OF TRUTH                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   BLOCKCHAIN (Immutable, Trustless)                                     │
│   ├── Token balances & transfers                                        │
│   ├── Governance votes & proposals                                      │
│   ├── Treasury transactions                                             │
│   └── Group creation events                                             │
│                                                                          │
│   XMTP NETWORK (E2E Encrypted, Decentralized)                           │
│   ├── Group messages                                                    │
│   ├── Direct messages                                                   │
│   └── Encrypted file references                                         │
│                                                                          │
│   IPFS (Content-Addressed, Verifiable)                                  │
│   ├── Group charters                                                    │
│   ├── Proposal descriptions                                             │
│   ├── Library assets                                                    │
│   └── User avatars / group images                                       │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                        DERIVED / CACHED                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   SUPABASE (Fast Reads, Rebuildable)                                    │
│   ├── Indexed group metadata                                            │
│   ├── Cached token prices & supplies                                    │
│   ├── Search indices                                                    │
│   ├── Activity feeds                                                    │
│   └── User preferences                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | **Next.js 14+** (App Router) | SSR, excellent DX, Vercel deployment |
| Styling | **Tailwind CSS** | Rapid iteration, consistent design system |
| State | **Zustand** | Lightweight, works with SSR |
| Wallet | **Privy** | Best-in-class onboarding (email + wallet) |
| Data Fetching | **TanStack Query** | Caching, optimistic updates, realtime sync |
| Animation | **Framer Motion** | Smooth, performant animations |

### Backend Services

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Database | **Supabase (Postgres)** | Realtime, Row Level Security, Edge Functions |
| Caching | **Upstash Redis** | Serverless, global edge caching |
| File Storage | **IPFS via Pinata** | Decentralized, content-addressed |
| Search | **Supabase Full-Text** → **Typesense** (scale) | Fast, typo-tolerant search |

### Web3 Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| L2 Chain | **Polygon** | Low fees, EVM compatible, mature ecosystem |
| Contracts | **Solidity + Foundry** | Industry standard, excellent tooling |
| Indexing | **Custom + Alchemy webhooks** → **The Graph** (scale) | Start simple, decentralize later |
| Messaging | **XMTP** | Web3-native E2E encryption, wallet auth |
| Voting | **Snapshot + Governor** | Gasless voting, on-chain execution |

### Infrastructure

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Hosting | **Vercel** | Zero-config, edge network, preview deploys |
| Monitoring | **Sentry + Datadog** | Error tracking, APM |
| Analytics | **PostHog** | Privacy-friendly, self-hostable |
| CI/CD | **GitHub Actions** | Native integration, parallel jobs |

---

## Core Components

### 1. Authentication & Identity

```
┌─────────────────────────────────────────────────────────────────┐
│                      IDENTITY LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐                                              │
│   │    Privy     │  Primary auth provider                       │
│   │              │  • Email/social login → embedded wallet      │
│   │              │  • External wallet connection                │
│   │              │  • MFA support                               │
│   └──────┬───────┘                                              │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │   Wallet     │  Canonical identity                          │
│   │   Address    │  • Used for token ownership                  │
│   │              │  • Used for XMTP authentication              │
│   │              │  • Used for voting weight                    │
│   └──────┬───────┘                                              │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────┐                                              │
│   │   Profile    │  Optional metadata (Supabase)                │
│   │   (Optional) │  • Display name                              │
│   │              │  • Avatar (IPFS CID)                         │
│   │              │  • Bio, links                                │
│   └──────────────┘                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Auth Flow:**

```typescript
// 1. User authenticates with Privy (email or wallet)
const { login, authenticated, user } = usePrivy();

// 2. Get wallet address (embedded or external)
const { wallets } = useWallets();
const address = wallets[0]?.address;

// 3. Initialize XMTP with wallet signer
const xmtp = await Client.create(signer, { env: 'production' });

// 4. User is now authenticated across all systems:
//    - Supabase (via Privy JWT)
//    - XMTP (via wallet signature)
//    - Blockchain (via wallet)
```

### 2. Encrypted Messaging (XMTP)

```
┌─────────────────────────────────────────────────────────────────┐
│                      MESSAGING LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    XMTP Network                          │   │
│   │                                                          │   │
│   │   • Messages encrypted client-side                       │   │
│   │   • Stored on XMTP nodes (encrypted)                     │   │
│   │   • Decrypted only by conversation members               │   │
│   │   • Server never sees plaintext                          │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Message Types:                                                 │
│   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│   │  Text Message  │  │ File Reference │  │  Reaction      │   │
│   │                │  │                │  │                │   │
│   │  { type,       │  │  { type,       │  │  { type,       │   │
│   │    content }   │  │    ipfsCid,    │  │    emoji,      │   │
│   │                │  │    name,       │  │    messageId } │   │
│   │                │  │    size }      │  │                │   │
│   └────────────────┘  └────────────────┘  └────────────────┘   │
│                                                                  │
│   Group Structure:                                               │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Group Conversation                                      │   │
│   │  ├── metadata: { groupId, channel, name }               │   │
│   │  ├── members: [wallet1, wallet2, ...]                   │   │
│   │  └── permissions: { addMembers, removeMembers, ... }    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Group Chat Implementation:**

```typescript
// Group conversation per channel
interface GroupChannel {
  groupId: string;      // On-chain group ID
  channel: string;      // "general", "governance", etc.
  xmtpConversation: Conversation;
}

// Initialize group chat
async function initGroupChat(groupId: string, memberAddresses: string[]) {
  const conversation = await xmtp.conversations.newGroup(
    memberAddresses,
    {
      groupName: `${groupId}/general`,
      groupDescription: 'Main channel',
      // Custom permissions based on token holdings
      permissionPolicy: {
        addMemberPolicy: 'admin',      // Only admins add members
        removeMemberPolicy: 'admin',
        updateMetadataPolicy: 'admin',
      }
    }
  );
  
  return conversation;
}

// Sync membership with token holdings
async function syncMembership(groupId: string, conversation: Conversation) {
  const tokenHolders = await getTokenHolders(groupId); // From indexer
  const currentMembers = await conversation.members();
  
  // Add new token holders
  const toAdd = tokenHolders.filter(h => !currentMembers.includes(h));
  await conversation.addMembers(toAdd);
  
  // Note: Removing members who sold tokens is a policy decision
  // Some groups may want to keep history access
}
```

### 3. Token Economics

```
┌─────────────────────────────────────────────────────────────────┐
│                      TOKEN LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                 CommunityToken.sol                       │   │
│   │                                                          │   │
│   │   ERC-20 with Bonding Curve                             │   │
│   │   ├── buy(amount) → mint tokens, increase price         │   │
│   │   ├── sell(amount) → burn tokens, decrease price        │   │
│   │   └── 2% fee on trades → treasury                       │   │
│   │                                                          │   │
│   │   Price Formula (Bancor-style):                         │   │
│   │   price = reserveBalance / (supply * reserveRatio)      │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                 Treasury.sol                             │   │
│   │                                                          │   │
│   │   Gnosis Safe + Governor Module                         │   │
│   │   ├── Receives trading fees automatically               │   │
│   │   ├── Controlled by token-weighted governance           │   │
│   │   └── Executes passed proposals                         │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Token Flow:                                                    │
│                                                                  │
│   User ──► buy() ──► Token Contract ──► 2% fee ──► Treasury    │
│     │                      │                                     │
│     │                      ▼                                     │
│     │               Tokens minted                                │
│     │               Price increases                              │
│     │                                                            │
│     ◄── sell() ◄── Token Contract                               │
│               Tokens burned                                      │
│               ETH returned (minus slippage)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Governance

```
┌─────────────────────────────────────────────────────────────────┐
│                      GOVERNANCE LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Two-Tier Voting System:                                        │
│                                                                  │
│   ┌─────────────────────┐      ┌─────────────────────┐         │
│   │   SNAPSHOT          │      │   ON-CHAIN          │         │
│   │   (Gasless)         │      │   (Binding)         │         │
│   │                     │      │                     │         │
│   │   • Signal votes    │      │   • Treasury spends │         │
│   │   • Temperature     │ ───► │   • Contract calls  │         │
│   │     checks          │      │   • Parameter       │         │
│   │   • Charter changes │      │     changes         │         │
│   │                     │      │                     │         │
│   └─────────────────────┘      └─────────────────────┘         │
│                                                                  │
│   Proposal Lifecycle:                                            │
│                                                                  │
│   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐   │
│   │Draft │───►│Active│───►│Voting│───►│Queue │───►│Execute│   │
│   └──────┘    └──────┘    └──────┘    └──────┘    └──────┘   │
│       │                        │            │                    │
│       │                        │            │                    │
│       ▼                        ▼            ▼                    │
│   ┌──────┐                ┌──────┐    ┌──────┐                 │
│   │Cancel│                │Reject│    │Cancel│                 │
│   └──────┘                └──────┘    └──────┘                 │
│                                                                  │
│   Voting Power:                                                  │
│   • 1 token = 1 vote (for public groups)                        │
│   • Snapshot at proposal creation (prevent flash loans)         │
│   • Delegation supported                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Supabase Schema

```sql
-- ============================================================
-- CORE TABLES
-- ============================================================

-- Groups (indexed from on-chain + IPFS)
create table groups (
  id uuid primary key default gen_random_uuid(),
  
  -- On-chain references
  contract_address text unique not null,
  chain_id int not null default 137, -- Polygon mainnet
  created_tx_hash text not null,
  created_block bigint not null,
  creator_address text not null,
  
  -- IPFS references
  charter_cid text,  -- Points to IPFS JSON
  image_cid text,    -- Points to IPFS image
  
  -- Cached metadata (from IPFS)
  name text not null,
  description text,
  
  -- Cached on-chain state
  token_symbol text not null,
  token_price numeric not null default 0.01,
  total_supply numeric not null default 0,
  reserve_balance numeric not null default 0,
  treasury_balance numeric not null default 0,
  
  -- Computed
  member_count int not null default 0,
  market_cap numeric generated always as (token_price * total_supply) stored,
  
  -- Visibility
  is_public boolean not null default true,
  
  -- Indexer metadata
  last_indexed_block bigint,
  last_indexed_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Indexes for common queries
create index groups_market_cap_idx on groups(market_cap desc);
create index groups_member_count_idx on groups(member_count desc);
create index groups_created_at_idx on groups(created_at desc);
create index groups_search_idx on groups 
  using gin(to_tsvector('english', name || ' ' || coalesce(description, '')));


-- Members (token holders)
create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  wallet_address text not null,
  
  -- Cached from contract
  token_balance numeric not null default 0,
  
  -- Derived from activity
  reputation int not null default 0,
  role text not null default 'newcomer', -- founder, elder, member, newcomer
  
  -- Metadata
  joined_at timestamptz default now(),
  last_active_at timestamptz,
  
  unique(group_id, wallet_address)
);

create index members_group_idx on members(group_id);
create index members_balance_idx on members(token_balance desc);


-- Proposals (indexed from Snapshot + on-chain)
create table proposals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  -- External references
  snapshot_id text,         -- Snapshot proposal ID
  onchain_proposal_id text, -- On-chain proposal ID (if applicable)
  
  -- IPFS reference
  content_cid text not null, -- Full proposal on IPFS
  
  -- Cached content
  title text not null,
  summary text,
  category text not null, -- treasury, governance, charter, other
  
  -- Proposer
  proposer_address text not null,
  
  -- State
  status text not null default 'active', -- active, passed, rejected, executed, cancelled
  votes_for numeric not null default 0,
  votes_against numeric not null default 0,
  votes_abstain numeric not null default 0,
  
  -- Timing
  voting_starts_at timestamptz not null,
  voting_ends_at timestamptz not null,
  executed_at timestamptz,
  executed_tx_hash text,
  
  created_at timestamptz default now()
);

create index proposals_group_idx on proposals(group_id);
create index proposals_status_idx on proposals(status);


-- Activity Feed (derived from on-chain events)
create table activity (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  -- Event details
  event_type text not null, -- token_buy, token_sell, proposal_created, proposal_executed, member_joined
  actor_address text not null,
  
  -- Flexible payload
  metadata jsonb not null default '{}',
  
  -- On-chain proof
  tx_hash text,
  block_number bigint,
  log_index int,
  
  created_at timestamptz default now()
);

create index activity_group_idx on activity(group_id, created_at desc);
create index activity_actor_idx on activity(actor_address, created_at desc);


-- ============================================================
-- USER TABLES (Not on-chain, that's okay)
-- ============================================================

-- User profiles (optional, not required)
create table profiles (
  wallet_address text primary key,
  
  -- Display info
  display_name text,
  bio text,
  avatar_cid text,
  
  -- Links
  twitter_handle text,
  farcaster_fid text,
  website_url text,
  
  -- Preferences
  notification_email text,
  notification_settings jsonb default '{}',
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- User group memberships (tracks which groups user has "joined" in UI)
-- Note: Actual token ownership is on-chain; this is for UI state
create table user_group_memberships (
  wallet_address text not null,
  group_id uuid references groups(id) on delete cascade,
  
  -- UI preferences per group
  notifications_enabled boolean default true,
  pinned boolean default false,
  last_read_at timestamptz,
  
  joined_at timestamptz default now(),
  
  primary key (wallet_address, group_id)
);


-- ============================================================
-- CONTENT TABLES (Cached from IPFS)
-- ============================================================

-- Library collections
create table library_collections (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  name text not null,
  description text,
  is_public boolean default true,
  
  creator_address text not null,
  created_at timestamptz default now()
);

-- Library assets
create table library_assets (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references library_collections(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  
  title text not null,
  tags text[] default '{}',
  
  -- Latest version info (cached)
  current_cid text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  
  creator_address text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Asset versions (for version history)
create table library_asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references library_assets(id) on delete cascade,
  
  cid text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  notes text,
  
  creator_address text not null,
  created_at timestamptz default now()
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table groups enable row level security;
alter table members enable row level security;
alter table proposals enable row level security;
alter table activity enable row level security;
alter table profiles enable row level security;
alter table user_group_memberships enable row level security;
alter table library_collections enable row level security;
alter table library_assets enable row level security;

-- Public groups are readable by anyone
create policy "Public groups are viewable by everyone"
  on groups for select
  using (is_public = true);

-- Members are viewable by everyone (public data)
create policy "Members are viewable by everyone"
  on members for select
  using (true);

-- Profiles are viewable by everyone
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (wallet_address = auth.jwt() ->> 'wallet_address');

-- ... more policies as needed
```

### IPFS Content Structures

```typescript
// Charter stored on IPFS
interface CharterContent {
  version: "1.0";
  name: string;
  description: string;
  charter: string;           // Full charter text (markdown)
  mission: string;           // One-line mission
  values: string[];          // Core values
  links: {
    website?: string;
    twitter?: string;
    discord?: string;
  };
  governance: {
    rules: GovernanceRule[];
    votingPeriod: number;    // In seconds
    quorum: number;          // Percentage (0-100)
    threshold: number;       // Percentage to pass (0-100)
  };
  createdAt: string;         // ISO timestamp
  updatedAt: string;
}

// Proposal content stored on IPFS
interface ProposalContent {
  version: "1.0";
  title: string;
  summary: string;
  description: string;       // Full description (markdown)
  category: "treasury" | "governance" | "charter" | "other";
  
  // For treasury proposals
  transactions?: {
    to: string;
    value: string;
    data: string;
    description: string;
  }[];
  
  // For charter amendments
  charterChanges?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  
  discussion?: string;       // Link to forum/discussion
  createdAt: string;
}

// Library asset metadata
interface AssetMetadata {
  version: "1.0";
  title: string;
  description?: string;
  tags: string[];
  mimeType: string;
  sizeBytes: number;
  createdBy: string;         // Wallet address
  createdAt: string;
}
```

---

## Smart Contracts

### Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CONTRACT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                 GroupFactory.sol                         │   │
│   │                                                          │   │
│   │   • Deploys new CommunityToken + Treasury pairs         │   │
│   │   • Maintains registry of all groups                     │   │
│   │   • Emits GroupCreated events for indexing              │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          │ creates                               │
│            ┌─────────────┴─────────────┐                        │
│            ▼                           ▼                         │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │ CommunityToken  │         │    Treasury     │              │
│   │     (ERC-20)    │         │  (Gnosis Safe)  │              │
│   │                 │         │                 │              │
│   │ • Bonding curve │◄───────►│ • Receives fees │              │
│   │ • Trading logic │         │ • Governance    │              │
│   │ • Fee routing   │         │ • Execution     │              │
│   └─────────────────┘         └─────────────────┘              │
│                                        │                        │
│                                        │ controlled by          │
│                                        ▼                        │
│                              ┌─────────────────┐               │
│                              │    Governor     │               │
│                              │   (OZ-based)    │               │
│                              │                 │               │
│                              │ • Proposals     │               │
│                              │ • Voting        │               │
│                              │ • Execution     │               │
│                              └─────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Contracts

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CommunityToken
 * @notice ERC-20 token with bonding curve pricing
 */
contract CommunityToken is ERC20, ReentrancyGuard {
    // Bonding curve parameters
    uint256 public reserveBalance;
    uint32 public constant RESERVE_RATIO = 500000; // 50% in PPM
    
    // Fee configuration
    uint256 public constant TREASURY_FEE_BPS = 200; // 2%
    address public immutable treasury;
    
    // Group metadata
    string public charterCid;
    bool public immutable isPublic;
    
    // Events
    event TokensPurchased(
        address indexed buyer,
        uint256 ethIn,
        uint256 tokensOut,
        uint256 newPrice
    );
    event TokensSold(
        address indexed seller,
        uint256 tokensIn,
        uint256 ethOut,
        uint256 newPrice
    );
    event CharterUpdated(string oldCid, string newCid);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _charterCid,
        bool _isPublic,
        address _treasury,
        address _creator
    ) ERC20(_name, _symbol) {
        charterCid = _charterCid;
        isPublic = _isPublic;
        treasury = _treasury;
        
        // Mint initial supply to creator
        _mint(_creator, 1000 * 10**18);
        reserveBalance = 0.01 ether; // Initial reserve
    }
    
    /**
     * @notice Buy tokens with ETH
     */
    function buy() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH");
        
        // Calculate fee
        uint256 fee = (msg.value * TREASURY_FEE_BPS) / 10000;
        uint256 purchaseAmount = msg.value - fee;
        
        // Calculate tokens to mint using bonding curve
        uint256 tokensToMint = calculatePurchaseReturn(purchaseAmount);
        require(tokensToMint > 0, "Insufficient purchase");
        
        // Update state
        reserveBalance += purchaseAmount;
        _mint(msg.sender, tokensToMint);
        
        // Send fee to treasury
        (bool sent, ) = treasury.call{value: fee}("");
        require(sent, "Fee transfer failed");
        
        emit TokensPurchased(msg.sender, msg.value, tokensToMint, currentPrice());
    }
    
    /**
     * @notice Sell tokens for ETH
     */
    function sell(uint256 tokenAmount) external nonReentrant {
        require(tokenAmount > 0, "Must sell > 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        
        // Calculate ETH to return using bonding curve
        uint256 ethToReturn = calculateSaleReturn(tokenAmount);
        require(ethToReturn > 0, "Insufficient return");
        require(ethToReturn <= reserveBalance, "Insufficient reserve");
        
        // Update state
        reserveBalance -= ethToReturn;
        _burn(msg.sender, tokenAmount);
        
        // Send ETH to seller
        (bool sent, ) = msg.sender.call{value: ethToReturn}("");
        require(sent, "ETH transfer failed");
        
        emit TokensSold(msg.sender, tokenAmount, ethToReturn, currentPrice());
    }
    
    /**
     * @notice Calculate tokens received for ETH input
     * @dev Uses Bancor formula: tokens = supply * ((1 + ethIn/reserve)^ratio - 1)
     */
    function calculatePurchaseReturn(uint256 ethIn) public view returns (uint256) {
        // Simplified linear approximation for MVP
        // Production: use proper Bancor math library
        uint256 supply = totalSupply();
        if (supply == 0) return ethIn * 100; // Initial price
        
        return (ethIn * supply) / reserveBalance;
    }
    
    /**
     * @notice Calculate ETH received for token input
     */
    function calculateSaleReturn(uint256 tokenAmount) public view returns (uint256) {
        uint256 supply = totalSupply();
        require(supply > 0, "No supply");
        
        return (tokenAmount * reserveBalance) / supply;
    }
    
    /**
     * @notice Current token price in ETH
     */
    function currentPrice() public view returns (uint256) {
        uint256 supply = totalSupply();
        if (supply == 0) return 0.01 ether;
        
        return (reserveBalance * 1e18) / supply;
    }
    
    /**
     * @notice Update charter (governance only)
     */
    function updateCharter(string calldata newCid) external {
        require(msg.sender == treasury, "Only treasury");
        emit CharterUpdated(charterCid, newCid);
        charterCid = newCid;
    }
}


/**
 * @title GroupFactory
 * @notice Factory for deploying new community token + treasury pairs
 */
contract GroupFactory {
    // Registry
    address[] public allGroups;
    mapping(address => bool) public isGroup;
    
    // Events
    event GroupCreated(
        address indexed tokenAddress,
        address indexed treasuryAddress,
        address indexed creator,
        string name,
        string symbol,
        string charterCid,
        bool isPublic
    );
    
    /**
     * @notice Create a new community
     */
    function createGroup(
        string calldata name,
        string calldata symbol,
        string calldata charterCid,
        bool isPublic
    ) external returns (address tokenAddress, address treasuryAddress) {
        // Deploy treasury (simplified - production uses Gnosis Safe)
        Treasury treasury = new Treasury();
        treasuryAddress = address(treasury);
        
        // Deploy token
        CommunityToken token = new CommunityToken(
            name,
            symbol,
            charterCid,
            isPublic,
            treasuryAddress,
            msg.sender
        );
        tokenAddress = address(token);
        
        // Configure treasury
        treasury.initialize(tokenAddress, msg.sender);
        
        // Register
        allGroups.push(tokenAddress);
        isGroup[tokenAddress] = true;
        
        emit GroupCreated(
            tokenAddress,
            treasuryAddress,
            msg.sender,
            name,
            symbol,
            charterCid,
            isPublic
        );
    }
    
    function groupCount() external view returns (uint256) {
        return allGroups.length;
    }
}
```

---

## Security Model

### Threat Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      THREAT MODEL                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ASSETS TO PROTECT:                                             │
│   ├── User funds (tokens, ETH)                                  │
│   ├── Treasury funds                                            │
│   ├── Private messages                                          │
│   ├── User identities (optional pseudonymity)                   │
│   └── Governance integrity                                       │
│                                                                  │
│   THREAT ACTORS:                                                 │
│   ├── External attackers (hackers, scammers)                    │
│   ├── Malicious members (insider threats)                       │
│   ├── Platform operators (us - minimize trust)                  │
│   └── Nation states (for high-value groups)                     │
│                                                                  │
│   ATTACK VECTORS:                                                │
│   ├── Smart contract exploits                                   │
│   ├── Key compromise (wallet theft)                             │
│   ├── Social engineering                                        │
│   ├── Governance attacks (flash loans, vote buying)             │
│   ├── Network-level attacks (DoS, censorship)                   │
│   └── Metadata leakage                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Smart Contracts** | Audits | Trail of Bits / OpenZeppelin audit before mainnet |
| | Formal verification | For critical paths (bonding curve math) |
| | Upgradeability | Proxy pattern with timelock for emergency fixes |
| | Reentrancy protection | OpenZeppelin ReentrancyGuard on all external calls |
| **Messaging** | E2E encryption | XMTP handles encryption; we never see plaintext |
| | Forward secrecy | XMTP's protocol provides this |
| | Metadata minimization | Don't log who talks to whom |
| **Identity** | Pseudonymity by default | Wallet address is primary identity |
| | Optional KYC | For groups that require it |
| | No email required | Privy embedded wallets work without email |
| **Governance** | Snapshot voting | Prevents flash loan attacks |
| | Timelock | 24-48hr delay on treasury actions |
| | Quorum requirements | Minimum participation for validity |
| **Infrastructure** | No message storage | We don't store chat; XMTP does |
| | Encrypted backups | For Supabase data |
| | Rate limiting | Prevent spam/DoS |

### Privacy Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRIVACY MODEL                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   WHAT WE CAN'T SEE (by design):                                │
│   ├── Message contents (E2E encrypted via XMTP)                 │
│   ├── Who is messaging whom (XMTP network handles)              │
│   └── Encrypted files (Lit Protocol token-gating)               │
│                                                                  │
│   WHAT IS PUBLIC (on-chain):                                     │
│   ├── Token holdings (wallet → balance)                         │
│   ├── Votes cast (wallet → proposal → vote)                     │
│   ├── Treasury transactions                                     │
│   └── Group membership (via token ownership)                    │
│                                                                  │
│   WHAT WE COULD SEE (but minimize):                              │
│   ├── IP addresses (mitigate: Tor support, VPN-friendly)        │
│   ├── Access patterns (mitigate: minimal logging)               │
│   └── Group activity levels (mitigate: noise injection)         │
│                                                                  │
│   RECOMMENDATIONS FOR HIGH-RISK GROUPS:                          │
│   ├── Use hardware wallet                                       │
│   ├── Use Tor/VPN                                               │
│   ├── Use unique wallet per group                               │
│   └── Enable private group mode                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Scaling Strategy

### Phase 1: MVP (0 → 1,000 users)

```
Infrastructure:
├── Vercel (frontend)
├── Supabase Free/Pro (database)
├── Polygon Mumbai testnet → Polygon mainnet (contracts)
├── XMTP production (messaging)
└── Pinata free tier (IPFS)

Bottlenecks: None expected
Cost: ~$50/month
```

### Phase 2: Growth (1,000 → 100,000 users)

```
Infrastructure:
├── Vercel Pro (frontend)
├── Supabase Pro + read replicas (database)
├── Upstash Redis (caching)
├── Multiple RPC providers (Alchemy + Infura)
├── Dedicated IPFS pinning (Pinata Pro)
└── CDN for static assets (Cloudflare)

Bottlenecks:
├── Database reads → Add Redis caching
├── RPC rate limits → Multiple providers
├── IPFS gateway speed → Dedicated gateway
└── Search performance → Typesense

Cost: ~$500-2,000/month
```

### Phase 3: Scale (100,000+ users)

```
Infrastructure:
├── Multi-region deployment
├── Supabase Enterprise or self-hosted Postgres
├── The Graph for indexing (decentralized)
├── Own IPFS cluster
├── Message queue for async processing
└── Kubernetes for services

Bottlenecks:
├── Global latency → Edge deployment
├── Indexer throughput → The Graph subgraph
├── Database writes → Sharding strategy
└── Contract gas costs → L3 or custom rollup

Cost: $5,000-20,000+/month
```

### Database Scaling Path

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE SCALING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Stage 1: Single Supabase instance                             │
│   └── Good for: MVP, early growth                               │
│                                                                  │
│   Stage 2: Read replicas + Redis                                │
│   ├── Read-heavy queries → replicas                             │
│   ├── Hot data (prices, counts) → Redis                         │
│   └── Good for: 10K-100K users                                  │
│                                                                  │
│   Stage 3: Horizontal scaling                                    │
│   ├── Shard by group_id                                         │
│   ├── Separate activity feed DB                                 │
│   ├── Time-series DB for price history                          │
│   └── Good for: 100K+ users                                     │
│                                                                  │
│   Stage 4: Decentralized indexing                               │
│   ├── The Graph for on-chain data                               │
│   ├── Ceramic for user data                                     │
│   ├── Keep Postgres for search only                             │
│   └── Good for: Maximum decentralization                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

**Goal:** Core infrastructure working E2E

- [ ] **Smart Contracts**
  - [ ] CommunityToken with bonding curve
  - [ ] GroupFactory deployment
  - [ ] Basic Treasury (EOA initially)
  - [ ] Deploy to Polygon Mumbai testnet

- [ ] **Database**
  - [ ] Supabase project setup
  - [ ] Core schema (groups, members, activity)
  - [ ] Row Level Security policies
  - [ ] Basic indexer (listen to contract events)

- [ ] **Frontend**
  - [ ] Privy wallet connection
  - [ ] Group creation flow (deploys contract)
  - [ ] Token buy/sell UI
  - [ ] Basic group page

- [ ] **Messaging**
  - [ ] XMTP integration
  - [ ] Basic group chat (single channel)
  - [ ] Message display

### Phase 2: Core Features (Weeks 5-8)

**Goal:** Usable product for beta testers

- [ ] **Smart Contracts**
  - [ ] Gnosis Safe treasury integration
  - [ ] Governor contract for voting
  - [ ] Testnet audit + fixes

- [ ] **Governance**
  - [ ] Snapshot integration
  - [ ] Proposal creation UI
  - [ ] Voting interface
  - [ ] Execution flow

- [ ] **Messaging**
  - [ ] Multiple channels per group
  - [ ] Member management
  - [ ] File sharing (IPFS + encrypted reference)
  - [ ] Reactions, replies

- [ ] **Content**
  - [ ] Charter editing (IPFS)
  - [ ] Library/asset management
  - [ ] Activity feed

### Phase 3: Polish (Weeks 9-12)

**Goal:** Production-ready for launch

- [ ] **Security**
  - [ ] Smart contract audit
  - [ ] Penetration testing
  - [ ] Rate limiting
  - [ ] Abuse prevention

- [ ] **UX**
  - [ ] Mobile responsiveness
  - [ ] Notifications (push + email)
  - [ ] Onboarding flow
  - [ ] Error handling

- [ ] **Performance**
  - [ ] Redis caching layer
  - [ ] Image optimization
  - [ ] Bundle optimization
  - [ ] Lighthouse score > 90

- [ ] **Launch Prep**
  - [ ] Mainnet contract deployment
  - [ ] Documentation
  - [ ] Landing page
  - [ ] Support infrastructure

### Phase 4: Growth (Weeks 13+)

**Goal:** Scale and iterate based on usage

- [ ] Advanced governance (delegation, quadratic voting)
- [ ] Mobile apps (React Native)
- [ ] API for third-party integrations
- [ ] Group discovery algorithm
- [ ] Reputation system
- [ ] Cross-group collaboration features
- [ ] The Graph migration for indexing
- [ ] L3 or rollup for high-activity groups

---

## Infrastructure & DevOps

### Environment Setup

```bash
# .env.local (development)
NEXT_PUBLIC_PRIVY_APP_ID=xxx
NEXT_PUBLIC_CHAIN_ID=80001  # Polygon Mumbai testnet
NEXT_PUBLIC_XMTP_ENV=dev

SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

ALCHEMY_API_KEY=xxx
PINATA_JWT=xxx

# .env.production
NEXT_PUBLIC_CHAIN_ID=137  # Polygon Mainnet
NEXT_PUBLIC_XMTP_ENV=production
# ... etc
```

### Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-contracts:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: foundry-rs/foundry-toolchain@v1
      - run: cd contracts && forge build
      - run: cd contracts && forge test
      # Deploy only if contracts changed
      - run: |
          if git diff --name-only HEAD~1 | grep -q "contracts/"; then
            forge script script/Deploy.s.sol --broadcast --verify
          fi

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Monitoring & Observability

```typescript
// lib/monitoring.ts

import * as Sentry from '@sentry/nextjs';
import { PostHog } from 'posthog-js';

// Error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});

// Analytics (privacy-friendly)
export const analytics = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY,
  { api_host: 'https://app.posthog.com' }
);

// Custom metrics
export function trackGroupCreation(groupId: string, tokenSymbol: string) {
  analytics.capture('group_created', {
    group_id: groupId,
    token_symbol: tokenSymbol,
  });
}

export function trackTokenPurchase(groupId: string, amount: number, usdValue: number) {
  analytics.capture('token_purchased', {
    group_id: groupId,
    amount,
    usd_value: usdValue,
  });
}
```

---

## Appendix

### A. XMTP Message Schemas

```typescript
// Custom content types for CommunityCoin

// File attachment (encrypted on IPFS)
const FileAttachment = {
  type: 'communitycoin.io/file',
  content: {
    cid: string;           // IPFS CID
    name: string;          // Original filename
    mimeType: string;
    sizeBytes: number;
    encryptionKey?: string; // If Lit Protocol encrypted
  }
};

// Proposal notification
const ProposalNotification = {
  type: 'communitycoin.io/proposal',
  content: {
    proposalId: string;
    action: 'created' | 'passed' | 'rejected' | 'executed';
    title: string;
    groupId: string;
  }
};

// Token transfer notification
const TokenTransfer = {
  type: 'communitycoin.io/transfer',
  content: {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    tokenSymbol: string;
  }
};
```

### B. API Routes

```typescript
// Supabase Edge Functions or Next.js API routes

// GET /api/groups - List groups with filters
// GET /api/groups/:id - Get group details
// GET /api/groups/:id/activity - Get activity feed
// POST /api/groups/:id/join - Record UI join (not on-chain)

// GET /api/proposals - List proposals
// POST /api/proposals - Create proposal (calls Snapshot)
// POST /api/proposals/:id/vote - Cast vote

// GET /api/users/:address/profile - Get user profile
// PUT /api/users/:address/profile - Update profile
// GET /api/users/:address/groups - Get user's groups

// POST /api/ipfs/upload - Upload to IPFS (authenticated)
// GET /api/ipfs/:cid - Gateway proxy (cached)
```

### C. Cost Estimates

| Service | Free Tier | Growth ($) | Scale ($) |
|---------|-----------|------------|-----------|
| Vercel | 100GB BW | $20/mo | $150/mo |
| Supabase | 500MB DB | $25/mo | $500/mo |
| Alchemy | 300M CU | $49/mo | $199/mo |
| Pinata | 1GB | $20/mo | $100/mo |
| Upstash | 10K/day | $10/mo | $50/mo |
| Sentry | 5K errors | $26/mo | $80/mo |
| **Total** | **$0** | **~$150/mo** | **~$1,000/mo** |

### D. References

- [XMTP Documentation](https://xmtp.org/docs)
- [Polygon Documentation](https://docs.polygon.technology)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Snapshot Documentation](https://docs.snapshot.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Privy Documentation](https://docs.privy.io)
- [Bancor Formula](https://support.bancor.network/hc/en-us/articles/360000503372)

---

*This document is a living artifact. Update as architecture evolves.*
