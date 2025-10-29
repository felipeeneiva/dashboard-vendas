import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Target, TrendingUp, AlertCircle, CheckCircle2, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useLocation } from "wouter";

export default function MetasTrimestral() {
  const [, setLocation] = useLocation();

  const { data, isLoading } = trpc.metas.trimestral.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Erro ao carregar dados</p>
      </div>
    );
  }

  const formatarMoeda = (centavos: number) => {
    return (centavos / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
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
          
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Metas Trimestral
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {data.periodo}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Meta Geral */}
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Meta Geral do Trimestre</CardTitle>
            </div>
            <CardDescription>Objetivo: {formatarMoeda(data.metaGeral)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Barra de Progresso */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Progresso Geral
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {data.percentualGeralAtingido.toFixed(2)}%
                  </span>
                </div>
                <div className="relative h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(data.percentualGeralAtingido, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white mix-blend-difference">
                      {formatarMoeda(data.totalVendido)} de {formatarMoeda(data.metaGeral)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Vendido</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatarMoeda(data.totalVendido)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">% Atingido</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {data.percentualGeralAtingido.toFixed(2)}%
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Falta Atingir</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {data.percentualGeralFaltante.toFixed(2)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatarMoeda(data.metaGeral - data.totalVendido)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-600" />
              <CardTitle>Contribuição para Meta Geral</CardTitle>
            </div>
            <CardDescription>
              Participação de cada vendedor no total de vendas do trimestre
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.totalVendido > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.vendedores
                        .filter(item => item.totalVendido > 0)
                        .map(item => ({
                          name: item.vendedor.nome,
                          value: item.totalVendido,
                          percentual: ((item.totalVendido / data.totalVendido) * 100).toFixed(2)
                        }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.percentual}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.vendedores.map((_, index) => {
                      const colors = [
                        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                        '#6366f1', '#f97316', '#14b8a6', '#a855f7', '#ef4444',
                        '#06b6d4', '#84cc16', '#f43f5e', '#8b5cf6'
                      ];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatarMoeda(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-slate-500">
                <p>Nenhum dado de vendas disponível para o período</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Vendedor</CardTitle>
            <CardDescription>
              Acompanhamento individual das metas do trimestre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Vendedor
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Meta
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Vendido
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      % Atingido
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      % Falta
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.vendedores
                    .sort((a, b) => b.percentualAtingido - a.percentualAtingido)
                    .map((item, index) => (
                      <tr 
                        key={item.vendedor.id}
                        className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-4 px-4">
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
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">
                          {formatarMoeda(item.metaVendedor)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatarMoeda(item.totalVendido)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {item.percentualAtingido.toFixed(2)}%
                            </span>
                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  item.status === 'atingida' ? 'bg-green-500' :
                                  item.status === 'proximo' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(item.percentualAtingido, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-orange-600 dark:text-orange-400">
                          {item.percentualFaltante.toFixed(2)}%
                        </td>
                        <td className="py-4 px-4 text-center">
                          {item.status === 'atingida' ? (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                              <CheckCircle2 className="h-3 w-3" />
                              Meta Atingida
                            </div>
                          ) : item.status === 'proximo' ? (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold">
                              <TrendingUp className="h-3 w-3" />
                              Próximo
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold">
                              <AlertCircle className="h-3 w-3" />
                              Distante
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
