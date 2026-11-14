/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Controlador de Torneos y Competiciones
 * Demostración de Aislamiento por organizer_id, Filtros Territoriales y Auditoría
 */

const db = require('../config/db');
const { logAudit } = require('../utils/audit.logger');

/**
 * Consulta Pública de Torneos (Acceso libre para Aficionados y Visitantes)
 * Filtros por departamento, municipio, modalidad y estado
 */
async function getPublicTournaments(req, res, next) {
  try {
    const { departmentId, municipalityId, modality, status = 'open_registration' } = req.query;

    let queryText = `
      SELECT t.id, t.name, t.edition, t.sport_modality, t.competition_format,
             t.max_teams, t.current_teams_count, t.registration_fee, t.prize_pool,
             t.registration_start, t.registration_end, t.tournament_start, t.tournament_end,
             t.status, d.name as department_name, m.name as municipality_name,
             v.name as venue_name, u.full_name as organizer_name
      FROM tournaments t
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN municipalities m ON t.municipality_id = m.id
      LEFT JOIN venues v ON t.venue_id = v.id
      LEFT JOIN users u ON t.organizer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (departmentId) {
      params.push(departmentId);
      queryText += ` AND t.department_id = $${params.length}`;
    }

    if (municipalityId) {
      params.push(municipalityId);
      queryText += ` AND t.municipality_id = $${params.length}`;
    }

    if (modality) {
      params.push(modality);
      queryText += ` AND t.sport_modality = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      queryText += ` AND t.status = $${params.length}`;
    }

    queryText += ` ORDER BY t.tournament_start ASC LIMIT 50`;

    const result = await db.query(queryText, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      tournaments: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Consulta de Torneos Propios ("Mis Torneos") con Aislamiento Estricto
 */
async function getMyTournaments(req, res, next) {
  try {
    let queryText = `
      SELECT t.*, d.name as department_name, m.name as municipality_name, v.name as venue_name
      FROM tournaments t
      LEFT JOIN departments d ON t.department_id = d.id
      LEFT JOIN municipalities m ON t.municipality_id = m.id
      LEFT JOIN venues v ON t.venue_id = v.id
    `;
    const params = [];

    // 1. Superadministrador: Ve todos los torneos nacionales
    if (req.user.roleId === 'superadmin') {
      queryText += ` ORDER BY t.created_at DESC`;
    }
    // 2. Administrador Regional: Ve todos los de su departamento
    else if (req.user.roleId === 'regional_admin') {
      params.push(req.user.departmentId);
      queryText += ` WHERE t.department_id = $1 ORDER BY t.created_at DESC`;
    }
    // 3. Organizador: Exclusivamente sus propios torneos
    else if (req.user.roleId === 'organizer') {
      params.push(req.user.id);
      queryText += ` WHERE t.organizer_id = $1 ORDER BY t.created_at DESC`;
    } else {
      return res.status(403).json({ success: false, error: 'Rol no autorizado para gestionar torneos.' });
    }

    const result = await db.query(queryText, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      tournaments: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creación de un Nuevo Torneo
 */
async function createTournament(req, res, next) {
  try {
    const {
      name,
      edition,
      sportModality = 'futbol_11',
      competitionFormat = 'liga_todos_vs_todos',
      departmentId,
      municipalityId,
      venueId,
      maxTeams = 8,
      tournamentStart,
      tournamentEnd,
      registrationStart,
      registrationEnd,
      registrationFee = 0,
      prizePool = 0,
      allowedDays,
      availableTimeSlots
    } = req.body;

    if (!name || !departmentId || !municipalityId || !tournamentStart) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, departamento, municipio y fecha de inicio son campos obligatorios.'
      });
    }

    // Aislamiento: El organizer_id SIEMPRE se toma del usuario autenticado en la sesión
    const organizerId = req.user.id;
    const organizationId = req.user.organizationId || null;

    const insertSql = `
      INSERT INTO tournaments (
        organizer_id, organization_id, department_id, municipality_id, venue_id,
        name, edition, sport_modality, competition_format, max_teams,
        tournament_start, tournament_end, registration_start, registration_end,
        registration_fee, prize_pool, allowed_days, available_time_slots, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'open_registration', NOW(), NOW()
      ) RETURNING *
    `;

    const insertParams = [
      organizerId,
      organizationId,
      departmentId,
      municipalityId,
      venueId || null,
      name.trim(),
      edition || null,
      sportModality,
      competitionFormat,
      maxTeams,
      tournamentStart,
      tournamentEnd || null,
      registrationStart || null,
      registrationEnd || null,
      registrationFee,
      prizePool,
      allowedDays ? JSON.stringify(allowedDays) : '["sabado", "domingo"]',
      availableTimeSlots ? JSON.stringify(availableTimeSlots) : '["08:00", "10:00", "14:00", "16:00"]'
    ];

    const result = await db.query(insertSql, insertParams);
    const tournament = result.rows[0];

    // Auditoría inmutable
    await logAudit({
      userId: req.user.id,
      action: 'TOURNAMENT_CREATED',
      entityType: 'tournaments',
      entityId: tournament.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Torneo '${tournament.name}' creado por ${req.user.email}`
    });

    return res.status(201).json({
      success: true,
      message: 'Torneo creado exitosamente en Football Master Pro.',
      tournament
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPublicTournaments,
  getMyTournaments,
  createTournament
};
