# Sistema de Permissões - Portal Mundo Pró Viagens

## Visão Geral

O Dashboard de Vendas da Mundo Pró Viagens implementa um sistema completo de controle de acesso baseado em **roles** (papéis/funções), garantindo que cada usuário veja apenas as informações e funcionalidades apropriadas ao seu nível de acesso.

## Estrutura de Roles

O sistema possui **3 níveis de acesso** distintos:

### 1. **Admin** (Administrador)
- **Quem**: Gerentes e administradores da agência
- **Emails autorizados**: 
  - `felipe@mundoproviagens.com.br`
  - `vendas@mundoproviagens.com.br`
- **Acesso completo**: Visualiza todos os dados, gerencia metas, monitora performance da equipe

### 2. **User** (Vendedor)
- **Quem**: Vendedores da equipe
- **Acesso individual**: Cada vendedor vê apenas seus próprios dados
- **Funcionalidades limitadas**: Painel pessoal com métricas individuais

### 3. **Suporte** (Equipe de Suporte)
- **Quem**: Time de suporte técnico e atendimento
- **Acesso específico**: Central de tickets, base de conhecimento, chat com vendedores
- **Sem acesso administrativo**: Não visualiza dados financeiros completos

---

## Matriz de Permissões

| Funcionalidade | Admin | Vendedor | Suporte |
|----------------|-------|----------|---------|
| **Dashboard Principal** (`/`) | ✅ | ❌ (redireciona) | ❌ (redireciona) |
| **Meu Painel** (`/meu-painel`) | ✅ | ✅ | ✅ |
| **Análises** (`/analises`) | ✅ | ❌ | ❌ |
| **Metas Trimestral** (`/metas-trimestral`) | ✅ | ❌ | ❌ |
| **Progresso Semanal** (`/progresso-semanal`) | ✅ | ❌ | ❌ |
| **Fornecedores** (`/fornecedores`) | ✅ | ❌ | ❌ |
| **Dashboard Fornecedores** (`/fornecedores/dashboard`) | ✅ | ❌ | ❌ |
| **Monitoramento** (`/monitoramento`) | ✅ | ❌ | ❌ |
| **Central de Suporte** (`/suporte`) | ✅ | ❌ | ✅ |
| **Portal** (`/portal`) | ✅ | ✅ | ✅ |
| **Apresentação de Resultados** (`/apresentacao-resultados`) | ✅ | ✅ | ✅ |

---

## Detalhamento por Role

### 🔵 Admin - Acesso Total

**Páginas Disponíveis:**
- ✅ Dashboard Principal com métricas consolidadas
- ✅ Ranking de todos os vendedores
- ✅ Análises avançadas (gráficos, comparativos)
- ✅ Metas trimestrais (visualização e gestão)
- ✅ Relatório de fornecedores
- ✅ Monitoramento de vendas em tempo real
- ✅ Central de suporte (gerenciamento de tickets)
- ✅ Painel individual (pode ver como vendedor)

**Menu Lateral:**
```
📊 Visão Geral
   - Dashboard
   - Meu Painel

📈 Metas e Performance
   - Análises
   - Metas Trimestral
   - Progresso Semanal

📦 Fornecedores
   - Relatório
   - Dashboard

🔍 Monitoramento
   - Vendas em Tempo Real

🎧 Suporte
   - Central de Suporte
```

**Funcionalidades Administrativas:**
- 🔴 Botão "Limpar 2023" (remover dados antigos)
- 🔵 Botão "Atualizar Dados" (sincronizar Google Sheets)
- 📊 Botão "Análises" (acessar análises avançadas)
- 🎯 Botão "Metas Trimestral" (visualizar metas)
- 📦 Botão "Fornecedores" (relatório de custos)
- 👁️ Botão "Monitoramento" (vendas em tempo real)

---

### 🟢 Vendedor (User) - Acesso Individual

**Páginas Disponíveis:**
- ✅ Meu Painel (`/meu-painel`) - **EXCLUSIVO**
- ✅ Portal (`/portal`)
- ✅ Apresentação de Resultados (`/apresentacao-resultados`)

**Menu Lateral:**
```
📊 Visão Geral
   - Meu Painel
```

**Redirecionamento Automático:**
- Se tentar acessar `/` (dashboard admin) → redireciona para `/meu-painel`
- Se tentar acessar qualquer rota administrativa → redireciona para `/`

**O que o Vendedor Vê:**

#### Métricas Pessoais (Ano Selecionado)
- 💰 Total de Vendas
- 💵 Total de Receita
- 💸 Total de Comissões
- 📊 Média % Receita (margem de lucro)
- 📈 Média Mensal

#### Gráfico de Evolução Mensal
- Vendas mês a mês
- Receita mês a mês
- % de Receita (linha)
- Identificação do melhor mês 🏆

#### Meta Trimestral Atual
- Meta individual
- Super meta (120%)
- Vendido até o momento
- Quanto falta
- Bônus Meta (R$)
- Bônus Super Meta (+ R$)
- Barra de progresso visual

#### Metas Anteriores (Dropdown)
- Histórico de trimestres passados
- Progresso individual em cada meta
- Meta da agência e progresso coletivo

#### Comparativo 2024 vs 2025
- Tabela mês a mês
- Variação percentual
- Indicadores visuais (↑ verde, ↓ vermelho)

#### Top 10 Destinos
- Ranking de destinos mais vendidos
- Quantidade de vendas por destino
- Valor total por destino

**Segurança de Dados:**
- ✅ Vendedor vê **APENAS** seus próprios dados
- ❌ Não consegue acessar dados de outros vendedores
- ❌ Não vê ranking geral da equipe
- ❌ Não vê dados de fornecedores
- ❌ Não vê monitoramento em tempo real

---

### 🟣 Suporte - Acesso Específico

**Páginas Disponíveis:**
- ✅ Meu Painel (`/meu-painel`)
- ✅ Central de Suporte (`/suporte`)
- ✅ Portal (`/portal`)

**Menu Lateral:**
```
📊 Visão Geral
   - Meu Painel

🎧 Suporte
   - Central de Suporte
```

**Redirecionamento Automático:**
- Se tentar acessar `/` (dashboard admin) → redireciona para `/meu-painel`
- Se tentar acessar rotas administrativas → redireciona para `/`

**Central de Suporte - Funcionalidades:**

#### Métricas de Atendimento
- 🕐 Tickets Abertos
- 🎧 Em Atendimento
- ✅ Resolvidos Hoje
- ⏱️ Tempo Médio de Resolução

#### Gestão de Tickets
- Lista de tickets recentes
- Status: Aberto, Em Atendimento, Resolvido
- Prioridade: Alta, Média, Baixa
- Informações do vendedor solicitante
- Tempo desde abertura

#### Ações Rápidas
- 📚 Base de Conhecimento (documentação e guias)
- 💬 Chat com Vendedores (atendimento em tempo real)
- 👥 Equipe de Suporte (gerenciar atendentes)

**Limitações:**
- ❌ Não vê dashboard administrativo completo
- ❌ Não vê dados financeiros de todos os vendedores
- ❌ Não vê relatórios de fornecedores
- ❌ Não pode atualizar dados do Google Sheets

---

## Implementação Técnica

### Componente `ProtectedRoute`

Localização: `client/src/components/ProtectedRoute.tsx`

```tsx
<ProtectedRoute allowedRoles={["admin"]}>
  <PaginaAdministrativa />
</ProtectedRoute>
```

**Funcionalidades:**
- Verifica autenticação do usuário
- Valida se o role está na lista de permitidos
- Redireciona automaticamente se não autorizado
- Mostra loading durante verificação

### Hooks Auxiliares

```tsx
// Verificar se tem permissão específica
const hasAccess = useHasRole(["admin", "suporte"]);

// Verificar se é admin
const isAdmin = useIsAdmin();

// Verificar se é suporte
const isSupport = useIsSupport();
```

### Menu Dinâmico

Localização: `client/src/components/DashboardLayout.tsx`

Função `filterMenuByRole()` filtra automaticamente os itens do menu baseado no role do usuário:

```tsx
const menuCategories = [
  {
    title: "Visão Geral",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["admin"] },
      { icon: Users, label: "Meu Painel", path: "/meu-painel", roles: ["admin", "user", "suporte"] },
    ]
  },
  // ...
];
```

### Rotas Protegidas

Localização: `client/src/App.tsx`

```tsx
<Route path="/analises">
  <ProtectedRoute allowedRoles={["admin"]}>
    <Analises />
  </ProtectedRoute>
</Route>

<Route path="/suporte">
  <ProtectedRoute allowedRoles={["admin", "suporte"]}>
    <Suporte />
  </ProtectedRoute>
</Route>
```

---

## Autenticação

### Google OAuth

O sistema utiliza **Google OAuth** para autenticação:

1. Usuário faz login com conta Google
2. Sistema identifica o email do usuário
3. Busca no banco de dados o vendedor correspondente
4. Atribui o role apropriado (admin, user, suporte)

### Identificação de Admins

Emails específicos são identificados como admins:

```typescript
const admins = [
  'felipe@mundoproviagens.com.br',
  'vendas@mundoproviagens.com.br'
];
```

### Banco de Dados

Tabela `users`:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  role ENUM('admin', 'user', 'suporte') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Tabela `vendedores`:
```sql
CREATE TABLE vendedores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(320) UNIQUE NOT NULL,
  sheetId VARCHAR(255) NOT NULL,
  metaTrimestral INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Fluxo de Acesso

### Vendedor Comum

```
1. Login com Google OAuth
   ↓
2. Sistema identifica email (ex: danilo@mundoproviagens.com.br)
   ↓
3. Busca vendedor no banco de dados
   ↓
4. Atribui role: "user"
   ↓
5. Redireciona para /meu-painel
   ↓
6. Menu mostra apenas "Meu Painel"
   ↓
7. Vendedor vê apenas seus próprios dados
```

### Administrador

```
1. Login com Google OAuth
   ↓
2. Sistema identifica email (felipe@mundoproviagens.com.br)
   ↓
3. Reconhece como admin
   ↓
4. Atribui role: "admin"
   ↓
5. Acessa dashboard principal (/)
   ↓
6. Menu mostra todas as opções
   ↓
7. Admin vê dados de todos os vendedores
```

### Suporte

```
1. Login com Google OAuth
   ↓
2. Sistema identifica email (suporte@mundoproviagens.com.br)
   ↓
3. Busca usuário no banco
   ↓
4. Atribui role: "suporte"
   ↓
5. Redireciona para /meu-painel
   ↓
6. Menu mostra "Meu Painel" e "Central de Suporte"
   ↓
7. Suporte acessa tickets e base de conhecimento
```

---

## Segurança

### Proteção em Múltiplas Camadas

1. **Frontend (React)**
   - Componente `ProtectedRoute` valida acesso
   - Menu dinâmico oculta opções não permitidas
   - Redirecionamento automático

2. **Backend (tRPC)**
   - Endpoints protegidos com `protectedProcedure`
   - Validação de role no servidor
   - Filtro de dados por vendedor

3. **Banco de Dados**
   - Consultas filtradas por `vendedorId`
   - Validação de email para identificação
   - Constraint UNIQUE em emails

### Exemplo de Endpoint Protegido

```typescript
// server/routers.ts
painelVendedor: router({
  meusDados: protectedProcedure
    .input(z.object({ ano: z.number() }))
    .query(async ({ ctx, input }) => {
      // ctx.user contém dados do usuário autenticado
      const vendedor = await getVendedorByEmail(ctx.user.email);
      
      if (!vendedor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendedor não encontrado'
        });
      }
      
      // Retorna APENAS dados deste vendedor
      return getMetricasVendedor(vendedor.id, input.ano);
    }),
}),
```

---

## Testes

### Testes Unitários

Localização: `server/controle-acesso.test.ts`

**28 testes implementados** validando:

- ✅ Definição de roles (3 roles: admin, user, suporte)
- ✅ Permissões de Admin (6 testes)
- ✅ Permissões de Vendedor (5 testes)
- ✅ Permissões de Suporte (4 testes)
- ✅ Rotas públicas (2 testes)
- ✅ Menu dinâmico (4 testes)
- ✅ Redirecionamentos (3 testes)
- ✅ Segurança de dados (3 testes)

**Executar testes:**
```bash
pnpm test server/controle-acesso.test.ts
```

**Resultado esperado:**
```
✓ server/controle-acesso.test.ts (28)
  ✓ Sistema de Controle de Acesso por Roles (28)
    
Test Files  1 passed (1)
     Tests  28 passed (28)
```

---

## Adicionar Novo Usuário

### Adicionar Vendedor

1. **Inserir no banco de dados:**
```sql
INSERT INTO vendedores (nome, email, sheetId, metaTrimestral)
VALUES ('João Silva', 'joao@mundoproviagens.com.br', 'ID_DA_PLANILHA', 600000);
```

2. **Primeiro login:**
   - Usuário faz login com Google OAuth
   - Sistema cria registro em `users` automaticamente
   - Role padrão: `user`

3. **Acesso automático:**
   - Vendedor é redirecionado para `/meu-painel`
   - Vê apenas seus próprios dados

### Adicionar Membro do Suporte

1. **Inserir no banco de dados:**
```sql
INSERT INTO users (openId, name, email, role)
VALUES ('GOOGLE_OPEN_ID', 'Maria Suporte', 'maria@mundoproviagens.com.br', 'suporte');
```

2. **Primeiro login:**
   - Usuário faz login com Google OAuth
   - Sistema identifica role `suporte`

3. **Acesso automático:**
   - Membro do suporte acessa `/suporte`
   - Gerencia tickets e atendimento

### Promover para Admin

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'usuario@mundoproviagens.com.br';
```

---

## Manutenção

### Verificar Roles no Banco

```sql
SELECT email, role, lastSignedIn 
FROM users 
ORDER BY lastSignedIn DESC;
```

### Listar Vendedores Ativos

```sql
SELECT nome, email, metaTrimestral 
FROM vendedores 
ORDER BY nome;
```

### Auditoria de Acesso

```sql
SELECT u.email, u.role, u.lastSignedIn, v.nome
FROM users u
LEFT JOIN vendedores v ON u.email = v.email
ORDER BY u.lastSignedIn DESC;
```

---

## Roadmap Futuro

### Funcionalidades Planejadas

- [ ] **Sistema de Tickets Completo**
  - Criação de tickets pelos vendedores
  - Atribuição automática para suporte
  - Histórico de atendimentos
  - SLA e métricas de tempo

- [ ] **Base de Conhecimento**
  - Artigos de ajuda
  - Tutoriais em vídeo
  - FAQ dinâmico
  - Busca inteligente

- [ ] **Chat em Tempo Real**
  - WebSocket para comunicação instantânea
  - Notificações push
  - Histórico de conversas
  - Status online/offline

- [ ] **Auditoria e Logs**
  - Registro de acessos
  - Histórico de alterações
  - Relatórios de segurança
  - Alertas de atividades suspeitas

- [ ] **Roles Adicionais**
  - `gerente`: Acesso intermediário entre admin e vendedor
  - `financeiro`: Acesso específico a relatórios financeiros
  - `marketing`: Acesso a análises e apresentações

---

## Suporte

Para dúvidas ou problemas com o sistema de permissões:

- **Email**: suporte@mundoproviagens.com.br
- **Telefone**: (XX) XXXX-XXXX
- **Central de Suporte**: https://[seu-dominio]/suporte

---

**Última atualização**: Janeiro 2026  
**Versão do sistema**: 1.0  
**Desenvolvido para**: Mundo Pró Viagens
