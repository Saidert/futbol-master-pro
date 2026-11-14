/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Módulo de Auditoría Inmutable para Cumplimiento y Trazabilidad
 */

const db = require('../config/db');

/**
 * Registra una acción inmutable en la tabla audit_logs
 * @param {Object} entry
 * @param {string} entry.userId - ID del usuario responsable
 * @param {string} entry.action - Nombre de la acción (ej: 'LOGIN_SUCCESS', 'UPDATE_MATCH_SCORE')
 * @param {string} entry.entityType - Entidad afectada (ej: 'tournaments', 'matches', 'users')
 * @param {string} entry.entityId - ID del registro afectado
 * @param {string} entry.ipAddress - Dirección IP
 * @param {string} entry.userAgent - Cabecera User-Agent
 * @param {Object} [entry.previousState] - Estado previo (opcional)
 * @param {Object} [entry.newState] - Estado nuevo (opcional)
 * @param {string} [entry.details] - Descripción textual del evento
 */
async function logAudit({
  userId = null,
  action,
  entityType,
  entityId = null,
  ipAddress = null,
  userAgent = null,
  previousState = null,
  newState = null,
  details = null
}) {
  try {
    const sql = `
      INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, ip_address, user_agent, previous_state, new_state, details, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    `;
    const params = [
      userId,
      action,
      entityType,
      entityId ? String(entityId) : null,
      ipAddress,
      userAgent,
      previousState ? JSON.stringify(previousState) : null,
      newState ? JSON.stringify(newState) : null,
      details
    ];

    await db.query(sql, params);
  } catch (err) {
    console.error('[AUDIT ERROR] No se pudo registrar la traza de auditoría:', err.message);
  }
}

module.exports = {
  logAudit
};
