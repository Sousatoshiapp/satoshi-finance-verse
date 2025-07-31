#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HARDCODED_STRING_PATTERNS = [
  /["'`][\s]*[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][^"'`]*["'`]/g,
  /["'`][\s]*[A-Z][a-z]*\s+(the|and|or|of|to|in|for|with|on|at|by|from|about|into|through|during|before|after|above|below|up|down|out|off|over|under|again|further|then|once)\s+[^"'`]*["'`]/g,
  /["'`][\s]*[A-Z][a-z]+(\s+[A-Z][a-z]+)*[\s]*["'`]/g,
  /["'`][\s]*(Loading|Carregando|Buscar|Search|Click|Clique|Enter|Digite|Submit|Enviar|Cancel|Cancelar|Save|Salvar|Delete|Excluir|Edit|Editar|Add|Adicionar|Remove|Remover|Update|Atualizar|Create|Criar|Login|Entrar|Logout|Sair|Register|Registrar|Welcome|Bem-vindo|Hello|Olá|Yes|Sim|No|Não|OK|Error|Erro|Success|Sucesso|Warning|Aviso|Info|Informação)[\s]*["'`]/g,
  /placeholder\s*=\s*["'`][^"'`]+["'`]/g,
  /title\s*=\s*["'`][^"'`]+["'`]/g,
  /aria-label\s*=\s*["'`][^"'`]+["'`]/g,
];

const IGNORE_PATTERNS = [
  /t\s*\(\s*["'`][^"'`]+["'`]/g,
  /console\.(log|error|warn|info)\s*\(/g,
  /className\s*=\s*["'`][^"'`]*["'`]/g,
  /class\s*=\s*["'`][^"'`]*["'`]/g,
  /id\s*=\s*["'`][^"'`]*["'`]/g,
  /data-[a-zA-Z-]+\s*=\s*["'`][^"'`]*["'`]/g,
  /["'`][./][^"'`]*["'`]/g,
  /["'`][a-zA-Z0-9]{1,2}["'`]/g,
  /["'`]\d+["'`]/g,
  /["'`]\d+(px|em|rem|%|vh|vw)["'`]/g,
  /["'`]#[0-9a-fA-F]{3,6}["'`]/g,
  /import\s+.*from\s+["'`][^"'`]+["'`]/g,
  /["'`][^"'`]*\.(js|ts|tsx|jsx|css|scss|json|png|jpg|jpeg|gif|svg|ico)["'`]/g,
];

function shouldIgnoreString(str, filePath) {
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.test(str)) {
      return true;
    }
  }
  
  const cleanStr = str.replace(/["'`]/g, '').trim();
  if (cleanStr.length < 3) {
    return true;
  }
  
  if (/^[\d\s\-_.,!@#$%^&*()+={}[\]|\\:";'<>?/~`]+$/.test(cleanStr)) {
    return true;
  }
  
  return false;
}

function generateTranslationKey(str, filePath) {
  const cleanStr = str.replace(/["'`]/g, '').trim();
  const fileName = path.basename(filePath, path.extname(filePath));
  const directory = path.dirname(filePath).split('/').pop();
  
  const key = cleanStr
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  return `${directory}.${fileName}.${key}`;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];
  
  for (const pattern of HARDCODED_STRING_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const matchedString = match[0];
      
      if (!shouldIgnoreString(matchedString, filePath)) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;
        
        results.push({
          string: matchedString,
          line: lineNumber,
          column: columnNumber,
          suggestedKey: generateTranslationKey(matchedString, filePath),
          context: content.substring(Math.max(0, match.index - 50), match.index + matchedString.length + 50)
        });
      }
    }
  }
  
  return results;
}

function scanDirectory(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const results = {};
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          const fileResults = scanFile(fullPath);
          if (fileResults.length > 0) {
            results[fullPath] = fileResults;
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return results;
}

function generateReport(results) {
  let totalStrings = 0;
  let report = '# i18n Audit Report\n\n';
  
  report += `Generated on: ${new Date().toISOString()}\n\n`;
  
  const byDirectory = {};
  for (const [filePath, strings] of Object.entries(results)) {
    const dir = path.dirname(filePath).split('/').slice(-2).join('/');
    if (!byDirectory[dir]) {
      byDirectory[dir] = 0;
    }
    byDirectory[dir] += strings.length;
    totalStrings += strings.length;
  }
  
  report += `## Summary\n\n`;
  report += `Total hardcoded strings found: **${totalStrings}**\n\n`;
  
  report += `### By Directory:\n`;
  for (const [dir, count] of Object.entries(byDirectory).sort((a, b) => b[1] - a[1])) {
    report += `- ${dir}: ${count} strings\n`;
  }
  report += '\n';
  
  report += `## Detailed Results\n\n`;
  
  for (const [filePath, strings] of Object.entries(results)) {
    const relativePath = path.relative(process.cwd(), filePath);
    report += `### ${relativePath}\n\n`;
    report += `Found ${strings.length} hardcoded string(s):\n\n`;
    
    for (const result of strings) {
      report += `**Line ${result.line}:${result.column}**\n`;
      report += `- String: \`${result.string}\`\n`;
      report += `- Suggested key: \`${result.suggestedKey}\`\n`;
      report += `- Context: \`${result.context.replace(/\n/g, '\\n')}\`\n\n`;
    }
  }
  
  return report;
}

const srcPath = path.join(process.cwd(), 'src');
console.log('🔍 Scanning for hardcoded strings...');
console.log(`Scanning directory: ${srcPath}`);

const results = scanDirectory(srcPath);
const report = generateReport(results);

const reportPath = path.join(process.cwd(), 'i18n-audit-report.md');
fs.writeFileSync(reportPath, report);

console.log(`\n📊 Audit complete!`);
console.log(`Report saved to: ${reportPath}`);
console.log(`Total files scanned: ${Object.keys(results).length}`);
console.log(`Total hardcoded strings found: ${Object.values(results).reduce((sum, arr) => sum + arr.length, 0)}`);

if (Object.keys(results).length > 0) {
  console.log('\n⚠️  Hardcoded strings detected! Please review the report.');
  process.exit(1);
} else {
  console.log('\n✅ No hardcoded strings found!');
  process.exit(0);
}
