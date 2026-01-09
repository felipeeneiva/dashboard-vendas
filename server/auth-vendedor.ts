import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-aqui-mude-em-producao';
const JWT_EXPIRES_IN = '7d'; // Token expira em 7 dias

export interface VendedorToken {
  vendedorId: number;
  email: string;
  nome: string;
  primeiroAcesso: boolean;
}

/**
 * Faz login do vendedor com email e senha
 */
export async function loginVendedor(email: string, senha: string): Promise<{ token: string; vendedor: VendedorToken } | null> {
  console.log('[AUTH] Tentativa de login:', email);
  
  // Busca vendedor por email
  const vendedor = await db.getVendedorByEmail(email);
  if (!vendedor) {
    console.log('[AUTH] Vendedor não encontrado');
    return null;
  }
  
  // Verifica se tem senha cadastrada
  if (!vendedor.passwordHash) {
    console.log('[AUTH] Vendedor sem senha cadastrada');
    return null;
  }
  
  // Verifica senha
  const senhaCorreta = await bcrypt.compare(senha, vendedor.passwordHash);
  if (!senhaCorreta) {
    console.log('[AUTH] Senha incorreta');
    return null;
  }
  
  console.log('[AUTH] Login bem-sucedido:', vendedor.nome);
  
  // Gera token JWT
  const tokenData: VendedorToken = {
    vendedorId: vendedor.id,
    email: vendedor.email,
    nome: vendedor.nome,
    primeiroAcesso: vendedor.primeiroAcesso ?? true,
  };
  
  const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  
  return { token, vendedor: tokenData };
}

/**
 * Troca a senha do vendedor
 */
export async function trocarSenha(vendedorId: number, senhaAtual: string, senhaNova: string): Promise<boolean> {
  console.log('[AUTH] Troca de senha para vendedor ID:', vendedorId);
  
  // Busca vendedor
  const vendedor = await db.getVendedorById(vendedorId);
  if (!vendedor) {
    console.log('[AUTH] Vendedor não encontrado');
    return false;
  }
  
  // Verifica senha atual (se não for primeiro acesso)
  if (!vendedor.primeiroAcesso && vendedor.passwordHash) {
    const senhaCorreta = await bcrypt.compare(senhaAtual, vendedor.passwordHash);
    if (!senhaCorreta) {
      console.log('[AUTH] Senha atual incorreta');
      return false;
    }
  }
  
  // Gera hash da nova senha
  const novoHash = await bcrypt.hash(senhaNova, 10);
  
  // Atualiza no banco
  await db.atualizarSenhaVendedor(vendedorId, novoHash);
  
  console.log('[AUTH] Senha atualizada com sucesso');
  return true;
}

/**
 * Define senha padrão para um vendedor
 */
export async function definirSenhaPadrao(vendedorId: number, senhaPadrao: string): Promise<boolean> {
  console.log('[AUTH] Definindo senha padrão para vendedor ID:', vendedorId);
  
  const hash = await bcrypt.hash(senhaPadrao, 10);
  await db.atualizarSenhaVendedor(vendedorId, hash);
  
  console.log('[AUTH] Senha padrão definida');
  return true;
}

/**
 * Verifica e decodifica token JWT
 */
export function verificarToken(token: string): VendedorToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as VendedorToken;
    return decoded;
  } catch (error) {
    console.log('[AUTH] Token inválido:', error);
    return null;
  }
}
