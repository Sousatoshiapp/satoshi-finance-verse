// Debug utility for duel system
import { supabase } from '@/integrations/supabase/client';

export const debugDuelSystem = {
  // Test if global invite provider is working
  testGlobalInviteProvider: () => {
    console.log('🔍 Testing Global Duel Invite Provider...');
    
    // Check if GlobalDuelInviteProvider is mounted
    const context = document.querySelector('[data-global-invites="true"]');
    if (context) {
      console.log('✅ GlobalDuelInviteProvider is mounted');
    } else {
      console.log('❌ GlobalDuelInviteProvider NOT mounted');
    }
    
    return !!context;
  },

  // Test realtime subscription status
  testRealtimeConnection: async () => {
    console.log('🔍 Testing Realtime Connection...');
    
    try {
      const channels = supabase.getChannels();
      console.log('📡 Active channels:', channels.length);
      
      channels.forEach((channel, index) => {
        console.log(`📺 Channel ${index + 1}:`, {
          topic: channel.topic,
          state: channel.state,
        });
      });
      
      return channels.length > 0;
    } catch (error) {
      console.error('❌ Error checking realtime connection:', error);
      return false;
    }
  },

  // Check invite table structure
  checkInviteTable: async () => {
    console.log('🔍 Checking duel_invites table...');
    
    try {
      const { data, error } = await supabase
        .from('duel_invites')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Error accessing duel_invites table:', error);
        return false;
      }
      
      console.log('✅ duel_invites table accessible');
      console.log('📊 Sample structure:', data?.[0] || 'No data');
      return true;
    } catch (error) {
      console.error('❌ Exception checking invite table:', error);
      return false;
    }
  },

  // Test invite creation manually
  createTestInvite: async (challengerId: string, challengedId: string) => {
    console.log('🧪 Creating test invite...');
    
    try {
      const { data, error } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: challengerId,
          challenged_id: challengedId,
          quiz_topic: 'financas',
          bet_amount: 50,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating test invite:', error);
        return null;
      }
      
      console.log('✅ Test invite created:', data);
      return data;
    } catch (error) {
      console.error('❌ Exception creating test invite:', error);
      return null;
    }
  },

  // Run full system diagnostic
  runDiagnostic: async () => {
    console.log('🚀 Running duel system diagnostic...');
    
    const results = {
      globalProvider: debugDuelSystem.testGlobalInviteProvider(),
      realtimeConnection: await debugDuelSystem.testRealtimeConnection(),
      inviteTable: await debugDuelSystem.checkInviteTable(),
    };
    
    console.log('📋 Diagnostic Results:', results);
    
    const allPassed = Object.values(results).every(Boolean);
    console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
    
    return results;
  }
};

// Make it available globally for debugging
(window as any).debugDuelSystem = debugDuelSystem;