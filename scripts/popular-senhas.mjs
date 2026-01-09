import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { mysqlTable, int, varchar, boolean, timestamp } from 'drizzle-orm/mysql-core';

// Define schema inline
const vendedores = mysqlTable("vendedores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  openId: varchar("openId", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  primeiroAcesso: boolean("primeiroAcesso").default(true).notNull(),
  sheetId: varchar("sheetId", { length: 100 }).notNull().unique(),
  ativo: boolean("ativo").default(true).notNull(),
  dataEntrada: timestamp("dataEntrada").notNull(),
  metaMensal: int("metaMensal").default(0),
  metaTrimestral: int("metaTrimestral").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

const SENHA_PADRAO = 'Teste123*';

async function popularSenhas() {
  console.log('Iniciando população de senhas padrão...');
  
  const db = drizzle(process.env.DATABASE_URL);
  
  // Busca todos os vendedores
  const todosVendedores = await db.select().from(vendedores);
  console.log(`Encontrados ${todosVendedores.length} vendedores`);
  
  // Gera hash da senha padrão
  const hash = await bcrypt.hash(SENHA_PADRAO, 10);
  console.log('Hash gerado:', hash);
  
  // Atualiza todos os vendedores
  for (const vendedor of todosVendedores) {
    await db.update(vendedores)
      .set({ 
        passwordHash: hash,
        primeiroAcesso: true 
      })
      .where(eq(vendedores.id, vendedor.id));
    
    console.log(`✓ Senha definida para: ${vendedor.nome} (${vendedor.email})`);
  }
  
  console.log('\n✅ Senhas populadas com sucesso!');
  console.log(`Senha padrão: ${SENHA_PADRAO}`);
  console.log('Todos os vendedores precisarão trocar a senha no primeiro acesso.');
  
  process.exit(0);
}

popularSenhas().catch((error) => {
  console.error('Erro ao popular senhas:', error);
  process.exit(1);
});
