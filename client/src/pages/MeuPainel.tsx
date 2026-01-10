import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, DollarSign, Percent, Target, MapPin, Calendar, Award, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl, APP_LOGO } from "@/const";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function MeuPainel() {
  const [, setLocation] = useLocation();
  const [vendedorToken, setVendedorToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    // Verifica se tem token JWT no localStorage
    const token = localStorage.getItem("vendedor_token");
    if (!token) {
      // Se não tem token, redireciona para login
      setLocation("/login-vendedor");
      return;
    }
    setVendedorToken(token);
    setAuthLoading(false);
  }, [setLocation]);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025);
  
  const { data, isLoading } = trpc.painelVendedor.meusDados.useQuery(
    { ano: anoSelecionado, token: vendedorToken || "" },
    { enabled: !!vendedorToken }
  );
  
  const { data: evolucao, isLoading: loadingEvolucao } = trpc.painelVendedor.evolucaoMensal.useQuery(
    { ano: anoSelecionado, token: vendedorToken || "" },
    { enabled: !!vendedorToken }
  );
  
  const { data: comparativo, isLoading: loadingComparativo } = trpc.painelVendedor.comparativoAnos.useQuery(
    { token: vendedorToken || "" },
    { enabled: !!vendedorToken }
  );
  
  const { data: topDestinos, isLoading: loadingDestinos } = trpc.painelVendedor.topDestinos.useQuery(
    { limit: 10, token: vendedorToken || "" },
    { enabled: !!vendedorToken }
  );
  
  const { data: minhasMetas, isLoading: loadingMetas } = trpc.painelVendedor.minhasMetas.useQuery(
    { token: vendedorToken || "" },
    { enabled: !!vendedorToken }
  );

  // Mostrar loading enquanto verifica autenticação
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Não precisa mais verificar isAuthenticated pois o useEffect já redireciona

  // Mostrar erro se vendedor não encontrado
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erro ao Carregar Dados</CardTitle>
            <CardDescription>
              Não foi possível carregar seus dados. Entre em contato com o suporte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Email da conta: <span className="font-mono">{user?.email}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-mono">isLoading={isLoading.toString()}, data=null</span>
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Se você é um vendedor e deveria ter acesso, verifique se seu email está cadastrado corretamente no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { vendedor, totais, metaTrimestralIndividual, metaGeralEquipe } = data;

  // Calcula estatísticas
  const melhorMes = evolucao && evolucao.length > 0 
    ? evolucao.reduce((max, m) => m.vendas > max.vendas ? m : max, evolucao[0])
    : null;
  
  const ticketMedio = evolucao && evolucao.length > 0
    ? totais.vendas / evolucao.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={APP_LOGO} 
                alt="Mundo Pró Viagens" 
                className="h-12 w-auto object-contain"
                style={{ filter: 'brightness(1.05) saturate(1.15)' }}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Olá, {vendedor.nome}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Aqui está o resumo completo do seu desempenho
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={anoSelecionado.toString()} onValueChange={(v) => setAnoSelecionado(Number(v))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">Ano 2025</SelectItem>
                  <SelectItem value="2024">Ano 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {totais.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ano {anoSelecionado}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média % Ano</CardTitle>
              <Percent className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-600">
                  {totais.percentualReceita}%
                </div>
                {parseFloat(totais.percentualReceita) >= 17 && (
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                    Excelente
                  </span>
                )}
                {parseFloat(totais.percentualReceita) >= 15 && parseFloat(totais.percentualReceita) < 17 && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                    Melhor
                  </span>
                )}
                {parseFloat(totais.percentualReceita) >= 14 && parseFloat(totais.percentualReceita) < 15 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full font-medium">
                    Normal
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total do Mês Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                R$ {data.mesAtual.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.mesAtual.mes}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média % Mês Atual</CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-orange-600">
                  {data.mesAtual.percentualReceita}%
                </div>
                {parseFloat(data.mesAtual.percentualReceita) >= 17 && (
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                    Excelente
                  </span>
                )}
                {parseFloat(data.mesAtual.percentualReceita) >= 15 && parseFloat(data.mesAtual.percentualReceita) < 17 && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                    Melhor
                  </span>
                )}
                {parseFloat(data.mesAtual.percentualReceita) >= 14 && parseFloat(data.mesAtual.percentualReceita) < 15 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-1 rounded-full font-medium">
                    Normal
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Evolução Mensal de Vendas
            </CardTitle>
            <CardDescription>
              Acompanhe seu desempenho mês a mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEvolucao ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : evolucao && evolucao.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === '% Receita') return `${value.toFixed(2)}%`;
                      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="vendas" stroke="#2563eb" name="Vendas" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="receita" stroke="#16a34a" name="Receita" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="percentualReceita" stroke="#ea580c" name="% Receita" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum dado disponível</p>
            )}
            
            {melhorMes && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  🏆 Seu melhor mês: <span className="font-bold">{melhorMes.mes}</span> com{' '}
                  <span className="font-bold">R$ {melhorMes.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> em vendas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas Trimestrais */}
        {minhasMetas && minhasMetas.length > 0 && (
          <div className="space-y-4">
            {/* Meta Atual (primeira da lista) */}
            <Card className="border-2 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  {minhasMetas[0].trimestre} - Dezembro/Janeiro/Fevereiro
                </CardTitle>
                <CardDescription>
                  Sua meta atual do trimestre
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Indicadores de Progresso */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-2xl font-bold text-blue-600">
                      R$ {minhasMetas[0].meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendido</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {minhasMetas[0].vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Falta</p>
                    <p className="text-2xl font-bold text-orange-600">
                      R$ {minhasMetas[0].falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-medium">{minhasMetas[0].percentual}%</span>
                  </div>
                  <Progress value={parseFloat(minhasMetas[0].percentual)} className="h-3" />
                </div>

                {/* Valores de Bônus */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-lg font-bold text-blue-600">
                      R$ {minhasMetas[0].meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Super Meta</p>
                    <p className="text-lg font-bold text-purple-600">
                      R$ {minhasMetas[0].superMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bônus Meta</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {minhasMetas[0].bonusMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bônus Super Meta</p>
                    <p className="text-lg font-bold text-orange-600">
                      + R$ {(minhasMetas[0].bonusSuperMeta - minhasMetas[0].bonusMeta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    🎯 Atinja 100% da meta e ganhe <span className="font-bold">R$ {minhasMetas[0].bonusMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-1">
                    🚀 Atinja sua super meta e ganhe + <span className="font-bold">R$ {(minhasMetas[0].bonusSuperMeta - minhasMetas[0].bonusMeta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>

                {/* Meta da Agência */}
                {minhasMetas[0].metaAgencia > 0 && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Meta da Agência (Equipe)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Meta</p>
                        <p className="text-lg font-bold text-purple-600">
                          R$ {minhasMetas[0].metaAgencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Vendido</p>
                        <p className="text-lg font-bold text-green-600">
                          R$ {minhasMetas[0].vendidoEquipe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Falta</p>
                        <p className="text-lg font-bold text-orange-600">
                          R$ {minhasMetas[0].faltaEquipe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium">Progresso da Equipe</span>
                        <span className="text-xs font-medium">{minhasMetas[0].percentualEquipe}%</span>
                      </div>
                      <Progress value={parseFloat(minhasMetas[0].percentualEquipe)} className="h-2" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Metas Anteriores */}
            {minhasMetas.length > 1 && (
              <details className="group">
                <summary className="cursor-pointer list-none">
                  <Card className="hover:bg-accent transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          Ver Metas Anteriores ({minhasMetas.length - 1})
                        </span>
                        <TrendingDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </summary>
                
                <div className="mt-4 space-y-4">
                  {minhasMetas.slice(1).map((meta, index) => (
                    <Card key={index} className="border-muted">
                      <CardHeader>
                        <CardTitle className="text-base">
                          {meta.trimestre} - Setembro/Outubro/Novembro
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Indicadores de Progresso */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Meta</p>
                            <p className="text-xl font-bold text-blue-600">
                              R$ {meta.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Vendido</p>
                            <p className="text-xl font-bold text-green-600">
                              R$ {meta.vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Falta</p>
                            <p className="text-xl font-bold text-orange-600">
                              R$ {meta.falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        {/* Barra de Progresso */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Progresso</span>
                            <span className="text-sm font-medium">{meta.percentual}%</span>
                          </div>
                          <Progress value={parseFloat(meta.percentual)} className="h-3" />
                        </div>

                        {/* Valores de Bônus */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Meta</p>
                            <p className="text-sm font-bold">R$ {meta.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Super Meta</p>
                            <p className="text-sm font-bold">R$ {meta.superMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Bônus Meta</p>
                            <p className="text-sm font-bold">R$ {meta.bonusMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Bônus Super</p>
                            <p className="text-sm font-bold">R$ {meta.bonusSuperMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>

                        {/* Meta da Agência */}
                        {meta.metaAgencia > 0 && (
                          <div className="mt-4 pt-4 border-t space-y-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Meta da Agência (Equipe)</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Meta</p>
                                <p className="text-lg font-bold text-purple-600">
                                  R$ {meta.metaAgencia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Vendido</p>
                                <p className="text-lg font-bold text-green-600">
                                  R$ {meta.vendidoEquipe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Falta</p>
                                <p className="text-lg font-bold text-orange-600">
                                  R$ {meta.faltaEquipe.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="text-xs font-medium">Progresso da Equipe</span>
                                <span className="text-xs font-medium">{meta.percentualEquipe}%</span>
                              </div>
                              <Progress value={parseFloat(meta.percentualEquipe)} className="h-2" />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}


        {/* Comparativo 2024 vs 2025 */}
        {comparativo && comparativo.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Comparativo 2024 vs 2025
              </CardTitle>
              <CardDescription>
                Veja como suas vendas evoluíram ano a ano
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingComparativo ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Mês</th>
                        <th className="text-right p-2">Vendas 2024</th>
                        <th className="text-right p-2">Vendas 2025</th>
                        <th className="text-right p-2">Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparativo.map((item) => {
                        const variacao = parseFloat(item.variacaoVendas);
                        const corVariacao = variacao > 0 ? 'text-green-600' : variacao < 0 ? 'text-red-600' : 'text-gray-600';
                        const iconeVariacao = variacao > 0 ? <TrendingUp className="h-4 w-4 inline" /> : variacao < 0 ? <TrendingDown className="h-4 w-4 inline" /> : null;
                        
                        return (
                          <tr key={item.mes} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2 font-medium">{item.mes}</td>
                            <td className="p-2 text-right">
                              {item.temDados2024 ? `R$ ${item.vendas2024.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="p-2 text-right">
                              {item.temDados2025 ? `R$ ${item.vendas2025.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className={`p-2 text-right font-medium ${corVariacao}`}>
                              {item.temDados2024 && item.temDados2025 ? (
                                <span className="flex items-center justify-end gap-1">
                                  {iconeVariacao}
                                  {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
                                </span>
                              ) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Top Destinos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Top 10 Destinos Mais Vendidos
            </CardTitle>
            <CardDescription>
              Seus destinos com maior volume de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDestinos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : topDestinos && topDestinos.length > 0 ? (
              <div className="space-y-3">
                {topDestinos.map((destino, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{destino.destino}</p>
                        <p className="text-sm text-muted-foreground">{destino.quantidadeVendas} vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">
                        R$ {destino.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum destino registrado</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
