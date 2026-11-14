/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Manejador Centralizado de Excepciones y Errores
 */

function errorHandler(err, req, res, next) {
  console.error('[UNHANDLED EXCEPTION]', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Errores de sintaxis JSON mal formado
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Formato de cuerpo JSON inválido en la petición.'
    });
  }

  // Error de clave foránea o restricción única de PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Conflicto: Ya existe un registro con estos datos únicos (llave duplicada).',
      detail: err.detail
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Error de integridad referencial: La entidad relacionada no existe.',
      detail: err.detail
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor en Football Master Pro.';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Ruta de API no encontrada: [${req.method}] ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
