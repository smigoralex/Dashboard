// src/routes/apiRoutes.js

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController.js');
const isAuthenticated = require('../middleware/isAuthenticated.js');

// --- ROTAS PÚBLICAS (NÃO EXIGEM LOGIN) ---
router.get('/dados-dashboard', apiController.getDashboardData);
router.get('/aluno/:inep', apiController.getAlunoByInep);
router.get('/filtros/escolas', apiController.getFiltrosEscolas);
router.get('/filtros/gerais', apiController.getFiltrosGerais);
router.get('/filtros/anos', apiController.getFiltrosAnos);
router.get('/filtros/avaliacoes-por-ano', apiController.getFiltrosAvaliacoesPorAno);
router.get('/niveis-por-avaliacao', apiController.getNiveisPorAvaliacao);
router.get('/turmas', apiController.getTurmas);
router.get('/filtros/demograficos', apiController.getFiltrosDemograficos);

// --- ROTAS PROTEGIDAS (EXIGEM LOGIN) ---
router.get('/alunos', isAuthenticated, apiController.getAlunos);
router.post('/alunos', isAuthenticated, apiController.createAluno);
router.put('/alunos/:id', isAuthenticated, apiController.updateAluno);
router.delete('/alunos/:id', isAuthenticated, apiController.deleteAluno);

router.get('/avaliacoes', isAuthenticated, apiController.getAvaliacoes);
router.post('/avaliacoes', isAuthenticated, apiController.createAvaliacao);
router.delete('/avaliacoes/:id', isAuthenticated, apiController.deleteAvaliacao);

// === NOVAS ROTAS PARA EDIÇÃO DE AVALIAÇÕES ===
router.get('/avaliacoes/:id', isAuthenticated, apiController.getAvaliacaoById);
router.put('/avaliacoes/:id', isAuthenticated, apiController.updateAvaliacao);

router.get('/escalas', isAuthenticated, apiController.getEscalas);
router.get('/escalas/:id', isAuthenticated, apiController.getEscalaById);

router.post('/resultados', isAuthenticated, apiController.createResultado);

module.exports = router;