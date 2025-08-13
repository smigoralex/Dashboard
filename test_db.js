// Arquivo: test_db.js
// Criar este arquivo na raiz do projeto para testar o banco

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

console.log('🔍 Testando conexão com o banco de dados...');

try {
    // Tenta abrir o banco
    const db = new Database('database.db');
    console.log('✅ Banco de dados conectado com sucesso!');
    
    // Habilita chaves estrangeiras
    db.pragma('foreign_keys = ON');
    console.log('✅ Chaves estrangeiras habilitadas!');
    
    // Testa se a tabela de usuários existe
    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='Usuarios'");
    const table = stmt.get();
    
    if (table) {
        console.log('✅ Tabela Usuarios encontrada!');
        
        // Verifica se existe o usuário admin
        const userStmt = db.prepare('SELECT * FROM Usuarios WHERE nome_usuario = ?');
        const adminUser = userStmt.get('admin');
        
        if (adminUser) {
            console.log('✅ Usuário admin encontrado!');
            console.log(`   ID: ${adminUser.id_usuario}`);
            console.log(`   Nome: ${adminUser.nome_usuario}`);
            console.log(`   Permissão: ${adminUser.permissao}`);
            
            // Testa se a senha está funcionando
            const senhaCorreta = bcrypt.compareSync('admin123', adminUser.senha);
            if (senhaCorreta) {
                console.log('✅ Senha do admin está correta!');
            } else {
                console.log('❌ PROBLEMA: Senha do admin não confere!');
            }
        } else {
            console.log('❌ PROBLEMA: Usuário admin não encontrado!');
            console.log('💡 Solução: Execute o arquivo 01-criar-banco.js');
        }
        
    } else {
        console.log('❌ PROBLEMA: Tabela Usuarios não existe!');
        console.log('💡 Solução: Execute o arquivo 01-criar-banco.js');
    }
    
    db.close();
    console.log('✅ Teste concluído!');
    
} catch (error) {
    console.log('❌ ERRO no banco de dados:');
    console.log(error.message);
    
    if (error.code === 'SQLITE_CANTOPEN') {
        console.log('💡 Solução: O arquivo database.db não existe. Execute:');
        console.log('   node 01-criar-banco.js');
    }
}