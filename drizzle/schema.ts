import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
  sheetId: varchar("sheetId", { length: 100 }).notNull().unique(),
  ativo: boolean("ativo").default(true).notNull(),
  dataEntrada: timestamp("dataEntrada").notNull(), // Data de entrada do vendedor
  metaMensal: int("metaMensal").default(0), // Meta mensal em reais (centavos)
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
