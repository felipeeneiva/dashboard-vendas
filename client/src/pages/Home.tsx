import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, RefreshCw, TrendingUp, DollarSign, Award, Percent, BarChart3, Trash2, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setLocation] = useLocation();
  const [anoFiltro, setAnoFiltro] = useState<number | undefined>(undefined);
  const [mesFiltro, setMesFiltro] = useState<string | undefined>(undefined);

  // Busca resumo geral
  const { data: resumo, isLoading, refetch } = trpc.metricas.resumoGeral.useQuery(
    anoFiltro || mesFiltro ? { ano: anoFiltro, mes: mesFiltro } : undefined
  );

  // Busca últimas atualizações
  const { data: atualizacoes } = trpc.atualizacoes.ultimas.useQuery({ limit: 5 });

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
            <Select value={anoFiltro?.toString() || 'todos'} onValueChange={(v) => setAnoFiltro(v === 'todos' ? undefined : parseInt(v))}>
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
                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].flatMap(mes => [
                  <SelectItem key={`${mes}/2024`} value={`${mes}/2024`}>{mes}/2024</SelectItem>,
                  <SelectItem key={`${mes}/2025`} value={`${mes}/2025`}>{mes}/2025</SelectItem>
                ])}
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
                      .sort((a, b) => b.totais.receita - a.totais.receita)
                      .map((item, index) => (
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
