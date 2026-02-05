# CommunityCoin Build Schedule

> **Strategy:** Build the full application experience with mock crypto, then swap in real blockchain at the end.

**Start Date:** February 4, 2026  
**Target MVP:** ~3 weeks (Late February 2026)

---

## Overview

| Phase | Focus | Duration | Dependencies |
|-------|-------|----------|--------------|
| 1 | Database & Data Layer | 3-4 days | Privy (done) |
| 2 | Real-time Messaging (XMTP) | 4-5 days | Phase 1 |
| 3 | File Storage (IPFS) | 2-3 days | Phase 1 |
| 4 | Polish & UX | 3-4 days | Phases 1-3 |
| 5 | Crypto Integration | 5-7 days | Phases 1-4 |

**Total estimated time:** 17-23 days

---

## Phase 1: Database & Data Layer
**Duration:** 3-4 days  
**Goal:** Replace mock Zustand data with persistent Supabase backend

### Day 1: Supabase Setup

- [ ] Create Supabase project
- [ ] Add environment variables to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_KEY=
  ```
- [ ] Create `lib/supabase.ts` client
- [ ] Set up Privy JWT verification in Supabase

### Day 2: Core Schema

- [ ] Create `groups` table (indexed from future on-chain data)
  - id, name, description, charter, is_public
  - token_symbol, token_price, token_supply, treasury_balance
  - member_count, created_at, creator_address
  
- [ ] Create `members` table
  - group_id, wallet_address, token_balance
  - role, reputation, joined_at
  
- [ ] Create `profiles` table
  - wallet_address, display_name, bio, avatar_cid
  - notification_email, notification_settings

- [ ] Create `activity` table
  - group_id, event_type, actor_address, metadata, created_at

### Day 3: TanStack Query Integration

- [ ] Install `@tanstack/react-query`
- [ ] Create `QueryProvider` in `providers.tsx`
- [ ] Create query hooks:
  - `useGroups()` - list all public groups
  - `useGroup(id)` - single group details
  - `useGroupMembers(groupId)` - members of a group
  - `useProfile(address)` - user profile
  
- [ ] Create mutation hooks:
  - `useCreateGroup()`
  - `useJoinGroup()`
  - `useUpdateProfile()`

### Day 4: Migration & RLS

- [ ] Migrate Zustand store to hybrid pattern:
  - Keep UI state in Zustand (currentChannel, modals, etc.)
  - Server data via TanStack Query
  
- [ ] Set up Row Level Security policies:
  - Public groups readable by all
  - Profiles editable by owner only
  - Members readable by all
  
- [ ] Remove mock data from `lib/store.ts`
- [ ] Test all existing pages work with real data

**Deliverable:** App works with persistent data, users can create groups that persist across sessions.

---

## Phase 2: Real-time Messaging (XMTP)
**Duration:** 4-5 days  
**Goal:** E2E encrypted group chat replacing mock messages

### Day 5: XMTP Client Setup

- [ ] Install XMTP SDK: `@xmtp/xmtp-js`
- [ ] Create `lib/xmtp.ts`:
  ```typescript
  // Initialize XMTP client with Privy wallet signer
  // Handle client caching
  // Export helper functions
  ```
- [ ] Create `XMTPProvider` context component
- [ ] Add XMTP initialization on wallet connect

### Day 6: Group Conversations

- [ ] Create XMTP group conversation when CommunityCoin group is created
- [ ] Store XMTP conversation ID in Supabase `groups` table
- [ ] Build conversation lookup by group ID
- [ ] Handle conversation metadata (group name, channel)

### Day 7: Message Streaming

- [ ] Create `useConversation(groupId, channel)` hook
- [ ] Stream incoming messages in real-time
- [ ] Build message history loading
- [ ] Handle pagination for large histories

### Day 8: Chat UI Integration

- [ ] Replace mock messages in group page chat tab
- [ ] Wire up message sending to XMTP
- [ ] Add typing indicators (optional)
- [ ] Add message reactions (using XMTP content types)

### Day 9: Multi-channel Support

- [ ] Create separate XMTP conversations per channel
- [ ] Channel switching loads correct conversation
- [ ] Handle channel creation (admin only)
- [ ] Sync member list with group membership

**Deliverable:** Real-time E2E encrypted chat working across all groups.

---

## Phase 3: File Storage (IPFS/Pinata)
**Duration:** 2-3 days  
**Goal:** Persistent decentralized file storage for library & charters

### Day 10: Pinata Setup

- [ ] Create Pinata account & get JWT
- [ ] Add `PINATA_JWT` to environment variables
- [ ] Create `lib/ipfs.ts` with upload helpers:
  ```typescript
  export async function uploadToIPFS(file: File): Promise<string> // returns CID
  export function getIPFSUrl(cid: string): string // gateway URL
  ```
- [ ] Create API route `/api/ipfs/upload` for server-side uploads

### Day 11: Library Integration

- [ ] Create Supabase tables:
  - `library_collections` (id, group_id, name, description, is_public)
  - `library_assets` (id, collection_id, title, current_cid, mime_type)
  - `library_asset_versions` (id, asset_id, cid, notes, created_at)
  
- [ ] Wire up library UI to real uploads:
  - Upload files → Pinata
  - Store metadata → Supabase
  - Display via gateway URL

### Day 12: Charter & Profile Images

- [ ] Store charter content on IPFS
- [ ] Add `charter_cid` column to groups table
- [ ] Charter edit → upload new version → update CID
- [ ] Profile avatar upload to IPFS
- [ ] Group image upload to IPFS

**Deliverable:** Library works with real file persistence, charters stored decentralized.

---

## Phase 4: Polish & UX
**Duration:** 3-4 days  
**Goal:** Production-ready user experience

### Day 13: User Profiles

- [ ] Profile creation flow for new users
- [ ] Profile editing page
- [ ] Avatar upload with crop/preview
- [ ] Display name, bio, social links
- [ ] Profile card component (shown in member directory)

### Day 14: Notifications System

- [ ] Create `notifications` table in Supabase
- [ ] Notification types: new_message, proposal_created, vote_ended, etc.
- [ ] In-app notification bell with unread count
- [ ] Notification dropdown/page
- [ ] Mark as read functionality

### Day 15: Search & Discovery

- [ ] Full-text search for groups (Supabase pg_trgm)
- [ ] Category filtering
- [ ] Sort by: trending, newest, most members, highest treasury
- [ ] "Recommended for you" algorithm (basic: based on categories)

### Day 16: Error Handling & Loading States

- [ ] Add loading skeletons to all pages
- [ ] Error boundaries for graceful failures
- [ ] Toast notifications (success, error, info)
- [ ] Offline state handling
- [ ] Form validation with clear error messages

**Deliverable:** Polished, production-quality UX.

---

## Phase 5: Crypto Integration (Deferred)
**Duration:** 5-7 days  
**Goal:** Real blockchain-based tokens, treasury, and governance

### Day 17-18: Smart Contracts

- [ ] Set up Foundry in `/contracts`
- [ ] Write `CommunityToken.sol` with bonding curve
- [ ] Write `GroupFactory.sol` for deployment
- [ ] Write comprehensive tests
  - [ ] Deploy to Polygon Mumbai testnet

### Day 19-20: Contract Integration

- [ ] Create `lib/contracts.ts` with ABIs
- [ ] Wire up "Create Group" to deploy real token
- [ ] Wire up "Buy Tokens" to contract call
- [ ] Wire up "Sell Tokens" to contract call
- [ ] Show real token balances from chain

### Day 21: Event Indexing

- [ ] Set up Alchemy webhooks for contract events
- [ ] Create `/api/webhooks/alchemy` endpoint
- [ ] Index TokensPurchased, TokensSold events
- [ ] Update Supabase cache from events
- [ ] Real-time price updates

### Day 22-23: Governance

- [ ] Integrate Snapshot for gasless voting
- [ ] Create proposal → Snapshot proposal
- [ ] Display votes from Snapshot API
- [ ] Handle proposal execution (treasury spend)
- [ ] Vote delegation support

**Deliverable:** Fully functional crypto-native community platform.

---

## File Structure After Build

```
/app
  /api
    /ipfs/upload/route.ts
    /webhooks/alchemy/route.ts
  /create/page.tsx
  /explore/page.tsx
  /group/[id]/
    /charter/page.tsx
    page.tsx
  /profile/
    /edit/page.tsx
    page.tsx
  globals.css
  layout.tsx
  page.tsx
  providers.tsx

/components
  /ui/
    Button.tsx
    Input.tsx
    Card.tsx
    Toast.tsx
    Skeleton.tsx
  /group/
    GroupCard.tsx
    GroupHeader.tsx
    MemberList.tsx
  /chat/
    MessageList.tsx
    MessageInput.tsx
    ChannelSidebar.tsx
  /library/
    AssetGrid.tsx
    VersionHistory.tsx
    FileUpload.tsx

/lib
  /hooks/
    useGroups.ts
    useGroup.ts
    useMessages.ts
    useProfile.ts
  contracts.ts       # ABIs and addresses
  ipfs.ts            # Pinata helpers
  store.ts           # Zustand (UI state only)
  supabase.ts        # Supabase client
  xmtp.ts            # XMTP client

/contracts           # Foundry project
  /src/
    CommunityToken.sol
    GroupFactory.sol
    Treasury.sol
  /test/
  /script/
```

---

## Environment Variables Checklist

```bash
# Auth (done)
NEXT_PUBLIC_PRIVY_APP_ID=

# Database (Phase 1)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Messaging (Phase 2)
NEXT_PUBLIC_XMTP_ENV=dev

# Storage (Phase 3)
PINATA_JWT=

# Blockchain (Phase 5)
NEXT_PUBLIC_CHAIN_ID=80001  # Polygon Mumbai testnet (137 for mainnet)
NEXT_PUBLIC_ALCHEMY_API_KEY=
NEXT_PUBLIC_GROUP_FACTORY_ADDRESS=
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| XMTP group chat complexity | Start with 1:1 DMs if groups prove difficult |
| Supabase RLS blocking reads | Test policies thoroughly before deploying |
| IPFS gateway slow | Use dedicated Pinata gateway, consider caching |
| Contract bugs | Extensive Foundry tests, consider audit |

---

## Success Metrics (MVP)

- [ ] User can sign in with email or wallet
- [ ] User can create a group with name, description, charter
- [ ] Users can chat in real-time (E2E encrypted)
- [ ] Users can upload files to library
- [ ] Groups persist across sessions
- [ ] 3 mock groups look good with real data

---

## Notes

- **Mock crypto until Phase 5:** Token prices, treasury balance, and voting will use Zustand mock values until smart contracts are ready. The UI is already built for this.

- **XMTP is the hardest part:** Budget extra time here. If it's taking too long, consider shipping with Supabase real-time as a temporary chat backend.

- **Test on mobile:** The current UI is responsive but hasn't been tested on real devices. Do this during Phase 4.

---

*Last updated: February 4, 2026*
