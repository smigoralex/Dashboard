// src/routes/pageRoutes.js

const express = require('express');
const path = require('path');
const isAuthenticated = require('../middleware/isAuthenticated.js');

const router = express.Router();

const publicPath = path.join(__dirname, '..', '..', 'public');

// Rotas protegidas que exigem login
router.get('/painel_gestao.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(publicPath, 'painel_gestao.html'));
});
router.get('/gestao_alunos.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(publicPath, 'gestao_alunos.html'));
});
router.get('/gestao_avaliacoes.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(publicPath, 'gestao_avaliacoes.html'));
});
router.get('/lancar_resultados.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(publicPath, 'lancar_resultados.html'));
});
router.get('/gestao_usuarios.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(publicPath, 'gestao_usuarios.html'));
});

// CORREÇÃO: Rota agora é pública, o 'isAuthenticated' foi removido
router.get('/student_detail.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'student_detail.html'));
});

module.exports = router;