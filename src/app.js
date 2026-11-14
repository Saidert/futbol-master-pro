/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Configuración Principal del Servidor Express
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const tournamentRoutes = require('./routes/tournament.routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// 1. Cabeceras de Seguridad Avanzadas
app.use(helmet({
  contentSecurityPolicy: false // Habilitado para servir frontend SPA si se requiere
}));

// 2. Configuración de CORS
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política CORS'));
    }
  },
  credentials: true
}));

// 3. Limitador de Peticiones (Anti-DDoS y Fuerza Bruta)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Límite de 300 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta dirección IP. Intenta de nuevo más tarde.'
  }
});
app.use('/api/', apiLimiter);

// Limitador estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Máximo 20 intentos de login/registro cada 15 min
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación. Por favor espera 15 minutos.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 4. Procesadores de Cuerpo (Body Parsers)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Logger HTTP en Desarrollo
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 6. Servir Frontend Estático (Opcional)
app.use(express.static(path.join(__dirname, '../')));

// 7. Ruta de Verificación de Salud del Sistema (Healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    service: 'Football Master Pro Colombia API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// 8. Registro de Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);

// 9. Manejo de Errores y Rutas No Encontradas
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
