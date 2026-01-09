import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex, index, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "suporte"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de vendedores
 */
export const vendedores = mysqlTable("vendedores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(), // Email do vendedor para login (obrigatório)
  openId: varchar("openId", { length: 64 }).unique(), // OpenId do OAuth para autenticação (opcional)
  passwordHash: varchar("passwordHash", { length: 255 }), // Hash da senha para login tradicional
  primeiroAcesso: boolean("primeiroAcesso").default(true).notNull(), // Se é o primeiro acesso (precisa trocar senha)
  sheetId: varchar("sheetId", { length: 100 }).notNull().unique(),
  ativo: boolean("ativo").default(true).notNull(),
  dataEntrada: timestamp("dataEntrada").notNull(), // Data de entrada do vendedor
  metaMensal: int("metaMensal").default(0), // Meta mensal em reais (centavos)
  metaTrimestral: int("metaTrimestral").default(0), // Meta trimestral Set-Out-Nov/2025 (centavos)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendedor = typeof vendedores.$inferSelect;
export type InsertVendedor = typeof vendedores.$inferInsert;

/**
 * Tabela de métricas mensais dos vendedores
 */
export const metricas = mysqlTable("metricas", {
  id: int("id").autoincrement().primaryKey(),
  vendedorId: int("vendedorId").notNull(),
  mes: varchar("mes", { length: 20 }).notNull(), // Formato: "Janeiro/2025"
  totalVendas: int("totalVendas").default(0).notNull(), // Em centavos
  totalReceita: int("totalReceita").default(0).notNull(), // Em centavos
  comissaoTotal: int("comissaoTotal").default(0).notNull(), // Em centavos
  percentualReceita: int("percentualReceita").default(0).notNull(), // Multiplicado por 100 (ex: 12.73% = 1273)
  status: mysqlEnum("status", ["com_dados", "sem_dados"]).default("sem_dados").notNull(),
  dataExtracao: timestamp("dataExtracao").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Metrica = typeof metricas.$inferSelect;
export type InsertMetrica = typeof metricas.$inferInsert;

/**
 * Tabela de histórico de atualizações
 */
export const atualizacoes = mysqlTable("atualizacoes", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["manual", "automatica"]).notNull(),
  status: mysqlEnum("status", ["sucesso", "erro", "parcial"]).notNull(),
  vendedoresAtualizados: int("vendedoresAtualizados").default(0),
  totalRegistros: int("totalRegistros").default(0),
  mensagem: text("mensagem"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Atualizacao = typeof atualizacoes.$inferSelect;
export type InsertAtualizacao = typeof atualizacoes.$inferInsert;

/**
 * Tabela de dados de fornecedores (operadoras) por vendedor e mês
 */
export const fornecedores = mysqlTable("fornecedores", {
  id: int("id").autoincrement().primaryKey(),
  vendedorId: int("vendedorId").notNull(),
  mes: varchar("mes", { length: 20 }).notNull(), // Formato: "Janeiro/2025"
  operadora: varchar("operadora", { length: 200 }).notNull(), // Nome da operadora
  operadoraNormalizada: varchar("operadoraNormalizada", { length: 200 }).notNull(), // Nome normalizado para agrupamento
  tarifa: int("tarifa").default(0).notNull(), // Em centavos
  taxa: int("taxa").default(0).notNull(), // Em centavos
  duTebOver: int("duTebOver").default(0).notNull(), // DU/TEB/OVER em centavos
  incentivo: int("incentivo").default(0).notNull(), // Em centavos
  valorTotal: int("valorTotal").default(0).notNull(), // Total da venda em centavos
  dataExtracao: timestamp("dataExtracao").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Índice para consultas por operadora normalizada (não-único, permite múltiplas vendas)
  operadoraNormalizadaIdx: index("operadoraNormalizada_idx").on(table.operadoraNormalizada, table.mes, table.vendedorId),
}));

export type Fornecedor = typeof fornecedores.$inferSelect;
export type InsertFornecedor = typeof fornecedores.$inferInsert;

/**
 * Tabela de vendas diárias
 * Armazena vendas únicas agrupadas por nome de passageiros
 */
export const vendasDiarias = mysqlTable("vendas_diarias", {
  id: int("id").autoincrement().primaryKey(),
  vendedorId: int("vendedorId").notNull().references(() => vendedores.id),
  dataVenda: timestamp("dataVenda").notNull(), // Data de fechamento (coluna H)
  nomePassageiros: varchar("nomePassageiros", { length: 255 }).notNull(), // Coluna L - identifica venda única
  valorTotal: int("valorTotal").notNull(), // Em centavos (coluna T)
  destino: varchar("destino", { length: 255 }), // Coluna K
  mes: varchar("mes", { length: 20 }).notNull(), // Ex: "Novembro/2025"
  ano: int("ano").notNull(), // Ex: 2025
  dataExtracao: timestamp("dataExtracao").defaultNow().notNull(),
}, (table) => ({
  // Constraint para evitar duplicatas
  uniqueVenda: uniqueIndex("unique_venda").on(table.vendedorId, table.dataVenda, table.nomePassageiros),
}));

export type VendaDiaria = typeof vendasDiarias.$inferSelect;
export type InsertVendaDiaria = typeof vendasDiarias.$inferInsert;

/**
 * Tabela de metas trimestrais
 * Suporta múltiplos trimestres por vendedor
 */
export const metasTrimestrais = mysqlTable("metas_trimestrais", {
  id: int("id").autoincrement().primaryKey(),
  vendedorId: int("vendedorId").notNull().references(() => vendedores.id),
  trimestre: varchar("trimestre", { length: 50 }).notNull(), // Ex: "T3-2025" (Set-Out-Nov), "T4-2025" (Dez-Jan-Fev)
  metaTrimestral: int("metaTrimestral").notNull(), // Meta em centavos
  superMeta: int("superMeta").notNull(), // Super meta (+20%) em centavos
  bonusMeta: int("bonusMeta").notNull(), // Bônus se atingir meta (1%) em centavos
  bonusSuperMeta: int("bonusSuperMeta").notNull(), // Bônus se atingir super meta (1,1%) em centavos
  metaAgencia: int("metaAgencia").default(0), // Meta geral da agência (0 = sem meta de agência)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  // Índice único: um vendedor não pode ter duas metas para o mesmo trimestre
  uniqueVendedorTrimestre: uniqueIndex("unique_vendedor_trimestre").on(table.vendedorId, table.trimestre),
}));

export type MetaTrimestral = typeof metasTrimestrais.$inferSelect;
export type InsertMetaTrimestral = typeof metasTrimestrais.$inferInsert;
