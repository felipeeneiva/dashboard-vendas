import { getDb } from '../server/db.ts';
import { metricas } from '../drizzle/schema.ts';
import { sql } from 'drizzle-orm';

const db = await getDb();

console.log('[Limpeza] Iniciando remoção de métricas duplicadas...');

// 1. Contar total antes
const totalAntes = await db.select({ count: sql`COUNT(*)` }).from(metricas);
console.log(`[Limpeza] Total de métricas ANTES: ${totalAntes[0].count}`);

// 2. Buscar todos os registros
const todos = await db.select().from(metricas).orderBy(metricas.vendedorId, metricas.mes, metricas.dataExtracao);

// 3. Agrupar por vendedor + mês e manter apenas o mais recente com valor > 0
const manter = new Map();
const deletar = [];

for (const metrica of todos) {
  const key = `${metrica.vendedorId}-${metrica.mes}`;
  
  if (!manter.has(key)) {
    // Primeiro registro deste vendedor/mês
    manter.set(key, metrica);
  } else {
    const atual = manter.get(key);
    
    // Se o novo tem valor > 0 e data mais recente, substitui
    if (metrica.totalVendas > 0 && metrica.dataExtracao > atual.dataExtracao) {
      deletar.push(atual.id);
      manter.set(key, metrica);
    }
    // Se o novo tem valor > 0 mas o atual não, substitui
    else if (metrica.totalVendas > 0 && atual.totalVendas === 0) {
      deletar.push(atual.id);
      manter.set(key, metrica);
    }
    // Caso contrário, deleta o novo
    else {
      deletar.push(metrica.id);
    }
  }
}

console.log(`[Limpeza] Registros a manter: ${manter.size}`);
console.log(`[Limpeza] Registros a deletar: ${deletar.length}`);

// 4. Deletar em lotes de 100
const BATCH_SIZE = 100;
for (let i = 0; i < deletar.length; i += BATCH_SIZE) {
  const batch = deletar.slice(i, i + BATCH_SIZE);
  await db.delete(metricas).where(sql`id IN (${sql.join(batch.map(id => sql`${id}`), sql`, `)})`);
  console.log(`[Limpeza] Deletados ${Math.min(i + BATCH_SIZE, deletar.length)}/${deletar.length}`);
}

// 5. Contar total depois
const totalDepois = await db.select({ count: sql`COUNT(*)` }).from(metricas);
console.log(`[Limpeza] Total de métricas DEPOIS: ${totalDepois[0].count}`);

console.log('[Limpeza] Concluído!');
process.exit(0);
