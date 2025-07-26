export interface CSVOptions {
  delimiter?: string;
  quote?: string;
  escapeQuotes?: boolean;
}

export function optimizedCSVGeneration<T extends Record<string, unknown>>(
  data: T[],
  headers?: string[],
  options: CSVOptions = {}
): string {
  const { delimiter = ',', quote = '"', escapeQuotes = true } = options;
  
  if (!data || data.length === 0) {
    return headers ? headers.join(delimiter) : '';
  }

  const csvHeaders = headers || Object.keys(data[0]);
  
  const escapeField = (field: string): string => {
    const fieldStr = String(field);
    if (escapeQuotes && fieldStr.includes(quote)) {
      return `${quote}${fieldStr.replace(new RegExp(quote, 'g'), quote + quote)}${quote}`;
    }
    if (fieldStr.includes(delimiter) || fieldStr.includes('\n') || fieldStr.includes('\r')) {
      return `${quote}${fieldStr}${quote}`;
    }
    return fieldStr;
  };

  const headerRow = csvHeaders.map(escapeField).join(delimiter);
  
  const dataRows = data.map(row => 
    csvHeaders.map(header => escapeField(String(row[header] || ''))).join(delimiter)
  );

  return [headerRow, ...dataRows].join('\n');
}

export function generateQuestionCSV(questions: Array<{
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  category: string;
  difficulty: string;
  tags?: string[];
  concepts?: string[];
  source_material?: string;
}>): string {
  const headers = [
    'question', 'option_a', 'option_b', 'option_c', 'option_d', 
    'correct_answer', 'explanation', 'category', 'difficulty', 
    'tags', 'concepts', 'source_material'
  ];
  
  const transformedData = questions.map(q => ({
    question: q.question,
    option_a: q.options[0] || '',
    option_b: q.options[1] || '',
    option_c: q.options[2] || '',
    option_d: q.options[3] || '',
    correct_answer: q.correct_answer,
    explanation: q.explanation || '',
    category: q.category,
    difficulty: q.difficulty,
    tags: (q.tags || []).join(';'),
    concepts: (q.concepts || []).join(';'),
    source_material: q.source_material || ''
  }));

  return optimizedCSVGeneration(transformedData, headers);
}
