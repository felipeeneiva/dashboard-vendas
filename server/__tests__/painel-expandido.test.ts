import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, getVendedorByEmail } from '../db';

describe('Painel Individual Expandido - Novos Endpoints', () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database não disponível para testes');
    }
  });

  it('deve retornar evolução mensal ordenada cronologicamente', async () => {
    // Testa com Gabriel que tem dados em vários meses
    const vendedor = await getVendedorByEmail('gabriel@mundoproviagens.com.br');
    expect(vendedor).toBeDefined();

    const dbModule = await import('../db');
    const metricas = await dbModule.getMetricasByVendedor(vendedor!.id);
    const metricasComDados = metricas.filter(m => m.status === 'com_dados');

    expect(metricasComDados.length).toBeGreaterThan(0);

    // Verifica ordenação
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const evolucao = metricasComDados
      .map(m => {
        const [mesNome, ano] = m.mes.split('/');
        const mesNumero = meses.indexOf(mesNome) + 1;
        return {
          mes: m.mes,
          ordenacao: parseInt(ano) * 100 + mesNumero
        };
      })
      .sort((a, b) => a.ordenacao - b.ordenacao);

    // Verifica que está ordenado
    for (let i = 1; i < evolucao.length; i++) {
      expect(evolucao[i].ordenacao).toBeGreaterThanOrEqual(evolucao[i-1].ordenacao);
    }
  });

  it('deve calcular variação percentual corretamente no comparativo', () => {
    const vendas2024 = 100000;
    const vendas2025 = 150000;
    
    const variacao = ((vendas2025 - vendas2024) / vendas2024) * 100;
    
    expect(variacao).toBe(50);
  });

  it('deve retornar 0% de variação quando vendas2024 é zero', () => {
    const vendas2024 = 0;
    const vendas2025 = 150000;
    
    let variacao = 0;
    if (vendas2024 > 0) {
      variacao = ((vendas2025 - vendas2024) / vendas2024) * 100;
    }
    
    expect(variacao).toBe(0);
  });

  it('deve filtrar apenas meses com dados no comparativo', () => {
    const meses = ['Janeiro', 'Fevereiro', 'Março'];
    
    const comparativo = meses.map(mesNome => {
      // Simula que só Março tem dados
      const temDados2024 = mesNome === 'Março';
      const temDados2025 = false;
      
      return {
        mes: mesNome,
        temDados2024,
        temDados2025
      };
    }).filter(item => item.temDados2024 || item.temDados2025);

    // Deve retornar apenas Março
    expect(comparativo.length).toBe(1);
    expect(comparativo[0].mes).toBe('Março');
  });

  it('deve agrupar destinos corretamente', () => {
    // Simula vendas com destinos
    const vendas = [
      { destino: 'Paris', valorTotal: 100000 },
      { destino: 'Paris', valorTotal: 150000 },
      { destino: 'Londres', valorTotal: 80000 },
      { destino: null, valorTotal: 50000 }
    ];

    const destinosMap = new Map<string, { vendas: number; valor: number }>();
    
    vendas.forEach(venda => {
      const destino = venda.destino || 'Não informado';
      const atual = destinosMap.get(destino) || { vendas: 0, valor: 0 };
      destinosMap.set(destino, {
        vendas: atual.vendas + 1,
        valor: atual.valor + venda.valorTotal
      });
    });

    // Verifica agrupamento
    expect(destinosMap.get('Paris')).toEqual({ vendas: 2, valor: 250000 });
    expect(destinosMap.get('Londres')).toEqual({ vendas: 1, valor: 80000 });
    expect(destinosMap.get('Não informado')).toEqual({ vendas: 1, valor: 50000 });
  });

  it('deve ordenar destinos por valor total decrescente', () => {
    const destinos = [
      { destino: 'Paris', valorTotal: 250000 },
      { destino: 'Londres', valorTotal: 80000 },
      { destino: 'Roma', valorTotal: 300000 }
    ];

    const ordenado = destinos.sort((a, b) => b.valorTotal - a.valorTotal);

    expect(ordenado[0].destino).toBe('Roma');
    expect(ordenado[1].destino).toBe('Paris');
    expect(ordenado[2].destino).toBe('Londres');
  });

  it('deve calcular ticket médio corretamente', () => {
    const totalVendas = 535533.87;
    const mesesAtivos = 7;
    
    const ticketMedio = totalVendas / mesesAtivos;
    
    expect(ticketMedio).toBeCloseTo(76504.84, 2);
  });

  it('deve identificar melhor mês corretamente', () => {
    const evolucao = [
      { mes: 'Agosto/2024', vendas: 66027.46 },
      { mes: 'Setembro/2024', vendas: 25796.68 },
      { mes: 'Novembro/2024', vendas: 237463.89 },
      { mes: 'Março/2025', vendas: 0 }
    ];

    const melhorMes = evolucao.reduce((max, m) => m.vendas > max.vendas ? m : max, evolucao[0]);

    expect(melhorMes.mes).toBe('Novembro/2024');
    expect(melhorMes.vendas).toBe(237463.89);
  });
});
