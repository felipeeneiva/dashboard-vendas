import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, DollarSign, Percent, Target, MapPin, Calendar, Award, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MeuPainel() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const { data, isLoading } = trpc.painelVendedor.meusDados.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: evolucao, isLoading: loadingEvolucao } = trpc.painelVendedor.evolucaoMensal.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: comparativo, isLoading: loadingComparativo } = trpc.painelVendedor.comparativoAnos.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: topDestinos, isLoading: loadingDestinos } = trpc.painelVendedor.topDestinos.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  // Mostrar loading enquanto verifica autenticação
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa fazer login com sua conta Google para acessar seu painel individual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login com Google</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar erro se vendedor não encontrado
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Acesso Negado</CardTitle>
            <CardDescription>
              Vendedor não encontrado. Verifique se seu email está cadastrado no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email da conta: <span className="font-mono">{user?.email}</span>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Olá, {vendedor.nome}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Aqui está o resumo completo do seu desempenho
          </p>
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
                Acumulado 2024-2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totais.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado 2024-2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
              <Percent className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                R$ {totais.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado 2024-2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por mês ativo
              </p>
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
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="vendas" stroke="#2563eb" name="Vendas" strokeWidth={2} />
                  <Line type="monotone" dataKey="receita" stroke="#16a34a" name="Receita" strokeWidth={2} />
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

        {/* Meta Trimestral Individual */}
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Sua Meta Trimestral (Set-Out-Nov/2025)
            </CardTitle>
            <CardDescription>
              Acompanhe seu progresso em relação à meta do trimestre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Meta Individual</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {metaTrimestralIndividual.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metaTrimestralIndividual.vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falta</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {metaTrimestralIndividual.falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm font-medium">{metaTrimestralIndividual.percentual}%</span>
              </div>
              <Progress value={parseFloat(metaTrimestralIndividual.percentual)} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Meta Geral da Equipe */}
        <Card className="border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Meta Geral da Equipe (Set-Out-Nov/2025)
            </CardTitle>
            <CardDescription>
              Desempenho coletivo de todos os vendedores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Meta da Equipe</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {metaGeralEquipe.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendido pela Equipe</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metaGeralEquipe.vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falta para a Meta</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {metaGeralEquipe.falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Equipe</span>
                <span className="text-sm font-medium">{metaGeralEquipe.percentual}%</span>
              </div>
              <Progress value={parseFloat(metaGeralEquipe.percentual)} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
