import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Calendar, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useLocation } from "wouter";

export default function ProgressoSemanal() {
  const [, setLocation] = useLocation();

  const { data, isLoading } = trpc.metas.progressoSemanal.useQuery();

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
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
  };

  // Prepara dados para o gráfico
  const dadosGrafico = data.semanas.map((semana: any) => ({
    nome: `Sem ${semana.numero}`,
    vendas: semana.vendas / 100, // Converte centavos para reais
    meta: data.metaGeral / data.semanas.length / 100,
    acumulado: semana.acumulado / 100
  }));

  // Calcula variação da semana atual vs anterior
  const semanaAtualIndex = data.semanaAtual - 1;
  const semanaAnteriorIndex = semanaAtualIndex - 1;
  const variacaoSemanal = semanaAnteriorIndex >= 0 && semanaAtualIndex < data.semanas.length
    ? ((data.semanas[semanaAtualIndex].vendas - data.semanas[semanaAnteriorIndex].vendas) / data.semanas[semanaAnteriorIndex].vendas) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/metas-trimestral')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Metas
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Progresso Semanal - Funil de Vendas
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Acompanhamento semanal para reuniões de segunda-feira
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semana Atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                Semana {data.semanaAtual}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                de {data.semanas.length} semanas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Meta Geral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatarMoeda(data.metaGeral)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Trimestre Set-Nov/2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Acumulado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatarMoeda(data.totalAcumulado)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {data.percentualAtingido.toFixed(1)}% da meta
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                {data.vaiAtingirMeta ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                )}
                Projeção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${data.vaiAtingirMeta ? 'text-green-600' : 'text-orange-600'}`}>
                {formatarMoeda(data.projecaoFinal)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {data.vaiAtingirMeta ? 'Meta será atingida! 🎉' : 'Precisa acelerar 🚀'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Funil */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Funil de Vendas Semanal</CardTitle>
            <CardDescription>
              Progresso acumulado semana a semana comparado com a meta proporcional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatarMoeda(value * 100)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="acumulado" 
                    name="Vendas Acumuladas" 
                    fill="#3b82f6"
                  >
                    {dadosGrafico.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === semanaAtualIndex ? '#10b981' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="meta" 
                    name="Meta Proporcional" 
                    fill="#94a3b8" 
                    fillOpacity={0.5}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Semana</CardTitle>
            <CardDescription>
              Análise detalhada do progresso semana a semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Semana
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Período
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Vendas da Semana
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Acumulado
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      % da Meta
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.semanas.map((semana: any, index: number) => {
                    const isAtual = index === semanaAtualIndex;
                    const isFutura = index > semanaAtualIndex;
                    
                    return (
                      <tr 
                        key={semana.numero}
                        className={`border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isAtual ? 'bg-green-50 dark:bg-green-900/20' : ''
                        } ${isFutura ? 'opacity-50' : ''}`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {isAtual && (
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              Semana {semana.numero}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">
                          {formatarData(semana.inicio)} - {formatarData(semana.fim)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-sm text-slate-700 dark:text-slate-300">
                          {formatarMoeda(semana.vendas)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatarMoeda(semana.acumulado)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {semana.percentualMeta.toFixed(1)}%
                            </span>
                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  semana.percentualMeta >= 100 ? 'bg-green-500' :
                                  semana.percentualMeta >= 80 ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(semana.percentualMeta, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {isAtual ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                              <Calendar className="h-3 w-3" />
                              Atual
                            </span>
                          ) : isFutura ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                              Futura
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                              <CheckCircle className="h-3 w-3" />
                              Concluída
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Card de Comparação Semanal */}
        {semanaAnteriorIndex >= 0 && semanaAtualIndex < data.semanas.length && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Comparação: Semana Atual vs Anterior</CardTitle>
              <CardDescription>
                Análise de performance entre as últimas duas semanas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Semana Anterior ({data.semanas[semanaAnteriorIndex].numero})
                  </p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    {formatarMoeda(data.semanas[semanaAnteriorIndex].vendas)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Semana Atual ({data.semanas[semanaAtualIndex].numero})
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatarMoeda(data.semanas[semanaAtualIndex].vendas)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Variação
                  </p>
                  <div className="flex items-center gap-2">
                    {variacaoSemanal >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                    <p className={`text-2xl font-bold ${variacaoSemanal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variacaoSemanal >= 0 ? '+' : ''}{variacaoSemanal.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
