# CommunityCoin Data Architecture

> **Core Principle:** Supabase is a **cache/index** that can be rebuilt from source-of-truth systems (blockchain, XMTP, IPFS). Never store canonical data only in Supabase.

> **Privacy Principle:** We collect the **minimum data necessary** to provide the service. Users own their data and can delete it. We never see private messages, and we minimize metadata collection.

---

## Privacy-First Principles

### 1. **Data Minimization**
- Only collect data that is **strictly necessary** for functionality
- No tracking pixels, analytics cookies, or third-party surveillance
- No collection of IP addresses, device fingerprints, or behavioral tracking
- Aggregate data where possible (e.g., member counts instead of individual join times)

### 2. **User Control**
- Users can **delete their profile** at any time (cascades to all user data)
- Users can **opt out** of all non-essential data collection
- Users control what's public vs. private in their profile
- Users can **export their data** (messages via XMTP, profile via API)

### 3. **Zero-Knowledge Architecture**
- **We never see message content** - XMTP handles E2E encryption
- **We never see file contents** - Files go directly to IPFS
- We only store **metadata** (titles, tags, CIDs) for search/discovery
- Private groups can choose to minimize even metadata collection

### 4. **Metadata Leakage Prevention**
- Don't log **who messages whom** (only group membership)
- Don't track **read receipts** unless user explicitly enables
- Don't store **typing indicators** or presence data
- Activity feeds show **public events only** (proposals, votes, not private chats)

### 5. **Transparency**
- All data collection is **explicit** - users know what's stored
- Privacy policy clearly states what we can and cannot see
- Open source code so users can verify our claims
- Regular privacy audits of data collection

### 6. **Right to Deletion**
- Users can **delete their account** → removes all Supabase data
- **Cannot delete** blockchain data (immutable by design)
- **Cannot delete** IPFS content (decentralized, but can unpin)
- **Cannot delete** XMTP messages (user controls via XMTP client)

### 7. **Privacy by Default**
- Profiles are **minimal by default** (wallet address only)
- Groups are **public by default** (creator choice, but transparent)
- Private groups **hide member lists** from non-members
- No email required (Privy embedded wallets work without it)

---

## Source of Truth Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    IMMUTABLE / DECENTRALIZED                        │
│         (User owns this data, we can't delete or modify it)         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   🔗 BLOCKCHAIN (Polygon)                                           │
│   └── Token balances, transfers, treasury, votes, group creation    │
│                                                                      │
│   💬 XMTP Network                                                   │
│   └── All messages (E2E encrypted, we never see plaintext)          │
│                                                                      │
│   📁 IPFS (via Pinata)                                              │
│   └── Charters, proposals, library files, avatars, group images     │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                    DERIVED / CACHED                                  │
│           (We control this, can rebuild from above)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   🗄️ SUPABASE (Postgres)                                            │
│   └── Indexed metadata, search, activity feeds, user preferences    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                    EPHEMERAL / CLIENT-ONLY                           │
│              (Lives in browser, not persisted)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   🖥️ ZUSTAND / REACT STATE                                          │
│   └── Current channel, modal state, draft messages, UI preferences  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## What Goes Where

### 🔗 BLOCKCHAIN (Future - Phase 5)

**Store on-chain:**
| Data | Why |
|------|-----|
| Token contract address | Immutable group identity |
| Token balances per wallet | Trustless ownership proof |
| Token transfers (buy/sell events) | Auditable transaction history |
| Treasury balance | Verifiable collective funds |
| Governance votes | Tamper-proof voting record |
| Proposal execution hashes | Proof that treasury spent correctly |

**Never put on-chain:**
- Message content (expensive, not private)
- User profiles (mutable, off-chain is fine)
- File content (too large)

---

### 💬 XMTP Network

**Store in XMTP:**
| Data | Why | Privacy Note |
|------|-----|--------------|
| All chat messages | E2E encrypted, decentralized | **We never see plaintext** |
| Message reactions | Part of conversation | Encrypted like messages |
| File attachment references (CID only) | Pointer to IPFS content | Only CID, not file content |
| Read receipts | Conversation metadata | Optional, user-controlled |

**Never store in XMTP:**
- Actual files (use IPFS, send CID via XMTP)
- User profiles (not a messaging concern)
- Token balances (that's blockchain data)

**Privacy Guarantees:**
- ✅ **We do NOT store messages in Supabase** - XMTP is the source of truth
- ✅ **Messages are E2E encrypted** - We cannot read them even if we wanted to
- ✅ **No message metadata logging** - We don't track who messages whom
- ✅ **No read receipt tracking** - Unless user explicitly enables it
- ✅ **Group membership is public** - But message content is private

**Important:** XMTP provides forward secrecy and perfect forward secrecy. Even if keys are compromised, past messages remain secure.

---

### 📁 IPFS (via Pinata)

**Store on IPFS:**
| Data | Why | Privacy Note |
|------|-----|--------------|
| Group charters | Versioned, content-addressed | Public by design (group is public) |
| Proposal full descriptions | Immutable once submitted | Public (governance transparency) |
| Library assets (docs, images, videos) | Decentralized file storage | **User chooses public/private** |
| User avatars | Content-addressed images | Public (user choice) |
| Group cover images | Same | Public (group is public) |

**Never store on IPFS:**
- Frequently changing data (prices, balances)
- **Private/sensitive data** (IPFS is public by default - warn users!)
- Structured queryable data (that's what Postgres is for)
- **Personal information** (addresses, emails, private keys)

**Privacy Considerations:**
- ⚠️ **IPFS is public by default** - Anyone with the CID can access content
- ✅ **Private groups** should warn users before uploading sensitive files
- ✅ **User avatars** are public - users should be aware
- ✅ **Library assets** can be marked private (metadata in Supabase, but file CID is still accessible if known)
- 🔒 **Future:** Consider Lit Protocol for encrypted IPFS files (token-gated access)

**Best Practice:** For truly private files, encrypt before uploading to IPFS, or use a different storage mechanism.

---

### 🗄️ SUPABASE (Postgres)

**This is where it gets nuanced.** Supabase stores:

#### ✅ DO Store in Supabase

| Table | Data | Source of Truth | Why Cache It | Privacy Consideration |
|-------|------|-----------------|--------------|----------------------|
| `groups` | name, description, token_symbol, is_public | Blockchain + IPFS | Fast queries, search | Public data only |
| `groups` | token_price, token_supply, treasury_balance | Blockchain | Real-time display | Public on-chain data |
| `groups` | charter_cid, image_cid | IPFS | Lookup without IPFS call | Public CIDs |
| `groups` | member_count | Blockchain | Aggregated count | Aggregate, not individual |
| `members` | wallet_address, group_id, token_balance | Blockchain | Fast membership lookups | **Public on-chain** (unavoidable) |
| `members` | role, reputation | Derived from activity | Computed locally | Public within group |
| `profiles` | display_name, bio, avatar_cid | User-owned | User preferences | **User-controlled, deletable** |
| `profiles` | notification_settings | User-owned | App settings | User preference only |
| `activity` | event summaries | Blockchain events | Activity feed | **Public events only** (no private actions) |
| `library_assets` | title, tags, current_cid, metadata | IPFS | Search, organization | User chooses public/private |
| `proposals` | title, status, votes_for, votes_against | Blockchain/Snapshot | Fast display | Public governance data |
| `notifications` | user notifications | App-generated | User inbox | **User-specific, deletable** |
| `user_group_memberships` | pinned groups, last_read_at | User preference | UI state that persists | **User-specific, deletable** |

#### ❌ DO NOT Store in Supabase

| Data | Why Not | Where It Lives | Privacy Reason |
|------|---------|----------------|----------------|
| Chat messages | E2E encrypted, privacy | XMTP only | **We cannot and should not see messages** |
| Actual file content | Too large, not our job | IPFS only | Files are user-owned, decentralized |
| Private keys | Security nightmare | User's wallet | **Never store keys** |
| Token transfer history | Blockchain is source | Blockchain (index if needed) | Public on-chain, no need to duplicate |
| Vote signatures | Blockchain/Snapshot | Blockchain | Public governance data |
| **IP addresses** | Not needed, privacy risk | Not collected | **Never log IPs** |
| **Device fingerprints** | Tracking, privacy violation | Not collected | **No tracking** |
| **Email addresses** | Not required, privacy risk | Privy only (if user chooses) | **Optional, not stored** |
| **Message metadata** | Privacy violation | Not collected | **Don't track who messages whom** |
| **Read receipts** | Privacy, unless opt-in | XMTP only (if enabled) | **User-controlled** |
| **Typing indicators** | Privacy, unnecessary | Not stored | **Don't track presence** |
| **Analytics events** | Tracking, privacy | Not collected | **No behavioral tracking** |

---

## Supabase Schema (Refined)

Based on the above, here's what your tables should look like:

### `groups`
```sql
create table groups (
  id uuid primary key default gen_random_uuid(),
  
  -- Identity (from blockchain, once you add it)
  contract_address text unique,        -- NULL until Phase 5
  chain_id int default 80001,          -- Polygon Mumbai testnet
  
  -- Basic info (user-provided at creation)
  name text not null,
  description text,
  is_public boolean default true,
  creator_address text not null,       -- Wallet that created it
  
  -- IPFS references
  charter_cid text,                    -- Points to charter JSON on IPFS
  image_cid text,                      -- Group avatar/cover
  
  -- Token info (mock until Phase 5, then indexed from chain)
  token_symbol text not null,
  token_price numeric default 0.01,
  token_supply numeric default 100000,
  treasury_balance numeric default 0,
  
  -- Aggregates (computed)
  member_count int default 0,
  
  -- XMTP reference
  xmtp_group_id text,                  -- XMTP conversation identifier
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `members`
```sql
create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  wallet_address text not null,
  
  -- Cached from blockchain (mock until Phase 5)
  token_balance numeric default 0,
  
  -- App-level (not on-chain)
  role text default 'member',          -- founder, elder, member, newcomer
  reputation int default 0,            -- Computed from activity
  
  joined_at timestamptz default now(),
  
  unique(group_id, wallet_address)
);
```

### `profiles`
```sql
create table profiles (
  wallet_address text primary key,
  
  -- User-controlled (all optional, user can delete)
  display_name text,                    -- Optional, user can leave blank
  bio text,                             -- Optional
  avatar_cid text,                      -- IPFS CID, optional
  
  -- Links (all optional, user-controlled)
  twitter_handle text,
  farcaster_fid text,
  website_url text,
  
  -- Preferences (app-level, not decentralized)
  notification_email text,              -- Optional, only if user wants email notifications
  email_notifications boolean default false,  -- Opt-in, not opt-out
  
  -- Privacy settings
  profile_visibility text default 'public',  -- public, members_only, private
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Privacy: User can delete their profile, cascades to all user data
-- Privacy: Email is optional and only stored if user explicitly provides it
-- Privacy: Profile visibility controls who can see bio/links
```

### `library_collections`
```sql
create table library_collections (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  name text not null,
  description text,
  is_public boolean default true,
  
  creator_address text not null,
  created_at timestamptz default now()
);
```

### `library_assets`
```sql
create table library_assets (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references library_collections(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  
  -- Metadata (searchable)
  title text not null,
  tags text[] default '{}',
  
  -- Current version (latest)
  current_cid text not null,           -- IPFS CID
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  
  creator_address text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `library_asset_versions`
```sql
create table library_asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references library_assets(id) on delete cascade,
  
  cid text not null,                   -- IPFS CID for this version
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  notes text,
  
  creator_address text not null,
  created_at timestamptz default now()
);
```

### `proposals`
```sql
create table proposals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  -- External references (Phase 5)
  snapshot_id text,                    -- Snapshot proposal ID
  onchain_proposal_id text,            -- On-chain ID if applicable
  
  -- Content
  title text not null,
  summary text,
  content_cid text,                    -- Full proposal on IPFS
  category text not null,              -- treasury, governance, charter, other
  
  -- State (indexed from Snapshot/chain)
  proposer_address text not null,
  status text default 'active',        -- active, passed, rejected, executed
  votes_for numeric default 0,
  votes_against numeric default 0,
  
  -- Timing
  voting_starts_at timestamptz,
  voting_ends_at timestamptz,
  
  created_at timestamptz default now()
);
```

### `mobilization_tickets`
```sql
create table mobilization_tickets (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  title text not null,
  description text not null,
  tags text[] default '{}',
  
  status text default 'backlog',       -- backlog, in_progress, done
  priority text default 'p2',          -- p0, p1, p2, p3
  requested_budget_usd numeric,
  
  -- Voting (token-weighted, stored locally until on-chain)
  votes numeric default 0,
  
  creator_address text not null,
  created_at timestamptz default now()
);
```

### `activity`
```sql
create table activity (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  event_type text not null,            -- member_joined, proposal_created, tokens_bought, etc.
  actor_address text not null,         -- Public wallet address (on-chain data)
  metadata jsonb default '{}',         -- Minimal metadata only
  
  -- Blockchain proof (Phase 5)
  tx_hash text,
  block_number bigint,
  
  created_at timestamptz default now()
);

-- Privacy: Only PUBLIC events (proposals, votes, treasury actions)
-- Privacy: NO private events (messages sent, files viewed, etc.)
-- Privacy: actor_address is public on-chain data, unavoidable
-- Privacy: metadata should be minimal (no personal info)
```

### `notifications`
```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  
  type text not null,                  -- new_proposal, vote_ended, mentioned, etc.
  title text not null,
  body text,
  
  -- Reference
  group_id uuid references groups(id) on delete cascade,
  reference_id text,                   -- proposal_id, etc.
  
  read boolean default false,
  created_at timestamptz default now()
);
```

### `user_group_memberships` (UI state)
```sql
create table user_group_memberships (
  wallet_address text not null,
  group_id uuid references groups(id) on delete cascade,
  
  -- UI preferences (not on-chain membership)
  pinned boolean default false,
  notifications_enabled boolean default true,
  last_read_at timestamptz,
  
  created_at timestamptz default now(),
  
  primary key (wallet_address, group_id)
);
```

---

## What NOT to Create Tables For

| Don't Create | Why |
|--------------|-----|
| `messages` | XMTP handles this, E2E encrypted |
| `files` | Stored on IPFS, only metadata in `library_assets` |
| `token_transfers` | Lives on blockchain, index in `activity` if needed |
| `votes` | Lives on Snapshot/chain, aggregate in `proposals` |
| `sessions` | Privy handles auth sessions |

---

## Data Flow Examples

### User Creates a Group

```
1. User fills form → 
2. Upload charter to IPFS → get CID →
3. Insert into Supabase `groups` table →
4. Create XMTP group conversation → store xmtp_group_id →
5. (Phase 5: Deploy token contract → store contract_address)
```

### User Sends a Message

```
1. User types message →
2. Send via XMTP SDK (encrypted) →
3. XMTP network delivers to members →
4. ❌ NO Supabase involved - we never see the message
```

### User Uploads a File

```
1. User selects file →
2. Upload to Pinata IPFS → get CID →
3. Insert metadata into `library_assets` table →
4. To share in chat: send CID via XMTP message
```

### User Buys Tokens (Phase 5)

```
1. User clicks Buy →
2. Wallet signs transaction →
3. Contract executes on Polygon →
4. Event emitted: TokensPurchased →
5. Indexer catches event →
6. Update Supabase `members.token_balance` and `groups.token_price`
```

---

## Privacy Implementation Checklist

### Data Collection
- [ ] **No IP address logging** - Don't log IPs in Supabase or server logs
- [ ] **No device fingerprinting** - Don't collect browser/device info
- [ ] **No analytics tracking** - No Google Analytics, Mixpanel, etc.
- [ ] **No third-party cookies** - Only first-party session cookies via Privy
- [ ] **Minimal metadata** - Only collect what's necessary for functionality

### User Rights
- [ ] **Account deletion** - Users can delete profile → cascades to all user data
- [ ] **Data export** - Users can export their data (profile, group memberships)
- [ ] **Opt-out** - Users can opt out of non-essential features
- [ ] **Profile visibility** - Users control who sees their profile info

### Message Privacy
- [ ] **No message storage** - Messages never touch our servers
- [ ] **No metadata tracking** - Don't log who messages whom
- [ ] **No read receipts** - Unless user explicitly enables
- [ ] **No typing indicators** - Don't track presence

### File Privacy
- [ ] **IPFS warnings** - Warn users that IPFS is public
- [ ] **Private collections** - Support private library collections (metadata only)
- [ ] **Encryption option** - Future: Lit Protocol for encrypted files

### Blockchain Privacy
- [ ] **Transparency** - Make it clear blockchain data is public
- [ ] **Wallet privacy** - Users can use multiple wallets for different groups
- [ ] **No address linking** - Don't try to link addresses across services

---

## Key Takeaways

1. **Supabase = Index, not Source of Truth**
   - If Supabase dies, we can rebuild from blockchain + IPFS + XMTP
   - **Privacy:** We only cache public/necessary data
   
2. **Messages are NEVER in our database**
   - XMTP handles E2E encryption, we can't read them anyway
   - **Privacy:** Zero-knowledge messaging architecture
   
3. **Files live on IPFS, metadata in Supabase**
   - Store CID + title + tags, not the actual bytes
   - **Privacy:** Users control file visibility, IPFS is public by default
   
4. **User profiles are user-controlled**
   - These are user preferences, Supabase is fine as source of truth
   - **Privacy:** Users can delete, all fields optional
   - (Could move to Ceramic for full decentralization later)

5. **Mock blockchain data until Phase 5**
   - token_price, token_supply, treasury_balance start as mock values
   - Schema is ready for real blockchain indexing later
   - **Privacy:** Blockchain data is inherently public (transparency trade-off)

6. **Privacy by Design**
   - Collect minimum necessary data
   - Users own and control their data
   - No tracking, no surveillance, no behavioral analytics

---

## Visual Summary

```
┌────────────────────────────────────────────────────────────────┐
│                        USER ACTION                              │
└────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Message?   │    │    File?     │    │   Token?     │
│              │    │              │    │              │
│  → XMTP      │    │  → IPFS      │    │  → Blockchain│
│  (encrypted) │    │  (Pinata)    │    │  (Polygon)   │
└──────────────┘    └──────┬───────┘    └──────┬───────┘
                           │                    │
                           │   CID              │   Event
                           ▼                    ▼
                    ┌─────────────────────────────────┐
                    │           SUPABASE              │
                    │                                 │
                    │  • Index CID + metadata         │
                    │  • Cache token balances         │
                    │  • Store user preferences       │
                    │  • Power search & feeds         │
                    └─────────────────────────────────┘
                                    │
                                    ▼
                           ┌──────────────┐
                           │   Frontend   │
                           │   (Next.js)  │
                           └──────────────┘
```

---

## Privacy-First Analytics (Optional)

If you need analytics for product improvement, use **privacy-preserving** methods:

### ✅ Privacy-Preserving Analytics
- **Aggregate metrics only** - Total groups, total members, no individual tracking
- **Self-hosted** - Use PostHog self-hosted (no third-party tracking)
- **Opt-in** - Users can opt out of analytics
- **Anonymized** - No wallet addresses, no personal identifiers
- **On-chain data only** - Use public blockchain data for metrics

### ❌ Never Use
- Google Analytics (surveillance capitalism)
- Mixpanel/Amplitude (behavioral tracking)
- Facebook Pixel (privacy violation)
- Any service that tracks individuals

### Example: Privacy-Preserving Metrics
```sql
-- Aggregate metrics (no individual tracking)
select 
  count(*) as total_groups,
  sum(member_count) as total_members,
  sum(treasury_balance) as total_treasury
from groups
where is_public = true;

-- No individual user tracking
-- No event tracking
-- No behavioral analytics
```

---

## Data Retention & Deletion

### User Account Deletion
When a user deletes their account:
1. **Delete from `profiles`** → Cascades to:
   - `user_group_memberships` (UI preferences)
   - `notifications` (user notifications)
2. **Keep in `members`** → Blockchain data (immutable, public)
3. **Keep in `activity`** → Public events (governance transparency)
4. **Keep in `groups`** → If user created group, mark creator as deleted
5. **Keep in `library_assets`** → Files remain (IPFS is decentralized)

### Group Deletion
When a group is deleted:
1. **Delete from `groups`** → Cascades to:
   - `members` (membership records)
   - `proposals` (proposal records)
   - `mobilization_tickets` (tickets)
   - `library_collections` (collections)
   - `library_assets` (asset metadata)
   - `activity` (activity feed)
   - `user_group_memberships` (UI preferences)
2. **Cannot delete**:
   - IPFS content (decentralized, but can unpin)
   - Blockchain data (immutable)
   - XMTP messages (user-controlled via XMTP client)

### Data Export
Users can export their data:
- Profile data (display_name, bio, links)
- Group memberships (which groups they're in)
- Notifications (their notification history)
- **Cannot export** messages (handled by XMTP client)

---

## Compliance Considerations

### GDPR (if applicable)
- ✅ **Right to access** - Users can view their data
- ✅ **Right to deletion** - Users can delete their account
- ✅ **Right to portability** - Users can export their data
- ✅ **Data minimization** - Only collect necessary data
- ⚠️ **Blockchain data** - Immutable, cannot be deleted (transparency trade-off)

### CCPA (if applicable)
- ✅ **Do not sell** - We don't sell user data
- ✅ **Opt-out** - Users can opt out of data collection
- ✅ **Deletion** - Users can request deletion

### Best Practices
- **Privacy policy** - Clearly state what we collect and why
- **Terms of service** - Explain blockchain immutability
- **Transparency** - Open source code, public audits
- **User education** - Help users understand privacy implications

---

*This document should be referenced when designing any new feature to ensure data goes to the right place and privacy is protected.*
