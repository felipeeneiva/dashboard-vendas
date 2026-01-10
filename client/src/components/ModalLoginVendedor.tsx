import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ModalLoginVendedorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalLoginVendedor({ open, onOpenChange }: ModalLoginVendedorProps) {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.authVendedor.login.useMutation({
    onSuccess: (data) => {
      // Salva token no localStorage
      localStorage.setItem("vendedor_token", data.token);
      localStorage.setItem("vendedor_data", JSON.stringify(data.vendedor));
      
      toast.success(`Bem-vindo, ${data.vendedor.nome}!`);
      
      // Se é primeiro acesso, redireciona para troca de senha
      if (data.vendedor.primeiroAcesso) {
        setLocation("/vendedor/trocar-senha");
      } else {
        setLocation("/vendedor");
      }
      
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Email ou senha incorretos");
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    setLoading(true);
    loginMutation.mutate({ email, senha });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Login de Vendedor</DialogTitle>
          <DialogDescription>
            Entre com seu email e senha para acessar seu painel
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@mundoproviagens.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Problemas para acessar?</p>
          <p>Entre em contato com o administrador</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
