import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Timer, CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/shared/ui/progress';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useConceptConnections, ConceptConnectionQuestion } from '@/hooks/use-concept-connections';
import { useToast } from '@/hooks/use-toast';

interface ConceptConnectionGameProps {
  theme: string;
  onComplete?: () => void;
}

interface ConnectionState {
  leftConcept: string;
  rightConcept: string;
  isCorrect?: boolean;
}

export function ConceptConnectionGame({ theme, onComplete }: ConceptConnectionGameProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentQuestion, loading, getQuestionsByTheme, submitConceptSession } = useConceptConnections();
  
  const [timeLeft, setTimeLeft] = useState(90); // 90 segundos
  const [connections, setConnections] = useState<ConnectionState[]>([]);
  const [availableRightConcepts, setAvailableRightConcepts] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'completed' | 'timeout'>('playing');
  const [results, setResults] = useState<{ btz_earned: number; xp_earned: number; accuracy: number } | null>(null);

  // Carregar questão quando o tema muda
  useEffect(() => {
    getQuestionsByTheme(theme);
  }, [theme]);

  // Inicializar jogo quando questão é carregada
  useEffect(() => {
    if (currentQuestion) {
      initializeGame();
    }
  }, [currentQuestion]);

  // Timer do jogo
  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStatus === 'playing') {
      handleTimeout();
    }
  }, [timeLeft, gameStatus]);

  const initializeGame = () => {
    if (!currentQuestion) return;

    // Embaralhar conceitos da direita
    const shuffledRight = [...currentQuestion.right_concepts].sort(() => Math.random() - 0.5);
    setAvailableRightConcepts(shuffledRight);
    setConnections([]);
    setGameStatus('playing');
    setTimeLeft(90);
    setResults(null);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !currentQuestion) return;

    const { source, destination } = result;
    
    // Se arrastou de available para um conceito da esquerda
    if (source.droppableId === 'available' && destination.droppableId.startsWith('left-')) {
      const rightConcept = availableRightConcepts[source.index];
      const leftConceptIndex = parseInt(destination.droppableId.split('-')[1]);
      const leftConcept = currentQuestion.left_concepts[leftConceptIndex];

      // Remover conceito das opções disponíveis
      const newAvailable = availableRightConcepts.filter((_, index) => index !== source.index);
      setAvailableRightConcepts(newAvailable);

      // Adicionar conexão
      const newConnection: ConnectionState = {
        leftConcept,
        rightConcept,
        isCorrect: currentQuestion.correct_connections[leftConcept] === rightConcept
      };

      setConnections(prev => [...prev, newConnection]);
    }
    
    // Se arrastou de volta para available
    else if (source.droppableId.startsWith('left-') && destination.droppableId === 'available') {
      const connectionIndex = connections.findIndex(c => 
        c.leftConcept === currentQuestion.left_concepts[parseInt(source.droppableId.split('-')[1])]
      );
      
      if (connectionIndex !== -1) {
        const connection = connections[connectionIndex];
        
        // Remover conexão
        setConnections(prev => prev.filter((_, index) => index !== connectionIndex));
        
        // Adicionar de volta às opções disponíveis
        setAvailableRightConcepts(prev => [...prev, connection.rightConcept]);
      }
    }
  };

  const handleTimeout = () => {
    setGameStatus('timeout');
    submitGame();
  };

  const submitGame = async () => {
    if (!currentQuestion) return;

    const correctConnections = connections.filter(c => c.isCorrect).length;
    const totalConnections = currentQuestion.left_concepts.length;
    const timeUsed = 90 - timeLeft;

    const session = {
      question_id: currentQuestion.id,
      connections_made: connections.reduce((acc, c) => {
        acc[c.leftConcept] = c.rightConcept;
        return acc;
      }, {} as Record<string, string>),
      correct_connections: correctConnections,
      total_connections: totalConnections,
      time_seconds: timeUsed,
      btz_earned: 0, // Calculado no hook
      xp_earned: 0,  // Calculado no hook
      difficulty: currentQuestion.difficulty
    };

    const result = await submitConceptSession(session);
    if (result) {
      setResults(result);
      setGameStatus('completed');
      
      toast({
        title: "🎯 Sessão Completa!",
        description: `${correctConnections}/${totalConnections} conexões corretas`,
      });
    }
  };

  // Verificar se todas as conexões foram feitas
  useEffect(() => {
    if (currentQuestion && connections.length === currentQuestion.left_concepts.length && gameStatus === 'playing') {
      submitGame();
    }
  }, [connections.length, currentQuestion, gameStatus]);

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">Carregando questões...</div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center">
            <p>Nenhuma questão encontrada para este tema.</p>
            <Button onClick={() => navigate('/game-mode')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameStatus === 'completed' || gameStatus === 'timeout') {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Sessão {gameStatus === 'completed' ? 'Completada' : 'Finalizada'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results && (
              <>
                {/* Estatísticas em linha */}
                <div className="flex gap-3 justify-center">
                  <div className="bg-primary/10 p-3 rounded-lg text-center flex-1">
                    <div className="text-lg font-bold text-primary">{results.btz_earned.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">BTZ</div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg text-center flex-1">
                    <div className="text-lg font-bold text-blue-600">{results.xp_earned}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg text-center flex-1">
                    <div className="text-lg font-bold text-green-800">{(results.accuracy * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Precisão</div>
                  </div>
                </div>

                {/* Explicação compacta */}
                {currentQuestion.explanation && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1 text-sm">💡 Explicação:</h4>
                    <p className="text-blue-700 text-sm">{currentQuestion.explanation}</p>
                  </div>
                )}
              </>
            )}

            {/* Botões compactos */}
            <div className="flex gap-3 pt-2">
              <Button onClick={initializeGame} variant="outline" className="flex-1">
                Jogar Novamente
              </Button>
              <Button onClick={() => navigate('/game-mode')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header Compacto Fixo */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="font-mono text-sm">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Conecte os conceitos</div>
              <div className="text-sm font-semibold">{connections.length}/{currentQuestion.left_concepts.length}</div>
            </div>
          </div>
          <Progress value={(connections.length / currentQuestion.left_concepts.length) * 100} className="h-2" />
        </div>

        {/* Área do Jogo Responsiva */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
            {/* Conceitos da Esquerda */}
            <div className="flex flex-col min-h-0">
              <h3 className="text-sm font-semibold mb-2 text-center">Conceitos</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {currentQuestion.left_concepts.map((concept, index) => {
                  const connection = connections.find(c => c.leftConcept === concept);
                  return (
                    <Droppable key={`left-${index}`} droppableId={`left-${index}`}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-3 border-2 border-dashed rounded-lg min-h-[50px] flex flex-col gap-2 transition-colors ${
                            snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                        >
                          <span className="font-medium text-sm">{concept}</span>
                          {connection && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                                {connection.rightConcept}
                              </span>
                              {connection.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>

            {/* Seta Visual - Apenas Desktop */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="text-2xl text-muted-foreground">→</div>
            </div>

            {/* Definições Disponíveis */}
            <div className="flex flex-col min-h-0">
              <h3 className="text-sm font-semibold mb-2 text-center">Definições</h3>
              <div className="flex-1 overflow-y-auto">
                <Droppable droppableId="available">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 pr-2"
                    >
                      {availableRightConcepts.map((concept, index) => (
                        <Draggable key={concept} draggableId={concept} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-card border rounded-lg cursor-move transition-all text-sm ${
                                snapshot.isDragging ? 'shadow-lg scale-105 z-50' : 'hover:shadow-md'
                              }`}
                            >
                              {concept}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}