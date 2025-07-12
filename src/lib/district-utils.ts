/**
 * Utility functions for district operations
 */

/**
 * Abbreviates district names when they exceed a certain length
 * @param name - The district name to abbreviate
 * @param maxLength - Maximum length before abbreviation (default: 8)
 * @returns Abbreviated name if too long, original name otherwise
 */
export function abbreviateDistrictName(name: string, maxLength: number = 8): string {
  if (name.length <= maxLength) {
    return name;
  }

  // Special cases for known district names
  const abbreviations: Record<string, string> = {
    'XP Investimentos District': 'XP Invest.',
    'Ânima Educação District': 'Ânima Ed.',
    'Sistema Bancário District': 'Sistema B.',
    'Fundos Imobiliários District': 'FIIs Dist.',
    'Mercado Internacional District': 'Mercado I.',
    'Fintech Valley District': 'Fintech V.',
    'Cripto Valley District': 'Cripto V.',
  };

  // Check for exact matches first
  if (abbreviations[name]) {
    return abbreviations[name];
  }

  // Generic abbreviation: take first words until maxLength
  const words = name.split(' ');
  let abbreviated = '';
  
  for (const word of words) {
    const potential = abbreviated + (abbreviated ? ' ' : '') + word;
    if (potential.length <= maxLength) {
      abbreviated = potential;
    } else {
      // If adding this word would exceed limit, try adding just first letter + '.'
      const firstLetter = word.charAt(0).toUpperCase() + '.';
      const withAbbrev = abbreviated + (abbreviated ? ' ' : '') + firstLetter;
      if (withAbbrev.length <= maxLength) {
        abbreviated = withAbbrev;
      }
      break;
    }
  }

  return abbreviated || name.substring(0, maxLength - 1) + '.';
}