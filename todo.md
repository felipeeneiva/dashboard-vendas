# Dashboard de Vendas - TODO

## Features Planejadas

### Backend
- [x] Criar schema do banco de dados para vendedores e métricas
- [x] Implementar procedimento tRPC para extração de dados do Google Sheets
- [x] Criar sistema de cache para dados extraídos
- [x] Implementar atualização manual e automática dos dados
- [x] Criar sistema de metas por vendedor

### Frontend
- [x] Criar página principal do dashboard com visão geral
- [x] Implementar cards de métricas (Total Vendas, Receita, Comissão, %)
- [x] Criar tabela de vendedores com métricas mensais
- [ ] Implementar gráficos de evolução mensal
- [ ] Implementar: "Qual foi o vendedor com o melhor desempenho geral e em qual mês isso ocorreu?"
- [ ] Implementar: "Crie um resumo executivo em slides com os principais resultados"
- [ ] Implementar: "Gere um gráfico de barras comparando o desempenho de vendas de cada vendedor"
- [x] Implementar query: vendedor com melhor desempenho
- [x] Criar geração de resumo executivo em slides
- [x] Criar gráfico de barras comparativo de vendedores
- [x] Criar sistema de filtros (por vendedor, por mês, por ano)
- [x] Implementar filtro por ano (2024 ou 2025)
- [x] Implementar filtro por mês específico
- [ ] Implementar filtro por período (data inicial e final)
- [x] Adicionar filtros na página principal
- [x] Adicionar filtros na página de análises
- [x] Adicionar filtro na página de detalhes do vendedor
- [ ] Implementar indicadores visuais de metas (progresso, falta para meta)
- [x] Criar página individual por vendedor com detalhes
- [x] Implementar sistema de acesso individual por vendedor (links únicos)
- [x] Criar página de visualização individual para vendedores
- [x] Adicionar sistema de compartilhamento de links individuais
- [x] Implementar botão de atualização manual dos dados
- [x] Adicionar loading states e feedback visual

### Configuração
- [ ] Configurar IDs das planilhas no sistema
- [ ] Implementar interface para definir metas por vendedor
- [ ] Criar sistema de notificações quando meta é atingida

### Google Sheets Integration
- [x] Criar planilha mestre consolidada no Google Sheets
- [x] Desenvolver Google Apps Script para extração automática
- [x] Implementar dashboards e gráficos nativos no Sheets
- [x] Criar planilhas individuais para cada vendedor
- [x] Adicionar sistema de atualização automática (trigger)

### Dashboard de Metas Trimestral (Set-Out-Nov/2025)
- [x] Criar página de dashboard de metas trimestral
- [x] Adicionar metas individuais por vendedor no banco de dados
- [x] Implementar cálculo de progresso por vendedor (% atingido e % faltante)
- [x] Criar card de meta geral (R$ 10 milhões)
- [x] Implementar tabela de vendedores com indicadores visuais
- [x] Adicionar gráficos de progresso de metas
- [x] Criar endpoint tRPC para buscar dados do trimestre
- [x] Adicionar gráfico de pizza mostrando contribuição de cada vendedor
- [ ] Implementar envio de resumo diário por e-mail

### Gráfico de Funil Semanal
- [x] Criar endpoint para calcular progresso semanal da meta trimestral
- [x] Implementar gráfico de funil com etapas semanais
- [x] Adicionar indicadores de progresso por semana
- [x] Criar projeção se vai bater meta no ritmo atual
- [x] Adicionar comparativo semana atual vs anterior
- [x] Adicionar comparativo ano a ano na página de detalhes do vendedor
- [x] Implementar cálculo de variação percentual entre períodos
- [ ] Criar gráfico de evolução comparativa
- [x] Adicionar seletor de ordenação (Receita, Vendas, Comissão, Nome)
- [x] Adicionar indicadores visuais de tendência (setas verde/vermelha)

### Novas Features
- [x] Adicionar botão para limpar dados antigos (2023)
- [x] Implementar atualização automática diária às 6h
- [x] Criar endpoint para limpar métricas de anos específicos
- [x] Adicionar sistema de agendamento de tarefas (cron)

### Bugs Reportados
- [x] Corrigir erro JSON ao extrair dados do Gabriel (planilha retorna HTML - formato de abas em MAIÚSCULAS)
- [x] Investigar por que vendas do Gabriel não estão sendo contabilizadas (ID de planilha duplicado com Nathaly)
- [x] Corrigir filtro de mês na página principal (não está filtrando os dados)
- [x] Corrigir travamento na página de Metas Trimestral
- [x] Corrigir valores gigantescos no Google Sheets (multiplicação incorreta)
- [x] Corrigir conversão de valores (centavos vs reais)
- [x] Limitar extração apenas para 2024 e 2025 (remover 2023)
- [x] Corrigir dados incorretos da Luana em Março/2025

### Testes e Documentação
- [ ] Testar extração de dados de todas as planilhas
- [ ] Validar cálculos e totalizações
- [ ] Documentar como adicionar novos vendedores
- [ ] Criar guia de uso do dashboard
- [x] Criar manual completo de backup e exportação de dados
- [x] Documentar como migrar dados da Manus para Google Sheets
- [x] Criar guia de segurança e controle de acesso

### Bug Crítico Resolvido: Dados Zerados
- [x] Identificar causa (validação HTML incorreta rejeitando todas as respostas)
- [x] Fazer rollback para versão funcional
- [x] Criar script de atualização sem autenticação
- [x] Recuperar todos os dados (14 vendedores, 336 registros, 215 com dados)
- [x] Validar que dashboard está funcionando corretamente

### Bug: Metas Trimestrais Somando Todos os Meses
- [x] Investigar endpoint metasTrimestral que está somando dados errados
- [x] Corrigir filtro para somar apenas Setembro/2025, Outubro/2025 e Novembro/2025
- [x] Validar que cada vendedor tem apenas esses 3 meses somados
- [x] Testar que o total geral está correto

### Relatório de Fornecedores
- [ ] Investigar estrutura das planilhas para identificar colunas OPERADORA, TARIFA, TAXA, DU/TEB/OVER, INCENTIVO
- [x] Criar tabela no banco para armazenar dados de fornecedores por mês/ano
- [x] Implementar normalização de nomes (FRT Operadora = frt operadora = FRT OPERADORA)
- [x] Criar extração de dados de fornecedores das planilhas
- [x] Criar endpoints tRPC para consultar fornecedores (mensal e anual)
- [x] Desenvolver página de relatório com tabela consolidada
- [x] Adicionar filtros por fornecedor, mês e ano
- [x] Modificar script atualizar-dados.mjs para incluir extração de fornecedores
- [x] Adicionar extração de vendas diárias ao script de atualização
- [x] Corrigir constraint UNIQUE da tabela fornecedores (permitir múltiplas vendas)
- [x] Corrigir tipo de nomePassageiros para VARCHAR(255) em vendas_diarias
- [x] Executar script completo e popular banco com fornecedores (4.063 registros salvos!)
- [x] Validar página de Relatório de Fornecedores com dados reais
- [x] Validar Dashboard de Fornecedores com gráficos (Top 10, Pizza, Comparativo)
- [x] Criar dashboard executivo com gráficos de top 10 fornecedores
- [x] Adicionar gráfico de evolução mensal por operadora
- [x] Criar comparativo de custos (TARIFA vs TAXA vs DU/TEB/OVER)
- [x] Testar e validar valores TARIFA, TAXA, DU/TEB/OVER, INCENTIVO e VALOR TOTAL

### Monitoramento Real de Vendas Diário
- [x] Investigar estrutura de datas nas planilhas (coluna H = data fechamento, coluna L = nome passageiros para agrupar)
- [x] Criar tabela no banco para armazenar vendas diárias por vendedor
- [x] Implementar extração de vendas por dia (agrupar por coluna L, extrair data coluna H, valor coluna T)
- [x] Criar endpoints tRPC para consultar vendas diárias
- [x] Desenvolver página de monitoramento em tempo real
- [x] Adicionar métricas: vendas do dia, comparativo com ontem, ranking diário
- [ ] Adicionar progresso diário rumo à meta mensal (marcado como 'Em desenvolvimento')
- [x] Mostrar última atualização e botão de refresh
- [x] Reorganizar menu lateral com categorias profissionais
- [ ] Verificar e corrigir erros de extração JSON nas planilhas
- [x] Testar página de Monitoramento (interface funcionando, aguardando dados de diferença)

### Bug: Filtros de Meses Mostrando Duplicatas
- [x] Corrigir dropdown de meses para não mostrar Janeiro/2024, Janeiro/2025, Fevereiro/2024, etc. repetidos
- [x] Implementar filtro por ano (2024, 2025, Todos) que filtra meses disponíveis
- [x] Adicionar lógica para limpar filtro de mês quando ano muda
- [x] Testar que ao selecionar um mês específico, apenas dados daquele mês aparecem
- [x] Validar que dropdown de meses mostra apenas meses do ano selecionado (sem duplicatas)
- [x] Validar que totais atualizam corretamente ao mudar filtros


### Nova Abordagem: Vendas Diárias por Diferença de Totais
- [x] Remover lógica antiga de extração por data/passageiros (coluna H/L)
- [x] Implementar cálculo de vendas diárias: Total hoje - Total ontem
- [x] Criar função para buscar métricas ordenadas por data
- [x] Calcular diferenças entre dias consecutivos
- [x] Atualizar endpoints tRPC para usar nova lógica
- [x] Reescrever router vendasDiarias completo (hoje, comparativo, ranking)
- [x] Executar segunda atualização para criar dados de diferença
- [x] Testar página de Monitoramento com dados calculados
- [x] Validar lógica de cálculo de vendas por diferença (funciona corretamente)
- [x] Remover constraint UNIQUE de metricas (permitir múltiplas extrações por mês)
- [x] Criar função insertMetrica para inserir sem verificar duplicatas
- [x] Documentar que vendas aparecem quando há diferença real entre extrações


### Adicionar Botões de Ação no Cabeçalho
- [x] Botão "Análises" já existe e funciona
- [x] Botão "Metas Trimestral" já existe e funciona
- [x] Botão "Limpar 2023" já existe e funciona
- [x] Botão "Atualizar Dados" já existe e funciona
- [ ] Adicionar botão "Fornecedores" que redireciona para /fornecedores
- [ ] Testar navegação para página de Fornecedores


### Adicionar Botões de Navegação Rápida no Cabeçalho
- [x] Adicionar botão "Fornecedores" que redireciona para /fornecedores
- [x] Adicionar botão "Monitoramento" que redireciona para /monitoramento
- [x] Posicionar ao lado dos botões existentes (Análises, Metas Trimestral)
- [x] Testar navegação (botões aparecendo corretamente no cabeçalho)


### Investigação e Melhorias de Fornecedores
- [x] Investigar diferença de valores entre Dashboard (R$ 2,7M) e Relatório de Fornecedores (R$ 2,0M) em Novembro/2025
  - Dashboard mostra VENDAS TOTAIS (valor bruto)
  - Fornecedores mostra CUSTOS COM FORNECEDORES (tarifa + taxa + du/teb/over + incentivo)
  - Diferença representa margem de lucro, comissões e outros custos
- [x] Adicionar ordenação por Nome (A-Z) no Relatório de Fornecedores
- [x] Adicionar ordenação por Número de Vendas (maior primeiro) no Relatório de Fornecedores
- [x] Adicionar dropdown de ordenação nos filtros
- [x] Unificar variações de "Soul Travel" (soul travel, soultraveler, soul traveler, Soul)
- [x] Unificar variações de "Hero Seguro" (hero seguro, hero seguros, heroseguros)
- [x] Unificar variações de "Reserva Facil" (reserva facil, reservafacil)
- [x] Unificar variações de "Travel Global" (travel global, travelglobal)
- [x] Unificar variações de "Up Traslados" (up traslados, up translado)
- [x] Unificar variações de "Ancora" (ancora, ancora tur, ancoratur)
- [x] Unificar variações de "Brazuca" (brazuca, brazuka)
- [x] Unificar variações de "Abreu" (abreu, abreutur)
- [x] Unificar variações de "12go" (12go, 12 go, 12goasia, 12 go asia, 12go asia)
- [x] Unificar variações de "FRT Consolidadora" (frt consolidadora, frt, frt operadora, frt op)
- [x] Testar ordenações e validar totais
- [x] Validar ordenação por Valor Total (padrão)
- [x] Validar ordenação por Nome A-Z
- [x] Validar ordenação por Número de Vendas
- [x] Validar unificações de fornecedores (Soul Travel, Hero Seguro, etc.)


### Bug: Métricas Duplicadas Causando Valores Dobrados
- [ ] Remover métricas duplicadas de Novembro/2025 (Rafael, Nathaly)
- [ ] Corrigir lógica de agregação para usar apenas extração mais recente por mês
- [ ] Adicionar DISTINCT ou GROUP BY para evitar somas duplicadas
- [ ] Corrigir contagem de meses (mostra "2 meses" quando deveria ser "1")
- [ ] Validar que Nathaly mostra R$ 247.599,12 ao invés de R$ 495.198,24

### Correção: FRT Operadora vs FRT Consolidadora
- [x] Investigar variações de FRT no banco de dados
- [ ] Separar FRT Operadora (3 vendas) de FRT Consolidadora (559 vendas)
- [ ] Decidir o que fazer com "FRT" genérico (389 vendas)
- [ ] Atualizar aliases para remover unificação incorreta
- [ ] Atualizar registros no banco para refletir separação
- [ ] Testar e validar que aparecem separados no relatório


### Painel Individual para Vendedores
- [x] Criar sistema de autenticação por email para vendedores (usar OAuth existente)
- [x] Adicionar campo email na tabela vendedores
- [x] Atualizar emails de todos os 14 vendedores no banco
- [ ] Criar endpoint tRPC para buscar dados do vendedor logado (baseado no email)
- [ ] Criar página `/meu-painel` com métricas pessoais
- [ ] Exibir Total de Vendas, Receita, Comissões do vendedor
- [ ] Exibir Meta Trimestral Individual (quanto vendeu, quanto falta, percentual)
- [ ] Exibir Meta Geral da Equipe (R$ 10mi, total vendido, quanto falta)
- [ ] Implementar segurança: vendedor só vê seus próprios dados
- [ ] Testar login com diferentes emails de vendedores
- [ ] Validar que vendedor A não consegue ver dados do vendedor B

- [x] Corrigir controle de acesso no painel individual (/meu-painel) - cada vendedor deve ver apenas seus próprios dados
- [x] Implementar verificação de admin (felipe@mundoproviagens.com.br e vendas@mundoproviagens.com.br) para acesso ao dashboard completo
- [x] Testar que vendedores comuns não conseguem ver dados de outros vendedores

- [x] Corrigir controle de acesso no painel individual (/meu-painel) - cada vendedor deve ver apenas seus próprios dados
- [x] Implementar verificação de admin (felipe@mundoproviagens.com.br e vendas@mundoproviagens.com.br) para acesso ao dashboard completo
- [x] Testar que vendedores comuns não conseguem ver dados de outros vendedores

- [x] Adicionar extração de destinos (coluna K) por vendedor nas planilhas
- [x] Criar endpoint tRPC para evolução mensal do vendedor (gráfico de linha)
- [x] Criar endpoint tRPC para top destinos do vendedor
- [x] Criar endpoint tRPC para comparativo 2024 vs 2025 do vendedor
- [x] Adicionar gráfico de evolução mensal na página MeuPainel
- [x] Adicionar tabela comparativa 2024 vs 2025 na página MeuPainel
- [x] Adicionar ranking de top destinos na página MeuPainel
- [x] Adicionar estatísticas pessoais (ticket médio, melhor mês, crescimento)
- [x] Testar com vendedores que só têm dados de 2025

- [ ] Otimizar atualização para processar apenas últimos 2 meses (atual + anterior)
- [ ] Corrigir timeout que causa erro JSON no botão "Atualizar Dados"
- [ ] Testar atualização rápida após otimização

### Novo Trimestre de Metas (Dez/2025-Fev/2026)
- [x] Ler planilha editada com valores arredondados (bônus 1,1%)
- [x] Criar estrutura no banco para suportar múltiplos trimestres
- [x] Inserir metas do trimestre Dez/2025-Fev/2026 no banco
- [ ] Adicionar filtro de trimestre no dashboard admin
- [ ] Atualizar painel individual para mostrar metas do novo trimestre
- [ ] Testar visualização de ambos os trimestres (Set-Out-Nov e Dez-Jan-Fev)

### Implementação de Visualização de Metas Trimestrais
- [x] Atualizar nomenclatura das metas no banco (T4-2025 → Meta Trimestral 1, etc.)
- [x] Migrar meta antiga (Set-Out-Nov) para tabela metas_trimestrais como Meta Trimestral 4
- [x] Criar endpoints tRPC para buscar meta atual e histórico
- [x] Atualizar painel individual (/meu-painel) com meta atual em destaque
- [x] Adicionar dropdown de metas anteriores no painel individual
- [ ] Atualizar dashboard admin com meta atual
- [x] Testar visualização no painel individual (5 testes passando)

### Ajuste de Textos - Metas Trimestrais
- [x] Remover "(1%)" e "(1,1%)" dos labels de bônus
- [x] Remover "(+20%)" do label Super Meta
- [x] Alterar texto para "🎯 Atinja 100% da meta e ganhe R$ X"
- [x] Alterar texto para "🚀 Atinja sua super meta e ganhe + R$ X"

### Melhorias do Painel Individual e Dashboard Admin
- [x] Adicionar filtro/dropdown de ano (2024/2025) no painel individual
- [x] Mostrar por padrão apenas dados de 2025
- [x] Permitir acesso ao histórico de 2024 em seção separada
- [x] Renomear "Ticket Médio" para "Média Mensal" ou "Vendas Médias/Mês"
- [x] Clarificar que Bônus Super Meta é adicional (+ R$ X)
- [ ] Criar seção "Metas Trimestral" no dashboard admin (Home.tsx)
- [ ] Adicionar tabela consolidada com meta, super meta e bônus de cada vendedor
- [ ] Adicionar dropdown para alternar entre trimestres no dashboard admin
- [x] Testar filtro de ano no painel individual

### 🐛 Bug Resolvido - Indicadores de Progresso das Metas
- [x] Investigar o que aconteceu com os indicadores de % da meta
- [x] Identificar que endpoint minhasMetas não retornava vendido, falta e percentual
- [x] Modificar endpoint para calcular progresso atual do vendedor
- [x] Adicionar campos vendido, falta e percentual na resposta
- [x] Atualizar frontend para exibir indicadores com barras de progresso
- [x] Inserir metas para Felipe e Andrios (diretores com vendas ocasionais: R$ 200k)
- [x] Criar testes unitários validando cálculos de progresso
- [x] Validar que Gabriel (57,15% da meta) vê indicadores corretamente

### ✅ Correção Completa - Indicadores de Progresso nas Metas Anteriores
- [x] Adicionar indicadores Meta/Vendido/Falta nas metas anteriores
- [x] Adicionar barra de progresso com percentual nas metas anteriores
- [x] Calcular progresso da meta da agência (vendido pela equipe toda)
- [x] Exibir Meta/Vendido/Falta da agência com barra de progresso
- [x] Testar com Danilo (Meta: R$ 800k, Vendido: R$ 660k, Progresso: 82,61%)
- [x] Validar progresso da equipe (Meta: R$ 10M, Vendido: R$ 6,68M, Progresso: 66,80%)

### 🎯 Nova Feature - Indicadores de % de Receita
- [x] Modificar cards superiores do painel individual
- [x] Adicionar card "Média % Ano" (receita/vendas do ano)
- [x] Adicionar card "Total do Mês Atual" (vendas do mês atual)
- [x] Adicionar card "Média % Mês Atual" (receita/vendas do mês)
- [x] Implementar classificação de qualidade (14% normal, 15-16% melhor, 17%+ excelente)
- [x] Adicionar indicadores visuais (cores/badges) para mostrar qualidade
- [x] Testar com dados do Danilo (17,93% ano = Excelente, 16,73% novembro = Melhor)

### 📊 Nova Feature - % de Receita no Gráfico de Evolução Mensal
- [x] Modificar endpoint evolucaoMensal para incluir % de receita por mês
- [x] Adicionar linha laranja de % de receita no gráfico
- [x] Configurar eixo direito para % (separado do eixo de R$)
- [x] Testar visualização com dados do Felipe (pico de ~20% em junho/2025)

### 🎨 Ajuste de Layout - Reordenar Seções do Painel
- [x] Mover seção de Meta Trimestral para depois da Evolução Mensal
- [x] Testar nova ordem das seções (Meta Trimestral agora aparece antes do Comparativo)

### 🎯 Dashboard Admin - Metas Trimestrais e % de Receita
- [x] Criar endpoint para buscar metas trimestrais de todos os vendedores (metasTrimestraisAdmin)
- [x] Criar endpoint para calcular % de receita consolidada (percentualReceitaConsolidado)
- [x] Criar endpoint para ranking de vendedores por % de receita (rankingPercentualReceita)
- [x] Adicionar função getAllMetasTrimestrais no db.ts
- [x] Atualizar metaAgencia para R$ 10M em todas as metas
- [ ] Adicionar seção "Meta Trimestral Atual" no Home.tsx
- [ ] Mostrar progresso de cada vendedor na meta trimestral
- [ ] Adicionar progresso da meta da agência (R$ 10M)
- [ ] Criar dropdown "Ver Metas Anteriores" para trimestres passados
- [ ] Adicionar cards de Média % Receita Ano e Mês Atual
- [ ] Criar ranking de vendedores por melhor % de receita no frontend
- [ ] Otimizar busca de dados para puxar apenas mês atual (não reprocessar meses antigos)
- [ ] Testar dashboard administrativo com Felipe/Andrios

### 🐛 Bug - Ordenação de Metas Trimestrais
- [ ] Corrigir ordenação do endpoint metasTrimestraisAdmin para mostrar Meta Trimestral 1 (Dez/Jan/Fev) em primeiro
- [ ] Meta Trimestral 4 (Set/Out/Nov) deve aparecer em "Ver Metas Anteriores"
- [ ] Testar que meta atual exibida é sempre a mais recente

### 🎨 Dashboard Admin - Interface Visual Completa
- [ ] Adicionar cards de Média % Receita Ano e Mês Atual no topo do Home.tsx
- [ ] Implementar seção "Meta Trimestral Atual" com tabela de progresso de vendedores
- [ ] Adicionar progresso da meta da agência (R$ 10M) na seção de metas
- [ ] Implementar badges coloridos de alerta (vermelho <50%, amarelo 50-80%, verde >80%)
- [ ] Adicionar dropdown "Ver Metas Anteriores" para acessar trimestres passados
- [ ] Otimizar função atualizarTodos para buscar apenas mês atual (Dezembro/2025)
- [ ] Testar dashboard administrativo com Felipe/Andrios

### 🔧 Problema Técnico - TypeScript Cache
- [x] Endpoints criados e testados (3/3 testes passando)
- [x] TypeScript do cliente não reconhece novos endpoints (problema de cache persistente)
- [x] Queries comentadas temporariamente até resolver cache do TypeScript
- [x] Documentação completa criada em PROBLEMA_TECNICO.md
- [ ] Resolver problema de cache (requer reinicialização completa do ambiente ou uso de fetch direto)

### 🔧 Solução Alternativa - Fetch Direto
- [ ] Implementar queries com fetch direto ao invés de tRPC
- [ ] Adicionar helper para buscar dados dos endpoints via HTTP
- [ ] Testar que dados são retornados corretamente


### ✅ Dashboard Admin - Interface Completa Implementada (02/12/2025)
- [x] Criar endpoints backend (metasTrimestraisAdmin, percentualReceitaConsolidado, rankingPercentualReceita)
- [x] Implementar testes unitários (3/3 passando)
- [x] Resolver problema de cache do TypeScript usando fetch direto
- [x] Adicionar cards de Média % Receita Ano 2025 (15,06% - Melhor) e Média % Receita Mês (21,22% - Excelente)
- [x] Implementar seção "Meta Trimestral 1" com tabela de progresso de vendedores
- [x] Adicionar progresso da meta da agência (R$ 100.000,00)
- [x] Implementar badges coloridos de alerta (Em risco <50%, Atenção 50-80%, No caminho ≥80%)
- [x] Adicionar dropdown "Ver Metas Anteriores" para acessar Meta Trimestral 4
- [x] Otimizar função atualizarTodos para buscar apenas mês atual (Dezembro/2025)
- [x] Testar interface completa (funcionando perfeitamente!)

### 📊 Gráfico de Evolução de % de Receita (Dashboard Admin)
- [x] Criar endpoint backend evolucaoPercentualReceita (retorna série temporal mês a mês)
- [x] Calcular % de receita consolidada por mês (soma total receita / soma total vendas)
- [x] Implementar gráfico de linha com Recharts
- [x] Adicionar indicadores de melhor e pior mês
- [x] Adicionar linha de referência para meta de 15% (Melhor)
- [x] Integrar gráfico na página Home.tsx
- [x] Testar com dados de 2025
- [x] Criar teste unitário validando endpoint (4/4 testes passando)


### 🔧 Correção: Ordenação de Metas Trimestrais no Dashboard Admin
- [x] Investigar por que Meta Trimestral 4 (Set/Out/Nov) aparece como meta atual
- [x] Corrigir ordenação para mostrar Meta Trimestral 1 (Dez/Jan/Fev) como meta atual
- [x] Corrigir meses da Meta Trimestral 1: Dezembro/2025, Janeiro/2026, Fevereiro/2026
- [x] Testar que Meta Trimestral 1 aparece em primeiro lugar
- [x] Validar que dropdown "Ver Metas Anteriores" mostra Meta Trimestral 4


### 💡 Melhorias de UX e Clarificação
- [x] Adicionar tooltip/descrição explicando que "Média % Receita" refere-se ao mês atual (Dezembro/2025)
- [x] Adicionar descrição: "Margem de lucro do mês (Receita ÷ Vendas)"

### 📋 Visualização Completa de Metas no Dashboard Admin
- [x] Expandir seção de Meta Trimestral para mostrar informações completas como no painel individual
- [x] Adicionar coluna "Super Meta" na tabela de vendedores
- [x] Adicionar colunas "Bônus Meta" e "Bônus Super" na tabela
- [x] Manter layout profissional e organizado com cores distintas
- [x] Aplicar mesmas colunas nas metas anteriores (collapsible)


### 🎯 Melhorias Dashboard Admin - Visualizações para Reuniões
- [x] Clarificar card "Média % Receita" indicando "(Mês Atual)" no título
- [x] Criar gráfico consolidado mostrando Vendas x Receita x % Receita mês a mês em 2025
- [x] Implementar gráfico com 2 eixos Y (valores em R$ à esquerda, % à direita)
- [x] Endpoint backend rankingPercentualReceita já existe e retorna dados de 2025
- [x] Implementar tabela de ranking mostrando: Vendedor, Total Vendas, Total Receita, % Receita
- [x] Ordenar ranking por % de receita (maior primeiro)
- [x] Adicionar cores/badges indicando performance (Excelente/Melhor/Normal/Atenção)
- [x] Adicionar medalhas de ouro/prata/bronze para top 3
- [x] Posicionar visualizações estrategicamente no dashboard
- [x] Testar com dados reais de 2025


### 🐛 Correção de Erro: metricas.resumoGeral não encontrado
- [x] Investigar onde `metricas.resumoGeral` está sendo chamado no frontend
- [x] Verificar que procedimento existe no backend dentro do router vendedores
- [x] Corrigir chamada de `trpc.metricas.resumoGeral` para `trpc.vendedores.resumoGeral`
- [x] Testar que dashboard funciona corretamente


### 📊 Comparativo Mês Atual vs Mês Anterior
- [x] Criar endpoint backend comparativoMesAtualAnterior (Dezembro vs Novembro/2025)
- [x] Calcular variação percentual entre meses (Vendas, Receita, % Receita)
- [x] Implementar cards de comparativo com setas de tendência (↑ crescimento / ↓ queda)
- [x] Adicionar cores indicando melhoria (verde) ou piora (vermelho)
- [x] Posicionar cards após cards de % de receita
- [x] Exibir valores absolutos de cada mês + variação percentual

### 🔍 Filtro de Período no Gráfico Consolidado
- [x] Adicionar seletor de ano (2024 / 2025 / Todos)
- [x] Atualizar gráfico consolidado baseado no filtro selecionado
- [x] Manter estado do filtro selecionado (useState)
- [x] Filtrar dados do gráfico usando .filter() baseado no ano
- [x] Testar transições entre períodos

### ♻️ Reutilização de Componentes do Painel Individual
- [x] Revisar componentes do painel individual (cards de comparação, filtros)
- [x] Adaptar lógica para contexto administrativo (consolidação de todos vendedores)
- [x] Manter consistência visual entre painéis (cores, layout, tipografia)
- [x] Criar teste unitário para endpoint comparativoMesAtualAnterior (5/5 testes passando)


### 🔧 Correção de Títulos e Textos dos Cards
- [x] Títulos dos cards principais já estavam corretos (Total de Vendas / Total de Receita / Total de Comissões)
- [x] Remover texto "(Receita ÷ Vendas)" do card de % Média % Receita (Mês Atual)
- [x] Manter apenas "Margem de lucro do mês atual" na descrição


### 🐛 Correção: Gráfico Evolução Mensal Vazio e Unificação
- [x] Corrigir filtro do gráfico para usar `item.mesCompleto` ao invés de `item.mes`
- [x] Remover gráfico duplicado "Evolução Mensal da Margem de Lucro (% de Receita)"
- [x] Manter apenas gráfico consolidado "Evolução Mensal: Vendas x Receita x % Receita"
- [x] Gráfico unificado mostra 3 métricas: barras Vendas (azul), barras Receita (verde), linha % (roxa)
- [x] Testar que gráfico exibe dados corretamente com filtro 2025
- [x] Filtro de período funcionando (2024/2025/Todos)


### 🔍 Replicação do Painel Individual no Dashboard Admin
- [x] Ler código de MeuPainel.tsx para identificar visualizações
- [x] Comparar estrutura de MeuPainel.tsx com Home.tsx (dashboard admin)
- [x] Identificar componentes/seções faltantes: Comparativo 2024 vs 2025 e Top Destinos
- [x] Criar endpoint backend comparativo2024vs2025 (consolidado de todos vendedores)
- [x] Criar endpoint backend topDestinosConsolidado (top 10 destinos de todos vendedores)
- [x] Implementar gráfico Comparativo 2024 vs 2025 no dashboard admin
- [x] Implementar tabela Top 10 Destinos no dashboard admin
- [x] Garantir que dashboard admin mostra dados consolidados de todos vendedores
- [x] Corrigir gráfico duplicado (removido "Evolução Mensal da Margem de Lucro", mantido apenas gráfico consolidado)
- [x] Criar testes unitários para comparativo2024vs2025 e topDestinosConsolidado (7/7 testes passando)


### 🐛 Correção de Erro: metricas.atualizarTodos não encontrado
- [x] Investigar onde `metricas.atualizarTodos` está sendo chamado no frontend (linha 113 Home.tsx)
- [x] Verificar que procedimento existe no backend no router vendedores (linha 579 routers.ts)
- [x] Corrigir chamada de `trpc.metricas.atualizarTodos` para `trpc.vendedores.atualizarTodos`
- [x] Testar que dashboard funciona corretamente sem erros em runtime


### 🐛 Correção: Valores de Metas Incorretos no Dashboard Admin
- [ ] Investigar endpoint metasTrimestraisAdmin (valores hardcoded vs banco de dados)
- [ ] Comparar com endpoint do painel individual que funciona corretamente
- [ ] Corrigir lógica para buscar metas reais do banco (metaMensal de cada vendedor)
- [ ] Atualizar cálculo de Meta da Agência (soma das metas individuais)
- [ ] Testar que metas exibidas no dashboard admin coincidem com painel individual


### 🎯 Atualização de Meta da Júlia
- [x] Atualizar meta da Júlia para R$ 150.000,00 (Super Meta: R$ 180.000,00, Bônus Meta: R$ 1.500,00, Bônus Super: R$ 1.900,00)

### 📊 Visualização de Metas Trimestrais em Cards
- [x] Criar componente de card de preview de meta trimestral (mostra: período, total vendido, % atingida, status)
- [x] Modificar seção de metas no dashboard para exibir cards ao invés de tabela expandida
- [x] Criar página dedicada /metas-trimestral/:trimestre para visualização detalhada
- [x] Implementar roteamento e navegação ao clicar no card
- [x] Adicionar estado "Carregando" para metas futuras sem dados
- [x] Testar navegação entre cards e página de detalhes


### 🔧 Correção de Metas Trimestrais (Estrutura e Valores)
- [x] Corrigir valores da Meta Trimestral 4 (Set-Out-Nov/2025) no banco de dados conforme planilha
- [x] Ajustar estrutura da Meta 4: remover super meta, adicionar bônus agência (R$ 1.500,00 para todos)
- [x] Corrigir página /metas-trimestral para mostrar cards de TODAS as metas (não apenas uma)
- [x] Verificar que Meta 1 (Nov/2025-Dez/2025-Jan/2026) mantém estrutura com super meta
- [x] Testar navegação do menu "Metas Trimestral" → deve mostrar todos os cards
- [x] Testar clique nos cards → deve abrir página de detalhes correta


### 📝 Correção de Textos dos Períodos das Metas
- [x] Corrigir texto da Meta 4: "Setembro - Outubro - Novembro/2025"
- [x] Corrigir texto da Meta 1: "Dezembro/2025 - Janeiro - Fevereiro/2026"


### 📊 Página de Apresentação - Resultados Black Friday e Meta Trimestral 4
- [x] Coletar dados de vendas de Novembro/2025 (Black Friday)
- [x] Coletar dados da Meta Trimestral 4 (Set-Out-Nov/2025)
- [x] Criar página /apresentacao-resultados com estatísticas agregadas (sem nomes)
- [x] Adicionar seção: Resultados da Black Friday
- [x] Adicionar seção: Resultados da Meta Trimestral 4
- [x] Adicionar seção: Distribuição de Performance (quantos acima/abaixo)
- [x] Adicionar seção: Critérios de Bonificação (faixas ≥80%, 60-79%, <60%)
- [x] Adicionar seção: % Média de Receita (eficiência vs volume)
- [x] Adicionar rota e testar apresentação


### 🔧 Ajustes na Página de Apresentação (05/12/2025 - 10h)
- [x] Remover "Ticket Médio" da seção Black Friday
- [x] Remover "Total de Vendas" da seção Black Friday
- [x] Adicionar "% Média de Receita" (receita/valor total) na Black Friday
- [x] Trocar todas as ocorrências de "Expectativa" por "Meta"
- [x] Remover seção "Percentual Médio de Atingimento"
- [x] Remover "Total Investido em Bônus"
- [x] Ajustar critérios de bonificação: "Acima de 80%", "Entre 60% e 79%", "Abaixo de 60%"


### 🎨 Aplicar Identidade Visual Mundo Pró Viagens (05/12/2025)
- [x] Configurar paleta de cores da marca no index.css (#fd4f0d, #a0d3f0, #ac0039, #f2ea86, #222223, #f9f2e1)
- [x] Adicionar fontes Roboto Mono e Montserrat via Google Fonts (Cy Grotesk e Brittany substituídas por alternativas disponíveis)
- [x] Adicionar logos (laranja e azul) ao projeto
- [x] Atualizar header com logo da marca
- [x] Aplicar cores da marca nas páginas principais
- [x] Aplicar fontes da marca nos títulos e dados
- [x] Testar identidade visual em todas as páginas


### 🎨 Revisão de Identidade Visual - Mundo Pró Viagens (07/12/2025)
- [x] Analisar site oficial www.mundoproviagens.com.br
- [x] Corrigir logo azul claro para ficar visível no sidebar (h-12, maior e saturado)
- [x] Ajustar paleta de cores: azul claro vibrante (#5ec4e8) e laranja (#ff5722)
- [x] Fundo branco limpo (clean) mantido conforme solicitação
- [x] Logo maior e mais visível em todas as páginas
- [x] Títulos em azul claro vibrante
- [x] Testar em todas as páginas (dashboard, painel individual, apresentação)


### 🐛 Correção de Overflow no Dashboard (07/12/2025 - 21h33)
- [x] Corrigir botões sendo cortados no header (Análises, Atualizar 2023)
- [x] Ajustar responsividade do header para telas menores (flex-wrap, tamanhos sm/md)
- [x] Garantir que todos os elementos fiquem visíveis sem scroll horizontal
- [x] Adicionar logo da Mundo Pró no header do dashboard
- [x] Testar em diferentes resoluções


### 🎨 Aplicar Logo em Todas as Páginas (07/12/2025 - 21h40)
- [x] Identificar todas as páginas do sistema (13 páginas)
- [x] Adicionar logo no painel individual (/meu-painel)
- [x] Adicionar logo na página de apresentação (/apresentacao-resultados) - já tinha
- [x] Adicionar logo na página de análises (/analises)
- [x] Adicionar logo na página de metas trimestral (/metas-trimestral)
- [x] Adicionar logo na página de fornecedores (/fornecedores) - usa DashboardLayout
- [x] Adicionar logo na página de monitoramento (/monitoramento) - usa DashboardLayout
- [x] Adicionar logo em páginas de detalhes de vendedores
- [x] Logo no dashboard principal (Home.tsx) - já tinha
- [x] Testar logo em todas as páginas (Dashboard, Meu Painel, Análises, Apresentação - todos OK!)


### 🐛 Correção: Logo não está carregando (07/12/2025 - 21h44)
- [x] Verificar por que logo azul não está aparecendo (mostrando ícone "M" genérico)
- [x] Verificar se arquivo logo-azul.png existe e está no caminho correto (existe!)
- [x] Mover logo para src/assets e importar como módulo
- [x] Atualizar const.ts para usar import do logo
- [x] Testar logo em todas as páginas após correção


### 🎨 Configurar Favicon da Mundo Pró (07/12/2025 - 22h00)
- [x] Copiar ícone "M" para pasta public como favicon.png
- [x] Atualizar index.html com referência ao favicon
- [x] Testar favicon no navegador


### 🏢 Portal Mundo Pró - Sistema de Controle de Acesso (07/12/2025 - 22h15)
- [x] Adicionar role "suporte" ao schema do banco de dados (drizzle/schema.ts)
- [x] Executar migração do banco (pnpm db:push)
- [x] Criar página inicial do Portal (/portal)
- [x] Adicionar cards dinâmicos baseados em role do usuário
- [x] Implementar menu dinâmico no DashboardLayout
- [x] Criar componente de proteção de rotas (ProtectedRoute)
- [x] Proteger rotas administrativas (apenas admin)
- [x] Proteger rotas de vendedor (vendedor + admin)
- [x] Criar área inicial do Suporte (/suporte)
- [x] Adicionar rota /suporte no App.tsx
- [x] Adicionar item de menu "Central de Suporte" no DashboardLayout
- [x] Testar acesso como vendedor
- [x] Testar acesso como admin
- [x] Testar acesso como suporte
- [x] Documentar sistema de permissões (SISTEMA_PERMISSOES.md)

### Bug: Admin vendas@mundoproviagens.com.br sendo redirecionado de /metas-trimestral
- [x] Verificar identificação de admins no código (server/db.ts)
- [x] Verificar se vendas@mundoproviagens.com.br está cadastrado no banco com role admin
- [x] Corrigir role de vendas@mundoproviagens.com.br para admin no banco de dados
- [ ] Testar que vendas@mundoproviagens.com.br acessa /metas-trimestral sem redirecionamento
- [ ] Testar que felipe@mundoproviagens.com.br também acessa normalmente

### Página de Apresentação Meta Trimestral 1 (Dez/Jan/Fev)
- [x] Buscar dados da Meta Trimestral 1 no banco de dados
- [x] Criar endpoint tRPC para dados anonimizados ordenados por progresso (usa endpoint existente)
- [x] Criar página /apresentacao-meta-trimestral-1 com identificadores AAAAA, BBBBB, CCCCC
- [x] Adicionar gráfico de progresso geral da meta
- [x] Adicionar tabela de ranking anônimo ordenado por % atingido
- [x] Adicionar métricas consolidadas (meta total, vendido, falta, %)
- [x] Adicionar distribuição de performance (No Caminho, Atenção, Em Risco)
- [x] Testar apresentação e validar que não expõe nomes

### Restringir Acesso à Apresentação Meta Trimestral 1
- [x] Adicionar ProtectedRoute com allowedRoles: ["admin"] na rota /apresentacao-meta-trimestral-1
- [x] Testar que admin acessa normalmente
- [x] Testar que vendedor é redirecionado para /meu-painel
- [x] Testar que suporte é redirecionado para /meu-painel

### Bug: Valores Incorretos na Apresentação Meta Trimestral 1
- [x] Investigar se usuário está acessando página correta (/apresentacao-meta-trimestral-1 vs /metas-trimestral)
- [x] Verificar por que valores estão divididos por 100 (R$ 57.120 ao invés de R$ 5.712.000) - problema na linha de cálculo
- [x] Corrigir cálculo de metaTotal, vendidoTotal, faltaTotal (removida divisão por 100)
- [x] Garantir que apresentação mostra identificadores anônimos (AAAAA, BBBBB) e não nomes reais - já implementado
- [x] Garantir que apresentação NÃO mostra colunas de bônus - já implementado (apenas Meta, Vendido, Falta, %)
- [x] Testar apresentação com dados corretos - valores agora batem com a página administrativa

### Bug: Valores Individuais Ainda Divididos por 100
- [x] Identificar onde valores individuais (meta, vendido, falta) são mapeados - linhas 45-47
- [x] Remover divisão por 100 dos valores individuais no map de vendedoresAnonimos
- [x] Testar que valores individuais agora batem com página administrativa - todos os valores corretos!

### Feature: Modo Apresentação
- [x] Adicionar estado React para controlar modo apresentação (useState)
- [x] Implementar função para ativar/desativar fullscreen (document.documentElement.requestFullscreen)
- [x] Criar botão "Iniciar Apresentação" no header da página
- [x] Ocultar header/logo quando em modo apresentação (condicional !modoApresentacao)
- [x] Adicionar listener para detectar ESC (fullscreenchange event)
- [x] Adicionar botão flutuante "Sair da Apresentação" (canto superior direito)
- [x] Testar ativação de fullscreen - funcionando perfeitamente
- [x] Testar saída de fullscreen (ESC) - botão flutuante e ESC funcionam

### Feature: % Receita na Apresentação
- [x] Verificar se metaTrimestral1.vendedores contém campo percentualReceita - adicionado ao backend
- [x] Adicionar percentualReceita ao backend (server/routers.ts linha 273-285)
- [x] Adicionar coluna "% Receita" no ranking de performance (linha 331-336)
- [x] Testar exibição de % receita na apresentação - funcionando perfeitamente!
