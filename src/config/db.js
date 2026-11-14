/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Módulo de Conexión y Pool de PostgreSQL
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Soporte para DATABASE_URL (Render, Neon, Supabase) o variables discretas
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' || isProduction ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'football_master_pro',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool({
  ...connectionConfig,
  max: 20, // Máximo de clientes en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

pool.on('connect', () => {
  console.log('[DB] Conexión establecida con el clúster PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB ERROR] Error inesperado en el pool inactivo de PostgreSQL:', err.message);
});

/**
 * Ejecuta una consulta SQL parametrizada
 * @param {string} text - Consulta SQL con placeholders ($1, $2, etc.)
 * @param {Array} params - Parámetros de la consulta
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB QUERY] Ejecutada en ${duration}ms | Filas: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error(`[DB QUERY ERROR] Error en consulta: ${text}`);
    console.error(`[DB ERROR DETAIL]`, error.message);
    throw error;
  }
}

/**
 * Obtiene un cliente dedicado para transacciones ACID
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Inicializador automático del esquema y semillas si es necesario
 */
async function initSchema() {
  const schemaPath = path.join(__dirname, '../../database/schema_postgresql.sql');
  const seedsPath = path.join(__dirname, '../../database/seeds_colombia.sql');

  if (fs.existsSync(schemaPath)) {
    console.log('[DB] Ejecutando migración de esquema PostgreSQL...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('[DB] Esquema DDL ejecutado exitosamente.');
  }

  if (fs.existsSync(seedsPath)) {
    console.log('[DB] Sembrando datos maestros territoriales de Colombia y roles...');
    const seedsSql = fs.readFileSync(seedsPath, 'utf8');
    await pool.query(seedsSql);
    console.log('[DB] Semillas insertadas exitosamente.');
  }
}

module.exports = {
  pool,
  query,
  getClient,
  initSchema
};
