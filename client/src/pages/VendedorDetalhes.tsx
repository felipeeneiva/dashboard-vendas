import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, TrendingUp, DollarSign, Award, Percent, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { useMemo } from "react";

interface VendedorDetalhesProps {
  params: { id: string };
}

export default function VendedorDetalhes({ params }: VendedorDetalhesProps) {
  const [, setLocation] = useLocation();
  const vendedorId = parseInt(params.id);

  // Busca dados do vendedor
  const { data, isLoading } = trpc.metricas.porVendedor.useQuery({ vendedorId });

  // Agrupa métricas por ano
  const metricasPorAno = useMemo(() => {
    if (!data?.metricas) return {};

    const grupos: Record<string, typeof data.metricas> = {};
    
    data.metricas.forEach(metrica => {
      const [mes, ano] = metrica.mes.split('/');
      if (!grupos[ano]) {
        grupos[ano] = [];
      }
      grupos[ano].push(metrica);
    });

    return grupos;
  }, [data?.metricas]);

  // Calcula totais
  const totais = useMemo(() => {
    if (!data?.metricas) return { vendas: 0, receita: 0, comissao: 0 };

    return data.metricas
      .filter(m => m.status === 'com_dados')
      .reduce(
        (acc, m) => ({
          vendas: acc.vendas + m.totalVendas,
          receita: acc.receita + m.totalReceita,
          comissao: acc.comissao + m.comissaoTotal
        }),
        { vendas: 0, receita: 0, comissao: 0 }
      );
  }, [data?.metricas]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vendedor não encontrado</p>
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
          
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {data.vendedor.nome}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Detalhamento de vendas e comissões
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                R$ {totais.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                R$ {totais.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Total Comissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                R$ {totais.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Meta Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                R$ {data.vendedor.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas por Ano */}
        {Object.keys(metricasPorAno)
          .sort((a, b) => parseInt(b) - parseInt(a))
          .map(ano => (
            <Card key={ano} className="mb-6">
              <CardHeader>
                <CardTitle>{ano}</CardTitle>
                <CardDescription>
                  Métricas mensais de {ano}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                          Mês
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
                        <th className="text-right py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                          % Receita
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricasPorAno[ano]
                        .sort((a, b) => {
                          const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                          const [mesA] = a.mes.split('/');
                          const [mesB] = b.mes.split('/');
                          return meses.indexOf(mesA) - meses.indexOf(mesB);
                        })
                        .map((metrica) => (
                          <tr
                            key={metrica.mes}
                            className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                              {metrica.mes.split('/')[0]}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm">
                              R$ {metrica.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm">
                              R$ {metrica.totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm">
                              R$ {metrica.comissaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-sm">
                              {metrica.percentualReceita.toFixed(2)}%
                            </td>
                            <td className="py-3 px-4 text-center">
                              {metrica.status === 'com_dados' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Com dados
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                  Sem dados
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
          ))}
      </main>
    </div>
  );
}
