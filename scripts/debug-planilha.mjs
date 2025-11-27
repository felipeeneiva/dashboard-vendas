/**
 * Script de debug para verificar estrutura da planilha
 */

import axios from 'axios';

const sheetId = '1PpzDxn6eM3LKwtJTchD6qVbbyUkAeDnA6hNy0gmrx10';
const nomeAba = 'Novembro/2024';
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:html&sheet=${encodeURIComponent(nomeAba)}`;

console.log(`🔍 Debugando planilha:`);
console.log(`   URL: ${url}\n`);

try {
  const response = await axios.get(url, { timeout: 10000 });
  const html = response.data;
  
  console.log(`📄 Tamanho do HTML: ${html.length} caracteres\n`);
  
  // Extrai linhas da tabela
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
  
  let rowMatch;
  let rowIndex = 0;
  let totalRows = 0;
  
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    totalRows++;
    rowIndex++;
    
    // Mostra apenas primeiras 5 linhas
    if (rowIndex > 5) {
      continue;
    }
    
    const rowHtml = rowMatch[1];
    const cells = [];
    
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      const cellText = cellMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, '')
        .trim();
      cells.push(cellText);
    }
    
    console.log(`\nLinha ${rowIndex} (${cells.length} células):`);
    cells.forEach((cell, i) => {
      const label = String.fromCharCode(65 + i); // A, B, C, etc.
      console.log(`   ${label} (${i}): "${cell.substring(0, 50)}${cell.length > 50 ? '...' : ''}"`);
    });
  }
  
  console.log(`\n📊 Total de linhas encontradas: ${totalRows}`);
  
  // Verifica se encontrou coluna H (índice 7) e L (índice 11)
  console.log(`\n🔍 Verificando colunas esperadas:`);
  console.log(`   Coluna H (índice 7): Data de fechamento`);
  console.log(`   Coluna L (índice 11): Nome dos passageiros`);
  console.log(`   Coluna T (índice 19): Valor total`);
  
} catch (error) {
  console.error(`\n❌ Erro:`, error.message);
}

process.exit(0);
