// Arquivo: criar_superadmin.js (para ser executado uma vez no terminal)

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const DB_FILE = 'database.db';
const db = new Database(DB_FILE);

console.log('--- Criação do Superadministrador ---');

readline.question('Digite o nome de usuário para o novo superadministrador: ', username => {
  readline.question('Digite a senha para este usuário: ', password => {
    if (!username || !password) {
        console.error('ERRO: Nome de usuário e senha não podem ser vazios.');
        db.close();
        readline.close();
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const permissao = 'superadmin';

    try {
      const stmt = db.prepare('INSERT INTO Usuarios (nome_usuario, senha, permissao) VALUES (?, ?, ?)');
      const info = stmt.run(username, hash, permissao);
      console.log(`\n✅ Superadministrador '${username}' criado com sucesso! (ID: ${info.lastInsertRowid})`);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.error(`\n❌ ERRO: O nome de usuário '${username}' já existe.`);
      } else {
        console.error('\n❌ ERRO ao criar superadministrador:', error.message);
      }
    } finally {
      db.close();
      readline.close();
    }
  });
});