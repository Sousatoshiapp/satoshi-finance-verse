import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAffiliateProgram } from '@/hooks/use-affiliate-program';
import { Users, DollarSign, TrendingUp, Share2, Copy, ExternalLink } from 'lucide-react';

export function AffiliateDashboard() {
  const { 
    program, 
    commissions, 
    loading, 
    creating, 
    hasProgram, 
    createAffiliateProgram, 
    generateReferralLink,
    copyReferralLink, 
    getStats 
  } = useAffiliateProgram();
  
  const [selectedTab, setSelectedTab] = useState('overview');
  const [customPath, setCustomPath] = useState('');

  const stats = getStats();

  const popularPages = [
    { name: 'Página Principal', path: '' },
    { name: 'Loja Virtual', path: 'store' },
    { name: 'Marketplace', path: 'marketplace' },
    { name: 'Duelos', path: 'duels' },
    { name: 'Quizzes', path: 'quizzes' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando programa de afiliado...</p>
        </div>
      </div>
    );
  }

  if (!hasProgram) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Programa de Afiliados</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl">💰</div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Comece a Ganhar Hoje!</h3>
            <p className="text-muted-foreground mb-4">
              Participe do nosso programa de afiliados e ganhe comissões por cada compra realizada através do seu link.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6">
              <li>• Ganhe 5% de comissão em todas as compras</li>
              <li>• Links personalizados para diferentes páginas</li>
              <li>• Acompanhe suas estatísticas em tempo real</li>
              <li>• Pagamentos automáticos mensais</li>
            </ul>
            <Button 
              onClick={createAffiliateProgram}
              disabled={creating}
              size="lg"
            >
              {creating ? 'Criando...' : 'Criar Programa de Afiliado'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Programa de Afiliados</h2>
        <Badge variant={stats?.activeProgram ? 'default' : 'secondary'}>
          {stats?.activeProgram ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Ganho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats?.totalEarned?.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Pendente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {stats?.pendingCommissions?.toFixed(2) || '0.00'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Comissão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.commissionRate || 0}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Código de referral */}
          <Card>
            <CardHeader>
              <CardTitle>Seu Código de Referral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-lg font-bold">
                  {program?.referral_code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyReferralLink()}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Links Populares</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularPages.map((page) => (
                <div key={page.path} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{page.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {generateReferralLink(page.path)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyReferralLink(page.path)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generateReferralLink(page.path), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Link Personalizado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-path">Caminho (opcional)</Label>
                <Input
                  id="custom-path"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="Ex: duels, store, marketplace"
                />
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-sm">
                  {generateReferralLink(customPath)}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyReferralLink(customPath)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <h3 className="text-lg font-semibold">Histórico de Comissões</h3>
          {commissions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhuma comissão encontrada
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {commissions.map((commission) => (
                <Card key={commission.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">
                            {commission.transactions?.store_products?.name || 'Compra'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(commission.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {(commission.commission_amount_cents / 100).toFixed(2)}
                        </p>
                        <Badge
                          variant={commission.status === 'paid' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}