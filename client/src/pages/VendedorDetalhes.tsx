import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, TrendingUp, DollarSign, Award, Percent, Calendar, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useLocation } from "wouter";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VendedorDetalhesProps {
  params: { id: string };
}

export default function VendedorDetalhes({ params }: VendedorDetalhesProps) {
  const [, setLocation] = useLocation();
  const vendedorId = parseInt(params.id);
  const [anoFiltro, setAnoFiltro] = useState<number | undefined>(undefined);
  const [mesFiltro, setMesFiltro] = useState<string | undefined>(undefined);

  // Busca dados do vendedor
  const { data, isLoading } = trpc.metricas.porVendedor.useQuery({ 
    vendedorId,
    ano: anoFiltro,
    mes: mesFiltro
  });

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

  // Calcula comparativo ano a ano (mesmo mês)
  const comparativoAnual = useMemo(() => {
    if (!data?.metricas) return [];

    const mesesUnicos = new Set<string>();
    data.metricas.forEach(m => {
      const [mes] = m.mes.split('/');
      mesesUnicos.add(mes);
    });

    return Array.from(mesesUnicos).map(mes => {
      const metricas2024 = data.metricas.find(m => m.mes === `${mes}/2024`);
      const metricas2025 = data.metricas.find(m => m.mes === `${mes}/2025`);

      if (!metricas2024 || !metricas2025) return null;

      const vendas2024 = metricas2024.totalVendas;
      const vendas2025 = metricas2025.totalVendas;
      const variacaoVendas = vendas2024 > 0 
        ? ((vendas2025 - vendas2024) / vendas2024) * 100 
        : 0;

      const receita2024 = metricas2024.totalReceita;
      const receita2025 = metricas2025.totalReceita;
      const variacaoReceita = receita2024 > 0 
        ? ((receita2025 - receita2024) / receita2024) * 100 
        : 0;

      return {
        mes,
        vendas2024,
        vendas2025,
        variacaoVendas,
        receita2024,
        receita2025,
        variacaoReceita,
        diferencaVendas: vendas2025 - vendas2024,
        diferencaReceita: receita2025 - receita2024
      };
    }).filter(Boolean);
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {data.vendedor.nome}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Detalhamento de vendas e comissões
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
            </div>
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

        {/* Comparativo Ano a Ano */}
        {comparativoAnual.length > 0 && (
          <Card className="mb-8 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <CardTitle>Comparativo 2024 vs 2025</CardTitle>
              </div>
              <CardDescription>
                Comparação mês a mês entre os anos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Mês</th>
                      <th className="text-right py-3 px-4 font-semibold">Vendas 2024</th>
                      <th className="text-right py-3 px-4 font-semibold">Vendas 2025</th>
                      <th className="text-right py-3 px-4 font-semibold">Variação</th>
                      <th className="text-right py-3 px-4 font-semibold">Receita 2024</th>
                      <th className="text-right py-3 px-4 font-semibold">Receita 2025</th>
                      <th className="text-right py-3 px-4 font-semibold">Variação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativoAnual.map((comp: any) => {
                      const IconeVendas = comp.variacaoVendas > 0 ? ArrowUp : comp.variacaoVendas < 0 ? ArrowDown : Minus;
                      const IconeReceita = comp.variacaoReceita > 0 ? ArrowUp : comp.variacaoReceita < 0 ? ArrowDown : Minus;
                      const corVendas = comp.variacaoVendas > 0 ? 'text-green-600' : comp.variacaoVendas < 0 ? 'text-red-600' : 'text-slate-500';
                      const corReceita = comp.variacaoReceita > 0 ? 'text-green-600' : comp.variacaoReceita < 0 ? 'text-red-600' : 'text-slate-500';
                      
                      return (
                        <tr key={comp.mes} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-4 font-medium">{comp.mes}</td>
                          <td className="text-right py-3 px-4">R$ {(comp.vendas2024 / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right py-3 px-4">R$ {(comp.vendas2025 / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className={`text-right py-3 px-4 font-semibold ${corVendas}`}>
                            <div className="flex items-center justify-end gap-1">
                              <IconeVendas className="h-4 w-4" />
                              {Math.abs(comp.variacaoVendas).toFixed(1)}%
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">R$ {(comp.receita2024 / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="text-right py-3 px-4">R$ {(comp.receita2025 / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className={`text-right py-3 px-4 font-semibold ${corReceita}`}>
                            <div className="flex items-center justify-end gap-1">
                              <IconeReceita className="h-4 w-4" />
                              {Math.abs(comp.variacaoReceita).toFixed(1)}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

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
