// Utility functions for quiz question formatting

export interface FormattedQuizQuestion {
  id: string;
  question: string;
  options: { [key: string]: string };
  correct_answer: string;
}

/**
 * Formats a quiz question to a consistent format for backend processing
 * SEMPRE reprocessa questões para garantir consistência total
 */
export function formatQuizQuestion(question: any): FormattedQuizQuestion {
  console.log('🔧 formatQuizQuestion - Original question:', JSON.stringify(question, null, 2));
  
  const options: { [key: string]: string } = {};
  const letters = ['a', 'b', 'c', 'd'];
  let correctAnswerText = question.correct_answer;

  // CASO 1: Questão já tem options como objeto (banco de dados formato objeto)
  if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
    console.log('🔧 Processing object format question');
    
    // Reprocessar para garantir consistência
    const optionEntries = Object.entries(question.options);
    optionEntries.forEach(([key, text], index) => {
      const letter = letters[index] || key;
      options[letter] = String(text);
      
      // Se o correct_answer é uma letra, converter para texto
      if (question.correct_answer === key || question.correct_answer === letter) {
        correctAnswerText = String(text);
      }
    });
  }
  // CASO 2: Questão tem options como array
  else if (Array.isArray(question.options)) {
    console.log('🔧 Processing array format question');
    
    question.options.forEach((option: any, index: number) => {
      const letter = letters[index] || String(index);
      
      if (typeof option === 'string') {
        options[letter] = option;
        // Se este texto combina com correct_answer, manter
        if (option === question.correct_answer) {
          correctAnswerText = option;
        }
      } else if (option && typeof option === 'object') {
        options[letter] = option.text || String(option);
        // Se esta opção está marcada como correta, usar seu texto
        if (option.isCorrect) {
          correctAnswerText = option.text || String(option);
        }
      }
    });
  }
  // CASO 3: Formato inesperado - fallback
  else {
    console.warn('🔧 Unexpected question format, using fallback:', question);
    options['a'] = 'Option A';
    options['b'] = 'Option B';
    options['c'] = 'Option C';
    options['d'] = 'Option D';
    correctAnswerText = 'Option A';
  }

  // Se correct_answer ainda é uma letra, tentar encontrar o texto correspondente
  if (correctAnswerText && correctAnswerText.length === 1 && letters.includes(correctAnswerText.toLowerCase())) {
    correctAnswerText = options[correctAnswerText.toLowerCase()] || correctAnswerText;
  }

  const result = {
    id: String(question.id || Math.random()),
    question: question.question,
    options,
    correct_answer: correctAnswerText // SEMPRE texto completo
  };

  console.log('🔧 formatQuizQuestion - Final result:', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Converts formatted question back to interface format for display
 */
export function convertToInterfaceQuestion(question: FormattedQuizQuestion) {
  const options = Object.entries(question.options).map(([key, text]) => ({
    id: key,
    text: text,
    isCorrect: text === question.correct_answer
  }));
  
  return {
    id: question.id,
    question: question.question,
    options: options
  };
}

/**
 * Validates if a question has the correct format for backend processing
 */
export function isValidQuestionFormat(question: any): boolean {
  return (
    question &&
    typeof question === 'object' &&
    question.question &&
    question.options &&
    typeof question.options === 'object' &&
    !Array.isArray(question.options) &&
    question.correct_answer &&
    typeof question.correct_answer === 'string'
  );
}