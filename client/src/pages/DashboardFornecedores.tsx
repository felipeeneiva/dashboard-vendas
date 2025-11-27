import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Função auxiliar para formatar moeda
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const CORES = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export default function DashboardFornecedores() {
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025);
  const [operadoraSelecionada, setOperadoraSelecionada] = useState<string>("");

  // Query top 10
  const { data: top10, isLoading: loadingTop10 } = trpc.fornecedores.top10.useQuery({ ano: anoSelecionado });

  // Query dados anuais para o comparativo
  const { data: dadosAnual, isLoading: loadingAnual } = trpc.fornecedores.porAno.useQuery({ ano: anoSelecionado });

  // Query evolução mensal
  const { data: evolucaoMensal, isLoading: loadingEvolucao } = trpc.fornecedores.evolucaoMensal.useQuery(
    { operadora: operadoraSelecionada, ano: anoSelecionado },
    { enabled: operadoraSelecionada !== "" }
  );

  // Prepara dados para o gráfico de comparativo de custos (top 5)
  const dadosComparativo = dadosAnual
    ?.slice(0, 5)
    .map(item => ({
      operadora: item.operadora.substring(0, 20), // Limita tamanho do nome
      Tarifa: item.tarifa,
      Taxa: item.taxa,
      'DU/TEB/OVER': item.duTebOver,
      Incentivo: item.incentivo,
    }));

  // Prepara dados para o gráfico de pizza (distribuição de valor total)
  const dadosPizza = top10?.map((item, index) => ({
    name: item.operadora.substring(0, 15),
    value: item.valorTotal,
    fill: CORES[index % CORES.length]
  }));

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard Executivo - Fornecedores</h1>
          <p className="text-muted-foreground mt-2">
            Análise visual e comparativa de fornecedores
          </p>
        </div>

        {/* Filtro de Ano */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Ano</label>
                <Select
                  value={anoSelecionado.toString()}
                  onValueChange={(value) => setAnoSelecionado(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Operadora (para evolução mensal)</label>
                <Select value={operadoraSelecionada} onValueChange={setOperadoraSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma operadora" />
                  </SelectTrigger>
                  <SelectContent>
                    {top10?.map((item) => (
                      <SelectItem key={item.operadora} value={item.operadora}>
                        {item.operadora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Fornecedores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top 10 Fornecedores por Volume</CardTitle>
            <CardDescription>Ranking de fornecedores por valor total em {anoSelecionado}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTop10 ? (
              <Skeleton className="h-80 w-full" />
            ) : top10 && top10.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={top10}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="operadora" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatarMoeda(value)}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatarMoeda(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="valorTotal" fill="#3b82f6" name="Valor Total" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado encontrado
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Distribuição de Valor (Pizza) */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Valor</CardTitle>
              <CardDescription>Participação dos top 10 fornecedores</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTop10 ? (
                <Skeleton className="h-80 w-full" />
              ) : dadosPizza && dadosPizza.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatarMoeda(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado encontrado
                </p>
              )}
            </CardContent>
          </Card>

          {/* Comparativo de Custos */}
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Custos</CardTitle>
              <CardDescription>Análise de TARIFA, TAXA, DU/TEB/OVER e INCENTIVO (Top 5)</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAnual ? (
                <Skeleton className="h-80 w-full" />
              ) : dadosComparativo && dadosComparativo.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={dadosComparativo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="operadora" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatarMoeda(value)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatarMoeda(value)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Tarifa" fill="#3b82f6" />
                    <Bar dataKey="Taxa" fill="#10b981" />
                    <Bar dataKey="DU/TEB/OVER" fill="#f59e0b" />
                    <Bar dataKey="Incentivo" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado encontrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Evolução Mensal */}
        {operadoraSelecionada && (
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal - {operadoraSelecionada}</CardTitle>
              <CardDescription>Histórico de valor total por mês em {anoSelecionado}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingEvolucao ? (
                <Skeleton className="h-80 w-full" />
              ) : evolucaoMensal && evolucaoMensal.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={evolucaoMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatarMoeda(value)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatarMoeda(value)}
                      labelStyle={{ color: '#000' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="valorTotal" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Valor Total"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Selecione uma operadora para ver a evolução mensal
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
