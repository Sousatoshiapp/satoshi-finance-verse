/**
 * Formata valores BTZ com até 2 casas decimais, removendo zeros desnecessários
 * @param value - Valor BTZ para formatar
 * @returns String formatada (ex: "1", "0.1", "0.15", "1,234.56")
 */
export function formatBTZ(value: number): string {
  if (value === 0) return "0";
  
  // Se for número inteiro, não mostrar decimais
  if (value % 1 === 0) {
    return value.toLocaleString();
  }
  
  // Para decimais, mostrar até 2 casas removendo zeros desnecessários
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
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