import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { APP_LOGO } from "@/const";
import { Badge } from "@/components/ui/badge";

/**
 * Página de Apresentação da Meta Trimestral 1 (Dezembro/2025 - Janeiro/2026 - Fevereiro/2026)
 * Para uso em reuniões - SEM EXPOR NOMES DE VENDEDORES
 * Vendedores identificados como AAAAA, BBBBB, CCCCC... ordenados por progresso
 */
export default function ApresentacaoMetaTrimestral1() {
  // Buscar dados da meta trimestral (endpoint já existente)
  const { data: metasData, isLoading } = trpc.vendedores.metasTrimestraisAdmin.useQuery({ ano: 2025 });

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="Mundo Pró Viagens" className="h-12 saturate-150" />
            <div>
              <h1 className="text-3xl font-bold text-[#5ec4e8]">Meta Trimestral 1</h1>
              <p className="text-[#222223]">Dezembro/2025 - Janeiro/2026 - Fevereiro/2026</p>
            </div>
          </div>
          <Trophy className="w-12 h-12 text-[#ff5722]" />
        </div>

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
                <Bar dataKey="Vendido" fill="#10b981">
                  {dadosGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCor(entry.Percentual)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabela de Ranking Anônimo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#222223]">Ranking de Performance</CardTitle>
            <CardDescription>Classificação por % de atingimento (sem identificação)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vendedoresAnonimos.map((v, index) => (
                <div
                  key={v.identificador}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                      {index === 1 && <Trophy className="w-5 h-5 text-gray-400" />}
                      {index === 2 && <Trophy className="w-5 h-5 text-amber-600" />}
                      <span className="font-mono font-bold text-lg text-[#222223]">{v.identificador}</span>
                    </div>
                    <Badge
                      variant={v.status === 'sucesso' ? 'default' : v.status === 'atencao' ? 'secondary' : 'destructive'}
                      className={
                        v.status === 'sucesso'
                          ? 'bg-green-500'
                          : v.status === 'atencao'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }
                    >
                      {Number(v.percentual).toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Meta: </span>
                      <span className="font-semibold text-[#222223]">
                        R$ {v.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vendido: </span>
                      <span className="font-semibold text-green-600">
                        R$ {v.vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Falta: </span>
                      <span className="font-semibold text-[#ff5722]">
                        R$ {v.falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
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
