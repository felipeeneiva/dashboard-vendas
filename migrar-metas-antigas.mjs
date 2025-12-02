import { drizzle } from 'drizzle-orm/mysql2';
import { metasTrimestrais, vendedores } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

console.log('\n🔄 Migrando metas antigas (Set-Out-Nov/2025) para Meta Trimestral 4\n');

// Buscar todos os vendedores com meta trimestral antiga
const todosVendedores = await db.select().from(vendedores);

let migrados = 0;
let semMeta = 0;

for (const vendedor of todosVendedores) {
  // Pular se não tem meta trimestral antiga
  if (!vendedor.metaTrimestral || vendedor.metaTrimestral === 0) {
    console.log(`⏭️  ${vendedor.nome}: Sem meta trimestral antiga`);
    semMeta++;
    continue;
  }
  
  try {
    // Calcular valores
    const metaTrimestral = vendedor.metaTrimestral; // Já em centavos
    const superMeta = Math.round(metaTrimestral * 1.20); // +20%
    const bonusMeta = Math.round(metaTrimestral * 0.01); // 1%
    const bonusSuperMeta = Math.round(superMeta * 0.011); // 1,1%
    
    // Inserir na nova tabela
    await db.insert(metasTrimestrais).values({
      vendedorId: vendedor.id,
      trimestre: 'Meta Trimestral 4',
      metaTrimestral,
      superMeta,
      bonusMeta,
      bonusSuperMeta,
      metaAgencia: 1000000000, // R$ 10 milhões em centavos
    });
    
    console.log(`✅ ${vendedor.nome}: R$ ${(metaTrimestral / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    migrados++;
  } catch (error) {
    if (error.message.includes('Duplicate entry')) {
      console.log(`⚠️  ${vendedor.nome}: Meta Trimestral 4 já existe`);
    } else {
      console.error(`❌ Erro ao migrar ${vendedor.nome}:`, error.message);
    }
  }
}

console.log(`\n📊 Resumo:`);
console.log(`   Migrados: ${migrados}`);
console.log(`   Sem meta: ${semMeta}`);
console.log(`   Total: ${todosVendedores.length}\n`);

process.exit(0);
