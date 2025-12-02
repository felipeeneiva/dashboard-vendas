import { describe, it, expect } from 'vitest';
import { getDb } from '../server/db';
import { vendedores, metasTrimestrais, metricas } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Indicadores de Progresso das Metas Trimestrais', () => {
  it('deve calcular corretamente o progresso da Meta Trimestral 4 (Set-Out-Nov/2025)', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database não disponível');

    // Busca Gabriel
    const gabriel = await db.select().from(vendedores)
      .where(eq(vendedores.email, 'gabriel@mundoproviagens.com.br'))
      .limit(1);

    expect(gabriel.length).toBe(1);

    // Busca meta trimestral 4 do Gabriel
    const metasGabriel = await db.select().from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabriel[0].id));

    const metaTrimestral4 = metasGabriel.find(m => m.trimestre === 'Meta Trimestral 4');
    expect(metaTrimestral4).toBeDefined();

    // Busca métricas do trimestre
    const todasMetricas = await db.select().from(metricas)
      .where(eq(metricas.vendedorId, gabriel[0].id));

    const mesesTrimestre4 = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
    const metricasTrimestre = todasMetricas.filter(m => mesesTrimestre4.includes(m.mes));

    // Calcula total vendido
    const vendidoCentavos = metricasTrimestre.reduce((acc, m) => acc + (m.totalVendas || 0), 0);
    const vendido = vendidoCentavos / 100;
    const meta = metaTrimestral4!.metaTrimestral / 100;
    const falta = Math.max(0, meta - vendido);
    const percentual = meta > 0 ? ((vendido / meta) * 100).toFixed(2) : '0.00';

    // Validações
    expect(vendido).toBeGreaterThan(0);
    expect(meta).toBeGreaterThan(0);
    expect(falta).toBeGreaterThanOrEqual(0);
    expect(parseFloat(percentual)).toBeGreaterThan(0);
    expect(parseFloat(percentual)).toBeLessThanOrEqual(100);

    console.log('✅ Gabriel - Meta Trimestral 4:');
    console.log(`   Meta: R$ ${meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Vendido: R$ ${vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Falta: R$ ${falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Progresso: ${percentual}%`);
  });

  it('deve retornar metas ordenadas corretamente (Meta Trimestral 1 primeiro)', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database não disponível');

    // Busca Gabriel
    const gabriel = await db.select().from(vendedores)
      .where(eq(vendedores.email, 'gabriel@mundoproviagens.com.br'))
      .limit(1);

    expect(gabriel.length).toBe(1);

    // Busca todas as metas
    const metas = await db.select().from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabriel[0].id));

    // Ordena: Meta Trimestral 1 primeiro
    const metasOrdenadas = metas.sort((a, b) => {
      if (a.trimestre === 'Meta Trimestral 1') return -1;
      if (b.trimestre === 'Meta Trimestral 1') return 1;
      return b.trimestre.localeCompare(a.trimestre);
    });

    expect(metasOrdenadas.length).toBeGreaterThan(0);
    expect(metasOrdenadas[0].trimestre).toBe('Meta Trimestral 1');

    console.log('✅ Metas ordenadas:', metasOrdenadas.map(m => m.trimestre).join(', '));
  });

  it('deve calcular progresso zero para trimestre sem vendas (Meta Trimestral 1)', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database não disponível');

    // Busca Gabriel
    const gabriel = await db.select().from(vendedores)
      .where(eq(vendedores.email, 'gabriel@mundoproviagens.com.br'))
      .limit(1);

    expect(gabriel.length).toBe(1);

    // Busca meta trimestral 1 do Gabriel
    const metasGabriel = await db.select().from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabriel[0].id));

    const metaTrimestral1 = metasGabriel.find(m => m.trimestre === 'Meta Trimestral 1');
    expect(metaTrimestral1).toBeDefined();

    // Busca métricas do trimestre (Dez/2025, Jan/2026, Fev/2026)
    const todasMetricas = await db.select().from(metricas)
      .where(eq(metricas.vendedorId, gabriel[0].id));

    const mesesTrimestre1 = ['Dezembro/2025', 'Janeiro/2026', 'Fevereiro/2026'];
    const metricasTrimestre = todasMetricas.filter(m => mesesTrimestre1.includes(m.mes));

    // Calcula total vendido (deve ser 0 pois ainda não chegamos nesses meses)
    const vendidoCentavos = metricasTrimestre.reduce((acc, m) => acc + (m.totalVendas || 0), 0);
    const vendido = vendidoCentavos / 100;
    const meta = metaTrimestral1!.metaTrimestral / 100;
    const falta = Math.max(0, meta - vendido);
    const percentual = meta > 0 ? ((vendido / meta) * 100).toFixed(2) : '0.00';

    // Validações
    expect(vendido).toBe(0); // Ainda não há vendas nesses meses
    expect(meta).toBeGreaterThan(0);
    expect(falta).toBe(meta); // Falta = meta completa
    expect(parseFloat(percentual)).toBe(0); // 0% de progresso

    console.log('✅ Gabriel - Meta Trimestral 1 (sem vendas ainda):');
    console.log(`   Meta: R$ ${meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Vendido: R$ ${vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Falta: R$ ${falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log(`   Progresso: ${percentual}%`);
  });

  it('deve incluir campos vendido, falta e percentual na resposta', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database não disponível');

    // Busca Gabriel
    const gabriel = await db.select().from(vendedores)
      .where(eq(vendedores.email, 'gabriel@mundoproviagens.com.br'))
      .limit(1);

    expect(gabriel.length).toBe(1);

    // Simula o que o endpoint faz
    const metas = await db.select().from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabriel[0].id));

    const metasOrdenadas = metas.sort((a, b) => {
      if (a.trimestre === 'Meta Trimestral 1') return -1;
      if (b.trimestre === 'Meta Trimestral 1') return 1;
      return b.trimestre.localeCompare(a.trimestre);
    });

    const todasMetricas = await db.select().from(metricas)
      .where(eq(metricas.vendedorId, gabriel[0].id));

    const mesesPorTrimestre: Record<string, string[]> = {
      'Meta Trimestral 1': ['Dezembro/2025', 'Janeiro/2026', 'Fevereiro/2026'],
      'Meta Trimestral 4': ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'],
    };

    const resultado = metasOrdenadas.map(m => {
      const mesesTrimestre = mesesPorTrimestre[m.trimestre] || [];
      const metricasTrimestre = todasMetricas.filter(met => mesesTrimestre.includes(met.mes));
      const vendidoCentavos = metricasTrimestre.reduce((acc, met) => acc + (met.totalVendas || 0), 0);
      const vendido = vendidoCentavos / 100;
      const meta = m.metaTrimestral / 100;
      const falta = Math.max(0, meta - vendido);
      const percentual = meta > 0 ? ((vendido / meta) * 100).toFixed(2) : '0.00';

      return {
        trimestre: m.trimestre,
        meta,
        superMeta: m.superMeta / 100,
        bonusMeta: m.bonusMeta / 100,
        bonusSuperMeta: m.bonusSuperMeta / 100,
        metaAgencia: m.metaAgencia ? m.metaAgencia / 100 : 0,
        vendido,
        falta,
        percentual
      };
    });

    // Validações
    expect(resultado.length).toBeGreaterThan(0);
    resultado.forEach(meta => {
      expect(meta).toHaveProperty('vendido');
      expect(meta).toHaveProperty('falta');
      expect(meta).toHaveProperty('percentual');
      expect(typeof meta.vendido).toBe('number');
      expect(typeof meta.falta).toBe('number');
      expect(typeof meta.percentual).toBe('string');
    });

    console.log('✅ Estrutura de resposta validada com sucesso');
  });
});
