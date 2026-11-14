/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Middleware de Autenticación de Usuarios por JWT
 */

const { verifyToken } = require('../utils/token.util');
const db = require('../config/db');

async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Token de sesión requerido o formato Bearer inválido.'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: 'Sesión expirada o token no válido. Por favor inicia sesión nuevamente.'
    });
  }

  try {
    // Validar estado del usuario en PostgreSQL
    const userQuery = await db.query(
      `SELECT u.id, u.role_id, r.name as role_name, r.hierarchy_level, 
              u.organization_id, u.department_id, u.municipality_id, 
              u.full_name, u.email, u.status
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'El usuario asociado a esta sesión ya no existe.'
      });
    }

    const user = userQuery.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: `Tu cuenta se encuentra en estado '${user.status}'. Contacta al administrador.`
      });
    }

    // Inyectar datos del usuario autenticado en la petición
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleName: user.role_name,
      hierarchyLevel: user.hierarchy_level,
      organizationId: user.organization_id,
      departmentId: user.department_id,
      municipalityId: user.municipality_id
    };

    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno de validación de credenciales.'
    });
  }
}

/**
 * Middleware para rutas públicas que pueden leer usuario opcional si viene token
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
}

module.exports = {
  authenticateJWT,
  optionalAuth
};
