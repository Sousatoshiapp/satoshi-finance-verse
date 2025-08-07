import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Badge } from "@/components/shared/ui/badge";
import { Users, DollarSign, Share2, TrendingUp, Copy, Gift } from "lucide-react";

export default function AffiliateProgram() {
  const stats = {
    totalReferrals: 23,
    activeReferrals: 18,
    totalEarnings: 1250.50,
    monthlyEarnings: 340.00,
    conversionRate: 12.5
  };

  const referralHistory = [
    { name: "Maria S.", date: "2024-01-20", status: "active", earnings: 45.00 },
    { name: "João P.", date: "2024-01-18", status: "pending", earnings: 0 },
    { name: "Ana L.", date: "2024-01-15", status: "active", earnings: 30.00 },
    { name: "Carlos R.", date: "2024-01-12", status: "active", earnings: 45.00 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Development Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <div className="text-2xl">🚧</div>
            <div>
              <h3 className="font-semibold">Em Desenvolvimento</h3>
              <p className="text-sm">Esta funcionalidade está sendo desenvolvida e estará disponível em breve!</p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6">👥 Programa de Afiliados</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Indicações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">{stats.activeReferrals} ativos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Ganhos Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.totalEarnings.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Desde o início</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Este Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.monthlyEarnings.toFixed(2)}</div>
              <p className="text-xs text-green-600">+25% vs mês anterior</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Média da plataforma: 8%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Link de Referência */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Seu Link de Referência
                </CardTitle>
                <CardDescription>
                  Compartilhe este link e ganhe comissão por cada usuário que se cadastrar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value="https://satoshigame.com/ref/SEUCOD123"
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Gerar QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Indicações */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Indicações</CardTitle>
                <CardDescription>Seus referidos recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralHistory.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{referral.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(referral.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                          {referral.status === 'active' ? 'Ativo' : 'Pendente'}
                        </Badge>
                        <div className="text-sm font-medium mt-1">
                          R$ {referral.earnings.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Como Funciona */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">1</div>
                  <div className="text-sm">
                    <div className="font-medium">Compartilhe seu link</div>
                    <div className="text-muted-foreground">Envie para amigos e familiares</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">2</div>
                  <div className="text-sm">
                    <div className="font-medium">Eles se cadastram</div>
                    <div className="text-muted-foreground">Usando seu link de referência</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">3</div>
                  <div className="text-sm">
                    <div className="font-medium">Você ganha comissão</div>
                    <div className="text-muted-foreground">30% de suas compras por 1 ano</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Níveis de Comissão */}
            <Card>
              <CardHeader>
                <CardTitle>Níveis de Comissão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bronze (0-10 refs)</span>
                  <Badge variant="outline">20%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Prata (11-25 refs)</span>
                  <Badge variant="outline">25%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Ouro (26-50 refs)</span>
                  <Badge>30%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Diamante (51+ refs)</span>
                  <Badge variant="outline">35%</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Você está no nível Ouro
                </div>
              </CardContent>
            </Card>

            {/* Próximo Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Próximo Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">R$ 340,00</div>
                  <div className="text-sm text-muted-foreground">Em 15 de Fevereiro</div>
                  <Button className="w-full mt-4" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
