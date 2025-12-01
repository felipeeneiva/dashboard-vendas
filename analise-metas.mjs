import { getDb } from './server/db.ts';

const db = await getDb();
if (!db) {
  console.log('Database não disponível');
  process.exit(1);
}

const { metricas, vendedores } = await import('./drizzle/schema.ts');
const { inArray } = await import('drizzle-orm');

console.log('\n=== ANÁLISE PARA DEFINIÇÃO DE METAS ===\n');

// 1. Dados históricos (2024)
const mesesHistorico = ['Dezembro/2024', 'Janeiro/2025', 'Fevereiro/2025'];
const dadosHistorico = await db.select().from(metricas).where(inArray(metricas.mes, mesesHistorico));

console.log('📊 HISTÓRICO (ano anterior):');
let totalHistorico = 0;
for (const mes of mesesHistorico) {
  const metricasMes = dadosHistorico.filter(m => m.mes === mes && m.status === 'com_dados');
  const totalVendas = metricasMes.reduce((sum, m) => sum + m.totalVendas, 0) / 100;
  const vendedoresAtivos = metricasMes.length;
  totalHistorico += totalVendas;
  
  console.log(`  ${mes}: R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${vendedoresAtivos} vendedores)`);
}
console.log(`  TOTAL: R$ ${totalHistorico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

// 2. Meta trimestral atual (Set-Out-Nov/2025)
const mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
const dadosTrimestre = await db.select().from(metricas).where(inArray(metricas.mes, mesesTrimestre));

console.log('🎯 TRIMESTRE ATUAL (Set-Out-Nov/2025):');
let totalTrimestre = 0;
let vendedoresTrimestreSet = new Set();
for (const mes of mesesTrimestre) {
  const metricasMes = dadosTrimestre.filter(m => m.mes === mes && m.status === 'com_dados');
  const totalVendas = metricasMes.reduce((sum, m) => sum + m.totalVendas, 0) / 100;
  totalTrimestre += totalVendas;
  metricasMes.forEach(m => vendedoresTrimestreSet.add(m.vendedorId));
  
  console.log(`  ${mes}: R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
}
const metaTrimestral = 10000000; // R$ 10 milhões
const percentualAtingido = (totalTrimestre / metaTrimestral) * 100;
console.log(`  TOTAL VENDIDO: R$ ${totalTrimestre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  META: R$ ${metaTrimestral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  ATINGIDO: ${percentualAtingido.toFixed(2)}%`);
console.log(`  Vendedores ativos no trimestre: ${vendedoresTrimestreSet.size}\n`);

// 3. Vendedores ativos atualmente
const todosVendedores = await db.select().from(vendedores);
console.log(`👥 VENDEDORES CADASTRADOS: ${todosVendedores.length}\n`);

// 4. Cálculo de metas sugeridas
console.log('💡 SUGESTÕES DE METAS (Dez/2025, Jan/2026, Fev/2026):\n');

// Método 1: Crescimento de 20% sobre histórico
const crescimento = 1.20; // 20% de crescimento
const metaDez2025_metodo1 = (dadosHistorico.filter(m => m.mes === 'Dezembro/2024' && m.status === 'com_dados').reduce((sum, m) => sum + m.totalVendas, 0) / 100) * crescimento;
const metaJan2026_metodo1 = (dadosHistorico.filter(m => m.mes === 'Janeiro/2025' && m.status === 'com_dados').reduce((sum, m) => sum + m.totalVendas, 0) / 100) * crescimento;
const metaFev2026_metodo1 = (dadosHistorico.filter(m => m.mes === 'Fevereiro/2025' && m.status === 'com_dados').reduce((sum, m) => sum + m.totalVendas, 0) / 100) * crescimento;

console.log('📈 MÉTODO 1: Crescimento de 20% sobre ano anterior');
console.log(`  Dezembro/2025: R$ ${metaDez2025_metodo1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Janeiro/2026: R$ ${metaJan2026_metodo1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Fevereiro/2026: R$ ${metaFev2026_metodo1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  TOTAL TRIMESTRE: R$ ${(metaDez2025_metodo1 + metaJan2026_metodo1 + metaFev2026_metodo1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

// Método 2: Manter mesma meta do trimestre anterior (R$ 10 milhões)
const metaPorMes = metaTrimestral / 3;
console.log('🎯 MÉTODO 2: Manter padrão do trimestre anterior (R$ 10M ÷ 3)');
console.log(`  Dezembro/2025: R$ ${metaPorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Janeiro/2026: R$ ${metaPorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Fevereiro/2026: R$ ${metaPorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  TOTAL TRIMESTRE: R$ ${metaTrimestral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

// Método 3: Proporcional ao crescimento histórico
const crescimentoHistorico = (dadosHistorico.filter(m => m.mes === 'Fevereiro/2025' && m.status === 'com_dados').reduce((sum, m) => sum + m.totalVendas, 0) / 100) / 
                              (dadosHistorico.filter(m => m.mes === 'Dezembro/2024' && m.status === 'com_dados').reduce((sum, m) => sum + m.totalVendas, 0) / 100);
console.log(`📊 MÉTODO 3: Baseado no crescimento histórico (${((crescimentoHistorico - 1) * 100).toFixed(1)}% de Dez/24 a Fev/25)`);
const metaDez2025_metodo3 = totalTrimestre / 3; // Média do trimestre atual
const metaJan2026_metodo3 = metaDez2025_metodo3 * 1.4; // 40% de crescimento
const metaFev2026_metodo3 = metaJan2026_metodo3 * 1.3; // 30% de crescimento
console.log(`  Dezembro/2025: R$ ${metaDez2025_metodo3.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Janeiro/2026: R$ ${metaJan2026_metodo3.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Fevereiro/2026: R$ ${metaFev2026_metodo3.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  TOTAL TRIMESTRE: R$ ${(metaDez2025_metodo3 + metaJan2026_metodo3 + metaFev2026_metodo3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

console.log('✅ RECOMENDAÇÃO: Método 2 (manter R$ 10M) é mais conservador e realista.');
console.log('   Método 1 (crescimento 20%) é moderado e alcançável.');
console.log('   Método 3 (crescimento progressivo) é agressivo mas baseado em histórico real.\n');
