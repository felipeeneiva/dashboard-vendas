import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import { vendedores, metricas, fornecedores, vendasDiarias } from '../drizzle/schema.ts';

// Conecta ao banco
const db = drizzle(process.env.DATABASE_URL);

async function runValidation() {
  console.log('🔍 Iniciando validação da sincronização...\n');

  try {
    // 1. Contagem total de registros
    const countVendedores = await db.select({ count: sql`count(*)` }).from(vendedores);
    const countMetricas = await db.select({ count: sql`count(*)` }).from(metricas);
    const countFornecedores = await db.select({ count: sql`count(*)` }).from(fornecedores);
    const countVendasDiarias = await db.select({ count: sql`count(*)` }).from(vendasDiarias);

    console.log('📊 Estatísticas do Banco de Dados:');
    console.log(`- Vendedores: ${countVendedores[0].count}`);
    console.log(`- Métricas: ${countMetricas[0].count}`);
    console.log(`- Fornecedores: ${countFornecedores[0].count}`);
    console.log(`- Vendas Diárias: ${countVendasDiarias[0].count}\n`);

    // 2. Verificar métricas recentes (últimas 24h)
    const metricasRecentes = await db.select({ count: sql`count(*)` })
      .from(metricas)
      .where(sql`dataExtracao > NOW() - INTERVAL 1 DAY`);

    console.log(`🕒 Registros atualizados nas últimas 24h: ${metricasRecentes[0].count}`);

    // 3. Verificar integridade (vendedores sem métricas)
    const vendedoresSemDados = await db.execute(sql`
      SELECT v.nome 
      FROM vendedores v 
      LEFT JOIN metricas m ON v.id = m.vendedorId 
      WHERE m.id IS NULL
    `);

    if (vendedoresSemDados[0].length > 0) {
      console.log('⚠️ Vendedores sem nenhuma métrica:');
      vendedoresSemDados[0].forEach(v => console.log(`- ${v.nome}`));
    } else {
      console.log('✅ Todos os vendedores possuem métricas vinculadas.');
    }

    console.log('\n✨ Validação concluída com sucesso!');
    
    // Retornar resumo para o Manus usar no checkpoint
    return {
      vendedores: countVendedores[0].count,
      metricas: countMetricas[0].count,
      recentes: metricasRecentes[0].count,
      vendasDiarias: countVendasDiarias[0].count
    };

  } catch (error) {
    console.error('❌ Erro durante a validação:', error.message);
    process.exit(1);
  }
}

runValidation().then(() => process.exit(0));
