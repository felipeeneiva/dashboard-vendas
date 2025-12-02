import { describe, it, expect, beforeAll } from 'vitest';
import * as db from '../db';

describe('Metas Trimestrais', () => {
  let gabrielId: number;

  beforeAll(async () => {
    const gabriel = await db.getVendedorByEmail('gabriel@mundoproviagens.com.br');
    if (!gabriel) throw new Error('Gabriel não encontrado');
    gabrielId = gabriel.id;
  });

  it('deve retornar metas trimestrais do Gabriel', async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error('Database não disponível');

    const { metasTrimestrais } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    const metas = await dbInstance
      .select()
      .from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabrielId));

    expect(metas.length).toBeGreaterThan(0);
    expect(metas.length).toBe(2); // Meta Trimestral 1 e Meta Trimestral 4
  });

  it('deve ter Meta Trimestral 1 como primeira (atual)', async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error('Database não disponível');

    const { metasTrimestrais } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    const metas = await dbInstance
      .select()
      .from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabrielId));

    const metasOrdenadas = metas.sort((a, b) => {
      if (a.trimestre === 'Meta Trimestral 1') return -1;
      if (b.trimestre === 'Meta Trimestral 1') return 1;
      return b.trimestre.localeCompare(a.trimestre);
    });

    expect(metasOrdenadas[0].trimestre).toBe('Meta Trimestral 1');
    expect(metasOrdenadas[0].metaTrimestral).toBe(60000000); // R$ 600.000 em centavos
  });

  it('deve ter valores corretos de bônus (1,1%)', async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error('Database não disponível');

    const { metasTrimestrais } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    const metas = await dbInstance
      .select()
      .from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabrielId));

    const metaTrimestral1 = metas.find(m => m.trimestre === 'Meta Trimestral 1');
    expect(metaTrimestral1).toBeDefined();
    
    if (metaTrimestral1) {
      // Meta: R$ 600.000
      expect(metaTrimestral1.metaTrimestral).toBe(60000000);
      
      // Super Meta: R$ 720.000 (+20%)
      expect(metaTrimestral1.superMeta).toBe(72000000);
      
      // Bônus Meta: R$ 6.000 (1%)
      expect(metaTrimestral1.bonusMeta).toBe(600000);
      
      // Bônus Super: R$ 7.900 (1,1% de 720k)
      expect(metaTrimestral1.bonusSuperMeta).toBe(790000);
    }
  });

  it('Meta Trimestral 4 deve ter meta de agência', async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error('Database não disponível');

    const { metasTrimestrais } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    const metas = await dbInstance
      .select()
      .from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabrielId));

    const metaTrimestral4 = metas.find(m => m.trimestre === 'Meta Trimestral 4');
    expect(metaTrimestral4).toBeDefined();
    
    if (metaTrimestral4) {
      // Meta da agência: R$ 10 milhões
      expect(metaTrimestral4.metaAgencia).toBe(1000000000);
    }
  });

  it('Meta Trimestral 1 NÃO deve ter meta de agência', async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error('Database não disponível');

    const { metasTrimestrais } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    const metas = await dbInstance
      .select()
      .from(metasTrimestrais)
      .where(eq(metasTrimestrais.vendedorId, gabrielId));

    const metaTrimestral1 = metas.find(m => m.trimestre === 'Meta Trimestral 1');
    expect(metaTrimestral1).toBeDefined();
    
    if (metaTrimestral1) {
      // Sem meta de agência
      expect(metaTrimestral1.metaAgencia).toBe(0);
    }
  });
});
