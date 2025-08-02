import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const platform = url.searchParams.get("platform") || "web";
    const mode = url.searchParams.get("mode") || "production";

    const config: AppConfig = {
      supabase_url: Deno.env.get("SUPABASE_URL") ?? "",
      supabase_anon_key: Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      app_url: mode === "production" ? "https://app.satoshifinance.com" : 
               mode === "staging" ? "https://staging.satoshifinance.com" : 
               "http://localhost:8080",
      api_url: Deno.env.get("SUPABASE_URL") ?? "",
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
    };

    return new Response(JSON.stringify(config), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
