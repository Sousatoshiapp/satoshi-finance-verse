import { z } from 'zod';

export const portfolioNameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres')
  .regex(/^[a-zA-Z0-9\s\-_.áéíóúàèìòùâêîôûãõç]+$/i, 'Nome contém caracteres inválidos');

export const portfolioDescriptionSchema = z
  .string()
  .max(500, 'Descrição deve ter no máximo 500 caracteres');

export const assetQuantitySchema = z
  .number()
  .min(0.000001, 'Quantidade muito pequena')
  .max(1000000, 'Quantidade muito grande');

export const assetPriceSchema = z
  .number()
  .min(0.01, 'Preço muito baixo')
  .max(1000000, 'Preço muito alto');

export const initialBalanceSchema = z
  .number()
  .min(100, 'Saldo mínimo: R$ 100')
  .max(10000000, 'Saldo máximo: R$ 10.000.000');

export const messageContentSchema = z
  .string()
  .min(1, 'Mensagem não pode estar vazia')
  .max(1000, 'Mensagem muito longa (máximo 1000 caracteres)')
  .refine(
    (content) => !detectSuspiciousContent(content),
    'Conteúdo suspeito detectado'
  );

export const nicknameSchema = z
  .string()
  .min(2, 'Nome deve ter pelo menos 2 caracteres')
  .max(50, 'Nome deve ter no máximo 50 caracteres')
  .regex(/^[a-zA-Z0-9\s\-_.áéíóúàèìòùâêîôûãõç]+$/i, 'Nome contém caracteres inválidos');

function detectSuspiciousContent(content: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(content));
}

export type PortfolioNameInput = z.infer<typeof portfolioNameSchema>;
export type PortfolioDescriptionInput = z.infer<typeof portfolioDescriptionSchema>;
export type AssetQuantityInput = z.infer<typeof assetQuantitySchema>;
export type AssetPriceInput = z.infer<typeof assetPriceSchema>;
export type InitialBalanceInput = z.infer<typeof initialBalanceSchema>;
export type MessageContentInput = z.infer<typeof messageContentSchema>;
export type NicknameInput = z.infer<typeof nicknameSchema>;
