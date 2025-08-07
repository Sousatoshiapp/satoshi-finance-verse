import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared/ui/select';
import { useWalletTransactions } from '@/hooks/use-wallet-transactions';
import { Wallet, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';

export function WalletDashboard() {
  const { 
    transactions, 
    stats, 
    loading, 
    filterTransactions,
    groupTransactionsByDate,
    getTransactionsByPeriod,
    formatAmount,
    getTransactionColor,
    getTransactionIcon
  } = useWalletTransactions();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredTransactions = selectedType === 'all' 
    ? getTransactionsByPeriod(selectedPeriod)
    : filterTransactions(selectedType).filter(t => {
        const periodTransactions = getTransactionsByPeriod(selectedPeriod);
        return periodTransactions.includes(t);
      });

  const groupedTransactions = groupTransactionsByDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando carteira...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Carteira Digital</h2>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          <span className="text-lg font-semibold">
            {stats?.currentBalance || 0} Beetz
          </span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Saldo Atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.currentBalance || 0}</div>
                <p className="text-xs text-muted-foreground">Beetz</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Total Ganho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats?.totalEarned || 0}
                </div>
                <p className="text-xs text-muted-foreground">Beetz</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  Total Gasto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats?.totalSpent || 0}
                </div>
                <p className="text-xs text-muted-foreground">Beetz</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.todayEarned || 0}
                </div>
                <p className="text-xs text-muted-foreground">Beetz ganhos</p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas por período */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Esta Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  +{stats?.weekEarned || 0}
                </div>
                <p className="text-xs text-muted-foreground">Beetz ganhos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Este Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  +{stats?.monthEarned || 0}
                </div>
                <p className="text-xs text-muted-foreground">Beetz ganhos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {transactions.length}
                </div>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="earn">Ganhos</SelectItem>
                  <SelectItem value="spend">Gastos</SelectItem>
                  <SelectItem value="purchase">Compras</SelectItem>
                  <SelectItem value="transfer">Transferências</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de transações */}
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhuma transação encontrada
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(transaction.created_at).toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getTransactionColor(transaction)}`}>
                          {formatAmount(transaction.amount)}
                        </p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {transaction.source_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Resumo dos filtros */}
          {filteredTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ganhos</p>
                    <p className="text-lg font-bold text-green-600">
                      +{filteredTransactions
                        .filter(t => t.amount > 0)
                        .reduce((sum, t) => sum + t.amount, 0)
                        .toLocaleString('pt-BR')} Beetz
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gastos</p>
                    <p className="text-lg font-bold text-red-600">
                      -{filteredTransactions
                        .filter(t => t.amount < 0)
                        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                        .toLocaleString('pt-BR')} Beetz
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
