/**
 * Módulo de integração com Google Calendar
 * Importa viagens futuras dos próximos 365 dias e organiza em 3 períodos:
 * - Próximos 30 dias
 * - 30 a 90 dias
 * - 90 a 120 dias
 */

import { google } from 'googleapis';
import { ENV } from './_core/env';

export interface ViagemCalendario {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: Date;
  dataFim?: Date;
  local?: string;
  periodo: 'proximos_30' | 'de_30_a_90' | 'de_90_a_120';
  diasParaViagem: number;
}

export interface ResultadoSincronizacao {
  sucesso: boolean;
  totalImportadas: number;
  proximos30Dias: ViagemCalendario[];
  de30a90Dias: ViagemCalendario[];
  de90a120Dias: ViagemCalendario[];
  erros: string[];
  timestampSincronizacao: Date;
}

/**
 * Classifica uma viagem em um dos três períodos com base na data de início
 */
function classificarPeriodo(dataInicio: Date, agora: Date): 'proximos_30' | 'de_30_a_90' | 'de_90_a_120' | null {
  const diffMs = dataInicio.getTime() - agora.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias >= 0 && diffDias <= 30) return 'proximos_30';
  if (diffDias > 30 && diffDias <= 90) return 'de_30_a_90';
  if (diffDias > 90 && diffDias <= 120) return 'de_90_a_120';
  return null;
}

/**
 * Verifica se um evento do Google Calendar é uma viagem
 * Filtra eventos que contêm palavras-chave relacionadas a viagens
 */
function isEventoViagem(evento: any): boolean {
  const titulo = (evento.summary || '').toLowerCase();
  const descricao = (evento.description || '').toLowerCase();
  const local = (evento.location || '').toLowerCase();
  
  const palavrasChave = [
    'viagem', 'voo', 'hotel', 'hospedagem', 'passeio', 'excursão',
    'cruzeiro', 'pacote', 'tour', 'transfer', 'embarque', 'desembarque',
    'check-in', 'checkout', 'reserva', 'booking', 'travel', 'trip',
    'flight', 'cruise', 'resort', 'pousada', 'destino'
  ];
  
  return palavrasChave.some(palavra => 
    titulo.includes(palavra) || 
    descricao.includes(palavra) || 
    local.includes(palavra)
  );
}

/**
 * Sincroniza eventos do Google Calendar usando o token de acesso fornecido
 */
export async function sincronizarGoogleCalendar(accessToken: string): Promise<ResultadoSincronizacao> {
  const agora = new Date();
  const em365Dias = new Date(agora.getTime() + 365 * 24 * 60 * 60 * 1000);
  
  const resultado: ResultadoSincronizacao = {
    sucesso: false,
    totalImportadas: 0,
    proximos30Dias: [],
    de30a90Dias: [],
    de90a120Dias: [],
    erros: [],
    timestampSincronizacao: agora,
  };

  try {
    // Configurar cliente OAuth2 com o token de acesso
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Buscar todos os eventos com paginação
    let todosEventos: any[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: agora.toISOString(),
        timeMax: em365Dias.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
        pageToken: pageToken,
      });

      const eventos = response.data.items || [];
      todosEventos = todosEventos.concat(eventos);
      pageToken = response.data.nextPageToken || undefined;

    } while (pageToken);

    console.log(`[Google Calendar] Total de eventos encontrados: ${todosEventos.length}`);

    // Processar cada evento
    for (const evento of todosEventos) {
      try {
        // Verificar se o evento tem data de início
        const dataInicioStr = evento.start?.dateTime || evento.start?.date;
        if (!dataInicioStr) continue;

        const dataInicio = new Date(dataInicioStr);
        const dataFimStr = evento.end?.dateTime || evento.end?.date;
        const dataFim = dataFimStr ? new Date(dataFimStr) : undefined;

        // Classificar no período correto
        const periodo = classificarPeriodo(dataInicio, agora);
        if (!periodo) continue;

        // Calcular dias para a viagem
        const diffMs = dataInicio.getTime() - agora.getTime();
        const diasParaViagem = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const viagem: ViagemCalendario = {
          id: evento.id || `evento_${Date.now()}`,
          titulo: evento.summary || 'Evento sem título',
          descricao: evento.description || undefined,
          dataInicio,
          dataFim,
          local: evento.location || undefined,
          periodo,
          diasParaViagem,
        };

        // Adicionar ao período correspondente
        if (periodo === 'proximos_30') {
          resultado.proximos30Dias.push(viagem);
        } else if (periodo === 'de_30_a_90') {
          resultado.de30a90Dias.push(viagem);
        } else if (periodo === 'de_90_a_120') {
          resultado.de90a120Dias.push(viagem);
        }

        resultado.totalImportadas++;
      } catch (erroEvento) {
        const msg = erroEvento instanceof Error ? erroEvento.message : 'Erro desconhecido';
        resultado.erros.push(`Erro ao processar evento ${evento.id}: ${msg}`);
      }
    }

    resultado.sucesso = true;
    console.log(`[Google Calendar] Sincronização concluída:`);
    console.log(`  - Próximos 30 dias: ${resultado.proximos30Dias.length} viagens`);
    console.log(`  - 30 a 90 dias: ${resultado.de30a90Dias.length} viagens`);
    console.log(`  - 90 a 120 dias: ${resultado.de90a120Dias.length} viagens`);
    console.log(`  - Total: ${resultado.totalImportadas} viagens`);

  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : 'Erro desconhecido';
    resultado.erros.push(`Erro na sincronização: ${msg}`);
    console.error('[Google Calendar] Erro na sincronização:', erro);
  }

  return resultado;
}

/**
 * Obtém a URL de autorização OAuth para o Google Calendar
 */
export function obterUrlAutorizacaoCalendar(redirectUri: string, state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    ...(state ? { state } : {}),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
