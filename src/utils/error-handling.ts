export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export interface ParsedJsonResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
      shouldRetry = (error, attempt) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return attempt < maxAttempts;
      }
    } = options;

    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!shouldRetry(error, attempt) || attempt === maxAttempts) {
          throw error;
        }

        const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
        console.warn(`[ErrorHandler] Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  static parseJsonRobust<T>(content: string): ParsedJsonResult<T> {
    if (!content || typeof content !== 'string') {
      return {
        success: false,
        error: 'Content is empty or not a string'
      };
    }

    const cleanContent = content.trim();
    
    const parseAttempts = [
      () => JSON.parse(cleanContent),
      () => {
        const jsonMatch = cleanContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch?.[1]) {
          return JSON.parse(jsonMatch[1].trim());
        }
        throw new Error('No JSON block found');
      },
      () => {
        const jsonMatch = cleanContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch?.[1]) {
          return JSON.parse(jsonMatch[1].trim());
        }
        throw new Error('No code block found');
      },
      () => {
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch?.[0]) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON object found');
      },
      () => {
        const lines = cleanContent.split('\n');
        const jsonLines = lines.filter(line => 
          line.trim().startsWith('{') || 
          line.trim().startsWith('"') || 
          line.trim().startsWith('}') ||
          line.includes(':') ||
          line.includes('[') ||
          line.includes(']')
        );
        return JSON.parse(jsonLines.join('\n'));
      }
    ];

    for (let i = 0; i < parseAttempts.length; i++) {
      try {
        const result = parseAttempts[i]();
        console.log(`[ErrorHandler] JSON parsed successfully on attempt ${i + 1}`);
        return {
          success: true,
          data: result
        };
      } catch (error) {
        console.warn(`[ErrorHandler] JSON parse attempt ${i + 1} failed:`, error);
        continue;
      }
    }

    return {
      success: false,
      error: `Failed to parse JSON after ${parseAttempts.length} attempts. Content: ${cleanContent.substring(0, 200)}...`
    };
  }

  static validateSchema<T>(data: any, validator: (data: any) => data is T): T {
    if (!validator(data)) {
      throw new Error('Data validation failed');
    }
    return data;
  }

  static createLogger(context: string) {
    return {
      error: (message: string, data?: any) => {
        console.error(`[${context}] ❌ ${message}`, {
          timestamp: new Date().toISOString(),
          context,
          data,
          stack: new Error().stack
        });
      },
      warn: (message: string, data?: any) => {
        console.warn(`[${context}] ⚠️ ${message}`, {
          timestamp: new Date().toISOString(),
          context,
          data
        });
      },
      info: (message: string, data?: any) => {
        console.log(`[${context}] ℹ️ ${message}`, {
          timestamp: new Date().toISOString(),
          context,
          data
        });
      },
      debug: (message: string, data?: any) => {
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          console.debug(`[${context}] 🐛 ${message}`, {
            timestamp: new Date().toISOString(),
            context,
            data
          });
        }
      }
    };
  }

  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    timeoutMessage = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
      )
    ]);
  }
}

export function isQuestionData(data: any): data is { questions: Array<any> } {
  return data && 
         typeof data === 'object' && 
         Array.isArray(data.questions) && 
         data.questions.length > 0 &&
         data.questions.every((q: any) => 
           q.question && 
           q.options && 
           q.correct_answer && 
           q.explanation &&
           q.category &&
           q.difficulty
         );
}

export function createAdaptiveDelay(attempt: number, baseDelay = 1000): number {
  const jitter = Math.random() * 0.1 * baseDelay;
  return Math.min(baseDelay * Math.pow(2, attempt - 1) + jitter, 30000);
}
