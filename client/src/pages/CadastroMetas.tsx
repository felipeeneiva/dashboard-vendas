import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Trash2, Edit, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { APP_LOGO } from "@/const";
import { useLocation } from "wouter";

export default function CadastroMetas() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [todosVendedores, setTodosVendedores] = useState(true);
  const [vendedoresSelecionados, setVendedoresSelecionados] = useState<number[]>([]);
  
  // Estado do formulário
  const [nomeMeta, setNomeMeta] = useState("");
  const [trimestre, setTrimestre] = useState(""); // Ex: "Meta Trimestral 1"
  const [meses, setMeses] = useState<string[]>([]); // Ex: ["Dezembro/2025", "Janeiro/2026", "Fevereiro/2026"]
  const [valorMeta, setValorMeta] = useState("");
  const [valorBonus, setValorBonus] = useState("");
  const [valorSuperBonus, setValorSuperBonus] = useState("");
  const [metaAgencia, setMetaAgencia] = useState("");

  // Buscar todos os vendedores
  const { data: vendedores, isLoading: loadingVendedores } = trpc.vendedores.listar.useQuery();

  // Buscar metas cadastradas
  const { data: metasCadastradas, isLoading: loadingMetas, refetch } = trpc.metas.listar.useQuery();

  // Mutation para criar meta
  const criarMeta = trpc.metas.criar.useMutation({
    onSuccess: () => {
      toast.success("Meta criada com sucesso!");
      limparFormulario();
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao criar meta: ${error.message}`);
    },
  });

  // Mutation para deletar meta
  const deletarMeta = trpc.metas.deletar.useMutation({
    onSuccess: () => {
      toast.success("Meta deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar meta: ${error.message}`);
    },
  });

  const limparFormulario = () => {
    setNomeMeta("");
    setTrimestre("");
    setMeses([]);
    setValorMeta("");
    setValorBonus("");
    setValorSuperBonus("");
    setMetaAgencia("");
    setTodosVendedores(true);
    setVendedoresSelecionados([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!nomeMeta || !trimestre || meses.length === 0 || !valorMeta || !valorBonus || !valorSuperBonus) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!todosVendedores && vendedoresSelecionados.length === 0) {
      toast.error("Selecione pelo menos um vendedor");
      return;
    }

    // Converter valores para centavos
    const metaEmCentavos = Math.round(parseFloat(valorMeta) * 100);
    const bonusEmCentavos = Math.round(parseFloat(valorBonus) * 100);
    const superBonusEmCentavos = Math.round(parseFloat(valorSuperBonus) * 100);
    const metaAgenciaEmCentavos = metaAgencia ? Math.round(parseFloat(metaAgencia) * 100) : 0;

    // Calcular super meta (+20%)
    const superMetaEmCentavos = Math.round(metaEmCentavos * 1.2);

    // Determinar vendedores
    const vendedoresParaMeta = todosVendedores 
      ? (vendedores?.map(v => v.id) || [])
      : vendedoresSelecionados;

    criarMeta.mutate({
      nomeMeta,
      trimestre,
      meses,
      vendedorIds: vendedoresParaMeta,
      metaTrimestral: metaEmCentavos,
      superMeta: superMetaEmCentavos,
      bonusMeta: bonusEmCentavos,
      bonusSuperMeta: superBonusEmCentavos,
      metaAgencia: metaAgenciaEmCentavos,
    });
  };

  const handleVendedorToggle = (vendedorId: number) => {
    setVendedoresSelecionados(prev => 
      prev.includes(vendedorId)
        ? prev.filter(id => id !== vendedorId)
        : [...prev, vendedorId]
    );
  };

  const handleDeletarMeta = (trimestreId: string) => {
    if (confirm("Tem certeza que deseja deletar esta meta? Esta ação não pode ser desfeita.")) {
      deletarMeta.mutate({ trimestre: trimestreId });
    }
  };

  if (authLoading || loadingVendedores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f2e1] p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={APP_LOGO} 
            alt="Mundo Pró Viagens" 
            className="h-12 saturate-150"
          />
          <div>
            <h1 className="text-3xl font-bold text-[#5ec4e8]">Cadastro de Metas Trimestrais</h1>
            <p className="text-gray-600">Gerencie as metas da equipe</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          ← Voltar ao Dashboard
        </Button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Cadastro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Meta Trimestral
            </CardTitle>
            <CardDescription>
              Preencha os dados para criar uma nova meta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Meta */}
              <div className="space-y-2">
                <Label htmlFor="nomeMeta">Nome da Meta *</Label>
                <Input
                  id="nomeMeta"
                  placeholder="Ex: Meta Trimestral 1 - Dez/Jan/Fev"
                  value={nomeMeta}
                  onChange={(e) => setNomeMeta(e.target.value)}
                  required
                />
              </div>

              {/* Identificador do Trimestre */}
              <div className="space-y-2">
                <Label htmlFor="trimestre">Identificador do Trimestre *</Label>
                <Input
                  id="trimestre"
                  placeholder="Ex: Meta Trimestral 1"
                  value={trimestre}
                  onChange={(e) => setTrimestre(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Este identificador deve ser único para cada meta
                </p>
              </div>

              {/* Meses */}
              <div className="space-y-2">
                <Label htmlFor="meses">Meses do Trimestre *</Label>
                <Input
                  id="meses"
                  placeholder="Ex: Dezembro/2025, Janeiro/2026, Fevereiro/2026"
                  value={meses.join(", ")}
                  onChange={(e) => setMeses(e.target.value.split(",").map(m => m.trim()))}
                  required
                />
                <p className="text-xs text-gray-500">
                  Separe os meses por vírgula
                </p>
              </div>

              {/* Todos os Vendedores */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="todosVendedores"
                  checked={todosVendedores}
                  onCheckedChange={(checked) => setTodosVendedores(checked as boolean)}
                />
                <Label htmlFor="todosVendedores" className="cursor-pointer">
                  Aplicar para todos os vendedores
                </Label>
              </div>

              {/* Seleção de Vendedores */}
              {!todosVendedores && (
                <div className="space-y-2">
                  <Label>Selecione os Vendedores *</Label>
                  <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                    {vendedores?.map((vendedor) => (
                      <div key={vendedor.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vendedor-${vendedor.id}`}
                          checked={vendedoresSelecionados.includes(vendedor.id)}
                          onCheckedChange={() => handleVendedorToggle(vendedor.id)}
                        />
                        <Label htmlFor={`vendedor-${vendedor.id}`} className="cursor-pointer">
                          {vendedor.nome}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valor da Meta */}
              <div className="space-y-2">
                <Label htmlFor="valorMeta">Valor da Meta (por vendedor) *</Label>
                <Input
                  id="valorMeta"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 600000.00"
                  value={valorMeta}
                  onChange={(e) => setValorMeta(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Super Meta será calculada automaticamente (+20%)
                </p>
              </div>

              {/* Valor do Bônus Meta */}
              <div className="space-y-2">
                <Label htmlFor="valorBonus">Valor do Bônus (100% da meta) *</Label>
                <Input
                  id="valorBonus"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 6000.00"
                  value={valorBonus}
                  onChange={(e) => setValorBonus(e.target.value)}
                  required
                />
              </div>

              {/* Valor do Super Bônus */}
              <div className="space-y-2">
                <Label htmlFor="valorSuperBonus">Valor do Super Bônus (120% da meta) *</Label>
                <Input
                  id="valorSuperBonus"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 7900.00"
                  value={valorSuperBonus}
                  onChange={(e) => setValorSuperBonus(e.target.value)}
                  required
                />
              </div>

              {/* Meta da Agência */}
              <div className="space-y-2">
                <Label htmlFor="metaAgencia">Meta da Agência (opcional)</Label>
                <Input
                  id="metaAgencia"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 5712000.00"
                  value={metaAgencia}
                  onChange={(e) => setMetaAgencia(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Deixe em branco se não houver meta de agência
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={criarMeta.isPending}
                  className="flex-1"
                >
                  {criarMeta.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Criar Meta
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={limparFormulario}
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Metas Cadastradas */}
        <Card>
          <CardHeader>
            <CardTitle>Metas Cadastradas</CardTitle>
            <CardDescription>
              Gerencie as metas existentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMetas ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : metasCadastradas && metasCadastradas.length > 0 ? (
              <div className="space-y-4">
                {metasCadastradas.map((meta: any) => (
                  <Card key={meta.trimestre} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{meta.nomeMeta || meta.trimestre}</h3>
                          <p className="text-sm text-gray-600">{meta.meses?.join(", ")}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletarMeta(meta.trimestre)}
                          disabled={deletarMeta.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Meta:</p>
                          <p className="font-bold">R$ {(meta.metaTrimestral / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Super Meta:</p>
                          <p className="font-bold">R$ {(meta.superMeta / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Bônus Meta:</p>
                          <p className="font-bold text-green-600">R$ {(meta.bonusMeta / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Super Bônus:</p>
                          <p className="font-bold text-blue-600">R$ {(meta.bonusSuperMeta / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        {meta.metaAgencia > 0 && (
                          <div className="col-span-2">
                            <p className="text-gray-600">Meta da Agência:</p>
                            <p className="font-bold text-purple-600">R$ {(meta.metaAgencia / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                        )}
                        <div className="col-span-2">
                          <p className="text-gray-600">Vendedores:</p>
                          <p className="font-bold">{meta.totalVendedores} vendedor(es)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma meta cadastrada ainda.</p>
                <p className="text-sm">Crie sua primeira meta usando o formulário ao lado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
