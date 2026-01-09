# Apresentação Meta Trimestral 1 - Exemplo de Uso

## Visão Geral

Esta página foi criada especificamente para apresentações em reuniões, **sem expor nomes de vendedores**.

## Acesso

**URL:** `/apresentacao-meta-trimestral-1`

**Botão de acesso:** No dashboard principal (Home), há um botão "Meta T1" no header.

## Características

### 1. Anonimização Completa

- Vendedores são identificados como **AAAAA, BBBBB, CCCCC, DDDDD, EEEEE...**
- Nenhum nome real é exibido
- Ideal para motivar a equipe sem expor identidades

### 2. Ordenação por Performance

- Ranking ordenado por **% de atingimento da meta**
- Vendedor com melhor performance aparece primeiro (AAAAA)
- Vendedor com menor performance aparece por último (OOOOO)

### 3. Dados Consolidados

**Cards no topo:**
- Meta da Agência (total)
- Total Vendido (soma de todos)
- Falta Atingir (diferença)
- % Atingido (progresso geral)

### 4. Distribuição de Performance

**Três categorias:**
- 🟢 **No Caminho** (≥ 80% da meta): Vendedores que estão bem encaminhados
- 🟡 **Atenção** (60% - 79% da meta): Vendedores que precisam acelerar
- 🔴 **Em Risco** (< 60% da meta): Vendedores que precisam de atenção urgente

### 5. Visualizações

**Gráfico de Barras:**
- Compara Meta (azul) vs Vendido (verde/amarelo/vermelho)
- Cores indicam performance (verde = bom, amarelo = atenção, vermelho = risco)

**Tabela de Ranking:**
- Identificador anônimo
- Badge colorido com % atingido
- Meta individual
- Valor vendido
- Quanto falta para atingir

### 6. Troféus para Top 3

- 🥇 1º lugar: Troféu dourado
- 🥈 2º lugar: Troféu prateado
- 🥉 3º lugar: Troféu bronze

## Exemplo de Dados (Janeiro 2026)

### Resumo Geral
- **Meta da Agência:** R$ 57.120,00
- **Total Vendido:** R$ 9.372,97
- **Falta Atingir:** R$ 47.747,03
- **% Atingido:** 16,41%

### Distribuição
- **No Caminho:** 0 vendedores
- **Atenção:** 0 vendedores
- **Em Risco:** 15 vendedores

### Top 5 Performers (Anônimos)

1. **AAAAA** - 31,72% (R$ 761,30 de R$ 2.400,00)
2. **BBBBB** - 26,16% (R$ 1.569,74 de R$ 6.000,00)
3. **CCCCC** - 25,67% (R$ 1.078,28 de R$ 4.200,00)
4. **DDDDD** - 23,08% (R$ 1.384,75 de R$ 6.000,00)
5. **EEEEE** - 22,39% (R$ 967,20 de R$ 4.320,00)

## Como Usar em Reuniões

### 1. Projetar a Página

Abra a URL no navegador e projete na tela da reunião.

### 2. Apresentar os Dados

- Comece pelos **cards consolidados** (meta total, vendido, falta)
- Mostre a **distribuição de performance** (quantos em cada categoria)
- Apresente o **ranking anônimo** para motivar

### 3. Mensagem Motivacional

Use a mensagem no final:

> 🚀 **Vamos Juntos Atingir a Meta!**
> 
> Estamos a R$ 47.747,03 de alcançar nosso objetivo.
> 
> Cada venda conta! Continue se dedicando e vamos conquistar essa meta juntos! 💪

### 4. Incentivar Competição Saudável

- Vendedores podem se identificar internamente com suas letras
- Cria competição sem expor publicamente
- Motiva quem está atrás a "subir no ranking"

## Privacidade e Segurança

✅ **Nenhum nome é exibido**
✅ **Apenas identificadores anônimos**
✅ **Ordenação por performance**
✅ **Dados consolidados visíveis**

## Benefícios

1. **Transparência sem exposição:** Todos veem o progresso geral sem constrangimento
2. **Motivação:** Ranking cria competição saudável
3. **Clareza:** Visualizações facilitam entendimento
4. **Profissionalismo:** Design limpo e organizado para reuniões

## Notas Técnicas

- Dados vêm do endpoint `trpc.vendedores.metasTrimestraisAdmin`
- Filtro: `trimestre = 'Meta Trimestral 1'`
- Ordenação: Descendente por `percentual`
- Identificadores: Letras A-Z repetidas 5 vezes (AAAAA, BBBBB...)

## Melhorias Futuras

- [ ] Adicionar filtro para outros trimestres
- [ ] Exportar como PDF para distribuição
- [ ] Adicionar gráfico de evolução ao longo do trimestre
- [ ] Permitir alternar entre view anônima e view com nomes (apenas admin)
