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
 * Extrai métricas de uma aba específica da planilha
 */
export async function extrairMetricasAba(
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
