import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Loader2 } from "lucide-react";

export default function TrocarSenhaVendedor() {
  const [, setLocation] = useLocation();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirma, setSenhaConfirma] = useState("");
  const [loading, setLoading] = useState(false);
  const [primeiroAcesso, setPrimeiroAcesso] = useState(false);

  useEffect(() => {
    // Verifica se tem token
    const token = localStorage.getItem("vendedor_token");
    const vendedorData = localStorage.getItem("vendedor_data");
    
    if (!token || !vendedorData) {
      toast.error("Você precisa fazer login primeiro");
      setLocation("/login-vendedor");
      return;
    }
    
    const vendedor = JSON.parse(vendedorData);
    setPrimeiroAcesso(vendedor.primeiroAcesso);
  }, [setLocation]);

  const trocarSenhaMutation = trpc.authVendedor.trocarSenha.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      
      // Atualiza dados do vendedor no localStorage
      const vendedorData = localStorage.getItem("vendedor_data");
      if (vendedorData) {
        const vendedor = JSON.parse(vendedorData);
        vendedor.primeiroAcesso = false;
        localStorage.setItem("vendedor_data", JSON.stringify(vendedor));
      }
      
      setLocation("/vendedor");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao trocar senha");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senhaNova || !senhaConfirma) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (senhaNova.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (senhaNova !== senhaConfirma) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    const token = localStorage.getItem("vendedor_token");
    if (!token) {
      toast.error("Token não encontrado");
      setLocation("/login-vendedor");
      return;
    }
    
    setLoading(true);
    trocarSenhaMutation.mutate({
      token,
      senhaAtual: primeiroAcesso ? "" : senhaAtual,
      senhaNova,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-auto" />
            )}
          </div>
          <CardTitle className="text-2xl text-center">
            {primeiroAcesso ? "Criar Nova Senha" : "Trocar Senha"}
          </CardTitle>
          <CardDescription className="text-center">
            {primeiroAcesso 
              ? "Por segurança, crie uma nova senha para sua conta"
              : "Altere sua senha de acesso"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!primeiroAcesso && (
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <Input
                  id="senhaAtual"
                  type="password"
                  placeholder="••••••••"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="senhaNova">Nova Senha</Label>
              <Input
                id="senhaNova"
                type="password"
                placeholder="••••••••"
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senhaConfirma">Confirmar Nova Senha</Label>
              <Input
                id="senhaConfirma"
                type="password"
                placeholder="••••••••"
                value={senhaConfirma}
                onChange={(e) => setSenhaConfirma(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {primeiroAcesso ? "Criar Senha" : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
