import cron from 'node-cron';
import * as db from './db';
import { extrairDadosVendedor } from './sheetsExtractor';

/**
 * Agendador de tarefas automáticas
 * - Atualiza dados das planilhas diariamente às 6h
 */

// Gera lista de meses para 2024 e 2025
function gerarListaMeses(): string[] {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const lista: string[] = [];
  
  // 2024
  for (const mes of meses) {
    lista.push(`${mes}/2024`);
  }
  
  // 2025
  for (const mes of meses) {
    lista.push(`${mes}/2025`);
  }
  
  return lista;
}

// Função para atualizar dados de todos os vendedores
async function atualizarTodosOsDados() {
  console.log('[Scheduler] Iniciando atualização automática...');
  
  try {
    const vendedores = await db.getAllVendedores();
    const meses = gerarListaMeses();
    
    let vendedoresAtualizados = 0;
    let totalRegistros = 0;
    
    for (const vendedor of vendedores) {
      try {
        console.log(`[Scheduler] Extraindo dados de ${vendedor.nome}...`);
        
        const resultados = await extrairDadosVendedor(vendedor.sheetId, meses);
        
        for (const resultado of resultados) {
          try {
            if (resultado.metricas) {
              await db.upsertMetrica({
                vendedorId: vendedor.id,
                mes: resultado.mes,
                dataExtracao: new Date(),
                totalVendas: resultado.metricas.totalVendas,
                totalReceita: resultado.metricas.totalReceita,
                comissaoTotal: resultado.metricas.comissaoTotal,
                percentualReceita: resultado.metricas.percentualReceita,
              });
              
              totalRegistros++;
            }
          } catch (error) {
            console.error(`[Scheduler] Erro ao salvar ${resultado.mes} de ${vendedor.nome}:`, error);
          }
        }
        
        vendedoresAtualizados++;
      } catch (error) {
        console.error(`[Scheduler] Erro ao processar vendedor ${vendedor.nome}:`, error);
      }
    }
    
    // Registra atualização
    await db.registrarAtualizacao({
      tipo: 'automatica',
      status: 'sucesso',
      vendedoresAtualizados,
      totalRegistros
    });
    
    console.log(`[Scheduler] Atualização concluída! ${vendedoresAtualizados} vendedores, ${totalRegistros} registros.`);
  } catch (error) {
    console.error('[Scheduler] Erro na atualização automática:', error);
  }
}

// Agenda atualização diária às 6h (horário de Brasília: GMT-3)
// Cron: 0 6 * * * = todo dia às 6:00
export function iniciarAgendador() {
  console.log('[Scheduler] Agendador iniciado. Atualização diária às 6h.');
  
  // Atualização diária às 6h
  cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduler] Executando atualização agendada...');
    await atualizarTodosOsDados();
  }, {
    timezone: "America/Sao_Paulo"
  });
  
  // Para testes: descomente para executar a cada minuto
  // cron.schedule('* * * * *', async () => {
  //   console.log('[Scheduler] Teste: Executando atualização...');
  //   await atualizarTodosOsDados();
  // });
}
