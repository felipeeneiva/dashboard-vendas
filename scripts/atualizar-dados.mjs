/**
 * Script para atualizar dados de todos os vendedores
 * Executa diretamente no servidor sem precisar de autenticação
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { eq, and } from 'drizzle-orm';
import { vendedores, metricas, fornecedores, vendasDiarias } from '../drizzle/schema.ts';
import { extrairDadosVendedor, extrairDadosFornecedores, extrairVendasDiarias, gerarListaMeses } from '../server/sheetsExtractor.ts';

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
let totalFornecedores = 0;
let totalVendasDiarias = 0;

for (const vendedor of todosVendedores) {
  try {
    console.log(`\n👤 Processando: ${vendedor.nome}`);
    console.log(`   ID da planilha: ${vendedor.sheetId}`);
    
    const resultados = await extrairDadosVendedor(vendedor.sheetId, meses);
    
    let mesesComDados = 0;
    let fornecedoresDoVendedor = 0;
    let vendasDiariasDoVendedor = 0;
    
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
        
        // Extrai dados de fornecedores deste mês
        try {
          const dadosFornecedores = await extrairDadosFornecedores(vendedor.sheetId, resultado.mes);
          
          if (dadosFornecedores.length > 0) {
            // Remove dados antigos deste vendedor/mês
            await db.delete(fornecedores)
              .where(and(
                eq(fornecedores.vendedorId, vendedor.id),
                eq(fornecedores.mes, resultado.mes)
              ));
            
            // Insere novos dados
            for (const f of dadosFornecedores) {
              await db.insert(fornecedores).values({
                vendedorId: vendedor.id,
                mes: resultado.mes,
                operadora: f.operadora,
                operadoraNormalizada: f.operadoraNormalizada,
                tarifa: f.tarifa,
                taxa: f.taxa,
                duTebOver: f.duTebOver,
                incentivo: f.incentivo,
                valorTotal: f.valorTotal,
                dataExtracao: new Date()
              });
              fornecedoresDoVendedor++;
              totalFornecedores++;
            }
          }
        } catch (errorFornecedor) {
          console.warn(`   ⚠️  Erro ao extrair fornecedores de ${resultado.mes}:`, errorFornecedor.message);
        }
        
        // Extrai vendas diárias deste mês
        try {
          const vendasDiariasMes = await extrairVendasDiarias(vendedor.sheetId, resultado.mes);
          
          if (vendasDiariasMes.length > 0) {
            // Remove dados antigos deste vendedor/mês
            await db.delete(vendasDiarias)
              .where(and(
                eq(vendasDiarias.vendedorId, vendedor.id),
                eq(vendasDiarias.mes, resultado.mes)
              ));
            
            // Insere novas vendas
            for (const venda of vendasDiariasMes) {
              await db.insert(vendasDiarias).values({
                vendedorId: vendedor.id,
                dataVenda: venda.dataVenda,
                nomePassageiros: venda.nomePassageiros,
                valorTotal: venda.valorTotal,
                destino: venda.destino,
                mes: resultado.mes,
                ano: venda.dataVenda.getFullYear(),
                dataExtracao: new Date()
              });
              vendasDiariasDoVendedor++;
              totalVendasDiarias++;
            }
          }
        } catch (errorVendas) {
          console.warn(`   ⚠️  Erro ao extrair vendas diárias de ${resultado.mes}:`, errorVendas.message);
        }
      }
      totalRegistros++;
    }
    
    console.log(`   ✅ ${mesesComDados} meses com dados de ${meses.length} meses processados`);
    if (fornecedoresDoVendedor > 0) {
      console.log(`   📦 ${fornecedoresDoVendedor} registros de fornecedores salvos`);
    }
    if (vendasDiariasDoVendedor > 0) {
      console.log(`   💰 ${vendasDiariasDoVendedor} vendas diárias salvas`);
    }
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
console.log(`📦 Total de fornecedores salvos: ${totalFornecedores}`);
console.log(`💰 Total de vendas diárias salvas: ${totalVendasDiarias}`);
console.log('='.repeat(60));
console.log('\n✨ Atualização concluída!\n');

process.exit(0);
