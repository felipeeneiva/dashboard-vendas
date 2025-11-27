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
  { nome: 'Gabriel', sheetId: '1Fp7Y6ytwk7SLZAEZkSw-gAU2nCWVK9M1SyK0enbjQfY', dataEntrada: new Date('2024-01-01') },
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
        const vendedor = await db.getVendedorByEmail(ctx.user.email);
        
        if (!vendedor) {
          throw new Error('Vendedor não encontrado para este email');
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
            comissao: db.centavosParaReais(totalComissao)
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
  }),
});

export type AppRouter = typeof appRouter;
