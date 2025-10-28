import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Trophy, BarChart3, FileText, Loader2, Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Analises() {
  const [, setLocation] = useLocation();
  const [mesFilter, setMesFilter] = useState<string>("");

  // Busca dados
  const { data: melhorVendedor, isLoading: loadingMelhor } = trpc.analises.melhorVendedor.useQuery({ 
    mes: mesFilter || undefined 
  });
  const { data: grafico, isLoading: loadingGrafico } = trpc.analises.graficoComparativo.useQuery();
  const { data: resumo, isLoading: loadingResumo } = trpc.analises.resumoExecutivo.useQuery();

  const isLoading = loadingMelhor || loadingGrafico || loadingResumo;

  // Função para exportar dados em CSV
  const exportarCSV = () => {
    if (!grafico) return;

    const csv = [
      ['Vendedor', 'Total Vendas', 'Total Receita', 'Comissão Total'],
      ...grafico.map(item => [
        item.vendedor,
        item.vendas.toFixed(2),
        item.receita.toFixed(2),
        item.comissao.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Dados exportados com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Análises e Relatórios
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Insights e visualizações dos dados de vendas
              </p>
            </div>
            
            <Button onClick={exportarCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 1. Melhor Vendedor */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle>Vendedor com Melhor Desempenho</CardTitle>
            </div>
            <CardDescription>
              Ranking de vendedores por receita gerada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {melhorVendedor?.melhor && (
              <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {melhorVendedor.melhor.vendedor.nome}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Melhor desempenho - {melhorVendedor.periodo}
                    </p>
                    <div className="mt-2 flex gap-6">
                      <div>
                        <p className="text-xs text-slate-500">Receita Total</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {melhorVendedor.melhor.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Vendas</p>
                        <p className="text-lg font-bold text-blue-600">
                          R$ {melhorVendedor.melhor.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Comissão</p>
                        <p className="text-lg font-bold text-purple-600">
                          R$ {melhorVendedor.melhor.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top 5 */}
            <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Top 5 Vendedores</h4>
            <div className="space-y-2">
              {melhorVendedor?.top5.map((item, index) => (
                <div
                  key={item.vendedor.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {item.vendedor.nome}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                      R$ {item.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.meses} meses
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2. Resumo Executivo */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <CardTitle>Resumo Executivo</CardTitle>
            </div>
            <CardDescription>
              Principais indicadores e estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumo && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Vendas</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    R$ {resumo.totais.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Receita</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    R$ {resumo.totais.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Comissões</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    R$ {resumo.totais.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Vendedores Ativos</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {resumo.vendedoresAtivos}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Média de Receita</p>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    R$ {resumo.mediaReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Registros com Dados</p>
                  <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                    {resumo.mesesComDados}
                  </p>
                </div>
              </div>
            )}

            {resumo?.melhorVendedor && resumo?.piorVendedor && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Maior Receita</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {resumo.melhorVendedor.nome}
                  </p>
                  <p className="text-sm font-mono text-green-600">
                    R$ {resumo.melhorVendedor.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Menor Receita</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {resumo.piorVendedor.nome}
                  </p>
                  <p className="text-sm font-mono text-red-600">
                    R$ {resumo.piorVendedor.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Gráfico de Barras */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <CardTitle>Comparativo de Desempenho</CardTitle>
            </div>
            <CardDescription>
              Gráfico de barras comparando vendas, receita e comissão
            </CardDescription>
          </CardHeader>
          <CardContent>
            {grafico && (
              <div className="space-y-4">
                {grafico.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                        {item.vendedor}
                      </span>
                      <span className="text-xs text-slate-500">
                        R$ {item.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    {/* Barra de Receita */}
                    <div className="relative h-8 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((item.receita / (grafico[0]?.receita || 1)) * 100, 100)}%` 
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-semibold text-white mix-blend-difference">
                          Receita
                        </span>
                      </div>
                    </div>

                    {/* Barra de Vendas */}
                    <div className="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((item.vendas / (grafico[0]?.vendas || 1)) * 100, 100)}%` 
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          Vendas: R$ {item.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Comissão */}
                    <div className="relative h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((item.comissao / (grafico[0]?.comissao || 1)) * 100, 100)}%` 
                        }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium text-white mix-blend-difference">
                          Comissão: R$ {item.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
