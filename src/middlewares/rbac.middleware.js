/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Middleware de Control de Acceso Basado en Roles (RBAC)
 */

/**
 * Permite el acceso únicamente a los roles especificados en la lista blanca
 * @param  {...string} allowedRoles - Nombres de roles permitidos (ej: 'superadmin', 'organizer')
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado: Se requiere inicio de sesión previo.'
      });
    }

    const userRole = req.user.roleId;

    // El Superadministrador tiene acceso nacional irrestricto
    if (userRole === 'superadmin') {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado: El rol '${req.user.roleName || userRole}' no tiene privilegios para realizar esta acción. Roles requeridos: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
}

/**
 * Valida nivel jerárquico numérico (1 = Superadmin, 2 = Regional, 3 = Organizador, etc.)
 * @param {number} maxHierarchyLevel - Nivel jerárquico máximo permitido (menor o igual a)
 */
function authorizeHierarchy(maxHierarchyLevel) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'No autenticado' });
    }

    if (req.user.hierarchyLevel <= maxHierarchyLevel) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Privilegios insuficientes: Se requiere nivel jerárquico ${maxHierarchyLevel} o superior.`
    });
  };
}

module.exports = {
  authorizeRoles,
  authorizeHierarchy
};
