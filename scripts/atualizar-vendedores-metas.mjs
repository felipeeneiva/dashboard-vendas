import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { vendedores, metasTrimestrais } from '../drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

// Dados corretos dos vendedores
const vendedoresCorretos = [
  // Administradores (sem meta)
  { nome: 'Felipe', email: 'felipe@mundoproviagens.com.br', meta: 0, admin: true },
  { nome: 'Andrios', email: 'vendas@mundoproviagens.com.br', meta: 0, admin: true },
  
  // Vendedores com metas (em centavos)
  { nome: 'Rafael', email: 'vendas5@mundoproviagens.com.br', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuper: 790000 },
  { nome: 'Gabriel', email: 'gabriel@mundoproviagens.com.br', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuper: 790000 },
  { nome: 'Francine', email: 'vendas3@mundoproviagens.com.br', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuper: 790000 },
  { nome: 'Mauro', email: 'vendas6@mundoproviagens.com.br', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuper: 790000 },
  { nome: 'Luana', email: 'vendas2@mundoproviagens.com.br', meta: 60000000, superMeta: 72000000, bonusMeta: 600000, bonusSuper: 790000 },
  { nome: 'Danilo', email: 'vendas7@mundoproviagens.com.br', meta: 48000000, superMeta: 57600000, bonusMeta: 480000, bonusSuper: 630000 },
  { nome: 'Nathaly', email: 'atendimento@mundoproviagens.com.br', meta: 48000000, superMeta: 57600000, bonusMeta: 480000, bonusSuper: 630000 },
  { nome: 'Leonardo', email: 'vendas4@mundoproviagens.com.br', meta: 43200000, superMeta: 51840000, bonusMeta: 432000, bonusSuper: 570000 },
  { nome: 'Pedro', email: 'vendas12@mundoproviagens.com.br', meta: 42000000, superMeta: 50400000, bonusMeta: 420000, bonusSuper: 550000 },
  { nome: 'Yasmin', email: 'vendas10@mundoproviagens.com.br', meta: 42000000, superMeta: 50400000, bonusMeta: 420000, bonusSuper: 550000 },
  { nome: 'Isabelle', email: 'vendas8@mundoproviagens.com.br', meta: 24000000, superMeta: 28800000, bonusMeta: 240000, bonusSuper: 310000 },
  { nome: 'Lucas', email: 'vendas9@mundoproviagens.com.br', meta: 24000000, superMeta: 28800000, bonusMeta: 240000, bonusSuper: 310000 },
  { nome: 'Júlia', email: 'vendas11@mundoproviagens.com.br', meta: 0, superMeta: 0, bonusMeta: 0, bonusSuper: 0 },
];

const metaAgencia = 571200000; // R$ 5.712.000,00 em centavos

async function atualizarVendedoresEMetas() {
  console.log('🚀 Iniciando atualização de vendedores e metas...\n');

  try {
    // 1. Buscar todos os vendedores atuais
    const vendedoresAtuais = await db.select().from(vendedores);
    console.log(`📋 Encontrados ${vendedoresAtuais.length} vendedores no banco\n`);

    // 2. Deletar vendedores que não existem mais
    const emailsCorretos = vendedoresCorretos.map(v => v.email);
    const vendedoresParaDeletar = vendedoresAtuais.filter(v => !emailsCorretos.includes(v.email));
    
    if (vendedoresParaDeletar.length > 0) {
      console.log('🗑️  Deletando vendedores que não fazem mais parte da equipe:');
      for (const v of vendedoresParaDeletar) {
        console.log(`   - ${v.nome} (${v.email})`);
        
        // Deletar metas trimestrais do vendedor
        await db.delete(metasTrimestrais).where(eq(metasTrimestrais.vendedorId, v.id));
        
        // Deletar vendedor
        await db.delete(vendedores).where(eq(vendedores.id, v.id));
      }
      console.log(`   ✅ ${vendedoresParaDeletar.length} vendedores deletados\n`);
    }

    // 3. Atualizar ou criar vendedores corretos
    console.log('📝 Atualizando/criando vendedores corretos:\n');
    
    for (const vCorreto of vendedoresCorretos) {
      const vendedorExistente = vendedoresAtuais.find(v => v.email === vCorreto.email);
      
      if (vendedorExistente) {
        // Atualizar vendedor existente
        await db.update(vendedores)
          .set({
            nome: vCorreto.nome,
            metaTrimestral: vCorreto.meta,
            updatedAt: new Date()
          })
          .where(eq(vendedores.id, vendedorExistente.id));
        
        console.log(`   ✅ ${vCorreto.nome} atualizado (meta: R$ ${(vCorreto.meta / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
        
        // Atualizar metas trimestrais se não for admin
        if (!vCorreto.admin && vCorreto.meta > 0) {
          // Atualizar Meta Trimestral 1
          const metasExistentes = await db.select()
            .from(metasTrimestrais)
            .where(eq(metasTrimestrais.vendedorId, vendedorExistente.id));
          
          const metaTrimestral1 = metasExistentes.find(m => m.trimestre === 'Meta Trimestral 1');
          
          if (metaTrimestral1) {
            await db.update(metasTrimestrais)
              .set({
                metaTrimestral: vCorreto.meta,
                superMeta: vCorreto.superMeta,
                bonusMeta: vCorreto.bonusMeta,
                bonusSuperMeta: vCorreto.bonusSuper,
                metaAgencia: metaAgencia,
                updatedAt: new Date()
              })
              .where(eq(metasTrimestrais.id, metaTrimestral1.id));
          } else {
            // Criar Meta Trimestral 1 se não existir
            await db.insert(metasTrimestrais).values({
              vendedorId: vendedorExistente.id,
              trimestre: 'Meta Trimestral 1',
              metaTrimestral: vCorreto.meta,
              superMeta: vCorreto.superMeta,
              bonusMeta: vCorreto.bonusMeta,
              bonusSuperMeta: vCorreto.bonusSuper,
              metaAgencia: metaAgencia,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }
      } else {
        // Criar novo vendedor
        const resultado = await db.insert(vendedores).values({
          nome: vCorreto.nome,
          email: vCorreto.email,
          sheetId: 'PENDENTE', // Será atualizado depois
          ativo: true,
          dataEntrada: new Date(),
          metaTrimestral: vCorreto.meta,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const novoVendedorId = resultado[0].insertId;
        
        console.log(`   ✅ ${vCorreto.nome} criado (meta: R$ ${(vCorreto.meta / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
        
        // Criar Meta Trimestral 1 se não for admin
        if (!vCorreto.admin && vCorreto.meta > 0) {
          await db.insert(metasTrimestrais).values({
            vendedorId: novoVendedorId,
            trimestre: 'Meta Trimestral 1',
            metaTrimestral: vCorreto.meta,
            superMeta: vCorreto.superMeta,
            bonusMeta: vCorreto.bonusMeta,
            bonusSuperMeta: vCorreto.bonusSuper,
            metaAgencia: metaAgencia,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }

    console.log('\n✅ Atualização concluída com sucesso!');
    console.log(`\n📊 Resumo:`);
    console.log(`   - Total de vendedores: ${vendedoresCorretos.length}`);
    console.log(`   - Administradores: 2 (Felipe e Andrios)`);
    console.log(`   - Vendedores com meta: 12`);
    console.log(`   - Júlia (sem meta): 1`);
    console.log(`   - Meta da Agência: R$ ${(metaAgencia / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

  } catch (error) {
    console.error('❌ Erro ao atualizar vendedores e metas:', error);
    throw error;
  }
}

atualizarVendedoresEMetas()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
