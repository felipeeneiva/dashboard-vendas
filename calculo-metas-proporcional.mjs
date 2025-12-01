import { getDb } from './server/db.ts';

const db = await getDb();
if (!db) {
  console.log('Database não disponível');
  process.exit(1);
}

const { metricas, vendedores: vendedoresTable } = await import('./drizzle/schema.ts');
const { inArray, notInArray } = await import('drizzle-orm');

console.log('\n=== CÁLCULO PROPORCIONAL DE METAS ===\n');

// Metas individuais do trimestre Set-Out-Nov/2025 (da planilha)
const metasAtuais = {
  'Gabriel': 650000,
  'Francine': 1000000,
  'Mauro': 1000000,
  'Rafael': 1000000,
  'Luana': 1000000,
  'Náthaly': 800000,
  'Danilo': 800000,
  'Pedro': 600000,
  'Leonardo': 720000,
  'Yasmin': 600000,
  'Laura': 0, // Não tem meta
  'Lucas': 400000,
  'Isabelle': 600000,
  'Andrios': 0, // Admin - não vende
  'Felipe': 0  // Admin - não vende
};

const metaTotalAtual = 9170000; // Soma das metas (excluindo Felipe, Andrios, Laura)
const metaGeralAgencia = 10000000;

// Buscar vendedores ativos (excluindo Felipe e Andrios)
const todosVendedores = await db.select().from(vendedoresTable);
const vendedoresAtivos = todosVendedores.filter(v => 
  v.nome !== 'Felipe' && v.nome !== 'Andrios' && v.nome !== 'Laura'
);

console.log(`👥 VENDEDORES ATIVOS (excluindo Felipe, Andrios, Laura): ${vendedoresAtivos.length}`);
console.log(`📊 META TOTAL TRIMESTRE ATUAL: R$ ${metaTotalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

// Histórico (Dez/24, Jan/25, Fev/25)
const mesesHistorico = ['Dezembro/2024', 'Janeiro/2025', 'Fevereiro/2025'];
const dadosHistorico = await db.select().from(metricas).where(inArray(metricas.mes, mesesHistorico));

console.log('📈 HISTÓRICO (ano anterior):');
const vendedoresPorMes = {};
for (const mes of mesesHistorico) {
  const metricasMes = dadosHistorico.filter(m => m.mes === mes && m.status === 'com_dados');
  const totalVendas = metricasMes.reduce((sum, m) => sum + m.totalVendas, 0) / 100;
  
  // Buscar nomes dos vendedores
  const vendedoresIds = metricasMes.map(m => m.vendedorId);
  const vendedoresMes = todosVendedores.filter(v => vendedoresIds.includes(v.id) && v.nome !== 'Felipe' && v.nome !== 'Andrios');
  
  vendedoresPorMes[mes] = {
    total: totalVendas,
    quantidade: vendedoresMes.length,
    mediaPorVendedor: totalVendas / vendedoresMes.length
  };
  
  console.log(`  ${mes}:`);
  console.log(`    Total: R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  console.log(`    Vendedores: ${vendedoresMes.length}`);
  console.log(`    Média/vendedor: R$ ${vendedoresPorMes[mes].mediaPorVendedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
}

// Trimestre atual (Set-Out-Nov/2025)
const mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
const dadosTrimestre = await db.select().from(metricas).where(inArray(metricas.mes, mesesTrimestre));

console.log('\n🎯 TRIMESTRE ATUAL (Set-Out-Nov/2025):');
let totalTrimestreVendido = 0;
let vendedoresTrimestreSet = new Set();
for (const mes of mesesTrimestre) {
  const metricasMes = dadosTrimestre.filter(m => m.mes === mes && m.status === 'com_dados');
  const totalVendas = metricasMes.reduce((sum, m) => sum + m.totalVendas, 0) / 100;
  totalTrimestreVendido += totalVendas;
  
  const vendedoresIds = metricasMes.map(m => m.vendedorId);
  const vendedoresMes = todosVendedores.filter(v => vendedoresIds.includes(v.id) && v.nome !== 'Felipe' && v.nome !== 'Andrios');
  vendedoresMes.forEach(v => vendedoresTrimestreSet.add(v.id));
}

const vendedoresAtivosTrimestre = vendedoresAtivos.filter(v => vendedoresTrimestreSet.has(v.id));
const mediaPorVendedorTrimestre = totalTrimestreVendido / vendedoresAtivosTrimestre.length;

console.log(`  Total vendido: R$ ${totalTrimestreVendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Vendedores ativos: ${vendedoresAtivosTrimestre.length}`);
console.log(`  Média/vendedor: R$ ${mediaPorVendedorTrimestre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Meta total: R$ ${metaTotalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  % Atingido: ${((totalTrimestreVendido / metaTotalAtual) * 100).toFixed(2)}%\n`);

// CÁLCULO DE METAS PARA DEZ/2025, JAN/2026, FEV/2026

console.log('💡 PROPOSTA DE METAS (Dez/2025, Jan/2026, Fev/2026):\n');

// Método: Manter mesma meta total (R$ 10M) mas ajustar para quantidade atual de vendedores
const vendedoresAtuaisAtivos = vendedoresAtivos.length; // 12 vendedores
const metaTotalNovoTrimestre = 10000000; // Manter R$ 10M

console.log('📊 MÉTODO PROPORCIONAL:');
console.log(`  Vendedores ativos agora: ${vendedoresAtuaisAtivos}`);
console.log(`  Meta total trimestre: R$ ${metaTotalNovoTrimestre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

// Distribuir proporcionalmente baseado nas metas atuais
console.log('🎯 METAS INDIVIDUAIS POR VENDEDOR (mantendo proporção atual):\n');

const metasNovoTrimestre = {};
let somaVerificacao = 0;

for (const vendedor of vendedoresAtivos) {
  const metaAtual = metasAtuais[vendedor.nome] || 0;
  
  if (metaAtual > 0) {
    // Calcula proporção do vendedor em relação ao total
    const proporcao = metaAtual / metaTotalAtual;
    const metaNova = metaTotalNovoTrimestre * proporcao;
    
    metasNovoTrimestre[vendedor.nome] = {
      metaTrimestre: metaNova,
      metaMensal: metaNova / 3,
      metaAtualComparacao: metaAtual
    };
    
    somaVerificacao += metaNova;
    
    console.log(`  ${vendedor.nome}:`);
    console.log(`    Meta trimestre: R$ ${metaNova.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`    Meta mensal: R$ ${(metaNova / 3).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`    (Meta atual: R$ ${metaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
  }
}

console.log(`\n✅ SOMA DAS METAS: R$ ${somaVerificacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`   (Diferença para R$ 10M: R$ ${(metaTotalNovoTrimestre - somaVerificacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})\n`);

// Resumo por mês
console.log('📅 RESUMO POR MÊS (distribuição uniforme):\n');
const metaPorMes = metaTotalNovoTrimestre / 3;
console.log(`  Dezembro/2025: R$ ${metaPorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Janeiro/2026: R$ ${metaPorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  Fevereiro/2026: R$ ${metaPorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
console.log(`  TOTAL: R$ ${metaTotalNovoTrimestre.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`);

console.log('📈 COMPARAÇÃO COM HISTÓRICO:\n');
console.log(`  Dez/2024: R$ ${vendedoresPorMes['Dezembro/2024'].total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${vendedoresPorMes['Dezembro/2024'].quantidade} vendedores)`);
console.log(`  Meta Dez/2025: R$ ${metaPorMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${vendedoresAtuaisAtivos} vendedores)`);
console.log(`  Crescimento necessário: ${(((metaPorMes / vendedoresPorMes['Dezembro/2024'].total) - 1) * 100).toFixed(1)}%\n`);

console.log('✅ RECOMENDAÇÃO: Manter R$ 10M total com distribuição proporcional às metas atuais.');
console.log('   Isso mantém a equidade entre vendedores e considera suas capacidades individuais.\n');
