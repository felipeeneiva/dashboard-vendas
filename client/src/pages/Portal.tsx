import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Building2, 
  Eye,
  HeadphonesIcon,
  FileText,
  MessageSquare
} from "lucide-react";

/**
 * Página inicial do Portal Mundo Pró
 * Mostra cards dinâmicos baseados no role do usuário
 */
export default function Portal() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <img src={APP_LOGO} alt="Mundo Pró Viagens" className="h-16 mx-auto mb-4" />
            <CardTitle>Portal Mundo Pró</CardTitle>
            <CardDescription>Faça login para acessar o portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/api/oauth/login'}
              className="w-full"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cards disponíveis por role
  const cards = {
    vendedor: [
      {
        title: "Meu Dashboard",
        description: "Acompanhe suas vendas, metas e comissões",
        icon: BarChart3,
        href: "/meu-painel",
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "Minhas Metas",
        description: "Veja suas metas trimestrais e progresso",
        icon: Target,
        href: "/metas-trimestral",
        color: "from-green-500 to-green-600"
      }
    ],
    admin: [
      {
        title: "Dashboard Geral",
        description: "Visão completa de vendas e performance da equipe",
        icon: TrendingUp,
        href: "/",
        color: "from-purple-500 to-purple-600"
      },
      {
        title: "Gestão de Vendedores",
        description: "Gerencie vendedores, metas e performance individual",
        icon: Users,
        href: "/monitoramento",
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "Fornecedores",
        description: "Análise de performance por operadora e fornecedor",
        icon: Building2,
        href: "/fornecedores",
        color: "from-orange-500 to-orange-600"
      },
      {
        title: "Análises e Relatórios",
        description: "Relatórios detalhados e análises avançadas",
        icon: FileText,
        href: "/analises",
        color: "from-indigo-500 to-indigo-600"
      },
      {
        title: "Apresentação de Resultados",
        description: "Visualização executiva para reuniões",
        icon: Eye,
        href: "/apresentacao-resultados",
        color: "from-pink-500 to-pink-600"
      },
      {
        title: "Suporte",
        description: "Gerenciar tickets e atendimento ao time",
        icon: HeadphonesIcon,
        href: "/suporte",
        color: "from-teal-500 to-teal-600"
      }
    ],
    suporte: [
      {
        title: "Central de Suporte",
        description: "Gerencie tickets e atendimentos",
        icon: HeadphonesIcon,
        href: "/suporte",
        color: "from-teal-500 to-teal-600"
      },
      {
        title: "Base de Conhecimento",
        description: "Documentação e guias para o time",
        icon: FileText,
        href: "/suporte/base-conhecimento",
        color: "from-blue-500 to-blue-600"
      },
      {
        title: "Chat com Vendedores",
        description: "Comunicação direta com o time de vendas",
        icon: MessageSquare,
        href: "/suporte/chat",
        color: "from-green-500 to-green-600"
      }
    ]
  };

  // Determinar quais cards mostrar baseado no role
  const userCards = user.role === "admin" 
    ? cards.admin 
    : user.role === "suporte"
    ? cards.suporte
    : cards.vendedor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={APP_LOGO} alt="Mundo Pró Viagens" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Portal Mundo Pró</h1>
                <p className="text-sm text-slate-600">
                  Bem-vindo, {user.name || user.email}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                {user.role === "admin" ? "Administrador" : user.role === "suporte" ? "Suporte" : "Vendedor"}
              </span>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Logout logic
                  window.location.href = '/api/oauth/logout';
                }}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {user.role === "admin" ? "Painel Administrativo" : user.role === "suporte" ? "Central de Suporte" : "Minha Área"}
          </h2>
          <p className="text-slate-600">
            {user.role === "admin" 
              ? "Acesso completo a todos os sistemas e relatórios" 
              : user.role === "suporte"
              ? "Ferramentas para atendimento e suporte ao time"
              : "Acompanhe seu desempenho e metas"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-blue-300"
                onClick={() => setLocation(card.href)}
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-blue-50">
                    Acessar →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
