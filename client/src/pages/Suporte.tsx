import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HeadphonesIcon, 
  MessageSquare, 
  FileText, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Users
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO } from "@/const";

/**
 * Página da Central de Suporte
 * Área para gerenciar tickets e atendimento ao time
 */
export default function Suporte() {
  const { user } = useAuth();

  // Verificar se usuário tem permissão (admin ou suporte)
  const hasAccess = user && (user.role === "admin" || user.role === "suporte");

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta área.
                <br />
                Apenas administradores e equipe de suporte podem acessar.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={APP_LOGO} alt="Mundo Pró Viagens" className="h-12" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Central de Suporte</h1>
              <p className="text-slate-600">
                Gerencie tickets e atendimento ao time de vendas
              </p>
            </div>
          </div>
          <Button>
            <MessageSquare className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+3 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Atendimento</CardTitle>
              <HeadphonesIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Sendo resolvidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+18% vs ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">-15% vs semana passada</p>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets Recentes</CardTitle>
            <CardDescription>
              Últimas solicitações de suporte da equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: "#1234",
                  titulo: "Erro ao atualizar metas",
                  vendedor: "Felipe Santos",
                  status: "aberto",
                  prioridade: "alta",
                  tempo: "há 5 min"
                },
                {
                  id: "#1233",
                  titulo: "Dúvida sobre comissões",
                  vendedor: "Maria Silva",
                  status: "em_atendimento",
                  prioridade: "media",
                  tempo: "há 15 min"
                },
                {
                  id: "#1232",
                  titulo: "Acesso ao dashboard",
                  vendedor: "João Oliveira",
                  status: "resolvido",
                  prioridade: "baixa",
                  tempo: "há 1h"
                },
              ].map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-600">{ticket.id}</span>
                        <Badge
                          variant={
                            ticket.status === "aberto"
                              ? "destructive"
                              : ticket.status === "em_atendimento"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {ticket.status === "aberto"
                            ? "Aberto"
                            : ticket.status === "em_atendimento"
                            ? "Em Atendimento"
                            : "Resolvido"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            ticket.prioridade === "alta"
                              ? "border-red-500 text-red-700"
                              : ticket.prioridade === "media"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-green-500 text-green-700"
                          }
                        >
                          {ticket.prioridade === "alta"
                            ? "Alta"
                            : ticket.prioridade === "media"
                            ? "Média"
                            : "Baixa"}
                        </Badge>
                      </div>
                      <p className="font-medium text-slate-900 mt-1">{ticket.titulo}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                        <Users className="w-3 h-3" />
                        <span>{ticket.vendedor}</span>
                        <span>•</span>
                        <span>{ticket.tempo}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Base de Conhecimento</CardTitle>
                  <CardDescription>Documentação e guias</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Chat com Vendedores</CardTitle>
                  <CardDescription>Atendimento em tempo real</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Equipe de Suporte</CardTitle>
                  <CardDescription>Gerenciar atendentes</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
