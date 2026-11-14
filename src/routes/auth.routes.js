/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Rutas de Autenticación y Perfil (/api/auth)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middlewares/auth.middleware');

// Rutas Públicas de Acceso y Registro
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas Protegidas que requieren Token JWT
router.get('/me', authenticateJWT, authController.getProfile);

module.exports = router;
