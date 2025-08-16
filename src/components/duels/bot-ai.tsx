import { supabase } from "@/integrations/supabase/client";

export class BotAI {
  static async handleBotResponse(duelId: string, botProfileId: string) {
    try {
      // Buscar o duelo atual
      const { data: duel } = await supabase
        .from('casino_duels')
        .select('*')
        .eq('id', duelId)
        .single();

      if (!duel || duel.status === 'finished') return;

      // Buscar configuração do bot
      const { data: botConfig } = await supabase
        .from('bot_duel_configs')
        .select('*')
        .eq('bot_profile_id', botProfileId)
        .single();

      const accuracy = botConfig?.accuracy_percentage || 0.7;
      const responseTime = Math.random() * 
        ((botConfig?.response_time_max || 8000) - (botConfig?.response_time_min || 2000)) + 
        (botConfig?.response_time_min || 2000);

      // Simular tempo de resposta do bot
      await new Promise(resolve => setTimeout(resolve, responseTime));

      // Obter pergunta atual do bot
      const isPlayer1 = botProfileId === duel.player1_id;
      const botCurrentQuestion = duel.current_question || 1;
      
      // Verificar se bot ainda precisa responder esta pergunta
      const questionsArray = Array.isArray(duel.questions) ? duel.questions : [];
      if (botCurrentQuestion > questionsArray.length) return;

      const currentQuestion = questionsArray[botCurrentQuestion - 1] as any;
      
      // Determinar resposta baseada na precisão do bot
      let selectedOption;
      if (Math.random() < accuracy && currentQuestion?.options) {
        // Bot acerta - escolhe a resposta correta
        selectedOption = currentQuestion.options.find((opt: any) => opt.isCorrect);
      } else if (currentQuestion?.options) {
        // Bot erra - escolhe uma resposta aleatória incorreta
        const incorrectOptions = currentQuestion.options.filter((opt: any) => !opt.isCorrect);
        selectedOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)] || 
                        currentQuestion.options[Math.floor(Math.random() * currentQuestion.options.length)];
      }

      // Processar resposta usando a nova função RPC
      await supabase.rpc('process_duel_answer', {
        p_duel_id: duelId,
        p_player_id: botProfileId,
        p_question_number: botCurrentQuestion,
        p_answer_id: selectedOption?.id,
        p_is_timeout: false
      });

    } catch (error) {
      console.error('Error handling bot response:', error);
    }
  }

  static startBotAI(duelId: string) {
    // Configurar listener para resposta automática do bot
    const channel = supabase
      .channel(`bot-ai-${duelId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'casino_duels',
          filter: `id=eq.${duelId}`
        },
        async (payload) => {
          const duel = payload.new;
          
          // Verificar se há bots que precisam responder
          if (duel.status === 'active') {
            // Verificar se player1 é bot e precisa responder
            const { data: player1Profile } = await supabase
              .from('profiles')
              .select('id, is_bot')
              .eq('id', duel.player1_id)
              .single();

            const questionsArray = Array.isArray(duel.questions) ? duel.questions : [];
            const currentQuestion = duel.current_question || 1;
            
            if (player1Profile?.is_bot && 
                currentQuestion <= questionsArray.length) {
              // Player1 bot precisa responder
              setTimeout(() => {
                this.handleBotResponse(duelId, player1Profile.id);
              }, Math.random() * 3000 + 1000); // 1-4 segundos de delay
            }

            // Verificar se player2 é bot e precisa responder
            const { data: player2Profile } = await supabase
              .from('profiles')
              .select('id, is_bot')
              .eq('id', duel.player2_id)
              .single();
            
            if (player2Profile?.is_bot && 
                currentQuestion <= questionsArray.length) {
              // Player2 bot precisa responder
              setTimeout(() => {
                this.handleBotResponse(duelId, player2Profile.id);
              }, Math.random() * 3000 + 1000); // 1-4 segundos de delay
            }
          }
        }
      )
      .subscribe();

    return channel;
  }
}