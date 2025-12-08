import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * Componente de proteção de rotas baseado em roles
 * 
 * @param allowedRoles - Array de roles permitidos (ex: ["admin", "suporte"])
 * @param redirectTo - Rota para redirecionar se não autorizado (padrão: "/")
 * @param children - Componente filho a ser renderizado se autorizado
 */
interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ 
  allowedRoles, 
  redirectTo = "/", 
  children 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Aguardar carregamento da autenticação
    if (loading) return;

    // Se não está autenticado, redirecionar para home
    if (!user) {
      setLocation(redirectTo);
      return;
    }

    // Se não tem permissão, redirecionar
    if (!allowedRoles.includes(user.role)) {
      setLocation(redirectTo);
      return;
    }
  }, [user, loading, allowedRoles, redirectTo, setLocation]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Se não está autenticado ou não tem permissão, não renderizar nada
  // (o useEffect já vai redirecionar)
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}

/**
 * Hook para verificar se usuário tem permissão
 * Útil para lógica condicional dentro de componentes
 */
export function useHasRole(allowedRoles: string[]): boolean {
  const { user, loading } = useAuth();

  if (loading || !user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Hook para verificar se usuário é admin
 */
export function useIsAdmin(): boolean {
  return useHasRole(["admin"]);
}

/**
 * Hook para verificar se usuário é suporte
 */
export function useIsSupport(): boolean {
  return useHasRole(["admin", "suporte"]);
}
