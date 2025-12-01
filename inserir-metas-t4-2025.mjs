import { drizzle } from 'drizzle-orm/mysql2';
import { metasTrimestrais, vendedores } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

// Metas do trimestre T4-2025 (Dez/2025-Jan/2026-Fev/2026)
// Valores em centavos
const metas = [
  { nome: 'Rafael', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuperMeta: 790000 },
  { nome: 'Gabriel', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuperMeta: 790000 },
  { nome: 'Francine', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuperMeta: 790000 },
  { nome: 'Mauro', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuperMeta: 790000 },
  { nome: 'Luana', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuperMeta: 790000 },
  { nome: 'Danilo', meta: 48000000, superMeta: 57600000, bonusMeta: 480000, bonusSuperMeta: 640000 },
  { nome: 'Náthaly', meta: 48000000, superMeta: 57600000, bonusMeta: 480000, bonusSuperMeta: 640000 },
  { nome: 'Leonardo', meta: 43200000, superMeta: 51840000, bonusMeta: 432000, bonusSuperMeta: 570000 },
  { nome: 'Pedro', meta: 42000000, superMeta: 50400000, bonusMeta: 420000, bonusSuperMeta: 560000 },
  { nome: 'Yasmin', meta: 42000000, superMeta: 50400000, bonusMeta: 420000, bonusSuperMeta: 560000 },
  { nome: 'Isabelle', meta: 24000000, superMeta: 28800000, bonusMeta: 240000, bonusSuperMeta: 320000 },
  { nome: 'Lucas', meta: 24000000, superMeta: 28800000, bonusMeta: 240000, bonusSuperMeta: 320000 },
];

console.log('\n🎯 Inserindo metas do trimestre T4-2025 (Dez/2025-Fev/2026)\n');

for (const metaData of metas) {
  try {
    // Buscar vendedor por nome
    const vendedor = await db.select().from(vendedores).where(eq(vendedores.nome, metaData.nome)).limit(1);
    
    if (vendedor.length === 0) {
      console.log(`❌ Vendedor ${metaData.nome} não encontrado`);
      continue;
    }
    
    const vendedorId = vendedor[0].id;
    
    // Inserir meta trimestral
    await db.insert(metasTrimestrais).values({
      vendedorId,
      trimestre: 'T4-2025',
      metaTrimestral: metaData.meta,
      superMeta: metaData.superMeta,
      bonusMeta: metaData.bonusMeta,
      bonusSuperMeta: metaData.bonusSuperMeta,
      metaAgencia: 0, // Sem meta de agência para este trimestre
    });
    
    console.log(`✅ ${metaData.nome}: Meta R$ ${(metaData.meta / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
  } catch (error) {
    console.error(`❌ Erro ao inserir meta de ${metaData.nome}:`, error.message);
  }
}

console.log('\n✅ Metas inseridas com sucesso!\n');
process.exit(0);
