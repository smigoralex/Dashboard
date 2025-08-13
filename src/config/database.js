// Arquivo: src/config/database.js

const Database = require('better-sqlite3');
const path = require('path');

// O caminho para o banco de dados na raiz do projeto
const DB_FILE = path.join(__dirname, '..', '..', 'database.db');

const db = new Database(DB_FILE);

// Ativa o suporte a chaves estrangeiras (essencial para ON DELETE CASCADE)
db.pragma('foreign_keys = ON');

console.log('Conexão com o banco de dados estabelecida com sucesso.');

// Garante que o banco de dados seja fechado quando o processo terminar
process.on('exit', () => db.close());

module.exports = db;