import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, DollarSign, Percent, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function MeuPainel() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data, isLoading, error } = trpc.painelVendedor.meusDados.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mostrar loading enquanto verifica autenticação
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa fazer login com sua conta Google para acessar seu painel individual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login com Google</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar erro se vendedor não encontrado
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Acesso Negado</CardTitle>
            <CardDescription>
              {error?.message || "Vendedor não encontrado. Verifique se seu email está cadastrado no sistema."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email da conta: <span className="font-mono">{user?.email}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { vendedor, totais, metaTrimestralIndividual, metaGeralEquipe } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Olá, {vendedor.nome}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Aqui está o resumo do seu desempenho
          </p>
        </div>

        {/* Cards de Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {totais.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado 2024-2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receita</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totais.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado 2024-2025
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
              <Percent className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                R$ {totais.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Acumulado 2024-2025
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Meta Trimestral Individual */}
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Sua Meta Trimestral (Set-Out-Nov/2025)
            </CardTitle>
            <CardDescription>
              Acompanhe seu progresso em relação à meta do trimestre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Meta Individual</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {metaTrimestralIndividual.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendido</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metaTrimestralIndividual.vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falta</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {metaTrimestralIndividual.falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm font-medium">{metaTrimestralIndividual.percentual}%</span>
              </div>
              <Progress value={parseFloat(metaTrimestralIndividual.percentual)} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Meta Geral da Equipe */}
        <Card className="border-2 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Meta Geral da Equipe (Set-Out-Nov/2025)
            </CardTitle>
            <CardDescription>
              Desempenho coletivo de todos os vendedores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Meta da Equipe</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {metaGeralEquipe.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendido pela Equipe</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {metaGeralEquipe.vendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Falta para a Meta</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {metaGeralEquipe.falta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Equipe</span>
                <span className="text-sm font-medium">{metaGeralEquipe.percentual}%</span>
              </div>
              <Progress value={parseFloat(metaGeralEquipe.percentual)} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
