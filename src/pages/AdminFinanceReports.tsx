import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminFinanceReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reportData = {
    revenue: {
      current: 2450.75,
      previous: 2180.50,
      growth: 12.4
    },
    subscribers: {
      current: 123,
      new: 18,
      churned: 4
    },
    transactions: {
      total: 156,
      successful: 152,
      failed: 4
    }
  };

  const generateReport = async (type: string) => {
    setLoading(true);
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Relatório gerado!",
        description: `Relatório ${type} foi gerado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const reportTypes = [
    {
      id: 'revenue',
      title: 'Relatório de Receita',
      description: 'Análise detalhada de receitas por período',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      id: 'subscribers',
      title: 'Relatório de Assinantes',
      description: 'Crescimento e retenção de assinantes',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      id: 'transactions',
      title: 'Relatório de Transações',
      description: 'Histórico completo de transações',
      icon: FileText,
      color: 'text-purple-500'
    },
    {
      id: 'performance',
      title: 'Relatório de Performance',
      description: 'Métricas de performance financeira',
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ];

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">Relatórios Financeiros</h1>
                <p className="text-muted-foreground">Gere e visualize relatórios financeiros detalhados</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <DollarSign className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Receita Atual</p>
                        <p className="text-2xl font-bold">{formatCurrency(reportData.revenue.current)}</p>
                        <p className="text-sm text-green-500">+{reportData.revenue.growth}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Assinantes Ativos</p>
                        <p className="text-2xl font-bold">{reportData.subscribers.current}</p>
                        <p className="text-sm text-green-500">+{reportData.subscribers.new} novos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                        <p className="text-2xl font-bold">
                          {((reportData.transactions.successful / reportData.transactions.total) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">{reportData.transactions.total} transações</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Report Generator */}
              <Card>
                <CardHeader>
                  <CardTitle>Gerador de Relatórios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Período</label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Report Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((report) => {
                  const IconComponent = report.icon;
                  return (
                    <Card key={report.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <IconComponent className={`h-6 w-6 ${report.color}`} />
                          {report.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground text-sm">
                          {report.description}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => generateReport(report.id)}
                            disabled={loading}
                            className="flex-1"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Gerar Relatório
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => generateReport(`${report.id}-download`)}
                            disabled={loading}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: 'Relatório de Receita - Dezembro 2024',
                        type: 'revenue',
                        date: '2024-12-01',
                        size: '2.4 MB',
                        status: 'completed'
                      },
                      {
                        name: 'Relatório de Assinantes - Novembro 2024',
                        type: 'subscribers',
                        date: '2024-11-01',
                        size: '1.8 MB',
                        status: 'completed'
                      },
                      {
                        name: 'Relatório de Transações - Outubro 2024',
                        type: 'transactions',
                        date: '2024-10-01',
                        size: '3.2 MB',
                        status: 'completed'
                      }
                    ].map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold">{report.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(report.date).toLocaleDateString('pt-BR')}</span>
                              <span>•</span>
                              <span>{report.size}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {report.status === 'completed' ? 'Concluído' : 'Processando'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}