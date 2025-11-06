import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { extrairMetricasAba, extrairDadosVendedor, gerarListaMeses } from "./sheetsExtractor";

// Configuração dos vendedores
const VENDEDORES_CONFIG = [
  { nome: 'Rafael', sheetId: '1ZJz0MgOHLkYYNW5eWZmOAU797KXQPbwGmp8YnWl4NPo', dataEntrada: new Date('2023-01-01') },
  { nome: 'Gabriel', sheetId: '1jVIANOJ01UCat7Y8thFXkWZyhiv5Jzty-_9yK-xeKms', dataEntrada: new Date('2023-01-01') },
  { nome: 'Francine', sheetId: '1PpzDxn6eM3LKwtJTchD6qVbbyUkAeDnA6hNy0gmrx10', dataEntrada: new Date('2023-01-01') },
  { nome: 'Mauro', sheetId: '19CNbM8qmkDFi-TxPDH8xaKeK0xOngcnDR2zOYH-LFSk', dataEntrada: new Date('2023-01-01') },
  { nome: 'Luana', sheetId: '1tvfL-1S1kiAAyvFoKJzznW_RWYpLb6PAt-KiIF6vLjA', dataEntrada: new Date('2023-01-01') },
  { nome: 'Nathaly', sheetId: '1jVIANOJ01UCat7Y8thFXkWZyhiv5Jzty-_9yK-xeKms', dataEntrada: new Date('2023-01-01') },
  { nome: 'Danilo', sheetId: '1Yu3qKph4F59HnzMnIVFkTlB_Qf-LHTa2eU8ny-erN28', dataEntrada: new Date('2024-01-01') },
  { nome: 'Pedro', sheetId: '1BAVNbSUX9WUEAwnQ1zPaiBMXupBnrDOEdjYVjeMy8tE', dataEntrada: new Date('2024-01-01') },
  { nome: 'Leonardo', sheetId: '1xLkrLj7SEUa9gexhf-XgCBjZCI7XifchCek3ZBLxMZY', dataEntrada: new Date('2024-01-01') },
  { nome: 'Yasmin', sheetId: '1UeOUxTlb7IWIhllK87Bb73Wx7F1PfbwPKJSwPCzMu9U', dataEntrada: new Date('2024-01-01') },
  { nome: 'Lucas', sheetId: '1Bd53lZyS2aOUmIS4gSY_PtfuYFu-G_aUgXeH8HPEVZk', dataEntrada: new Date('2024-01-01') },
  { nome: 'Isabelle', sheetId: '1xpngLR6KJZSAJTKqmDvev2skDX_SQOX9ScNENk2pZPg', dataEntrada: new Date('2024-01-01') },
  { nome: 'Andrios', sheetId: '1srU7o9d3HInp0o6oHZhuVOVGZOVHSC14Kp68lFvbJ7s', dataEntrada: new Date('2024-01-01') },
  { nome: 'Felipe', sheetId: '1lQFpUKdMbYA4l2blzaHQRGUeh1gX9_b6Qsj_hmXA42M', dataEntrada: new Date('2024-01-01') }
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

    // Inicializa vendedores no banco (executar uma vez)
    inicializar: protectedProcedure.mutation(async () => {
      for (const config of VENDEDORES_CONFIG) {
        await db.upsertVendedor({
          nome: config.nome,
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
  }),

  metricas: router({
    // Resumo geral de todos os vendedores
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
      const meses = gerarListaMeses();
      
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
  }),
});

export type AppRouter = typeof appRouter;
