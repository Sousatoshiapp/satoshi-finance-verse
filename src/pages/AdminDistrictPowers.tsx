import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { 
  DollarSign, 
  Cpu, 
  Shield, 
  Zap, 
  ShoppingCart, 
  Users,
  Building2,
  Save,
  RefreshCw
} from "lucide-react";

import type { District } from "@/integrations/supabase/types";

export default function AdminDistrictPowers() {
  const { t } = useI18n();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const powerConfig = [
    { key: 'monetary_power', label: 'Monetário', icon: DollarSign, color: '#10B981' },
    { key: 'tech_power', label: 'Tecnológico', icon: Cpu, color: '#3B82F6' },
    { key: 'military_power', label: 'Militar', icon: Shield, color: '#EF4444' },
    { key: 'energy_power', label: 'Energético', icon: Zap, color: '#F59E0B' },
    { key: 'commercial_power', label: 'Comercial', icon: ShoppingCart, color: '#8B5CF6' },
    { key: 'social_power', label: 'Social', icon: Users, color: '#EC4899' }
  ];

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error('Error loading districts:', error);
      toast({
        title: "Erro ao carregar distritos",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateDistrictPower = async (districtId: string, powerType: string, value: number) => {
    try {
      setSaving(districtId);
      
      const { error } = await supabase
        .from('districts')
        .update({ [powerType]: Math.max(0, Math.min(100, value)) })
        .eq('id', districtId);

      if (error) throw error;

      setDistricts(prev => prev.map(d => 
        d.id === districtId 
          ? { ...d, [powerType]: Math.max(0, Math.min(100, value)) }
          : d
      ));

      toast({
        title: "Poder atualizado",
        description: "O poder do distrito foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating district power:', error);
      toast({
        title: "Erro ao atualizar poder",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const resetAllPowers = async (districtId: string) => {
    try {
      setSaving(districtId);
      
      const resetValues = {
        monetary_power: 0,
        tech_power: 0,
        military_power: 0,
        energy_power: 0,
        commercial_power: 0,
        social_power: 0
      };

      const { error } = await supabase
        .from('districts')
        .update(resetValues)
        .eq('id', districtId);

      if (error) throw error;

      setDistricts(prev => prev.map(d => 
        d.id === districtId 
          ? { ...d, ...resetValues }
          : d
      ));

      toast({
        title: "Poderes resetados",
        description: "Todos os poderes do distrito foram resetados para 0.",
      });
    } catch (error) {
      console.error('Error resetting district powers:', error);
      toast({
        title: "Erro ao resetar poderes",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                  Gestão de Poderes dos Distritos
                </h1>
                <p className="text-muted-foreground">
                  Gerencie os 6 poderes de cada distrito
                </p>
              </div>
              <Button onClick={loadDistricts} disabled={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {loading ? "Carregando..." : "Atualizar"}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">Carregando distritos...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {districts.map((district) => {
                  const totalPower = powerConfig.reduce((sum, config) => 
                    sum + ((district[config.key as keyof District] as number) || 0), 0
                  );
                  const averagePower = Math.round(totalPower / powerConfig.length);

                  return (
                    <Card key={district.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Building2 
                              className="w-5 h-5" 
                              style={{ color: district.color_primary }} 
                            />
                            {district.name}
                          </span>
                          <Badge variant="outline">
                            Média: {averagePower}%
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {powerConfig.map((config) => {
                            const IconComponent = config.icon;
                            const currentValue = (district[config.key as keyof District] as number) || 0;

                            return (
                              <div key={config.key} className="flex items-center gap-4">
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: config.color }}
                                  >
                                    <IconComponent className="w-3 h-3 text-white" />
                                  </div>
                                  <Label className="text-sm">{config.label}</Label>
                                </div>
                                
                                <div className="flex-1 flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={currentValue.toString()}
                                    onChange={(e) => {
                                      const newValue = parseInt(e.target.value) || 0;
                                      setDistricts(prev => prev.map(d => 
                                        d.id === district.id 
                                          ? { ...d, [config.key]: newValue }
                                          : d
                                      ));
                                    }}
                                    className="w-20"
                                  />
                                  <span className="text-sm text-muted-foreground">%</span>
                                  <Button
                                    size="sm"
                                    onClick={() => updateDistrictPower(district.id, config.key, currentValue)}
                                    disabled={saving === district.id}
                                  >
                                    <Save className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          
                          <div className="pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetAllPowers(district.id)}
                              disabled={saving === district.id}
                              className="w-full"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resetar Todos os Poderes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminAuthProtection>
  );
}
