/**
 * Script de teste para verificar extração de vendas diárias
 */

import { extrairVendasDiarias } from '../server/sheetsExtractor.ts';

// Testa com a planilha da Francine (tem muitos dados)
const sheetId = '1PpzDxn6eM3LKwtJTchD6qVbbyUkAeDnA6hNy0gmrx10';
const mes = 'Novembro/2024';

console.log(`🧪 Testando extração de vendas diárias:`);
console.log(`   Planilha: ${sheetId}`);
console.log(`   Mês: ${mes}\n`);

try {
  const vendas = await extrairVendasDiarias(sheetId, mes);
  
  console.log(`\n📊 Resultado:`);
  console.log(`   Total de vendas: ${vendas.length}`);
  
  if (vendas.length > 0) {
    console.log(`\n📝 Primeiras 5 vendas:`);
    vendas.slice(0, 5).forEach((venda, i) => {
      console.log(`   ${i+1}. ${venda.dataVenda.toLocaleDateString('pt-BR')} - ${venda.nomePassageiros} - R$ ${(venda.valorTotal/100).toFixed(2)}`);
    });
  } else {
    console.log(`\n⚠️  Nenhuma venda encontrada!`);
    console.log(`   Possíveis causas:`);
    console.log(`   - Formato da planilha diferente do esperado`);
    console.log(`   - Coluna H (data) ou L (passageiros) não encontradas`);
    console.log(`   - Dados não estão no formato esperado`);
  }
  
} catch (error) {
  console.error(`\n❌ Erro:`, error.message);
  console.error(error.stack);
}

process.exit(0);
