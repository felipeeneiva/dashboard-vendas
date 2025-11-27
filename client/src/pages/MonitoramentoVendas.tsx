import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { RefreshCw, TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { useState } from "react";

export default function MonitoramentoVendas() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: hoje, refetch: refetchHoje } = trpc.vendasDiarias.hoje.useQuery();
  const { data: comparativo, refetch: refetchComparativo } = trpc.vendasDiarias.comparativo.useQuery();
  const { data: ranking, refetch: refetchRanking } = trpc.vendasDiarias.ranking.useQuery();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchHoje(), refetchComparativo(), refetchRanking()]);
    setIsRefreshing(false);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (variacao < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getVariacaoColor = (variacao: number) => {
    if (variacao > 0) return "text-green-600";
    if (variacao < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Monitoramento em Tempo Real</h1>
            <p className="text-muted-foreground">Acompanhe as vendas do dia em tempo real</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Cards de Métricas */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Vendas de Hoje */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas de Hoje</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hoje?.totalVendas || 0}</div>
              <p className="text-xs text-muted-foreground">
                {formatarMoeda(hoje?.valorTotal || 0)}
              </p>
            </CardContent>
          </Card>

          {/* Comparativo com Ontem */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">vs Ontem</CardTitle>
              {comparativo && getVariacaoIcon(comparativo.variacao)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${comparativo && getVariacaoColor(comparativo.variacao)}`}>
                {comparativo?.variacao ? `${comparativo.variacao > 0 ? '+' : ''}${comparativo.variacao}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Ontem: {comparativo?.ontem.vendas || 0} vendas ({formatarMoeda(comparativo?.ontem.valor || 0)})
              </p>
            </CardContent>
          </Card>

          {/* Meta do Dia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Diária</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Diário */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking do Dia</CardTitle>
            <CardDescription>Top vendedores de hoje</CardDescription>
          </CardHeader>
          <CardContent>
            {ranking && ranking.length > 0 ? (
              <div className="space-y-4">
                {ranking.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-50 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.vendedor}</p>
                        <p className="text-sm text-muted-foreground">{item.vendas} vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatarMoeda(item.valor)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma venda registrada hoje
              </p>
            )}
          </CardContent>
        </Card>

        {/* Lista de Vendas de Hoje */}
        {hoje && hoje.vendas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vendas de Hoje</CardTitle>
              <CardDescription>Todas as vendas realizadas hoje</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hoje.vendas.map((venda: any, index: number) => (
                  <div key={index} className="flex justify-between items-start border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{venda.nomePassageiros}</p>
                      <p className="text-sm text-muted-foreground">{venda.destino || 'Destino não informado'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatarMoeda(venda.valorTotal)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(venda.dataVenda).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
