import React, { useEffect, useState } from 'react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
}

const mockQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the main function of a stock exchange?',
    options: ['Lend money to companies', 'Facilitate trading of securities', 'Set interest rates', 'Print money'],
    correct_answer: 'Facilitate trading of securities',
    explanation: 'Stock exchanges provide a platform for buying and selling securities.',
    category: 'finance',
    difficulty: 'easy'
  },
  {
    id: '2', 
    question: 'What is inflation?',
    options: ['Price increase', 'Price decrease', 'Currency exchange', 'Interest rate'],
    correct_answer: 'Price increase',
    explanation: 'Inflation is the general increase in prices.',
    category: 'economics',
    difficulty: 'easy'
  },
  {
    id: '3',
    question: 'What is the main function of stock exchange?',
    options: ['Lend money to companies', 'Facilitate trading of securities', 'Set interest rates', 'Print money'],
    correct_answer: 'Facilitate trading of securities',
    explanation: 'Test fuzzy matching.',
    category: 'finance', 
    difficulty: 'easy'
  },
  {
    id: '4',
    question: 'What is a question without translation?',
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    correct_answer: 'Option 1',
    explanation: 'This question has no translation.',
    category: 'test',
    difficulty: 'easy'
  }
];

export function SimpleTranslationTest() {
  const [currentLanguage, setCurrentLanguage] = useState('pt-BR');
  const [translatedQuestions, setTranslatedQuestions] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    console.log('🧪 Simple Translation Test Component Loaded');
    console.log('Current language:', currentLanguage);
    
    setTranslatedQuestions(mockQuestions);
  }, [currentLanguage]);

  const handleLanguageChange = (newLang: string) => {
    console.log(`🌍 Changing language to: ${newLang}`);
    setCurrentLanguage(newLang);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Simple Translation System Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Language Controls</h2>
        <div className="flex gap-2 flex-wrap">
          {['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP'].map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-1 rounded ${
                currentLanguage === lang 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-600">Current language: {currentLanguage}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Test Questions</h2>
        <div className="space-y-4">
          {translatedQuestions.map((question, index) => (
            <div key={question.id} className="border p-4 rounded">
              <h3 className="font-medium">Question {index + 1}</h3>
              <p className="font-medium mb-2">{question.question}</p>
              <div className="text-sm">
                <p>Options: {question.options.join(', ')}</p>
                <p>Correct: {question.correct_answer}</p>
                <p>Explanation: {question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>This is a simple test component without external dependencies</p>
        <p>Check browser console for logs</p>
      </div>
    </div>
  );
}
