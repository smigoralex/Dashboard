// src/controllers/apiController.js (VERSÃO COMPLETA E CORRIGIDA)

const db = require('../config/database.js');

const getDashboardData = (req, res) => {
    try {
        let sql = ` SELECT a.nome_aluno, a.inep_aluno AS "INEP", e.nome_escola AS "ESCOLA", t.nome_turma AS "TURMA", et.nome_etapa AS "ETAPA DE ENSINO", av.nome_avaliacao, na.descricao_resultado AS "resultado", r.beneficiario_na_epoca AS "BENEFICIÁRIO SOCIAL?", r.transporte_na_epoca AS "UTILIZA TRANSPORTE ESCOLAR", a.cor_raca AS "COR/RAÇA", a.pcd AS "ALUNO PCD?" FROM Resultados r LEFT JOIN Alunos a ON r.id_aluno = a.id_aluno LEFT JOIN Turmas t ON r.id_turma_na_epoca = t.id_turma LEFT JOIN Escolas e ON t.id_escola = e.id_escola LEFT JOIN Etapas_Ensino et ON t.id_etapa = et.id_etapa LEFT JOIN Avaliacoes av ON r.id_avaliacao = av.id_avaliacao LEFT JOIN Niveis_Avaliacao na ON r.id_nivel_resultado = na.id_nivel `;
        const whereClauses = [];
        const params = [];
        if (req.query.escola) { whereClauses.push("e.nome_escola = ?"); params.push(req.query.escola); }
        if (req.query.turma) { whereClauses.push("t.nome_turma = ?"); params.push(req.query.turma); }
        if (req.query.etapa) { whereClauses.push("et.nome_etapa = ?"); params.push(req.query.etapa); }
        if (req.query.avaliacao) { whereClauses.push("av.nome_avaliacao = ?"); params.push(req.query.avaliacao); }
        if (req.query.nivel) { whereClauses.push("na.descricao_resultado = ?"); params.push(req.query.nivel); }
        if (req.query.beneficiario) { whereClauses.push("r.beneficiario_na_epoca = ?"); params.push(req.query.beneficiario); }
        if (req.query.transporte) { whereClauses.push("r.transporte_na_epoca = ?"); params.push(req.query.transporte); }
        if (req.query.cor_raca) { whereClauses.push("a.cor_raca = ?"); params.push(req.query.cor_raca); }
        if (req.query.pcd) { whereClauses.push("a.pcd = ?"); params.push(req.query.pcd); }
        if (whereClauses.length > 0) { sql += " WHERE " + whereClauses.join(" AND "); }
        const stmt = db.prepare(sql);
        const rows = stmt.all(params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

const getAlunoByInep = (req, res) => {
    const { inep } = req.params;
    try {
        const alunoStmt = db.prepare('SELECT * FROM Alunos WHERE inep_aluno = ?');
        const dadosCadastrais = alunoStmt.get(inep);
        if (!dadosCadastrais) { return res.status(404).json({ error: 'Aluno não encontrado' }); }
        const historicoStmt = db.prepare(` SELECT av.nome_avaliacao, av.ano_aplicacao, av.etapa_de_conhecimento, na.descricao_resultado AS resultado, t.nome_turma, et.nome_etapa, e.nome_escola FROM Resultados r LEFT JOIN Avaliacoes av ON r.id_avaliacao = av.id_avaliacao LEFT JOIN Niveis_Avaliacao na ON r.id_nivel_resultado = na.id_nivel LEFT JOIN Alunos a ON r.id_aluno = a.id_aluno LEFT JOIN Turmas t ON r.id_turma_na_epoca = t.id_turma LEFT JOIN Etapas_Ensino et ON t.id_etapa = et.id_etapa LEFT JOIN Escolas e ON t.id_escola = e.id_escola WHERE a.inep_aluno = ? ORDER BY av.ano_aplicacao ASC, av.nome_avaliacao ASC `);
        const historicoResultados = historicoStmt.all(inep);
        res.status(200).json({ dadosCadastrais, historicoResultados });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

const getFiltrosEscolas = (req, res) => { 
    try { 
        const stmt = db.prepare('SELECT id_escola, nome_escola FROM Escolas ORDER BY nome_escola'); 
        const rows = stmt.all(); 
        res.status(200).json(rows); 
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    } 
};

const getFiltrosGerais = (req, res) => { 
    try { 
        const etapas = db.prepare('SELECT id_etapa, nome_etapa FROM Etapas_Ensino ORDER BY nome_etapa').all(); 
        const turmas = db.prepare('SELECT DISTINCT id_turma, nome_turma FROM Turmas WHERE nome_turma IS NOT NULL ORDER BY nome_turma').all(); 
        const avaliacoes = db.prepare('SELECT DISTINCT id_avaliacao, nome_avaliacao FROM Avaliacoes ORDER BY nome_avaliacao').all(); 
        res.status(200).json({ etapas, turmas, avaliacoes }); 
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    } 
};

const getFiltrosAnos = (req, res) => { 
    try { 
        const stmt = db.prepare('SELECT DISTINCT ano_aplicacao FROM Avaliacoes ORDER BY ano_aplicacao DESC'); 
        const rows = stmt.all(); 
        res.status(200).json(rows.map(item => item.ano_aplicacao)); 
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    } 
};

const getFiltrosAvaliacoesPorAno = (req, res) => { 
    try { 
        const ano = req.query.ano; 
        if (!ano) { 
            return res.status(400).json({ error: 'O ano é um parâmetro obrigatório.' }); 
        } 
        const stmt = db.prepare('SELECT id_avaliacao, nome_avaliacao FROM Avaliacoes WHERE ano_aplicacao = ? ORDER BY nome_avaliacao'); 
        const rows = stmt.all(ano); 
        res.status(200).json(rows); 
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    } 
};

const getNiveisPorAvaliacao = (req, res) => { 
    try { 
        let id_avaliacao = req.query.id_avaliacao; 
        if (!id_avaliacao && req.query.avaliacao_nome) { 
            const avaliacao = db.prepare('SELECT id_avaliacao FROM Avaliacoes WHERE nome_avaliacao = ?').get(req.query.avaliacao_nome); 
            if (avaliacao) { 
                id_avaliacao = avaliacao.id_avaliacao; 
            } 
        } 
        if (!id_avaliacao) { 
            return res.status(400).json({ error: 'O ID da avaliação é obrigatório.' }); 
        } 
        const stmt = db.prepare('SELECT id_nivel, descricao_resultado FROM Niveis_Avaliacao WHERE id_avaliacao = ? ORDER BY ordem'); 
        const rows = stmt.all(id_avaliacao); 
        res.status(200).json(rows); 
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    } 
};

const getTurmas = (req, res) => { 
    try { 
        const { id_escola, id_etapa } = req.query; 
        if (!id_escola || !id_etapa) { 
            return res.status(400).json({ error: 'ID da escola e da etapa são obrigatórios.' }); 
        } 
        const stmt = db.prepare('SELECT id_turma, nome_turma FROM Turmas WHERE id_escola = ? AND id_etapa = ? ORDER BY nome_turma'); 
        const rows = stmt.all(id_escola, id_etapa); 
        res.status(200).json(rows); 
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    } 
};

const getFiltrosDemograficos = (req, res) => { 
    try { 
        const beneficiario = db.prepare('SELECT DISTINCT beneficiario_social FROM Alunos WHERE beneficiario_social IS NOT NULL').all().map(r => r.beneficiario_social); 
        const cor_raca = db.prepare('SELECT DISTINCT cor_raca FROM Alunos WHERE cor_raca IS NOT NULL').all().map(r => r.cor_raca); 
        const pcd = db.prepare('SELECT DISTINCT pcd FROM Alunos WHERE pcd IS NOT NULL').all().map(r => r.pcd); 
        const transporte = db.prepare('SELECT DISTINCT transporte_escolar FROM Alunos WHERE transporte_escolar IS NOT NULL').all().map(r => r.transporte_escolar); 
        res.status(200).json({ beneficiario, cor_raca, pcd, transporte }); 
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    } 
};

const getAlunos = (req, res) => { 
    try { 
        const busca = req.query.busca || ''; 
        let sql = 'SELECT * FROM Alunos'; 
        const params = []; 
        if (busca) { 
            sql += ' WHERE UPPER(nome_aluno) LIKE UPPER(?) OR inep_aluno LIKE ?'; 
            params.push(`%${busca}%`, `%${busca}%`); 
        } 
        sql += ' ORDER BY nome_aluno'; 
        const stmt = db.prepare(sql); 
        const alunos = stmt.all(params); 
        res.status(200).json(alunos); 
    } catch (error) { 
        res.status(500).json({ error: 'Erro interno do servidor ao buscar alunos.' }); 
    } 
};

const createAluno = (req, res) => { 
    const { nome_aluno, data_nascimento, nome_mae, inep_aluno, beneficiario_social, cor_raca, pcd, transporte_escolar } = req.body; 
    if (!nome_aluno || !inep_aluno) { 
        return res.status(400).json({ error: 'O nome do aluno e o INEP são obrigatórios.' }); 
    } 
    if (!/^\d{12}$/.test(inep_aluno)) { 
        return res.status(400).json({ error: 'O INEP deve conter exatamente 12 números.' }); 
    } 
    try { 
        const sql = `INSERT INTO Alunos (nome_aluno, data_nascimento, nome_mae, inep_aluno, beneficiario_social, cor_raca, pcd, transporte_escolar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; 
        const stmt = db.prepare(sql); 
        const info = stmt.run(nome_aluno, data_nascimento, nome_mae, inep_aluno, beneficiario_social, cor_raca, pcd, transporte_escolar); 
        res.status(201).json({ id_aluno: info.lastInsertRowid, message: 'Aluno criado com sucesso!' }); 
    } catch (error) { 
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') { 
            return res.status(409).json({ error: 'Já existe um aluno com este número de INEP.' }); 
        } 
        res.status(500).json({ error: 'Erro interno do servidor ao criar aluno.' }); 
    } 
};

const updateAluno = (req, res) => { 
    const { id } = req.params; 
    const { nome_aluno, data_nascimento, nome_mae, inep_aluno, beneficiario_social, cor_raca, pcd, transporte_escolar } = req.body; 
    if (!nome_aluno || !inep_aluno) { 
        return res.status(400).json({ error: 'O nome do aluno e o INEP são obrigatórios.' }); 
    } 
    if (!/^\d{12}$/.test(inep_aluno)) { 
        return res.status(400).json({ error: 'O INEP deve conter exatamente 12 números.' }); 
    } 
    try { 
        const sql = ` UPDATE Alunos SET nome_aluno = ?, data_nascimento = ?, nome_mae = ?, inep_aluno = ?, beneficiario_social = ?, cor_raca = ?, pcd = ?, transporte_escolar = ? WHERE id_aluno = ? `; 
        const stmt = db.prepare(sql); 
        const info = stmt.run(nome_aluno, data_nascimento, nome_mae, inep_aluno, beneficiario_social, cor_raca, pcd, transporte_escolar, id); 
        if (info.changes === 0) { 
            return res.status(404).json({ error: 'Aluno não encontrado com o ID fornecido.' }); 
        } 
        res.status(200).json({ message: 'Aluno atualizado com sucesso!' }); 
    } catch (error) { 
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') { 
            return res.status(409).json({ error: 'Já existe outro aluno com este número de INEP.' }); 
        } 
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar aluno.' }); 
    } 
};

const deleteAluno = (req, res) => { 
    const { id } = req.params; 
    try { 
        const stmt = db.prepare('DELETE FROM Alunos WHERE id_aluno = ?'); 
        const info = stmt.run(id); 
        if (info.changes === 0) { 
            return res.status(404).json({ error: 'Aluno não encontrado.' }); 
        } 
        res.status(200).json({ message: 'Aluno e todos os seus resultados foram excluídos com sucesso.' }); 
    } catch (error) { 
        console.error("Erro ao excluir aluno:", error); 
        res.status(500).json({ error: 'Erro interno do servidor ao excluir o aluno.' }); 
    } 
};

const getAvaliacoes = (req, res) => { 
    try { 
        const stmt = db.prepare('SELECT * FROM Avaliacoes ORDER BY ano_aplicacao DESC, nome_avaliacao ASC'); 
        const avaliacoes = stmt.all(); 
        res.status(200).json(avaliacoes); 
    } catch (error) { 
        res.status(500).json({ error: 'Erro interno do servidor ao buscar avaliações.' }); 
    } 
};

const createAvaliacao = (req, res) => { 
    const { nome_avaliacao, ano_aplicacao, etapa_de_conhecimento, niveis } = req.body; 
    if (!nome_avaliacao || !ano_aplicacao || !etapa_de_conhecimento) { 
        return res.status(400).json({ error: 'Nome, ano e área de conhecimento da avaliação são obrigatórios.' }); 
    } 
    if (!Array.isArray(niveis) || niveis.length === 0) { 
        return res.status(400).json({ error: 'A avaliação deve ter pelo menos um nível de desempenho.' }); 
    } 
    const transaction = db.transaction(() => { 
        const avaliacaoStmt = db.prepare(` INSERT INTO Avaliacoes (nome_avaliacao, ano_aplicacao, etapa_de_conhecimento) VALUES (?, ?, ?) `); 
        const info = avaliacaoStmt.run(nome_avaliacao, ano_aplicacao, etapa_de_conhecimento); 
        const newAvaliacaoId = info.lastInsertRowid; 
        const nivelStmt = db.prepare(` INSERT INTO Niveis_Avaliacao (id_avaliacao, descricao_resultado, ordem, cor) VALUES (?, ?, ?, ?) `); 
        for (const nivel of niveis) { 
            if (!nivel.descricao_resultado || nivel.ordem === undefined) { 
                throw new Error('Cada nível deve ter uma descrição e uma ordem.'); 
            } 
            nivelStmt.run(newAvaliacaoId, nivel.descricao_resultado, nivel.ordem, nivel.cor); 
        } 
        return { id: newAvaliacaoId }; 
    }); 
    try { 
        const result = transaction(); 
        res.status(201).json({ id_avaliacao: result.id, message: 'Avaliação e seus níveis criados com sucesso!' }); 
    } catch (error) { 
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') { 
            return res.status(409).json({ error: 'Já existe uma avaliação com este nome, ano e área.' }); 
        } 
        res.status(500).json({ error: error.message || 'Erro interno do servidor ao criar avaliação.' }); 
    } 
};

const deleteAvaliacao = (req, res) => { 
    const { id } = req.params; 
    try { 
        const stmt = db.prepare('DELETE FROM Avaliacoes WHERE id_avaliacao = ?'); 
        const info = stmt.run(id); 
        if (info.changes === 0) { 
            return res.status(404).json({ error: 'Avaliação não encontrada.' }); 
        } 
        res.status(200).json({ message: 'Avaliação e todos os seus dados associados foram excluídos com sucesso.' }); 
    } catch (error) { 
        console.error("Erro ao excluir avaliação:", error); 
        res.status(500).json({ error: 'Erro interno do servidor ao excluir a avaliação.' }); 
    } 
};

// === NOVAS FUNÇÕES PARA EDIÇÃO DE AVALIAÇÕES ===

const getAvaliacaoById = (req, res) => {
    const { id } = req.params;
    try {
        // Busca dados da avaliação
        const avaliacaoStmt = db.prepare('SELECT * FROM Avaliacoes WHERE id_avaliacao = ?');
        const avaliacao = avaliacaoStmt.get(id);
        
        if (!avaliacao) {
            return res.status(404).json({ error: 'Avaliação não encontrada.' });
        }

        // Busca níveis da avaliação
        const niveisStmt = db.prepare(`
            SELECT id_nivel, descricao_resultado, ordem, cor 
            FROM Niveis_Avaliacao 
            WHERE id_avaliacao = ? 
            ORDER BY ordem ASC
        `);
        const niveis = niveisStmt.all(id);

        res.status(200).json({
            ...avaliacao,
            niveis: niveis
        });
    } catch (error) {
        console.error("Erro ao buscar avaliação:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar avaliação.' });
    }
};

const updateAvaliacao = (req, res) => {
    const { id } = req.params;
    const { nome_avaliacao, ano_aplicacao, etapa_de_conhecimento, niveis } = req.body;

    if (!nome_avaliacao || !ano_aplicacao || !etapa_de_conhecimento) {
        return res.status(400).json({ error: 'Nome, ano e área de conhecimento da avaliação são obrigatórios.' });
    }

    if (!Array.isArray(niveis) || niveis.length === 0) {
        return res.status(400).json({ error: 'A avaliação deve ter pelo menos um nível de desempenho.' });
    }

    const transaction = db.transaction(() => {
        // Atualiza dados da avaliação
        const updateAvaliacaoStmt = db.prepare(`
            UPDATE Avaliacoes 
            SET nome_avaliacao = ?, ano_aplicacao = ?, etapa_de_conhecimento = ?
            WHERE id_avaliacao = ?
        `);
        const info = updateAvaliacaoStmt.run(nome_avaliacao, ano_aplicacao, etapa_de_conhecimento, id);
        
        if (info.changes === 0) {
            throw new Error('Avaliação não encontrada para atualização.');
        }

        // Remove níveis existentes
        const deleteNiveisStmt = db.prepare('DELETE FROM Niveis_Avaliacao WHERE id_avaliacao = ?');
        deleteNiveisStmt.run(id);

        // Insere novos níveis
        const insertNivelStmt = db.prepare(`
            INSERT INTO Niveis_Avaliacao (id_avaliacao, descricao_resultado, ordem, cor)
            VALUES (?, ?, ?, ?)
        `);

        for (const nivel of niveis) {
            if (!nivel.descricao_resultado || nivel.ordem === undefined) {
                throw new Error('Cada nível deve ter uma descrição e uma ordem.');
            }
            insertNivelStmt.run(id, nivel.descricao_resultado, nivel.ordem, nivel.cor);
        }

        return { id };
    });

    try {
        transaction();
        res.status(200).json({ message: 'Avaliação atualizada com sucesso!' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Já existe uma avaliação com este nome, ano e área.' });
        }
        res.status(500).json({ error: error.message || 'Erro interno do servidor ao atualizar avaliação.' });
    }
};

const getEscalas = (req, res) => { 
    try { 
        const stmt = db.prepare('SELECT id_escala, nome_escala FROM Tipos_Escala ORDER BY nome_escala'); 
        const escalas = stmt.all(); 
        res.status(200).json(escalas); 
    } catch (error) { 
        res.status(500).json({ error: 'Erro ao buscar modelos de escala.' }); 
    } 
};

const getEscalaById = (req, res) => { 
    try { 
        const { id } = req.params; 
        const stmt = db.prepare('SELECT descricao_resultado, ordem, cor FROM Niveis_Escala WHERE id_escala = ? ORDER BY ordem'); 
        const niveis = stmt.all(id); 
        if (!niveis) { 
            return res.status(404).json({ error: 'Modelo de escala não encontrado.' }); 
        } 
        res.status(200).json(niveis); 
    } catch (error) { 
        res.status(500).json({ error: 'Erro ao buscar detalhes do modelo de escala.' }); 
    } 
};

const createResultado = (req, res) => { 
    const { id_aluno, id_avaliacao, id_turma_na_epoca, id_nivel_resultado, beneficiario_na_epoca, transporte_na_epoca } = req.body; 
    if (!id_aluno || !id_avaliacao || !id_turma_na_epoca || !id_nivel_resultado) { 
        return res.status(400).json({ error: 'Todos os campos são obrigatórios para lançar um resultado.' }); 
    } 
    try { 
        const stmt = db.prepare(` INSERT INTO Resultados (id_aluno, id_avaliacao, id_turma_na_epoca, id_nivel_resultado, beneficiario_na_epoca, transporte_na_epoca) VALUES (?, ?, ?, ?, ?, ?) `); 
        const info = stmt.run(id_aluno, id_avaliacao, id_turma_na_epoca, id_nivel_resultado, beneficiario_na_epoca, transporte_na_epoca); 
        res.status(201).json({ id_resultado: info.lastInsertRowid, message: `Resultado salvo com sucesso!` }); 
    } catch (error) { 
        res.status(500).json({ error: 'Erro interno do servidor ao salvar resultado.' }); 
    } 
};

module.exports = {
    getDashboardData,
    getAlunoByInep,
    getFiltrosEscolas,
    getFiltrosGerais,
    getFiltrosAnos,
    getFiltrosAvaliacoesPorAno,
    getNiveisPorAvaliacao,
    getTurmas,
    getFiltrosDemograficos,
    getAlunos,
    createAluno,
    updateAluno,
    deleteAluno,
    getAvaliacoes,
    createAvaliacao,
    deleteAvaliacao,
    getEscalas,
    getEscalaById,
    createResultado,
    // NOVAS FUNÇÕES ADICIONADAS:
    getAvaliacaoById,
    updateAvaliacao
};