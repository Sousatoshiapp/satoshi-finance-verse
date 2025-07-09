import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    concepts?: string[];
    suggestions?: string[];
  };
}

export interface LearningContext {
  currentTopic?: string;
  userLevel?: number;
  recentQuestions?: string[];
  weakAreas?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export const useAITutor = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<LearningContext>({});

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tutor-chat', {
        body: {
          message: content,
          context: context,
          chatHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          confidence: data.confidence,
          concepts: data.concepts,
          suggestions: data.suggestions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update learning context based on conversation
      if (data.updatedContext) {
        setContext(prev => ({ ...prev, ...data.updatedContext }));
      }

    } catch (error) {
      console.error('AI Tutor error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, context]);

  const updateContext = useCallback((newContext: Partial<LearningContext>) => {
    setContext(prev => ({ ...prev, ...newContext }));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const getPersonalizedHints = useCallback(async (questionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalized-hints', {
        body: {
          questionId,
          context: context,
          chatHistory: messages.slice(-3)
        }
      });

      if (error) throw error;
      return data.hints;
    } catch (error) {
      console.error('Personalized hints error:', error);
      return [];
    }
  }, [context, messages]);

  return {
    messages,
    isLoading,
    context,
    sendMessage,
    updateContext,
    clearChat,
    getPersonalizedHints
  };
};