'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { groupKeys } from './useGroups';
import type { Group, Member, Activity } from '@/lib/types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Subscribe to real-time group updates
export function useGroupRealtime(groupId: string | undefined) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!groupId) return;
    
    // Subscribe to group updates
    const groupChannel = supabase
      .channel(`group:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'groups',
          filter: `id=eq.${groupId}`,
        },
        (payload: RealtimePostgresChangesPayload<Group>) => {
          console.log('Group updated via realtime:', payload);
          
          // Update cache directly
          queryClient.setQueryData<Group>(groupKeys.detail(groupId), (old) => {
            if (!old) return old;
            return { ...old, ...payload.new };
          });
        }
      )
      .subscribe();
    
    // Subscribe to member changes
    const membersChannel = supabase
      .channel(`members:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'members',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          console.log('Members changed via realtime:', payload);
          // Invalidate members query to refetch
          queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
        }
      )
      .subscribe();
    
    // Subscribe to new activity
    const activityChannel = supabase
      .channel(`activity:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: RealtimePostgresChangesPayload<Activity>) => {
          console.log('New activity via realtime:', payload);
          
          // Add new activity to cache
          queryClient.setQueryData<Activity[]>(groupKeys.activity(groupId), (old) => {
            if (!old) return [payload.new as Activity];
            return [payload.new as Activity, ...old];
          });
        }
      )
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(groupChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [groupId, queryClient]);
}

// Subscribe to all groups for explore page
export function useGroupsRealtime() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const channel = supabase
      .channel('groups:all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups',
        },
        (payload) => {
          console.log('Groups changed via realtime:', payload);
          // Invalidate lists to refetch
          queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
          
          // Update individual group cache if available
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            const newGroup = payload.new as Group;
            queryClient.setQueryData<Group>(groupKeys.detail(newGroup.id), (old) => {
              if (!old) return old;
              return { ...old, ...newGroup };
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// Subscribe to user's membership changes
export function useUserMembershipRealtime(walletAddress: string | undefined) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!walletAddress) return;
    
    const channel = supabase
      .channel(`user:${walletAddress}:memberships`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'members',
          filter: `wallet_address=eq.${walletAddress}`,
        },
        (payload) => {
          console.log('User membership changed via realtime:', payload);
          queryClient.invalidateQueries({ queryKey: ['user', walletAddress, 'groups'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, queryClient]);
}

// Hook to force refresh from blockchain
export function useRefreshFromChain() {
  const queryClient = useQueryClient();
  
  const refreshGroup = useCallback(async (groupId: string) => {
    // Invalidate all related queries
    await queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
    await queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });
    await queryClient.invalidateQueries({ queryKey: groupKeys.activity(groupId) });
    
    // The indexer will update the database, and realtime will push updates
  }, [queryClient]);
  
  const refreshAll = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: groupKeys.all });
  }, [queryClient]);
  
  return { refreshGroup, refreshAll };
}

// Price ticker hook for real-time price updates
export function usePriceTicker(groupId: string | undefined, intervalMs = 5000) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!groupId) return;
    
    // Poll for price updates (backup for realtime)
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('token_price, total_supply, treasury_balance')
          .eq('id', groupId)
          .single();
        
        if (!error && data) {
          queryClient.setQueryData<Group>(groupKeys.detail(groupId), (old) => {
            if (!old) return old;
            return {
              ...old,
              token_price: data.token_price,
              total_supply: data.total_supply,
              treasury_balance: data.treasury_balance,
            };
          });
        }
      } catch (e) {
        console.error('Price ticker error:', e);
      }
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [groupId, intervalMs, queryClient]);
}
