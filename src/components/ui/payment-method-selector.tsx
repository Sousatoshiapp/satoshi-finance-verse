import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Coins, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

export interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (method: 'card' | 'crypto') => void;
  isLoading?: boolean;
  amount: number;
  productName: string;
}

export function PaymentMethodSelector({ 
  onPaymentMethodSelect, 
  isLoading = false, 
  amount, 
  productName 
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'crypto'>('card');

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const paymentMethods = [
    {
      id: 'card' as const,
      title: 'Cartão de Crédito',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      features: ['Processamento instantâneo', 'Proteção contra fraude', 'Aceita todos os cartões'],
      badge: 'Mais rápido',
      badgeVariant: 'default' as const,
    },
    {
      id: 'crypto' as const,
      title: 'Criptomoedas',
      description: 'Bitcoin, Ethereum, USDT e outras',
      icon: Coins,
      features: ['Taxas menores', 'Pagamento global', 'Privacidade total'],
      badge: 'Desconto 5%',
      badgeVariant: 'secondary' as const,
    }
  ];

  const selectedMethodData = paymentMethods.find(method => method.id === selectedMethod);
  const finalAmount = selectedMethod === 'crypto' ? Math.round(amount * 0.95) : amount; // 5% discount for crypto

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Escolha seu método de pagamento
        </CardTitle>
        <CardDescription>
          Finalizando compra de: <strong>{productName}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => setSelectedMethod(value as 'card' | 'crypto')}
          className="space-y-3"
        >
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Label
                htmlFor={method.id}
                className={`relative flex cursor-pointer rounded-lg border-2 p-4 hover:bg-muted/50 transition-all ${
                  selectedMethod === method.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border'
                }`}
              >
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="sr-only"
                />
                
                <div className="flex items-start space-x-4 w-full">
                  <div className={`rounded-full p-2 ${
                    selectedMethod === method.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <method.icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{method.title}</h3>
                        <Badge variant={method.badgeVariant} className="text-xs">
                          {method.badge}
                        </Badge>
                      </div>
                      {selectedMethod === method.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-4 w-4 rounded-full bg-primary flex items-center justify-center"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                    
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {method.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>

        {/* Price Summary */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatPrice(amount)}</span>
          </div>
          
          {selectedMethod === 'crypto' && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto cripto (5%):</span>
              <span>-{formatPrice(amount - finalAmount)}</span>
            </div>
          )}
          
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total:</span>
            <span className={selectedMethod === 'crypto' ? 'text-green-600' : ''}>
              {formatPrice(finalAmount)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onPaymentMethodSelect(selectedMethod)}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
              Processando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {selectedMethodData?.icon && <selectedMethodData.icon className="h-4 w-4" />}
              Pagar com {selectedMethodData?.title}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}