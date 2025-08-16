// Debug utility for deep duel system analysis
import { supabase } from '@/integrations/supabase/client';

export const deepDuelSystemDebug = {
  // Track component lifecycle and state changes
  trackComponentLifecycle: (componentName: string, phase: string, data: any) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] ${componentName} - ${phase}:`, data);
    
    // Store in sessionStorage for persistence across reloads
    const key = `duel_debug_${componentName}_${phase}`;
    const logEntry = { timestamp, phase, data };
    
    try {
      const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
      existing.push(logEntry);
      // Keep only last 10 entries per component/phase
      if (existing.length > 10) existing.shift();
      sessionStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to store debug log:', e);
    }
  },

  // Deep analysis of questions state
  analyzeQuestionsState: (questions: any[], totalQuestions: number, currentIndex: number) => {
    const analysis = {
      timestamp: new Date().toISOString(),
      questions_length: questions?.length || 0,
      questions_type: Array.isArray(questions) ? 'array' : typeof questions,
      questions_valid: questions?.length > 0 && questions.every(q => q.id && q.question),
      totalQuestions_value: totalQuestions,
      currentIndex_value: currentIndex,
      potential_issues: [] as string[]
    };

    // Identify potential issues
    if (questions?.length === 0) {
      analysis.potential_issues.push('QUESTIONS_ARRAY_EMPTY');
    }
    if (totalQuestions === 0) {
      analysis.potential_issues.push('TOTAL_QUESTIONS_ZERO');
    }
    if (!Array.isArray(questions)) {
      analysis.potential_issues.push('QUESTIONS_NOT_ARRAY');
    }
    if (currentIndex >= (questions?.length || 0)) {
      analysis.potential_issues.push('CURRENT_INDEX_OUT_OF_BOUNDS');
    }

    console.log('🧐 [QUESTIONS STATE ANALYSIS]:', analysis);
    return analysis;
  },

  // Track score calculation flow
  trackScoreCalculation: (phase: string, data: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      phase,
      ...data
    };
    
    console.log(`🎯 [SCORE CALC] ${phase}:`, logEntry);
    
    // Store score calculation history
    try {
      const history = JSON.parse(sessionStorage.getItem('score_calc_history') || '[]');
      history.push(logEntry);
      if (history.length > 20) history.shift();
      sessionStorage.setItem('score_calc_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to store score calculation log:', e);
    }
  },

  // Detect component remount patterns
  detectRemountPatterns: () => {
    const remountKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('duel_debug_') && key.includes('_MOUNT')
    );
    
    console.log('🔄 [REMOUNT ANALYSIS] Found mount logs:', remountKeys.length);
    
    remountKeys.forEach(key => {
      try {
        const logs = JSON.parse(sessionStorage.getItem(key) || '[]');
        if (logs.length > 2) {
          console.warn(`⚠️ [SUSPICIOUS REMOUNTS] ${key} has ${logs.length} mounts:`, logs);
        }
      } catch (e) {
        console.warn('Failed to analyze remount pattern:', e);
      }
    });
  },

  // Analyze percentage calculation issue
  analyzePercentageCalculation: (playerScore: number, totalQuestions: number, questionsLength: number) => {
    const analysis = {
      timestamp: new Date().toISOString(),
      playerScore,
      totalQuestions,
      questionsLength,
      calculation_used: totalQuestions > 0 ? totalQuestions : questionsLength,
      percentage_result: 'INVALID',
      issues: [] as string[]
    };

    const finalQuestions = totalQuestions > 0 ? totalQuestions : questionsLength;
    
    if (finalQuestions === 0) {
      analysis.issues.push('DIVISION_BY_ZERO');
      analysis.percentage_result = 'INFINITY';
    } else {
      analysis.percentage_result = Math.round((playerScore / finalQuestions) * 100).toString();
    }

    if (totalQuestions === 0) {
      analysis.issues.push('TOTAL_QUESTIONS_NOT_SET');
    }
    if (questionsLength === 0) {
      analysis.issues.push('QUESTIONS_ARRAY_EMPTY');
    }

    console.log('📊 [PERCENTAGE ANALYSIS]:', analysis);
    return analysis;
  },

  // Get full debug report
  getFullDebugReport: () => {
    const report = {
      timestamp: new Date().toISOString(),
      component_logs: {} as any,
      score_history: [] as any[],
      browser_info: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        storage_available: typeof(Storage) !== 'undefined'
      }
    };

    // Gather all debug logs
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('duel_debug_')) {
        try {
          report.component_logs[key] = JSON.parse(sessionStorage.getItem(key) || '[]');
        } catch (e) {
          report.component_logs[key] = 'PARSE_ERROR';
        }
      }
    });

    // Get score calculation history
    try {
      report.score_history = JSON.parse(sessionStorage.getItem('score_calc_history') || '[]');
    } catch (e) {
      report.score_history = [];
    }

    console.log('📋 [FULL DEBUG REPORT]:', report);
    return report;
  },

  // Clear all debug data
  clearDebugData: () => {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('duel_debug_') || key.includes('score_calc_history')) {
        sessionStorage.removeItem(key);
      }
    });
    console.log('🧹 [DEBUG] All debug data cleared');
  },

  // Test duel system with mock data
  runSystemTest: async () => {
    console.log('🧪 [SYSTEM TEST] Starting comprehensive duel system test...');
    
    const mockDuelData = {
      id: 'test-debug-123',
      questions: [
        { id: 'q1', question: 'Test 1?', options: ['A', 'B'], correct_answer: 'A' },
        { id: 'q2', question: 'Test 2?', options: ['A', 'B'], correct_answer: 'B' },
        { id: 'q3', question: 'Test 3?', options: ['A', 'B'], correct_answer: 'A' }
      ],
      player1_score: 0,
      player2_score: 0,
      current_question: 0
    };

    // Test questions state analysis
    deepDuelSystemDebug.analyzeQuestionsState(mockDuelData.questions, 3, 0);
    
    // Test score calculation
    deepDuelSystemDebug.trackScoreCalculation('TEST_INITIAL', {
      playerScore: 0,
      totalQuestions: 3,
      questionsLength: mockDuelData.questions.length
    });

    // Test percentage calculation
    deepDuelSystemDebug.analyzePercentageCalculation(2, 3, 3);
    deepDuelSystemDebug.analyzePercentageCalculation(1, 0, 0); // Problem case

    console.log('✅ [SYSTEM TEST] Comprehensive test completed');
  }
};

// Make available globally for console debugging
(window as any).deepDuelSystemDebug = deepDuelSystemDebug;
(window as any).runDuelDiagnostic = () => {
  console.log('🚀 Running comprehensive duel system diagnostic...');
  deepDuelSystemDebug.detectRemountPatterns();
  deepDuelSystemDebug.runSystemTest();
  return deepDuelSystemDebug.getFullDebugReport();
};

export default deepDuelSystemDebug;
