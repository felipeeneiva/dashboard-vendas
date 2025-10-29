import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vendedores, metricas, atualizacoes, Vendedor, Metrica, InsertVendedor, InsertMetrica, InsertAtualizacao } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== VENDEDOR FUNCTIONS ====================

export async function getAllVendedores(): Promise<Vendedor[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(vendedores).where(eq(vendedores.ativo, true));
  return result;
}

export async function getVendedorById(id: number): Promise<Vendedor | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(vendedores).where(eq(vendedores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertVendedor(vendedor: InsertVendedor): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(vendedores).values(vendedor).onDuplicateKeyUpdate({
    set: {
      nome: vendedor.nome,
      ativo: vendedor.ativo ?? true,
      metaMensal: vendedor.metaMensal ?? 0,
      updatedAt: new Date(),
    },
  });
}

// ==================== METRICA FUNCTIONS ====================

export async function getAllMetricas(): Promise<Metrica[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(metricas);
  return result;
}

export async function deleteMetrica(metricaId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(metricas).where(eq(metricas.id, metricaId));
}

export async function getMetricasByVendedor(vendedorId: number): Promise<Metrica[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(metricas)
    .where(eq(metricas.vendedorId, vendedorId))
    .orderBy(desc(metricas.dataExtracao));
  
  return result;
}

export async function getMetricasByMes(mes: string): Promise<Metrica[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(metricas)
    .where(eq(metricas.mes, mes))
    .orderBy(desc(metricas.totalReceita));
  
  return result;
}

export async function getUltimasMetricas(): Promise<Metrica[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Pega as métricas mais recentes de cada vendedor
  const result = await db
    .select()
    .from(metricas)
    .where(eq(metricas.status, "com_dados"))
    .orderBy(desc(metricas.dataExtracao));
  
  return result;
}

export async function upsertMetrica(metrica: InsertMetrica): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Verifica se já existe uma métrica para esse vendedor e mês
  const existing = await db
    .select()
    .from(metricas)
    .where(
      and(
        eq(metricas.vendedorId, metrica.vendedorId),
        eq(metricas.mes, metrica.mes)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Atualiza
    await db
      .update(metricas)
      .set({
        totalVendas: metrica.totalVendas,
        totalReceita: metrica.totalReceita,
        comissaoTotal: metrica.comissaoTotal,
        percentualReceita: metrica.percentualReceita,
        status: metrica.status,
        dataExtracao: metrica.dataExtracao,
        updatedAt: new Date(),
      })
      .where(eq(metricas.id, existing[0].id));
  } else {
    // Insere
    await db.insert(metricas).values(metrica);
  }
}

export async function deleteMetricasAnteriores(vendedorId: number, dataLimite: Date): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Remove métricas antigas para liberar espaço
  await db
    .delete(metricas)
    .where(
      and(
        eq(metricas.vendedorId, vendedorId),
        // dataExtracao < dataLimite
      )
    );
}

// ==================== ATUALIZACAO FUNCTIONS ====================

export async function registrarAtualizacao(atualizacao: InsertAtualizacao): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(atualizacoes).values(atualizacao);
}

export async function getUltimasAtualizacoes(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(atualizacoes)
    .orderBy(desc(atualizacoes.createdAt))
    .limit(limit);
  
  return result;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Converte valor em centavos para reais
 */
export function centavosParaReais(centavos: number): number {
  return centavos / 100;
}

/**
 * Converte valor em reais para centavos
 */
export function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * Converte percentual armazenado (ex: 1273) para decimal (ex: 12.73)
 */
export function percentualParaDecimal(percentual: number): number {
  return percentual / 100;
}

/**
 * Converte decimal (ex: 12.73) para percentual armazenado (ex: 1273)
 */
export function decimalParaPercentual(decimal: number): number {
  return Math.round(decimal * 100);
}
