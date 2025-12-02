import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('Endpoints Dashboard Admin', () => {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  it('deve buscar metas trimestrais de todos os vendedores', async () => {
    const resultado = await caller.vendedores.metasTrimestraisAdmin();
    
    expect(resultado).toBeDefined();
    expect(Array.isArray(resultado)).toBe(true);
    
    if (resultado.length > 0) {
      const primeiroTrimestre = resultado[0];
      expect(primeiroTrimestre).toHaveProperty('trimestre');
      expect(primeiroTrimestre).toHaveProperty('metaAgencia');
      expect(primeiroTrimestre).toHaveProperty('vendedores');
      
      // Verifica que Meta Trimestral 1 vem primeiro
      expect(primeiroTrimestre.trimestre).toBe('Meta Trimestral 1');
    }
  });

  it('deve calcular percentual de receita consolidado', async () => {
    const resultado = await caller.vendedores.percentualReceitaConsolidado();
    
    expect(resultado).toBeDefined();
    expect(resultado).toHaveProperty('ano');
    expect(resultado).toHaveProperty('mes');
    
    // Verifica estrutura do ano
    expect(resultado.ano).toHaveProperty('percentual');
    expect(resultado.ano).toHaveProperty('totalVendas');
    expect(resultado.ano).toHaveProperty('totalReceita');
    
    // Percentuais devem estar entre 0 e 100
    expect(resultado.ano.percentual).toBeGreaterThanOrEqual(0);
    expect(resultado.ano.percentual).toBeLessThanOrEqual(100);
  });

  it('deve retornar ranking de vendedores por percentual de receita', async () => {
    const resultado = await caller.vendedores.rankingPercentualReceita();
    
    expect(resultado).toBeDefined();
    expect(Array.isArray(resultado)).toBe(true);
    
    if (resultado.length > 0) {
      const primeiroVendedor = resultado[0];
      expect(primeiroVendedor).toHaveProperty('vendedorId');
      expect(primeiroVendedor).toHaveProperty('percentual');
      expect(primeiroVendedor).toHaveProperty('totalVendas');
      expect(primeiroVendedor).toHaveProperty('totalReceita');
      
      // Ranking deve estar ordenado por percentual (maior primeiro)
      if (resultado.length > 1) {
        expect(resultado[0].percentual).toBeGreaterThanOrEqual(resultado[1].percentual);
      }
    }
  });

  it('deve retornar comparativo mês atual vs mês anterior', async () => {
    const resultado = await caller.vendedores.comparativoMesAtualAnterior();
    
    expect(resultado).toBeDefined();
    expect(resultado).toHaveProperty('mesAtual');
    expect(resultado).toHaveProperty('mesAnterior');
    expect(resultado).toHaveProperty('variacoes');
    
    // Verifica estrutura do mês atual
    expect(resultado.mesAtual.mes).toBe('Dezembro/2025');
    expect(typeof resultado.mesAtual.vendas).toBe('number');
    expect(typeof resultado.mesAtual.receita).toBe('number');
    expect(typeof resultado.mesAtual.percentual).toBe('number');
    
    // Verifica estrutura do mês anterior
    expect(resultado.mesAnterior.mes).toBe('Novembro/2025');
    expect(typeof resultado.mesAnterior.vendas).toBe('number');
    expect(typeof resultado.mesAnterior.receita).toBe('number');
    expect(typeof resultado.mesAnterior.percentual).toBe('number');
    
    // Verifica estrutura das variações
    expect(typeof resultado.variacoes.vendas).toBe('number');
    expect(typeof resultado.variacoes.receita).toBe('number');
    expect(typeof resultado.variacoes.percentual).toBe('number');
  });

  it('deve retornar evolução mensal do percentual de receita', async () => {
    const resultado = await caller.vendedores.evolucaoPercentualReceita({ ano: 2025 });
    
    expect(resultado).toBeDefined();
    expect(Array.isArray(resultado)).toBe(true);
    
    if (resultado.length > 0) {
      const primeiroMes = resultado[0];
      expect(primeiroMes).toHaveProperty('mes');
      expect(primeiroMes).toHaveProperty('mesCompleto');
      expect(primeiroMes).toHaveProperty('totalVendas');
      expect(primeiroMes).toHaveProperty('totalReceita');
      expect(primeiroMes).toHaveProperty('percentual');
      
      // Percentual deve estar entre 0 e 100
      expect(primeiroMes.percentual).toBeGreaterThanOrEqual(0);
      expect(primeiroMes.percentual).toBeLessThanOrEqual(100);
      
      // Deve retornar apenas meses com dados
      expect(primeiroMes.totalVendas).toBeGreaterThan(0);
      expect(primeiroMes.totalReceita).toBeGreaterThan(0);
      
      // Verifica formato do mes
      expect(primeiroMes.mesCompleto).toContain('/2025');
    }
  });

  it('deve retornar comparativo 2024 vs 2025 consolidado', async () => {
    const resultado = await caller.vendedores.comparativo2024vs2025();
    
    expect(resultado).toBeDefined();
    expect(Array.isArray(resultado)).toBe(true);
    
    if (resultado.length > 0) {
      const primeiroMes = resultado[0];
      expect(primeiroMes).toHaveProperty('mes');
      expect(primeiroMes).toHaveProperty('vendas2024');
      expect(primeiroMes).toHaveProperty('vendas2025');
      expect(primeiroMes).toHaveProperty('receita2024');
      expect(primeiroMes).toHaveProperty('receita2025');
      expect(primeiroMes).toHaveProperty('variacaoVendas');
      expect(primeiroMes).toHaveProperty('variacaoReceita');
      
      // Valores devem ser números
      expect(typeof primeiroMes.vendas2024).toBe('number');
      expect(typeof primeiroMes.vendas2025).toBe('number');
      expect(typeof primeiroMes.receita2024).toBe('number');
      expect(typeof primeiroMes.receita2025).toBe('number');
    }
  });

  it('deve retornar top 10 destinos consolidado', async () => {
    const resultado = await caller.vendedores.topDestinosConsolidado({ limit: 10 });
    
    expect(resultado).toBeDefined();
    expect(Array.isArray(resultado)).toBe(true);
    
    if (resultado.length > 0) {
      const primeiroDestino = resultado[0];
      expect(primeiroDestino).toHaveProperty('destino');
      expect(primeiroDestino).toHaveProperty('valorTotal');
      expect(primeiroDestino).toHaveProperty('quantidade');
      
      // Valores devem ser números positivos
      expect(primeiroDestino.valorTotal).toBeGreaterThan(0);
      expect(primeiroDestino.quantidade).toBeGreaterThan(0);
      
      // Verifica que está ordenado por valor (maior primeiro)
      if (resultado.length > 1) {
        expect(resultado[0].valorTotal).toBeGreaterThanOrEqual(resultado[1].valorTotal);
      }
    }
  });
});
