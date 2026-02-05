'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Group, GroupInsert, Member, Activity } from '@/lib/types/database';
import { parseEther } from '@/lib/contracts';

// Query keys
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...groupKeys.lists(), filters] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  members: (groupId: string) => [...groupKeys.detail(groupId), 'members'] as const,
  activity: (groupId: string) => [...groupKeys.detail(groupId), 'activity'] as const,
};

// Fetch all public groups
export function useGroups(options?: {
  orderBy?: 'market_cap' | 'member_count' | 'created_at' | 'token_price';
  ascending?: boolean;
  limit?: number;
}) {
  const { orderBy = 'market_cap', ascending = false, limit = 50 } = options || {};
  
  return useQuery({
    queryKey: groupKeys.list({ orderBy, ascending, limit }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order(orderBy, { ascending })
        .limit(limit);
      
      if (error) throw error;
      return data as Group[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Fetch a single group by ID
export function useGroup(groupId: string | undefined) {
  return useQuery({
    queryKey: groupKeys.detail(groupId || ''),
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID required');
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (error) throw error;
      return data as Group;
    },
    enabled: !!groupId,
    staleTime: 10 * 1000, // 10 seconds for individual group
  });
}

// Fetch group by contract address
export function useGroupByContract(contractAddress: string | undefined) {
  return useQuery({
    queryKey: ['group', 'contract', contractAddress],
    queryFn: async () => {
      if (!contractAddress) throw new Error('Contract address required');
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('contract_address', contractAddress)
        .single();
      
      if (error) throw error;
      return data as Group;
    },
    enabled: !!contractAddress,
    staleTime: 10 * 1000,
  });
}

// Fetch group members
export function useGroupMembers(groupId: string | undefined) {
  return useQuery({
    queryKey: groupKeys.members(groupId || ''),
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID required');
      
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId)
        .order('token_balance', { ascending: false });
      
      if (error) throw error;
      return data as Member[];
    },
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
}

// Fetch group activity
export function useGroupActivity(groupId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: groupKeys.activity(groupId || ''),
    queryFn: async () => {
      if (!groupId) throw new Error('Group ID required');
      
      const { data, error } = await supabase
        .from('activity')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!groupId,
    staleTime: 15 * 1000,
  });
}

// Create a new group
export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (group: GroupInsert) => {
      const { data, error } = await supabase
        .from('groups')
        .insert(group)
        .select()
        .single();
      
      if (error) throw error;
      return data as Group;
    },
    onSuccess: (newGroup) => {
      // Add to cache
      queryClient.setQueryData(groupKeys.detail(newGroup.id), newGroup);
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
}

// Buy tokens with optimistic update
export function useBuyTokens(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ amount, walletAddress }: { amount: number; walletAddress: string }) => {
      // In a real implementation, this would:
      // 1. Call the smart contract
      // 2. Wait for transaction confirmation
      // 3. Return the transaction receipt
      
      // For now, we'll simulate the optimistic update
      // The actual transaction would be handled by the wallet
      return { amount, walletAddress };
    },
    onMutate: async ({ amount, walletAddress }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: groupKeys.detail(groupId) });
      
      // Snapshot previous value
      const previousGroup = queryClient.getQueryData<Group>(groupKeys.detail(groupId));
      
      if (previousGroup) {
        // Calculate optimistic new price (simple approximation)
        const priceIncrease = amount / (previousGroup.total_supply + amount) * 0.05;
        const newPrice = previousGroup.token_price * (1 + priceIncrease);
        const fee = amount * previousGroup.token_price * 0.02;
        
        // Optimistically update the group
        queryClient.setQueryData<Group>(groupKeys.detail(groupId), {
          ...previousGroup,
          token_price: newPrice,
          total_supply: previousGroup.total_supply + amount,
          treasury_balance: previousGroup.treasury_balance + fee,
        });
      }
      
      return { previousGroup };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousGroup) {
        queryClient.setQueryData(groupKeys.detail(groupId), context.previousGroup);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to sync with server
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.activity(groupId) });
    },
  });
}

// Sell tokens with optimistic update
export function useSellTokens(groupId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ amount, walletAddress }: { amount: number; walletAddress: string }) => {
      // Would call smart contract in real implementation
      return { amount, walletAddress };
    },
    onMutate: async ({ amount }) => {
      await queryClient.cancelQueries({ queryKey: groupKeys.detail(groupId) });
      
      const previousGroup = queryClient.getQueryData<Group>(groupKeys.detail(groupId));
      
      if (previousGroup) {
        // Calculate optimistic new price
        const priceDecrease = amount / previousGroup.total_supply * 0.05;
        const newPrice = previousGroup.token_price * (1 - priceDecrease);
        
        queryClient.setQueryData<Group>(groupKeys.detail(groupId), {
          ...previousGroup,
          token_price: Math.max(0.001, newPrice),
          total_supply: Math.max(0, previousGroup.total_supply - amount),
        });
      }
      
      return { previousGroup };
    },
    onError: (err, variables, context) => {
      if (context?.previousGroup) {
        queryClient.setQueryData(groupKeys.detail(groupId), context.previousGroup);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.activity(groupId) });
    },
  });
}

// Search groups
export function useSearchGroups(searchTerm: string) {
  return useQuery({
    queryKey: ['groups', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,token_symbol.ilike.%${searchTerm}%`)
        .order('market_cap', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as Group[];
    },
    enabled: searchTerm.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Get user's groups (where they hold tokens)
export function useUserGroups(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ['user', walletAddress, 'groups'],
    queryFn: async () => {
      if (!walletAddress) throw new Error('Wallet address required');
      
      const { data, error } = await supabase
        .from('members')
        .select(`
          token_balance,
          role,
          joined_at,
          groups (*)
        `)
        .eq('wallet_address', walletAddress)
        .gt('token_balance', 0);
      
      if (error) throw error;
      return data;
    },
    enabled: !!walletAddress,
    staleTime: 30 * 1000,
  });
}
