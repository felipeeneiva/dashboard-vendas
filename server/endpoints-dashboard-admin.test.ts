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
});
