import { extrairDadosFornecedores } from '../server/sheetsExtractor.ts';

console.log('Testando extração de fornecedores...\n');

const sheetId = '1ZJz0MgOHLkYYNW5eWZmOAU797KXQPbwGmp8YnWl4NPo';
const mes = 'Junho/2024';

const dados = await extrairDadosFornecedores(sheetId, mes);

console.log(`\nTotal de registros: ${dados.length}`);

if (dados.length > 0) {
  console.log('\nPrimeiros 5 registros:');
  dados.slice(0, 5).forEach((f, i) => {
    console.log(`${i + 1}. ${f.operadora} (${f.operadoraNormalizada})`);
    console.log(`   Tarifa: R$ ${(f.tarifa / 100).toFixed(2)}`);
    console.log(`   Taxa: R$ ${(f.taxa / 100).toFixed(2)}`);
    console.log(`   Valor Total: R$ ${(f.valorTotal / 100).toFixed(2)}\n`);
  });
}

process.exit(0);
