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
