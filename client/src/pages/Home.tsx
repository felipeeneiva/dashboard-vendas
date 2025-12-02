import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, RefreshCw, TrendingUp, DollarSign, Award, Percent, BarChart3, Trash2, Eye, Target, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ComposedChart, Bar } from 'recharts';
import { APP_TITLE } from "@/const";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// Emails dos administradores
const ADMIN_EMAILS = ['felipe@mundoproviagens.com.br', 'vendas@mundoproviagens.com.br'];

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setLocation] = useLocation();

  // Redireciona vendedores comuns para /meu-painel
  useEffect(() => {
    if (!loading && isAuthenticated && user?.email) {
      const isAdmin = ADMIN_EMAILS.includes(user.email);
      if (!isAdmin) {
        setLocation('/meu-painel');
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);
  const [anoFiltro, setAnoFiltro] = useState<number | undefined>(undefined);
  const [mesFiltro, setMesFiltro] = useState<string | undefined>(undefined);
  const [ordenacao, setOrdenacao] = useState<'receita' | 'vendas' | 'comissao' | 'nome'>('receita');

  // Busca resumo geral
  const { data: resumo, isLoading, refetch } = trpc.vendedores.resumoGeral.useQuery(
    anoFiltro || mesFiltro ? { ano: anoFiltro, mes: mesFiltro } : undefined
  );

  // Busca últimas atualizações
  const { data: atualizacoes } = trpc.atualizacoes.ultimas.useQuery({ limit: 5 });

  // Busca % de receita consolidada (usando fetch direto para contornar problema de cache do TypeScript)
  const [percentualReceita, setPercentualReceita] = useState<any>(null);
  const [metasTrimestrais, setMetasTrimestrais] = useState<any>(null);
  const [evolucaoReceita, setEvolucaoReceita] = useState<any>(null);
  const [rankingReceita, setRankingReceita] = useState<any>(null);
  const [comparativo, setComparativo] = useState<any>(null);
  const [anoGrafico, setAnoGrafico] = useState<'2024' | '2025' | 'todos'>('2025');

  useEffect(() => {
    // Buscar % de receita consolidada
    const inputReceita = encodeURIComponent(JSON.stringify({ json: { ano: 2025 } }));
    fetch(`/api/trpc/vendedores.percentualReceitaConsolidado?input=${inputReceita}`)
      .then(res => res.json())
      .then(data => setPercentualReceita(data.result?.data?.json))
      .catch(err => console.error('Erro ao buscar % de receita:', err));

    // Buscar metas trimestrais
    const inputMetas = encodeURIComponent(JSON.stringify({ json: { ano: 2025 } }));
    fetch(`/api/trpc/vendedores.metasTrimestraisAdmin?input=${inputMetas}`)
      .then(res => res.json())
      .then(data => setMetasTrimestrais(data.result?.data?.json))
      .catch(err => console.error('Erro ao buscar metas trimestrais:', err));

    // Buscar evolução de % de receita
    const inputEvolucao = encodeURIComponent(JSON.stringify({ json: { ano: 2025 } }));
    fetch(`/api/trpc/vendedores.evolucaoPercentualReceita?input=${inputEvolucao}`)
      .then(res => res.json())
      .then(data => setEvolucaoReceita(data.result?.data?.json))
      .catch(err => console.error('Erro ao buscar evolução de % de receita:', err));

    // Buscar ranking de % de receita por vendedor
    fetch(`/api/trpc/vendedores.rankingPercentualReceita`)
      .then(res => res.json())
      .then(data => setRankingReceita(data.result?.data?.json))
      .catch(err => console.error('Erro ao buscar ranking de % de receita:', err));

    // Buscar comparativo mês atual vs anterior
    fetch(`/api/trpc/vendedores.comparativoMesAtualAnterior`)
      .then(res => res.json())
      .then(data => setComparativo(data.result?.data?.json))
      .catch(err => console.error('Erro ao buscar comparativo mensal:', err));
  }, []);

  // Mutation para limpar dados antigos
  const limparDados = trpc.metricas.limparDadosAntigos.useMutation({
    onSuccess: (data) => {
      toast.success(`Dados de ${data.ano} removidos! ${data.removidos} registros excluídos.`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao limpar dados: ${error.message}`);
    }
  });
  
  // Mutation para atualizar todos os dados
  const atualizarTodos = trpc.metricas.atualizarTodos.useMutation({
    onSuccess: (data) => {
      toast.success(`Atualização concluída! ${data.vendedoresAtualizados} vendedores atualizados.`);
      refetch();
      setIsRefreshing(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
      setIsRefreshing(false);
    }
  });

  // Mutation para inicializar vendedores (executar uma vez)
  const inicializarVendedores = trpc.vendedores.inicializar.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.total} vendedores inicializados!`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao inicializar: ${error.message}`);
    }
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    atualizarTodos.mutate();
  };

  // Calcula totais gerais
  const totaisGerais = resumo?.reduce(
    (acc, item) => ({
      vendas: acc.vendas + item.totais.vendas,
      receita: acc.receita + item.totais.receita,
      comissao: acc.comissao + item.totais.comissao
    }),
    { vendas: 0, receita: 0, comissao: 0 }
  );

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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {APP_TITLE}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monitoramento de Vendas e Metas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={anoFiltro?.toString() || 'todos'} onValueChange={(v) => {
              const novoAno = v === 'todos' ? undefined : parseInt(v);
              setAnoFiltro(novoAno);
              // Limpar filtro de mês se não for compatível com o ano selecionado
              if (mesFiltro && novoAno) {
                const anoDoMes = parseInt(mesFiltro.split('/')[1]);
                if (anoDoMes !== novoAno) {
                  setMesFiltro(undefined);
                }
              }
            }}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={mesFiltro || 'todos'} onValueChange={(v) => setMesFiltro(v === 'todos' ? undefined : v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].flatMap(mes => {
                  const items = [];
                  if (!anoFiltro || anoFiltro === 2024) {
                    items.push(<SelectItem key={`${mes}/2024`} value={`${mes}/2024`}>{mes}/2024</SelectItem>);
                  }
                  if (!anoFiltro || anoFiltro === 2025) {
                    items.push(<SelectItem key={`${mes}/2025`} value={`${mes}/2025`}>{mes}/2025</SelectItem>);
                  }
                  return items;
                })}
              </SelectContent>
            </Select>
            
            <Select value={ordenacao} onValueChange={(v: any) => setOrdenacao(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita ↓</SelectItem>
                <SelectItem value="vendas">Vendas ↓</SelectItem>
                <SelectItem value="comissao">Comissão ↓</SelectItem>
                <SelectItem value="nome">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => setLocation('/analises')}
              variant="outline"
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Análises
            </Button>
            
            <Button
              onClick={() => setLocation('/metas-trimestral')}
              variant="outline"
              className="gap-2 border-blue-300 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
            >
              <Target className="h-4 w-4" />
              Metas Trimestral
            </Button>
            
            <Button
              onClick={() => setLocation('/fornecedores')}
              variant="outline"
              className="gap-2 border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/20"
            >
              <TrendingUp className="h-4 w-4" />
              Fornecedores
            </Button>
            
            <Button
              onClick={() => setLocation('/monitoramento')}
              variant="outline"
              className="gap-2 border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900/20"
            >
              <Eye className="h-4 w-4" />
              Monitoramento
            </Button>
            
            {isAuthenticated && (
              <>
                {resumo && resumo.length === 0 && (
                  <Button
                    onClick={() => inicializarVendedores.mutate()}
                    disabled={inicializarVendedores.isPending}
                    variant="outline"
                  >
                    Inicializar Vendedores
                  </Button>
                )}
                <Button
                  onClick={() => limparDados.mutate({ ano: 2023 })}
                  disabled={limparDados.isPending}
                  variant="destructive"
                  className="gap-2"
                >
                  {limparDados.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Limpando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Limpar 2023
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Atualizar Dados
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                R$ {(totaisGerais?.vendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total de Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                R$ {(totaisGerais?.receita || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Total de Comissões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                R$ {(totaisGerais?.comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de % de Receita */}
        {percentualReceita && percentualReceita.ano && percentualReceita.mes && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Média % Receita Ano 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {percentualReceita.ano.percentual.toFixed(2)}%
                  </div>
                  {percentualReceita.ano.percentual >= 17 && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Excelente
                    </span>
                  )}
                  {percentualReceita.ano.percentual >= 15 && percentualReceita.ano.percentual < 17 && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Melhor
                    </span>
                  )}
                  {percentualReceita.ano.percentual >= 14 && percentualReceita.ano.percentual < 15 && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Normal
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-pink-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Média % Receita {percentualReceita.mes.mesAno} (Mês Atual)
                </CardTitle>
                <CardDescription className="text-xs">
                  Margem de lucro do mês atual (Receita ÷ Vendas)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {percentualReceita.mes.percentual.toFixed(2)}%
                  </div>
                  {percentualReceita.mes.percentual >= 17 && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Excelente
                    </span>
                  )}
                  {percentualReceita.mes.percentual >= 15 && percentualReceita.mes.percentual < 17 && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Melhor
                    </span>
                  )}
                  {percentualReceita.mes.percentual >= 14 && percentualReceita.mes.percentual < 15 && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Normal
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comparativo Mês Atual vs Mês Anterior */}
        {comparativo && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Comparativo: {comparativo.mesAtual.mes} vs {comparativo.mesAnterior.mes}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Variação de Vendas */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Variação de Vendas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Mês Atual</span>
                      <span className="text-sm font-semibold">R$ {comparativo.mesAtual.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Mês Anterior</span>
                      <span className="text-sm font-semibold">R$ {comparativo.mesAnterior.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {comparativo.variacoes.vendas > 0 ? (
                          <ArrowUp className="h-5 w-5 text-green-600" />
                        ) : comparativo.variacoes.vendas < 0 ? (
                          <ArrowDown className="h-5 w-5 text-red-600" />
                        ) : null}
                        <span className={`text-2xl font-bold ${
                          comparativo.variacoes.vendas > 0 ? 'text-green-600' : 
                          comparativo.variacoes.vendas < 0 ? 'text-red-600' : 
                          'text-slate-600'
                        }`}>
                          {comparativo.variacoes.vendas > 0 ? '+' : ''}{comparativo.variacoes.vendas.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variação de Receita */}
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Variação de Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Mês Atual</span>
                      <span className="text-sm font-semibold">R$ {comparativo.mesAtual.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Mês Anterior</span>
                      <span className="text-sm font-semibold">R$ {comparativo.mesAnterior.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {comparativo.variacoes.receita > 0 ? (
                          <ArrowUp className="h-5 w-5 text-green-600" />
                        ) : comparativo.variacoes.receita < 0 ? (
                          <ArrowDown className="h-5 w-5 text-red-600" />
                        ) : null}
                        <span className={`text-2xl font-bold ${
                          comparativo.variacoes.receita > 0 ? 'text-green-600' : 
                          comparativo.variacoes.receita < 0 ? 'text-red-600' : 
                          'text-slate-600'
                        }`}>
                          {comparativo.variacoes.receita > 0 ? '+' : ''}{comparativo.variacoes.receita.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Variação de % Receita */}
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Variação de % Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Mês Atual</span>
                      <span className="text-sm font-semibold">{comparativo.mesAtual.percentual.toFixed(2)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Mês Anterior</span>
                      <span className="text-sm font-semibold">{comparativo.mesAnterior.percentual.toFixed(2)}%</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {comparativo.variacoes.percentual > 0 ? (
                          <ArrowUp className="h-5 w-5 text-green-600" />
                        ) : comparativo.variacoes.percentual < 0 ? (
                          <ArrowDown className="h-5 w-5 text-red-600" />
                        ) : null}
                        <span className={`text-2xl font-bold ${
                          comparativo.variacoes.percentual > 0 ? 'text-green-600' : 
                          comparativo.variacoes.percentual < 0 ? 'text-red-600' : 
                          'text-slate-600'
                        }`}>
                          {comparativo.variacoes.percentual > 0 ? '+' : ''}{comparativo.variacoes.percentual.toFixed(2)} p.p.
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Gráfico Consolidado: Vendas x Receita x % Receita */}
        {evolucaoReceita && evolucaoReceita.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Evolução Mensal: Vendas x Receita x % Receita
                  </CardTitle>
                  <CardDescription>
                    Visão consolidada da performance financeira da equipe
                  </CardDescription>
                </div>
                <Select value={anoGrafico} onValueChange={(value: any) => setAnoGrafico(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={evolucaoReceita.filter((item: any) => {
                  if (anoGrafico === 'todos') return true;
                  return item.mes.endsWith(`/${anoGrafico}`);
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Valores (R$)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#8b5cf6"
                    style={{ fontSize: '12px' }}
                    label={{ value: '% de Receita', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
                    domain={[0, 25]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Vendas' || name === 'Receita') {
                        return [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, name];
                      }
                      if (name === '% de Receita') {
                        return [`${Number(value).toFixed(2)}%`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="totalVendas" 
                    fill="#3b82f6" 
                    name="Vendas"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="totalReceita" 
                    fill="#10b981" 
                    name="Receita"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="percentual" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="% de Receita"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Ranking de % de Receita por Vendedor */}
        {rankingReceita && rankingReceita.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Ranking de Performance por Vendedor (2025)
              </CardTitle>
              <CardDescription>
                Classificação por % de receita - Ideal para apresentações e reuniões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Posição</th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Vendedor</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Total Vendas</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Total Receita</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">% Receita</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rankingReceita.map((vendedor: any, index: number) => (
                      <tr key={vendedor.vendedorId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-sm" style={{
                            background: index === 0 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                                       index === 1 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' :
                                       index === 2 ? 'linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%)' :
                                       'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)',
                            color: index <= 2 ? '#000' : '#fff'
                          }}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {vendedor.nome}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm">
                          R$ {vendedor.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-sm text-green-600 dark:text-green-400">
                          R$ {vendedor.totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {vendedor.percentual.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {vendedor.percentual >= 17 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              🌟 Excelente
                            </span>
                          )}
                          {vendedor.percentual >= 15 && vendedor.percentual < 17 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ✅ Melhor
                            </span>
                          )}
                          {vendedor.percentual >= 14 && vendedor.percentual < 15 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              🟡 Normal
                            </span>
                          )}
                          {vendedor.percentual < 14 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              ⚠️ Atenção
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gráfico de Evolução de % de Receita */}
        {evolucaoReceita && evolucaoReceita.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução Mensal da Margem de Lucro (% de Receita)
              </CardTitle>
              <CardDescription>
                Acompanhe a tendência da rentabilidade da equipe ao longo de 2025
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={evolucaoReceita}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    label={{ value: '% de Receita', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'percentual') return [`${value.toFixed(2)}%`, '% de Receita'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <ReferenceLine 
                    y={15} 
                    stroke="#10b981" 
                    strokeDasharray="5 5" 
                    label={{ value: 'Meta: 15% (Melhor)', position: 'right', fill: '#10b981', fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentual" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="% de Receita"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Indicadores de Melhor e Pior Mês */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1">🏆 Melhor Mês</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    {evolucaoReceita.reduce((max: any, item: any) => 
                      item.percentual > max.percentual ? item : max
                    ).mes}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {evolucaoReceita.reduce((max: any, item: any) => 
                      item.percentual > max.percentual ? item : max
                    ).percentual.toFixed(2)}% de receita
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">⚠️ Pior Mês</p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                    {evolucaoReceita.reduce((min: any, item: any) => 
                      item.percentual < min.percentual ? item : min
                    ).mes}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    {evolucaoReceita.reduce((min: any, item: any) => 
                      item.percentual < min.percentual ? item : min
                    ).percentual.toFixed(2)}% de receita
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Vendedor</CardTitle>
            <CardDescription>
              Métricas consolidadas de todos os vendedores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumo && resumo.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                        Vendedor
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                        Total Vendas
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                        Total Receita
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                        Comissão
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                        Meses
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumo
                      .sort((a: any, b: any) => {
                        switch (ordenacao) {
                          case 'receita':
                            return b.totais.receita - a.totais.receita;
                          case 'vendas':
                            return b.totais.vendas - a.totais.vendas;
                          case 'comissao':
                            return b.totais.comissao - a.totais.comissao;
                          case 'nome':
                            return a.vendedor.nome.localeCompare(b.vendedor.nome);
                          default:
                            return 0;
                        }
                      })
                      .map((item: any, index: number) => (
                        <tr
                          key={item.vendedor.id}
                          className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                                {index + 1}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {item.vendedor.nome}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm">
                            R$ {item.totais.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm">
                            R$ {item.totais.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm">
                            R$ {item.totais.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {item.mesesComDados} meses
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/vendedor/${item.vendedor.id}`)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Ver Detalhes
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Nenhum dado encontrado. Clique em "Inicializar Vendedores" para começar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meta Trimestral Atual */}
        {metasTrimestrais && metasTrimestrais.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {metasTrimestrais[0].trimestre}
                  </CardTitle>
                  <CardDescription>
                    Progresso das metas trimestrais de cada vendedor
                  </CardDescription>
                </div>
                {metasTrimestrais.length > 1 && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Ver Metas Anteriores ({metasTrimestrais.length - 1})
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-6">
                        {metasTrimestrais.slice(1).map((meta: any, idx: number) => (
                          <div key={idx} className="border-t border-slate-200 dark:border-slate-700 pt-6">
                            <h3 className="text-lg font-semibold mb-4">{meta.trimestre}</h3>
                            {/* Progresso da Meta da Agência (Anterior) */}
                            <div className="mb-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Meta da Agência</h4>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Meta</p>
                                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    R$ {((meta.metaAgencia || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Vendido</p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    R$ {((meta.progressoEquipe?.totalVendido || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Falta</p>
                                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    R$ {((meta.progressoEquipe?.totalFalta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">Progresso</p>
                                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    {(meta.progressoEquipe?.percentual || 0).toFixed(2)}%
                                  </p>
                                </div>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(meta.progressoEquipe?.percentual || 0, 100)}%` }}
                                />
                              </div>
                            </div>
                            {/* Top 5 Vendedores (Anterior) */}
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="py-2 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">Vendedor</th>
                                    <th className="py-2 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Meta</th>
                                    <th className="py-2 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Super Meta</th>
                                    <th className="py-2 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Vendido</th>
                                    <th className="py-2 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">%</th>
                                    <th className="py-2 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Bônus Meta</th>
                                    <th className="py-2 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Bônus Super</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {meta.vendedores
                                    .sort((a: any, b: any) => b.percentual - a.percentual)
                                    .slice(0, 5)
                                    .map((vendedor: any, index: number) => (
                                      <tr key={vendedor.vendedorId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-2 px-4 text-sm font-medium">{vendedor.nome}</td>
                                        <td className="py-2 px-4 text-right font-mono text-sm">
                                          R$ {((vendedor.meta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-2 px-4 text-right font-mono text-sm text-purple-600 dark:text-purple-400">
                                          R$ {((vendedor.superMeta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-2 px-4 text-right font-mono text-sm text-green-600 dark:text-green-400">
                                          R$ {((vendedor.vendido || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-2 px-4 text-center">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            vendedor.percentual >= 80
                                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                              : vendedor.percentual >= 50
                                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                          }`}>
                                            {(Number(vendedor.percentual) || 0).toFixed(2)}%
                                          </span>
                                        </td>
                                        <td className="py-2 px-4 text-right font-mono text-sm text-blue-600 dark:text-blue-400">
                                          R$ {((vendedor.bonusMeta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-2 px-4 text-right font-mono text-sm text-indigo-600 dark:text-indigo-400">
                                          R$ {((vendedor.bonusSuperMeta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Progresso da Meta da Agência */}
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Meta da Agência</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Meta</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      R$ {((metasTrimestrais[0].metaAgencia || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Vendido</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      R$ {((metasTrimestrais[0].progressoEquipe?.totalVendido || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Falta</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      R$ {((metasTrimestrais[0].progressoEquipe?.totalFalta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Progresso</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {(metasTrimestrais[0].progressoEquipe?.percentual || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(metasTrimestrais[0].progressoEquipe?.percentual || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Tabela de Progresso por Vendedor */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Vendedor</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Meta</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Super Meta</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Vendido</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Falta</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Progresso</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Bônus Meta</th>
                      <th className="py-3 px-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Bônus Super</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {metasTrimestrais[0].vendedores
                      .sort((a: any, b: any) => b.percentual - a.percentual)
                      .map((vendedor: any, index: number) => (
                        <tr key={vendedor.vendedorId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                                {index + 1}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {vendedor.nome}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm">
                            R$ {((vendedor.meta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-purple-600 dark:text-purple-400">
                            R$ {((vendedor.superMeta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-green-600 dark:text-green-400">
                            R$ {((vendedor.vendido || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-orange-600 dark:text-orange-400">
                            R$ {((vendedor.falta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-semibold">{(Number(vendedor.percentual) || 0).toFixed(2)}%</span>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    vendedor.percentual >= 80
                                      ? 'bg-green-500'
                                      : vendedor.percentual >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(vendedor.percentual, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-blue-600 dark:text-blue-400">
                            R$ {((vendedor.bonusMeta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-indigo-600 dark:text-indigo-400">
                            R$ {((vendedor.bonusSuperMeta || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {vendedor.percentual >= 80 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                No caminho
                              </span>
                            )}
                            {vendedor.percentual >= 50 && vendedor.percentual < 80 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Atenção
                              </span>
                            )}
                            {vendedor.percentual < 50 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Em risco
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Últimas Atualizações */}
        {atualizacoes && atualizacoes.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Últimas Atualizações</CardTitle>
              <CardDescription>
                Histórico de sincronizações com as planilhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {atualizacoes.map((atualizacao) => (
                  <div
                    key={atualizacao.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          atualizacao.status === 'sucesso'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : atualizacao.status === 'parcial'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {atualizacao.status}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {atualizacao.tipo === 'manual' ? 'Atualização Manual' : 'Atualização Automática'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {atualizacao.vendedoresAtualizados} vendedores • {atualizacao.totalRegistros} registros
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {new Date(atualizacao.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
