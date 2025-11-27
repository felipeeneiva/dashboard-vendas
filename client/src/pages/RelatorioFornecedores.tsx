import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
// Função auxiliar para formatar moeda
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};
import DashboardLayout from "@/components/DashboardLayout";

const MESES_2024 = [
  "Janeiro/2024", "Fevereiro/2024", "Março/2024", "Abril/2024",
  "Maio/2024", "Junho/2024", "Julho/2024", "Agosto/2024",
  "Setembro/2024", "Outubro/2024", "Novembro/2024", "Dezembro/2024"
];

const MESES_2025 = [
  "Janeiro/2025", "Fevereiro/2025", "Março/2025", "Abril/2025",
  "Maio/2025", "Junho/2025", "Julho/2025", "Agosto/2025",
  "Setembro/2025", "Outubro/2025", "Novembro/2025", "Dezembro/2025"
];

export default function RelatorioFornecedores() {
  const [tipoVisualizacao, setTipoVisualizacao] = useState<"mensal" | "anual">("anual");
  const [mesSelecionado, setMesSelecionado] = useState<string>("Novembro/2025");
  const [anoSelecionado, setAnoSelecionado] = useState<number>(2025);

  // Query mensal
  const { data: dadosMensal, isLoading: loadingMensal } = trpc.fornecedores.porMes.useQuery(
    { mes: mesSelecionado },
    { enabled: tipoVisualizacao === "mensal" }
  );

  // Query anual
  const { data: dadosAnual, isLoading: loadingAnual } = trpc.fornecedores.porAno.useQuery(
    { ano: anoSelecionado },
    { enabled: tipoVisualizacao === "anual" }
  );

  const dados = tipoVisualizacao === "mensal" ? dadosMensal : dadosAnual;
  const isLoading = tipoVisualizacao === "mensal" ? loadingMensal : loadingAnual;

  // Calcula totais
  const totais = dados?.reduce(
    (acc, item) => ({
      tarifa: acc.tarifa + item.tarifa,
      taxa: acc.taxa + item.taxa,
      duTebOver: acc.duTebOver + item.duTebOver,
      incentivo: acc.incentivo + item.incentivo,
      valorTotal: acc.valorTotal + item.valorTotal,
      quantidade: acc.quantidade + item.quantidade,
    }),
    { tarifa: 0, taxa: 0, duTebOver: 0, incentivo: 0, valorTotal: 0, quantidade: 0 }
  );

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Relatório de Fornecedores</h1>
          <p className="text-muted-foreground mt-2">
            Análise consolidada de custos por operadora
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecione o período para análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Visualização</label>
                <Select
                  value={tipoVisualizacao}
                  onValueChange={(value) => setTipoVisualizacao(value as "mensal" | "anual")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tipoVisualizacao === "mensal" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Mês</label>
                  <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...MESES_2024, ...MESES_2025].map((mes) => (
                        <SelectItem key={mes} value={mes}>
                          {mes}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {tipoVisualizacao === "anual" && (
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Totais */}
        {totais && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tarifa Total</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatarMoeda(totais.tarifa)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Taxa Total</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatarMoeda(totais.taxa)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>DU/TEB/OVER</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatarMoeda(totais.duTebOver)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Incentivo Total</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatarMoeda(totais.incentivo)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Valor Total</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{formatarMoeda(totais.valorTotal)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Fornecedores Consolidados</CardTitle>
            <CardDescription>
              {tipoVisualizacao === "mensal"
                ? `Dados de ${mesSelecionado}`
                : `Dados consolidados de ${anoSelecionado}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : dados && dados.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operadora</TableHead>
                      <TableHead className="text-right">Tarifa</TableHead>
                      <TableHead className="text-right">Taxa</TableHead>
                      <TableHead className="text-right">DU/TEB/OVER</TableHead>
                      <TableHead className="text-right">Incentivo</TableHead>
                      <TableHead className="text-right font-bold">Valor Total</TableHead>
                      <TableHead className="text-right">Qtd. Vendas</TableHead>
                      {tipoVisualizacao === "anual" && (
                        <TableHead className="text-right">Meses Ativos</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dados.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium capitalize">
                          {item.operadora}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(item.tarifa)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(item.taxa)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(item.duTebOver)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatarMoeda(item.incentivo)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatarMoeda(item.valorTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantidade}
                        </TableCell>
                        {tipoVisualizacao === "anual" && (
                          <TableCell className="text-right">
                            {"mesesAtivos" in item ? (item as any).mesesAtivos : "-"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado encontrado para o período selecionado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
