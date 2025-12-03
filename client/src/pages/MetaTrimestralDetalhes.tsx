import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target } from "lucide-react";

export default function MetaTrimestralDetalhes() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [metaData, setMetaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const trimestre = params.trimestre;

  useEffect(() => {
    // Buscar dados da meta específica
    fetch(`/api/trpc/vendedores.metasTrimestraisAdmin`)
      .then(res => res.json())
      .then(data => {
        const metas = data.result?.data?.json || [];
        const metaEspecifica = metas.find((m: any) => m.trimestre === trimestre);
        setMetaData(metaEspecifica);
        setLoading(false);
      })
      .catch(err => {
        console.error('Erro ao buscar meta:', err);
        setLoading(false);
      });
  }, [trimestre]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!metaData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Meta não encontrada</p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            {metaData.trimestre}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Detalhes completos do progresso de metas
          </p>
        </div>

        {/* Meta da Agência */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Meta da Agência</CardTitle>
            <CardDescription>Progresso consolidado da equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Meta</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  R$ {(metaData.metaAgencia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Vendido</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R$ {(metaData.vendidoEquipe || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Falta</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  R$ {(metaData.faltaEquipe || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Progresso</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {(metaData.percentualEquipe || 0)}%
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(parseFloat(metaData.percentualEquipe || 0), 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso Individual por Vendedor</CardTitle>
            <CardDescription>
              {metaData.vendedores?.length || 0} vendedores • Ordenado por progresso
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  {metaData.vendedores
                    ?.sort((a: any, b: any) => parseFloat(b.percentual) - parseFloat(a.percentual))
                    .map((vendedor: any, index: number) => {
                      const percentual = parseFloat(vendedor.percentual || 0);
                      let statusColor = 'text-red-600 dark:text-red-400';
                      let statusText = 'Em risco';
                      
                      if (percentual >= 100) {
                        statusColor = 'text-green-600 dark:text-green-400';
                        statusText = 'Atingida';
                      } else if (percentual >= 80) {
                        statusColor = 'text-yellow-600 dark:text-yellow-400';
                        statusText = 'No caminho';
                      }

                      return (
                        <tr key={vendedor.vendedorId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                                {index + 1}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {vendedor.vendedorNome}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm">
                            R$ {(vendedor.meta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-purple-600 dark:text-purple-400">
                            R$ {(vendedor.superMeta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-green-600 dark:text-green-400">
                            R$ {(vendedor.vendido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-orange-600 dark:text-orange-400">
                            R$ {(vendedor.falta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-semibold">{percentual.toFixed(2)}%</span>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    percentual >= 100 
                                      ? 'bg-green-500' 
                                      : percentual >= 80 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(percentual, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-blue-600 dark:text-blue-400">
                            R$ {(vendedor.bonusMeta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-sm text-indigo-600 dark:text-indigo-400">
                            R$ {(vendedor.bonusSuperMeta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`text-xs font-semibold ${statusColor}`}>
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
