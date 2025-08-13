// src/controllers/authController.js

const bcrypt = require('bcryptjs');
const db = require('../config/database.js');

const login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }
    try {
        const stmt = db.prepare('SELECT * FROM Usuarios WHERE nome_usuario = ?');
        const user = stmt.get(username);
        if (user && bcrypt.compareSync(password, user.senha)) {
            req.session.userId = user.id_usuario;
            req.session.username = user.nome_usuario;
            req.session.permission = user.permissao;

            // Força o salvamento da sessão ANTES de responder ao cliente
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar a sessão:', err);
                    return res.status(500).json({ error: 'Falha ao salvar a sessão.' });
                }
                res.status(200).json({ message: 'Login bem-sucedido!' });
            });
            
        } else {
            res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Não foi possível fazer logout.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout bem-sucedido.' });
    });
};

const checkAuth = (req, res) => {
    if (req.session.userId) {
        res.status(200).json({
            loggedIn: true,
            username: req.session.username,
            permission: req.session.permission
        });
    } else {
        res.status(200).json({ loggedIn: false });
    }
};

module.exports = {
    login,
    logout,
    checkAuth,
};