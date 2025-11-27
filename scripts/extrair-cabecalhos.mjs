#!/usr/bin/env node
/**
 * Script para extrair cabeçalhos de uma planilha do Google Sheets
 * Uso: node --import tsx scripts/extrair-cabecalhos.mjs
 */

import { extrairMetricasAba } from '../server/sheetsExtractor.ts';

const SHEET_ID = '1ZJz0MgOHLkYYNW5eWZmOAU797KXQPbwGmp8YnWl4NPo'; // Rafael
const MES = 'Agosto/2024';

console.log(`🔍 Extraindo cabeçalhos da planilha ${SHEET_ID}`);
console.log(`📅 Mês: ${MES}\n`);

try {
  const dados = await extrairMetricasAba(SHEET_ID, MES);
  
  if (dados && dados.table && dados.table.cols) {
    console.log('📊 Cabeçalhos encontrados:\n');
    dados.table.cols.forEach((col, index) => {
      const letra = String.fromCharCode(65 + index); // A=65, B=66, etc
      const label = col.label || '(sem nome)';
      console.log(`  ${letra} (índice ${index}): ${label}`);
    });
  } else {
    console.log('❌ Não foi possível extrair os cabeçalhos');
  }
} catch (error) {
  console.error('❌ Erro ao extrair cabeçalhos:', error.message);
}
