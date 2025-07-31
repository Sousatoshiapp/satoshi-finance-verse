import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { 
  validatePortfolioName, 
  validatePortfolioDescription, 
  validateInitialBalance,
  sanitizeText,
  globalRateLimiter
} from "@/lib/validation";
import { SecurityLogger } from "@/lib/security-logger";
import { Portfolio, Holding } from "./types";
import { PortfolioForm } from "./portfolio-form";
import { HoldingsManager } from "./holdings-manager";
import { PortfolioCharts } from "./portfolio-charts";

interface PortfolioBuilderProps {
  districtTheme?: string;
  onSave?: (portfolio: Portfolio) => void;
}

export function PortfolioBuilder({ districtTheme, onSave }: PortfolioBuilderProps) {
  const { t } = useI18n();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    name: '',
    description: '',
    is_public: false,
    district_theme: districtTheme,
    initial_balance: 10000,
    current_balance: 10000,
    performance_percentage: 0
  });
  
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const savePortfolio = async () => {
    // Input validation
    const nameError = validatePortfolioName(portfolio.name);
    const descError = validatePortfolioDescription(portfolio.description);
    const balanceError = validateInitialBalance(portfolio.initial_balance);
    
    if (nameError || descError || balanceError) {
      toast({
        title: "Dados inválidos",
        description: nameError || descError || balanceError,
        variant: "destructive"
      });
      return;
    }

    // Rate limiting check
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !globalRateLimiter.canPerformAction(user.id, 'create_portfolio', 5)) {
      toast({
        title: "Limite atingido",
        description: "Aguarde um momento antes de criar outra carteira",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      // Save portfolio with sanitized data
      const sanitizedPortfolio = {
        ...portfolio,
        name: sanitizeText(portfolio.name),
        description: sanitizeText(portfolio.description),
        user_id: profile.id
      };

      const { data: savedPortfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .insert(sanitizedPortfolio)
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Save holdings
      if (holdings.length > 0) {
        const holdingsToSave = holdings.map(holding => ({
          ...holding,
          portfolio_id: savedPortfolio.id
        }));

        const { error: holdingsError } = await supabase
          .from('portfolio_holdings')
          .insert(holdingsToSave);

        if (holdingsError) throw holdingsError;
      }

      // Create activity and security log
      await supabase
        .from('activity_feed')
        .insert({
          user_id: profile.id,
          activity_type: 'create_portfolio',
          activity_data: {
            portfolio_id: savedPortfolio.id,
            portfolio_name: sanitizedPortfolio.name,
            district_theme: districtTheme
          }
        });

      // Security logging
      await SecurityLogger.logPortfolioCreation(savedPortfolio.id, sanitizedPortfolio.name);

      toast({
        title: "Carteira criada!",
        description: `${portfolio.name} foi salva com sucesso`,
      });

      onSave?.(savedPortfolio);
      
      // Reset form
      setPortfolio({
        name: '',
        description: '',
        is_public: false,
        district_theme: districtTheme,
        initial_balance: 10000,
        current_balance: 10000,
        performance_percentage: 0
      });
      setHoldings([]);

    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: t('errors.error'),
        description: t('errors.couldNotSave'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PortfolioForm
        portfolio={portfolio}
        holdings={holdings}
        errors={errors}
        onPortfolioChange={setPortfolio}
        onErrorsChange={setErrors}
      />

      <HoldingsManager
        holdings={holdings}
        portfolio={portfolio}
        onHoldingsChange={setHoldings}
        onPortfolioChange={setPortfolio}
      />

      <PortfolioCharts holdings={holdings} />

      <Button 
        onClick={savePortfolio} 
        disabled={loading || !portfolio.name.trim()}
        className="w-full"
        size="lg"
      >
        {loading ? t('admin.saving') : 'Criar Carteira'}
      </Button>
    </div>
  );
}
