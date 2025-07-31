import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wand2, 
  BookOpen, 
  Play, 
  Brain, 
  Target,
  Loader2,
  Download,
  Share
} from 'lucide-react';
import { useContentEngine } from '@/hooks/use-content-engine';
import { DynamicSimulator } from './dynamic-simulator';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedContent {
  id: string;
  type: 'simulation' | 'interactive_lesson' | 'adaptive_quiz' | 'scenario';
  title: string;
  content: any;
  metadata: any;
}

export const AIContentGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<'simulation' | 'interactive_lesson' | 'adaptive_quiz' | 'scenario'>('simulation');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { 
    generatePersonalizedContent, 
    generatingContent,
    createSimulation,
    createInteractiveLesson,
    createAdaptiveQuiz
  } = useContentEngine();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    let content;
    
    switch (contentType) {
      case 'simulation':
        content = await createSimulation(topic, 'intermediate');
        break;
      case 'interactive_lesson':
        content = await createInteractiveLesson(topic);
        break;
      case 'adaptive_quiz':
        content = await createAdaptiveQuiz([topic]);
        break;
      default:
        content = await generatePersonalizedContent(topic, contentType);
    }

    if (content) {
      setGeneratedContent({
        id: crypto.randomUUID(),
        type: contentType,
        title: content.title,
        content: content.content,
        metadata: content.metadata
      });
    }
  };

  const contentTypeLabels = {
    simulation: 'Simulação Interativa',
    interactive_lesson: 'Lição Interativa',
    adaptive_quiz: 'Quiz Adaptativo',
    scenario: 'Cenário Prático'
  };

  const contentTypeDescriptions = {
    simulation: 'Crie simulações realistas de mercado e investimentos',
    interactive_lesson: 'Gere lições personalizadas com exercícios práticos',
    adaptive_quiz: 'Questões que se adaptam ao seu nível de conhecimento',
    scenario: 'Cenários práticos baseados em situações reais'
  };

  return (
    <div className="space-y-6">
      {/* Generator Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="w-5 h-5 mr-2" />
            Gerador de Conteúdo IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tópico Principal</label>
              <Input
                placeholder="Ex: Análise de ações, Criptomoedas, Renda fixa..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Conteúdo</label>
              <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(contentTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Prompt Personalizado (Opcional)
            </label>
            <Textarea
              placeholder="Descreva requisitos específicos para o conteúdo..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="p-4 bg-secondary rounded-lg">
            <div className="flex items-start space-x-3">
              {contentType === 'simulation' && <Play className="w-5 h-5 text-blue-600 mt-1" />}
              {contentType === 'interactive_lesson' && <BookOpen className="w-5 h-5 text-green-600 mt-1" />}
              {contentType === 'adaptive_quiz' && <Brain className="w-5 h-5 text-purple-600 mt-1" />}
              {contentType === 'scenario' && <Target className="w-5 h-5 text-orange-600 mt-1" />}
              <div>
                <h4 className="font-semibold">{contentTypeLabels[contentType]}</h4>
                <p className="text-sm text-muted-foreground">
                  {contentTypeDescriptions[contentType]}
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={!topic.trim() || generatingContent}
            className="w-full"
          >
            {generatingContent ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando Conteúdo...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Gerar Conteúdo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Content Preview */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Badge variant="secondary" className="mr-3">
                      {contentTypeLabels[generatedContent.type]}
                    </Badge>
                    {generatedContent.title}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Ocultar' : 'Visualizar'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {showPreview && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        ⏱️ {generatedContent.metadata?.estimatedTime || 30} min
                      </Badge>
                      <Badge variant="outline">
                        📊 Nível {generatedContent.metadata?.requiredLevel || 1}
                      </Badge>
                      <Badge variant="outline">
                        🎯 {generatedContent.metadata?.concepts?.length || 0} conceitos
                      </Badge>
                    </div>

                    {/* Content Preview */}
                    {generatedContent.type === 'simulation' && (
                      <DynamicSimulator
                        scenario={topic}
                        complexity="intermediate"
                        onComplete={(results) => {
                          console.log('Simulation completed:', results);
                        }}
                      />
                    )}

                    {generatedContent.type === 'interactive_lesson' && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Lição Interativa</h4>
                        <div className="space-y-3">
                          <p className="text-sm">
                            Esta lição aborda os conceitos fundamentais de {topic} 
                            através de exemplos práticos e exercícios interativos.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-800">Teoria</h5>
                              <p className="text-sm text-blue-700">
                                Conceitos fundamentais explicados de forma clara
                              </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                              <h5 className="font-medium text-green-800">Prática</h5>
                              <p className="text-sm text-green-700">
                                Exercícios práticos para fixar o aprendizado
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {generatedContent.type === 'adaptive_quiz' && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Quiz Adaptativo</h4>
                        <p className="text-sm mb-3">
                          Este quiz se adapta ao seu desempenho, oferecendo 
                          questões mais desafiadoras conforme você progride.
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Dificuldade inicial:</span>
                            <Badge variant="secondary">Intermediário</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Questões estimadas:</span>
                            <span>10-15</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tempo médio:</span>
                            <span>20-30 min</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};