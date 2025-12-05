import { router, publicProcedure } from "./_core/trpc";
import * as db from "./db";

/**
 * Router exclusivo para apresentação de resultados
 * Reutiliza a lógica do metasTrimestraisAdmin mas sem expor nomes de vendedores
 */
export const apresentacaoRouter = router({
  resultados: publicProcedure.query(async () => {
    const vendedores = await db.getAllVendedores();
    const metas = await db.getAllMetasTrimestrais();
    
    // === BLACK FRIDAY (Novembro/2025) ===
    let totalVendidoNovembro = 0;
    let totalVendasNovembro = 0;
    
    for (const vendedor of vendedores) {
      const metricas = await db.getMetricasByVendedor(vendedor.id);
      const metricaNovembro = metricas.find(m => m.mes === 'Novembro/2025' && m.status === 'com_dados');
      
      if (metricaNovembro) {
        totalVendidoNovembro += metricaNovembro.totalVendas;
        totalVendasNovembro += 1; // Conta como 1 vendedor que vendeu
      }
    }
    
    const ticketMedioNovembro = totalVendasNovembro > 0 ? totalVendidoNovembro / totalVendasNovembro : 0;
    
    // === META TRIMESTRAL 4 (Set-Out-Nov/2025) ===
    const mesesTrimestre = ['Setembro/2025', 'Outubro/2025', 'Novembro/2025'];
    const metasTrimestre4 = metas.filter(m => m.trimestre === 'Meta Trimestral 4');
    
    let metaTotal = 0;
    let vendidoTotal = 0;
    let bateramMeta = 0; // >= 100%
    let faixa80_99 = 0; // 80% a 99%
    let faixa60_79 = 0; // 60% a 79%
    let abaixo60 = 0; // < 60%
    let somaPercentuais = 0;
    let vendedoresBonificados = 0;
    
    for (const meta of metasTrimestre4) {
      const vendedor = vendedores.find(v => v.id === meta.vendedorId);
      if (!vendedor) continue;
      
      // Busca vendas do trimestre
      const metricas = await db.getMetricasByVendedor(vendedor.id);
      const metricasTrimestre = metricas.filter(m => 
        mesesTrimestre.includes(m.mes) && m.status === 'com_dados'
      );
      
      const totalVendido = metricasTrimestre.reduce((sum, m) => sum + m.totalVendas, 0);
      const percentual = meta.metaTrimestral > 0 ? (totalVendido / meta.metaTrimestral) * 100 : 0;
      
      metaTotal += meta.metaTrimestral;
      vendidoTotal += totalVendido;
      somaPercentuais += percentual;
      
      // Classificação por faixa
      if (percentual >= 96) { // Rafael e Náthaly (considerados 100%)
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
    
    // Pega meta da agência do primeiro registro
    const metaAgencia = metasTrimestre4[0]?.metaAgencia || 0;
    
    return {
      blackFriday: {
        totalVendido: db.centavosParaReais(totalVendidoNovembro),
        ticketMedio: db.centavosParaReais(ticketMedioNovembro),
        totalVendas: totalVendasNovembro,
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
        total: 44400, // Valor calculado: R$ 44.400,00
        vendedoresBonificados,
      },
    };
  }),
});
