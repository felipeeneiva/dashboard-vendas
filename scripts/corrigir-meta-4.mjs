import { drizzle } from "drizzle-orm/mysql2";
import { eq, and } from "drizzle-orm";
import { metasTrimestrais, vendedores } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Valores corretos da Meta Trimestral 4 (Setembro-Outubro-Novembro/2025)
// Estrutura: Meta Total + Bônus (1%) + Meta Agência (R$ 1.500 para todos se atingida)
const metasCorretas = {
  "Gabriel": { meta: 65000000, bonus: 650000 },      // R$ 650k, bônus R$ 6.5k
  "Francine": { meta: 100000000, bonus: 1000000 },   // R$ 1M, bônus R$ 10k
  "Mauro": { meta: 100000000, bonus: 1000000 },      // R$ 1M, bônus R$ 10k
  "Rafael": { meta: 100000000, bonus: 1000000 },     // R$ 1M, bônus R$ 10k
  "Luana": { meta: 100000000, bonus: 1000000 },      // R$ 1M, bônus R$ 10k
  "Nathaly": { meta: 80000000, bonus: 800000 },      // R$ 800k, bônus R$ 8k
  "Danilo": { meta: 80000000, bonus: 800000 },       // R$ 800k, bônus R$ 8k
  "Pedro": { meta: 60000000, bonus: 600000 },        // R$ 600k, bônus R$ 6k
  "Leonardo": { meta: 72000000, bonus: 720000 },     // R$ 720k, bônus R$ 7.2k
  "Yasmin": { meta: 60000000, bonus: 600000 },       // R$ 600k, bônus R$ 6k
  "Laura": { meta: 0, bonus: 0 },                    // Sem meta
  "Lucas": { meta: 40000000, bonus: 400000 },        // R$ 400k, bônus R$ 4k
  "Isabelle": { meta: 60000000, bonus: 600000 },     // R$ 600k, bônus R$ 6k
};

// Meta da agência: R$ 10.000.000,00
const metaAgencia = 1000000000; // 10M em centavos
const bonusAgencia = 150000;    // R$ 1.500 em centavos

async function corrigirMeta4() {
  console.log("🔧 Corrigindo Meta Trimestral 4...\n");

  // 1. Atualizar meta da agência
  await db.update(metasTrimestrais)
    .set({ metaAgencia })
    .where(eq(metasTrimestrais.trimestre, "Meta Trimestral 4"));
  
  console.log("✅ Meta da agência atualizada: R$ 10.000.000,00\n");

  // 2. Atualizar metas individuais
  for (const [nome, valores] of Object.entries(metasCorretas)) {
    // Buscar vendedor pelo nome
    const vendedor = await db.select()
      .from(vendedores)
      .where(eq(vendedores.nome, nome))
      .limit(1);

    if (vendedor.length === 0) {
      console.log(`⚠️  Vendedor ${nome} não encontrado`);
      continue;
    }

    const vendedorId = vendedor[0].id;

    // Atualizar na tabela metas_trimestrais
    await db.update(metasTrimestrais)
      .set({
        metaTrimestral: valores.meta,
        bonusMeta: valores.bonus,
        superMeta: 0,           // Meta 4 não tem super meta
        bonusSuperMeta: bonusAgencia, // Usar campo bonusSuperMeta para armazenar bônus agência
      })
      .where(
        and(
          eq(metasTrimestrais.vendedorId, vendedorId),
          eq(metasTrimestrais.trimestre, "Meta Trimestral 4")
        )
      );

    console.log(`✅ ${nome}: Meta R$ ${(valores.meta / 100).toLocaleString('pt-BR')}, Bônus R$ ${(valores.bonus / 100).toLocaleString('pt-BR')}, Bônus Agência R$ 1.500`);
  }

  console.log("\n🎉 Meta Trimestral 4 corrigida com sucesso!");
}

corrigirMeta4().catch(console.error);
