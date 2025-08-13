// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');

// As rotas aqui são relativas ao prefixo que usaremos no server.js
// Ex: /login -> /api/login
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/check-auth', authController.checkAuth);

module.exports = router;