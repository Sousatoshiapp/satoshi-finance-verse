
import React, { useEffect, useState } from 'react';
import { useQuizTranslations } from '@/hooks/use-quiz-translations';
import { useI18n } from '@/hooks/use-i18n';
import { analyzeQuestionTranslationCoverage } from '@/utils/translation-mapper';
import { QuizQuestion } from '@/types/quiz';

const testQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the main function of a stock exchange?',
    options: [
      { id: 'a', text: 'Lend money to companies', isCorrect: false },
      { id: 'b', text: 'Facilitate trading of securities', isCorrect: true },
      { id: 'c', text: 'Set interest rates', isCorrect: false },
      { id: 'd', text: 'Print money', isCorrect: false }
    ],
    correct_answer: 'Facilitate trading of securities',
    explanation: 'Stock exchanges provide a platform for buying and selling securities.',
    category: 'finance',
    difficulty: 'easy'
  },
  {
    id: '2', 
    question: 'What is inflation?',
    options: [
      { id: 'a', text: 'Price increase', isCorrect: true },
      { id: 'b', text: 'Price decrease', isCorrect: false },
      { id: 'c', text: 'Currency exchange', isCorrect: false },
      { id: 'd', text: 'Interest rate', isCorrect: false }
    ],
    correct_answer: 'Price increase',
    explanation: 'Inflation is the general increase in prices.',
    category: 'economics',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What is diversification in investing?',
    options: [
      { id: 'a', text: 'Putting all money in one stock', isCorrect: false },
      { id: 'b', text: 'Spreading investments across different assets', isCorrect: true },
      { id: 'c', text: 'Only buying bonds', isCorrect: false },
      { id: 'd', text: 'Avoiding all risks', isCorrect: false }
    ],
    correct_answer: 'Spreading investments across different assets',
    explanation: 'Diversification reduces risk by spreading investments across different assets.',
    category: 'finance', 
    difficulty: 'medium'
  },
  {
    id: '4',
    question: 'What is compound interest?',
    options: [
      { id: 'a', text: 'Interest on principal only', isCorrect: false },
      { id: 'b', text: 'Interest on principal and accumulated interest', isCorrect: true },
      { id: 'c', text: 'Fixed interest rate', isCorrect: false },
      { id: 'd', text: 'Simple interest calculation', isCorrect: false }
    ],
    correct_answer: 'Interest on principal and accumulated interest',
    explanation: 'Compound interest is earned on both the principal and previously earned interest.',
    category: 'finance',
    difficulty: 'medium'
  },
  {
    id: '5',
    question: 'What is a bull market?',
    options: [
      { id: 'a', text: 'Declining market prices', isCorrect: false },
      { id: 'b', text: 'Rising market prices', isCorrect: true },
      { id: 'c', text: 'Stable market prices', isCorrect: false },
      { id: 'd', text: 'Volatile market prices', isCorrect: false }
    ],
    correct_answer: 'Rising market prices',
    explanation: 'A bull market is characterized by rising prices and investor optimism.',
    category: 'finance',
    difficulty: 'easy'
  }
];

export function RealTranslationTest() {
  const { translateQuestions } = useQuizTranslations();
  const { language, changeLanguage } = useI18n();
  const [translatedQuestions, setTranslatedQuestions] = useState<QuizQuestion[]>([]);
  const [coverage, setCoverage] = useState<any>(null);

  useEffect(() => {
    console.log('🧪 Real Translation Test Component Loaded');
    console.log('Current language:', language);
    
    const translated = translateQuestions(testQuestions);
    setTranslatedQuestions(translated);
    
    analyzeQuestionTranslationCoverage().then(setCoverage);
  }, [language, translateQuestions]);

  const handleLanguageChange = (newLang: string) => {
    console.log(`🌍 Changing language to: ${newLang}`);
    changeLanguage(newLang);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Real Translation System Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Language Controls</h2>
        <div className="flex gap-2 flex-wrap">
          {['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP'].map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 rounded ${
                language === lang 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">Current language: {language}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Translation Results</h2>
        <div className="space-y-4">
          {translatedQuestions.map((question, index) => (
            <div key={question.id} className="border p-4 rounded">
              <h3 className="font-medium">Question {index + 1}</h3>
              <p className="text-sm text-gray-600 mb-2">Original: {testQuestions[index].question}</p>
              <p className="font-medium mb-2">Translated: {question.question}</p>
              <div className="text-sm">
                <p>Options: {question.options.map(opt => opt.text).join(', ')}</p>
                <p>Correct: {question.correct_answer}</p>
                <p>Explanation: {question.explanation}</p>
              </div>
              {question.question !== testQuestions[index].question && (
                <div className="mt-2 text-green-600 text-sm">✅ Translation applied!</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {coverage && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Database Coverage Analysis</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p>Total questions in database: {coverage.total}</p>
            <p>Categories: {Object.keys(coverage.byCategory).join(', ')}</p>
            <p>Difficulties: {Object.keys(coverage.byDifficulty).join(', ')}</p>
            <div className="mt-2">
              <p className="font-medium">Sample questions from database:</p>
              <ul className="text-sm">
                {coverage.sampleQuestions?.slice(0, 5).map((q: string, i: number) => (
                  <li key={i}>• {q}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>This component uses the real useQuizTranslations hook</p>
        <p>Check browser console for detailed translation logs</p>
      </div>
    </div>
  );
}
