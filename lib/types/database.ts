// Database types for Supabase
// Auto-generated types would come from `supabase gen types typescript`
// These are manual types matching our schema

export type FundingModelType = 'token' | 'donation' | 'subscription' | 'none';

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          contract_address: string | null;
          treasury_address: string | null;
          chain_id: number;
          created_tx_hash: string | null;
          created_block: number | null;
          creator_address: string;
          charter_cid: string | null;
          image_cid: string | null;
          name: string;
          description: string | null;
          token_symbol: string;
          token_price: number;
          total_supply: number;
          reserve_balance: number;
          treasury_balance: number;
          member_count: number;
          market_cap: number;
          is_public: boolean;
          funding_type: FundingModelType;
          token_launched_at: string | null;
          xmtp_group_id: string | null;
          last_indexed_block: number | null;
          last_indexed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contract_address?: string | null;
          treasury_address?: string | null;
          chain_id?: number;
          created_tx_hash?: string | null;
          created_block?: number | null;
          creator_address: string;
          charter_cid?: string | null;
          image_cid?: string | null;
          name: string;
          description?: string | null;
          token_symbol: string;
          token_price?: number;
          total_supply?: number;
          reserve_balance?: number;
          treasury_balance?: number;
          member_count?: number;
          is_public?: boolean;
          funding_type?: FundingModelType;
          token_launched_at?: string | null;
          xmtp_group_id?: string | null;
          last_indexed_block?: number | null;
          last_indexed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          contract_address?: string | null;
          treasury_address?: string | null;
          chain_id?: number;
          created_tx_hash?: string | null;
          created_block?: number | null;
          creator_address?: string;
          charter_cid?: string | null;
          image_cid?: string | null;
          name?: string;
          description?: string | null;
          token_symbol?: string;
          token_price?: number;
          total_supply?: number;
          reserve_balance?: number;
          treasury_balance?: number;
          member_count?: number;
          is_public?: boolean;
          funding_type?: FundingModelType;
          token_launched_at?: string | null;
          xmtp_group_id?: string | null;
          last_indexed_block?: number | null;
          last_indexed_at?: string;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          group_id: string;
          wallet_address: string;
          token_balance: number;
          reputation: number;
          role: 'founder' | 'elder' | 'member' | 'newcomer';
          joined_at: string;
          last_active_at: string | null;
        };
        Insert: {
          id?: string;
          group_id: string;
          wallet_address: string;
          token_balance?: number;
          reputation?: number;
          role?: 'founder' | 'elder' | 'member' | 'newcomer';
          joined_at?: string;
          last_active_at?: string | null;
        };
        Update: {
          token_balance?: number;
          reputation?: number;
          role?: 'founder' | 'elder' | 'member' | 'newcomer';
          last_active_at?: string | null;
        };
      };
      activity: {
        Row: {
          id: string;
          group_id: string;
          event_type: string;
          actor_address: string;
          metadata: Record<string, unknown>;
          tx_hash: string | null;
          block_number: number | null;
          log_index: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          event_type: string;
          actor_address: string;
          metadata?: Record<string, unknown>;
          tx_hash?: string | null;
          block_number?: number | null;
          log_index?: number | null;
          created_at?: string;
        };
        Update: never;
      };
      proposals: {
        Row: {
          id: string;
          group_id: string;
          snapshot_id: string | null;
          onchain_proposal_id: string | null;
          content_cid: string | null;
          title: string;
          summary: string | null;
          category: 'treasury' | 'governance' | 'charter' | 'other';
          proposer_address: string;
          status: 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
          votes_for: number;
          votes_against: number;
          votes_abstain: number;
          voting_starts_at: string;
          voting_ends_at: string;
          executed_at: string | null;
          executed_tx_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          snapshot_id?: string | null;
          onchain_proposal_id?: string | null;
          content_cid?: string | null;
          title: string;
          summary?: string | null;
          category: 'treasury' | 'governance' | 'charter' | 'other';
          proposer_address: string;
          status?: 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
          votes_for?: number;
          votes_against?: number;
          votes_abstain?: number;
          voting_starts_at: string;
          voting_ends_at: string;
          executed_at?: string | null;
          executed_tx_hash?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
          votes_for?: number;
          votes_against?: number;
          votes_abstain?: number;
          executed_at?: string | null;
          executed_tx_hash?: string | null;
        };
      };
      profiles: {
        Row: {
          wallet_address: string;
          display_name: string | null;
          bio: string | null;
          avatar_cid: string | null;
          twitter_handle: string | null;
          farcaster_fid: string | null;
          website_url: string | null;
          notification_email: string | null;
          notification_settings: Record<string, unknown>;
          profile_visibility: 'public' | 'members_only' | 'private';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          wallet_address: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_cid?: string | null;
          twitter_handle?: string | null;
          farcaster_fid?: string | null;
          website_url?: string | null;
          notification_email?: string | null;
          notification_settings?: Record<string, unknown>;
          profile_visibility?: 'public' | 'members_only' | 'private';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          bio?: string | null;
          avatar_cid?: string | null;
          twitter_handle?: string | null;
          farcaster_fid?: string | null;
          website_url?: string | null;
          notification_email?: string | null;
          notification_settings?: Record<string, unknown>;
          profile_visibility?: 'public' | 'members_only' | 'private';
          updated_at?: string;
        };
      };
      token_launches: {
        Row: {
          id: string;
          group_id: string;
          launch_type: FundingModelType;
          contract_address: string | null;
          treasury_address: string | null;
          initial_price: number | null;
          initial_supply: number | null;
          donation_address: string | null;
          min_donation: number | null;
          subscription_price: number | null;
          billing_period: 'monthly' | 'yearly' | null;
          launched_at: string;
          launched_by: string;
          tx_hash: string | null;
          block_number: number | null;
        };
        Insert: {
          id?: string;
          group_id: string;
          launch_type: FundingModelType;
          contract_address?: string | null;
          treasury_address?: string | null;
          initial_price?: number | null;
          initial_supply?: number | null;
          donation_address?: string | null;
          min_donation?: number | null;
          subscription_price?: number | null;
          billing_period?: 'monthly' | 'yearly' | null;
          launched_at?: string;
          launched_by: string;
          tx_hash?: string | null;
          block_number?: number | null;
        };
        Update: never;
      };
    };
  };
}

// Convenience types
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupInsert = Database['public']['Tables']['groups']['Insert'];
export type GroupUpdate = Database['public']['Tables']['groups']['Update'];

export type Member = Database['public']['Tables']['members']['Row'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];

export type Activity = Database['public']['Tables']['activity']['Row'];
export type ActivityInsert = Database['public']['Tables']['activity']['Insert'];

export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type ProposalInsert = Database['public']['Tables']['proposals']['Insert'];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type TokenLaunch = Database['public']['Tables']['token_launches']['Row'];
export type TokenLaunchInsert = Database['public']['Tables']['token_launches']['Insert'];
