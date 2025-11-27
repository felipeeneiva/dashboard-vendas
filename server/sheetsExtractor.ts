/**
 * Utilitário para extrair dados das planilhas do Google Sheets
 * Usa a API pública do Google Sheets (gviz/tq)
 */

import axios from 'axios';

export interface MetricasExtraidas {
  totalVendas: number;
  totalReceita: number;
  comissaoTotal: number;
  percentualReceita: number;
  encontrado: boolean;
}

/**
 * Limpa valor monetário brasileiro e retorna em centavos
 * Exemplo: "R$ 1.234,56" -> 123456 (centavos)
 */
function limparValorMonetario(valor: string): number {
  if (!valor || valor.trim() === '' || valor.trim() === '-') {
    return 0;
  }
  
  const valorLimpo = String(valor)
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '') // Remove separador de milhar
    .replace(/,/g, '.') // Substitui vírgula por ponto
    .trim();
  
  try {
    const reais = parseFloat(valorLimpo);
    // Converte para centavos (multiplica por 100)
    return Math.round(reais * 100);
  } catch {
    return 0;
  }
}

/**
 * Limpa percentual e converte para inteiro (multiplicado por 100)
 * Exemplo: "12,73%" -> 1273
 */
function limparPercentual(valor: string): number {
  if (!valor || valor.trim() === '' || valor.trim() === '-') {
    return 0;
  }
  
  const valorLimpo = String(valor)
    .replace(/%/g, '')
    .replace(/\s/g, '')
    .replace(/,/g, '.')
    .trim();
  
  try {
    const decimal = parseFloat(valorLimpo);
    return Math.round(decimal * 100); // Multiplica por 100
  } catch {
    return 0;
  }
}

/**
 * Função auxiliar que tenta extrair métricas de uma aba
 */
async function tentarExtrairAba(
  sheetId: string,
  nomeAba: string
): Promise<MetricasExtraidas | null> {
  try {
    // URL da API pública do Google Sheets
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:html&sheet=${encodeURIComponent(nomeAba)}`;
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (response.status !== 200) {
      return null;
    }
    
    const htmlContent = response.data;
    
    // Verifica se a aba existe
    if (!htmlContent || htmlContent.length < 100 || htmlContent.includes('error')) {
      return null;
    }
    
    // Inicializa métricas
    const metricas: MetricasExtraidas = {
      totalVendas: 0,
      totalReceita: 0,
      comissaoTotal: 0,
      percentualReceita: 0,
      encontrado: false
    };
    
    // Padrões de busca para as métricas
    const patterns = [
      { regex: /TOTAL DE VENDAS.*?R\$\s*([\d.,]+)/i, key: 'totalVendas', tipo: 'monetario' },
      { regex: /TOTAL DE RECEITA.*?R\$\s*([\d.,]+)/i, key: 'totalReceita', tipo: 'monetario' },
      { regex: /COMISSÃO TOTAL À RECEBER.*?R\$\s*([\d.,]+)/i, key: 'comissaoTotal', tipo: 'monetario' },
      { regex: /% GERADA EM RECEITA.*?([\d.,]+)%/i, key: 'percentualReceita', tipo: 'percentual' }
    ];
    
    // Busca cada métrica no HTML
    for (const pattern of patterns) {
      const match = htmlContent.match(pattern.regex);
      if (match && match[1]) {
        if (pattern.tipo === 'monetario') {
          const key = pattern.key as 'totalVendas' | 'totalReceita' | 'comissaoTotal';
          metricas[key] = limparValorMonetario(match[1]);
        } else if (pattern.tipo === 'percentual') {
          metricas.percentualReceita = limparPercentual(match[1]);
        }
        metricas.encontrado = true;
      }
    }
    
    // Se encontrou pelo menos uma métrica, retorna
    if (metricas.encontrado) {
      return metricas;
    }
    
    return null;
    
  } catch (error) {
    console.error(`Erro ao extrair métricas da aba "${nomeAba}":`, error);
    return null;
  }
}

/**
 * Extrai métricas de uma aba específica da planilha
 * Tenta primeiro com o formato original, depois com MAIÚSCULAS
 */
export async function extrairMetricasAba(
  sheetId: string,
  nomeAba: string
): Promise<MetricasExtraidas | null> {
  // Tenta primeiro com o formato original (Primeira letra maiúscula)
  let resultado = await tentarExtrairAba(sheetId, nomeAba);
  
  // Se não encontrar, tenta com MAIÚSCULAS
  if (!resultado || !resultado.encontrado) {
    const nomeAbaUpper = nomeAba.toUpperCase();
    resultado = await tentarExtrairAba(sheetId, nomeAbaUpper);
  }
  
  return resultado;
}

/**
 * Gera lista de meses de 2024 a 2025
 */
export function gerarListaMeses(): string[] {
  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const anos = [2024, 2025];
  const meses: string[] = [];
  
  for (const ano of anos) {
    for (const mes of mesesNomes) {
      meses.push(`${mes}/${ano}`);
    }
  }
  
  return meses;
}

/**
 * Extrai dados de todos os meses de um vendedor
 */
export async function extrairDadosVendedor(
  sheetId: string,
  meses?: string[]
): Promise<Array<{ mes: string; metricas: MetricasExtraidas | null }>> {
  const listaMeses = meses || gerarListaMeses();
  const resultados: Array<{ mes: string; metricas: MetricasExtraidas | null }> = [];
  
  for (const mes of listaMeses) {
    const metricas = await extrairMetricasAba(sheetId, mes);
    resultados.push({ mes, metricas });
    
    // Pequeno delay para não sobrecarregar a API do Google
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return resultados;
}

/**
 * Normaliza nome de operadora para agrupamento
 * Remove acentos, converte para minúsculas, remove espaços extras
 */
function normalizarNomeOperadora(nome: string): string {
  if (!nome || nome.trim() === '') {
    return 'sem_operadora';
  }
  
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
}

/**
 * Mapeia aliases comuns de operadoras para nomes padronizados
 */
const ALIASES_OPERADORAS: Record<string, string> = {
  'frt': 'frt consolidadora',
  'frt operadora': 'frt consolidadora',
  'hero': 'hero seguro',
  'mundo pro': 'mundo pro viagens',
  'machu picchu': 'machu picchu time',
};

/**
 * Aplica mapeamento de aliases para normalizar nomes
 */
function aplicarAliases(nomeNormalizado: string): string {
  return ALIASES_OPERADORAS[nomeNormalizado] || nomeNormalizado;
}

export interface DadosFornecedor {
  operadora: string; // Nome original
  operadoraNormalizada: string; // Nome normalizado para agrupamento
  tarifa: number; // Em centavos
  taxa: number; // Em centavos
  duTebOver: number; // Em centavos
  incentivo: number; // Em centavos
  valorTotal: number; // Em centavos
}

/**
 * Extrai dados de fornecedores de uma aba da planilha
 * Retorna array com dados de cada linha (venda)
 */
export async function extrairDadosFornecedores(
  sheetId: string,
  nomeAba: string
): Promise<DadosFornecedor[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:html&sheet=${encodeURIComponent(nomeAba)}`;
  
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const html = response.data;
    
    if (!html || html.length < 100) {
      return [];
    }
    
    const fornecedores: DadosFornecedor[] = [];
    
    // Regex para extrair linhas da tabela HTML
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    
    let rowMatch;
    let rowIndex = 0;
    
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      rowIndex++;
      
      // Pula primeiras 2 linhas (cabeçalho)
      if (rowIndex <= 2) {
        continue;
      }
      
      const rowHtml = rowMatch[1];
      const cells: string[] = [];
      
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        // Remove tags HTML e pega texto
        const cellText = cellMatch[1]
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, '')
          .trim();
        cells.push(cellText);
      }
      
      // Verifica se tem colunas suficientes
      if (cells.length < 20) {
        continue;
      }
      
      // Índices das colunas (baseado no mapeamento)
      const operadora = cells[12]; // M
      const tarifa = cells[14]; // O
      const taxa = cells[15]; // P
      const duTebOver = cells[17]; // R
      const incentivo = cells[18]; // S
      const valorTotal = cells[19]; // T
      
      if (!operadora || operadora.trim() === '') {
        continue; // Pula linhas sem operadora
      }
      
      // Normaliza nome da operadora
      const nomeNormalizado = normalizarNomeOperadora(operadora);
      const operadoraNormalizada = aplicarAliases(nomeNormalizado);
      
      fornecedores.push({
        operadora: operadora.trim(),
        operadoraNormalizada,
        tarifa: limparValorMonetario(tarifa),
        taxa: limparValorMonetario(taxa),
        duTebOver: limparValorMonetario(duTebOver),
        incentivo: limparValorMonetario(incentivo),
        valorTotal: limparValorMonetario(valorTotal),
      });
    }
    
    if (fornecedores.length > 0) {
      console.log(`[Fornecedores] Extraídos ${fornecedores.length} registros de ${nomeAba}`);
    }
    return fornecedores;
    
  } catch (error: any) {
    console.error(`[Fornecedores] Erro ao extrair ${nomeAba}:`, error.message);
    return [];
  }
}

/**
 * Extrai dados de fornecedores de todas as abas (meses) de um vendedor
 */
export async function extrairDadosFornecedoresVendedor(
  sheetId: string,
  meses?: string[]
): Promise<Map<string, DadosFornecedor[]>> {
  const mesesParaExtrair = meses || gerarListaMeses();
  const dadosPorMes = new Map<string, DadosFornecedor[]>();
  
  for (const mes of mesesParaExtrair) {
    const dados = await extrairDadosFornecedores(sheetId, mes);
    dadosPorMes.set(mes, dados);
    
    // Pequeno delay para não sobrecarregar a API do Google
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return dadosPorMes;
}
