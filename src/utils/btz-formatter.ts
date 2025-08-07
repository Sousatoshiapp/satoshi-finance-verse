/**
 * Formata valores BTZ mostrando sempre pelo menos 1 casa decimal
 * @param value - Valor BTZ para formatar
 * @returns String formatada (ex: "150,0", "150,1", "150,15")
 */
export function formatBTZ(value: number): string {
  if (value === 0) return "0,0";
  
  // Sempre mostrar pelo menos 1 casa decimal, máximo 2
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
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