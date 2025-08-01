import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PowerUpdateRequest {
  districtId: string;
  userId: string;
  actionType: string;
}

interface PowerRule {
  powerType: string;
  increment: number;
}

const actionPowerRules: Record<string, PowerRule[]> = {
  'quiz_investimentos': [{ powerType: 'monetary_power', increment: 2 }],
  'duelo_risco': [{ powerType: 'military_power', increment: 3 }],
  'doacao_btz': [
    { powerType: 'monetary_power', increment: 2 },
    { powerType: 'social_power', increment: 1 }
  ],
  'quiz_tecnologia': [{ powerType: 'tech_power', increment: 2 }],
  'missao_energia': [{ powerType: 'energy_power', increment: 1 }],
  'transacao_comercial': [{ powerType: 'commercial_power', increment: 1 }],
  'quiz_distrito': [{ powerType: 'social_power', increment: 1 }],
  'participacao_duelo': [{ powerType: 'military_power', increment: 1 }],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { districtId, userId, actionType }: PowerUpdateRequest = await req.json()

    if (!districtId || !userId || !actionType) {
      throw new Error('Missing required parameters: districtId, userId, actionType')
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: recentAction } = await supabaseClient
      .from('district_power_logs')
      .select('id')
      .eq('district_id', districtId)
      .eq('user_id', userId)
      .eq('action_type', actionType)
      .gte('created_at', twentyFourHoursAgo)
      .limit(1)

    if (recentAction && recentAction.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Cooldown ativo. Aguarde 24h para repetir esta ação.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: district, error: districtError } = await supabaseClient
      .from('districts')
      .select('*')
      .eq('id', districtId)
      .single()

    if (districtError || !district) {
      throw new Error('Distrito não encontrado')
    }

    const powerRules = actionPowerRules[actionType]
    if (!powerRules) {
      throw new Error('Tipo de ação não reconhecido')
    }

    const updates: Record<string, number> = {}
    const logs: any[] = []

    for (const rule of powerRules) {
      const currentValue = district[rule.powerType] || 0
      const newValue = Math.min(100, currentValue + rule.increment)
      
      updates[rule.powerType] = newValue
      
      logs.push({
        district_id: districtId,
        user_id: userId,
        action_type: actionType,
        power_type: rule.powerType,
        power_change: rule.increment,
        previous_value: currentValue,
        new_value: newValue
      })
    }

    const { error: updateError } = await supabaseClient
      .from('districts')
      .update(updates)
      .eq('id', districtId)

    if (updateError) throw updateError

    const { error: logError } = await supabaseClient
      .from('district_power_logs')
      .insert(logs)

    if (logError) throw logError

    return new Response(
      JSON.stringify({ success: true, updates, logs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error updating district power:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
