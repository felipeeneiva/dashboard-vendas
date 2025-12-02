# Problema Técnico - TypeScript Cache

## Descrição

O TypeScript do cliente não está reconhecendo os novos endpoints (`percentualReceitaConsolidado` e `metasTrimestraisAdmin`) implementados no router `vendedores`.

## Status Atual

✅ **Backend funcionando perfeitamente:**
- Endpoints implementados em `server/routers.ts` (linhas 235-392)
- 3 testes unitários passando (100%)
- Servidor rodando sem erros
- Endpoints acessíveis via HTTP

❌ **Frontend com erro de TypeScript:**
```
Property 'percentualReceitaConsolidado' does not exist on type 'DecorateRouterRecord<...>'
Property 'metasTrimestraisAdmin' does not exist on type 'DecorateRouterRecord<...>'
```

## Tentativas de Solução

1. ✅ Reiniciar servidor múltiplas vezes
2. ✅ Limpar cache do Vite (`rm -rf node_modules/.vite`)
3. ✅ Verificar sintaxe do código (sem erros)
4. ✅ Remover duplicatas de código
5. ❌ TypeScript ainda não reconhece os endpoints

## Causa Provável

- Cache do TypeScript Language Server (LSP) não está atualizando
- Possível incompatibilidade de versão do tRPC
- Problema de hot-reload do AppRouter type

## Solução Temporária

As queries foram comentadas no `client/src/pages/Home.tsx`:

```typescript
// PROBLEMA TÉCNICO: TypeScript não reconhece endpoint
// const { data: percentualReceita } = trpc.vendedores.percentualReceitaConsolidado.useQuery();
const percentualReceita = undefined;

// PROBLEMA TÉCNICO: TypeScript não reconhece endpoint
// const { data: metasTrimestrais } = trpc.vendedores.metasTrimestraisAdmin.useQuery();
const metasTrimestrais = undefined;
```

## Próximos Passos

### Opção 1: Reiniciar Ambiente Completo
```bash
# Parar servidor
# Limpar todos os caches
rm -rf node_modules/.vite
rm -rf client/node_modules/.vite
rm -rf .tsbuildinfo

# Reiniciar servidor
pnpm dev
```

### Opção 2: Usar Fetch Direto
Ao invés de usar tRPC no cliente, fazer requisições HTTP diretas:

```typescript
// Buscar % de receita
const response = await fetch('/api/trpc/vendedores.percentualReceitaConsolidado');
const percentualReceita = await response.json();

// Buscar metas trimestrais
const response2 = await fetch('/api/trpc/vendedores.metasTrimestraisAdmin');
const metasTrimestrais = await response2.json();
```

### Opção 3: Atualizar Dependências
```bash
pnpm update @trpc/server @trpc/client @trpc/react-query
```

## Endpoints Implementados

### 1. `vendedores.metasTrimestraisAdmin`
Retorna metas trimestrais de todos os vendedores agrupadas por trimestre.

**Resposta:**
```typescript
[
  {
    trimestre: "Meta Trimestral 1",
    metaAgencia: 1000000000, // centavos
    vendedores: [
      {
        vendedorId: 1,
        nome: "Gabriel",
        meta: 48000000,
        superMeta: 57600000,
        bonusMeta: 480000,
        bonusSuperMeta: 160000,
        vendido: 0,
        falta: 48000000,
        percentual: 0
      },
      // ...
    ],
    progressoEquipe: {
      totalVendido: 0,
      totalFalta: 1000000000,
      percentual: 0
    }
  }
]
```

### 2. `vendedores.percentualReceitaConsolidado`
Calcula % de receita consolidada (ano 2025 e mês atual).

**Resposta:**
```typescript
{
  ano: {
    percentual: 15.25,
    totalVendas: 2647459996,
    totalReceita: 403971239
  },
  mes: {
    mesAno: "Dezembro/2025",
    percentual: 0,
    totalVendas: 0,
    totalReceita: 0
  }
}
```

### 3. `vendedores.rankingPercentualReceita`
Ranking de vendedores por melhor % de receita.

**Resposta:**
```typescript
[
  {
    vendedorId: 11,
    percentual: 18.5,
    totalVendas: 50561005,
    totalReceita: 9212512
  },
  // ...
]
```

## Testes

Todos os testes estão passando:
```bash
$ pnpm test endpoints-dashboard-admin

✓ deve buscar metas trimestrais de todos os vendedores
✓ deve calcular percentual de receita consolidado
✓ deve retornar ranking de vendedores por percentual de receita

Test Files  1 passed (1)
Tests  3 passed (3)
```
