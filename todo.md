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

### Novas Features
- [x] Adicionar botão para limpar dados antigos (2023)
- [x] Implementar atualização automática diária às 6h
- [x] Criar endpoint para limpar métricas de anos específicos
- [x] Adicionar sistema de agendamento de tarefas (cron)

### Bugs Reportados
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
