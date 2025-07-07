import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: string;
  effect_value: number;
  rarity: string;
  price: number;
  image_url?: string;
}

interface UserPowerUp {
  id: string;
  power_up_id: string;
  quantity: number;
  power_up: PowerUp;
}

interface LootItem {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  lore_text?: string;
}

interface QuizState {
  currentQuestion: number;
  score: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
  eliminatedOptions: string[];
  canReview: boolean;
  powerUpsUsed: string[];
  lootEarned: LootItem[];
  totalQuestions: number;
  performanceScore: number;
}

export function useEnhancedQuiz(questions: any[], initialTime = 30) {
  const { toast } = useToast();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeLeft: initialTime,
    eliminatedOptions: [],
    canReview: false,
    powerUpsUsed: [],
    lootEarned: [],
    totalQuestions: questions.length,
    performanceScore: 0
  });

  const [userPowerUps, setUserPowerUps] = useState<UserPowerUp[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Load user power-ups
  useEffect(() => {
    loadUserPowerUps();
  }, []);

  const loadUserPowerUps = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: powerUps } = await supabase
        .from('user_power_ups')
        .select(`
          *,
          power_up:power_ups(*)
        `)
        .eq('user_id', profile.id)
        .gt('quantity', 0);

      setUserPowerUps(powerUps || []);
    } catch (error) {
      console.error('Error loading power-ups:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizActive && quizState.timeLeft > 0) {
      timer = setTimeout(() => {
        setQuizState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isQuizActive, quizState.timeLeft]);

  const startQuiz = useCallback(() => {
    setIsQuizActive(true);
    setQuizState(prev => ({
      ...prev,
      timeLeft: initialTime,
      currentQuestion: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      eliminatedOptions: [],
      canReview: false,
      powerUpsUsed: [],
      lootEarned: [],
      performanceScore: 0
    }));
  }, [initialTime]);

  const usePowerUp = useCallback(async (powerUpId: string, powerUpType: string) => {
    const powerUp = userPowerUps.find(up => up.power_up.id === powerUpId);
    if (!powerUp || powerUp.quantity <= 0) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      // Update quantity in database
      await supabase
        .from('user_power_ups')
        .update({ quantity: powerUp.quantity - 1 })
        .eq('id', powerUp.id);

      // Apply power-up effect
      switch (powerUpType) {
        case 'eliminate_option':
          const currentQ = questions[quizState.currentQuestion];
          if (currentQ) {
            const incorrectOptions = currentQ.options.filter((opt: string) => opt !== currentQ.correct_answer);
            const toEliminate = incorrectOptions.slice(0, powerUp.power_up.effect_value);
            setQuizState(prev => ({
              ...prev,
              eliminatedOptions: [...prev.eliminatedOptions, ...toEliminate],
              powerUpsUsed: [...prev.powerUpsUsed, powerUpId]
            }));
          }
          break;

        case 'extra_time':
          setQuizState(prev => ({
            ...prev,
            timeLeft: prev.timeLeft + powerUp.power_up.effect_value,
            powerUpsUsed: [...prev.powerUpsUsed, powerUpId]
          }));
          break;

        case 'review_answer':
          setQuizState(prev => ({
            ...prev,
            canReview: true,
            powerUpsUsed: [...prev.powerUpsUsed, powerUpId]
          }));
          break;

        case 'combo_multiplier':
          setQuizState(prev => ({
            ...prev,
            powerUpsUsed: [...prev.powerUpsUsed, powerUpId]
          }));
          break;
      }

      // Update local state
      setUserPowerUps(prev => 
        prev.map(up => 
          up.id === powerUp.id 
            ? { ...up, quantity: up.quantity - 1 }
            : up
        )
      );

      toast({
        title: "Power-up Ativado!",
        description: powerUp.power_up.description,
        duration: 2000,
      });

      return true;
    } catch (error) {
      console.error('Error using power-up:', error);
      return false;
    }
  }, [userPowerUps, quizState.currentQuestion, questions, toast]);

  const submitAnswer = useCallback(async (selectedAnswer: string) => {
    const currentQ = questions[quizState.currentQuestion];
    if (!currentQ) return;

    const isCorrect = selectedAnswer === currentQ.correct_answer;
    const timeBonus = Math.max(0, quizState.timeLeft / initialTime);
    const responseTime = initialTime - quizState.timeLeft;

    let newCombo = isCorrect ? quizState.combo + 1 : 0;
    let comboMultiplier = 1;
    
    // Check if combo amplifier is active
    const hasComboAmplifier = quizState.powerUpsUsed.some(powerUpId => {
      const powerUp = userPowerUps.find(up => up.power_up.id === powerUpId);
      return powerUp?.power_up.type === 'combo_multiplier';
    });

    if (hasComboAmplifier && newCombo > 0) {
      comboMultiplier = 2;
    }

    // Base score calculation
    let questionScore = 0;
    if (isCorrect) {
      questionScore = Math.round((100 + (timeBonus * 50) + (newCombo * 10)) * comboMultiplier);
    }

    // Check for loot drops
    const lootChance = isCorrect ? (0.1 + (newCombo * 0.02)) : 0;
    let newLoot: LootItem[] = [];
    
    if (Math.random() < lootChance && isCorrect) {
      // Award random loot
      try {
        const { data: lootItems } = await supabase
          .from('loot_items')
          .select('*')
          .limit(1);
        
        if (lootItems && lootItems.length > 0) {
          newLoot = [lootItems[0]];
          
          // Save to user's collection
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('user_id', user.id)
              .single();
            
            if (profile) {
              await supabase
                .from('user_loot')
                .insert({
                  user_id: profile.id,
                  loot_item_id: lootItems[0].id,
                  source: 'quiz_performance'
                });
            }
          }

          toast({
            title: "🎁 Loot Encontrado!",
            description: `Você encontrou: ${lootItems[0].name}`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error awarding loot:', error);
      }
    }

    setQuizState(prev => ({
      ...prev,
      score: prev.score + questionScore,
      combo: newCombo,
      maxCombo: Math.max(prev.maxCombo, newCombo),
      performanceScore: prev.performanceScore + questionScore,
      lootEarned: [...prev.lootEarned, ...newLoot],
      eliminatedOptions: [], // Reset for next question
      canReview: false,
      timeLeft: initialTime // Reset timer for next question
    }));

    return { isCorrect, questionScore, newCombo, lootEarned: newLoot };
  }, [quizState, questions, initialTime, userPowerUps, toast]);

  const nextQuestion = useCallback(() => {
    if (quizState.currentQuestion < questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        timeLeft: initialTime,
        eliminatedOptions: [],
        canReview: false
      }));
    } else {
      setIsQuizActive(false);
      // Quiz completed
    }
  }, [quizState.currentQuestion, questions.length, initialTime]);

  const finishQuiz = useCallback(async () => {
    setIsQuizActive(false);
    
    // Save quiz session with enhanced data
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      await supabase
        .from('quiz_sessions')
        .insert({
          user_id: profile.id,
          questions_total: questions.length,
          questions_correct: quizState.score,
          questions_incorrect: questions.length - quizState.score,
          combo_count: quizState.combo,
          max_combo: quizState.maxCombo,
          power_ups_used: quizState.powerUpsUsed,
          loot_earned: quizState.lootEarned.map(item => item.id),
          performance_score: quizState.performanceScore,
          session_type: 'enhanced_quiz',
          completed_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error saving quiz session:', error);
    }
  }, [quizState, questions.length]);

  return {
    quizState,
    userPowerUps,
    isQuizActive,
    startQuiz,
    usePowerUp,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    loadUserPowerUps
  };
}