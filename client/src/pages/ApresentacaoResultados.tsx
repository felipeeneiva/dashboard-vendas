import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award, DollarSign, Target, Percent } from "lucide-react";

interface DadosApresentacao {
  blackFriday: {
    totalVendido: number;
    ticketMedio: number;
    totalVendas: number;
  };
  metaTrimestral: {
    metaTotal: number;
    vendidoTotal: number;
    percentualMedio: number;
    bateramMeta: number;
    faixa80_99: number;
    faixa60_79: number;
    abaixo60: number;
    totalVendedores: number;
  };
  bonificacao: {
    total: number;
    vendedoresBonificados: number;
  };
}

export default function ApresentacaoResultados() {
  const [dados, setDados] = useState<DadosApresentacao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trpc/apresentacao.resultados")
      .then((res) => res.json())
      .then((data) => {
        console.log("Resposta completa da API:", data);
        console.log("Dados extraídos:", data.result?.data?.json);
        if (data.result?.data?.json) {
          setDados(data.result.data.json);
        } else {
          console.error("Estrutura de dados inesperada:", data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando apresentação...</p>
        </div>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Erro ao carregar dados</p>
      </div>
    );
  }

  const percentualAtingimento = dados?.metaTrimestral?.metaTotal 
    ? (dados.metaTrimestral.vendidoTotal / dados.metaTrimestral.metaTotal) * 100 
    : 0;
  const acimaDaMeta = (dados?.metaTrimestral?.bateramMeta || 0) + (dados?.metaTrimestral?.faixa80_99 || 0);
  const abaixoDaMeta = (dados?.metaTrimestral?.faixa60_79 || 0) + (dados?.metaTrimestral?.abaixo60 || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Apresentação de Resultados
          </h1>
          <p className="text-xl text-gray-600">
            Black Friday & Meta Trimestral 4 (Set-Out-Nov/2025)
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Reunião - {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </Badge>
        </div>

        {/* Black Friday Results */}
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Award className="h-8 w-8" />
              Resultados da Black Friday (Novembro/2025)
            </CardTitle>
            <CardDescription className="text-purple-100 text-lg">
              Desempenho do mês de novembro
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <p className="text-sm font-medium text-gray-600">Total Vendido</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {(dados?.blackFriday?.totalVendido || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  R$ {(dados?.blackFriday?.ticketMedio || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-orange-600" />
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {dados?.blackFriday?.totalVendas || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta Trimestral Results */}
        <Card className="border-2 border-indigo-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Target className="h-8 w-8" />
              Meta Trimestral 4 (Set-Out-Nov/2025)
            </CardTitle>
            <CardDescription className="text-indigo-100 text-lg">
              Desempenho consolidado do trimestre
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Progresso da Meta</span>
                <span className="text-2xl font-bold text-indigo-600">{percentualAtingimento.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${Math.min(percentualAtingimento, 100)}%` }}
                >
                  {percentualAtingimento >= 10 && (
                    <span className="text-xs font-bold text-white">{percentualAtingimento.toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>R$ {(dados?.metaTrimestral?.vendidoTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                <span>Meta: R$ {(dados?.metaTrimestral?.metaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <p className="text-lg font-semibold text-gray-700">Acima da Expectativa</p>
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">{acimaDaMeta}</p>
                <p className="text-sm text-gray-600">
                  {dados?.metaTrimestral?.bateramMeta || 0} bateram a meta • {dados?.metaTrimestral?.faixa80_99 || 0} próximos (≥80%)
                </p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingDown className="h-6 w-6 text-orange-600" />
                  <p className="text-lg font-semibold text-gray-700">Abaixo da Expectativa</p>
                </div>
                <p className="text-4xl font-bold text-orange-600 mb-2">{abaixoDaMeta}</p>
                <p className="text-sm text-gray-600">
                  {dados?.metaTrimestral?.faixa60_79 || 0} com esforço (60-79%) • {dados?.metaTrimestral?.abaixo60 || 0} precisam melhorar (&lt;60%)
                </p>
              </div>
            </div>

            {/* Average Performance */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Percent className="h-6 w-6 text-purple-600" />
                <p className="text-lg font-semibold text-gray-700">Percentual Médio de Atingimento</p>
              </div>
              <p className="text-4xl font-bold text-purple-600 mb-2">{(dados?.metaTrimestral?.percentualMedio || 0).toFixed(2)}%</p>
              <p className="text-sm text-gray-600">
                Média de performance da equipe • Quanto maior, melhor a eficiência
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bonification Criteria */}
        <Card className="border-2 border-green-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Award className="h-8 w-8" />
              Critérios de Bonificação
            </CardTitle>
            <CardDescription className="text-green-100 text-lg">
              Como será calculado o bônus de cada vendedor
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 p-6 rounded-lg border-2 border-green-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-gray-900">✅ Bateu ou Considerado (≥96%)</p>
                  <Badge className="bg-green-600 text-white text-lg px-4 py-1">100% do Bônus</Badge>
                </div>
                <p className="text-sm text-gray-600">Atingiu a meta ou ficou muito próximo</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-100 p-6 rounded-lg border-2 border-blue-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-gray-900">📊 Houve Esforço (≥80%)</p>
                  <Badge className="bg-blue-600 text-white text-lg px-4 py-1">50% do Bônus</Badge>
                </div>
                <p className="text-sm text-gray-600">Quase chegou lá, reconhecimento pelo esforço</p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-100 p-6 rounded-lg border-2 border-orange-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-gray-900">💡 Valor Simbólico (60-79%)</p>
                  <Badge className="bg-orange-600 text-white text-lg px-4 py-1">20% do Bônus</Badge>
                </div>
                <p className="text-sm text-gray-600">Reconhecimento simbólico pelo trabalho</p>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-rose-100 p-6 rounded-lg border-2 border-red-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-gray-900">❌ Abaixo da Expectativa (&lt;60%)</p>
                  <Badge variant="destructive" className="text-lg px-4 py-1">Sem Bônus</Badge>
                </div>
                <p className="text-sm text-gray-600">Precisa melhorar para próxima meta</p>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-6 w-6 text-indigo-600" />
                <p className="text-lg font-semibold text-gray-700">Total Investido em Bônus</p>
              </div>
              <p className="text-4xl font-bold text-indigo-600 mb-2">
                R$ {(dados?.bonificacao?.total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-600">
                {dados?.bonificacao?.vendedoresBonificados || 0} vendedores serão bonificados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Efficiency Message */}
        <Card className="border-2 border-yellow-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
            <CardTitle className="text-3xl flex items-center gap-3">
              <Percent className="h-8 w-8" />
              Eficiência vs Volume
            </CardTitle>
            <CardDescription className="text-yellow-100 text-lg">
              Por que % de receita importa tanto quanto volume de vendas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>Não é apenas sobre vender muito, mas vender bem!</strong> Um vendedor com <strong>alta % de receita</strong> significa que ele está gerando mais lucro com menos esforço operacional.
              </p>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-lg">
                <p className="text-base text-gray-700 mb-3">
                  <strong>Exemplo prático:</strong>
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Vendedor A: R$ 100k em vendas, 80% de receita = <strong>R$ 80k de lucro</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">✗</span>
                    <span>Vendedor B: R$ 100k em vendas, 50% de receita = <strong>R$ 50k de lucro</strong></span>
                  </li>
                </ul>
                <p className="text-base text-gray-700 mt-4">
                  <strong>Resultado:</strong> Mesmo volume de vendas, mas o Vendedor A gerou <strong>60% mais lucro</strong> para a empresa!
                </p>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Busquem sempre <strong>maximizar a % de receita</strong> nas vendas. Isso significa menos trabalho operacional, mais lucro e melhor performance geral da equipe! 🎯
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600 pb-8">
          <p className="text-lg">Parabéns a todos pelo esforço! Vamos continuar crescendo juntos! 🚀</p>
        </div>
      </div>
    </div>
  );
}
