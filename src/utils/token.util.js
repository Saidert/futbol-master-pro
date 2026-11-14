/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Utilidad para Generación y Verificación de JSON Web Tokens (JWT)
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_fallback_key_football_master_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Genera un token JWT para un usuario autenticado
 * @param {Object} user - Objeto usuario con id, email, role_id, organization_id, etc.
 */
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    roleId: user.role_id,
    roleTitle: user.role_name || user.role_id,
    organizationId: user.organization_id || null,
    departmentId: user.department_id || null,
    municipalityId: user.municipality_id || null,
    fullName: user.full_name
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256'
  });
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token 
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken
};
