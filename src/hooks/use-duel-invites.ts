import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { useQuery } from '@tanstack/react-query';

export interface DuelInvite {
  id: string;
  challenger_id: string;
  challenged_id: string;
  quiz_topic: string;
  bet_amount?: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
  challenger_profile?: {
    nickname: string;
    avatar_url?: string;
  };
}

export function useDuelInvites() {
  const { profile } = useProfile();

  const fetchInvites = async (): Promise<DuelInvite[]> => {
    if (!profile?.id) return [];

    const { data, error } = await supabase
      .from('duel_invites')
      .select(`
        *,
        challenger_profile:profiles!challenger_id (
          nickname,
          avatar_url:profile_image_url
        )
      `)
      .eq('challenged_id', profile.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading invites:', error);
      return [];
    }

    return (data as any[])?.map(invite => ({
      ...invite,
      challenger_profile: invite.challenger_profile?.[0]
    })) || [];
  };

  const { 
    data: invites = [], 
    isLoading: loading, 
    refetch: loadInvites 
  } = useQuery({
    queryKey: ['duelInvites', profile?.id], 
    queryFn: fetchInvites,
    enabled: !!profile?.id,
    refetchInterval: 5000, // Poll every 5 seconds for new invites
  });

  // Send invite function
  const sendInvite = async (challengedId: string, topic: string, betAmount?: number) => {
    if (!profile?.id) return { success: false, error: 'Profile not loaded' };

    try {
      const { error } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: profile.id,
          challenged_id: challengedId,
          quiz_topic: topic,
          bet_amount: betAmount || 0,
          status: 'pending'
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error sending invite:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    invites,
    loading,
    loadInvites,
    sendInvite
  };
}