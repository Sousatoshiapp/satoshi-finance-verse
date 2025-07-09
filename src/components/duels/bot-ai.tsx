import { supabase } from "@/integrations/supabase/client";

export class BotAI {
  static async handleBotTurn(duelId: string, botProfileId: string) {
    try {
      // Buscar o duelo atual
      const { data: duel } = await supabase
        .from('duels')
        .select('*')
        .eq('id', duelId)
        .single();

      if (!duel || duel.current_turn !== botProfileId) return;

      // Buscar configuração do bot
      const { data: botConfig } = await supabase
        .from('bot_duel_configs')
        .select('*')
        .eq('bot_profile_id', botProfileId)
        .single();

      const accuracy = botConfig?.accuracy_percentage || 0.7;
      const responseTime = Math.random() * (botConfig?.response_time_max || 8000 - botConfig?.response_time_min || 2000) + (botConfig?.response_time_min || 2000);

      // Simular tempo de resposta do bot
      await new Promise(resolve => setTimeout(resolve, responseTime));

      const currentQuestion = duel.questions[duel.current_question - 1];
      const isPlayer1 = botProfileId === duel.player1_id;
      
      // Determinar resposta baseada na precisão do bot
      let selectedOption;
      if (Math.random() < accuracy) {
        // Bot acerta - escolhe a resposta correta
        selectedOption = currentQuestion.options.find((opt: any) => opt.isCorrect);
      } else {
        // Bot erra - escolhe uma resposta aleatória incorreta
        const incorrectOptions = currentQuestion.options.filter((opt: any) => !opt.isCorrect);
        selectedOption = incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];
      }

      const isCorrect = selectedOption?.isCorrect || false;

      // Atualizar respostas e pontuação do bot
      const currentAnswers = (isPlayer1 ? duel.player1_answers : duel.player2_answers) as any[] || [];
      const currentScore = (isPlayer1 ? duel.player1_score : duel.player2_score) as number || 0;

      const newAnswers = [...currentAnswers, {
        questionId: currentQuestion.id,
        answerId: selectedOption?.id,
        isCorrect,
        timeSpent: Math.floor(responseTime / 1000)
      }];

      const newScore = currentScore + (isCorrect ? 1 : 0);

      // Determinar próximo turno
      const nextTurn = isPlayer1 ? duel.player2_id : duel.player1_id;
      const nextQuestion = duel.current_question + 1;

      // Verificar se o duelo terminou
      const questionsLength = Array.isArray(duel.questions) ? duel.questions.length : 0;
      const isFinished = nextQuestion > questionsLength;

      const updateData: any = {
        current_turn: isFinished ? null : nextTurn,
        current_question: isFinished ? duel.current_question : nextQuestion,
        turn_started_at: isFinished ? null : new Date().toISOString()
      };

      if (isPlayer1) {
        updateData.player1_answers = newAnswers;
        updateData.player1_score = newScore;
      } else {
        updateData.player2_answers = newAnswers;
        updateData.player2_score = newScore;
      }

      if (isFinished) {
        updateData.status = 'finished';
        updateData.finished_at = new Date().toISOString();

        // Determinar vencedor
        const finalPlayer1Score = isPlayer1 ? newScore : (duel.player1_score as number || 0);
        const finalPlayer2Score = isPlayer1 ? (duel.player2_score as number || 0) : newScore;

        if (finalPlayer1Score > finalPlayer2Score) {
          updateData.winner_id = duel.player1_id;
        } else if (finalPlayer2Score > finalPlayer1Score) {
          updateData.winner_id = duel.player2_id;
        }
      }

      // Atualizar duelo
      await supabase
        .from('duels')
        .update(updateData)
        .eq('id', duelId);

    } catch (error) {
      console.error('Error handling bot turn:', error);
    }
  }

  static startBotAI(duelId: string) {
    // Configurar listener para turnos do bot
    const channel = supabase
      .channel(`bot-ai-${duelId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'duels',
          filter: `id=eq.${duelId}`
        },
        async (payload) => {
          const duel = payload.new;
          
          // Verificar se é o turno do bot
          if (duel.current_turn && duel.status === 'active') {
            const { data: botProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', duel.current_turn)
              .eq('is_bot', true)
              .single();

            if (botProfile) {
              // É o turno de um bot - processar automaticamente
              await this.handleBotTurn(duelId, botProfile.id);
            }
          }
        }
      )
      .subscribe();

    return channel;
  }
}