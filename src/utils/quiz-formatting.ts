import { QuizQuestion } from '@/types/quiz';

/**
 * Converts old quiz question format to new standardized format
 * Handles legacy questions with options as object {a: "...", b: "..."} 
 * and converts them to array format with proper IDs
 */
export function formatQuizQuestion(question: any): QuizQuestion {
  // Ensure ID is always a string
  const formattedQuestion = {
    ...question,
    id: String(question.id)
  };

  // If already in correct format, return as is
  if (Array.isArray(formattedQuestion.options)) {
    return formattedQuestion as QuizQuestion;
  }

  // Convert old format {a: "...", b: "...", c: "...", d: "..."} to new array format
  if (formattedQuestion.options && typeof formattedQuestion.options === 'object') {
    const optionKeys = ['a', 'b', 'c', 'd'];
    const convertedOptions = optionKeys
      .filter(key => formattedQuestion.options[key]) // Only include non-empty options
      .map(key => ({
        id: key,
        text: formattedQuestion.options[key],
        isCorrect: formattedQuestion.options[key] === formattedQuestion.correct_answer
      }));

    console.log(`Quiz formatting: Question ${formattedQuestion.id} - ${convertedOptions.filter(o => o.isCorrect).length} correct options found`);

    return {
      ...formattedQuestion,
      options: convertedOptions
    };
  }

  // Fallback: return question as is if format is unexpected
  console.warn('Unexpected question format:', formattedQuestion);
  return formattedQuestion as QuizQuestion;
}

/**
 * Formats an array of quiz questions, converting any legacy formats
 */
export function formatQuizQuestions(questions: any[]): QuizQuestion[] {
  return questions.map(formatQuizQuestion);
}