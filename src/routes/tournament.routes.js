/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Rutas de Gestión de Torneos (/api/tournaments)
 */

const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const { authenticateJWT, optionalAuth } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');
const { verifyTournamentOwnership } = require('../middlewares/ownership.middleware');

// 1. Consulta Pública de Torneos (Portal de Aficionados sin sesión requerida)
router.get('/', optionalAuth, tournamentController.getPublicTournaments);

// 2. Mis Torneos (Exclusivo para Organizadores y Administradores autenticados)
router.get(
  '/my-tournaments',
  authenticateJWT,
  authorizeRoles('organizer', 'regional_admin', 'superadmin'),
  tournamentController.getMyTournaments
);

// 3. Crear Torneo (Exclusivo para Organizadores y Superadmin)
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('organizer', 'superadmin'),
  tournamentController.createTournament
);

module.exports = router;
