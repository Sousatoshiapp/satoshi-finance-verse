// PHASE 2: Web Worker Management for Performance
// Offload heavy computations to background threads

interface WorkerTask {
  id: string;
  type: string;
  data: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  priority: number;
}

class WebWorkerManager {
  private workers: Worker[] = [];
  private taskQueue: WorkerTask[] = [];
  private activeTasks = new Map<string, WorkerTask>();
  private readonly MAX_WORKERS = Math.min(4, navigator.hardwareConcurrency || 2);
  private readonly WORKER_TIMEOUT = 10000; // 10 seconds

  constructor() {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    // Create dedicated workers for different task types
    try {
      // XP Calculation Worker
      const xpWorker = new Worker(
        new URL('../workers/xp-calculator.worker.ts', import.meta.url),
        { type: 'module' }
      );
      this.setupWorker(xpWorker, 'xp-calculation');

      // Leaderboard Processing Worker
      const leaderboardWorker = new Worker(
        new URL('../workers/leaderboard.worker.ts', import.meta.url),
        { type: 'module' }
      );
      this.setupWorker(leaderboardWorker, 'leaderboard');

      this.workers.push(xpWorker, leaderboardWorker);
    } catch (error) {
      console.warn('Web Workers not supported, falling back to main thread');
    }
  }

  private setupWorker(worker: Worker, type: string) {
    worker.onmessage = (event) => {
      const { taskId, result, error } = event.data;
      const task = this.activeTasks.get(taskId);
      
      if (task) {
        this.activeTasks.delete(taskId);
        if (error) {
          task.reject(new Error(error));
        } else {
          task.resolve(result);
        }
      }
    };

    worker.onerror = (error) => {
      console.error(`Worker error (${type}):`, error);
      // Restart worker if it crashes
      this.restartWorker(worker, type);
    };
  }

  private restartWorker(deadWorker: Worker, type: string) {
    const index = this.workers.indexOf(deadWorker);
    if (index !== -1) {
      deadWorker.terminate();
      
      try {
        const newWorker = new Worker(
          new URL(`../workers/${type}.worker.ts`, import.meta.url),
          { type: 'module' }
        );
        this.setupWorker(newWorker, type);
        this.workers[index] = newWorker;
      } catch (error) {
        console.error(`Failed to restart ${type} worker:`, error);
        this.workers.splice(index, 1);
      }
    }
  }

  // Execute task in web worker with fallback to main thread
  async executeTask<T = any>(
    type: 'xp-calculation' | 'leaderboard' | 'data-processing',
    data: any,
    priority: number = 1
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = `${type}-${Date.now()}-${Math.random()}`;
      
      const task: WorkerTask = {
        id: taskId,
        type,
        data,
        resolve,
        reject,
        priority
      };

      // If no workers available, execute on main thread
      if (this.workers.length === 0) {
        this.executeOnMainThread(task);
        return;
      }

      // Add to queue and process
      this.taskQueue.push(task);
      this.processTaskQueue();

      // Set timeout for task
      setTimeout(() => {
        if (this.activeTasks.has(taskId)) {
          this.activeTasks.delete(taskId);
          reject(new Error('Worker task timeout'));
        }
      }, this.WORKER_TIMEOUT);
    });
  }

  private processTaskQueue() {
    // Sort by priority (higher number = higher priority)
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    while (this.taskQueue.length > 0 && this.activeTasks.size < this.MAX_WORKERS) {
      const task = this.taskQueue.shift()!;
      const availableWorker = this.findWorkerForTask(task.type);

      if (availableWorker) {
        this.activeTasks.set(task.id, task);
        availableWorker.postMessage({
          taskId: task.id,
          type: task.type,
          data: task.data
        });
      } else {
        // No suitable worker, execute on main thread
        this.executeOnMainThread(task);
      }
    }
  }

  private findWorkerForTask(taskType: string): Worker | null {
    // Simple round-robin for now, could be enhanced with load balancing
    return this.workers[0] || null;
  }

  private async executeOnMainThread(task: WorkerTask) {
    try {
      let result;
      
      switch (task.type) {
        case 'xp-calculation':
          result = await this.calculateXPOnMainThread(task.data);
          break;
        case 'leaderboard':
          result = await this.processLeaderboardOnMainThread(task.data);
          break;
        case 'data-processing':
          result = await this.processDataOnMainThread(task.data);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    }
  }

  // Fallback implementations for main thread execution
  private async calculateXPOnMainThread(data: any) {
    const { currentXP, earnedXP, multiplier = 1 } = data;
    
    // Simulate heavy calculation with optimized algorithm
    const newXP = currentXP + (earnedXP * multiplier);
    const level = Math.floor(Math.sqrt(newXP / 100)) + 1;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const progress = ((newXP - Math.pow(level - 1, 2) * 100) / (nextLevelXP - Math.pow(level - 1, 2) * 100)) * 100;

    return {
      newXP,
      level,
      nextLevelXP,
      progress: Math.min(100, Math.max(0, progress))
    };
  }

  private async processLeaderboardOnMainThread(data: any) {
    const { users, sortBy = 'xp', limit = 10 } = data;
    
    // Optimized sorting with minimal memory allocation
    const sorted = users
      .slice() // Shallow copy to avoid mutation
      .sort((a: any, b: any) => b[sortBy] - a[sortBy])
      .slice(0, limit)
      .map((user: any, index: number) => ({
        ...user,
        rank: index + 1
      }));

    return sorted;
  }

  private async processDataOnMainThread(data: any) {
    // Generic data processing fallback
    if (data.operation === 'filter') {
      return data.items.filter(data.predicate);
    } else if (data.operation === 'map') {
      return data.items.map(data.transformer);
    } else if (data.operation === 'reduce') {
      return data.items.reduce(data.reducer, data.initialValue);
    }
    
    return data;
  }

  // Utility methods for specific operations
  async calculateUserLevel(currentXP: number, earnedXP: number, multiplier = 1) {
    return this.executeTask('xp-calculation', { currentXP, earnedXP, multiplier }, 2);
  }

  async processLeaderboard(users: any[], sortBy = 'xp', limit = 10) {
    return this.executeTask('leaderboard', { users, sortBy, limit }, 1);
  }

  async processLargeDataSet(items: any[], operation: string, options: any = {}) {
    return this.executeTask('data-processing', { items, operation, ...options }, 1);
  }

  // Performance monitoring
  getWorkerStats() {
    return {
      activeWorkers: this.workers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      maxWorkers: this.MAX_WORKERS,
      workerSupport: this.workers.length > 0
    };
  }

  // Cleanup
  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.activeTasks.clear();
  }
}

// Singleton instance
export const webWorkerManager = new WebWorkerManager();

// React hook for Web Worker integration
export const useWebWorker = () => {
  return {
    calculateLevel: webWorkerManager.calculateUserLevel.bind(webWorkerManager),
    processLeaderboard: webWorkerManager.processLeaderboard.bind(webWorkerManager),
    processData: webWorkerManager.processLargeDataSet.bind(webWorkerManager),
    getStats: webWorkerManager.getWorkerStats.bind(webWorkerManager),
  };
};