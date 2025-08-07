/**
 * Formata valores BTZ armazenados como inteiros (centavos) para exibição com decimais
 * @param value - Valor BTZ em centavos (ex: 19567 representa 195.67 BTZ)
 * @returns String formatada com 2 casas decimais (ex: "195.67", "0.10", "1,234.56")
 */
export function formatBTZ(value: number): string {
  if (value === 0) return "0.00";
  
  // Converte centavos para BTZ (divide por 100)
  const btzValue = value / 100;
  
  // Sempre mostrar 2 casas decimais
  const formatted = btzValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatted;
}

/**
 * Formata valores BTZ para exibição em componentes, garantindo legibilidade
 * @param value - Valor BTZ para formatar
 * @param showCurrency - Se deve mostrar "BTZ" após o valor
 * @returns String formatada com ou sem unidade
 */
export function formatBTZDisplay(value: number, showCurrency: boolean = true): string {
  const formatted = formatBTZ(value);
  return showCurrency ? `${formatted} BTZ` : formatted;
}