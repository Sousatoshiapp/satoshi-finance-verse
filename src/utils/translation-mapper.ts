import { supabase } from '@/integrations/supabase/client';

export async function analyzeQuestionTranslationCoverage() {
  try {
    console.log('🔍 Analyzing question translation coverage...');
    
    const { data: allQuestions, error } = await supabase
      .from('quiz_questions')
      .select('id, question, category, difficulty')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      return;
    }

    console.log(`📊 Total questions in database: ${allQuestions?.length || 0}`);
    
    const byCategory = allQuestions?.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const byDifficulty = allQuestions?.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    console.log('📈 Questions by category:', byCategory);
    console.log('📊 Questions by difficulty:', byDifficulty);

    const sampleQuestions = allQuestions?.slice(0, 10) || [];
    console.log('📝 Sample questions from database:');
    sampleQuestions.forEach((q, index) => {
      console.log(`${index + 1}. "${q.question}" (${q.category}, ${q.difficulty})`);
    });

    return {
      total: allQuestions?.length || 0,
      byCategory,
      byDifficulty,
      sampleQuestions: sampleQuestions.map(q => q.question)
    };
  } catch (error) {
    console.error('Error analyzing questions:', error);
    return null;
  }
}

export function createEnhancedTranslationMatcher() {
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  return {
    findBestMatch: (questionText: string, translationKeys: string[], threshold = 0.8) => {
      let bestMatch: string | null = null;
      let bestScore = 0;

      for (const key of translationKeys) {
        const similarity = calculateSimilarity(questionText.toLowerCase(), key.toLowerCase());
        if (similarity > bestScore && similarity >= threshold) {
          bestScore = similarity;
          bestMatch = key;
        }
      }

      return { match: bestMatch, score: bestScore };
    }
  };
}
