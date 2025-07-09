import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  BookOpen, 
  TrendingUp, 
  Target,
  Lightbulb,
  MessageCircle,
  User,
  Bot
} from "lucide-react";

export default function AITutor() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      type: "bot",
      message: "Olá! Sou seu tutor de IA especializado em educação financeira. Como posso ajudá-lo hoje?",
      timestamp: "14:30"
    },
    {
      type: "user", 
      message: "Quero aprender sobre investimentos",
      timestamp: "14:31"
    },
    {
      type: "bot",
      message: "Ótimo! Vamos começar com o básico. Investimentos são formas de aplicar seu dinheiro para que ele cresça ao longo do tempo. Que tipo de investimento te interessa mais: renda fixa ou renda variável?",
      timestamp: "14:31"
    }
  ]);

  const learningTopics = [
    { title: "Conceitos Básicos", progress: 85, icon: BookOpen, color: "bg-blue-500" },
    { title: "Investimentos", progress: 60, icon: TrendingUp, color: "bg-green-500" },
    { title: "Planejamento", progress: 40, icon: Target, color: "bg-purple-500" },
    { title: "Economia", progress: 25, icon: Lightbulb, color: "bg-orange-500" },
  ];

  const quickQuestions = [
    "O que é inflação?",
    "Como funciona a poupança?",
    "Qual a diferença entre ações e títulos?",
    "Como fazer um orçamento pessoal?"
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newUserMessage = {
      type: "user" as const,
      message: message,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setMessage("");

    // Simular resposta do bot
    setTimeout(() => {
      const botResponse = {
        type: "bot" as const,
        message: "Excelente pergunta! Deixe-me explicar isso de forma didática...",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🤖 Tutor de IA</h1>
          <p className="text-muted-foreground">
            Seu assistente pessoal para aprendizado de educação financeira
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Principal */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Chat com IA</CardTitle>
                    <CardDescription>Faça perguntas sobre educação financeira</CardDescription>
                  </div>
                  <Badge className="ml-auto">Online</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className={`flex gap-3 ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${chat.type === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            chat.type === 'bot' ? 'bg-primary text-white' : 'bg-secondary'
                          }`}>
                            {chat.type === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className={`rounded-lg p-3 ${
                            chat.type === 'user' 
                              ? 'bg-primary text-white' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{chat.message}</p>
                            <p className={`text-xs mt-1 ${chat.type === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                              {chat.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua pergunta..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progresso de Aprendizado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seu Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningTopics.map((topic, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${topic.color} text-white`}>
                        <topic.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{topic.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{topic.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all" 
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Perguntas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Perguntas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => {
                      setMessage(question);
                      handleSendMessage();
                    }}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Perguntas feitas</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tópicos dominados</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tempo de estudo</span>
                  <span className="font-semibold">2h 15m</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}