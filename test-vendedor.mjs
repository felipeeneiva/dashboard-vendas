import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { vendedores } from './drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

const email = 'vendas7@mundoproviagens.com.br';

console.log('🔍 Testando busca de vendedor por email:', email);
console.log('📧 Tamanho do email:', email.length);
console.log('🔢 HEX do email:', Buffer.from(email).toString('hex'));

const result = await db.select().from(vendedores).where(eq(vendedores.email, email)).limit(1);

console.log('\n✅ Resultado da busca:');
if (result.length > 0) {
  console.log('   Encontrado:', result[0]);
} else {
  console.log('   ❌ NENHUM vendedor encontrado!');
  
  // Buscar todos os emails para comparar
  console.log('\n📋 Todos os emails cadastrados:');
  const todos = await db.select({ id: vendedores.id, nome: vendedores.nome, email: vendedores.email }).from(vendedores);
  todos.forEach(v => {
    console.log(`   ID ${v.id}: ${v.nome} - ${v.email} (length: ${v.email?.length || 0})`);
  });
}

process.exit(0);
