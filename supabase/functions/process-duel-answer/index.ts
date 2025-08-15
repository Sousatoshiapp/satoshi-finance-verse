// SISTEMA ANTIGO COMENTADO - JANEIRO 2025
// Esta edge function foi desabilitada durante a migração para o novo sistema de duelo unificado
// Agora apenas as funções unified-* estão ativas para processamento de duelos
// Mantido para referência durante a migração

/*
CÓDIGO ORIGINAL DO PROCESS-DUEL-ANSWER COMENTADO PARA MIGRAÇÃO

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
... [todo o código original foi desabilitado - ver git history para código completo]
*/

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.warn('⚠️ process-duel-answer is LEGACY - use unified system functions');
  
  return new Response(
    JSON.stringify({ 
      error: 'This function is legacy - use unified system',
      success: false 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 410 // Gone
    }
  );
});