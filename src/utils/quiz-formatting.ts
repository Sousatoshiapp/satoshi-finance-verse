// Utility functions for quiz question formatting

export interface FormattedQuizQuestion {
  id: string;
  question: string;
  options: { [key: string]: string };
  correct_answer: string;
}

/**
 * Formats a quiz question to a consistent format for backend processing
 */
export function formatQuizQuestion(question: any): FormattedQuizQuestion {
  // If it's already in the correct format, return as is
  if (question.options && typeof question.options === 'object' && !Array.isArray(question.options) && question.correct_answer) {
    return {
      id: String(question.id || Math.random()),
      question: question.question,
      options: question.options,
      correct_answer: question.correct_answer
    };
  }

  // Convert from array format to object format
  if (Array.isArray(question.options)) {
    const options: { [key: string]: string } = {};
    const letters = ['a', 'b', 'c', 'd'];
    let correctAnswerLetter = 'a';

    question.options.forEach((option: any, index: number) => {
      const letter = letters[index] || String(index);
      
      if (typeof option === 'string') {
        options[letter] = option;
        // If this matches the correct answer, store the letter
        if (option === question.correct_answer) {
          correctAnswerLetter = letter;
        }
      } else if (option && typeof option === 'object') {
        options[letter] = option.text || String(option);
        // If this option is marked as correct, store the letter
        if (option.isCorrect) {
          correctAnswerLetter = letter;
        }
      }
    });

    return {
      id: String(question.id || Math.random()),
      question: question.question,
      options,
      correct_answer: correctAnswerLetter
    };
  }

  // Fallback for unexpected formats
  console.warn('Unexpected question format, using fallback:', question);
  return {
    id: String(question.id || Math.random()),
    question: question.question || 'Question not available',
    options: {
      a: 'Option A',
      b: 'Option B', 
      c: 'Option C',
      d: 'Option D'
    },
    correct_answer: 'a'
  };
}

/**
 * Converts formatted question back to interface format for display
 */
export function convertToInterfaceQuestion(question: FormattedQuizQuestion) {
  const options = Object.entries(question.options).map(([key, text]) => ({
    id: key,
    text: text,
    isCorrect: key === question.correct_answer
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