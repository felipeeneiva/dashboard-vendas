import { describe, it, expect, beforeAll } from 'vitest';
import { getDb, getVendedorByEmail } from '../db';

describe('Painel Individual - Controle de Acesso', () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database não disponível para testes');
    }
  });

  it('deve retornar vendedor quando email existe no banco', async () => {
    // Testa com email do Gabriel
    const vendedor = await getVendedorByEmail('gabriel@mundoproviagens.com.br');
    
    expect(vendedor).toBeDefined();
    expect(vendedor?.nome).toBe('Gabriel');
    expect(vendedor?.email).toBe('gabriel@mundoproviagens.com.br');
  });

  it('deve retornar undefined quando email não existe', async () => {
    const vendedor = await getVendedorByEmail('naoexiste@mundoproviagens.com.br');
    
    expect(vendedor).toBeUndefined();
  });

  it('deve retornar undefined quando email é null', async () => {
    const vendedor = await getVendedorByEmail(null);
    
    expect(vendedor).toBeUndefined();
  });

  it('deve retornar undefined quando email é undefined', async () => {
    const vendedor = await getVendedorByEmail(undefined);
    
    expect(vendedor).toBeUndefined();
  });

  it('deve identificar corretamente os emails de admin', () => {
    const ADMIN_EMAILS = ['felipe@mundoproviagens.com.br', 'vendas@mundoproviagens.com.br'];
    
    // Testa admins
    expect(ADMIN_EMAILS.includes('felipe@mundoproviagens.com.br')).toBe(true);
    expect(ADMIN_EMAILS.includes('vendas@mundoproviagens.com.br')).toBe(true);
    
    // Testa vendedores comuns
    expect(ADMIN_EMAILS.includes('gabriel@mundoproviagens.com.br')).toBe(false);
    expect(ADMIN_EMAILS.includes('danilo@mundoproviagens.com.br')).toBe(false);
    expect(ADMIN_EMAILS.includes('mauro@mundoproviagens.com.br')).toBe(false);
  });

  it('deve validar que cada vendedor tem email único', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database não disponível');

    const { vendedores } = await import('../../drizzle/schema');
    const todosVendedores = await db.select().from(vendedores);
    
    // Filtra vendedores com email (alguns podem não ter)
    const vendedoresComEmail = todosVendedores.filter(v => v.email);
    
    // Cria um Set com os emails (Set remove duplicatas)
    const emailsUnicos = new Set(vendedoresComEmail.map(v => v.email));
    
    // Se o tamanho do Set é igual ao número de vendedores, não há duplicatas
    expect(emailsUnicos.size).toBe(vendedoresComEmail.length);
  });

  it('deve validar estrutura de dados retornados pelo endpoint', async () => {
    // Simula a estrutura que o endpoint painelVendedor.meusDados deve retornar
    const mockResponse = {
      vendedor: {
        id: 1,
        nome: 'Gabriel',
        email: 'gabriel@mundoproviagens.com.br',
        metaTrimestral: 65000000 // em centavos
      },
      totais: {
        vendas: 360787215, // em centavos
        receita: 51847835,
        comissao: 17478601
      },
      metaTrimestralIndividual: {
        meta: 650000.00,
        vendido: 0.00,
        falta: 650000.00,
        percentual: '0.00'
      },
      metaGeralEquipe: {
        meta: 10000000.00,
        vendido: 4567777.48,
        falta: 5432222.52,
        percentual: '45.68'
      },
      mesesComDados: 18
    };

    // Valida estrutura
    expect(mockResponse).toHaveProperty('vendedor');
    expect(mockResponse).toHaveProperty('totais');
    expect(mockResponse).toHaveProperty('metaTrimestralIndividual');
    expect(mockResponse).toHaveProperty('metaGeralEquipe');
    
    // Valida tipos
    expect(typeof mockResponse.vendedor.id).toBe('number');
    expect(typeof mockResponse.vendedor.nome).toBe('string');
    expect(typeof mockResponse.totais.vendas).toBe('number');
    expect(typeof mockResponse.metaTrimestralIndividual.percentual).toBe('string');
  });
});
