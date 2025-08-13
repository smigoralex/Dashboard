// src/controllers/userController.js

const bcrypt = require('bcryptjs');
const db = require('../config/database.js');

// ... (funções getAllUsers, createUser, deleteUser existentes) ...

const getAllUsers = (req, res) => {
    try {
        const stmt = db.prepare('SELECT id_usuario, nome_usuario, permissao FROM Usuarios ORDER BY nome_usuario');
        const users = stmt.all();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor ao buscar usuários.' });
    }
};

const createUser = (req, res) => {
    const { nome_usuario, senha, permissao } = req.body;
    if (!nome_usuario || !senha || !permissao) {
        return res.status(400).json({ error: 'Nome de usuário, senha e permissão são obrigatórios.' });
    }
    if (senha.length < 6) {
        return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(senha, salt);
    try {
        const stmt = db.prepare('INSERT INTO Usuarios (nome_usuario, senha, permissao) VALUES (?, ?, ?)');
        const info = stmt.run(nome_usuario, hash, permissao);
        res.status(201).json({ id_usuario: info.lastInsertRowid, message: 'Usuário criado com sucesso!' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Este nome de usuário já está em uso.' });
        }
        res.status(500).json({ error: 'Erro interno do servidor ao criar usuário.' });
    }
};

const deleteUser = (req, res) => {
    const { id } = req.params;
    if (parseInt(id, 10) === req.session.userId) {
        return res.status(403).json({ error: 'Você não pode excluir sua própria conta.' });
    }
    try {
        const stmt = db.prepare('DELETE FROM Usuarios WHERE id_usuario = ?');
        const info = stmt.run(id);
        if (info.changes === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor ao excluir usuário.' });
    }
};


// NOVA FUNÇÃO para alterar a senha
const updateUserPassword = (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'A nova senha é obrigatória e deve ter no mínimo 6 caracteres.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    try {
        const stmt = db.prepare('UPDATE Usuarios SET senha = ? WHERE id_usuario = ?');
        const info = stmt.run(hash, id);

        if (info.changes === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ message: 'Senha do usuário atualizada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar a senha.' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    deleteUser,
    updateUserPassword // Exportar a nova função
};