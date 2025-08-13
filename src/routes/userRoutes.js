// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const isSuperAdmin = require('../middleware/isSuperAdmin.js');

router.use(isSuperAdmin);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);

// NOVA ROTA para alterar a senha
router.put('/:id/password', userController.updateUserPassword);

module.exports = router;