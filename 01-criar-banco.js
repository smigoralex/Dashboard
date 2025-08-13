// Arquivo: 01-criar-banco.js (ATUALIZADO COM ON DELETE CASCADE E BETTER-SQLITE3)

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const DB_FILE = 'database.db';

const db = new Database(DB_FILE);
console.log(`Conectado ao banco de dados SQLite: ${DB_FILE}`);

// Habilita e verifica as chaves estrangeiras (essencial para ON DELETE CASCADE)
db.exec('PRAGMA foreign_keys = ON;');

console.log("Iniciando a criação das tabelas...");

// Tabela de Etapas de Ensino
db.exec(`CREATE TABLE IF NOT EXISTS Etapas_Ensino (id_etapa INTEGER PRIMARY KEY AUTOINCREMENT, nome_etapa TEXT NOT NULL UNIQUE)`);
console.log(`Tabela 'Etapas_Ensino' criada ou já existente.`);

// Tabela de Escolas
db.exec(`CREATE TABLE IF NOT EXISTS Escolas (id_escola INTEGER PRIMARY KEY AUTOINCREMENT, nome_escola TEXT NOT NULL UNIQUE)`);
console.log(`Tabela 'Escolas' criada ou já existente.`);

// Tabela de Turmas (Sua estrutura correta foi mantida)
db.exec(`CREATE TABLE IF NOT EXISTS Turmas (id_turma INTEGER PRIMARY KEY AUTOINCREMENT, nome_turma TEXT NOT NULL, id_escola INTEGER NOT NULL, id_etapa INTEGER NOT NULL, FOREIGN KEY (id_escola) REFERENCES Escolas (id_escola), FOREIGN KEY (id_etapa) REFERENCES Etapas_Ensino (id_etapa))`);
console.log(`Tabela 'Turmas' criada ou já existente.`);

// Tabela de Alunos
db.exec(`CREATE TABLE IF NOT EXISTS Alunos (id_aluno INTEGER PRIMARY KEY AUTOINCREMENT, nome_aluno TEXT NOT NULL, data_nascimento TEXT, nome_mae TEXT, inep_aluno TEXT UNIQUE, beneficiario_social TEXT, cor_raca TEXT, pcd TEXT, transporte_escolar TEXT)`);
console.log(`Tabela 'Alunos' criada ou já existente.`);

// Tabela de Avaliações
db.exec(`CREATE TABLE IF NOT EXISTS Avaliacoes (id_avaliacao INTEGER PRIMARY KEY AUTOINCREMENT, nome_avaliacao TEXT NOT NULL, ano_aplicacao INTEGER NOT NULL, etapa_de_conhecimento TEXT, UNIQUE(nome_avaliacao, ano_aplicacao, etapa_de_conhecimento))`);
console.log(`Tabela 'Avaliacoes' criada ou já existente.`);

// Tabela de Níveis de Avaliação (COM CORREÇÃO)
db.exec(`CREATE TABLE IF NOT EXISTS Niveis_Avaliacao (id_nivel INTEGER PRIMARY KEY AUTOINCREMENT, id_avaliacao INTEGER NOT NULL, descricao_resultado TEXT NOT NULL, ordem INTEGER, cor TEXT, FOREIGN KEY (id_avaliacao) REFERENCES Avaliacoes (id_avaliacao) ON DELETE CASCADE, UNIQUE(id_avaliacao, descricao_resultado))`);
console.log(`Tabela 'Niveis_Avaliacao' criada ou já existente.`);

// Tabela de Resultados (COM CORREÇÃO)
db.exec(`CREATE TABLE IF NOT EXISTS Resultados (id_resultado INTEGER PRIMARY KEY AUTOINCREMENT, id_aluno INTEGER NOT NULL, id_avaliacao INTEGER NOT NULL, id_turma_na_epoca INTEGER, id_nivel_resultado INTEGER, beneficiario_na_epoca TEXT, transporte_na_epoca TEXT, FOREIGN KEY (id_aluno) REFERENCES Alunos (id_aluno) ON DELETE CASCADE, FOREIGN KEY (id_avaliacao) REFERENCES Avaliacoes (id_avaliacao) ON DELETE CASCADE, FOREIGN KEY (id_turma_na_epoca) REFERENCES Turmas (id_turma), FOREIGN KEY (id_nivel_resultado) REFERENCES Niveis_Avaliacao (id_nivel))`);
console.log(`Tabela 'Resultados' criada ou já existente.`);

// Tabela de Tipos de Escala
db.exec(`CREATE TABLE IF NOT EXISTS Tipos_Escala (id_escala INTEGER PRIMARY KEY AUTOINCREMENT, nome_escala TEXT NOT NULL UNIQUE)`);
console.log(`Tabela 'Tipos_Escala' criada ou já existente.`);

// Tabela de Níveis de Escala (COM CORREÇÃO)
db.exec(`CREATE TABLE IF NOT EXISTS Niveis_Escala (id_nivel_escala INTEGER PRIMARY KEY AUTOINCREMENT, id_escala INTEGER NOT NULL, descricao_resultado TEXT NOT NULL, ordem INTEGER NOT NULL, cor TEXT, FOREIGN KEY (id_escala) REFERENCES Tipos_Escala (id_escala) ON DELETE CASCADE)`);
console.log(`Tabela 'Niveis_Escala' criada ou já existente.`);

// Tabela de Usuários
db.exec(`CREATE TABLE IF NOT EXISTS Usuarios (id_usuario INTEGER PRIMARY KEY AUTOINCREMENT, nome_usuario TEXT NOT NULL UNIQUE, senha TEXT NOT NULL, permissao TEXT NOT NULL DEFAULT 'admin')`);
console.log(`Tabela 'Usuarios' criada ou já existente.`);


// --- POPULANDO DADOS INICIAIS ---
console.log("-----------------------------------------");
console.log("Populando modelos de escala e criando usuário padrão...");

const modelosDeEscala = [
    { nome: 'Fluência - Escala Pré-Leitor', niveis: [ { desc: 'Pré Leitor 1', ordem: 1, cor: '#ffcdd2' }, { desc: 'Pré Leitor 2', ordem: 2, cor: '#ffccbc' }, { desc: 'Pré Leitor 3', ordem: 3, cor: '#ffecb3' }, { desc: 'Pré Leitor 4', ordem: 4, cor: '#dcedc8' }, { desc: 'Pré Leitor 5', ordem: 5, cor: '#c8e6c9' }, { desc: 'Pré Leitor 6', ordem: 6, cor: '#a5d6a7' }, { desc: 'Iniciante', ordem: 7, cor: '#b3e5fc' }, { desc: 'Fluente', ordem: 8, cor: '#81d4fa' } ] },
    { nome: 'Desempenho - Somativa (4 Níveis)', niveis: [ { desc: 'Abaixo do Básico', ordem: 1, cor: '#ffebee' }, { desc: 'Básico', ordem: 2, cor: '#fffde7' }, { desc: 'Proficiente', ordem: 3, cor: '#e8f5e9' }, { desc: 'Avançado', ordem: 4, cor: '#dcedc8' } ] },
    { nome: 'Diagnóstica - Escala 2 (3 Níveis)', niveis: [ { desc: 'Defasado', ordem: 1, cor: '#ffcdd2' }, { desc: 'Intermediário', ordem: 2, cor: '#fffde7' }, { desc: 'Adequado', ordem: 3, cor: '#e8f5e9' } ] }
];

const insertEscala = db.prepare('INSERT OR IGNORE INTO Tipos_Escala (nome_escala) VALUES (?)');
const insertNivel = db.prepare('INSERT OR IGNORE INTO Niveis_Escala (id_escala, descricao_resultado, ordem, cor) VALUES (?, ?, ?, ?)');
const findEscala = db.prepare('SELECT id_escala FROM Tipos_Escala WHERE nome_escala = ?');

modelosDeEscala.forEach(modelo => {
    const info = insertEscala.run(modelo.nome);
    // Se a escala já existia, a gente precisa pegar o ID dela. Se foi inserida agora, o lastInsertRowid nos dá o ID.
    const escalaId = info.lastInsertRowid || findEscala.get(modelo.nome).id_escala;
    if (escalaId) {
        modelo.niveis.forEach(nivel => {
            insertNivel.run(escalaId, nivel.desc, nivel.ordem, nivel.cor);
        });
    }
});
console.log('Modelos de escala populados com sucesso.');

// Criando usuário padrão
const senhaPlana = 'admin123';
const senhaHash = bcrypt.hashSync(senhaPlana, 10);
const stmt = db.prepare(`INSERT OR IGNORE INTO Usuarios (nome_usuario, senha, permissao) VALUES (?, ?, ?)`);
stmt.run('admin', senhaHash, 'superadmin');
console.log("Usuário padrão 'admin' (senha: 'admin123') criado/verificado com sucesso.");

console.log("-----------------------------------------");
console.log("Banco de dados fechado. Estrutura, modelos e usuário padrão criados com sucesso!");
db.close();