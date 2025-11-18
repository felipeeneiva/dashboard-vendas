import { describe, it, expect } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/trpc';

describe('Progresso Semanal', () => {
  it('deve retornar dados de progresso semanal da meta trimestral', async () => {
    // Mock do contexto
    const mockContext: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: undefined
    };

    const caller = appRouter.createCaller(mockContext);
    const resultado = await caller.metas.progressoSemanal();

    // Verifica estrutura básica
    expect(resultado).toBeDefined();
    expect(resultado.semanas).toBeDefined();
    expect(Array.isArray(resultado.semanas)).toBe(true);
    expect(resultado.semanas.length).toBeGreaterThan(0);
    
    // Verifica meta geral
    expect(resultado.metaGeral).toBe(1000000000); // R$ 10 milhões em centavos
    
    // Verifica campos de projeção
    expect(resultado.totalAcumulado).toBeDefined();
    expect(resultado.percentualAtingido).toBeDefined();
    expect(resultado.projecaoFinal).toBeDefined();
    expect(typeof resultado.vaiAtingirMeta).toBe('boolean');
    expect(resultado.semanaAtual).toBeDefined();
    
    // Verifica estrutura de cada semana
    const primeiraSemana = resultado.semanas[0];
    expect(primeiraSemana.numero).toBe(1);
    expect(primeiraSemana.inicio).toBeDefined();
    expect(primeiraSemana.fim).toBeDefined();
    expect(primeiraSemana.vendas).toBeDefined();
    expect(primeiraSemana.acumulado).toBeDefined();
    expect(primeiraSemana.percentualMeta).toBeDefined();
    
    // Verifica que o acumulado é crescente
    for (let i = 1; i < resultado.semanas.length; i++) {
      expect(resultado.semanas[i].acumulado).toBeGreaterThanOrEqual(
        resultado.semanas[i - 1].acumulado
      );
    }
    
    // Verifica que as semanas estão em ordem
    for (let i = 0; i < resultado.semanas.length; i++) {
      expect(resultado.semanas[i].numero).toBe(i + 1);
    }
    
    console.log('✅ Teste de progresso semanal passou!');
    console.log(`   - ${resultado.semanas.length} semanas no trimestre`);
    console.log(`   - Semana atual: ${resultado.semanaAtual}`);
    console.log(`   - Total acumulado: R$ ${(resultado.totalAcumulado / 100).toFixed(2)}`);
    console.log(`   - Percentual atingido: ${resultado.percentualAtingido.toFixed(2)}%`);
    console.log(`   - Projeção final: R$ ${(resultado.projecaoFinal / 100).toFixed(2)}`);
    console.log(`   - Vai atingir meta: ${resultado.vaiAtingirMeta ? 'Sim ✅' : 'Não ❌'}`);
  });
  
  it('deve ter 13 semanas no trimestre Set-Out-Nov/2025', async () => {
    const mockContext: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: undefined
    };

    const caller = appRouter.createCaller(mockContext);
    const resultado = await caller.metas.progressoSemanal();
    
    // Setembro tem 4 semanas, Outubro tem 5, Novembro tem 4 = 13 semanas
    expect(resultado.semanas.length).toBe(13);
  });
  
  it('deve ter datas corretas para o trimestre', async () => {
    const mockContext: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: undefined
    };

    const caller = appRouter.createCaller(mockContext);
    const resultado = await caller.metas.progressoSemanal();
    
    // Primeira semana deve começar em 01/09/2025
    expect(resultado.semanas[0].inicio).toBe('2025-09-01');
    
    // Última semana deve terminar em 30/11/2025
    const ultimaSemana = resultado.semanas[resultado.semanas.length - 1];
    expect(ultimaSemana.fim).toBe('2025-11-30');
  });
});
