import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { botId, newNickname } = await req.json();
    console.log(`Updating single bot: ${botId} to ${newNickname}`);

    // Verificar se o bot existe
    const { data: bot, error: fetchError } = await supabase
      .from("profiles")
      .select("id, nickname, is_bot")
      .eq("id", botId)
      .eq("is_bot", true)
      .single();

    if (fetchError || !bot) {
      throw new Error("Bot não encontrado ou não é um bot válido");
    }

    // Verificar se o nickname já está em uso
    const { data: existingNickname } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("nickname", newNickname)
      .single();

    if (existingNickname) {
      throw new Error(`Nickname '${newNickname}' já está em uso`);
    }

    // Atualizar o nickname
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ nickname: newNickname })
      .eq("id", botId);

    if (updateError) {
      throw new Error(`Erro ao atualizar: ${updateError.message}`);
    }

    console.log(`Bot atualizado com sucesso: ${bot.nickname} → ${newNickname}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bot atualizado com sucesso",
        old_nickname: bot.nickname,
        new_nickname: newNickname,
        bot_id: botId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in update-single-bot:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});