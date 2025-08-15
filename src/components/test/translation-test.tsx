import React, { useEffect, useState } from 'react';
import { useQuizTranslations } from '@/hooks/use-quiz-translations';
import { useI18n } from '@/hooks/use-i18n';
import { analyzeQuestionTranslationCoverage } from '@/utils/translation-mapper';
import { QuizQuestion } from '@/types/quiz';

const mockQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'Quem criou o Bitcoin?',
    options: [
      { id: 'a', text: 'Satoshi Nakamoto', isCorrect: true },
      { id: 'b', text: 'Vitalik Buterin', isCorrect: false },
      { id: 'c', text: 'Charlie Lee', isCorrect: false },
      { id: 'd', text: 'Roger Ver', isCorrect: false }
    ],
    correct_answer: 'Satoshi Nakamoto',
    explanation: 'Satoshi Nakamoto é o pseudônimo da pessoa ou grupo que criou o Bitcoin.',
    category: 'Cripto',
    difficulty: 'easy'
  },
  {
    id: '2', 
    question: 'O que é blockchain?',
    options: [
      { id: 'a', text: 'Uma moeda digital', isCorrect: false },
      { id: 'b', text: 'Um livro de registros distribuído', isCorrect: true },
      { id: 'c', text: 'Uma empresa de tecnologia', isCorrect: false },
      { id: 'd', text: 'Um tipo de investimento', isCorrect: false }
    ],
    correct_answer: 'Um livro de registros distribuído',
    explanation: 'Blockchain é uma tecnologia de livro de registros distribuído e descentralizado.',
    category: 'Cripto',
    difficulty: 'medium'
  },
  {
    id: '3',
    question: 'O que é inflação?',
    options: [
      { id: 'a', text: 'Aumento de preços', isCorrect: true },
      { id: 'b', text: 'Diminuição de preços', isCorrect: false },
      { id: 'c', text: 'Troca de moeda', isCorrect: false },
      { id: 'd', text: 'Taxa de juros', isCorrect: false }
    ],
    correct_answer: 'Aumento de preços',
    explanation: 'Inflação é o aumento geral de preços.',
    category: 'economics',
    difficulty: 'easy'
  },
  {
    id: '4',
    question: 'O que é uma pergunta sem tradução?',
    options: [
      { id: 'a', text: 'Opção 1', isCorrect: true },
      { id: 'b', text: 'Opção 2', isCorrect: false },
      { id: 'c', text: 'Opção 3', isCorrect: false },
      { id: 'd', text: 'Opção 4', isCorrect: false }
    ],
    correct_answer: 'Opção 1',
    explanation: 'Esta pergunta não tem tradução.',
    category: 'test',
    difficulty: 'easy'
  }
];

export function TranslationTest() {
  const { translateQuestions } = useQuizTranslations();
  const { language, changeLanguage } = useI18n();
  const [translatedQuestions, setTranslatedQuestions] = useState<QuizQuestion[]>([]);
  const [coverage, setCoverage] = useState<any>(null);

  useEffect(() => {
    console.log('🧪 Translation Test Component Loaded');
    console.log('Current language:', language);
    
    const translated = translateQuestions(mockQuestions);
    setTranslatedQuestions(translated);
    
    analyzeQuestionTranslationCoverage().then(setCoverage);
  }, [language, translateQuestions]);

  const handleLanguageChange = (newLang: string) => {
    console.log(`🌍 Changing language to: ${newLang}`);
    changeLanguage(newLang);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Translation System Test</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Language Controls</h2>
        <div className="flex gap-2">
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
              <p className="text-sm text-gray-600 mb-2">Original: {mockQuestions[index].question}</p>
              <p className="font-medium mb-2">Translated: {question.question}</p>
              <div className="text-sm">
                <p>Options: {question.options.map(opt => opt.text).join(', ')}</p>
                <p>Correct: {question.correct_answer}</p>
                <p>Explanation: {question.explanation}</p>
              </div>
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
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p>Check browser console for detailed translation logs</p>
      </div>
    </div>
  );
}
