import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Textarea } from "@/components/shared/ui/textarea";
import { Switch } from "@/components/shared/ui/switch";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { 
  validatePortfolioName, 
  validatePortfolioDescription, 
  validateInitialBalance 
} from "@/lib/validation";
import { Portfolio, Holding } from "./types";

interface PortfolioFormProps {
  portfolio: Portfolio;
  holdings: Holding[];
  errors: Record<string, string>;
  onPortfolioChange: (portfolio: Portfolio) => void;
  onErrorsChange: (errors: Record<string, string>) => void;
}

export function PortfolioForm({ 
  portfolio, 
  holdings, 
  errors, 
  onPortfolioChange, 
  onErrorsChange 
}: PortfolioFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Carteira de Investimentos</CardTitle>
        <CardDescription>
          Crie uma carteira virtual para praticar suas estratégias de investimento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome da Carteira</Label>
            <Input
              id="name"
              value={portfolio.name}
              onChange={(e) => {
                const value = e.target.value;
                onPortfolioChange({...portfolio, name: value});
                const error = validatePortfolioName(value);
                onErrorsChange({...errors, name: error || ''});
              }}
              placeholder="Minha Carteira Diversificada"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="balance">Saldo Inicial (R$)</Label>
            <Input
              id="balance"
              type="number"
              min="100"
              max="10000000"
              value={portfolio.initial_balance}
              onChange={(e) => {
                const value = Number(e.target.value);
                onPortfolioChange({...portfolio, initial_balance: value});
                const error = validateInitialBalance(value);
                onErrorsChange({...errors, balance: error || ''});
              }}
              className={errors.balance ? "border-red-500" : ""}
            />
            {errors.balance && <p className="text-sm text-red-500 mt-1">{errors.balance}</p>}
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={portfolio.description}
            maxLength={500}
            onChange={(e) => {
              const value = e.target.value;
              onPortfolioChange({...portfolio, description: value});
              const error = validatePortfolioDescription(value);
              onErrorsChange({...errors, description: error || ''});
            }}
            placeholder="Estratégia focada em dividendos e crescimento..."
            className={errors.description ? "border-red-500" : ""}
          />
          <div className="flex justify-between items-center">
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-sm text-muted-foreground ml-auto">
              {portfolio.description.length}/500
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="public"
            checked={portfolio.is_public}
            onCheckedChange={(checked) => onPortfolioChange({...portfolio, is_public: checked})}
          />
          <Label htmlFor="public">Carteira pública (outros usuários podem ver e seguir)</Label>
        </div>

        {/* Portfolio Performance */}
        {holdings.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">
                Saldo: R$ {portfolio.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {portfolio.performance_percentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                portfolio.performance_percentage >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {portfolio.performance_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
