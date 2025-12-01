import { getDb } from './server/db.ts';

const db = await getDb();
if (!db) {
  console.log('Database não disponível');
  process.exit(1);
}

const { metricas } = await import('./drizzle/schema.ts');
const { inArray } = await import('drizzle-orm');

// Busca métricas dos 3 meses
const mesesAlvo = ['Dezembro/2024', 'Janeiro/2025', 'Fevereiro/2025'];
const dados = await db.select().from(metricas).where(inArray(metricas.mes, mesesAlvo));

// Agrupa por mês
const porMes = {};
for (const mes of mesesAlvo) {
  const metricasMes = dados.filter(m => m.mes === mes && m.status === 'com_dados');
  const totalVendas = metricasMes.reduce((sum, m) => sum + m.totalVendas, 0);
  const vendedoresAtivos = metricasMes.length;
  
  porMes[mes] = {
    totalVendas: totalVendas / 100, // Converte centavos para reais
    vendedoresAtivos
  };
}

console.log('\n=== VENDAS POR MÊS ===\n');
for (const mes of mesesAlvo) {
  const dados = porMes[mes];
  console.log(`${mes}:`);
  console.log(`  Total de Vendas: R$ ${dados.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  console.log(`  Vendedores Ativos: ${dados.vendedoresAtivos}`);
  console.log('');
}

// Calcula total geral
const totalGeral = Object.values(porMes).reduce((sum, m) => sum + m.totalVendas, 0);
console.log(`TOTAL GERAL (3 meses): R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
