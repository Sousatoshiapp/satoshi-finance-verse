import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, TrendingUp, TrendingDown, Send, Download, History, CreditCard } from "lucide-react";

export default function Wallet() {
  const balance = {
    beetz: 2450,
    realMoney: 125.50,
    totalValue: 320.80
  };

  const transactions = [
    { id: 1, type: "earn", description: "Quiz completado", amount: 50, currency: "beetz", date: "2024-01-20" },
    { id: 2, type: "spend", description: "Power-up comprado", amount: -30, currency: "beetz", date: "2024-01-19" },
    { id: 3, type: "earn", description: "Duelo vencido", amount: 75, currency: "beetz", date: "2024-01-18" },
    { id: 4, type: "deposit", description: "Depósito PIX", amount: 50.00, currency: "BRL", date: "2024-01-17" },
    { id: 5, type: "earn", description: "Conquista desbloqueada", amount: 100, currency: "beetz", date: "2024-01-16" },
  ];

  const paymentMethods = [
    { name: "PIX", description: "Instantâneo", icon: "🔄", available: true },
    { name: "Cartão de Crédito", description: "Visa/Master", icon: "💳", available: true },
    { name: "PayPal", description: "Em breve", icon: "💰", available: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">💰 Carteira Virtual</h1>

        {/* Saldo Principal */}
        <Card className="mb-6 bg-gradient-to-r from-primary to-secondary text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="w-6 h-6" />
              Saldo Total
            </CardTitle>
            <CardDescription className="text-white/80">
              Valor estimado em reais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">R$ {balance.totalValue.toFixed(2)}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/80">Beetz</div>
                <div className="text-xl font-semibold">{balance.beetz} 🪙</div>
              </div>
              <div>
                <div className="text-white/80">Dinheiro Real</div>
                <div className="text-xl font-semibold">R$ {balance.realMoney.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="deposit">Depositar</TabsTrigger>
            <TabsTrigger value="withdraw">Sacar</TabsTrigger>
          </TabsList>

          {/* Transações */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico de Transações
                </CardTitle>
                <CardDescription>Suas movimentações recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'earn' || transaction.type === 'deposit' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'earn' || transaction.type === 'deposit' ? 
                            <TrendingUp className="w-4 h-4" /> : 
                            <TrendingDown className="w-4 h-4" />
                          }
                        </div>
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className={`text-right font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} {
                          transaction.currency === 'beetz' ? '🪙' : 'R$'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Depositar */}
          <TabsContent value="deposit">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Adicionar Fundos
                  </CardTitle>
                  <CardDescription>Escolha um método de pagamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className={`p-4 border rounded-lg flex items-center justify-between ${
                        method.available ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-muted-foreground">{method.description}</div>
                          </div>
                        </div>
                        <Badge variant={method.available ? 'default' : 'secondary'}>
                          {method.available ? 'Disponível' : 'Em breve'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Valores Sugeridos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {[10, 25, 50].map((value) => (
                      <Button key={value} variant="outline" className="h-16 flex-col">
                        <span className="text-lg font-bold">R$ {value}</span>
                        <span className="text-xs text-muted-foreground">+{value * 20} Beetz</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sacar */}
          <TabsContent value="withdraw">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Sacar Dinheiro
                </CardTitle>
                <CardDescription>
                  Disponível para saque: R$ {balance.realMoney.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Requisitos para Saque</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Valor mínimo: R$ 10,00</li>
                    <li>• Processamento: 1-2 dias úteis</li>
                    <li>• Taxa: R$ 2,00 por transação</li>
                  </ul>
                </div>
                
                <Button className="w-full" disabled={balance.realMoney < 10}>
                  <Send className="w-4 h-4 mr-2" />
                  Solicitar Saque
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}