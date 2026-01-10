import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModalLoginVendedor } from "@/components/ModalLoginVendedor";
import { getLoginUrl } from "@/const";
import { Users, Shield, TrendingUp, Target } from "lucide-react";

export default function Welcome() {
  const [modalLoginAberto, setModalLoginAberto] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Mundo Pró Viagens
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dashboard de Vendas
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Bem-vindo ao Dashboard de Vendas
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Escolha seu tipo de acesso para continuar
            </p>
          </div>

          {/* Access Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Admin Access */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Acesso Admin</CardTitle>
                    <CardDescription>Para gerentes e administradores</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    Visualizar todos os vendedores
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    Métricas consolidadas
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    Gerenciar metas e análises
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    Relatórios completos
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.href = getLoginUrl()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Entrar com Google
                </Button>
              </CardContent>
            </Card>

            {/* Vendor Access */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Acesso Vendedor</CardTitle>
                    <CardDescription>Para vendedores da equipe</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                    Seu painel individual
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                    Suas vendas e comissões
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                    Progresso de metas
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                    Análises personalizadas
                  </p>
                </div>
                <Button 
                  onClick={() => setModalLoginAberto(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  Acessar com Email
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Precisa de ajuda?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>
                <strong>Vendedores:</strong> Use seu email corporativo (vendas@mundoproviagens.com.br) e a senha fornecida. Você será solicitado a criar uma nova senha no primeiro acesso.
              </p>
              <p>
                <strong>Administradores:</strong> Entre com sua conta Google corporativa para acessar o dashboard completo.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                Problemas de acesso? Entre em contato com o administrador do sistema.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Login de Vendedor */}
      <ModalLoginVendedor 
        open={modalLoginAberto} 
        onOpenChange={setModalLoginAberto} 
      />
    </div>
  );
}
