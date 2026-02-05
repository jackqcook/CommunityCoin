-- CommunityCoin Initial Schema
-- Run this migration to set up the database

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Groups (indexed from on-chain + IPFS)
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  
  -- On-chain references
  contract_address text unique,
  treasury_address text,
  chain_id int not null default 80001, -- polygon mumbai testnet
  created_tx_hash text,
  created_block bigint,
  creator_address text not null,
  
  -- IPFS references
  charter_cid text,
  image_cid text,
  
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
  
  -- Funding model
  funding_type text not null default 'none', -- 'token', 'donation', 'subscription', 'none'
  token_launched_at timestamptz,
  
  -- XMTP reference
  xmtp_group_id text,
  
  -- Indexer metadata
  last_indexed_block bigint,
  last_indexed_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for common queries
create index if not exists groups_market_cap_idx on groups(market_cap desc);
create index if not exists groups_member_count_idx on groups(member_count desc);
create index if not exists groups_created_at_idx on groups(created_at desc);
create index if not exists groups_creator_idx on groups(creator_address);
create index if not exists groups_contract_idx on groups(contract_address);
create index if not exists groups_search_idx on groups 
  using gin(to_tsvector('english', name || ' ' || coalesce(description, '')));


-- Members (token holders)
create table if not exists members (
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

create index if not exists members_group_idx on members(group_id);
create index if not exists members_balance_idx on members(token_balance desc);
create index if not exists members_wallet_idx on members(wallet_address);


-- Proposals (indexed from Snapshot + on-chain)
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  -- External references
  snapshot_id text,
  onchain_proposal_id text,
  
  -- IPFS reference
  content_cid text,
  
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

create index if not exists proposals_group_idx on proposals(group_id);
create index if not exists proposals_status_idx on proposals(status);


-- Activity Feed (derived from on-chain events)
create table if not exists activity (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  -- Event details
  event_type text not null, -- token_buy, token_sell, proposal_created, proposal_executed, member_joined, group_created
  actor_address text not null,
  
  -- Flexible payload
  metadata jsonb not null default '{}',
  
  -- On-chain proof
  tx_hash text,
  block_number bigint,
  log_index int,
  
  created_at timestamptz default now()
);

create index if not exists activity_group_idx on activity(group_id, created_at desc);
create index if not exists activity_actor_idx on activity(actor_address, created_at desc);
create index if not exists activity_type_idx on activity(event_type);


-- ============================================================
-- USER TABLES
-- ============================================================

-- User profiles (optional, not required)
create table if not exists profiles (
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
  
  -- Privacy
  profile_visibility text default 'public', -- public, members_only, private
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- User group memberships (tracks UI state)
create table if not exists user_group_memberships (
  wallet_address text not null,
  group_id uuid references groups(id) on delete cascade,
  
  -- UI preferences per group
  notifications_enabled boolean default true,
  pinned boolean default false,
  last_read_at timestamptz,
  
  joined_at timestamptz default now(),
  
  primary key (wallet_address, group_id)
);


-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  
  type text not null, -- new_proposal, vote_ended, mentioned, token_purchase
  title text not null,
  body text,
  
  -- Reference
  group_id uuid references groups(id) on delete cascade,
  reference_id text,
  
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_wallet_idx on notifications(wallet_address, read, created_at desc);


-- ============================================================
-- FUNDING/TOKEN LAUNCH TABLES
-- ============================================================

-- Token launches (track all funding model launches)
create table if not exists token_launches (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  launch_type text not null, -- 'token', 'donation', 'subscription'
  
  -- Token-specific (if launch_type = 'token')
  contract_address text,
  treasury_address text,
  initial_price numeric,
  initial_supply numeric,
  
  -- Donation-specific (if launch_type = 'donation')
  donation_address text,
  min_donation numeric,
  
  -- Subscription-specific (if launch_type = 'subscription')
  subscription_price numeric,
  billing_period text, -- 'monthly', 'yearly'
  
  launched_at timestamptz default now(),
  launched_by text not null,
  tx_hash text,
  block_number bigint
);

create index if not exists token_launches_group_idx on token_launches(group_id);


-- ============================================================
-- CONTENT TABLES (Cached from IPFS)
-- ============================================================

-- Library collections
create table if not exists library_collections (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  
  name text not null,
  description text,
  is_public boolean default true,
  
  creator_address text not null,
  created_at timestamptz default now()
);

-- Library assets
create table if not exists library_assets (
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
create table if not exists library_asset_versions (
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
-- HELPER FUNCTIONS
-- ============================================================

-- Function to increment member count
create or replace function increment_member_count(p_group_id uuid)
returns void as $$
begin
  update groups 
  set member_count = member_count + 1,
      updated_at = now()
  where id = p_group_id;
end;
$$ language plpgsql;

-- Function to decrement member count
create or replace function decrement_member_count(p_group_id uuid)
returns void as $$
begin
  update groups 
  set member_count = greatest(0, member_count - 1),
      updated_at = now()
  where id = p_group_id;
end;
$$ language plpgsql;

-- Function to update group timestamp on changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger groups_updated_at
  before update on groups
  for each row
  execute function update_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

create trigger library_assets_updated_at
  before update on library_assets
  for each row
  execute function update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table groups enable row level security;
alter table members enable row level security;
alter table proposals enable row level security;
alter table activity enable row level security;
alter table profiles enable row level security;
alter table user_group_memberships enable row level security;
alter table notifications enable row level security;
alter table library_collections enable row level security;
alter table library_assets enable row level security;
alter table library_asset_versions enable row level security;
alter table token_launches enable row level security;

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
  using (profile_visibility = 'public' or profile_visibility is null);

-- Activity is viewable by everyone
create policy "Activity is viewable by everyone"
  on activity for select
  using (true);

-- Proposals are viewable by everyone
create policy "Proposals are viewable by everyone"
  on proposals for select
  using (true);

-- Token launches are viewable by everyone
create policy "Token launches are viewable by everyone"
  on token_launches for select
  using (true);

-- Library collections - public ones are viewable
create policy "Public library collections are viewable"
  on library_collections for select
  using (is_public = true);

-- Library assets from public collections are viewable
create policy "Public library assets are viewable"
  on library_assets for select
  using (
    exists (
      select 1 from library_collections lc 
      where lc.id = library_assets.collection_id 
      and lc.is_public = true
    )
  );

-- Asset versions are viewable for viewable assets
create policy "Asset versions are viewable"
  on library_asset_versions for select
  using (
    exists (
      select 1 from library_assets la
      join library_collections lc on lc.id = la.collection_id
      where la.id = library_asset_versions.asset_id
      and lc.is_public = true
    )
  );

-- Service role can do everything (for indexer)
-- Note: These policies allow the service role to bypass RLS


-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for key tables
alter publication supabase_realtime add table groups;
alter publication supabase_realtime add table members;
alter publication supabase_realtime add table activity;
alter publication supabase_realtime add table proposals;
alter publication supabase_realtime add table notifications;
