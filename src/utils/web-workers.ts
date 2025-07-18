// Web Workers para processamento pesado em background
export class WebWorkerManager {
  private static instance: WebWorkerManager;
  private workers: Map<string, Worker> = new Map();
  private workerPromises: Map<string, Promise<any>> = new Map();
  private messageId = 0;

  static getInstance(): WebWorkerManager {
    if (!WebWorkerManager.instance) {
      WebWorkerManager.instance = new WebWorkerManager();
    }
    return WebWorkerManager.instance;
  }

  // Criar worker para cálculos matemáticos
  createCalculationWorker(): Worker {
    const workerCode = `
      // Cálculos matemáticos pesados
      const calculations = {
        // Calcular XP e níveis
        calculateXPProgress(currentXP, targetXP) {
          const progress = (currentXP / targetXP) * 100;
          const remainingXP = Math.max(0, targetXP - currentXP);
          return { progress: Math.min(100, progress), remainingXP };
        },

        // Calcular rankings complexos
        calculateRankings(users, weights = {}) {
          const defaultWeights = { xp: 0.4, streak: 0.3, level: 0.3 };
          const finalWeights = { ...defaultWeights, ...weights };
          
          return users.map(user => {
            const score = (user.xp * finalWeights.xp) + 
                         (user.streak * finalWeights.streak * 100) + 
                         (user.level * finalWeights.level * 50);
            return { ...user, score };
          }).sort((a, b) => b.score - a.score)
            .map((user, index) => ({ ...user, rank: index + 1 }));
        },

        // Análise de performance de quiz
        analyzeQuizPerformance(sessions) {
          const totalSessions = sessions.length;
          if (totalSessions === 0) return null;

          const avgAccuracy = sessions.reduce((sum, s) => sum + (s.questions_correct / s.questions_total), 0) / totalSessions;
          const avgCombo = sessions.reduce((sum, s) => sum + s.max_combo, 0) / totalSessions;
          const totalXP = sessions.reduce((sum, s) => sum + (s.questions_correct * 10), 0);
          
          const difficulty = avgAccuracy > 0.8 ? 'easy' : avgAccuracy > 0.6 ? 'medium' : 'hard';
          const trend = this.calculateTrend(sessions.slice(-5).map(s => s.questions_correct / s.questions_total));
          
          return {
            totalSessions,
            avgAccuracy: Math.round(avgAccuracy * 100),
            avgCombo: Math.round(avgCombo),
            totalXP,
            difficulty,
            trend,
            recommendation: this.getRecommendation(avgAccuracy, avgCombo)
          };
        },

        // Calcular tendência
        calculateTrend(values) {
          if (values.length < 2) return 'stable';
          
          const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
          const previous = values.slice(0, -3).reduce((a, b) => a + b, 0) / (values.length - 3);
          
          if (recent > previous * 1.1) return 'improving';
          if (recent < previous * 0.9) return 'declining';
          return 'stable';
        },

        // Recomendações personalizadas
        getRecommendation(accuracy, combo) {
          if (accuracy < 0.5) return 'Foque em revisar conceitos básicos';
          if (combo < 3) return 'Pratique para melhorar sua sequência';
          if (accuracy > 0.8 && combo > 7) return 'Experimente tópicos mais avançados';
          return 'Continue praticando regularmente';
        }
      };

      self.onmessage = function(e) {
        const { id, type, data } = e.data;
        let result;

        try {
          switch(type) {
            case 'CALCULATE_XP_PROGRESS':
              result = calculations.calculateXPProgress(data.currentXP, data.targetXP);
              break;
              
            case 'CALCULATE_RANKINGS':
              result = calculations.calculateRankings(data.users, data.weights);
              break;
              
            case 'ANALYZE_QUIZ_PERFORMANCE':
              result = calculations.analyzeQuizPerformance(data.sessions);
              break;
              
            case 'CALCULATE_LEADERBOARD_STATS':
              const rankings = calculations.calculateRankings(data.users);
              const userRank = rankings.find(u => u.id === data.userId)?.rank || 0;
              const percentile = Math.round((1 - (userRank / rankings.length)) * 100);
              result = { rankings, userRank, percentile, totalUsers: rankings.length };
              break;
              
            default:
              throw new Error('Unknown calculation type: ' + type);
          }
          
          self.postMessage({ id, success: true, result });
        } catch (error) {
          self.postMessage({ id, success: false, error: error.message });
        }
      };
    `;

    return this.createWorker('calculation', workerCode);
  }

  // Criar worker para processamento de dados
  createDataWorker(): Worker {
    const workerCode = `
      // Processamento de dados e filtros
      const dataProcessing = {
        // Filtrar e ordenar leaderboard
        filterLeaderboard(users, filters = {}) {
          let filtered = [...users];
          
          // Filtro por nível
          if (filters.minLevel) {
            filtered = filtered.filter(u => u.level >= filters.minLevel);
          }
          if (filters.maxLevel) {
            filtered = filtered.filter(u => u.level <= filters.maxLevel);
          }
          
          // Filtro por nome
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(u => 
              u.nickname.toLowerCase().includes(search) ||
              u.username?.toLowerCase().includes(search)
            );
          }
          
          // Filtro por distrito
          if (filters.district) {
            filtered = filtered.filter(u => u.district === filters.district);
          }
          
          // Ordenação
          if (filters.sortBy) {
            filtered.sort((a, b) => {
              const aVal = a[filters.sortBy];
              const bVal = b[filters.sortBy];
              return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            });
          }
          
          return filtered;
        },

        // Processar resultados de quiz
        processQuizResults(answers, questions) {
          const results = answers.map((answer, index) => {
            const question = questions[index];
            const isCorrect = answer === question.correct_answer;
            return {
              questionId: question.id,
              userAnswer: answer,
              correctAnswer: question.correct_answer,
              isCorrect,
              timeSpent: answer.timeSpent || 0,
              difficulty: question.difficulty || 'medium'
            };
          });
          
          const totalQuestions = results.length;
          const correctAnswers = results.filter(r => r.isCorrect).length;
          const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
          
          // Calcular combo
          let maxCombo = 0;
          let currentCombo = 0;
          results.forEach(result => {
            if (result.isCorrect) {
              currentCombo++;
              maxCombo = Math.max(maxCombo, currentCombo);
            } else {
              currentCombo = 0;
            }
          });
          
          // Calcular XP baseado na performance
          const baseXP = correctAnswers * 10;
          const comboBonus = maxCombo > 3 ? maxCombo * 5 : 0;
          const accuracyBonus = accuracy > 0.8 ? 20 : 0;
          const totalXP = baseXP + comboBonus + accuracyBonus;
          
          return {
            results,
            summary: {
              totalQuestions,
              correctAnswers,
              accuracy: Math.round(accuracy * 100),
              maxCombo,
              xpEarned: totalXP,
              performance: accuracy > 0.8 ? 'excellent' : accuracy > 0.6 ? 'good' : 'needs_improvement'
            }
          };
        },

        // Agrupar dados para estatísticas
        groupDataForStats(data, groupBy) {
          const groups = {};
          
          data.forEach(item => {
            const key = this.getGroupKey(item, groupBy);
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(item);
          });
          
          // Calcular estatísticas para cada grupo
          const stats = {};
          Object.entries(groups).forEach(([key, items]) => {
            stats[key] = {
              count: items.length,
              total: items.reduce((sum, item) => sum + (item.value || 0), 0),
              average: items.length > 0 ? items.reduce((sum, item) => sum + (item.value || 0), 0) / items.length : 0,
              max: Math.max(...items.map(item => item.value || 0)),
              min: Math.min(...items.map(item => item.value || 0))
            };
          });
          
          return stats;
        },

        getGroupKey(item, groupBy) {
          switch(groupBy) {
            case 'day':
              return new Date(item.created_at).toDateString();
            case 'week':
              const date = new Date(item.created_at);
              const week = Math.ceil(date.getDate() / 7);
              return \`\${date.getFullYear()}-W\${week}\`;
            case 'month':
              const monthDate = new Date(item.created_at);
              return \`\${monthDate.getFullYear()}-\${monthDate.getMonth() + 1}\`;
            case 'level':
              return \`Level \${Math.floor((item.level || 1) / 5) * 5}-\${Math.floor((item.level || 1) / 5) * 5 + 4}\`;
            default:
              return 'all';
          }
        }
      };

      self.onmessage = function(e) {
        const { id, type, data } = e.data;
        let result;

        try {
          switch(type) {
            case 'FILTER_LEADERBOARD':
              result = dataProcessing.filterLeaderboard(data.users, data.filters);
              break;
              
            case 'PROCESS_QUIZ_RESULTS':
              result = dataProcessing.processQuizResults(data.answers, data.questions);
              break;
              
            case 'GROUP_DATA_FOR_STATS':
              result = dataProcessing.groupDataForStats(data.items, data.groupBy);
              break;
              
            default:
              throw new Error('Unknown data processing type: ' + type);
          }
          
          self.postMessage({ id, success: true, result });
        } catch (error) {
          self.postMessage({ id, success: false, error: error.message });
        }
      };
    `;

    return this.createWorker('data', workerCode);
  }

  // Criar worker genérico
  private createWorker(name: string, code: string): Worker {
    if (this.workers.has(name)) {
      return this.workers.get(name)!;
    }

    const blob = new Blob([code], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    this.workers.set(name, worker);
    return worker;
  }

  // Executar task em worker
  async runTask<T>(workerName: string, type: string, data: any): Promise<T> {
    const worker = this.workers.get(workerName);
    if (!worker) {
      throw new Error(`Worker '${workerName}' not found`);
    }

    const id = ++this.messageId;
    const taskKey = `${workerName}-${id}`;

    const promise = new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker task timeout'));
      }, 10000); // 10s timeout

      const handleMessage = (e: MessageEvent) => {
        if (e.data.id === id) {
          clearTimeout(timeout);
          worker.removeEventListener('message', handleMessage);
          
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        }
      };

      worker.addEventListener('message', handleMessage);
      worker.postMessage({ id, type, data });
    });

    this.workerPromises.set(taskKey, promise);
    
    try {
      const result = await promise;
      this.workerPromises.delete(taskKey);
      return result;
    } catch (error) {
      this.workerPromises.delete(taskKey);
      throw error;
    }
  }

  // Inicializar workers
  init() {
    console.log('[WebWorkers] Initializing web workers');
    
    if (typeof Worker !== 'undefined') {
      this.createCalculationWorker();
      this.createDataWorker();
      console.log('[WebWorkers] Workers initialized successfully');
    } else {
      console.warn('[WebWorkers] Web Workers not supported');
    }
  }

  // Cleanup
  terminate() {
    this.workers.forEach((worker, name) => {
      console.log(`[WebWorkers] Terminating worker: ${name}`);
      worker.terminate();
    });
    
    this.workers.clear();
    this.workerPromises.clear();
  }
}

// Export singleton
export const webWorkerManager = WebWorkerManager.getInstance();

// Utility hooks para usar workers
export const useCalculationWorker = () => {
  const calculateXPProgress = async (currentXP: number, targetXP: number) => {
    return webWorkerManager.runTask('calculation', 'CALCULATE_XP_PROGRESS', {
      currentXP,
      targetXP
    });
  };

  const calculateRankings = async (users: any[], weights?: any) => {
    return webWorkerManager.runTask('calculation', 'CALCULATE_RANKINGS', {
      users,
      weights
    });
  };

  const analyzeQuizPerformance = async (sessions: any[]) => {
    return webWorkerManager.runTask('calculation', 'ANALYZE_QUIZ_PERFORMANCE', {
      sessions
    });
  };

  return {
    calculateXPProgress,
    calculateRankings,
    analyzeQuizPerformance
  };
};

export const useDataWorker = () => {
  const filterLeaderboard = async (users: any[], filters: any) => {
    return webWorkerManager.runTask('data', 'FILTER_LEADERBOARD', {
      users,
      filters
    });
  };

  const processQuizResults = async (answers: any[], questions: any[]) => {
    return webWorkerManager.runTask('data', 'PROCESS_QUIZ_RESULTS', {
      answers,
      questions
    });
  };

  return {
    filterLeaderboard,
    processQuizResults
  };
};