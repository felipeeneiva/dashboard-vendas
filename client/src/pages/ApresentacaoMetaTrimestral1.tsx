import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Trophy, TrendingUp, Target, Award, Maximize, Minimize } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { APP_LOGO } from "@/const";
import { Badge } from "@/components/ui/badge";

/**
 * Página de Apresentação da Meta Trimestral 1 (Dezembro/2025 - Janeiro/2026 - Fevereiro/2026)
 * Para uso em reuniões - SEM EXPOR NOMES DE VENDEDORES
 * Vendedores identificados como AAAAA, BBBBB, CCCCC... ordenados por progresso
 */
export default function ApresentacaoMetaTrimestral1() {
  // Estado para controlar modo apresentação
  const [modoApresentacao, setModoApresentacao] = useState(false);

  // Buscar dados da meta trimestral (endpoint já existente)
  const { data: metasData, isLoading } = trpc.vendedores.metasTrimestraisAdmin.useQuery({ ano: 2025 });

  // Função para ativar/desativar fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setModoApresentacao(true);
      } catch (err) {
        console.error('Erro ao ativar fullscreen:', err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setModoApresentacao(false);
      }
    }
  };

  // Listener para detectar saída de fullscreen (ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setModoApresentacao(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f2e1]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5ec4e8]" />
      </div>
    );
  }

  // Filtrar Meta Trimestral 1
  const metaTrimestral1 = metasData?.find(m => m.trimestre === 'Meta Trimestral 1');

  if (!metaTrimestral1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f2e1]">
        <p className="text-[#222223]">Dados da Meta Trimestral 1 não encontrados</p>
      </div>
    );
  }

  // Ordenar vendedores por % atingido (maior para menor)
  const vendedoresOrdenados = [...metaTrimestral1.vendedores].sort((a, b) => b.percentual - a.percentual);

  // Gerar identificadores anônimos (AAAAA, BBBBB, CCCCC...)
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const vendedoresAnonimos = vendedoresOrdenados.map((v, index) => {
    const letra = letras[index % letras.length];
    return {
      identificador: letra.repeat(5), // AAAAA, BBBBB, CCCCC...
      meta: v.meta,
      vendido: v.vendido,
      falta: v.falta,
      percentual: v.percentual,
      percentualReceita: v.percentualReceita || 0,
      status: v.percentual >= 80 ? 'sucesso' : v.percentual >= 60 ? 'atencao' : 'risco'
    };
  });

  // Dados consolidados
  const metaTotal = metaTrimestral1.metaAgencia || 0;
  const vendidoTotal = metaTrimestral1.vendidoEquipe || 0;
  const faltaTotal = metaTrimestral1.faltaEquipe || 0;
  const percentualTotal = metaTrimestral1.percentualEquipe || 0;

  // Dados para gráfico de barras
  const dadosGrafico = vendedoresAnonimos.map(v => ({
    nome: v.identificador,
    'Meta': v.meta,
    'Vendido': v.vendido,
    'Percentual': v.percentual
  }));

  // Distribuição de performance
  const distribuicao = {
    sucesso: vendedoresAnonimos.filter(v => v.status === 'sucesso').length,
    atencao: vendedoresAnonimos.filter(v => v.status === 'atencao').length,
    risco: vendedoresAnonimos.filter(v => v.status === 'risco').length
  };

  // Cores para o gráfico
  const getCor = (percentual: number) => {
    if (percentual >= 80) return '#10b981'; // Verde
    if (percentual >= 60) return '#f59e0b'; // Amarelo
    return '#ef4444'; // Vermelho
  };

  return (
    <div className="min-h-screen bg-[#f9f2e1] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Oculto em modo apresentação */}
        {!modoApresentacao && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="Mundo Pró Viagens" className="h-12 saturate-150" />
              <div>
                <h1 className="text-3xl font-bold text-[#5ec4e8]">Meta Trimestral 1</h1>
                <p className="text-[#222223]">Dezembro/2025 - Janeiro/2026 - Fevereiro/2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-4 py-2 bg-[#5ec4e8] text-white rounded-lg hover:bg-[#4ab3d7] transition-colors"
              >
                <Maximize className="w-5 h-5" />
                Iniciar Apresentação
              </button>
              <Trophy className="w-12 h-12 text-[#ff5722]" />
            </div>
          </div>
        )}

        {/* Botão flutuante para sair da apresentação */}
        {modoApresentacao && (
          <button
            onClick={toggleFullscreen}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-[#ff5722] text-white rounded-lg hover:bg-[#e64a19] transition-colors shadow-lg"
          >
            <Minimize className="w-5 h-5" />
            Sair da Apresentação
          </button>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#5ec4e8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta da Agência</CardTitle>
              <Target className="h-4 w-4 text-[#5ec4e8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#222223]">
                R$ {metaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#10b981]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#10b981]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#10b981]">
                R$ {vendidoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#ff5722]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falta Atingir</CardTitle>
              <Target className="h-4 w-4 text-[#ff5722]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ff5722]">
                R$ {faltaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#5ec4e8]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">% Atingido</CardTitle>
              <Award className="h-4 w-4 text-[#5ec4e8]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#5ec4e8]">
                {Number(percentualTotal).toFixed(2)}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-[#5ec4e8] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(percentualTotal, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#222223]">Distribuição de Performance</CardTitle>
            <CardDescription>Quantos vendedores em cada faixa de desempenho</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xl">
                  {distribuicao.sucesso}
                </div>
                <div>
                  <p className="font-semibold text-green-700">No Caminho</p>
                  <p className="text-sm text-green-600">≥ 80% da meta</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xl">
                  {distribuicao.atencao}
                </div>
                <div>
                  <p className="font-semibold text-yellow-700">Atenção</p>
                  <p className="text-sm text-yellow-600">60% - 79% da meta</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl">
                  {distribuicao.risco}
                </div>
                <div>
                  <p className="font-semibold text-red-700">Em Risco</p>
                  <p className="text-sm text-red-600">{'<'} 60% da meta</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Progresso por Vendedor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#222223]">Progresso Individual (Anônimo)</CardTitle>
            <CardDescription>Vendedores ordenados por % de atingimento da meta</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  }
                />
                <Legend />
                <Bar dataKey="Meta" fill="#5ec4e8" />
                <Bar dataKey="Vendido" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza: Distribuição de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#222223]">Distribuição de Vendas por Vendedor</CardTitle>
            <CardDescription>Participação de cada vendedor no total vendido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={vendedoresAnonimos.map((v) => ({
                    name: v.identificador,
                    value: v.vendido,
                    percentual: v.percentual,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(entry) => `${entry.name}: ${((entry.value / vendidoTotal) * 100).toFixed(1)}%`}
                  labelLine
                >
                  {vendedoresAnonimos.map((v, index) => {
                    const cores = [
                      '#5ec4e8', '#ff5722', '#10b981', '#fbbf24', '#8b5cf6',
                      '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
                      '#6366f1', '#f43f5e', '#22d3ee', '#a3e635', '#c026d3'
                    ];
                    return <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />;
                  })}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    'Vendido'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ranking de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#222223]">Ranking de Performance</CardTitle>
            <CardDescription>Classificação por % de atingimento (sem identificação)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendedoresAnonimos.map((v, index) => {
                const corBorda = v.status === 'sucesso' ? 'border-green-500' : v.status === 'atencao' ? 'border-yellow-500' : 'border-red-500';
                const corBg = v.status === 'sucesso' ? 'bg-green-50' : v.status === 'atencao' ? 'bg-yellow-50' : 'bg-red-50';
                const corBarra = v.status === 'sucesso' ? 'bg-green-500' : v.status === 'atencao' ? 'bg-yellow-500' : 'bg-red-500';
                const corTexto = v.status === 'sucesso' ? 'text-green-700' : v.status === 'atencao' ? 'text-yellow-700' : 'text-red-700';
                
                return (
                  <div
                    key={v.identificador}
                    className={`p-4 border-2 rounded-lg ${corBorda} ${corBg} transition-all hover:shadow-md`}
                  >
                    {/* Header: Identificador + Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                        {index === 1 && <Trophy className="w-6 h-6 text-gray-400" />}
                        {index === 2 && <Trophy className="w-6 h-6 text-amber-600" />}
                        <span className="font-mono font-bold text-xl text-[#222223]">{v.identificador}</span>
                      </div>
                      <Badge
                        className={`text-white text-lg px-3 py-1 ${corBarra}`}
                      >
                        {Number(v.percentual).toFixed(2)}%
                      </Badge>
                    </div>

                    {/* Barra de Progresso Visual */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className={`h-4 rounded-full transition-all ${corBarra} flex items-center justify-end pr-2`}
                          style={{ width: `${Math.min(Number(v.percentual), 100)}%` }}
                        >
                          {Number(v.percentual) > 10 && (
                            <span className="text-xs font-bold text-white">
                              {Number(v.percentual).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Métricas em Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white p-2 rounded border">
                        <span className="text-gray-600 block text-xs">Meta</span>
                        <span className="font-semibold text-[#222223] block">
                          R$ {(v.meta / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-gray-600 block text-xs">Vendido</span>
                        <span className="font-semibold text-green-600 block">
                          R$ {(v.vendido / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-gray-600 block text-xs">Falta</span>
                        <span className="font-semibold text-[#ff5722] block">
                          R$ {(v.falta / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border">
                        <span className="text-gray-600 block text-xs">% Receita</span>
                        <span className="font-semibold text-[#5ec4e8] block">
                          {Number(v.percentualReceita).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Mensagem Motivacional */}
        <Card className="bg-gradient-to-r from-[#5ec4e8] to-[#ff5722] text-white">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">🚀 Vamos Juntos Atingir a Meta!</h2>
              <p className="text-lg">
                Estamos a <strong>R$ {faltaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> de alcançar nosso objetivo.
              </p>
              <p>Cada venda conta! Continue se dedicando e vamos conquistar essa meta juntos! 💪</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
