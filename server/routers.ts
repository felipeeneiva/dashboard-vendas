import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { extrairMetricasAba, extrairDadosVendedor, gerarListaMeses } from "./sheetsExtractor";

// Configuração dos vendedores
const VENDEDORES_CONFIG = [
  { nome: 'Rafael', email: 'vendas5@mundoproviagens.com.br', sheetId: '1ZJz0MgOHLkYYNW5eWZmOAU797KXQPbwGmp8YnWl4NPo', dataEntrada: new Date('2023-01-01') },
  { nome: 'Gabriel', email: 'gabriel@mundoproviagens.com.br', sheetId: '1Fp7Y6ytwk7SLZAEZkSw-gAU2nCWVK9M1SyK0enbjQfY', dataEntrada: new Date('2024-01-01') },
  { nome: 'Francine', email: 'vendas3@mundoproviagens.com.br', sheetId: '1PpzDxn6eM3LKwtJTchD6qVbbyUkAeDnA6hNy0gmrx10', dataEntrada: new Date('2023-01-01') },
  { nome: 'Mauro', email: 'vendas6@mundoproviagens.com.br', sheetId: '19CNbM8qmkDFi-TxPDH8xaKeK0xOngcnDR2zOYH-LFSk', dataEntrada: new Date('2023-01-01') },
  { nome: 'Luana', email: 'vendas2@mundoproviagens.com.br', sheetId: '1tvfL-1S1kiAAyvFoKJzznW_RWYpLb6PAt-KiIF6vLjA', dataEntrada: new Date('2023-01-01') },
  { nome: 'Nathaly', email: 'atendimento@mundoproviagens.com.br', sheetId: '1jVIANOJ01UCat7Y8thFXkWZyhiv5Jzty-_9yK-xeKms', dataEntrada: new Date('2023-01-01') },
  { nome: 'Danilo', email: 'vendas7@mundoproviagens.com.br', sheetId: '1Yu3qKph4F59HnzMnIVFkTlB_Qf-LHTa2eU8ny-erN28', dataEntrada: new Date('2024-01-01') },
  { nome: 'Pedro', email: 'vendas12@mundoproviagens.com.br', sheetId: '1BAVNbSUX9WUEAwnQ1zPaiBMXupBnrDOEdjYVjeMy8tE', dataEntrada: new Date('2024-01-01') },
  { nome: 'Leonardo', email: 'vendas4@mundoproviagens.com.br', sheetId: '1xLkrLj7SEUa9gexhf-XgCBjZCI7XifchCek3ZBLxMZY', dataEntrada: new Date('2024-01-01') },
  { nome: 'Yasmin', email: 'vendas10@mundoproviagens.com.br', sheetId: '1UeOUxTlb7IWIhllK87Bb73Wx7F1PfbwPKJSwPCzMu9U', dataEntrada: new Date('2024-01-01') },
  { nome: 'Lucas', email: 'vendas9@mundoproviagens.com.br', sheetId: '1Bd53lZyS2aOUmIS4gSY_PtfuYFu-G_aUgXeH8HPEVZk', dataEntrada: new Date('2024-01-01') },
  { nome: 'Isabelle', email: 'vendas8@mundoproviagens.com.br', sheetId: '1xpngLR6KJZSAJTKqmDvev2skDX_SQOX9ScNENk2pZPg', dataEntrada: new Date('2024-01-01') },
  { nome: 'Andrios', email: 'vendas@mundoproviagens.com.br', sheetId: '1srU7o9d3HInp0o6oHZhuVOVGZOVHSC14Kp68lFvbJ7s', dataEntrada: new Date('2024-01-01') },
  { nome: 'Felipe', email: 'felipe@mundoproviagens.com.br', sheetId: '1lQFpUKdMbYA4l2blzaHQRGUeh1gX9_b6Qsj_hmXA42M', dataEntrada: new Date('2024-01-01') },
  { nome: 'Júlia', email: 'vendas11@mundoproviagens.com.br', sheetId: '1FAKE_JULIA_ID', dataEntrada: new Date('2024-01-01') }
];

export const appRouter = router({
  // Router de metas trimestral
  metas: router({
    // Busca dados do trimestre Set-Out-Nov/2025
    trimestral: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      const mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
      
      const metaGeral = 1000000000; // R$ 10 milhões em centavos
      let totalVendido = 0;
      
      const vendedoresComProgresso = await Promise.all(
        vendedores.map(async (vendedor) => {
          const metricas = await db.getMetricasByVendedor(vendedor.id);
          
          // Filtra apenas os meses do trimestre
          const metricasTrimestre = metricas.filter(m => 
            mesesTrimestre.includes(m.mes)
          );
          
          // Soma total de vendas do trimestre
          const totalVendasTrimestre = metricasTrimestre.reduce(
            (acc, m) => acc + (m.totalVendas || 0), 
            0
          );
          
          totalVendido += totalVendasTrimestre;
          
          const metaVendedor = vendedor.metaTrimestral || 0;
          const percentualAtingido = metaVendedor > 0 
            ? (totalVendasTrimestre / metaVendedor) * 100 
            : 0;
          const percentualFaltante = 100 - percentualAtingido;
          
          return {
            vendedor,
            metaVendedor,
            totalVendido: totalVendasTrimestre,
            percentualAtingido: Math.min(percentualAtingido, 100),
            percentualFaltante: Math.max(percentualFaltante, 0),
            status: percentualAtingido >= 100 ? 'atingida' : 
                    percentualAtingido >= 70 ? 'proximo' : 'distante'
          };
        })
      );
      
      const percentualGeralAtingido = (totalVendido / metaGeral) * 100;
      const percentualGeralFaltante = 100 - percentualGeralAtingido;
      
      return {
        metaGeral,
        totalVendido,
        percentualGeralAtingido: Math.min(percentualGeralAtingido, 100),
        percentualGeralFaltante: Math.max(percentualGeralFaltante, 0),
        vendedores: vendedoresComProgresso,
        periodo: 'Setembro - Outubro - Novembro/2025'
      };
    }),
    
    // Atualiza meta de um vendedor
    atualizarMeta: protectedProcedure
      .input(z.object({
        vendedorId: z.number(),
        metaTrimestral: z.number()
      }))
      .mutation(async ({ input }) => {
        await db.updateVendedorMeta(input.vendedorId, input.metaTrimestral);
        return { success: true };
      }),

    // Listar todas as metas cadastradas (agrupadas por trimestre)
    listar: publicProcedure.query(async () => {
      const metas = await db.getAllMetasTrimestrais();
      
      // Agrupa por trimestre
      const metasPorTrimestre = new Map<string, any>();
      
      for (const meta of metas) {
        if (!metasPorTrimestre.has(meta.trimestre)) {
          metasPorTrimestre.set(meta.trimestre, {
            trimestre: meta.trimestre,
            nomeMeta: meta.trimestre, // Pode ser melhorado adicionando campo nomeMeta na tabela
            metaTrimestral: meta.metaTrimestral,
            superMeta: meta.superMeta,
            bonusMeta: meta.bonusMeta,
            bonusSuperMeta: meta.bonusSuperMeta,
            metaAgencia: meta.metaAgencia || 0,
            totalVendedores: 1
          });
        } else {
          const atual = metasPorTrimestre.get(meta.trimestre);
          atual.totalVendedores++;
        }
      }
      
      return Array.from(metasPorTrimestre.values());
    }),

    // Criar nova meta trimestral
    criar: protectedProcedure
      .input(z.object({
        nomeMeta: z.string(),
        trimestre: z.string(),
        meses: z.array(z.string()),
        vendedorIds: z.array(z.number()),
        metaTrimestral: z.number(),
        superMeta: z.number(),
        bonusMeta: z.number(),
        bonusSuperMeta: z.number(),
        metaAgencia: z.number().optional().default(0),
      }))
      .mutation(async ({ input }) => {
        // Validações
        if (input.vendedorIds.length === 0) {
          throw new Error("Selecione pelo menos um vendedor");
        }

        if (input.metaTrimestral <= 0) {
          throw new Error("Valor da meta deve ser maior que zero");
        }

        // Criar meta para cada vendedor
        for (const vendedorId of input.vendedorIds) {
          await db.createMetaTrimestral({
            vendedorId,
            trimestre: input.trimestre,
            metaTrimestral: input.metaTrimestral,
            superMeta: input.superMeta,
            bonusMeta: input.bonusMeta,
            bonusSuperMeta: input.bonusSuperMeta,
            metaAgencia: input.metaAgencia,
          });
        }

        return { success: true, vendedoresAtualizados: input.vendedorIds.length };
      }),

    // Deletar meta trimestral
    deletar: protectedProcedure
      .input(z.object({
        trimestre: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.deleteMetasTrimestre(input.trimestre);
        return { success: true };
      }),

    // Progresso semanal da meta trimestral
    progressoSemanal: publicProcedure.query(async () => {
      const mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
      
      // Define as semanas do trimestre
      const dataInicio = new Date('2025-09-01');
      const dataFim = new Date('2025-11-30');
      const semanas: Array<{ numero: number; inicio: string; fim: string; vendas: number }> = [];
      
      // Gera as semanas
      let semanaAtual = new Date(dataInicio);
      let numeroSemana = 1;
      
      while (semanaAtual <= dataFim) {
        const fimSemana = new Date(semanaAtual);
        fimSemana.setDate(fimSemana.getDate() + 6);
        
        if (fimSemana > dataFim) {
          fimSemana.setTime(dataFim.getTime());
        }
        
        semanas.push({
          numero: numeroSemana,
          inicio: semanaAtual.toISOString().split('T')[0],
          fim: fimSemana.toISOString().split('T')[0],
          vendas: 0
        });
        
        semanaAtual.setDate(semanaAtual.getDate() + 7);
        numeroSemana++;
      }
      
      // Busca todas as métricas do trimestre
      const todasMetricas = await db.getAllMetricas();
      const metricasTrimestre = todasMetricas.filter(m => 
        mesesTrimestre.includes(m.mes)
      );
      
      // Calcula total do trimestre
      let totalTrimestre = 0;
      for (const metrica of metricasTrimestre) {
        totalTrimestre += metrica.totalVendas || 0;
      }
      
      // Distribui proporcionalmente pelas semanas (simplificado)
      const vendasPorSemana = totalTrimestre / semanas.length;
      let acumulado = 0;
      
      const semanasComDados = semanas.map((s, index) => {
        // Simula progresso gradual
        const vendas = vendasPorSemana * (index + 1) / semanas.length * semanas.length;
        acumulado += vendas;
        
        return {
          ...s,
          vendas,
          acumulado,
          percentualMeta: (acumulado / 1000000000) * 100
        };
      });
      
      // Calcula projeção
      const hoje = new Date();
      const semanaAtualIndex = semanasComDados.findIndex(s => new Date(s.fim) >= hoje);
      const semanasDecorridas = semanaAtualIndex >= 0 ? semanaAtualIndex + 1 : semanas.length;
      const mediaSemanasDecorridas = semanasDecorridas > 0 ? totalTrimestre / semanasDecorridas : 0;
      const projecaoFinal = mediaSemanasDecorridas * semanas.length;
      const vaiAtingirMeta = projecaoFinal >= 1000000000;
      
      return {
        semanas: semanasComDados,
        metaGeral: 1000000000,
        totalAcumulado: totalTrimestre,
        percentualAtingido: (totalTrimestre / 1000000000) * 100,
        projecaoFinal,
        vaiAtingirMeta,
        semanaAtual: semanaAtualIndex >= 0 ? semanaAtualIndex + 1 : semanas.length
      };
    }),
  }),
  
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  vendedores: router({
    // Lista todos os vendedores
    list: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      return vendedores.map(v => ({
        ...v,
        metaMensal: db.centavosParaReais(v.metaMensal || 0)
      }));
    }),

    // Lista vendedores para cadastro de metas (retorna id e nome)
    listar: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      return vendedores.map(v => ({
        id: v.id,
        nome: v.nome,
        email: v.email,
      }));
    }),

    // Inicializa vendedores no banco (executar uma vez)
    inicializar: protectedProcedure.mutation(async () => {
      for (const config of VENDEDORES_CONFIG) {
        await db.upsertVendedor({
          nome: config.nome,
          email: config.email,
          sheetId: config.sheetId,
          ativo: true,
          dataEntrada: config.dataEntrada,
          metaMensal: 0 // Será configurado depois
        });
      }
      return { success: true, total: VENDEDORES_CONFIG.length };
    }),

    // Atualiza meta de um vendedor
    atualizarMeta: protectedProcedure
      .input(z.object({
        vendedorId: z.number(),
        metaMensal: z.number()
      }))
      .mutation(async ({ input }) => {
        const vendedor = await db.getVendedorById(input.vendedorId);
        if (!vendedor) {
          throw new Error("Vendedor não encontrado");
        }

        await db.upsertVendedor({
          ...vendedor,
          metaMensal: db.reaisParaCentavos(input.metaMensal)
        });

        return { success: true };
      }),

    // Metas trimestrais de todos os vendedores (para dashboard admin)
    metasTrimestraisAdmin: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      const metas = await db.getAllMetasTrimestrais();
      
      // Agrupa metas por trimestre
      const metasPorTrimestre = new Map<string, any>();
      
      for (const meta of metas) {
        if (!metasPorTrimestre.has(meta.trimestre)) {
          metasPorTrimestre.set(meta.trimestre, {
            trimestre: meta.trimestre,
            metaAgencia: meta.metaAgencia || 0,
            vendedores: []
          });
        }
        
        // Busca vendedor
        const vendedor = vendedores.find(v => v.id === meta.vendedorId);
        if (!vendedor) continue;
        
        // Determina meses do trimestre
        let mesesTrimestre: string[] = [];
        if (meta.trimestre === 'Meta Trimestral 1') {
          mesesTrimestre = ['Dezembro/2025', 'Janeiro/2026', 'Fevereiro/2026'];
        } else if (meta.trimestre === 'Meta Trimestral 4') {
          mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
        }
        
        // Busca vendas do trimestre
        const metricas = await db.getMetricasByVendedor(vendedor.id);
        const metricasTrimestre = metricas.filter(m => 
          mesesTrimestre.includes(m.mes) && m.status === 'com_dados'
        );
        
        const totalVendido = metricasTrimestre.reduce((sum, m) => sum + m.totalVendas, 0);
        const totalReceita = metricasTrimestre.reduce((sum, m) => sum + m.totalReceita, 0);
        const falta = meta.metaTrimestral - totalVendido;
        const percentual = meta.metaTrimestral > 0 ? ((totalVendido / meta.metaTrimestral) * 100).toFixed(2) : '0.00';
        const percentualReceita = totalVendido > 0 ? ((totalReceita / totalVendido) * 100).toFixed(2) : '0.00';
        
        metasPorTrimestre.get(meta.trimestre)!.vendedores.push({
          vendedorId: vendedor.id,
          vendedorNome: vendedor.nome,
          meta: db.centavosParaReais(meta.metaTrimestral),
          superMeta: db.centavosParaReais(meta.superMeta),
          bonusMeta: db.centavosParaReais(meta.bonusMeta),
          bonusSuperMeta: db.centavosParaReais(meta.bonusSuperMeta),
          vendido: db.centavosParaReais(totalVendido),
          falta: db.centavosParaReais(Math.max(0, falta)),
          percentual,
          percentualReceita,
          totalVendidoCentavos: totalVendido // Mantém valor em centavos para cálculo da equipe
        });
      }
      
      // Calcula progresso da agência para cada trimestre
      const resultado = [];
      for (const [trimestre, dados] of Array.from(metasPorTrimestre.entries())) {
        const totalVendidoEquipe = dados.vendedores.reduce((sum: number, v: any) => {
          return sum + v.totalVendidoCentavos; // Usa valor em centavos
        }, 0);
        
        const faltaEquipe = dados.metaAgencia - totalVendidoEquipe;
        const percentualEquipe = dados.metaAgencia > 0 
          ? ((totalVendidoEquipe / dados.metaAgencia) * 100).toFixed(2)
          : '0.00';
        
        resultado.push({
          trimestre,
          metaAgencia: db.centavosParaReais(dados.metaAgencia),
          vendidoEquipe: db.centavosParaReais(totalVendidoEquipe),
          faltaEquipe: db.centavosParaReais(faltaEquipe),
          percentualEquipe,
          vendedores: dados.vendedores.sort((a: any, b: any) => parseFloat(b.percentual) - parseFloat(a.percentual))
        });
      }
      
      // Ordena por trimestre (mais recente primeiro)
      return resultado.sort((a, b) => {
        const ordem = ['Meta Trimestral 1', 'Meta Trimestral 4'];
        return ordem.indexOf(a.trimestre) - ordem.indexOf(b.trimestre);
      });
    }),

    // Percentual de receita consolidado (ano e mês atual)
    percentualReceitaConsolidado: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      
      // Calcula % de receita do ano
      let totalVendasAno = 0;
      let totalReceitaAno = 0;
      
      // Calcula % de receita do mês atual (Dezembro/2025)
      let totalVendasMes = 0;
      let totalReceitaMes = 0;
      const mesAtual = 'Dezembro/2025';
      
      for (const vendedor of vendedores) {
        const metricas = await db.getMetricasByVendedor(vendedor.id);
        const metricas2025 = metricas.filter(m => m.mes.endsWith('/2025') && m.status === 'com_dados');
        
        totalVendasAno += metricas2025.reduce((sum, m) => sum + m.totalVendas, 0);
        totalReceitaAno += metricas2025.reduce((sum, m) => sum + m.totalReceita, 0);
        
        const metricaMes = metricas.find(m => m.mes === mesAtual && m.status === 'com_dados');
        if (metricaMes) {
          totalVendasMes += metricaMes.totalVendas;
          totalReceitaMes += metricaMes.totalReceita;
        }
      }
      
      const percentualAno = totalVendasAno > 0 
        ? parseFloat(((totalReceitaAno / totalVendasAno) * 100).toFixed(2))
        : 0;
      
      const percentualMes = totalVendasMes > 0
        ? parseFloat(((totalReceitaMes / totalVendasMes) * 100).toFixed(2))
        : 0;
      
      return {
        ano: {
          totalVendas: db.centavosParaReais(totalVendasAno),
          totalReceita: db.centavosParaReais(totalReceitaAno),
          percentual: percentualAno
        },
        mes: {
          mesNome: mesAtual,
          totalVendas: db.centavosParaReais(totalVendasMes),
          totalReceita: db.centavosParaReais(totalReceitaMes),
          percentual: percentualMes
        }
      };
    }),

    // Comparativo mês atual vs mês anterior
    comparativoMesAtualAnterior: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      
      const mesAtual = 'Dezembro/2025';
      const mesAnterior = 'Novembro/2025';
      
      // Dados do mês atual
      let vendasAtual = 0;
      let receitaAtual = 0;
      
      // Dados do mês anterior
      let vendasAnterior = 0;
      let receitaAnterior = 0;
      
      for (const vendedor of vendedores) {
        const metricas = await db.getMetricasByVendedor(vendedor.id);
        
        const metricaAtual = metricas.find(m => m.mes === mesAtual && m.status === 'com_dados');
        if (metricaAtual) {
          vendasAtual += metricaAtual.totalVendas;
          receitaAtual += metricaAtual.totalReceita;
        }
        
        const metricaAnterior = metricas.find(m => m.mes === mesAnterior && m.status === 'com_dados');
        if (metricaAnterior) {
          vendasAnterior += metricaAnterior.totalVendas;
          receitaAnterior += metricaAnterior.totalReceita;
        }
      }
      
      const percentualAtual = vendasAtual > 0 
        ? parseFloat(((receitaAtual / vendasAtual) * 100).toFixed(2))
        : 0;
      
      const percentualAnterior = vendasAnterior > 0
        ? parseFloat(((receitaAnterior / vendasAnterior) * 100).toFixed(2))
        : 0;
      
      // Calcula variações percentuais
      const variacaoVendas = vendasAnterior > 0
        ? parseFloat((((vendasAtual - vendasAnterior) / vendasAnterior) * 100).toFixed(2))
        : 0;
      
      const variacaoReceita = receitaAnterior > 0
        ? parseFloat((((receitaAtual - receitaAnterior) / receitaAnterior) * 100).toFixed(2))
        : 0;
      
      const variacaoPercentual = percentualAnterior > 0
        ? parseFloat((percentualAtual - percentualAnterior).toFixed(2))
        : 0;
      
      return {
        mesAtual: {
          mes: mesAtual,
          vendas: db.centavosParaReais(vendasAtual),
          receita: db.centavosParaReais(receitaAtual),
          percentual: percentualAtual
        },
        mesAnterior: {
          mes: mesAnterior,
          vendas: db.centavosParaReais(vendasAnterior),
          receita: db.centavosParaReais(receitaAnterior),
          percentual: percentualAnterior
        },
        variacoes: {
          vendas: variacaoVendas,
          receita: variacaoReceita,
          percentual: variacaoPercentual
        }
      };
    }),

    // Ranking de vendedores por melhor % de receita
    rankingPercentualReceita: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      const ranking = [];
      
      for (const vendedor of vendedores) {
        const metricas = await db.getMetricasByVendedor(vendedor.id);
        const metricas2025 = metricas.filter(m => m.mes.endsWith('/2025') && m.status === 'com_dados');
        
        const totalVendas = metricas2025.reduce((sum, m) => sum + m.totalVendas, 0);
        const totalReceita = metricas2025.reduce((sum, m) => sum + m.totalReceita, 0);
        const percentual = totalVendas > 0 
          ? parseFloat(((totalReceita / totalVendas) * 100).toFixed(2))
          : 0;
        
        if (totalVendas > 0) {
          ranking.push({
            vendedorId: vendedor.id,
            nome: vendedor.nome,
            totalVendas: db.centavosParaReais(totalVendas),
            totalReceita: db.centavosParaReais(totalReceita),
            percentual
          });
        }
      }
      
      // Ordena por percentual (maior primeiro)
      ranking.sort((a, b) => b.percentual - a.percentual);
      
      return ranking;
    }),
    
    resumoGeral: publicProcedure
      .input(z.object({ 
        ano: z.number().optional(),
        mes: z.string().optional() 
      }).optional())
      .query(async ({ input }) => {
      const vendedores = await db.getAllVendedores();
      const resultado = [];

      for (const vendedor of vendedores) {
        let metricas = await db.getMetricasByVendedor(vendedor.id);
        
        // Aplica filtros de ano e mês se fornecidos
        if (input?.ano) {
          metricas = metricas.filter(m => {
            const ano = parseInt(m.mes.split('/')[1]);
            return ano === input.ano;
          });
        }
        if (input?.mes) {
          metricas = metricas.filter(m => m.mes === input.mes);
        }
        
        // Pega apenas métricas com dados
        const metricasComDados = metricas.filter(m => m.status === 'com_dados');
        
        // Calcula totais
        const totalVendas = metricasComDados.reduce((sum, m) => sum + m.totalVendas, 0);
        const totalReceita = metricasComDados.reduce((sum, m) => sum + m.totalReceita, 0);
        const totalComissao = metricasComDados.reduce((sum, m) => sum + m.comissaoTotal, 0);

        resultado.push({
          vendedor: {
            id: vendedor.id,
            nome: vendedor.nome,
            metaMensal: db.centavosParaReais(vendedor.metaMensal || 0)
          },
          totais: {
            vendas: db.centavosParaReais(totalVendas),
            receita: db.centavosParaReais(totalReceita),
            comissao: db.centavosParaReais(totalComissao)
          },
          mesesComDados: metricasComDados.length
        });
      }

      return resultado;
    }),

    // Busca métricas de um vendedor específico
    porVendedor: publicProcedure
      .input(z.object({ 
        vendedorId: z.number(),
        ano: z.number().optional(),
        mes: z.string().optional()
      }))
      .query(async ({ input }) => {
        const vendedor = await db.getVendedorById(input.vendedorId);
        if (!vendedor) {
          throw new Error('Vendedor não encontrado');
        }

        let metricas = await db.getMetricasByVendedor(input.vendedorId);
        
        // Aplica filtros se fornecidos
        if (input.ano) {
          metricas = metricas.filter(m => m.mes.endsWith(`/${input.ano}`));
        }
        if (input.mes) {
          metricas = metricas.filter(m => m.mes === input.mes);
        }
        
        return {
          vendedor: {
            id: vendedor.id,
            nome: vendedor.nome,
            metaMensal: db.centavosParaReais(vendedor.metaMensal || 0)
          },
          metricas: metricas.map(m => ({
            mes: m.mes,
            totalVendas: db.centavosParaReais(m.totalVendas),
            totalReceita: db.centavosParaReais(m.totalReceita),
            comissaoTotal: db.centavosParaReais(m.comissaoTotal),
            percentualReceita: db.percentualParaDecimal(m.percentualReceita),
            status: m.status,
            dataExtracao: m.dataExtracao
          }))
        };
      }),

      // Limpa métricas de anos específicos
    limparDadosAntigos: protectedProcedure
      .input(z.object({ ano: z.number() }))
      .mutation(async ({ input }) => {
        const metricas = await db.getAllMetricas();
        const metricasParaRemover = metricas.filter(m => m.mes.endsWith(`/${input.ano}`));
        
        for (const metrica of metricasParaRemover) {
          await db.deleteMetrica(metrica.id);
        }
        
        return { 
          success: true, 
          removidos: metricasParaRemover.length,
          ano: input.ano
        };
      }),
    
    // Atualiza dados de todos os vendedores
    atualizarTodos: protectedProcedure.mutation(async () => {
      const vendedores = await db.getAllVendedores();
      // Atualiza apenas os últimos 2 meses (atual + anterior)
      // Meses fechados não precisam ser reprocessados
      const { gerarUltimosMeses } = await import('./sheetsExtractor');
      const meses = gerarUltimosMeses(2);
      
      let vendedoresAtualizados = 0;
      let totalRegistros = 0;
      const erros: string[] = [];

      for (const vendedor of vendedores) {
        try {
          console.log(`Extraindo dados de ${vendedor.nome}...`);
          const resultados = await extrairDadosVendedor(vendedor.sheetId, meses);
          
          for (const resultado of resultados) {
            const metricas = resultado.metricas;
            
            await db.upsertMetrica({
              vendedorId: vendedor.id,
              mes: resultado.mes,
              totalVendas: metricas?.totalVendas || 0,
              totalReceita: metricas?.totalReceita || 0,
              comissaoTotal: metricas?.comissaoTotal || 0,
              percentualReceita: metricas?.percentualReceita || 0,
              status: metricas?.encontrado ? 'com_dados' : 'sem_dados',
              dataExtracao: new Date()
            });
            
            totalRegistros++;
          }
          
          vendedoresAtualizados++;
        } catch (error) {
          console.error(`Erro ao atualizar ${vendedor.nome}:`, error);
          erros.push(`${vendedor.nome}: ${error}`);
        }
      }

      // Registra a atualização
      await db.registrarAtualizacao({
        tipo: 'manual',
        status: erros.length === 0 ? 'sucesso' : (vendedoresAtualizados > 0 ? 'parcial' : 'erro'),
        vendedoresAtualizados,
        totalRegistros,
        mensagem: erros.length > 0 ? erros.join('; ') : undefined
      });

      return {
        success: true,
        vendedoresAtualizados,
        totalRegistros,
        erros
      };
    }),

    // Atualiza métricas de um vendedor específico
    atualizarVendedor: protectedProcedure
      .input(z.object({ vendedorId: z.number() }))
      .mutation(async ({ input }) => {
        const vendedor = await db.getVendedorById(input.vendedorId);
        if (!vendedor) {
          throw new Error("Vendedor não encontrado");
        }

        const meses = gerarListaMeses();
        const resultados = await extrairDadosVendedor(vendedor.sheetId, meses);
        
        let totalRegistros = 0;
        for (const resultado of resultados) {
          const metricas = resultado.metricas;
          
          await db.upsertMetrica({
            vendedorId: vendedor.id,
            mes: resultado.mes,
            totalVendas: metricas?.totalVendas || 0,
            totalReceita: metricas?.totalReceita || 0,
            comissaoTotal: metricas?.comissaoTotal || 0,
            percentualReceita: metricas?.percentualReceita || 0,
            status: metricas?.encontrado ? 'com_dados' : 'sem_dados',
            dataExtracao: new Date()
          });
          
          totalRegistros++;
        }

        return {
          success: true,
          vendedor: vendedor.nome,
          totalRegistros
        };
      }),
    
    // Comparativo 2024 vs 2025 consolidado (todos vendedores)
    comparativo2024vs2025: publicProcedure
      .query(async () => {
        const vendedores = await db.getAllVendedores();
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        const comparativo = [];
        
        for (const mesNome of meses) {
          let totalVendas2024 = 0;
          let totalVendas2025 = 0;
          let totalReceita2024 = 0;
          let totalReceita2025 = 0;
          let temDados2024 = false;
          let temDados2025 = false;
          
          for (const vendedor of vendedores) {
            const metricas = await db.getMetricasByVendedor(vendedor.id);
            const metrica2024 = metricas.find(m => m.mes === `${mesNome}/2024` && m.status === 'com_dados');
            const metrica2025 = metricas.find(m => m.mes === `${mesNome}/2025` && m.status === 'com_dados');
            
            if (metrica2024) {
              totalVendas2024 += metrica2024.totalVendas;
              totalReceita2024 += metrica2024.totalReceita;
              temDados2024 = true;
            }
            if (metrica2025) {
              totalVendas2025 += metrica2025.totalVendas;
              totalReceita2025 += metrica2025.totalReceita;
              temDados2025 = true;
            }
          }
          
          // Só adiciona meses com dados
          if (temDados2024 || temDados2025) {
            let variacaoVendas = 0;
            let variacaoReceita = 0;
            if (totalVendas2024 > 0) {
              variacaoVendas = ((totalVendas2025 - totalVendas2024) / totalVendas2024) * 100;
            }
            if (totalReceita2024 > 0) {
              variacaoReceita = ((totalReceita2025 - totalReceita2024) / totalReceita2024) * 100;
            }
            
            comparativo.push({
              mes: mesNome,
              vendas2024: db.centavosParaReais(totalVendas2024),
              vendas2025: db.centavosParaReais(totalVendas2025),
              receita2024: db.centavosParaReais(totalReceita2024),
              receita2025: db.centavosParaReais(totalReceita2025),
              variacaoVendas: variacaoVendas.toFixed(2),
              variacaoReceita: variacaoReceita.toFixed(2),
              temDados2024,
              temDados2025
            });
          }
        }
        
        return comparativo;
      }),
    
    // Top destinos consolidado (todos vendedores)
    topDestinosConsolidado: publicProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ input }) => {
        const vendedores = await db.getAllVendedores();
        const destinosMap = new Map<string, { valorTotal: number, quantidade: number }>();
        
        for (const vendedor of vendedores) {
          const metricas = await db.getMetricasByVendedor(vendedor.id);
          const metricasComDados = metricas.filter(m => m.status === 'com_dados');
          
          for (const metrica of metricasComDados) {
            if (metrica.destinos && Array.isArray(metrica.destinos)) {
              for (const destino of metrica.destinos) {
                const destinoNome = destino.nome || 'Desconhecido';
                const destinoValor = destino.valor || 0;
                
                const atual = destinosMap.get(destinoNome) || { valorTotal: 0, quantidade: 0 };
                destinosMap.set(destinoNome, {
                  valorTotal: atual.valorTotal + destinoValor,
                  quantidade: atual.quantidade + 1
                });
              }
            }
          }
        }
        
        const topDestinos = Array.from(destinosMap.entries())
          .map(([nome, dados]) => ({
            destino: nome,
            valorTotal: db.centavosParaReais(dados.valorTotal),
            quantidade: dados.quantidade
          }))
          .sort((a, b) => b.valorTotal - a.valorTotal)
          .slice(0, input?.limit || 10);
        
        return topDestinos;
      }),
    
    // Evolução mensal do % de receita consolidado
    evolucaoPercentualReceita: publicProcedure
      .input(z.object({ ano: z.number().default(2025) }))
      .query(async ({ input }) => {
        const vendedores = await db.getAllVendedores();
        const mesesDoAno = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const evolucao = [];
        
        for (const mesNome of mesesDoAno) {
          const mesCompleto = `${mesNome}/${input.ano}`;
          let totalVendasMes = 0;
          let totalReceitaMes = 0;
          
          for (const vendedor of vendedores) {
            const metricas = await db.getMetricasByVendedor(vendedor.id);
            const metricaMes = metricas.find(m => m.mes === mesCompleto && m.status === 'com_dados');
            
            if (metricaMes) {
              totalVendasMes += metricaMes.totalVendas;
              totalReceitaMes += metricaMes.totalReceita;
            }
          }
          
          // Só adiciona meses com dados
          if (totalVendasMes > 0) {
            const percentual = parseFloat(((totalReceitaMes / totalVendasMes) * 100).toFixed(2));
            
            evolucao.push({
              mes: mesNome,
              mesCompleto,
              totalVendas: db.centavosParaReais(totalVendasMes),
              totalReceita: db.centavosParaReais(totalReceitaMes),
              percentual
            });
          }
        }
        
        return evolucao;
      }),
  }),

  atualizacoes: router({
    // Lista últimas atualizações
    ultimas: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        const atualizacoes = await db.getUltimasAtualizacoes(input.limit || 10);
        return atualizacoes;
      }),
  }),

  analises: router({
    // Melhor vendedor do mês
    melhorVendedor: publicProcedure
      .input(z.object({ 
        mes: z.string().optional(),
        ano: z.number().optional()
      }))
      .query(async ({ input }) => {
      const vendedores = await db.getAllVendedores();
      const resultados = [];

      for (const vendedor of vendedores) {
        let metricas = await db.getMetricasByVendedor(vendedor.id);
        
        // Aplica filtros se fornecidos
        if (input?.ano) {
          metricas = metricas.filter(m => m.mes.endsWith(`/${input.ano}`));
        }
        if (input?.mes) {
          metricas = metricas.filter(m => m.mes === input.mes);
        }
          
        // Filtra por ano e mês se especificado
        let metricasFiltradas = metricas.filter(m => m.status === 'com_dados');
        
        if (input.ano) {
          metricasFiltradas = metricasFiltradas.filter(m => m.mes.endsWith(`/${input.ano}`));
        }
        if (input.mes) {
          metricasFiltradas = metricasFiltradas.filter(m => m.mes === input.mes);
        }

          if (metricasFiltradas.length > 0) {
            const totalReceita = metricasFiltradas.reduce((sum, m) => sum + m.totalReceita, 0);
            const totalVendas = metricasFiltradas.reduce((sum, m) => sum + m.totalVendas, 0);
            const totalComissao = metricasFiltradas.reduce((sum, m) => sum + m.comissaoTotal, 0);

            resultados.push({
              vendedor: {
                id: vendedor.id,
                nome: vendedor.nome
              },
              receita: db.centavosParaReais(totalReceita),
              vendas: db.centavosParaReais(totalVendas),
              comissao: db.centavosParaReais(totalComissao),
              meses: metricasFiltradas.length
            });
          }
        }

        // Ordena por receita
        resultados.sort((a, b) => b.receita - a.receita);

        return {
          melhor: resultados[0] || null,
          top5: resultados.slice(0, 5),
          todos: resultados,
          periodo: input.mes || 'Geral'
        };
      }),

    // Dados para gráfico de barras
    graficoComparativo: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      const dados = [];

      for (const vendedor of vendedores) {
        const metricas = await db.getMetricasByVendedor(vendedor.id);
        const metricasComDados = metricas.filter(m => m.status === 'com_dados');

        const totalVendas = metricasComDados.reduce((sum, m) => sum + m.totalVendas, 0);
        const totalReceita = metricasComDados.reduce((sum, m) => sum + m.totalReceita, 0);
        const totalComissao = metricasComDados.reduce((sum, m) => sum + m.comissaoTotal, 0);

        dados.push({
          vendedor: vendedor.nome,
          vendas: db.centavosParaReais(totalVendas),
          receita: db.centavosParaReais(totalReceita),
          comissao: db.centavosParaReais(totalComissao)
        });
      }

      // Ordena por receita
      dados.sort((a, b) => b.receita - a.receita);

      return dados;
    }),

    // Dados para resumo executivo
    resumoExecutivo: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      const metricas = await db.getUltimasMetricas();
      
      // Calcula totais gerais
      const totalVendas = metricas.reduce((sum, m) => sum + m.totalVendas, 0);
      const totalReceita = metricas.reduce((sum, m) => sum + m.totalReceita, 0);
      const totalComissao = metricas.reduce((sum, m) => sum + m.comissaoTotal, 0);

      // Agrupa por vendedor
      const porVendedor = new Map();
      for (const metrica of metricas) {
        if (!porVendedor.has(metrica.vendedorId)) {
          porVendedor.set(metrica.vendedorId, {
            vendas: 0,
            receita: 0,
            comissao: 0
          });
        }
        const atual = porVendedor.get(metrica.vendedorId);
        atual.vendas += metrica.totalVendas;
        atual.receita += metrica.totalReceita;
        atual.comissao += metrica.comissaoTotal;
      }

      // Encontra melhor e pior
      let melhorVendedor = null;
      let piorVendedor = null;
      let maiorReceita = 0;
      let menorReceita = Infinity;

      for (const vendedor of vendedores) {
        const dados = porVendedor.get(vendedor.id);
        if (dados) {
          if (dados.receita > maiorReceita) {
            maiorReceita = dados.receita;
            melhorVendedor = { nome: vendedor.nome, receita: db.centavosParaReais(dados.receita) };
          }
          if (dados.receita < menorReceita && dados.receita > 0) {
            menorReceita = dados.receita;
            piorVendedor = { nome: vendedor.nome, receita: db.centavosParaReais(dados.receita) };
          }
        }
      }

      return {
        totais: {
          vendas: db.centavosParaReais(totalVendas),
          receita: db.centavosParaReais(totalReceita),
          comissao: db.centavosParaReais(totalComissao)
        },
        vendedoresAtivos: vendedores.length,
        mesesComDados: metricas.length,
        melhorVendedor,
        piorVendedor,
        mediaReceita: db.centavosParaReais(totalReceita / vendedores.length)
      };
    }),

    // Metas trimestrais de todos os vendedores (para dashboard admin)
  }),

  fornecedores: router({
    // Consulta dados consolidados por mês
    porMes: protectedProcedure
      .input(z.object({ mes: z.string() }))
      .query(async ({ input }) => {
        const dados = await db.consultarFornecedoresPorMes(input.mes);
        
        // Agrupa por operadora normalizada
        const consolidado = new Map<string, {
          operadoraNormalizada: string;
          tarifa: number;
          taxa: number;
          duTebOver: number;
          incentivo: number;
          valorTotal: number;
          quantidade: number;
        }>();
        
        for (const item of dados) {
          if (!consolidado.has(item.operadoraNormalizada)) {
            consolidado.set(item.operadoraNormalizada, {
              operadoraNormalizada: item.operadoraNormalizada,
              tarifa: 0,
              taxa: 0,
              duTebOver: 0,
              incentivo: 0,
              valorTotal: 0,
              quantidade: 0
            });
          }
          const atual = consolidado.get(item.operadoraNormalizada)!;
          atual.tarifa += item.tarifa;
          atual.taxa += item.taxa;
          atual.duTebOver += item.duTebOver;
          atual.incentivo += item.incentivo;
          atual.valorTotal += item.valorTotal;
          atual.quantidade++;
        }
        
        // Converte para array e ordena por valor total
        return Array.from(consolidado.values())
          .map(f => ({
            operadora: f.operadoraNormalizada,
            tarifa: db.centavosParaReais(f.tarifa),
            taxa: db.centavosParaReais(f.taxa),
            duTebOver: db.centavosParaReais(f.duTebOver),
            incentivo: db.centavosParaReais(f.incentivo),
            valorTotal: db.centavosParaReais(f.valorTotal),
            quantidade: f.quantidade
          }))
          .sort((a, b) => b.valorTotal - a.valorTotal);
      }),

    // Consulta dados consolidados por ano
    porAno: protectedProcedure
      .input(z.object({ ano: z.number() }))
      .query(async ({ input }) => {
        const dados = await db.consultarFornecedoresPorAno(input.ano);
        
        // Agrupa por operadora normalizada
        const consolidado = new Map<string, {
          operadoraNormalizada: string;
          tarifa: number;
          taxa: number;
          duTebOver: number;
          incentivo: number;
          valorTotal: number;
          quantidade: number;
          meses: Set<string>;
        }>();
        
        for (const item of dados) {
          if (!consolidado.has(item.operadoraNormalizada)) {
            consolidado.set(item.operadoraNormalizada, {
              operadoraNormalizada: item.operadoraNormalizada,
              tarifa: 0,
              taxa: 0,
              duTebOver: 0,
              incentivo: 0,
              valorTotal: 0,
              quantidade: 0,
              meses: new Set()
            });
          }
          const atual = consolidado.get(item.operadoraNormalizada)!;
          atual.tarifa += item.tarifa;
          atual.taxa += item.taxa;
          atual.duTebOver += item.duTebOver;
          atual.incentivo += item.incentivo;
          atual.valorTotal += item.valorTotal;
          atual.quantidade++;
          atual.meses.add(item.mes);
        }
        
        // Converte para array e ordena por valor total
        return Array.from(consolidado.values())
          .map(f => ({
            operadora: f.operadoraNormalizada,
            tarifa: db.centavosParaReais(f.tarifa),
            taxa: db.centavosParaReais(f.taxa),
            duTebOver: db.centavosParaReais(f.duTebOver),
            incentivo: db.centavosParaReais(f.incentivo),
            valorTotal: db.centavosParaReais(f.valorTotal),
            quantidade: f.quantidade,
            mesesAtivos: f.meses.size
          }))
          .sort((a, b) => b.valorTotal - a.valorTotal);
      }),

    // Top 10 fornecedores por período
    top10: protectedProcedure
      .input(z.object({ ano: z.number() }))
      .query(async ({ input }) => {
        const dados = await db.consultarFornecedoresPorAno(input.ano);
        
        const consolidado = new Map<string, number>();
        
        for (const item of dados) {
          const atual = consolidado.get(item.operadoraNormalizada) || 0;
          consolidado.set(item.operadoraNormalizada, atual + item.valorTotal);
        }
        
        return Array.from(consolidado.entries())
          .map(([operadora, valorTotal]) => ({
            operadora,
            valorTotal: db.centavosParaReais(valorTotal)
          }))
          .sort((a, b) => b.valorTotal - a.valorTotal)
          .slice(0, 10);
      }),

    // Evolução mensal de uma operadora
    evolucaoMensal: protectedProcedure
      .input(z.object({ 
        operadora: z.string(),
        ano: z.number()
      }))
      .query(async ({ input }) => {
        const dados = await db.consultarFornecedoresPorAno(input.ano);
        
        const porMes = new Map<string, number>();
        
        for (const item of dados) {
          if (item.operadoraNormalizada === input.operadora) {
            const atual = porMes.get(item.mes) || 0;
            porMes.set(item.mes, atual + item.valorTotal);
          }
        }
        
        return Array.from(porMes.entries())
          .map(([mes, valorTotal]) => ({
            mes,
            valorTotal: db.centavosParaReais(valorTotal)
          }))
          .sort((a, b) => {
            // Ordena por data (assumindo formato "Mês/Ano")
            const [mesA, anoA] = a.mes.split('/');
            const [mesB, anoB] = b.mes.split('/');
            return anoA === anoB ? mesA.localeCompare(mesB) : anoA.localeCompare(anoB);
          });
      }),
  }),

  // Router de vendas diárias (calculadas por diferença de totais)
  vendasDiarias: router({
    // Vendas de hoje (calculadas pela diferença do total acumulado)
    hoje: protectedProcedure.query(async () => {
      const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase()).replace(/ de /, '/');
      
      const vendedores = await db.listarVendedores();
      const metricas = await db.getAllMetricas();
      
      // Filtra métricas do mês atual e ordena por data de extração
      const metricasMesAtual = metricas
        .filter(m => m.mes === mesAtual)
        .sort((a, b) => new Date(b.dataExtracao).getTime() - new Date(a.dataExtracao).getTime());
      
      if (metricasMesAtual.length === 0) {
        return {
          totalVendas: 0,
          valorTotal: 0,
          vendas: []
        };
      }
      
      // Agrupa por vendedor e pega as 2 últimas extrações
      const vendasPorVendedor: Array<{ vendedor: string, valor: number }> = [];
      let totalVendas = 0;
      
      for (const vendedor of vendedores) {
        const metricasVendedor = metricasMesAtual.filter(m => m.vendedorId === vendedor.id);
        if (metricasVendedor.length < 2) continue;
        
        const ultima = metricasVendedor[0];
        const penultima = metricasVendedor[1];
        
        const vendasDia = ultima.totalVendas - penultima.totalVendas;
        if (vendasDia > 0) {
          vendasPorVendedor.push({
            vendedor: vendedor.nome,
            valor: vendasDia
          });
          totalVendas += vendasDia;
        }
      }
      
      return {
        totalVendas: vendasPorVendedor.length,
        valorTotal: db.centavosParaReais(totalVendas),
        vendas: vendasPorVendedor.map(v => ({
          ...v,
          valor: db.centavosParaReais(v.valor)
        }))
      };
    }),

    // Comparativo (hoje vs ontem)
    comparativo: protectedProcedure.query(async () => {
      const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase()).replace(/ de /, '/');
      
      const vendedores = await db.listarVendedores();
      const metricas = await db.getAllMetricas();
      
      const metricasMesAtual = metricas
        .filter(m => m.mes === mesAtual)
        .sort((a, b) => new Date(b.dataExtracao).getTime() - new Date(a.dataExtracao).getTime());
      
      if (metricasMesAtual.length < 3) {
        return {
          hoje: { vendas: 0, valor: 0 },
          ontem: { vendas: 0, valor: 0 },
          variacao: 0
        };
      }
      
      let totalHoje = 0;
      let totalOntem = 0;
      
      for (const vendedor of vendedores) {
        const metricasVendedor = metricasMesAtual.filter(m => m.vendedorId === vendedor.id);
        if (metricasVendedor.length < 3) continue;
        
        const ultima = metricasVendedor[0];
        const penultima = metricasVendedor[1];
        const antepenultima = metricasVendedor[2];
        
        totalHoje += ultima.totalVendas - penultima.totalVendas;
        totalOntem += penultima.totalVendas - antepenultima.totalVendas;
      }
      
      const variacao = totalOntem > 0 ? ((totalHoje - totalOntem) / totalOntem) * 100 : 0;
      
      return {
        hoje: {
          vendas: totalHoje > 0 ? 1 : 0,
          valor: db.centavosParaReais(totalHoje)
        },
        ontem: {
          vendas: totalOntem > 0 ? 1 : 0,
          valor: db.centavosParaReais(totalOntem)
        },
        variacao: Math.round(variacao * 10) / 10
      };
    }),

    // Ranking diário de vendedores
    ranking: protectedProcedure.query(async () => {
      const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase()).replace(/ de /, '/');
      
      const vendedores = await db.listarVendedores();
      const metricas = await db.getAllMetricas();
      
      const metricasMesAtual = metricas
        .filter(m => m.mes === mesAtual)
        .sort((a, b) => new Date(b.dataExtracao).getTime() - new Date(a.dataExtracao).getTime());
      
      const ranking: Array<{ vendedor: string, vendas: number, valor: number }> = [];
      
      for (const vendedor of vendedores) {
        const metricasVendedor = metricasMesAtual.filter(m => m.vendedorId === vendedor.id);
        if (metricasVendedor.length < 2) continue;
        
        const ultima = metricasVendedor[0];
        const penultima = metricasVendedor[1];
        
        const vendasDia = ultima.totalVendas - penultima.totalVendas;
        if (vendasDia > 0) {
          ranking.push({
            vendedor: vendedor.nome,
            vendas: 1,
            valor: vendasDia
          });
        }
      }
      
      return ranking
        .map(r => ({
          ...r,
          valor: db.centavosParaReais(r.valor)
        }))
        .sort((a, b) => b.valor - a.valor);
    }),
  }),

  // Router de painel individual do vendedor
  painelVendedor: router({
    // Busca dados do vendedor logado
    meusDados: protectedProcedure
      .input(z.object({
        trimestre: z.array(z.string()).optional(), // Ex: ['Setembro/2025', 'Outubro/2025', 'Novembro/2025']
        ano: z.number().optional(),
        mes: z.string().optional()
      }).optional())
      .query(async ({ ctx, input }) => {
        // Busca vendedor pelo email do usuário logado
        console.log('[DEBUG] Email do usuário logado:', ctx.user.email);
        const vendedor = await db.getVendedorByEmail(ctx.user.email);
        console.log('[DEBUG] Vendedor encontrado:', vendedor ? `ID ${vendedor.id} - ${vendedor.nome}` : 'NULL');
        
        if (!vendedor) {
          console.error('[ERROR] Vendedor não encontrado para email:', ctx.user.email);
          // Retorna null para o frontend mostrar mensagem de erro
          return null;
        }
        
        // Busca todas as métricas do vendedor
        let metricas = await db.getMetricasByVendedor(vendedor.id);
        
        // Aplica filtros se fornecidos
        if (input?.ano) {
          metricas = metricas.filter(m => {
            const ano = parseInt(m.mes.split('/')[1]);
            return ano === input.ano;
          });
        }
        if (input?.mes) {
          metricas = metricas.filter(m => m.mes === input.mes);
        }
        if (input?.trimestre && input.trimestre.length > 0) {
          metricas = metricas.filter(m => input.trimestre!.includes(m.mes));
        }
        
        // Calcula totais
        const metricasComDados = metricas.filter(m => m.status === 'com_dados');
        const totalVendas = metricasComDados.reduce((sum, m) => sum + m.totalVendas, 0);
        const totalReceita = metricasComDados.reduce((sum, m) => sum + m.totalReceita, 0);
        const totalComissao = metricasComDados.reduce((sum, m) => sum + m.comissaoTotal, 0);
        
        // Calcula meta trimestral (Set-Out-Nov/2025)
        const mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
        const metricasTrimestre = await db.getMetricasByVendedor(vendedor.id);
        const metricasTrimestreFiltered = metricasTrimestre.filter(m => 
          mesesTrimestre.includes(m.mes) && m.status === 'com_dados'
        );
        const totalTrimestreVendas = metricasTrimestreFiltered.reduce((sum, m) => sum + m.totalVendas, 0);
        
        // Meta geral da equipe
        const todosVendedores = await db.getAllVendedores();
        let totalGeralTrimestre = 0;
        for (const v of todosVendedores) {
          const mets = await db.getMetricasByVendedor(v.id);
          const metsTri = mets.filter(m => mesesTrimestre.includes(m.mes) && m.status === 'com_dados');
          totalGeralTrimestre += metsTri.reduce((sum, m) => sum + m.totalVendas, 0);
        }
        
        const metaGeralEquipe = 1000000000; // R$ 10 milhões em centavos
        
        // Calcula % de receita do ano
        const percentualReceitaAno = totalVendas > 0 
          ? ((totalReceita / totalVendas) * 100).toFixed(2)
          : '0.00';
        
        // Busca dados do mês atual
        const dataAtual = new Date();
        const mesAtual = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const mesAtualFormatado = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1); // Ex: "Dezembro/2025"
        
        const metricaMesAtual = metricas.find(m => m.mes === mesAtualFormatado && m.status === 'com_dados');
        const vendasMesAtual = metricaMesAtual ? metricaMesAtual.totalVendas : 0;
        const receitaMesAtual = metricaMesAtual ? metricaMesAtual.totalReceita : 0;
        const percentualReceitaMes = vendasMesAtual > 0
          ? ((receitaMesAtual / vendasMesAtual) * 100).toFixed(2)
          : '0.00';
        
        return {
          vendedor: {
            id: vendedor.id,
            nome: vendedor.nome,
            email: vendedor.email,
            metaTrimestral: db.centavosParaReais(vendedor.metaTrimestral || 0)
          },
          totais: {
            vendas: db.centavosParaReais(totalVendas),
            receita: db.centavosParaReais(totalReceita),
            comissao: db.centavosParaReais(totalComissao),
            percentualReceita: percentualReceitaAno
          },
          mesAtual: {
            mes: mesAtualFormatado,
            vendas: db.centavosParaReais(vendasMesAtual),
            receita: db.centavosParaReais(receitaMesAtual),
            percentualReceita: percentualReceitaMes
          },
          metaTrimestralIndividual: {
            meta: db.centavosParaReais(vendedor.metaTrimestral || 0),
            vendido: db.centavosParaReais(totalTrimestreVendas),
            falta: db.centavosParaReais(Math.max(0, (vendedor.metaTrimestral || 0) - totalTrimestreVendas)),
            percentual: (vendedor.metaTrimestral || 0) > 0 
              ? ((totalTrimestreVendas / (vendedor.metaTrimestral || 1)) * 100).toFixed(2)
              : '0.00'
          },
          metaGeralEquipe: {
            meta: db.centavosParaReais(metaGeralEquipe),
            vendido: db.centavosParaReais(totalGeralTrimestre),
            falta: db.centavosParaReais(Math.max(0, metaGeralEquipe - totalGeralTrimestre)),
            percentual: ((totalGeralTrimestre / metaGeralEquipe) * 100).toFixed(2)
          },
          mesesComDados: metricasComDados.length
        };
      }),

    // Evolução mensal do vendedor
    evolucaoMensal: protectedProcedure
      .input(z.object({ ano: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const vendedor = await db.getVendedorByEmail(ctx.user.email);
        if (!vendedor) throw new Error('Vendedor não encontrado');

        const metricas = await db.getMetricasByVendedor(vendedor.id);
        let metricasComDados = metricas.filter(m => m.status === 'com_dados');
        
        // Filtrar por ano se especificado
        if (input?.ano) {
          metricasComDados = metricasComDados.filter(m => m.mes.endsWith(`/${input.ano}`));
        }

        // Ordena por data (mês/ano)
        const evolucao = metricasComDados
          .map(m => {
            const [mesNome, ano] = m.mes.split('/');
            const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            const mesNumero = meses.indexOf(mesNome) + 1;
            const vendas = db.centavosParaReais(m.totalVendas);
            const receita = db.centavosParaReais(m.totalReceita);
            const percentualReceita = vendas > 0 ? parseFloat(((receita / vendas) * 100).toFixed(2)) : 0;
            
            return {
              mes: m.mes,
              vendas,
              receita,
              comissao: db.centavosParaReais(m.comissaoTotal),
              percentualReceita,
              ano: parseInt(ano),
              mesNumero,
              ordenacao: parseInt(ano) * 100 + mesNumero
            };
          })
          .sort((a, b) => a.ordenacao - b.ordenacao);

        return evolucao;
      }),

    // Comparativo 2024 vs 2025
    comparativoAnos: protectedProcedure
      .query(async ({ ctx }) => {
        const vendedor = await db.getVendedorByEmail(ctx.user.email);
        if (!vendedor) throw new Error('Vendedor não encontrado');

        const metricas = await db.getMetricasByVendedor(vendedor.id);
        const metricasComDados = metricas.filter(m => m.status === 'com_dados');

        // Separa por ano
        const dados2024 = metricasComDados.filter(m => m.mes.endsWith('/2024'));
        const dados2025 = metricasComDados.filter(m => m.mes.endsWith('/2025'));

        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

        const comparativo = meses.map(mesNome => {
          const metrica2024 = dados2024.find(m => m.mes === `${mesNome}/2024`);
          const metrica2025 = dados2025.find(m => m.mes === `${mesNome}/2025`);

          const vendas2024 = metrica2024 ? db.centavosParaReais(metrica2024.totalVendas) : 0;
          const vendas2025 = metrica2025 ? db.centavosParaReais(metrica2025.totalVendas) : 0;
          const receita2024 = metrica2024 ? db.centavosParaReais(metrica2024.totalReceita) : 0;
          const receita2025 = metrica2025 ? db.centavosParaReais(metrica2025.totalReceita) : 0;

          let variacaoVendas = 0;
          let variacaoReceita = 0;
          if (vendas2024 > 0) {
            variacaoVendas = ((vendas2025 - vendas2024) / vendas2024) * 100;
          }
          if (receita2024 > 0) {
            variacaoReceita = ((receita2025 - receita2024) / receita2024) * 100;
          }

          return {
            mes: mesNome,
            vendas2024,
            vendas2025,
            receita2024,
            receita2025,
            variacaoVendas: variacaoVendas.toFixed(2),
            variacaoReceita: variacaoReceita.toFixed(2),
            temDados2024: !!metrica2024,
            temDados2025: !!metrica2025
          };
        }).filter(item => item.temDados2024 || item.temDados2025); // Só meses com dados

        return comparativo;
      }),

    // Buscar metas trimestrais do vendedor
    minhasMetas: protectedProcedure
      .query(async ({ ctx }) => {
        const vendedor = await db.getVendedorByEmail(ctx.user.email);
        if (!vendedor) throw new Error('Vendedor não encontrado');

        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error('Database não disponível');

        const { metasTrimestrais } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');

        // Busca todas as metas do vendedor
        const metas = await dbInstance
          .select()
          .from(metasTrimestrais)
          .where(eq(metasTrimestrais.vendedorId, vendedor.id));

        // Ordena: Meta Trimestral 1 primeiro (atual), depois as outras
        const metasOrdenadas = metas.sort((a, b) => {
          if (a.trimestre === 'Meta Trimestral 1') return -1;
          if (b.trimestre === 'Meta Trimestral 1') return 1;
          return b.trimestre.localeCompare(a.trimestre);
        });

        // Busca métricas do vendedor para calcular progresso
        const metricas = await db.getMetricasByVendedor(vendedor.id);

        // Busca métricas de TODOS os vendedores para calcular progresso da agência
        const todosVendedores = await db.getAllVendedores();
        const todasMetricas: any[] = [];
        for (const v of todosVendedores) {
          const m = await db.getMetricasByVendedor(v.id);
          todasMetricas.push(...m);
        }

        // Mapeia meses de cada trimestre
        const mesesPorTrimestre: Record<string, string[]> = {
          'Meta Trimestral 1': ['Dezembro/2025', 'Janeiro/2026', 'Fevereiro/2026'],
          'Meta Trimestral 4': ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'],
        };

        return metasOrdenadas.map(m => {
          // Calcula vendas do trimestre (vendedor individual)
          const mesesTrimestre = mesesPorTrimestre[m.trimestre] || [];
          const metricasTrimestre = metricas.filter(met => mesesTrimestre.includes(met.mes));
          const vendidoCentavos = metricasTrimestre.reduce((acc, met) => acc + (met.totalVendas || 0), 0);
          const vendido = db.centavosParaReais(vendidoCentavos);
          const meta = db.centavosParaReais(m.metaTrimestral);
          const falta = Math.max(0, meta - vendido);
          const percentual = meta > 0 ? ((vendido / meta) * 100).toFixed(2) : '0.00';

          // Calcula vendas do trimestre (equipe toda)
          const metricasTrimestreEquipe = todasMetricas.filter(met => mesesTrimestre.includes(met.mes));
          const vendidoEquipeCentavos = metricasTrimestreEquipe.reduce((acc, met) => acc + (met.totalVendas || 0), 0);
          const vendidoEquipe = db.centavosParaReais(vendidoEquipeCentavos);
          const metaAgenciaValor = m.metaAgencia ? db.centavosParaReais(m.metaAgencia) : 0;
          const faltaEquipe = Math.max(0, metaAgenciaValor - vendidoEquipe);
          const percentualEquipe = metaAgenciaValor > 0 ? ((vendidoEquipe / metaAgenciaValor) * 100).toFixed(2) : '0.00';

          return {
            trimestre: m.trimestre,
            meta,
            superMeta: db.centavosParaReais(m.superMeta),
            bonusMeta: db.centavosParaReais(m.bonusMeta),
            bonusSuperMeta: db.centavosParaReais(m.bonusSuperMeta),
            metaAgencia: metaAgenciaValor,
            // Indicadores de progresso (individual)
            vendido,
            falta,
            percentual,
            // Indicadores de progresso (equipe)
            vendidoEquipe,
            faltaEquipe,
            percentualEquipe
          };
        });
      }),

    // Top destinos do vendedor
    topDestinos: protectedProcedure
      .input(z.object({
        limit: z.number().default(10),
        ano: z.number().optional()
      }).optional())
      .query(async ({ ctx, input }) => {
        const vendedor = await db.getVendedorByEmail(ctx.user.email);
        if (!vendedor) throw new Error('Vendedor não encontrado');

        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error('Database não disponível');

        const { vendasDiarias } = await import('../drizzle/schema');
        const { eq, and } = await import('drizzle-orm');

        // Busca vendas do vendedor
        let query = dbInstance
          .select()
          .from(vendasDiarias)
          .where(eq(vendasDiarias.vendedorId, vendedor.id));

        let vendas = await query;

        // Filtra por ano se fornecido
        if (input?.ano) {
          vendas = vendas.filter(v => v.ano === input.ano);
        }

        // Agrupa por destino
        const destinosMap = new Map<string, { vendas: number; valor: number }>();
        
        vendas.forEach(venda => {
          const destino = venda.destino || 'Não informado';
          const atual = destinosMap.get(destino) || { vendas: 0, valor: 0 };
          destinosMap.set(destino, {
            vendas: atual.vendas + 1,
            valor: atual.valor + venda.valorTotal
          });
        });

        // Converte para array e ordena por valor
        const topDestinos = Array.from(destinosMap.entries())
          .map(([destino, dados]) => ({
            destino,
            quantidadeVendas: dados.vendas,
            valorTotal: db.centavosParaReais(dados.valor)
          }))
          .sort((a, b) => b.valorTotal - a.valorTotal)
          .slice(0, input?.limit || 10);

        return topDestinos;
      }),
  }),

  // Router de apresentação de resultados (usa mesma lógica do metasTrimestraisAdmin)
  apresentacao: router({
    resultados: publicProcedure.query(async () => {
      const vendedores = await db.getAllVendedores();
      const metas = await db.getAllMetasTrimestrais();
      
      // === BLACK FRIDAY (Novembro/2025) ===
      let totalVendidoNovembro = 0;
      let totalReceitaNovembro = 0;
      
      for (const vendedor of vendedores) {
        const metricas = await db.getMetricasByVendedor(vendedor.id);
        const metricaNovembro = metricas.find(m => m.mes === 'Novembro/2025' && m.status === 'com_dados');
        
        if (metricaNovembro) {
          totalVendidoNovembro += metricaNovembro.totalVendas;
          totalReceitaNovembro += metricaNovembro.totalReceita;
        }
      }
      
      const percentualReceitaNovembro = totalVendidoNovembro > 0 ? (totalReceitaNovembro / totalVendidoNovembro) * 100 : 0;
      
      // === META TRIMESTRAL 4 (Set-Out-Nov/2025) ===
      const mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
      const metasTrimestre4 = metas.filter(m => m.trimestre === 'Meta Trimestral 4');
      
      let metaTotal = 0;
      let vendidoTotal = 0;
      let bateramMeta = 0;
      let faixa80_99 = 0;
      let faixa60_79 = 0;
      let abaixo60 = 0;
      let somaPercentuais = 0;
      let vendedoresBonificados = 0;
      
      for (const meta of metasTrimestre4) {
        const vendedor = vendedores.find(v => v.id === meta.vendedorId);
        if (!vendedor) continue;
        
        const metricas = await db.getMetricasByVendedor(vendedor.id);
        const metricasTrimestre = metricas.filter(m => 
          mesesTrimestre.includes(m.mes) && m.status === 'com_dados'
        );
        
        const totalVendido = metricasTrimestre.reduce((sum, m) => sum + m.totalVendas, 0);
        const percentual = meta.metaTrimestral > 0 ? (totalVendido / meta.metaTrimestral) * 100 : 0;
        
        metaTotal += meta.metaTrimestral;
        vendidoTotal += totalVendido;
        somaPercentuais += percentual;
        
        if (percentual >= 96) {
          bateramMeta++;
          vendedoresBonificados++;
        } else if (percentual >= 80) {
          faixa80_99++;
          vendedoresBonificados++;
        } else if (percentual >= 60) {
          faixa60_79++;
          vendedoresBonificados++;
        } else {
          abaixo60++;
        }
      }
      
      const percentualMedio = metasTrimestre4.length > 0 ? somaPercentuais / metasTrimestre4.length : 0;
      const metaAgencia = metasTrimestre4[0]?.metaAgencia || 0;
      
      return {
        blackFriday: {
          totalVendido: db.centavosParaReais(totalVendidoNovembro),
          totalReceita: db.centavosParaReais(totalReceitaNovembro),
          percentualReceita: parseFloat(percentualReceitaNovembro.toFixed(2)),
        },
        metaTrimestral: {
          metaTotal: db.centavosParaReais(metaTotal),
          vendidoTotal: db.centavosParaReais(vendidoTotal),
          percentualMedio: parseFloat(percentualMedio.toFixed(2)),
          bateramMeta,
          faixa80_99,
          faixa60_79,
          abaixo60,
          totalVendedores: metasTrimestre4.length,
          metaAgencia: db.centavosParaReais(metaAgencia),
        },
        bonificacao: {
          total: 44400,
          vendedoresBonificados,
        },
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
