import { useState, useEffect } from 'react';
import { usePlatformDetection } from './use-platform-detection';
import { supabase } from '@/integrations/supabase/client';

interface AppConfig {
  supabase_url: string;
  supabase_anon_key: string;
  app_url: string;
  api_url: string;
  features: {
    push_notifications: boolean;
    social_features: boolean;
    marketplace: boolean;
  };
  platform_specific: {
    ios: {
      app_store_url: string;
      deep_link_scheme: string;
    };
    android: {
      play_store_url: string;
      deep_link_scheme: string;
    };
    web: {
      pwa_enabled: boolean;
    };
  };
}

const getLocalConfig = (platform: string, mode: string): AppConfig => ({
  supabase_url: import.meta.env.VITE_SUPABASE_URL || "https://uabdmohhzsertxfishoh.supabase.co",
  supabase_anon_key: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYmRtb2hoenNlcnR4ZmlzaG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MDEyNTIsImV4cCI6MjA2NzA3NzI1Mn0.Dbmi7MvETErWGrvC-lJ_5gIf2lGRxWTKIoAm9N9U9KE",
  app_url: import.meta.env.VITE_APP_URL || "http://localhost:8080",
  api_url: import.meta.env.VITE_API_URL || "https://uabdmohhzsertxfishoh.supabase.co",
  features: {
    push_notifications: platform !== "web",
    social_features: true,
    marketplace: true,
  },
  platform_specific: {
    ios: {
      app_store_url: "https://apps.apple.com/app/satoshi-finance-verse",
      deep_link_scheme: "satoshifinance://",
    },
    android: {
      play_store_url: "https://play.google.com/store/apps/details?id=com.satoshifinance.app",
      deep_link_scheme: "satoshifinance://",
    },
    web: {
      pwa_enabled: true,
    },
  },
});

export const useAppConfig = () => {
  const { platform, mode } = usePlatformDetection();
  const [config, setConfig] = useState<AppConfig>(() => getLocalConfig(platform, mode));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRemoteConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-app-config', {
          body: { platform, mode }
        });

        if (error) throw error;
        
        setConfig(data);
      } catch (error) {
        console.warn('Failed to fetch remote config, using local fallback:', error);
        setConfig(getLocalConfig(platform, mode));
      } finally {
        setLoading(false);
      }
    };

    fetchRemoteConfig();
  }, [platform, mode]);

  return { config, loading };
};
