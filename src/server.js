/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Punto de Entrada del Servidor Node.js
 */

require('dotenv').config();
const http = require('http');
const app = require('./app');
const { pool } = require('./config/db');

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = http.createServer(app);

async function startServer() {
  try {
    console.log('================================================================');
    console.log('🇨🇴  FOOTBALL MASTER PRO COLOMBIA - SISTEMA OPERATIVO NACIONAL  🇨🇴');
    console.log('================================================================');

    // 1. Probar conexión activa con PostgreSQL
    const dbTest = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log(`[DB SUCCESS] Conectado exitosamente a PostgreSQL: ${dbTest.rows[0].db_name}`);
    console.log(`[DB TIME] Hora del servidor de base de datos: ${dbTest.rows[0].current_time}`);

    // 2. Iniciar servidor HTTP
    server.listen(PORT, () => {
      console.log(`[SERVER] API REST escuchando en el puerto ${PORT}`);
      console.log(`[SERVER] Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[SERVER] Endpoint de Salud: http://localhost:${PORT}/api/health`);
      console.log(`[SERVER] Autenticación: http://localhost:${PORT}/api/auth/login`);
      console.log('================================================================');
    });

  } catch (error) {
    console.error('[FATAL SERVER ERROR] Error al iniciar Football Master Pro:', error.message);
    process.exit(1);
  }
}

// Cierre elegante (Graceful Shutdown)
process.on('SIGTERM', () => {
  console.log('[SIGTERM] Señal de terminación recibida. Cerrando conexiones...');
  server.close(async () => {
    await pool.end();
    console.log('[CLEANUP] Pool de PostgreSQL y servidor cerrados.');
    process.exit(0);
  });
});

startServer();
