/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Middleware de Verificación de Propiedad y Aislamiento de Recursos
 * Garantiza que ningún organizador modifique torneos ajenos y respeta la jerarquía regional.
 */

const db = require('../config/db');

/**
 * Verifica si el usuario autenticado es propietario del torneo o administrador de la región
 */
async function verifyTournamentOwnership(req, res, next) {
  const tournamentId = req.params.tournamentId || req.params.id || req.body.tournamentId || req.body.tournament_id;

  if (!tournamentId) {
    return res.status(400).json({
      success: false,
      error: 'ID del torneo no proporcionado en la solicitud.'
    });
  }

  try {
    const result = await db.query(
      `SELECT id, organizer_id, organization_id, department_id, name, status 
       FROM tournaments 
       WHERE id = $1`,
      [tournamentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'El torneo solicitado no existe en el sistema.'
      });
    }

    const tournament = result.rows[0];

    // 1. Superadministrador: Acceso nacional irrestricto
    if (req.user.roleId === 'superadmin') {
      req.tournament = tournament;
      return next();
    }

    // 2. Administrador Regional: Acceso a torneos de su departamento
    if (req.user.roleId === 'regional_admin') {
      if (req.user.departmentId && req.user.departmentId === tournament.department_id) {
        req.tournament = tournament;
        return next();
      } else {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado: Este torneo pertenece a un departamento fuera de tu jurisdicción regional.'
        });
      }
    }

    // 3. Organizador: Solo puede modificar sus propios torneos (aislado por organizer_id)
    if (req.user.roleId === 'organizer') {
      if (tournament.organizer_id === req.user.id) {
        req.tournament = tournament;
        return next();
      } else {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado: No tienes permisos para gestionar este torneo ya que pertenece a otro organizador.'
        });
      }
    }

    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Rol no facultado para administrar este torneo.'
    });
  } catch (err) {
    console.error('[OWNERSHIP ERROR - TOURNAMENT]', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno verificando la propiedad del recurso.'
    });
  }
}

/**
 * Verifica si el usuario es Director Técnico del Club
 */
async function verifyClubOwnership(req, res, next) {
  const clubId = req.params.clubId || req.body.clubId || req.body.club_id;

  if (!clubId) {
    return res.status(400).json({ success: false, error: 'ID de club no proporcionado.' });
  }

  try {
    const result = await db.query(
      `SELECT id, dt_id, department_id, name FROM clubs WHERE id = $1`,
      [clubId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Club deportivo no encontrado.' });
    }

    const club = result.rows[0];

    if (req.user.roleId === 'superadmin') {
      req.club = club;
      return next();
    }

    if (req.user.roleId === 'director_tecnico' && club.dt_id === req.user.id) {
      req.club = club;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Acceso denegado: Solo el Director Técnico titular del club puede realizar esta operación.'
    });
  } catch (err) {
    console.error('[OWNERSHIP ERROR - CLUB]', err);
    return res.status(500).json({ success: false, error: 'Error interno verificando propiedad del club.' });
  }
}

module.exports = {
  verifyTournamentOwnership,
  verifyClubOwnership
};
