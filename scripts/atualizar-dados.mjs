/**
 * Script para atualizar dados de todos os vendedores
 * Executa diretamente no servidor sem precisar de autenticação
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { vendedores, metricas } from '../drizzle/schema.ts';
import { extrairDadosVendedor, gerarListaMeses } from '../server/sheetsExtractor.ts';

// Conecta ao banco
const db = drizzle(process.env.DATABASE_URL);

console.log('🚀 Iniciando atualização de dados...\n');

// Busca todos os vendedores
const todosVendedores = await db.select().from(vendedores);
console.log(`📊 Encontrados ${todosVendedores.length} vendedores\n`);

// Gera lista de meses (2024 e 2025)
const meses = gerarListaMeses();
console.log(`📅 Buscando dados de ${meses.length} meses (2024-2025)\n`);

let vendedoresAtualizados = 0;
let totalRegistros = 0;
let totalComDados = 0;

for (const vendedor of todosVendedores) {
  try {
    console.log(`\n👤 Processando: ${vendedor.nome}`);
    console.log(`   ID da planilha: ${vendedor.sheetId}`);
    
    const resultados = await extrairDadosVendedor(vendedor.sheetId, meses);
    
    let mesesComDados = 0;
    for (const resultado of resultados) {
      const metricasData = resultado.metricas;
      
      // Insere ou atualiza métrica
      await db.insert(metricas).values({
        vendedorId: vendedor.id,
        mes: resultado.mes,
        totalVendas: metricasData?.totalVendas || 0,
        totalReceita: metricasData?.totalReceita || 0,
        comissaoTotal: metricasData?.comissaoTotal || 0,
        percentualReceita: metricasData?.percentualReceita || 0,
        status: metricasData?.encontrado ? 'com_dados' : 'sem_dados',
        dataExtracao: new Date()
      }).onDuplicateKeyUpdate({
        set: {
          totalVendas: metricasData?.totalVendas || 0,
          totalReceita: metricasData?.totalReceita || 0,
          comissaoTotal: metricasData?.comissaoTotal || 0,
          percentualReceita: metricasData?.percentualReceita || 0,
          status: metricasData?.encontrado ? 'com_dados' : 'sem_dados',
          dataExtracao: new Date()
        }
      });
      
      if (metricasData?.encontrado) {
        mesesComDados++;
        totalComDados++;
      }
      totalRegistros++;
    }
    
    console.log(`   ✅ ${mesesComDados} meses com dados de ${meses.length} meses processados`);
    vendedoresAtualizados++;
    
  } catch (error) {
    console.error(`   ❌ Erro ao processar ${vendedor.nome}:`, error.message);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📈 RESUMO DA ATUALIZAÇÃO');
console.log('='.repeat(60));
console.log(`✅ Vendedores atualizados: ${vendedoresAtualizados}/${todosVendedores.length}`);
console.log(`📝 Total de registros processados: ${totalRegistros}`);
console.log(`📊 Registros com dados: ${totalComDados}`);
console.log(`🔍 Registros sem dados: ${totalRegistros - totalComDados}`);
console.log('='.repeat(60));
console.log('\n✨ Atualização concluída!\n');

process.exit(0);
