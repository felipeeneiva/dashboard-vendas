import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { APP_LOGO } from "@/const";
import { useState, useEffect } from "react";

export default function MetasTrimestral() {
  const [, setLocation] = useLocation();
  const [metasTrimestrais, setMetasTrimestrais] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trpc/vendedores.metasTrimestraisAdmin')
      .then(res => res.json())
      .then(data => {
        setMetasTrimestrais(data.result?.data?.json || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!metasTrimestrais || metasTrimestrais.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Nenhuma meta trimestral encontrada</p>
      </div>
    );
  }

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatusBadge = (progresso: number) => {
    if (progresso >= 100) {
      return { label: "Atingida", variant: "default" as const, color: "bg-green-500" };
    } else if (progresso >= 70) {
      return { label: "No caminho", variant: "secondary" as const, color: "bg-yellow-500" };
    } else {
      return { label: "Em risco", variant: "destructive" as const, color: "bg-red-500" };
    }
  };

  const getProgressColor = (progresso: number) => {
    if (progresso >= 100) return "bg-green-500";
    if (progresso >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <img 
              src={APP_LOGO} 
              alt="Mundo Pró Viagens" 
              className="h-10 w-auto object-contain"
              style={{ filter: 'brightness(1.05) saturate(1.15)' }}
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Metas Trimestrais
              </h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Clique em um card para ver detalhes completos do trimestre
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metasTrimestrais.map((meta: any) => {
            const progresso = (meta.vendidoEquipe / meta.metaAgencia) * 100;
            const status = getStatusBadge(progresso);
            const progressColor = getProgressColor(progresso);

            return (
              <Card
                key={meta.trimestre}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-400"
                onClick={() => setLocation(`/metas-trimestral/${encodeURIComponent(meta.trimestre)}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <Badge variant={status.variant} className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{meta.trimestre}</CardTitle>
                  <CardDescription className="text-xs">
                    {meta.vendedores.length} vendedores
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Meta da Agência */}
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Meta da Agência
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatarMoeda(meta.metaAgencia)}
                    </p>
                  </div>

                  {/* Total Vendido */}
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Total Vendido
                    </p>
                    <p className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {formatarMoeda(meta.vendidoEquipe)}
                    </p>
                  </div>

                  {/* Progresso */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Progresso
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {progresso.toFixed(2)}%
                      </p>
                    </div>
                    <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`absolute h-full ${progressColor} transition-all duration-500`}
                        style={{ width: `${Math.min(progresso, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="pt-2 flex items-center justify-between text-sm text-blue-600 dark:text-blue-400 font-medium">
                    <span>Clique para ver detalhes</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mensagem se não houver metas */}
        {metasTrimestrais.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              Nenhuma meta trimestral configurada ainda
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
