/**
 * Script rápido para testar lógica de diferença de vendas
 * Atualiza apenas 2 vendedores para criar dados de teste
 */

import { listarVendedores, insertMetrica } from '../server/db.ts';
import { extrairDadosVendedor } from '../server/sheetsExtractor.ts';

console.log('🧪 Teste de Diferença de Vendas\n');

// Pega apenas 2 vendedores para teste rápido
const vendedores = await listarVendedores();
const vendedoresTest = vendedores.slice(0, 2); // Francine e Gabriel

console.log(`📊 Atualizando ${vendedoresTest.length} vendedores...\n`);

for (const vendedor of vendedoresTest) {
  console.log(`👤 ${vendedor.nome} (${vendedor.sheetId})`);
  
  try {
    // Extrai apenas Novembro/2025
    const resultados = await extrairDadosVendedor(vendedor.sheetId, ['Novembro/2025']);
    
    for (const resultado of resultados) {
      const metricas = resultado.metricas;
      
      if (!metricas?.encontrado) {
        console.log(`   ⚠️  Sem dados para ${resultado.mes}`);
        continue;
      }
      
      await insertMetrica({
        vendedorId: vendedor.id,
        mes: resultado.mes,
        totalVendas: metricas.totalVendas || 0,
        totalReceita: metricas.totalReceita || 0,
        comissaoTotal: metricas.comissaoTotal || 0,
        percentualReceita: metricas.percentualReceita || 0,
        status: 'com_dados',
        dataExtracao: new Date() // Nova data de extração!
      });
      
      console.log(`   ✅ ${resultado.mes}: R$ ${(metricas.totalVendas / 100).toFixed(2)}`);
    }
  } catch (error) {
    console.error(`   ❌ Erro: ${error.message}`);
  }
}

console.log('\n✨ Teste concluído!');
console.log('Agora você pode verificar a página de Monitoramento.');

process.exit(0);
