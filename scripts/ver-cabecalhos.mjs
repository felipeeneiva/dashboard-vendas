#!/usr/bin/env node
/**
 * Script para ver cabeçalhos da planilha do Google Sheets
 */

import axios from 'axios';

const SHEET_ID = '1ZJz0MgOHLkYYNW5eWZmOAU797KXQPbwGmp8YnWl4NPo'; // Rafael
const NOME_ABA = 'Agosto/2024';

const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:html&sheet=${encodeURIComponent(NOME_ABA)}`;

console.log(`🔍 Buscando cabeçalhos da planilha...`);
console.log(`📊 Sheet ID: ${SHEET_ID}`);
console.log(`📅 Aba: ${NOME_ABA}\n`);

try {
  const response = await axios.get(url);
  const html = response.data;
  
  // Extrair a parte do JSON que contém os dados
  const match = html.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
  
  if (match && match[1]) {
    const jsonData = JSON.parse(match[1]);
    
    if (jsonData.table && jsonData.table.cols) {
      console.log('📋 Cabeçalhos encontrados:\n');
      jsonData.table.cols.forEach((col, index) => {
        const letra = String.fromCharCode(65 + index); // A=65, B=66, etc
        const label = col.label || '(vazio)';
        const tipo = col.type || 'unknown';
        console.log(`  ${letra.padEnd(3)} (índice ${String(index).padStart(2)}): ${label.padEnd(30)} [${tipo}]`);
      });
      
      console.log(`\n✅ Total de ${jsonData.table.cols.length} colunas encontradas`);
    } else {
      console.log('❌ Estrutura de dados inesperada');
    }
  } else {
    console.log('❌ Não foi possível extrair JSON da resposta');
  }
} catch (error) {
  console.error('❌ Erro:', error.message);
}
