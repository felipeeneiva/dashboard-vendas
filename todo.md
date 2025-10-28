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
- [x] Implementar query: vendedor com melhor desempenho
- [x] Criar geração de resumo executivo em slides
- [x] Criar gráfico de barras comparativo de vendedores
- [ ] Criar sistema de filtros (por vendedor, por mês, por ano)
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

### Testes e Documentação
- [ ] Testar extração de dados de todas as planilhas
- [ ] Validar cálculos e totalizações
- [ ] Documentar como adicionar novos vendedores
- [ ] Criar guia de uso do dashboard
- [x] Criar manual completo de backup e exportação de dados
- [x] Documentar como migrar dados da Manus para Google Sheets
- [x] Criar guia de segurança e controle de acesso
