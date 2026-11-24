// Garantizar sincronización inicial de rol visitante en body
if (typeof document !== 'undefined' && document.body) {
  if (!window.userSession || !window.userSession.loggedIn) {
    document.body.classList.add('role-guest');
  }
}
// =============================================================================
// FASE 1: SISTEMA DE AUTENTICACIÓN MULTI-ROL, AUDITORÍA Y NOTIFICACIONES (COLOMBIA)
// Simulación Relacional Persistente en localStorage:
// fmp_users, fmp_session, fmp_tournaments, fmp_venues_co, fmp_registrations, fmp_notifications, fmp_audit_log
// =============================================================================

function normalizeRole(role) {
  if (!role) return 'spectator';
  const r = String(role).toLowerCase().trim();
  if (r === 'admin' || r === 'administrador') return 'admin';
  if (r === 'organizer' || r === 'organizador' || r.includes('organizad')) return 'organizer';
  if (r === 'head_coach' || r === 'coach' || r === 'director_tecnico' || r === 'delegado' || r.includes('director t') || r === 'dt') return 'head_coach';
  if (r === 'team_coach' || r === 'tecnico_equipo' || r === 'técnico de equipo' || r.includes('equipo') || r === 'asistente') return 'team_coach';
  if (r === 'tecnico' || r === 'técnico') return 'head_coach';
  if (r === 'spectator' || r === 'fan' || r === 'aficionado' || r === 'visitante' || r === 'guest') return 'spectator';
  return r;
}

function isAdmin(role) { return normalizeRole(role) === 'admin'; }
function isOrganizer(role) { return normalizeRole(role) === 'organizer'; }
function isHeadCoach(role) { return normalizeRole(role) === 'head_coach'; }
function isTeamCoach(role) { return normalizeRole(role) === 'team_coach'; }
function isCoachRole(role) { const r = normalizeRole(role); return r === 'head_coach' || r === 'team_coach'; }
function isSpectator(role) { return normalizeRole(role) === 'spectator'; }
function isOrganizerOrAdmin(role) { const r = normalizeRole(role); return r === 'admin' || r === 'organizer'; }

window.normalizeRole = normalizeRole;
window.isAdmin = isAdmin;
window.isOrganizer = isOrganizer;
window.isHeadCoach = isHeadCoach;
window.isTeamCoach = isTeamCoach;
window.isCoachRole = isCoachRole;
window.isSpectator = isSpectator;
window.isOrganizerOrAdmin = isOrganizerOrAdmin;

const FMP_KEYS = {
  USERS: 'fmp_users',
  SESSION: 'fmp_session',
  TOURNAMENTS: 'fmp_tournaments',
  VENUES: 'fmp_venues_co',
  REGISTRATIONS: 'fmp_registrations',
  NOTIFICATIONS: 'fmp_notifications',
  AUDIT_LOG: 'fmp_audit_log',
  ROSTER: 'fmp_club_roster',
  LEGACY_SESSION: 'futbolmaster_user_session'
};

const DEMO_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Saider Boadas',
    email: 'boadasaidert466@gmail.com',
    phone: '3104458899',
    password: '123Sai',
    role: 'admin',
    roleTitle: 'Administrador General',
    roleIcon: '👑',
    roleBadgeClass: 'role-admin',
    clubName: 'Fútbol Master Pro',
    habeasDataConsent: true,
    createdAt: '2026-01-10T10:00:00.000Z'
  },
  {
    id: 'usr-org-carlos',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@futbolmaster.co',
    phone: '3109876543',
    password: 'org123',
    role: 'organizer',
    roleTitle: 'Organizador de Torneo',
    roleIcon: '🏆',
    roleBadgeClass: 'role-organizer',
    clubName: 'Liga Premier Bogotá',
    habeasDataConsent: true,
    createdAt: '2026-01-20T14:30:00.000Z'
  },
  {
    id: 'usr-org-laura',
    name: 'Laura Ríos',
    email: 'laura.rios@futbolmaster.co',
    phone: '3112345678',
    password: 'org123',
    role: 'organizer',
    roleTitle: 'Organizador Nuevo (0 torneos)',
    roleIcon: '🌱',
    roleBadgeClass: 'role-organizer',
    clubName: 'Torneos Juveniles Colombia',
    habeasDataConsent: true,
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'usr-coach-yepes',
    name: 'Mario Alberto Yepes',
    email: 'tecnico@futbolmaster.co',
    phone: '3154567890',
    password: 'coach123',
    role: 'head_coach',
    roleTitle: 'Director Técnico / Delegado',
    roleIcon: '📋',
    roleBadgeClass: 'role-coach',
    clubName: 'Atlético Bogotá FC',
    category: 'Libre / Mayores',
    city: 'Bogotá D.C.',
    habeasDataConsent: true,
    createdAt: '2026-02-05T09:15:00.000Z'
  },
  {
    id: 'usr-coach-julian',
    name: 'Julián Barreto',
    email: 'julian.barreto@futbolmaster.co',
    phone: '3187654321',
    password: 'coach123',
    role: 'team_coach',
    roleTitle: 'Técnico del Equipo',
    roleIcon: '⚽',
    roleBadgeClass: 'role-coach',
    clubName: 'Atlético Bogotá FC',
    category: 'Libre / Mayores',
    city: 'Bogotá D.C.',
    habeasDataConsent: true,
    createdAt: '2026-02-10T11:00:00.000Z'
  },
  {
    id: 'usr-fan-1',
    name: 'Juan Camilo Pérez',
    email: 'aficionado@futbolmaster.co',
    phone: '3203456789',
    password: 'fan123',
    role: 'spectator',
    roleTitle: 'Aficionado / Espectador',
    roleIcon: '👀',
    roleBadgeClass: 'role-fan',
    clubName: '',
    habeasDataConsent: true,
    createdAt: '2026-02-18T16:45:00.000Z'
  }
];

const SEED_VENUES = [
  // Atlántico (Barranquilla)
  {
    id: 'vn-baq-1',
    nombre: 'Cancha Sintética La 84',
    departamento: 'Atlántico',
    ciudad: 'Barranquilla',
    direccion: 'Calle 84 # 47-32, Riomar',
    telefonoContacto: '+57 300 481 9283',
    superficie: 'Sintética',
    modalidad: 'Fútbol 7/8',
    horariosDisponibles: ['16:00', '18:00', '19:00', '20:00', '21:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 250,
    iluminacion: 'LED Profesional 500 Lux'
  },
  {
    id: 'vn-baq-2',
    nombre: 'Complejo Deportivo Pibe Valderrama',
    departamento: 'Atlántico',
    ciudad: 'Barranquilla',
    direccion: 'Carrera 30 con Murillo, Sur',
    telefonoContacto: '+57 312 876 5432',
    superficie: 'Grama Natural',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '16:00', '18:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 800,
    iluminacion: 'LED Profesional 500 Lux'
  },
  {
    id: 'vn-baq-3',
    nombre: 'Cancha Parque Distrital',
    departamento: 'Atlántico',
    ciudad: 'Barranquilla',
    direccion: 'Calle 64 # 24B-10, Los Andes',
    telefonoContacto: '+57 301 928 3746',
    superficie: 'Sintética',
    modalidad: 'Fútbol 7/8',
    horariosDisponibles: ['18:00', '19:00', '20:00', '21:00'],
    estadoConfirmacion: 'Pendiente de confirmación',
    capacidad: 200,
    iluminacion: 'Halógena Estándar'
  },

  // Bogotá D.C.
  {
    id: 'vn-bog-1',
    nombre: 'Complejo Deportivo Salitre',
    departamento: 'Bogotá D.C.',
    ciudad: 'Bogotá D.C.',
    direccion: 'Av. 68 # 63-00, Parque Metropolitano Simón Bolívar',
    telefonoContacto: '+57 310 998 8776',
    superficie: 'Sintética',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 600,
    iluminacion: 'LED Profesional 500 Lux'
  },
  {
    id: 'vn-bog-2',
    nombre: 'Canchas Sintéticas La 127',
    departamento: 'Bogotá D.C.',
    ciudad: 'Bogotá D.C.',
    direccion: 'Calle 127 # 19A-44, Usaquén',
    telefonoContacto: '+57 315 223 3445',
    superficie: 'Sintética',
    modalidad: 'Fútbol 7/8',
    horariosDisponibles: ['18:00', '19:00', '20:00', '21:00', '22:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 300,
    iluminacion: 'LED Profesional 500 Lux'
  },
  {
    id: 'vn-bog-3',
    nombre: 'Centro Deportivo Campincito',
    departamento: 'Bogotá D.C.',
    ciudad: 'Bogotá D.C.',
    direccion: 'Carrera 30 # 57-60, Teusaquillo',
    telefonoContacto: '+57 316 445 5667',
    superficie: 'Grama Natural',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 1200,
    iluminacion: 'LED Profesional 500 Lux'
  },

  // Antioquia (Medellín / Envigado)
  {
    id: 'vn-med-1',
    nombre: 'Unidad Deportiva Atanasio Girardot (Cancha Marte #1)',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: 'Calle 48 # 73-10, Laureles',
    telefonoContacto: '+57 304 556 6778',
    superficie: 'Sintética',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '16:00', '18:00', '20:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 1500,
    iluminacion: 'LED Profesional 500 Lux'
  },
  {
    id: 'vn-med-2',
    nombre: 'Sintética Belén',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
    direccion: 'Carrera 76 # 30A-20, Belén Rincón',
    telefonoContacto: '+57 317 667 7889',
    superficie: 'Sintética',
    modalidad: 'Fútbol 7/8',
    horariosDisponibles: ['18:00', '19:00', '20:00', '21:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 350,
    iluminacion: 'Halógena Estándar'
  },
  {
    id: 'vn-med-3',
    nombre: 'Complejo Envigado',
    departamento: 'Antioquia',
    ciudad: 'Envigado',
    direccion: 'Carrera 48 # 32 Sur-25, Las Vegas',
    telefonoContacto: '+57 311 778 8990',
    superficie: 'Grama Natural',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '14:00', '16:00'],
    estadoConfirmacion: 'Pendiente de confirmación',
    capacidad: 500,
    iluminacion: 'LED Profesional 500 Lux'
  },

  // Valle del Cauca (Cali)
  {
    id: 'vn-cali-1',
    nombre: 'Canchas Panamericanas',
    departamento: 'Valle del Cauca',
    ciudad: 'Cali',
    direccion: 'Calle 9 con Carrera 37, San Fernando',
    telefonoContacto: '+57 318 889 9001',
    superficie: 'Sintética',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '16:00', '18:00', '20:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 800,
    iluminacion: 'LED Profesional 500 Lux'
  },
  {
    id: 'vn-cali-2',
    nombre: 'Complejo Deportivo Pance',
    departamento: 'Valle del Cauca',
    ciudad: 'Cali',
    direccion: 'Vía Cañasgordas Km 12, Pance',
    telefonoContacto: '+57 320 990 0112',
    superficie: 'Grama Natural',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '14:00', '16:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 450,
    iluminacion: 'LED Profesional 500 Lux'
  },

  // Santander (Bucaramanga)
  {
    id: 'vn-bga-1',
    nombre: 'Cancha Marte Bucaramanga',
    departamento: 'Santander',
    ciudad: 'Bucaramanga',
    direccion: 'Carrera 30 # 14-50, San Alonso',
    telefonoContacto: '+57 313 112 2334',
    superficie: 'Sintética',
    modalidad: 'Fútbol 11',
    horariosDisponibles: ['08:00', '10:00', '16:00', '18:00', '20:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 700,
    iluminacion: 'LED Profesional 500 Lux'
  },
  {
    id: 'vn-bga-2',
    nombre: 'Sintética Cabecera',
    departamento: 'Santander',
    ciudad: 'Bucaramanga',
    direccion: 'Carrera 35 # 48-15, Cabecera del Llano',
    telefonoContacto: '+57 321 223 3445',
    superficie: 'Sintética',
    modalidad: 'Fútbol 7/8',
    horariosDisponibles: ['18:00', '19:00', '20:00', '21:00'],
    estadoConfirmacion: 'Verificada',
    capacidad: 200,
    iluminacion: 'LED Profesional 500 Lux'
  }
];

const SEED_CLUB_PLAYERS = [
  { id: 'ply-1', dorsal: 1, name: 'David Ospina Ramírez', docType: 'CC', docNumber: '1020485923', position: 'Arquero', eps: 'Sura EPS', status: 'Habilitado' },
  { id: 'ply-2', dorsal: 2, name: 'Cristian Zapata Valencia', docType: 'CC', docNumber: '1017382910', position: 'Defensa Central', eps: 'Sanitas', status: 'Habilitado' },
  { id: 'ply-3', dorsal: 3, name: 'Mario Alberto Yepes', docType: 'CC', docNumber: '79849201', position: 'Defensa Central', eps: 'Compensar', status: 'Habilitado' },
  { id: 'ply-4', dorsal: 4, name: 'Santiago Arias Naranjo', docType: 'CC', docNumber: '1032849182', position: 'Lateral Derecho', eps: 'Sura EPS', status: 'Habilitado' },
  { id: 'ply-5', dorsal: 6, name: 'Carlos Sánchez Moreno', docType: 'CC', docNumber: '1015948372', position: 'Volante de Marca', eps: 'Nueva EPS', status: 'Habilitado' },
  { id: 'ply-6', dorsal: 8, name: 'Abel Aguilar Tapias', docType: 'CC', docNumber: '80938472', position: 'Mediocampista', eps: 'Salud Total', status: 'Habilitado' },
  { id: 'ply-7', dorsal: 10, name: 'James David Rodríguez', docType: 'CC', docNumber: '1098765432', position: 'Volante Creativo', eps: 'Sanitas', status: 'Habilitado' },
  { id: 'ply-8', dorsal: 11, name: 'Juan Guillermo Cuadrado', docType: 'CC', docNumber: '1040857391', position: 'Extremo Derecho', eps: 'Compensar', status: 'Habilitado' },
  { id: 'ply-9', dorsal: 9, name: 'Radamel Falcao García', docType: 'CC', docNumber: '1020304050', position: 'Delantero Centro', eps: 'Sura EPS', status: 'Habilitado' },
  { id: 'ply-10', dorsal: 7, name: 'Pablo Armero Mina', docType: 'CC', docNumber: '1060938472', position: 'Lateral Izquierdo', eps: 'Salud Total', status: 'Habilitado' },
  { id: 'ply-11', dorsal: 19, name: 'Teófilo Antonio Gutiérrez', docType: 'CC', docNumber: '85948372', position: 'Segundo Delantero', eps: 'Nueva EPS', status: 'Habilitado' }
];

const SEED_REGISTRATIONS = [
  {
    id: 'reg-001',
    tournamentId: 'demo-tourney-1',
    tournamentName: 'Super Liga Pro 2026',
    clubName: 'Atlético Bogotá FC',
    dtName: 'Mario Alberto Yepes',
    dtPhone: '+57 315 456 7890',
    playersCount: 18,
    category: 'Libre / Mayores',
    status: 'Aprobado',
    notes: 'Documentación al día. Aval médico y ARL verificados.',
    submittedAt: '2026-10-25T11:20:00.000Z'
  },
  {
    id: 'reg-002',
    tournamentId: 'demo-tourney-1',
    tournamentName: 'Super Liga Pro 2026',
    clubName: 'Deportivo Medellín Sur',
    dtName: 'Hernán Darío Gómez',
    dtPhone: '+57 311 234 5678',
    playersCount: 16,
    category: 'Libre / Mayores',
    status: 'Pendiente',
    notes: 'En revisión por el comité organizador de la liga.',
    submittedAt: '2026-10-26T14:15:00.000Z'
  },
  {
    id: 'reg-003',
    tournamentId: 'demo-tourney-1',
    tournamentName: 'Super Liga Pro 2026',
    clubName: 'Cali Estudiantes FC',
    dtName: 'Reinaldo Rueda',
    dtPhone: '+57 318 876 5432',
    playersCount: 15,
    category: 'Libre / Mayores',
    status: 'Requiere Corrección',
    notes: 'Faltan certificados de afiliación EPS para 2 suplentes.',
    submittedAt: '2026-10-26T16:45:00.000Z'
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Nueva Solicitud de Club',
    message: 'Deportivo Medellín Sur solicitó cupo en la Super Liga Pro 2026.',
    type: 'info',
    read: false,
    linkRoute: 'admin',
    createdAt: '2026-10-27T08:30:00.000Z'
  },
  {
    id: 'notif-2',
    title: 'Planilla Oficial Aprobada',
    message: 'La nómina de Atlético Bogotá FC fue aprobada con aval deportivo.',
    type: 'success',
    read: false,
    linkRoute: 'club',
    createdAt: '2026-10-27T09:15:00.000Z'
  },
  {
    id: 'notif-3',
    title: 'Observación en Registro',
    message: 'Cali Estudiantes FC requiere anexar certificados EPS faltantes.',
    type: 'warning',
    read: false,
    linkRoute: 'club',
    createdAt: '2026-10-27T10:00:00.000Z'
  }
];

const SEED_AUDIT_LOGS = [
  {
    id: 'aud-001',
    timestamp: '2026-10-27 10:45:12',
    user: 'admin@futbolmaster.co',
    role: 'admin',
    ip: '186.84.92.14 (Bogotá, CO)',
    action: 'APROBACION_INSCRIPCION',
    details: 'Aprobó planilla del club Atlético Bogotá FC en Super Liga Pro 2026'
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-27 10:12:05',
    user: 'organizador@futbolmaster.co',
    role: 'organizer',
    ip: '190.158.41.88 (Medellín, CO)',
    action: 'CREACION_TORNEO',
    details: 'Configuró nuevo torneo Super Liga Pro 2026 (Fútbol 11, Liga 1 Vuelta)'
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-27 09:30:44',
    user: 'tecnico@futbolmaster.co',
    role: 'coach',
    ip: '181.61.12.33 (Cali, CO)',
    action: 'INSCRIPCION_JUGADOR',
    details: 'Inscribió jugador Radamel Falcao García (Dorsal 9, CC 1020****)'
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-27 09:05:18',
    user: 'admin@futbolmaster.co',
    role: 'admin',
    ip: '186.84.92.14 (Bogotá, CO)',
    action: 'REGISTRO_CANCHA',
    details: 'Registró cancha Complejo Deportivo El Salitre - Cancha 1'
  }
];

function getRandomColombianIp() {
  const prefixes = [
    { net: '186.84.', city: 'Bogotá D.C., CO' },
    { net: '190.158.', city: 'Medellín, CO' },
    { net: '181.61.', city: 'Cali, CO' },
    { net: '191.95.', city: 'Barranquilla, CO' },
    { net: '186.115.', city: 'Bucaramanga, CO' }
  ];
  const choice = prefixes[Math.floor(Math.random() * prefixes.length)];
  const b1 = Math.floor(Math.random() * 250) + 2;
  const b2 = Math.floor(Math.random() * 250) + 2;
  return `${choice.net}${b1}.${b2} (${choice.city})`;
}

// =============================================================================
// SANITIZADOR UNIVERSAL DE CODIFICACIÓN (UTF-8 / Curación de Mojibake)
// =============================================================================
function fixMojibake(str) {
  if (typeof str !== 'string') return str;
  let s = str;
  // Double-encoded UTF-8
  s = s.replace(/\u00C3\u0192\u00C2\u00A1/g, 'á')
       .replace(/\u00C3\u0192\u00C2\u00A9/g, 'é')
       .replace(/\u00C3\u0192\u00C2\u00AD/g, 'í')
       .replace(/\u00C3\u0192\u00C2\u00B3/g, 'ó')
       .replace(/\u00C3\u0192\u00C2\u00BA/g, 'ú')
       .replace(/\u00C3\u0192\u00C2\u00B1/g, 'ñ')
       .replace(/\u00C3\u0192\u00C2\u0081/g, 'Á')
       .replace(/\u00C3\u0192\u00C2\u0089/g, 'É')
       .replace(/\u00C3\u0192\u00C2\u008D/g, 'Í')
       .replace(/\u00C3\u0192\u00C2\u0093/g, 'Ó')
       .replace(/\u00C3\u0192\u00C2\u009A/g, 'Ú')
       .replace(/\u00C3\u0192\u00C2\u0091/g, 'Ñ');

  // Single-encoded Mojibake
  s = s.replace(/\u00C3\u00A1/g, 'á')
       .replace(/\u00C3\u00A9/g, 'é')
       .replace(/\u00C3\u00AD/g, 'í')
       .replace(/\u00C3\u00B3/g, 'ó')
       .replace(/\u00C3\u00BA/g, 'ú')
       .replace(/\u00C3\u00B1/g, 'ñ')
       .replace(/\u00C3\u0081/g, 'Á')
       .replace(/\u00C3\u0089/g, 'É')
       .replace(/\u00C3\u008D/g, 'Í')
       .replace(/\u00C3\u0093/g, 'Ó')
       .replace(/\u00C3\u009A/g, 'Ú')
       .replace(/\u00C3\u0091/g, 'Ñ');

  // Corrupted symbols y fragmentos de emojis
  s = s.replace(/\u00E2\u0153\u201C|\u00E2\u0153\u201D/g, '✓')
       .replace(/\u00E2\u20AC\u00A2/g, '•')
       .replace(/\u00E2\u20AC\u201C/g, '–')
       .replace(/\u00E2\u20AC\u201D/g, '—')
       .replace(/\u00E2\u20AC\u00A6/g, '…')
       .replace(/\u00C2\u00B0/g, '°')
       .replace(/\u00C2\u00BF/g, '¿')
       .replace(/\u00C2\u00A1/g, '¡')
       .replace(/\u00F0\u0178[\u0080-\u00BF]{2}/g, '')
       .replace(/\u00E2\u00B0|\u00E2\u00A0|\u00E2\u0080/g, '');

  return s.trim();
}

function fixMojibakeDeep(obj) {
  if (!obj) return obj;
  if (typeof obj === 'string') return fixMojibake(obj);
  if (Array.isArray(obj)) return obj.map(fixMojibakeDeep);
  if (typeof obj === 'object') {
    const res = {};
    for (const k in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        res[k] = fixMojibakeDeep(obj[k]);
      }
    }
    return res;
  }
  return obj;
}

// =============================================================================
// BÓVEDA DE ARCHIVOS INDEXEDDB (FMPFileVault) - EVITA QUOTAEXCEEDEDERROR EN LOCALSTORAGE
// =============================================================================

const FMPFileVault = {
  DB_NAME: 'fmp_documents_db',
  STORE_NAME: 'files',
  _db: null,
  _memVault: new Map(),

  async init() {
    if (this._db) return this._db;
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB no disponible. Usando bóveda de memoria de respaldo.');
      return null;
    }
    return new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(this.DB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => {
          this._db = e.target.result;
          resolve(this._db);
        };
        req.onerror = (e) => {
          console.warn('Error abriendo IndexedDB (modo fallback activo):', e);
          resolve(null);
        };
      } catch (err) {
        console.warn('Fallo al inicializar IndexedDB:', err);
        resolve(null);
      }
    });
  },

  async putFile(key, dataUrl, meta = {}) {
    if (!key || !dataUrl) return false;
    this._memVault.set(key, { id: key, dataUrl, meta, updatedAt: new Date().toISOString() });
    try {
      const db = await this.init();
      if (!db) return true;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.STORE_NAME, 'readwrite');
          const store = tx.objectStore(this.STORE_NAME);
          store.put({ id: key, dataUrl, meta, updatedAt: new Date().toISOString() });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    } catch (e) {
      return false;
    }
  },

  async getFile(key) {
    if (!key) return null;
    if (this._memVault.has(key)) {
      return this._memVault.get(key);
    }
    try {
      const db = await this.init();
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(this.STORE_NAME, 'readonly');
          const store = tx.objectStore(this.STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => {
            const res = req.result || null;
            if (res) this._memVault.set(key, res);
            resolve(res);
          };
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    } catch (e) {
      return null;
    }
  },

  async deleteFile(key) {
    if (!key) return;
    this._memVault.delete(key);
    try {
      const db = await this.init();
      if (!db) return;
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      tx.objectStore(this.STORE_NAME).delete(key);
    } catch (e) {}
  }
};
window.FMPFileVault = FMPFileVault;

/**
 * Comprime automáticamente imágenes de comprobantes usando un <canvas> en memoria.
 * Limita el ancho a 1000px y aplica compresión JPEG al 72% para ahorrar 85%+ de peso.
 */
async function compressImageFile(file, maxWidth = 1000, quality = 0.72) {
  if (!file) return null;
  if (!file.type || !file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
window.compressImageFile = compressImageFile;

// =============================================================================
// MOTOR CENTRAL DE BASE DE DATOS (FMPStore Engine) - FOOTBALL_MASTER_PRO_DB_V1
// =============================================================================

const FMP_MASTER_DB_KEY = 'FOOTBALL_MASTER_PRO_DB_V1';

const FMPStore = {
  KEY: FMP_MASTER_DB_KEY,
  db: {
    users: [],
    currentSession: null,
    tournaments: [],
    teams: [],
    registrations: [],
    venues: [],
    notifications: [],
    auditLog: []
  },
  _autoSaveTimeout: null,

  init() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const cleaned = fixMojibakeDeep(parsed);
          this.db = {
            users: Array.isArray(cleaned.users) ? cleaned.users : [],
            currentSession: cleaned.currentSession || null,
            tournaments: Array.isArray(cleaned.tournaments) ? cleaned.tournaments : [],
            teams: Array.isArray(cleaned.teams) ? cleaned.teams : [],
            registrations: Array.isArray(cleaned.registrations) ? cleaned.registrations : [],
            venues: Array.isArray(cleaned.venues) ? cleaned.venues : [],
            notifications: Array.isArray(cleaned.notifications) ? cleaned.notifications : [],
            auditLog: Array.isArray(cleaned.auditLog) ? cleaned.auditLog : []
          };
        }
      }

      // Si la base de datos maestra no tiene torneos o canchas, migrar datos legacy o sembrar
      if (this.db.tournaments.length === 0 || this.db.users.length === 0 || this.db.venues.length === 0 || !this.db.teams || this.db.teams.length === 0) {
        this.migrateLegacyDataOrSeed();
      }

      // La sesiÃ³n por defecto permanece cerrada (null) hasta que el usuario inicie sesiÃ³n formalmente
      if (!this.db.currentSession || !this.db.currentSession.userId || (this.db.currentSession.userId === 'usr-admin-1' && !localStorage.getItem('fmp_user_explicit_login'))) {
        this.db.currentSession = null;
      }

      // Si hay torneos pero no hay torneo activo en la sesiÃ³n, asignar el primero si hay sesiÃ³n activa
      if (this.db.tournaments.length > 0 && this.db.currentSession && !this.db.currentSession.activeTournamentId) {
        this.db.currentSession.activeTournamentId = this.db.tournaments[0].id;
      }

      this.save(false);
    } catch (e) {
      console.error('Error al inicializar FMPStore:', e);
      this.seedDatabaseIfEmpty();
    }
  },

  save(showVisualPulse = true) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.db));

      // Sincronizar espejos para compatibilidad total con vistas y componentes
      localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(this.db.tournaments));
      localStorage.setItem(FMP_KEYS.TOURNAMENTS, JSON.stringify(this.db.tournaments));
      localStorage.setItem('fmp_master_teams', JSON.stringify(this.db.teams || []));
      if (this.db.currentSession?.activeTournamentId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, this.db.currentSession.activeTournamentId);
      }
      localStorage.setItem(FMP_KEYS.USERS, JSON.stringify(this.db.users));
      localStorage.setItem(FMP_KEYS.SESSION, JSON.stringify(this.db.currentSession));
      localStorage.setItem(FMP_KEYS.LEGACY_SESSION, JSON.stringify(this.db.currentSession));
      localStorage.setItem(FMP_KEYS.VENUES, JSON.stringify(this.db.venues));
      localStorage.setItem(FMP_KEYS.REGISTRATIONS, JSON.stringify(this.db.registrations));
      localStorage.setItem(FMP_KEYS.NOTIFICATIONS, JSON.stringify(this.db.notifications));
      localStorage.setItem(FMP_KEYS.AUDIT_LOG, JSON.stringify(this.db.auditLog));

      if (showVisualPulse) {
        this.triggerAutoSaveIndicator();
      }
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22 || (e.message && e.message.toLowerCase().includes('quota'))) {
        console.warn('FMPStore QuotaExceededError detectado: podando URLs binarias pesadas a vault://...');
        if (Array.isArray(this.db.registrations)) {
          this.db.registrations.forEach(r => {
            if (r.rosterFileUrl && r.rosterFileUrl.startsWith('data:')) {
              FMPFileVault.putFile('roster_' + r.id, r.rosterFileUrl, { fileName: r.rosterFileName, type: 'roster' });
              r.rosterFileUrl = 'vault://roster_' + r.id;
            }
            if (r.paymentReceiptUrl && r.paymentReceiptUrl.startsWith('data:')) {
              FMPFileVault.putFile('payment_' + r.id, r.paymentReceiptUrl, { fileName: r.paymentReceiptFileName, type: 'payment' });
              r.paymentReceiptUrl = 'vault://payment_' + r.id;
            }
          });
        }
        try {
          localStorage.setItem(this.KEY, JSON.stringify(this.db));
          localStorage.setItem(FMP_KEYS.REGISTRATIONS, JSON.stringify(this.db.registrations));
        } catch (e2) {
          console.error('Error crítico al guardar en localStorage tras podar:', e2);
        }
      } else {
        console.error('Error al persistir en FMPStore:', e);
      }
    }
  },

  triggerAutoSaveIndicator() {
    const badge = document.getElementById('fmpAutoSaveIndicator');
    if (!badge) return;
    badge.classList.remove('saved-pulse');
    void badge.offsetWidth;
    badge.classList.add('saved-pulse');
    clearTimeout(this._autoSaveTimeout);
    this._autoSaveTimeout = setTimeout(() => {
      badge.classList.remove('saved-pulse');
    }, 1800);
  },

  migrateLegacyDataOrSeed() {
    let hadLegacy = false;

    const legacyTourneys = localStorage.getItem(STORAGE_KEY_TOURNAMENTS) || localStorage.getItem(FMP_KEYS.TOURNAMENTS);
    if (legacyTourneys) {
      try {
        const parsed = JSON.parse(legacyTourneys);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.db.tournaments = parsed;
          hadLegacy = true;
        }
      } catch (e) {}
    }

    const legacyVenues = localStorage.getItem(FMP_KEYS.VENUES);
    if (legacyVenues) {
      try {
        const parsed = JSON.parse(legacyVenues);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.db.venues = parsed;
          hadLegacy = true;
        }
      } catch (e) {}
    }

    const legacyUsers = localStorage.getItem(FMP_KEYS.USERS);
    if (legacyUsers) {
      try {
        const parsed = JSON.parse(legacyUsers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.db.users = parsed;
          hadLegacy = true;
        }
      } catch (e) {}
    }

    const legacyRegs = localStorage.getItem(FMP_KEYS.REGISTRATIONS);
    if (legacyRegs) {
      try {
        const parsed = JSON.parse(legacyRegs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.db.registrations = parsed;
        }
      } catch (e) {}
    }

    if (!hadLegacy || this.db.tournaments.length === 0) {
      this.seedDatabaseIfEmpty();
    }
  },

  seedDatabaseIfEmpty() {
    // 1. Usuarios Semilla (5 Roles RBAC + 2 Cuentas de Organizador)
    this.db.users = [
      {
        id: 'usr-admin-1',
        name: 'Saider Boadas',
        email: 'boadasaidert466@gmail.com',
        phone: '3104458899',
        password: '123Sai',
        role: 'admin',
        roleTitle: 'Administrador General',
        roleIcon: '👑',
        roleBadgeClass: 'role-admin',
        clubName: 'Fútbol Master Pro',
        createdAt: '2026-01-10T10:00:00.000Z'
      },
      {
        id: 'usr-org-carlos',
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@futbolmaster.co',
        phone: '3109876543',
        password: 'org123',
        role: 'organizer',
        roleTitle: 'Organizador de Torneo',
        roleIcon: '🏆',
        roleBadgeClass: 'role-organizer',
        clubName: 'Liga Premier Bogotá',
        createdAt: '2026-01-20T14:30:00.000Z'
      },
      {
        id: 'usr-org-laura',
        name: 'Laura Ríos',
        email: 'laura.rios@futbolmaster.co',
        phone: '3112345678',
        password: 'org123',
        role: 'organizer',
        roleTitle: 'Organizador Nuevo (0 torneos)',
        roleIcon: '🌱',
        roleBadgeClass: 'role-organizer',
        clubName: 'Torneos Juveniles Colombia',
        createdAt: '2026-03-01T10:00:00.000Z'
      },
      {
        id: 'usr-coach-yepes',
        name: 'Mario Alberto Yepes',
        email: 'tecnico@futbolmaster.co',
        phone: '3154567890',
        password: 'coach123',
        role: 'head_coach',
        roleTitle: 'Director Técnico / Delegado',
        roleIcon: '📋',
        roleBadgeClass: 'role-coach',
        clubName: 'Atlético Bogotá FC',
        category: 'Libre / Mayores',
        city: 'Bogotá D.C.',
        createdAt: '2026-02-05T09:15:00.000Z'
      },
      {
        id: 'usr-coach-julian',
        name: 'Julián Barreto',
        email: 'julian.barreto@futbolmaster.co',
        phone: '3187654321',
        password: 'coach123',
        role: 'team_coach',
        roleTitle: 'Técnico del Equipo',
        roleIcon: '⚽',
        roleBadgeClass: 'role-coach',
        clubName: 'Atlético Bogotá FC',
        category: 'Libre / Mayores',
        city: 'Bogotá D.C.',
        createdAt: '2026-02-10T11:00:00.000Z'
      },
      {
        id: 'usr-fan-1',
        name: 'Juan Camilo Pérez',
        email: 'aficionado@futbolmaster.co',
        phone: '3203456789',
        password: 'fan123',
        role: 'spectator',
        roleTitle: 'Aficionado / Espectador',
        roleIcon: '👀',
        roleBadgeClass: 'role-fan',
        clubName: '',
        createdAt: '2026-02-18T16:45:00.000Z'
      }
    ];

    // 2. Canchas Semilla en Colombia (8 escenarios con mapa y coordenadas)
    this.db.venues = [
      {
        id: 'vn-baq-1',
        name: 'Cancha Sintética La 84',
        nombre: 'Cancha Sintética La 84',
        department: 'Atlántico',
        departamento: 'Atlántico',
        city: 'Barranquilla',
        ciudad: 'Barranquilla',
        address: 'Calle 84 # 47-32, Riomar',
        direccion: 'Calle 84 # 47-32, Riomar',
        phone: '+57 300 481 9283',
        telefonoContacto: '+57 300 481 9283',
        surface: 'Sintética',
        superficie: 'Sintética',
        modality: 'Fútbol 7/8',
        modalidad: 'Fútbol 7/8',
        slots: ['16:00', '18:00', '19:00', '20:00', '21:00'],
        horariosDisponibles: ['16:00', '18:00', '19:00', '20:00', '21:00'],
        coordinates: '10.9984° N, 74.8210° W',
        coordenadas: '10.9984° N, 74.8210° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 250,
        capacidad: 250,
        lighting: 'LED Profesional 500 Lux',
        iluminacion: 'LED Profesional 500 Lux'
      },
      {
        id: 'vn-baq-2',
        name: 'Complejo Deportivo Pibe Valderrama',
        nombre: 'Complejo Deportivo Pibe Valderrama',
        department: 'Atlántico',
        departamento: 'Atlántico',
        city: 'Barranquilla',
        ciudad: 'Barranquilla',
        address: 'Carrera 30 con Murillo, Sur',
        direccion: 'Carrera 30 con Murillo, Sur',
        phone: '+57 312 876 5432',
        telefonoContacto: '+57 312 876 5432',
        surface: 'Grama Natural',
        superficie: 'Grama Natural',
        modality: 'Fútbol 11',
        modalidad: 'Fútbol 11',
        slots: ['08:00', '10:00', '16:00', '18:00'],
        horariosDisponibles: ['08:00', '10:00', '16:00', '18:00'],
        coordinates: '10.9712° N, 74.7954° W',
        coordenadas: '10.9712° N, 74.7954° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 800,
        capacidad: 800,
        lighting: 'LED Profesional 500 Lux',
        iluminacion: 'LED Profesional 500 Lux'
      },
      {
        id: 'vn-bog-1',
        name: 'Complejo Deportivo Salitre',
        nombre: 'Complejo Deportivo Salitre',
        department: 'Bogotá D.C.',
        departamento: 'Bogotá D.C.',
        city: 'Bogotá D.C.',
        ciudad: 'Bogotá D.C.',
        address: 'Av. 68 # 63-00, Parque Metropolitano Simón Bolívar',
        direccion: 'Av. 68 # 63-00, Parque Metropolitano Simón Bolívar',
        phone: '+57 310 998 8776',
        telefonoContacto: '+57 310 998 8776',
        surface: 'Sintética',
        superficie: 'Sintética',
        modality: 'Fútbol 11',
        modalidad: 'Fútbol 11',
        slots: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
        horariosDisponibles: ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'],
        coordinates: '4.6582° N, 74.0935° W',
        coordenadas: '4.6582° N, 74.0935° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 600,
        capacidad: 600,
        lighting: 'LED Profesional 500 Lux',
        iluminacion: 'LED Profesional 500 Lux'
      },
      {
        id: 'vn-bog-2',
        name: 'Canchas Sintéticas La 127',
        nombre: 'Canchas Sintéticas La 127',
        department: 'Bogotá D.C.',
        departamento: 'Bogotá D.C.',
        city: 'Bogotá D.C.',
        ciudad: 'Bogotá D.C.',
        address: 'Calle 127 # 19A-44, Usaquén',
        direccion: 'Calle 127 # 19A-44, Usaquén',
        phone: '+57 315 223 3445',
        telefonoContacto: '+57 315 223 3445',
        surface: 'Sintética',
        superficie: 'Sintética',
        modality: 'Fútbol 7/8',
        modalidad: 'Fútbol 7/8',
        slots: ['18:00', '19:00', '20:00', '21:00', '22:00'],
        horariosDisponibles: ['18:00', '19:00', '20:00', '21:00', '22:00'],
        coordinates: '4.7089° N, 74.0531° W',
        coordenadas: '4.7089° N, 74.0531° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 300,
        capacidad: 300,
        lighting: 'LED Profesional 500 Lux',
        iluminacion: 'LED Profesional 500 Lux'
      },
      {
        id: 'vn-med-1',
        name: 'Unidad Deportiva Atanasio Girardot (Cancha Marte #1)',
        nombre: 'Unidad Deportiva Atanasio Girardot (Cancha Marte #1)',
        department: 'Antioquia',
        departamento: 'Antioquia',
        city: 'Medellín',
        ciudad: 'Medellín',
        address: 'Carrera 74 # 48-010, Estadio',
        direccion: 'Carrera 74 # 48-010, Estadio',
        phone: '+57 304 556 6778',
        telefonoContacto: '+57 304 556 6778',
        surface: 'Sintética',
        superficie: 'Sintética',
        modality: 'Fútbol 11',
        modalidad: 'Fútbol 11',
        slots: ['08:00', '10:00', '14:00', '16:00', '18:00'],
        horariosDisponibles: ['08:00', '10:00', '14:00', '16:00', '18:00'],
        coordinates: '6.2573° N, 75.5896° W',
        coordenadas: '6.2573° N, 75.5896° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 1200,
        capacidad: 1200,
        lighting: 'LED Profesional 500 Lux',
        iluminacion: 'LED Profesional 500 Lux'
      },
      {
        id: 'vn-med-2',
        name: 'Sintética Belén',
        nombre: 'Sintética Belén',
        department: 'Antioquia',
        departamento: 'Antioquia',
        city: 'Medellín',
        ciudad: 'Medellín',
        address: 'Carrera 76 # 30A-40, Belén Rincón',
        direccion: 'Carrera 76 # 30A-40, Belén Rincón',
        phone: '+57 318 667 7889',
        telefonoContacto: '+57 318 667 7889',
        surface: 'Sintética',
        superficie: 'Sintética',
        modality: 'Fútbol 7/8',
        modalidad: 'Fútbol 7/8',
        slots: ['18:00', '19:00', '20:00', '21:00'],
        horariosDisponibles: ['18:00', '19:00', '20:00', '21:00'],
        coordinates: '6.2312° N, 75.5984° W',
        coordenadas: '6.2312° N, 75.5984° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 250,
        capacidad: 250,
        lighting: 'Halógena Estándar',
        iluminacion: 'Halógena Estándar'
      },
      {
        id: 'vn-cal-1',
        name: 'Canchas Panamericanas',
        nombre: 'Canchas Panamericanas',
        department: 'Valle del Cauca',
        departamento: 'Valle del Cauca',
        city: 'Cali',
        ciudad: 'Cali',
        address: 'Calle 9 con Carrera 36, Jaime Aparicio',
        direccion: 'Calle 9 con Carrera 36, Jaime Aparicio',
        phone: '+57 316 778 8990',
        telefonoContacto: '+57 316 778 8990',
        surface: 'Sintética',
        superficie: 'Sintética',
        modality: 'Fútbol 11',
        modalidad: 'Fútbol 11',
        slots: ['08:00', '10:00', '16:00', '18:00', '20:00'],
        horariosDisponibles: ['08:00', '10:00', '16:00', '18:00', '20:00'],
        coordinates: '3.4215° N, 76.5380° W',
        coordenadas: '3.4215° N, 76.5380° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 500,
        capacidad: 500,
        lighting: 'LED Profesional 500 Lux',
        iluminacion: 'LED Profesional 500 Lux'
      },
      {
        id: 'vn-buc-1',
        name: 'Cancha Marte Bucaramanga',
        nombre: 'Cancha Marte Bucaramanga',
        department: 'Santander',
        departamento: 'Santander',
        city: 'Bucaramanga',
        ciudad: 'Bucaramanga',
        address: 'Villa Olímpica Alfonso López',
        direccion: 'Villa Olímpica Alfonso López',
        phone: '+57 317 889 9001',
        telefonoContacto: '+57 317 889 9001',
        surface: 'Sintética',
        superficie: 'Sintética',
        modality: 'Fútbol 11',
        modalidad: 'Fútbol 11',
        slots: ['08:00', '10:00', '14:00', '16:00', '18:00'],
        horariosDisponibles: ['08:00', '10:00', '14:00', '16:00', '18:00'],
        coordinates: '7.1245° N, 73.1189° W',
        coordenadas: '7.1245° N, 73.1189° W',
        verified: 'Verificada',
        estadoConfirmacion: 'Verificada',
        capacity: 900,
        capacidad: 900,
        lighting: 'LED Profesional 500 Lux',
        iluminacion: 'LED Profesional 500 Lux'
      }
    ];

    // 3. Torneo Demo Completo en Curso: "Copa Colombia Master 2026", "Superliga Andina Nocturna 2026" y "Torneo Relámpago Costeño 2026"
    const seedTournament = this.createDemoTournamentSeed();
    const seedAndina = this.createAndinaDemoTournamentSeed();
    const seedCaribe = this.createCaribeDemoTournamentSeed();
    const seedOpenTournament = this.createOpenDemoTournamentSeed();
    const seedCafe = this.createCafeDemoTournamentSeed();
    const seedSantander = this.createSantanderDemoTournamentSeed();
    this.db.tournaments = [seedTournament, seedAndina, seedCaribe, seedOpenTournament, seedCafe, seedSantander];

    // 4. Sesión Activa Inicial (Cerrada por defecto hasta login formal)
    this.db.currentSession = null;

    // 5. Notificaciones Semilla
    this.db.notifications = [
      {
        id: 'notif-seed-1',
        targetRole: 'admin',
        targetUserId: null,
        title: '¡Base de datos FMPStore conectada!',
        message: 'El motor central de base de datos ha inicializado la Copa Colombia Master 2026 con 8 clubes y fixture.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];

    // 6. Auditoría Semilla
    this.db.auditLog = [
      {
        id: 'aud-seed-1',
        userId: 'usr-admin-1',
        userName: 'Carlos Mendoza',
        userRole: 'admin',
        action: 'INICIALIZACION_SISTEMA',
        details: 'FMPStore inicializó la base de datos maestra FOOTBALL_MASTER_PRO_DB_V1 con catálogo de canchas y torneo oficial.',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        ip: '186.115.42.18 (Bogotá D.C., CO)'
      }
    ];

    // 7. Inscripciones Semilla (Fase 3)
    this.db.registrations = [
      {
        id: 'reg_demo_millonarios',
        tournamentId: seedTournament.id,
        tournamentName: seedTournament.name,
        teamName: 'Millonarios FC',
        city: 'Bogotá D.C.',
        color: '#1e3a8a',
        shieldSvg: '',
        coachId: 'usr-coach-1',
        coachName: 'Mario Alberto Yepes',
        coachDoc: '79845123',
        coachPhone: '+57 315 456 7890',
        status: 'aprobada',
        feedbackReason: '',
        players: [
          { id: 'ply_m1', name: 'Álvaro Montero', docType: 'CC', docNumber: '1023456789', birthDate: '1995-03-29', age: 31, dorsal: 31, position: 'Portero', enabled: true },
          { id: 'ply_m2', name: 'Andrés Llinás', docType: 'CC', docNumber: '1024567890', birthDate: '1997-07-23', age: 29, dorsal: 26, position: 'Defensa Central', enabled: true },
          { id: 'ply_m3', name: 'Mackalister Silva', docType: 'CC', docNumber: '1025678901', birthDate: '1986-12-13', age: 39, dorsal: 14, position: 'Volante Ofensivo', enabled: true },
          { id: 'ply_m4', name: 'Leonardo Castro', docType: 'CC', docNumber: '1026789012', birthDate: '1992-06-14', age: 34, dorsal: 23, position: 'Delantero Centro', enabled: true }
        ],
        pdfAttached: true,
        pdfName: 'Planilla_Oficial_Millonarios_FC.pdf',
        updatedAt: new Date().toISOString()
      }
    ];

    this.save(false);
  },

  createDemoTournamentSeed() {
    const tourneyId = 'tournament_copa_colombia_2026';
    const teams = [
      { id: 'team_col_1', name: 'Millonarios FC', color: '#1e3a8a', shield: '', players: ['Álvaro Montero', 'Andrés Llinás', 'Mackalister Silva', 'Leonardo Castro', 'Daniel Ruiz'] },
      { id: 'team_col_2', name: 'Atlético Nacional', color: '#047857', shield: '', players: ['David Ospina', 'William Tesillo', 'Edwin Cardona', 'Alfredo Morelos', 'Marino Hinestroza'] },
      { id: 'team_col_3', name: 'América de Cali', color: '#dc2626', shield: '', players: ['Jorge Soto', 'Daniel Bocanegra', 'Adrián Ramos', 'Duván Vergara', 'Cristian Barrios'] },
      { id: 'team_col_4', name: 'Junior de Barranquilla', color: '#b91c1c', shield: '', players: ['Santiago Mele', 'Didier Moreno', 'Carlos Bacca', 'Yimmi Chará', 'José Enamorado'] },
      { id: 'team_col_5', name: 'Independiente Santa Fe', color: '#e11d48', shield: '', players: ['Andrés Mosquera', 'Julián Millán', 'Daniel Torres', 'Hugo Rodallega', 'Harold Mosquera'] },
      { id: 'team_col_6', name: 'Deportivo Cali', color: '#15803d', shield: '', players: ['Alejandro Rodríguez', 'Francisco Meza', 'Alexander Mejía', 'Fredy Montero', 'Jarlan Barrera'] },
      { id: 'team_col_7', name: 'Independiente Medellín', color: '#991b1b', shield: '', players: ['Eder Chaux', 'Fainer Torijano', 'Baldomero Perlaza', 'Brayan León', 'Luis Sandoval'] },
      { id: 'team_col_8', name: 'Once Caldas', color: '#ffffff', shield: '', players: ['James Aguirre', 'Sergio Palacios', 'Mateo García', 'Dayro Moreno', 'Michael Barrios'] }
    ];

    const venuesList = [
      'Complejo Deportivo Salitre',
      'Unidad Deportiva Atanasio Girardot (Cancha Marte #1)',
      'Cancha Sintética La 84',
      'Canchas Panamericanas'
    ];

    const matches = [];
    const teamIds = teams.map(t => t.id);
    const n = 8;
    const rounds = 7;
    let list = [...teamIds];

    for (let r = 0; r < rounds; r++) {
      const roundNum = r + 1;
      const roundName = `Jornada ${roundNum}`;
      for (let m = 0; m < 4; m++) {
        const homeId = list[m];
        const awayId = list[n - 1 - m];
        const matchId = `match_cc_r${roundNum}_${m + 1}`;
        const venue = venuesList[m % venuesList.length];
        const d = new Date(2026, 2, 7 + r * 7);
        const dateStr = d.toISOString().split('T')[0];
        const timeStr = `${16 + m * 2}:00`;

        matches.push({
          id: matchId,
          round: roundNum,
          roundName: roundName,
          group: 'all',
          homeTeamId: homeId,
          awayTeamId: awayId,
          venue: venue,
          date: dateStr,
          time: timeStr,
          referee: 'Colegiado FCF Designado',
          status: roundNum === 1 ? 'finished' : 'pending',
          isFinished: roundNum === 1,
          isKnockout: false,
          isBye: false,
          homeScore: null,
          awayScore: null,
          scoreHome: null,
          scoreAway: null
        });
      }
      const fixed = list[0];
      const rest = list.slice(1);
      rest.unshift(rest.pop());
      list = [fixed, ...rest];
    }

    // Jornada 1 con marcadores realistas finalizados
    matches[0].homeScore = 2; matches[0].scoreHome = 2;
    matches[0].awayScore = 1; matches[0].scoreAway = 1;

    matches[1].homeScore = 3; matches[1].scoreHome = 3;
    matches[1].awayScore = 0; matches[1].scoreAway = 0;

    matches[2].homeScore = 1; matches[2].scoreHome = 1;
    matches[2].awayScore = 1; matches[2].scoreAway = 1;

    matches[3].homeScore = 2; matches[3].scoreHome = 2;
    matches[3].awayScore = 0; matches[3].scoreAway = 0;

    const standings = [
      { teamId: 'team_col_2', teamName: 'Atlético Nacional', pj: 1, pg: 1, pe: 0, pp: 0, gf: 3, gc: 0, dg: 3, pts: 3, form: ['G'] },
      { teamId: 'team_col_6', teamName: 'Deportivo Cali', pj: 1, pg: 1, pe: 0, pp: 0, gf: 2, gc: 0, dg: 2, pts: 3, form: ['G'] },
      { teamId: 'team_col_1', teamName: 'Millonarios FC', pj: 1, pg: 1, pe: 0, pp: 0, gf: 2, gc: 1, dg: 1, pts: 3, form: ['G'] },
      { teamId: 'team_col_4', teamName: 'Junior de Barranquilla', pj: 1, pg: 0, pe: 1, pp: 0, gf: 1, gc: 1, dg: 0, pts: 1, form: ['E'] },
      { teamId: 'team_col_3', teamName: 'América de Cali', pj: 1, pg: 0, pe: 1, pp: 0, gf: 1, gc: 1, dg: 0, pts: 1, form: ['E'] },
      { teamId: 'team_col_5', teamName: 'Independiente Santa Fe', pj: 1, pg: 0, pe: 0, pp: 1, gf: 1, gc: 2, dg: -1, pts: 0, form: ['P'] },
      { teamId: 'team_col_8', teamName: 'Once Caldas', pj: 1, pg: 0, pe: 0, pp: 1, gf: 0, gc: 2, dg: -2, pts: 0, form: ['P'] },
      { teamId: 'team_col_7', teamName: 'Independiente Medellín', pj: 1, pg: 0, pe: 0, pp: 1, gf: 0, gc: 3, dg: -3, pts: 0, form: ['P'] }
    ];

    return {
      id: tourneyId,
      organizerId: 'usr-org-1',
      name: 'Copa Colombia Master 2026',
      description: 'Torneo oficial de fútbol colombiano con 8 clubes en formato Liga Todos contra Todos, fixture programado y marcadores en vivo.',
      sport: 'f11',
      format: 'league_single',
      startDate: '2026-03-07',
      endDate: '2026-04-18',
      maxTeams: 8,
      playDays: [6, 0],
      timeSlots: ['16:00', '18:00', '20:00'],
      venueIds: venuesList,
      rules: { minAge: 18, maxAge: 0, rosterLimit: 25 },
      pointsConfig: { win: 3, draw: 1, loss: 0 },
      status: 'En curso',
      groups: {},
      teams: teams,
      matches: matches,
      standings: standings,
      scorers: [
        { id: 'sc_1', matchId: 'match_cc_r1_1', teamId: 'team_col_1', playerName: 'Leonardo Castro', minute: 34 },
        { id: 'sc_2', matchId: 'match_cc_r1_1', teamId: 'team_col_1', playerName: 'Daniel Ruiz', minute: 78 },
        { id: 'sc_3', matchId: 'match_cc_r1_1', teamId: 'team_col_5', playerName: 'Hugo Rodallega', minute: 61 },
        { id: 'sc_4', matchId: 'match_cc_r1_2', teamId: 'team_col_2', playerName: 'Alfredo Morelos', minute: 18 },
        { id: 'sc_5', matchId: 'match_cc_r1_2', teamId: 'team_col_2', playerName: 'Edwin Cardona', minute: 52 },
        { id: 'sc_6', matchId: 'match_cc_r1_2', teamId: 'team_col_2', playerName: 'Marino Hinestroza', minute: 85 },
        { id: 'sc_7', matchId: 'match_cc_r1_3', teamId: 'team_col_4', playerName: 'Carlos Bacca', minute: 22 },
        { id: 'sc_8', matchId: 'match_cc_r1_3', teamId: 'team_col_3', playerName: 'Duván Vergara', minute: 73 },
        { id: 'sc_9', matchId: 'match_cc_r1_4', teamId: 'team_col_6', playerName: 'Fredy Montero', minute: 40 },
        { id: 'sc_10', matchId: 'match_cc_r1_4', teamId: 'team_col_6', playerName: 'Jarlan Barrera', minute: 69 }
      ],
      isGenerated: true,
      config: {
        name: 'Copa Colombia Master 2026',
        description: 'Torneo oficial de fútbol colombiano con 8 clubes en formato Liga Todos contra Todos, fixture programado y marcadores en vivo.',
        sport: 'f11',
        format: 'league_single',
        matchDuration: 90,
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        ptsWin: 3,
        ptsDraw: 1,
        ptsLoss: 0,
        tiebreaker: 'dg',
        groupCount: 2,
        groupQualifiedCount: 2,
        hasThirdPlaceMatch: false,
        startDate: '2026-03-07',
        endDate: '2026-04-18',
        allowedDays: [6, 0],
        timeSlots: ['16:00', '18:00', '20:00'],
        assignedVenues: venuesList,
        minAge: 18,
        maxAge: 0,
        rosterLimit: 25
      },
      createdAt: '2026-02-01T12:00:00.000Z',
      updatedAt: new Date().toISOString()
    };
  },

  createOpenDemoTournamentSeed() {
    const tourneyId = 'tournament_apertura_2026';
    return {
      id: tourneyId,
      organizerId: 'usr-org-1',
      name: 'Torneo Apertura Colombia 2026',
      description: 'Competición oficial categoría abierta para clubes aficionados y federados. Inscripciones abiertas.',
      sport: 'f11',
      format: 'league_single',
      category: 'Libre Masculino',
      startDate: '2026-11-01',
      endDate: '2026-12-20',
      regStartDate: '2026-01-01',
      regEndDate: '2026-12-31',
      maxTeams: 8,
      playDays: [6, 0],
      timeSlots: ['09:00', '11:00', '14:00', '16:00'],
      venueIds: ['vn-bog-1', 'vn-med-1'],
      rules: { minAge: 18, maxAge: 0, rosterLimit: 25 },
      status: 'open_registration',
      groups: [],
      teams: [],
      matches: [],
      standings: [],
      isGenerated: false,
      isPublicMode: false,
      filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' },
      createdAt: '2026-10-25T10:00:00Z',
      updatedAt: '2026-10-25T10:00:00Z'
    };
  },

  createCaribeDemoTournamentSeed() {
    return {
      id: 'tournament_relampago_costeno_2026',
      organizerId: 'usr-org-1',
      organizer_id: 'usr-org-1',
      organizerName: 'Víctor Pacheco',
      name: 'Torneo Relámpago Costeño 2026',
      description: 'Competición relámpago en Barranquilla y la Costa Caribe con clubes federados de alta intensidad.',
      sport: 'futbol11',
      format: 'league_single',
      category: 'Libre Masculino',
      status: 'en_curso',
      startDate: '2026-11-15',
      endDate: '2027-01-20',
      regStartDate: '2026-10-15',
      regEndDate: '2026-12-25',
      maxTeams: 4,
      playDays: ['viernes', 'sábado', 'domingo'],
      timeSlots: ['16:00', '18:00', '20:00'],
      venueIds: ['vn-baq-1', 'vn-ctg-1'],
      config: {
        name: 'Torneo Relámpago Costeño 2026',
        description: 'Competición relámpago en Barranquilla y la Costa Caribe con clubes federados.',
        sport: 'futbol11',
        format: 'league_single',
        matchDuration: 90,
        startDate: '2026-11-15',
        endDate: '2027-01-20',
        regStartDate: '2026-10-15',
        regEndDate: '2026-12-25',
        allowedDays: [5, 6, 0],
        timeSlots: ['16:00', '18:00', '20:00'],
        venues: ['vn-baq-1', 'vn-ctg-1']
      },
      teams: [
        { id: 'tm_baq_1', name: 'Academia Barranquilla FC', city: 'Barranquilla', color: '#dc2626' },
        { id: 'tm_baq_2', name: 'Real Cartagena Costeño', city: 'Cartagena', color: '#f59e0b' },
        { id: 'tm_baq_3', name: 'Jaguares del Sinú', city: 'Montería', color: '#0284c7' },
        { id: 'tm_baq_4', name: 'Unión Magdalena Pro', city: 'Santa Marta', color: '#1e3a8a' }
      ],
      matches: [
        {
          id: 'mt_costeno_1',
          round: 1,
          homeTeamId: 'tm_baq_1',
          homeTeamName: 'Academia Barranquilla FC',
          awayTeamId: 'tm_baq_2',
          awayTeamName: 'Real Cartagena Costeño',
          status: 'finished',
          isFinished: true,
          homeScore: 3,
          awayScore: 2,
          scoreHome: 3,
          scoreAway: 2,
          venue: 'Cancha Bombonera Barranquilla'
        },
        {
          id: 'mt_costeno_2',
          round: 1,
          homeTeamId: 'tm_baq_3',
          homeTeamName: 'Jaguares del Sinú',
          awayTeamId: 'tm_baq_4',
          awayTeamName: 'Unión Magdalena Pro',
          status: 'finished',
          isFinished: true,
          homeScore: 1,
          awayScore: 0,
          scoreHome: 1,
          scoreAway: 0,
          venue: 'Cancha El Pibe Valderrama'
        }
      ],
      isGenerated: true,
      isPublicMode: false,
      filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' },
      updatedAt: new Date().toISOString()
    };
  },

  createCafeDemoTournamentSeed() {
    return {
      id: 'tournament_copa_cafetera_2026',
      organizerId: 'usr-org-1',
      organizer_id: 'usr-org-1',
      organizerName: 'Andrés Montoya',
      name: 'Copa Cafetera de Occidente 2026',
      description: 'Torneo regional del Eje Cafetero y Valle del Cauca. Formato dinámico con canchas naturales y sintéticas de primer nivel.',
      sport: 'futbol11',
      format: 'groups_playoffs',
      category: 'Sub-20 Masculino',
      status: 'open_registration',
      startDate: '2026-11-20',
      endDate: '2027-01-30',
      regStartDate: '2026-10-20',
      regEndDate: '2026-12-28',
      maxTeams: 8,
      playDays: ['sábado', 'domingo'],
      timeSlots: ['08:00', '10:00', '14:00', '16:00'],
      venueIds: ['vn-per-1', 'vn-cali-1'],
      config: {
        name: 'Copa Cafetera de Occidente 2026',
        description: 'Torneo regional del Eje Cafetero y Valle del Cauca.',
        sport: 'futbol11',
        format: 'groups_playoffs',
        matchDuration: 90,
        startDate: '2026-11-20',
        endDate: '2027-01-30',
        regStartDate: '2026-10-20',
        regEndDate: '2026-12-28',
        allowedDays: [6, 0],
        timeSlots: ['08:00', '10:00', '14:00', '16:00'],
        venues: ['vn-per-1', 'vn-cali-1']
      },
      teams: [],
      matches: [],
      standings: [],
      isGenerated: false,
      isPublicMode: false,
      filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' }
    };
  },

  createSantanderDemoTournamentSeed() {
    return {
      id: 'tournament_metro_santander_2026',
      organizerId: 'usr-org-1',
      organizer_id: 'usr-org-1',
      organizerName: 'Andrés Montoya',
      name: 'Torneo Metropolitano Santander 2026',
      description: 'Competición cerrada de pretemporada en Bucaramanga. Equipos confirmados, inicio programado.',
      sport: 'futbol11',
      format: 'league_single',
      category: 'Libre Masculino',
      status: 'upcoming',
      startDate: '2026-11-25',
      endDate: '2027-02-10',
      regStartDate: '2026-10-01',
      regEndDate: '2026-11-10',
      maxTeams: 8,
      playDays: ['sábado', 'domingo'],
      timeSlots: ['16:00', '18:00', '20:00'],
      venueIds: ['vn-buc-1'],
      config: {
        name: 'Torneo Metropolitano Santander 2026',
        description: 'Competición cerrada de pretemporada en Bucaramanga.',
        sport: 'futbol11',
        format: 'league_single',
        matchDuration: 90,
        startDate: '2026-11-25',
        endDate: '2027-02-10',
        regStartDate: '2026-10-01',
        regEndDate: '2026-11-10',
        allowedDays: [6, 0],
        timeSlots: ['16:00', '18:00', '20:00'],
        venues: ['vn-buc-1']
      },
      teams: [],
      matches: [],
      standings: [],
      isGenerated: false,
      isPublicMode: false,
      filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' }
    };
  },

  createAndinaDemoTournamentSeed() {
    return {
      id: 'tournament_superliga_andina_2026',
      organizerId: 'usr-org-1',
      organizer_id: 'usr-org-1',
      organizerName: 'Andrés Montoya',
      name: 'Superliga Andina Nocturna 2026',
      description: 'Fútbol nocturno en grama sintética y natural con iluminación LED profesional en Bogotá y Cali.',
      sport: 'futbol11',
      format: 'league_single',
      category: 'Libre Masculino',
      status: 'in_progress',
      startDate: '2026-09-01',
      endDate: '2026-12-15',
      regStartDate: '2026-08-01',
      regEndDate: '2026-08-25',
      maxTeams: 8,
      playDays: ['miércoles', 'viernes', 'sábado'],
      timeSlots: ['18:00', '20:00'],
      venueIds: ['vn-bog-1', 'vn-cali-1'],
      config: {
        name: 'Superliga Andina Nocturna 2026',
        description: 'Fútbol nocturno en grama sintética y natural con iluminación LED.',
        sport: 'futbol11',
        format: 'league_single',
        matchDuration: 90,
        startDate: '2026-09-01',
        endDate: '2026-12-15',
        regStartDate: '2026-08-01',
        regEndDate: '2026-08-25',
        allowedDays: [3, 5, 6],
        timeSlots: ['18:00', '20:00'],
        venues: ['vn-bog-1', 'vn-cali-1']
      },
      teams: [
        { id: 'tm-bog-01', name: 'Bogotá FC Master', city: 'Bogotá', color: '#10b981' },
        { id: 'tm-cali-01', name: 'América Master', city: 'Cali', color: '#ef4444' },
        { id: 'tm-bog-02', name: 'Santa Fe Senior', city: 'Bogotá', color: '#dc2626' },
        { id: 'tm-cali-02', name: 'Cali Deportivo', city: 'Cali', color: '#059669' }
      ],
      matches: [
        {
          id: 'mt-andina-1',
          round: 1,
          roundName: 'Jornada 1',
          teamHomeId: 'tm-bog-01',
          teamHomeName: 'Bogotá FC Master',
          teamAwayId: 'tm-cali-02',
          teamAwayName: 'Cali Deportivo',
          venue: 'Complejo Salitre Alto Rendimiento',
          venueId: 'vn-bog-1',
          date: '2026-10-31',
          time: '18:00',
          isFinished: true,
          scoreHome: 2,
          scoreAway: 1
        },
        {
          id: 'mt-andina-2',
          round: 1,
          roundName: 'Jornada 1',
          teamHomeId: 'tm-cali-01',
          teamHomeName: 'América Master',
          teamAwayId: 'tm-bog-02',
          teamAwayName: 'Santa Fe Senior',
          venue: 'Sede Campestre La Zarcita',
          venueId: 'vn-cali-1',
          date: '2026-10-31',
          time: '20:00',
          isFinished: false,
          scoreHome: null,
          scoreAway: null
        }
      ],
      standings: [
        { teamId: 'tm-bog-01', teamName: 'Bogotá FC Master', played: 1, won: 1, drawn: 0, lost: 0, gf: 2, ga: 1, gd: 1, points: 3 },
        { teamId: 'tm-cali-01', teamName: 'América Master', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
        { teamId: 'tm-bog-02', teamName: 'Santa Fe Senior', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 },
        { teamId: 'tm-cali-02', teamName: 'Cali Deportivo', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 2, gd: -1, points: 0 }
      ],
      isGenerated: true,
      isPublicMode: false,
      filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' }
    };
  },

  // Operaciones de Usuarios
  getUsers() { return this.db.users; },
  getUserById(id) { return this.db.users.find(u => u.id === id); },
  getUserByEmail(email) {
    if (!email) return null;
    return this.db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  },
  saveUser(user) {
    const idx = this.db.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.db.users[idx] = { ...this.db.users[idx], ...user };
    } else {
      this.db.users.push(user);
    }
    this.save();
    return user;
  },

  // Operaciones de Sesión
  getSession() { return this.db.currentSession; },
  setSession(session) {
    this.db.currentSession = session;
    this.save();
  },
  clearSession() {
    this.db.currentSession = null;
    this.save();
  },

  // Operaciones de Equipos Maestros (Regla 10 BD)
  getTeams() {
    if (!this.db.teams || this.db.teams.length === 0) {
      this.db.teams = [
        { id: 'tm-nac-01', name: 'Atlético Nacional Master', coachId: 'usr-coach-1', coachName: 'Prof. Héctor Ramírez', city: 'Medellín', category: 'Libre Masculino', color: '#059669', shieldSvg: '', createdAt: new Date().toISOString() },
        { id: 'tm-mil-02', name: 'Millonarios Senior FC', coachId: null, coachName: 'Alberto Gamero', city: 'Bogotá D.C.', category: 'Libre Masculino', color: '#2563eb', shieldSvg: '', createdAt: new Date().toISOString() },
        { id: 'tm-ame-03', name: 'América de Cali Vintage', coachId: null, coachName: 'Jorge Da Silva', city: 'Cali', category: 'Libre Masculino', color: '#dc2626', shieldSvg: '', createdAt: new Date().toISOString() },
        { id: 'tm-jun-04', name: 'Junior de Barranquilla Pro', coachId: null, coachName: 'Arturo Reyes', city: 'Barranquilla', category: 'Libre Masculino', color: '#e11d48', shieldSvg: '', createdAt: new Date().toISOString() },
        { id: 'tm-sf-05', name: 'Independiente Santa Fe Master', coachId: null, coachName: 'Pablo Peirano', city: 'Bogotá D.C.', category: 'Libre Masculino', color: '#ef4444', shieldSvg: '', createdAt: new Date().toISOString() },
        { id: 'tm-cali-06', name: 'Deportivo Cali Élite', coachId: null, coachName: 'Hernán Torres', city: 'Cali', category: 'Libre Masculino', color: '#16a34a', shieldSvg: '', createdAt: new Date().toISOString() },
        { id: 'tm-dim-07', name: 'Independiente Medellín Clásicos', coachId: null, coachName: 'Alfredo Arias', city: 'Medellín', category: 'Libre Masculino', color: '#b91c1c', shieldSvg: '', createdAt: new Date().toISOString() },
        { id: 'tm-buc-08', name: 'Atlético Bucaramanga Campeón', coachId: null, coachName: 'Rafael Dudamel', city: 'Bucaramanga', category: 'Libre Masculino', color: '#ca8a04', shieldSvg: '', createdAt: new Date().toISOString() }
      ];
      this.save(false);
    }
    return this.db.teams;
  },
  getTeamById(id) {
    return (this.db.teams || []).find(t => t.id === id);
  },
  saveTeam(team) {
    if (!team || !team.id) return;
    if (!this.db.teams) this.db.teams = [];
    const idx = this.db.teams.findIndex(t => t.id === team.id);
    if (idx !== -1) {
      this.db.teams[idx] = { ...this.db.teams[idx], ...team };
    } else {
      this.db.teams.push(team);
    }
    this.save();
    return team;
  },

  // Guardián Central de Propiedad y Permisos (Middleware assertTournamentOwnership)
  assertTournamentOwnership(tournamentId, actionName = 'MODIFICAR_TORNEO') {
    const session = this.getSession();
    if (!session || !session.loggedIn) {
      this.logAudit('SEGURIDAD_ACCESO_DENEGADO', `Intento no autenticado para acción '${actionName}' en torneo ${tournamentId}`);
      return { ok: false, error: 'Debe iniciar sesión para realizar esta acción.' };
    }
    if (session.role === 'admin') {
      return { ok: true, reason: 'ADMIN_GLOBAL' };
    }
    const tourney = this.getTournamentById(tournamentId);
    if (!tourney) {
      return { ok: false, error: 'Torneo no encontrado en la base de datos.' };
    }
    const ownerId = tourney.organizerId || tourney.organizer_id;
    if (ownerId && ownerId === session.userId) {
      return { ok: true, reason: 'ORGANIZER_OWNER' };
    }
    this.logAudit(
      'SEGURIDAD_ACCESO_DENEGADO',
      `Usuario ${session.name} (${session.email}, Rol: ${session.role}) intentó la acción '${actionName}' sobre el torneo '${tourney.config?.name || tourney.name}' sin ser el organizador propietario.`
    );
    return {
      ok: false,
      error: 'Acceso denegado: Este torneo solo puede ser modificado por su organizador propietario o el Administrador General.'
    };
  },

  // Corrección Auditada de Marcadores
  correctMatchScore(tournamentId, matchId, homeScore, awayScore, reason) {
    const ownership = this.assertTournamentOwnership(tournamentId, 'CORREGIR_MARCADOR_AUDITADO');
    if (!ownership.ok) return ownership;

    const tourney = this.getTournamentById(tournamentId);
    if (!tourney || !Array.isArray(tourney.matches)) {
      return { ok: false, error: 'No se encontraron los partidos del torneo.' };
    }

    const match = tourney.matches.find(m => m.id === matchId);
    if (!match) {
      return { ok: false, error: 'Partido no encontrado en el calendario del torneo.' };
    }

    const oldHome = match.homeScore !== undefined ? match.homeScore : '-';
    const oldAway = match.awayScore !== undefined ? match.awayScore : '-';
    match.homeScore = parseInt(homeScore, 10);
    match.awayScore = parseInt(awayScore, 10);
    match.status = 'finished';
    match.isFinished = true;
    match.reviewStatus = 'verified';
    match.observations = `${match.observations || ''} [CORREGIDO AUDITADO: ${reason}]`.trim();
    match.updatedAt = new Date().toISOString();

    // Recalcular tabla de posiciones sin duplicar
    if (typeof calculateStandingsForTournament === 'function') {
      tourney.standings = calculateStandingsForTournament(tourney);
    } else if (typeof calculateStandings === 'function' && activeTournamentId === tournamentId) {
      tourney.standings = calculateStandings();
    }

    this.saveTournament(tourney);
    const session = this.getSession();
    this.logAudit(
      'CORRECCION_MARCADOR_AUDITADA',
      `Partido '${match.homeTeam || match.homeTeamName}' vs '${match.awayTeam || match.awayTeamName}' corregido de (${oldHome} - ${oldAway}) a (${homeScore} - ${awayScore}). Motivo: ${reason}`
    );

    return { ok: true, match };
  },

  // Operaciones de Torneos
  getTournaments() { return this.db.tournaments; },
  getTournamentById(id) { return this.db.tournaments.find(t => t.id === id); },
  saveTournament(tourney) {
    if (!tourney || !tourney.id) return;
    const idx = this.db.tournaments.findIndex(t => t.id === tourney.id);
    if (idx !== -1) {
      // Si el torneo ya existe, verificar propiedad antes de sobreescribir
      const ownership = this.assertTournamentOwnership(tourney.id, 'ACTUALIZAR_TORNEO');
      if (!ownership.ok) {
        console.warn('Bloqueo de seguridad FMPStore:', ownership.error);
        if (!window._fmpIsBooting && typeof showToast === 'function') showToast(ownership.error, 'error', 3500);
        return false;
      }
    }
    if (idx !== -1) {
      this.db.tournaments[idx] = JSON.parse(JSON.stringify(tourney));
    } else {
      this.db.tournaments.unshift(JSON.parse(JSON.stringify(tourney)));
    }
    if (this.db.currentSession) {
      this.db.currentSession.activeTournamentId = tourney.id;
    }
    this.save();
  },
  deleteTournament(id) {
    const ownership = this.assertTournamentOwnership(id, 'ELIMINAR_TORNEO');
    if (!ownership.ok) {
      if (typeof showToast === 'function') showToast(ownership.error, 'error', 3500);
      return false;
    }
    this.db.tournaments = this.db.tournaments.filter(t => t.id !== id);
    if (this.db.currentSession && this.db.currentSession.activeTournamentId === id) {
      this.db.currentSession.activeTournamentId = this.db.tournaments[0]?.id || null;
    }
    this.save();
  },

  // Operaciones de Canchas
  getVenues() { return this.db.venues; },
  saveVenue(venue) {
    if (!venue || !venue.id) return;
    const idx = this.db.venues.findIndex(v => v.id === venue.id);
    if (idx !== -1) {
      this.db.venues[idx] = { ...this.db.venues[idx], ...venue };
    } else {
      this.db.venues.unshift(venue);
    }
    this.save();
  },
  deleteVenue(id) {
    this.db.venues = this.db.venues.filter(v => v.id !== id);
    this.save();
  },

  // Operaciones de Inscripciones
  getRegistrations() { return this.db.registrations; },
  saveRegistration(reg) {
    if (!reg || !reg.id) return;
    const idx = this.db.registrations.findIndex(r => r.id === reg.id);
    if (idx !== -1) {
      this.db.registrations[idx] = { ...this.db.registrations[idx], ...reg };
    } else {
      this.db.registrations.unshift(reg);
    }
    this.save();
  },

  // =========================================================================
  // FASE 5 & 6: MOTOR CENTRAL DE INSCRIPCIONES, JUGADORES, ACTAS Y RESULTADOS
  // =========================================================================

  applyToTournament(tournamentId, teamData = {}, coachData = {}) {
    const session = this.getSession();
    if (!session || !session.loggedIn) {
      return { ok: false, error: 'Debe iniciar sesión para solicitar inscripción.' };
    }
    if (session.role !== 'coach' && session.role !== 'admin') {
      return { ok: false, error: 'Solo los Directores Técnicos o Administradores pueden inscribir equipos.' };
    }

    const tourney = this.getTournamentById(tournamentId);
    if (!tourney) {
      return { ok: false, error: 'Torneo no encontrado.' };
    }

    // Regla 1: Estado del torneo debe ser open_registration
    const statusNorm = (tourney.status || '').toLowerCase().trim();
    if (statusNorm !== 'open_registration' && statusNorm !== 'inscripciones_abiertas') {
      return { ok: false, error: `El torneo no acepta postulaciones (Estado actual: ${tourney.status || 'Cerrado'}). Solo permitido en 'open_registration'.` };
    }

    // Regla 2: Rango de fechas de inscripción
    const today = new Date().toISOString().substring(0, 10);
    const regStart = tourney.regStartDate || tourney.config?.regStartDate;
    const regEnd = tourney.regEndDate || tourney.config?.regEndDate;
    if (regStart && regEnd) {
      if (today < regStart || today > regEnd) {
        return { ok: false, error: `Periodo de inscripciones cerrado. Fechas oficiales: ${regStart} a ${regEnd}.` };
      }
    }

    // Regla 3: Capacidad máxima de cupos
    const maxTeams = parseInt(tourney.maxTeams || tourney.config?.maxTeams || 8, 10);
    const approvedRegs = (this.db.registrations || []).filter(r => r.tournamentId === tournamentId && (r.status === 'habilitado' || r.status === 'aprobada_inicial'));
    if (approvedRegs.length >= maxTeams) {
      return { ok: false, error: `Cupos agotados. El torneo ha completado su límite de ${maxTeams} equipos.` };
    }

    // Regla 4: Evitar duplicado de solicitud activa
    const teamName = teamData.name || coachData.clubName || session.clubName || 'Mi Club Deportivo';
    const existing = (this.db.registrations || []).find(r => r.tournamentId === tournamentId && (r.clubName?.toLowerCase() === teamName.toLowerCase() || r.teamName?.toLowerCase() === teamName.toLowerCase()) && r.status !== 'rechazada' && r.status !== 'cancelada');
    if (existing) {
      return { ok: false, error: `Ya existe una postulación activa para ${teamName} en este torneo.` };
    }

    const regId = 'reg-' + Date.now();
    const newReg = {
      id: regId,
      tournamentId: tournamentId,
      tournamentName: tourney.config?.name || tourney.name || 'Torneo Oficial',
      teamId: teamData.id || ('tm-' + Date.now()),
      clubName: teamName,
      teamName: teamName,
      city: teamData.city || coachData.city || session.city || 'Bogotá D.C.',
      primaryColor: teamData.color || '#10b981',
      shield: teamData.shield || '',
      coachId: session.userId,
      coachName: coachData.name || session.name || 'Director Técnico',
      dtName: coachData.name || session.name || 'Director Técnico',
      coachDoc: coachData.doc || '79845123',
      dtDocNumber: coachData.doc || '79845123',
      dtDocType: 'CC',
      coachPhone: coachData.phone || session.phone || '+57 3001234567',
      dtPhone: coachData.phone || session.phone || '+57 3001234567',
      category: tourney.category || tourney.config?.category || 'Libre Masculino',
      status: 'pendiente_inicial',
      statusText: 'Pendiente Inicial',
      observations: '',
      roster: [],
      pdfAttachment: null,
      submittedAt: new Date().toISOString()
    };

    if (!Array.isArray(this.db.registrations)) this.db.registrations = [];
    this.db.registrations.unshift(newReg);
    this.save();

    this.logAudit('POSTULACION_TORNEO', `Postuló al club '${teamName}' al torneo '${newReg.tournamentName}'`, newReg.id);
    this.addNotification({
      title: 'Postulación Enviada',
      message: `Tu solicitud para inscribir a ${teamName} en "${newReg.tournamentName}" fue enviada.`,
      type: 'info'
    });

    return { ok: true, registration: newReg };
  },

  cancelApplication(registrationId) {
    const session = this.getSession();
    if (!session || !session.loggedIn) return { ok: false, error: 'Debe iniciar sesión.' };
    const reg = (this.db.registrations || []).find(r => r.id === registrationId);
    if (!reg) return { ok: false, error: 'Solicitud no encontrada.' };

    if (session.role === 'coach' && reg.coachId && reg.coachId !== session.userId) {
      return { ok: false, error: 'Solo puedes cancelar tus propias postulaciones.' };
    }

    reg.status = 'cancelada';
    reg.statusText = 'Cancelada por el DT';
    reg.cancelledAt = new Date().toISOString();
    this.save();
    this.logAudit('CANCELACION_SOLICITUD', `El técnico canceló la postulación de ${reg.clubName || reg.teamName}`, reg.id);
    return { ok: true };
  },

  reviewApplication(registrationId, decision, reason = '') {
    const session = this.getSession();
    if (!session || !session.loggedIn) return { ok: false, error: 'Debe iniciar sesión.' };

    // SEGURIDAD CRÍTICA: Bloqueo de auto-aprobación del DT
    if (session.role === 'coach') {
      this.logAudit('INTENTO_AUTO_APROBACION_DENEGADO', `Técnico intentó dictaminar solicitud ${registrationId} con '${decision}'`);
      return { ok: false, error: 'Acceso denegado: Un Director Técnico no tiene autorización para aprobar o rechazar solicitudes.' };
    }

    const reg = (this.db.registrations || []).find(r => r.id === registrationId);
    if (!reg) return { ok: false, error: 'Solicitud no encontrada.' };

    const tourney = this.getTournamentById(reg.tournamentId);
    if (session.role !== 'admin') {
      const ownerId = tourney?.organizerId || tourney?.organizer_id;
      if (ownerId && ownerId !== session.userId) {
        return { ok: false, error: 'Acceso denegado: Solo el organizador propietario puede revisar solicitudes de este torneo.' };
      }
    }

    reg.status = decision;
    reg.observations = reason;
    reg.reviewedAt = new Date().toISOString();
    reg.reviewedBy = session.userId;

    if (decision === 'habilitado') {
      if (tourney) {
        if (!Array.isArray(tourney.teams)) tourney.teams = [];
        const tName = reg.clubName || reg.teamName;
        const exists = tourney.teams.some(t => t.name?.toLowerCase() === tName.toLowerCase());
        if (!exists) {
          tourney.teams.push({
            id: reg.teamId || ('tm-' + Date.now()),
            name: tName,
            color: reg.primaryColor || '#10b981',
            shield: reg.shield || '',
            players: Array.isArray(reg.roster) ? reg.roster.map(p => p.name) : []
          });
          this.saveTournament(tourney);
        }
      }
    }

    this.save();
    this.logAudit('REVISION_SOLICITUD', `Dictaminó solicitud ${reg.id} (${reg.clubName || reg.teamName}) como '${decision}'. Motivo: ${reason}`);
    return { ok: true, status: decision };
  },

  registerPlayerToRoster(tournamentId, teamId, playerData) {
    const session = this.getSession();
    if (!session || !session.loggedIn) return { ok: false, error: 'Debe iniciar sesión.' };
    if (session.role !== 'coach' && session.role !== 'organizer' && session.role !== 'admin') {
      return { ok: false, error: 'No tienes permisos para inscribir jugadores.' };
    }

    const name = (playerData.name || '').trim();
    const docType = playerData.docType || 'CC';
    const docNumber = String(playerData.docNumber || '').trim();
    const dorsal = parseInt(playerData.dorsal, 10);
    const position = playerData.position || 'Mediocampista';
    const eps = playerData.eps || 'Sura EPS';
    const age = parseInt(playerData.age, 10);

    if (!name || !docNumber || isNaN(dorsal) || dorsal < 1 || dorsal > 99) {
      return { ok: false, error: 'Datos del jugador incompletos o número dorsal inválido (1-99).' };
    }

    // Validación acudiente si es menor de 18
    if (!isNaN(age) && age < 18) {
      if (!playerData.guardianName || !playerData.guardianDoc) {
        return { ok: false, error: 'Para jugadores menores de edad es obligatorio registrar el nombre y documento del tutor legal.' };
      }
    }

    // Regla 1: Unicidad de documento en el torneo
    if (tournamentId) {
      const tourneyRegs = (this.db.registrations || []).filter(r => r.tournamentId === tournamentId);
      for (const r of tourneyRegs) {
        if (Array.isArray(r.roster)) {
          const dup = r.roster.find(p => p.docNumber === docNumber);
          if (dup) {
            return { ok: false, error: `El documento ${docType} ${maskDocNumber(docNumber)} ya está inscrito en el torneo con ${r.clubName || r.teamName}.` };
          }
        }
      }
    }

    // Regla 2: Unicidad de dorsal en el equipo
    const currentRoster = typeof getFmpClubRoster === 'function' ? getFmpClubRoster() : [];
    const dupDorsal = currentRoster.find(p => p.dorsal === dorsal);
    if (dupDorsal) {
      return { ok: false, error: `El dorsal ${dorsal} ya está asignado a ${dupDorsal.name} en este equipo.` };
    }

    const newPlayer = {
      id: 'ply-' + Date.now(),
      teamId: teamId,
      tournamentId: tournamentId,
      dorsal: dorsal,
      name: name,
      docType: docType,
      docNumber: docNumber,
      position: position,
      eps: eps,
      age: age || 25,
      guardianName: playerData.guardianName || null,
      guardianDoc: playerData.guardianDoc || null,
      enabled: true,
      status: 'Habilitado',
      createdAt: new Date().toISOString()
    };

    currentRoster.push(newPlayer);
    if (typeof saveFmpClubRoster === 'function') saveFmpClubRoster(currentRoster);
    this.logAudit('INSCRIPCION_JUGADOR', `Inscribió a ${name} (Dorsal ${dorsal}, ${docType} ${maskDocNumber(docNumber)})`);
    return { ok: true, player: newPlayer };
  },

  saveMatchScoreAndScorers(tournamentId, matchId, homeScore, awayScore, scorersList = [], actaData = null) {
    const ownership = this.assertTournamentOwnership(tournamentId, 'REGISTRAR_MARCADOR');
    if (!ownership.ok) return ownership;

    const tourney = this.getTournamentById(tournamentId);
    if (!tourney || !Array.isArray(tourney.matches)) {
      return { ok: false, error: 'No se encontraron partidos para este torneo.' };
    }
    const match = tourney.matches.find(m => m.id === matchId);
    if (!match) return { ok: false, error: 'Partido no encontrado.' };

    const hScore = parseInt(homeScore, 10);
    const aScore = parseInt(awayScore, 10);

    // Validación de integridad de goleadores
    if (Array.isArray(scorersList) && scorersList.length > 0) {
      let sumHome = 0;
      let sumAway = 0;
      const homeId = match.homeTeamId || match.homeTeam;
      const awayId = match.awayTeamId || match.awayTeam;

      for (const s of scorersList) {
        const gCount = parseInt(s.goals || 1, 10);
        if (s.teamId === homeId || s.team === 'home') {
          sumHome += gCount;
        } else if (s.teamId === awayId || s.team === 'away') {
          sumAway += gCount;
        } else {
          return { ok: false, error: `El anotador ${s.playerName} no pertenece a ninguno de los dos clubes participantes.` };
        }
      }

      if (sumHome !== hScore || sumAway !== aScore) {
        return {
          ok: false,
          error: `Inconsistencia en planilla: Los goles asignados (Local: ${sumHome}, Visitante: ${sumAway}) deben coincidir exactamente con el resultado final (${hScore} - ${aScore}).`
        };
      }
    }

    match.homeScore = hScore;
    match.scoreHome = hScore;
    match.awayScore = aScore;
    match.scoreAway = aScore;
    match.status = 'finished';
    match.isFinished = true;
    match.reviewStatus = 'verified';
    match.scorers = scorersList;
    if (actaData) {
      match.supportDocName = actaData.fileName;
      match.supportDocPath = actaData.filePath;
      match.supportDocData = actaData.fileData;
    }
    match.updatedAt = new Date().toISOString();

    this.recalculateTournamentStandings(tourney);
    this.saveTournament(tourney);

    this.logAudit('REGISTRO_RESULTADO_OFICIAL', `Asentó resultado oficial: ${match.homeTeam || match.homeTeamName} ${hScore} - ${aScore} ${match.awayTeam || match.awayTeamName}`);
    return { ok: true, match };
  },

  recalculateTournamentStandings(tourney) {
    if (!tourney || !Array.isArray(tourney.matches) || !Array.isArray(tourney.teams)) return;

    const stats = {};
    tourney.teams.forEach(t => {
      stats[t.id] = {
        teamId: t.id,
        teamName: t.name,
        pj: 0, pg: 0, pe: 0, pp: 0,
        gf: 0, gc: 0, dg: 0, pts: 0,
        form: []
      };
    });

    tourney.matches.forEach(m => {
      if (m.status === 'finished' && m.homeScore !== undefined && m.awayScore !== undefined && m.homeScore !== null && m.awayScore !== null) {
        const hId = m.homeTeamId || tourney.teams.find(t => t.name === m.homeTeam)?.id;
        const aId = m.awayTeamId || tourney.teams.find(t => t.name === m.awayTeam)?.id;
        const hs = parseInt(m.homeScore, 10);
        const as_ = parseInt(m.awayScore, 10);

        if (hId && stats[hId] && aId && stats[aId]) {
          stats[hId].pj += 1;
          stats[aId].pj += 1;
          stats[hId].gf += hs;
          stats[hId].gc += as_;
          stats[aId].gf += as_;
          stats[aId].gc += hs;

          if (hs > as_) {
            stats[hId].pg += 1;
            stats[hId].pts += 3;
            stats[hId].form.unshift('G');
            stats[aId].pp += 1;
            stats[aId].form.unshift('P');
          } else if (hs < as_) {
            stats[aId].pg += 1;
            stats[aId].pts += 3;
            stats[aId].form.unshift('G');
            stats[hId].pp += 1;
            stats[hId].form.unshift('P');
          } else {
            stats[hId].pe += 1;
            stats[hId].pts += 1;
            stats[hId].form.unshift('E');
            stats[aId].pe += 1;
            stats[aId].pts += 1;
            stats[aId].form.unshift('E');
          }
        }
      }
    });

    const list = Object.values(stats);
    list.forEach(item => {
      item.dg = item.gf - item.gc;
      item.form = item.form.slice(0, 5);
    });

    list.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });

    tourney.standings = list;
  },

  uploadMatchActa(tournamentId, matchId, fileObj) {
    if (!fileObj || !fileObj.name) {
      return { ok: false, error: 'Archivo no válido.' };
    }

    const ext = fileObj.name.substring(fileObj.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg'];
    if (!allowed.includes(ext)) {
      return { ok: false, error: 'Formato no permitido. Solo se aceptan actas en formato PDF o imágenes (PNG, JPG, JPEG).' };
    }

    const maxSize = 10 * 1024 * 1024;
    if (fileObj.size && fileObj.size > maxSize) {
      return { ok: false, error: 'El archivo excede el tamaño máximo permitido de 10MB.' };
    }

    const tourney = this.getTournamentById(tournamentId);
    const match = tourney?.matches?.find(m => m.id === matchId);
    if (!match) return { ok: false, error: 'Partido no encontrado.' };

    match.supportDocName = fileObj.name;
    match.supportDocPath = `/uploads/actas/${fileObj.name}`;
    match.reviewStatus = 'pending_review';
    this.saveTournament(tourney);

    const mockExtraction = {
      matchId: matchId,
      fileName: fileObj.name,
      extractedHomeScore: 2,
      extractedAwayScore: 1,
      extractedScorers: [
        { playerName: 'Delantero Oficial', goals: 1, team: 'home' },
        { playerName: 'Volante Creativo', goals: 1, team: 'home' },
        { playerName: 'Capitán Rival', goals: 1, team: 'away' }
      ],
      reviewStatus: 'pending_review'
    };

    this.logAudit('CARGA_ACTA_PARTIDO', `Cargó acta oficial '${fileObj.name}' para partido ${matchId}. Estado: pending_review`);
    return { ok: true, extracted: mockExtraction, reviewStatus: 'pending_review' };
  },

  // Operaciones de Notificaciones
  getNotifications() { return this.db.notifications; },
  addNotification(n) {
    const item = {
      id: 'notif-' + Date.now(),
      title: n.title || 'Notificación',
      message: n.message || '',
      type: n.type || 'info',
      read: false,
      createdAt: new Date().toISOString()
    };
    this.db.notifications.unshift(item);
    if (this.db.notifications.length > 80) this.db.notifications.pop();
    this.save();
    return item;
  },
  markNotificationsRead() {
    this.db.notifications.forEach(n => n.read = true);
    this.save();
  },

  // Operaciones de Auditoría
  getAuditLog() { return this.db.auditLog; },
  getAuditLogs() { return this.db.auditLog; },
  logAudit(action, details, targetId = null) {
    const session = this.getSession() || {};
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const entry = {
      id: 'aud-' + Date.now(),
      userId: session.userId || 'usr-anon',
      userName: session.name || 'Usuario',
      userRole: session.role || 'aficionado',
      action: (action || 'ACCION_GENERAL').toUpperCase(),
      details: details || '',
      targetId: targetId,
      timestamp: timeStr,
      ip: session.ip || getRandomColombianIp()
    };
    this.db.auditLog.unshift(entry);
    if (this.db.auditLog.length > 250) this.db.auditLog.pop();
    this.save();
    return entry;
  },

  // Exportar / Importar Base de Datos Completa (.JSON)
  exportBackup() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.db, null, 2));
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const fileName = `FootballMasterPro_DB_Backup_${dateStr}.json`;

      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", fileName);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      this.logAudit('EXPORT_BACKUP', `Descargó copia de seguridad completa: ${fileName}`);
      if (typeof showToast === 'function') {
        showToast('Copia de seguridad (.JSON) exportada con éxito', 'success', 3500);
      }
    } catch (e) {
      console.error('Error al exportar backup:', e);
      if (typeof showToast === 'function') showToast('Error al exportar backup', 'error');
    }
  },

  importBackup(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('El archivo no contiene un formato JSON válido.');
      }
      if (!Array.isArray(parsed.tournaments) && !Array.isArray(parsed.users) && !Array.isArray(parsed.venues)) {
        throw new Error('El archivo no corresponde a una base de datos válida de Football Master Pro.');
      }

      const cleaned = fixMojibakeDeep(parsed);
      this.db = {
        users: Array.isArray(cleaned.users) ? cleaned.users : this.db.users,
        currentSession: cleaned.currentSession || this.db.currentSession,
        tournaments: Array.isArray(cleaned.tournaments) ? cleaned.tournaments : this.db.tournaments,
        registrations: Array.isArray(cleaned.registrations) ? cleaned.registrations : this.db.registrations,
        venues: Array.isArray(cleaned.venues) ? cleaned.venues : this.db.venues,
        notifications: Array.isArray(cleaned.notifications) ? cleaned.notifications : this.db.notifications,
        auditLog: Array.isArray(cleaned.auditLog) ? cleaned.auditLog : this.db.auditLog
      };

      this.save();
      this.logAudit('IMPORT_BACKUP', 'Restauró base de datos completa desde archivo .JSON');

      if (typeof loadState === 'function') loadState();
      if (typeof loadUserSession === 'function') loadUserSession();
      if (typeof renderTournamentsListView === 'function') renderTournamentsListView();
      if (typeof renderCanchasView === 'function') renderCanchasView();
      if (typeof renderHomeView === 'function') renderHomeView();
      if (activeTournamentId) {
        if (typeof renderFixturesView === 'function') renderFixturesView();
        if (typeof renderStandingsView === 'function') renderStandingsView();
        if (typeof renderTeamsView === 'function') renderTeamsView();
        if (typeof renderTvMode === 'function') renderTvMode();
      }

      if (typeof showToast === 'function') {
        showToast('¡Base de datos restaurada con éxito! Todos los torneos y datos han sido sincronizados.', 'success', 4500);
      }
    } catch (e) {
      console.error('Error al importar backup:', e);
      if (typeof showToast === 'function') {
        showToast(`Error al restaurar: ${e.message}`, 'error', 4500);
      }
    }
  }
};

window.FMPStore = FMPStore;
FMPStore.init();

// Helpers para colecciones conectados a FMPStore
function getFmpUsers() {
  return FMPStore.getUsers();
}

function getFmpVenues() {
  return FMPStore.getVenues();
}

function saveFmpVenues(venues) {
  FMPStore.db.venues = venues;
  FMPStore.save();
}

function getFmpRegistrations() {
  return FMPStore.getRegistrations();
}

function saveFmpRegistrations(regs) {
  FMPStore.db.registrations = regs;
  FMPStore.save();
}

function getFmpClubRoster() {
  try { return JSON.parse(localStorage.getItem(FMP_KEYS.ROSTER)) || SEED_CLUB_PLAYERS; }
  catch(e) { return SEED_CLUB_PLAYERS; }
}

function saveFmpClubRoster(roster) {
  localStorage.setItem(FMP_KEYS.ROSTER, JSON.stringify(roster));
}

// -----------------------------------------------------------------------------
// AUDITORÍA CENTRALIZADA (Conectada a FMPStore)
// -----------------------------------------------------------------------------
function getAuditLogs() {
  return FMPStore.getAuditLog();
}

function logAudit(action, details, targetId = null) {
  try {
    const entry = (typeof FMPStore !== 'undefined' && FMPStore.logAudit) ? FMPStore.logAudit(action, details, targetId) : null;
    const adminView = document.getElementById('view-admin');
    if (adminView && adminView.classList.contains('active')) {
      if (typeof renderAdminAuditTable === 'function') renderAdminAuditTable();
      if (typeof renderAdminStats === 'function') renderAdminStats();
    }
    return entry;
  } catch(e) {
    console.warn('Advertencia en logAudit:', e);
    return null;
  }
}

// -----------------------------------------------------------------------------
// NOTIFICACIONES EN TIEMPO REAL (Conectadas a FMPStore)
// -----------------------------------------------------------------------------
function getNotifications() {
  return FMPStore.getNotifications();
}

function addNotification({ title, message, type = 'info', linkRoute = null }) {
  const item = FMPStore.addNotification({ title, message, type, linkRoute });
  if (typeof renderNotificationsUI === 'function') renderNotificationsUI();
  if (typeof showToast === 'function') {
    showToast(message, type, 3500);
  }
  return item;
}

function markAllNotificationsAsRead() {
  FMPStore.markNotificationsRead();
  if (typeof renderNotificationsUI === 'function') renderNotificationsUI();
  if (typeof showToast === 'function') {
    showToast('Todas las notificaciones han sido marcadas como leídas', 'info', 2000);
  }
}

function renderNotificationsUI() {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const isLogged = Boolean(session && session.loggedIn && session.userId);
  const badge = document.getElementById('notificationsBadge');
  const notificationsWrap = document.getElementById('notificationsWrap');

  if (!isLogged) {
    if (badge) badge.style.display = 'none';
    if (notificationsWrap) notificationsWrap.style.display = 'none';
    return;
  }

  if (notificationsWrap) {
    notificationsWrap.style.display = 'inline-block';
  }

  const notifs = getNotifications();
  const unreadCount = notifs.filter(n => !n.read).length;
  const listContainer = document.getElementById('notificationsList');

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  if (listContainer) {
    if (notifs.length === 0) {
      listContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #94a3b8; font-size: 0.85rem;">No tienes notificaciones pendientes</div>';
      return;
    }
    listContainer.innerHTML = notifs.map(n => {
      const typeIcons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
      const icon = typeIcons[n.type] || '🔔';
      const readClass = n.read ? 'is-read' : 'is-unread';
      return `
        <div class="notification-item ${readClass}" data-route="${n.linkRoute || ''}" data-id="${n.id}">
          <span class="notif-type-icon">${icon}</span>
          <div class="notif-content-box">
            <h4 class="notif-title">${escapeHtml(n.title)}</h4>
            <p class="notif-desc">${escapeHtml(n.message)}</p>
            <span class="notif-time-ago">${escapeHtml(n.timeAgo || 'Reciente')}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// -----------------------------------------------------------------------------
// CONTROL DE SESIÓN Y ROLES
// -----------------------------------------------------------------------------
var userSession = null; window.userSession = null;

function loadUserSession() {
  try {
    const session = FMPStore.getSession();
    if (session && session.userId && session.loggedIn === true) {
      if (session.role) {
        session.role = normalizeRole(session.role);
      }
      userSession = session;
    } else {
      userSession = null;
      if (typeof FMPStore !== 'undefined' && FMPStore.db && FMPStore.db.currentSession) {
        FMPStore.db.currentSession = null;
      }
    }
  } catch (e) {
    userSession = null;
  }
  updateAuthUI();
  renderNotificationsUI();
}

function saveUserSession(session) {
  if (session && session.role) {
    session.role = normalizeRole(session.role);
  }
  userSession = session;
  if (userSession && userSession.loggedIn) {
    try { localStorage.setItem('fmp_user_explicit_login', 'true'); } catch(e){}
    FMPStore.setSession(userSession);
  } else {
    try { localStorage.removeItem('fmp_user_explicit_login'); } catch(e){}
    FMPStore.clearSession();
  }
  updateAuthUI();
}

function setCurrentUserByRole(roleKey, targetUserId) {
  // Manejo directo de Modo Espectador / Visitante
  if (roleKey === 'guest' || roleKey === 'spectator' || roleKey === 'fan') {
    try {
      sessionStorage.removeItem('fmp_splash_completed');
      sessionStorage.removeItem('fmp_splash_played');
    } catch(e){}
    handleLogout();
    navigateToView('home');
    showToast('Modo Espectador (Visitante Oficial) activado 👁️', 'info', 2500);
    return;
  }

  const users = FMPStore.getUsers();
  let target = null;
  if (targetUserId) {
    target = users.find(u => u.id === targetUserId);
  }
  if (!target) {
    if (roleKey === 'admin') {
      target = users.find(u => normalizeRole(u.role) === 'admin');
    } else if (roleKey === 'organizer' || roleKey === 'organizador') {
      target = targetUserId ? users.find(u => u.id === targetUserId) : users.find(u => u.id === 'usr-org-carlos' || normalizeRole(u.role) === 'organizer');
    } else if (roleKey === 'head_coach' || roleKey === 'coach' || roleKey === 'tecnico') {
      target = users.find(u => u.id === 'usr-coach-yepes' || u.id === 'usr-coach-1' || normalizeRole(u.role) === 'head_coach');
    } else if (roleKey === 'team_coach') {
      target = users.find(u => u.id === 'usr-coach-julian' || normalizeRole(u.role) === 'team_coach');
    } else {
      target = users.find(u => normalizeRole(u.role) === normalizeRole(roleKey));
    }
  }
  if (!target) {
    target = DEMO_USERS.find(u => (targetUserId && u.id === targetUserId) || normalizeRole(u.role) === normalizeRole(roleKey)) || DEMO_USERS[0];
    if (target && !users.some(u => u.id === target.id)) {
      FMPStore.saveUser(target);
    }
  }

  const normRole = normalizeRole(target.role);
  const newSession = {
    userId: target.id,
    name: target.name,
    email: target.email,
    phone: target.phone,
    role: normRole,
    roleTitle: target.roleTitle || 'Usuario',
    loggedIn: true,
    activeTournamentId: activeTournamentId,
    ip: getRandomColombianIp()
  };
  saveUserSession(newSession);
  logAudit('CAMBIO_ROL_RAPIDO', `Cambió al rol de ${newSession.roleTitle} (${newSession.email})`);

  // Redirección y secuencias según el rol RBAC:
  if (normRole === 'admin') {
    try {
      sessionStorage.removeItem('fmp_splash_completed');
      sessionStorage.removeItem('fmp_splash_played');
    } catch(e){}
    navigateToView('admin');
    runDashboardEntranceSequence(true);
  } else if (normRole === 'organizer') {
    try {
      sessionStorage.removeItem('fmp_splash_completed');
      sessionStorage.removeItem('fmp_splash_played');
    } catch(e){}
    navigateToView('organizador');
    runDashboardEntranceSequence(true);
  } else if (normRole === 'head_coach' || normRole === 'team_coach') {
    navigateToView('club');
  } else {
    navigateToView('home');
  }

  showToast(`Sesión activa: ${newSession.name} (${newSession.roleTitle})`, 'success', 2500);
}
window.setCurrentUserByRole = setCurrentUserByRole;

/**
 * Controla la visibilidad contextual del Banner de Vista Pública / Solo Lectura
 * Solo se muestra en clasificacion, calendario, cuadro y equipos para visitantes sin permisos.
 */
function updatePublicModeBannerVisibility() {
  const banner = document.getElementById('publicModeBanner');
  if (!banner) return;

  const currentRoute = getNormalizedRoute();
  const internalTournamentViews = ['clasificacion', 'calendario', 'cuadro', 'equipos'];
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const role = normalizeRole(session?.role || 'guest');
  const isVisitorOrFan = (!session || !session.loggedIn || role === 'fan' || role === 'guest');

  // Solo se muestra dentro del detalle de un torneo cuando el usuario está en modo espectador/visitante
  const shouldShow = (tournamentState.isPublicMode || isVisitorOrFan) && isManagingTournament && internalTournamentViews.includes(currentRoute) && currentRoute !== 'home' && currentRoute !== 'canchas';
  banner.style.display = shouldShow ? 'block' : 'none';
}

function updateAuthUI() {
  const btnHeaderLogin = document.getElementById('btnHeaderLogin');
  const btnAuthHeader = document.getElementById('btnAuthHeader');
  const authBtnText = document.getElementById('authBtnLabel') || document.getElementById('authBtnText');
  const mobileAuthBtnLabel = document.getElementById('mobileAuthBtnLabel');
  const userAvatarBadge = document.getElementById('userAvatarBadge');
  const authIconSvg = document.getElementById('authIconSvg');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  
  const dropdownUserName = document.getElementById('userNameLabel') || document.getElementById('dropdownUserName');
  const dropdownUserRolePill = document.getElementById('userRolePill') || document.getElementById('dropdownUserRolePill');
  const dropdownUserEmail = document.getElementById('userRoleLabel') || document.getElementById('dropdownUserEmail');
  const userRoleActionsList = document.getElementById('userRoleActionsList');
  const userDropdownDemoSection = document.getElementById('userDropdownDemoSection');
  
  const headerNavCenter = document.getElementById('headerNavCenter');
  const headerAdminTitleBadge = document.getElementById('headerAdminTitleBadge');
  const navLinkTorneosText = document.getElementById('navLinkTorneosText');
  const mobileNavLinkTorneosText = document.getElementById('mobileNavLinkTorneosText');
  const btnHeaderCrear = document.getElementById('btnHeaderCrear') || document.querySelector('.btn-create-header');
  const notificationsWrap = document.getElementById('notificationsWrap');
  const notificationsBadge = document.getElementById('notificationsBadge');

  const navCanchasLink = document.getElementById('navCanchasLink');
  const mobileNavCanchasLink = document.getElementById('mobileNavCanchasLink');
  const navCoachLink = document.getElementById('navCoachLink');
  const mobileNavCoachLink = document.getElementById('mobileNavCoachLink');
  const navOrganizerLink = document.getElementById('navOrganizerLink');
  const mobileNavOrganizerLink = document.getElementById('mobileNavOrganizerLink');
  const navAdminLink = document.getElementById('navAdminLink');
  const mobileNavAdminLink = document.getElementById('mobileNavAdminLink');
  const mobileNavCreateLink = document.getElementById('mobileNavCreateLink');
  const mobileBtnCreateNew = document.getElementById('mobileBtnCreateNew');
  const btnMobileLogout = document.getElementById('btnMobileLogout');
  const dropdownLinkCoach = document.getElementById('dropdownLinkCoach');
  const dropdownLinkAdmin = document.getElementById('dropdownLinkAdmin');

  // Limpiar clases de rol del body
  document.body.classList.remove('role-admin', 'role-organizer', 'role-coach', 'role-fan', 'role-guest', 'role-spectator', 'not-logged-in', 'logged-in');

  // Hidratar fecha dinámica de reporte oficial
  const printReportDate = document.getElementById('printReportDate');
  if (printReportDate) {
    printReportDate.textContent = 'Fecha de emisión: ' + new Date().toLocaleDateString('es-CO');
  }

  // Menú de usuario limpio: solo datos fijos y cerrar sesión
  if (userRoleActionsList) {
    userRoleActionsList.innerHTML = '';
    userRoleActionsList.style.display = 'none';
  }
  if (userDropdownDemoSection) {
    userDropdownDemoSection.style.display = 'none';
  }

  const dropdownLogoutDivider = document.getElementById('dropdownLogoutDivider');
  const btnLogoutUser = document.getElementById('btnLogoutUser');

  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const isLogged = Boolean(session && session.loggedIn && session.userId);

  // EVALUAR ESTADOS ESTRICTOS (Matriz de Visibilidad de 5 Estados)
  if (!isLogged) {
    // =========================================================================
    // ESTADO 1A: SIN SESIÓN INICIADA (Visitante Oficial / Modo Espectador)
    // =========================================================================
    document.body.classList.add('role-guest', 'role-spectator', 'not-logged-in');

    // 1. Enlaces visibles en <nav> y móvil: ÚNICAMENTE Inicio, Torneos y Canchas
    if (headerNavCenter) headerNavCenter.style.display = '';
    if (navCanchasLink) navCanchasLink.style.display = 'inline-flex';
    if (mobileNavCanchasLink) mobileNavCanchasLink.style.display = 'flex';

    // 2. Enlaces OCULTOS estrictos
    if (navCoachLink) navCoachLink.style.display = 'none';
    if (mobileNavCoachLink) mobileNavCoachLink.style.display = 'none';
    if (navOrganizerLink) navOrganizerLink.style.display = 'none';
    if (mobileNavOrganizerLink) mobileNavOrganizerLink.style.display = 'none';
    if (navAdminLink) navAdminLink.style.display = 'none';
    if (mobileNavAdminLink) mobileNavAdminLink.style.display = 'none';
    if (btnHeaderCrear) btnHeaderCrear.style.display = 'none';
    if (mobileNavCreateLink) mobileNavCreateLink.style.display = 'none';
    if (mobileBtnCreateNew) mobileBtnCreateNew.style.display = 'none';
    if (headerAdminTitleBadge) headerAdminTitleBadge.style.display = 'none';
    if (dropdownLinkCoach) dropdownLinkCoach.style.display = 'none';
    if (dropdownLinkAdmin) dropdownLinkAdmin.style.display = 'none';

    // 3. Zona derecha: Mostrar "🔑 Iniciar Sesión" y botón circular "👤" (#btnAuthHeader)
    if (btnHeaderLogin) {
      btnHeaderLogin.style.display = 'inline-flex';
    }
    if (btnAuthHeader) {
      btnAuthHeader.style.display = 'inline-flex';
      btnAuthHeader.classList.add('avatar-circle-only');
      btnAuthHeader.title = 'Selector de roles y perfil de usuario';
    }
    if (userAvatarBadge) {
      userAvatarBadge.style.display = 'inline-flex';
      userAvatarBadge.textContent = '👤';
    }
    if (authIconSvg) authIconSvg.style.display = 'none';
    if (authBtnText) {
      authBtnText.style.display = 'none';
      authBtnText.textContent = '';
    }
    if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = '🔑 Iniciar Sesión';

    // Campana de notificaciones OCULTA en modo espectador
    if (notificationsWrap) notificationsWrap.style.display = 'none';
    if (notificationsBadge) notificationsBadge.style.display = 'none';
    if (btnMobileLogout) btnMobileLogout.style.display = 'none';
    
    // Rellenar dinámicamente los 3 spans por defecto para visitante
    if (dropdownUserName) dropdownUserName.textContent = 'Visitante Oficial';
    if (dropdownUserEmail) dropdownUserEmail.textContent = 'Modo Espectador (Solo Lectura)';
    if (dropdownUserRolePill) dropdownUserRolePill.innerHTML = '<span class="user-role-pill role-spectator">🇨🇴 Red FCF Activa</span>';
    if (dropdownLogoutDivider) dropdownLogoutDivider.style.display = 'none';
    if (btnLogoutUser) btnLogoutUser.style.display = 'none';

    if (navLinkTorneosText) navLinkTorneosText.textContent = 'Torneos';
    if (mobileNavLinkTorneosText) mobileNavLinkTorneosText.textContent = 'Torneos';

    // CTA de Hero en Modo Espectador
    const btnHeroCreate = document.getElementById('btnHeroCreate') || document.querySelector('.btn-hero-create');
    if (btnHeroCreate) {
      btnHeroCreate.setAttribute('href', '#/torneos');
      btnHeroCreate.setAttribute('title', 'Explorar torneos oficiales y competiciones en vivo');
      btnHeroCreate.innerHTML = '<span class="explore-icon">⚽</span><span>EXPLORAR TORNEOS EN VIVO</span>';
    }

    filterTournamentTabsByRole('guest');
    applyRoleGuards('guest');

  } else {
    // Usuario Autenticado
    document.body.classList.add('logged-in');
    const role = normalizeRole(session.role || 'fan');
    document.body.classList.add(`role-${role}`);
    if (role === 'fan' || role === 'guest') {
      document.body.classList.add('role-spectator');
    }

    // Ocultar botón de Iniciar Sesión en modo autenticado
    if (btnHeaderLogin) btnHeaderLogin.style.display = 'none';
    if (btnAuthHeader) {
      btnAuthHeader.style.display = 'inline-flex';
      btnAuthHeader.classList.remove('avatar-circle-only');
    }

    const userName = session.name || (role === 'admin' ? 'Carlos Mendoza' : (role === 'coach' ? 'Mario Yepes (DT)' : (role === 'organizer' ? 'Carlos Mendoza' : 'Aficionado')));
    const initials = userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    if (userAvatarBadge) {
      userAvatarBadge.style.display = 'inline-flex';
      userAvatarBadge.textContent = initials;
    }
    if (authIconSvg) authIconSvg.style.display = 'none';
    if (btnMobileLogout) btnMobileLogout.style.display = 'inline-flex';
    if (dropdownUserName) dropdownUserName.textContent = userName;
    if (dropdownUserEmail) dropdownUserEmail.textContent = session.email || (role === 'admin' ? 'admin@futbolmaster.co' : 'usuario@futbolmaster.co');

    if (dropdownUserRolePill) {
      const roleBadges = {
        admin: '<span class="user-role-pill role-admin">👑 Administrador General</span>',
        organizer: '<span class="user-role-pill role-organizer">🏆 Organizador de Torneo</span>',
        head_coach: '<span class="user-role-pill role-coach">📋 Director Técnico / Delegado</span>',
        team_coach: '<span class="user-role-pill role-coach" style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #34d399;">⚽ Técnico del Equipo</span>',
        coach: '<span class="user-role-pill role-coach">📋 Director Técnico / Delegado</span>',
        spectator: '<span class="user-role-pill role-fan">👀 Aficionado / Espectador</span>',
        fan: '<span class="user-role-pill role-fan">👀 Aficionado / Espectador</span>'
      };
      dropdownUserRolePill.innerHTML = roleBadges[role] || '<span class="user-role-pill">🇨🇴 Red FCF Activa</span>';
    }
    if (dropdownLogoutDivider) dropdownLogoutDivider.style.display = 'block';
    if (btnLogoutUser) btnLogoutUser.style.display = 'flex';

    // CTA de Hero según rol
    const btnHeroCreate = document.getElementById('btnHeroCreate') || document.querySelector('.btn-hero-create');
    if (btnHeroCreate) {
      if (role === 'admin' || role === 'organizer') {
        btnHeroCreate.setAttribute('href', '#/crear');
        btnHeroCreate.setAttribute('title', 'Iniciar un nuevo torneo');
        btnHeroCreate.innerHTML = '<span class="plus-icon">+</span><span>CREAR MI TORNEO</span>';
      } else {
        btnHeroCreate.setAttribute('href', '#/torneos');
        btnHeroCreate.setAttribute('title', 'Explorar torneos oficiales y competiciones en vivo');
        btnHeroCreate.innerHTML = '<span class="explore-icon">⚽</span><span>EXPLORAR TORNEOS EN VIVO</span>';
      }
    }

    if (role === 'fan' || role === 'spectator') {
      // =======================================================================
      // ESTADO 1B: ROL AFICIONADO / ESPECTADOR
      // =======================================================================
      // 1. Enlaces visibles en <nav> y móvil: ÚNICAMENTE Inicio, Torneos y Canchas
      if (headerNavCenter) headerNavCenter.style.display = '';
      if (navCanchasLink) navCanchasLink.style.display = 'inline-flex';
      if (mobileNavCanchasLink) mobileNavCanchasLink.style.display = 'flex';

      // 2. Enlaces OCULTOS
      if (navCoachLink) navCoachLink.style.display = 'none';
      if (mobileNavCoachLink) mobileNavCoachLink.style.display = 'none';
      if (navAdminLink) navAdminLink.style.display = 'none';
      if (mobileNavAdminLink) mobileNavAdminLink.style.display = 'none';
      if (btnHeaderCrear) btnHeaderCrear.style.display = 'none';
      if (mobileNavCreateLink) mobileNavCreateLink.style.display = 'none';
      if (mobileBtnCreateNew) mobileBtnCreateNew.style.display = 'none';
      if (headerAdminTitleBadge) headerAdminTitleBadge.style.display = 'none';
      if (dropdownLinkCoach) dropdownLinkCoach.style.display = 'none';
      if (dropdownLinkAdmin) dropdownLinkAdmin.style.display = 'none';

      // 3. Zona derecha: Notificaciones visibles y Perfil del Aficionado
      if (notificationsWrap) notificationsWrap.style.display = 'inline-block';
      if (authBtnText) {
        authBtnText.style.display = 'inline-block';
        authBtnText.textContent = `${userName} • Aficionado`;
      }
      if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = `${userName} • Aficionado`;
      if (navLinkTorneosText) navLinkTorneosText.textContent = 'Torneos';
      if (mobileNavLinkTorneosText) mobileNavLinkTorneosText.textContent = 'Torneos';

    } else if (role === 'head_coach' || role === 'coach') {
      // =======================================================================
      // ESTADO 2A: DIRECTOR TÉCNICO / DELEGADO
      // =======================================================================
      // 1. Enlaces visibles en <nav> y móvil: Inicio, Torneos, Canchas y Mi Club
      if (headerNavCenter) headerNavCenter.style.display = '';
      if (navCanchasLink) navCanchasLink.style.display = 'inline-flex';
      if (mobileNavCanchasLink) mobileNavCanchasLink.style.display = 'flex';
      if (navCoachLink) navCoachLink.style.display = 'inline-flex';
      if (mobileNavCoachLink) mobileNavCoachLink.style.display = 'flex';
      if (dropdownLinkCoach) dropdownLinkCoach.style.display = 'flex';

      // 2. Enlaces OCULTOS
      if (navAdminLink) navAdminLink.style.display = 'none';
      if (mobileNavAdminLink) mobileNavAdminLink.style.display = 'none';
      if (btnHeaderCrear) btnHeaderCrear.style.display = 'none';
      if (mobileNavCreateLink) mobileNavCreateLink.style.display = 'none';
      if (mobileBtnCreateNew) mobileBtnCreateNew.style.display = 'none';
      if (headerAdminTitleBadge) headerAdminTitleBadge.style.display = 'none';
      if (dropdownLinkAdmin) dropdownLinkAdmin.style.display = 'none';

      // 3. Zona derecha: Notificaciones visibles y Perfil del DT
      if (notificationsWrap) notificationsWrap.style.display = 'inline-block';
      if (authBtnText) {
        authBtnText.style.display = 'inline-block';
        authBtnText.textContent = `${userName} • Delegado DT`;
      }
      if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = `${userName} • Delegado DT`;
      if (navLinkTorneosText) navLinkTorneosText.textContent = 'Mis Torneos';
      if (mobileNavLinkTorneosText) mobileNavLinkTorneosText.textContent = 'Mis Torneos';

    } else if (role === 'team_coach') {
      // =======================================================================
      // ESTADO 2B: TÉCNICO DEL EQUIPO (PERFIL DEPORTIVO)
      // =======================================================================
      // 1. Enlaces visibles en <nav> y móvil: Inicio, Torneos, Canchas y Mi Club
      if (headerNavCenter) headerNavCenter.style.display = '';
      if (navCanchasLink) navCanchasLink.style.display = 'inline-flex';
      if (mobileNavCanchasLink) mobileNavCanchasLink.style.display = 'flex';
      if (navCoachLink) navCoachLink.style.display = 'inline-flex';
      if (mobileNavCoachLink) mobileNavCoachLink.style.display = 'flex';
      if (dropdownLinkCoach) dropdownLinkCoach.style.display = 'flex';

      // 2. Enlaces OCULTOS
      if (navAdminLink) navAdminLink.style.display = 'none';
      if (mobileNavAdminLink) mobileNavAdminLink.style.display = 'none';
      if (btnHeaderCrear) btnHeaderCrear.style.display = 'none';
      if (mobileNavCreateLink) mobileNavCreateLink.style.display = 'none';
      if (mobileBtnCreateNew) mobileBtnCreateNew.style.display = 'none';
      if (headerAdminTitleBadge) headerAdminTitleBadge.style.display = 'none';
      if (dropdownLinkAdmin) dropdownLinkAdmin.style.display = 'none';

      // 3. Zona derecha: Notificaciones visibles y Perfil del Técnico
      if (notificationsWrap) notificationsWrap.style.display = 'inline-block';
      if (authBtnText) {
        authBtnText.style.display = 'inline-block';
        authBtnText.textContent = `${userName} • Técnico Equipo`;
      }
      if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = `${userName} • Técnico Equipo`;
      if (navLinkTorneosText) navLinkTorneosText.textContent = 'Torneos';
      if (mobileNavLinkTorneosText) mobileNavLinkTorneosText.textContent = 'Torneos';

    } else if (role === 'organizer') {
      // =======================================================================
      // ESTADO 3: ORGANIZADOR DE TORNEO
      // =======================================================================
      // 1. Enlaces visibles en <nav> y móvil: Inicio, Torneos, Canchas y Mis Torneos (Organizador)
      if (headerNavCenter) headerNavCenter.style.display = '';
      if (navCanchasLink) navCanchasLink.style.display = 'inline-flex';
      if (mobileNavCanchasLink) mobileNavCanchasLink.style.display = 'flex';
      if (navOrganizerLink) navOrganizerLink.style.display = 'inline-flex';
      if (mobileNavOrganizerLink) mobileNavOrganizerLink.style.display = 'flex';
      if (navAdminLink) navAdminLink.style.display = 'none';
      if (mobileNavAdminLink) mobileNavAdminLink.style.display = 'none';

      // 2. Enlaces OCULTOS
      if (navCoachLink) navCoachLink.style.display = 'none';
      if (mobileNavCoachLink) mobileNavCoachLink.style.display = 'none';
      if (headerAdminTitleBadge) headerAdminTitleBadge.style.display = 'none';
      if (dropdownLinkCoach) dropdownLinkCoach.style.display = 'none';
      if (dropdownLinkAdmin) dropdownLinkAdmin.style.display = 'none';

      // 3. Zona derecha: Botón + Nuevo Torneo, Notificaciones y Perfil
      if (btnHeaderCrear) {
        btnHeaderCrear.style.display = 'inline-flex';
        const t = document.getElementById('btnHeaderCrearText');
        if (t) t.textContent = '+ Nuevo Torneo';
      }
      if (mobileNavCreateLink) mobileNavCreateLink.style.display = 'flex';
      if (mobileBtnCreateNew) mobileBtnCreateNew.style.display = 'flex';
      if (notificationsWrap) notificationsWrap.style.display = 'inline-block';
      if (authBtnText) {
        authBtnText.style.display = 'inline-block';
        authBtnText.textContent = `${userName} • Organizador`;
      }
      if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = `${userName} • Organizador`;
      if (navLinkTorneosText) navLinkTorneosText.textContent = 'Mis Torneos';
      if (mobileNavLinkTorneosText) mobileNavLinkTorneosText.textContent = 'Mis Torneos';

    } else if (role === 'admin') {
      // =======================================================================
      // ESTADO 4: ADMINISTRADOR GENERAL
      // =======================================================================
      // 1. Ocultar la cápsula <nav> completa
      if (headerNavCenter) headerNavCenter.style.display = 'none';

      // 2. Mostrar badge central exclusivo
      if (headerAdminTitleBadge) headerAdminTitleBadge.style.display = 'inline-flex';

      // 3. Zona derecha: Botón + Nuevo Torneo, Notificaciones y Perfil del Admin
      if (btnHeaderCrear) {
        btnHeaderCrear.style.display = 'inline-flex';
        const t = document.getElementById('btnHeaderCrearText');
        if (t) t.textContent = '+ Nuevo Torneo';
      }
      if (mobileNavCreateLink) mobileNavCreateLink.style.display = 'flex';
      if (mobileBtnCreateNew) mobileBtnCreateNew.style.display = 'flex';
      if (notificationsWrap) notificationsWrap.style.display = 'inline-block';
      if (authBtnText) {
        authBtnText.style.display = 'inline-block';
        authBtnText.textContent = `${userName} • Administrador`;
      }
      if (mobileAuthBtnLabel) mobileAuthBtnLabel.textContent = `${userName} • Administrador`;

      // Redirección automática a #/admin
      const curR = getNormalizedRoute();
      if (curR !== 'admin') {
        setTimeout(() => navigateToView('admin', true), 40);
      }
    }

    filterTournamentTabsByRole(role);
    applyRoleGuards(role);
  }

  updatePublicModeBannerVisibility();
  renderNotificationsUI();
  setTimeout(updateAllSlideTabs, 40);
}

/**
 * Filtra las pestañas del torneo activo en el Navbar según el rol
 */
function filterTournamentTabsByRole(role) {
  const isPrivileged = (role === 'admin' || role === 'organizer');

  // Herramientas y Solicitudes solo para organizador/admin
  const herramientasLink = document.querySelector('.header-nav-center .nav-link[data-route="herramientas"]');
  const solicitudesLink = document.getElementById('navSolicitudesLink') || document.querySelector('.header-nav-center .nav-link[data-route="solicitudes"]');
  const equiposLink = document.querySelector('.header-nav-center .nav-link[data-route="equipos"]');

  if (herramientasLink) herramientasLink.style.display = isPrivileged ? '' : 'none';
  if (solicitudesLink) solicitudesLink.style.display = isPrivileged ? '' : 'none';
  if (equiposLink) equiposLink.style.display = isPrivileged ? '' : 'none';
}

function applyRoleGuards(role) {
  const norm = normalizeRole(role);
  // Cuando es 'spectator' o 'fan', deshabilitamos la edición de resultados en el calendario
  const isReadOnly = (norm === 'spectator' || norm === 'fan' || norm === 'guest');
  const scoreInputs = document.querySelectorAll('.score-input, .input-score');
  scoreInputs.forEach(input => {
    input.disabled = isReadOnly;
    input.title = isReadOnly ? 'Modo Aficionado: Solo lectura de marcadores' : '';
  });

  // Guardias específicas en #/club para team_coach vs head_coach
  const btnEditClub = document.getElementById('btnOpenEditCoachClub');
  const btnPlanillaPdf = document.getElementById('btnOpenPlanillaPdfModal');
  const isTeamCoachUser = (norm === 'team_coach');

  if (btnEditClub) {
    if (isTeamCoachUser) {
      btnEditClub.disabled = true;
      btnEditClub.title = 'Solo Director Técnico: La edición institucional del club está reservada al DT Delegado';
      btnEditClub.style.opacity = '0.5';
      btnEditClub.style.cursor = 'not-allowed';
    } else {
      btnEditClub.disabled = false;
      btnEditClub.title = '';
      btnEditClub.style.opacity = '';
      btnEditClub.style.cursor = '';
    }
  }

  if (btnPlanillaPdf) {
    if (isTeamCoachUser) {
      btnPlanillaPdf.disabled = true;
      btnPlanillaPdf.title = 'Solo Director Técnico: Generación de planilla oficial reservada al DT Delegado';
      btnPlanillaPdf.style.opacity = '0.5';
      btnPlanillaPdf.style.cursor = 'not-allowed';
    } else {
      btnPlanillaPdf.disabled = false;
      btnPlanillaPdf.title = '';
      btnPlanillaPdf.style.opacity = '';
      btnPlanillaPdf.style.cursor = '';
    }
  }

  // Deshabilitar botones de postulación a torneos para team_coach
  document.querySelectorAll('.btn-coach-apply, [onclick*="openTournamentApplicationModal"]').forEach(btn => {
    if (isTeamCoachUser) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.title = 'Solo Director Técnico: La postulación y comprobante de pago están reservados al DT Delegado';
    } else {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
      btn.title = '';
    }
  });
}

let isAuthModeSwitching = false;

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) {
      btn.innerHTML = '<svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
    }
  } else {
    input.type = 'password';
    if (btn) {
      btn.innerHTML = '<svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    }
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

function selectRegisterRole(role) {
  const input = document.getElementById('regRole');
  if (input) input.value = role;
  document.querySelectorAll('.role-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-role') === role);
  });
}
window.selectRegisterRole = selectRegisterRole;

let authMode = 'login';
window.authMode = authMode;
let isSignUp = false;
window.isSignUp = isSignUp;

function setAuthMode(targetMode) {
  switchAuthMode(targetMode);
}
window.setAuthMode = setAuthMode;

function pulseHudCorners() {
  const tl = document.querySelector('.hud-corner-tl');
  const br = document.querySelector('.hud-corner-br');
  if (tl) {
    tl.style.animation = 'none';
    void tl.offsetWidth; // forzar reflow
    tl.style.animation = 'hudCornerOpen 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards';
  }
  if (br) {
    br.style.animation = 'none';
    void br.offsetWidth; // forzar reflow
    br.style.animation = 'hudCornerOpen 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards';
  }
}
window.pulseHudCorners = pulseHudCorners;

function restartStaggerAnimations(container) {
  if (!container) return;
  const children = container.querySelectorAll('.auth-form-content > *');
  children.forEach(c => {
    c.style.animation = 'none';
    void c.offsetWidth; // forzar reflow
    c.style.animation = '';
  });
}
window.restartStaggerAnimations = restartStaggerAnimations;

function switchAuthMode(targetMode) {
  if (isAuthModeSwitching) return;
  isAuthModeSwitching = true;

  const paneLogin = document.getElementById('auth-login-pane');
  const paneRegister = document.getElementById('auth-register-pane');
  const badge = document.getElementById('glassyMorphBadge');
  const wrapper = document.getElementById('glassyV3Wrapper');

  if (!paneLogin || !paneRegister) {
    isAuthModeSwitching = false;
    return;
  }

  const isToRegister = (targetMode === 'register' || targetMode === 'signup' || targetMode === 'auth-register-pane');
  const nextMode = isToRegister ? 'signup' : 'login';
  authMode = nextMode;
  window.authMode = nextMode;
  isSignUp = isToRegister;
  window.isSignUp = isSignUp;

  const currentPane = isToRegister ? paneLogin : paneRegister;
  const nextPane = isToRegister ? paneRegister : paneLogin;

  // Paso 1 (0ms - 180ms): Los campos actuales se desvanecen (opacity: 0; scale: 0.95) y la tarjeta ajusta altura
  currentPane.classList.add('is-exiting');
  if (wrapper) {
    wrapper.classList.toggle('mode-signup', isToRegister);
    wrapper.classList.toggle('mode-login', !isToRegister);
    wrapper.classList.toggle('mode-signin', !isToRegister);
  }

  setTimeout(() => {
    // Paso 2 (180ms - 480ms / duración 300ms):
    // Se oculta el formulario previo y se muestra el badge de cristal Cyan con shimmer y giro diagonal
    currentPane.classList.add('is-hidden');
    currentPane.classList.remove('is-exiting');

    pulseHudCorners();
    if (badge) {
      badge.style.animation = 'none';
      void badge.offsetWidth;
      badge.style.animation = '';
      badge.classList.remove('is-exiting');
      badge.classList.add('active');
    }

    setTimeout(() => {
      // Paso 3 (480ms - 750ms):
      // El badge central desaparece y los campos del nuevo formulario entran en cascada con retardos de 0.05s
      if (badge) {
        badge.classList.remove('active');
      }

      nextPane.classList.remove('is-hidden');
      restartStaggerAnimations(nextPane);
      pulseHudCorners();

      setTimeout(() => {
        isAuthModeSwitching = false;
      }, 270);
    }, 300);
  }, 180);
}
window.switchAuthMode = switchAuthMode;

function openAuthModal(defaultTab = 'auth-login-pane') {
  const modal = document.getElementById('authModalOverlay');
  if (!modal) return;
  modal.classList.add('active');
  modal.style.setProperty('display', 'flex', 'important');
  document.body.classList.add('auth-modal-open');

  // Limpiar campos de login para evitar precargas indeseadas
  const inputUser = document.getElementById('authUserName');
  const inputPass = document.getElementById('authUserPassword');
  if (inputUser) inputUser.value = '';
  if (inputPass) inputPass.value = '';

  const paneLogin = document.getElementById('auth-login-pane');
  const paneRegister = document.getElementById('auth-register-pane');
  const badge = document.getElementById('glassyMorphBadge');
  const wrapper = document.getElementById('glassyV3Wrapper');
  if (badge) badge.classList.remove('active', 'is-exiting');
  isAuthModeSwitching = false;

  const isToRegister = (defaultTab === 'auth-register-pane' || defaultTab === 'register' || defaultTab === 'signup');
  const currentMode = isToRegister ? 'signup' : 'login';
  authMode = currentMode;
  window.authMode = currentMode;
  isSignUp = isToRegister;
  window.isSignUp = isSignUp;

  if (wrapper) {
    wrapper.classList.toggle('mode-signup', isToRegister);
    wrapper.classList.toggle('mode-login', !isToRegister);
    wrapper.classList.toggle('mode-signin', !isToRegister);
  }

  pulseHudCorners();
  if (isToRegister) {
    if (paneRegister) {
      paneRegister.classList.remove('is-hidden', 'is-exiting');
      restartStaggerAnimations(paneRegister);
    }
    if (paneLogin) paneLogin.classList.add('is-hidden');
  } else {
    if (paneLogin) {
      paneLogin.classList.remove('is-hidden', 'is-exiting');
      restartStaggerAnimations(paneLogin);
    }
    if (paneRegister) paneRegister.classList.add('is-hidden');
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    modal.style.setProperty('display', 'none', 'important');
    document.body.classList.remove('auth-modal-open');
  }
  const inputUser = document.getElementById('authUserName');
  const inputPass = document.getElementById('authUserPassword');
  if (inputUser) inputUser.value = '';
  if (inputPass) inputPass.value = '';
  const badge = document.getElementById('glassyMorphBadge');
  if (badge) badge.classList.remove('active', 'is-exiting');
  isAuthModeSwitching = false;
}

// Exposición Global Inmediata para Garantizar Clics desde Cualquier Contexto
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;

function initAuthControls() {
  const btnAuthHeader = document.getElementById('btnAuthHeader');
  const btnMobileAuth = document.getElementById('btnMobileAuth');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const authModalOverlay = document.getElementById('authModalOverlay');

  const tabBtnLogin = document.getElementById('tabBtnLogin');
  const tabBtnRegister = document.getElementById('tabBtnRegister');
  const paneLogin = document.getElementById('auth-login-pane');
  const paneRegister = document.getElementById('auth-register-pane');

  // Alternar pestañas en el Modal con sincronización del cursor deslizante
  if (tabBtnLogin && tabBtnRegister) {
    tabBtnLogin.addEventListener('click', () => {
      tabBtnLogin.classList.add('active');
      tabBtnRegister.classList.remove('active');
      paneLogin?.classList.add('active');
      paneRegister?.classList.remove('active');
      const authTabs = document.getElementById('authModalTabs') || document.querySelector('.auth-modal-tabs');
      if (authTabs && typeof authTabs._updateSlideCursor === 'function') {
        authTabs._updateSlideCursor();
      }
    });
    tabBtnRegister.addEventListener('click', () => {
      tabBtnRegister.classList.add('active');
      tabBtnLogin.classList.remove('active');
      paneRegister?.classList.add('active');
      paneLogin?.classList.remove('active');
      const authTabs = document.getElementById('authModalTabs') || document.querySelector('.auth-modal-tabs');
      if (authTabs && typeof authTabs._updateSlideCursor === 'function') {
        authTabs._updateSlideCursor();
      }
    });
  }

let lastUserDropdownToggleTime = 0;
function toggleUserDropdownMenu(e) {
  if (e) {
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
    if (typeof e.preventDefault === 'function') e.preventDefault();
  }
  const now = Date.now();
  if (now - lastUserDropdownToggleTime < 120) return;
  lastUserDropdownToggleTime = now;

  const menu = document.getElementById('userDropdownMenu');
  if (!menu) return;
  const isVis = menu.style.display === 'block' || menu.classList.contains('active');
  if (isVis) {
    menu.style.display = 'none';
    menu.classList.remove('active');
  } else {
    menu.style.display = 'block';
    menu.classList.add('active');
  }
}
window.toggleUserDropdownMenu = toggleUserDropdownMenu;

window.quickFillAndLogin = function(email, pass, role) {
  const inputUser = document.getElementById('authUserName');
  const inputPass = document.getElementById('authUserPassword');
  if (inputUser) inputUser.value = email;
  if (inputPass) inputPass.value = pass;
  
  if (role) {
    let targetUserId = null;
    if (email && email.includes('laura')) targetUserId = 'usr-org-laura';
    else if (email && (email.includes('carlos') || email.includes('organizador'))) targetUserId = 'usr-org-carlos';
    else if (email && email.includes('boada')) targetUserId = 'usr-admin-1';
    else if (email && email.includes('tecnico')) targetUserId = 'usr-coach-yepes';

    if (typeof setCurrentUserByRole === 'function') {
      setCurrentUserByRole(role, targetUserId);
    }
    if (typeof closeAuthModal === 'function') {
      closeAuthModal();
    }
    if (typeof showToast === 'function') {
      const titles = { admin: 'Administrador General', organizer: 'Organizador', coach: 'Delegado DT', head_coach: 'Director Técnico', team_coach: 'Técnico del Equipo' };
      showToast(`¡Sesión iniciada como ${titles[role] || role}!`, 'success', 2500);
    }
    if (typeof navigateToView === 'function') {
      if (role === 'admin') navigateToView('admin');
      else if (role === 'organizer') navigateToView('organizador');
      else if (role === 'coach' || role === 'head_coach' || role === 'team_coach') navigateToView('club');
      else navigateToView('home');
    }
  }
};

  // Clic en Header Auth / Avatar
  if (btnAuthHeader) {
    btnAuthHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleUserDropdownMenu(e);
    });
  }

  if (btnMobileAuth) {
    btnMobileAuth.addEventListener('click', (e) => {
      if (dom.mobileNavDrawer) dom.mobileNavDrawer.style.display = 'none';
      toggleUserDropdownMenu(e);
    });
  }

  // Campana de Notificaciones
  const btnNotificationsBell = document.getElementById('btnNotificationsBell');
  const notificationsDropdownMenu = document.getElementById('notificationsDropdownMenu');
  const btnMarkAllNotificationsRead = document.getElementById('btnMarkAllNotificationsRead');

  if (btnNotificationsBell) {
    btnNotificationsBell.addEventListener('click', (e) => {
      e.stopPropagation();
      if (notificationsDropdownMenu) {
        const isVis = notificationsDropdownMenu.style.display === 'block';
        notificationsDropdownMenu.style.display = isVis ? 'none' : 'block';
        if (!isVis) renderNotificationsUI();
      }
    });
  }

  if (btnMarkAllNotificationsRead) {
    btnMarkAllNotificationsRead.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllNotificationsAsRead();
    });
  }

  // Cerrar menús al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (userDropdownMenu && !e.target.closest('#userAuthWrap')) {
      userDropdownMenu.style.display = 'none';
    }
    if (notificationsDropdownMenu && !e.target.closest('#notificationsWrap')) {
      notificationsDropdownMenu.style.display = 'none';
    }
  });

  if (btnCloseAuthModal) {
    btnCloseAuthModal.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAuthModal();
    });
  }
  if (authModalOverlay) {
    authModalOverlay.addEventListener('click', (e) => {
      if (e.target === authModalOverlay) {
        e.preventDefault();
        closeAuthModal();
      }
    });

    // Cerrar modal al presionar la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        const modal = document.getElementById('authModalOverlay');
        if (modal && (modal.classList.contains('active') || modal.style.display === 'flex')) {
          closeAuthModal();
        }
      }
    });

    // Fondo con Movimiento Autónomo Continuo 100% CSS (Desacoplado del mouse para fluidez nativa iOS)
    const mercuryBlobs = document.querySelectorAll('.mercury-blob, .stage .blob, .blobs-gooey-layer .blob');
    if (mercuryBlobs.length > 0) {
      mercuryBlobs.forEach(blob => {
        blob.style.marginLeft = '0px';
        blob.style.marginTop = '0px';
      });
    }
  }

  // Selección de Rol Exclusiva para Formulario de Registro (Crear Cuenta)
  const regRoleButtons = document.querySelectorAll('.quick-roles-grid .btn-quick-role');
  regRoleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      regRoleButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const roleKey = btn.getAttribute('data-register-role') || btn.getAttribute('data-demo-role') || 'organizer';
      const regRole = document.getElementById('regRole');
      if (regRole) {
        regRole.value = roleKey;
        regRole.classList.add('has-value');
      }
      const roleLabels = { organizer: 'Organizador', coach: 'Director Técnico', fan: 'Aficionado' };
      if (typeof showToast === 'function') {
        showToast(`Rol de registro seleccionado: ${roleLabels[roleKey] || roleKey}`, 'info', 2000);
      }
    });
  });

  // Sincronizar estilo visual has-value del selector de rol principal
  const regRoleSelect = document.getElementById('regRole');
  if (regRoleSelect) {
    regRoleSelect.addEventListener('change', () => {
      if (regRoleSelect.value) {
        regRoleSelect.classList.add('has-value');
      } else {
        regRoleSelect.classList.remove('has-value');
      }
    });
  }

  // Switcher rápido de Roles dentro del User Dropdown
  document.querySelectorAll('.btn-role-switch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const role = btn.getAttribute('data-role');
      if (role) setCurrentUserByRole(role);
      if (userDropdownMenu) userDropdownMenu.style.display = 'none';
    });
  });

  // Switcher de rol para la propia cuenta activa del usuario
  document.querySelectorAll('.btn-self-role-switch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newRole = btn.getAttribute('data-switch-my-role');
      if (!newRole) return;
      const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
      if (!session || !session.loggedIn) {
        showToast('Inicia sesión para cambiar el rol de tu cuenta', 'warning');
        return;
      }
      const roleTitles = {
        admin: 'Administrador General',
        organizer: 'Organizador de Torneo',
        coach: 'Director Técnico / Delegado',
        fan: 'Aficionado / Visitante'
      };
      session.role = normalizeRole(newRole);
      session.roleTitle = roleTitles[session.role] || 'Organizador de Torneo';
      saveUserSession(session);
      if (typeof FMPStore !== 'undefined' && FMPStore.saveUser) {
        const u = FMPStore.getUserById(session.userId);
        if (u) {
          u.role = session.role;
          u.roleTitle = session.roleTitle;
          FMPStore.saveUser(u);
        }
      }
      if (userDropdownMenu) userDropdownMenu.style.display = 'none';
      showToast(`¡Rol de tu cuenta actualizado a ${session.roleTitle}!`, 'success', 3000);
      if (session.role === 'coach') navigateToView('club');
      else if (session.role === 'organizer') navigateToView('crear');
      else navigateToView('home');
    });
  });

  // Formulario de Iniciar Sesión Tradicional
  const authLoginForm = document.getElementById('authLoginForm');
  if (authLoginForm) {
    authLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userInput = (document.getElementById('authUserName')?.value || '').trim().toLowerCase();
      const passInput = document.getElementById('authUserPassword')?.value || '';

      // Credenciales Maestras del Administrador General (Punto 3)
      if (userInput === 'boadasaidert466@gmail.com' && passInput === '123Sai') {
        const adminSession = {
          userId: 'usr-admin-1',
          name: 'Saider Boadas',
          email: 'boadasaidert466@gmail.com',
          phone: '+57 310 445 8899',
          role: 'admin',
          roleTitle: 'Administrador General',
          activeTournamentId: activeTournamentId,
          loggedIn: true,
          ip: getRandomColombianIp()
        };
        saveUserSession(adminSession);
        logAudit('INICIO_SESION_ADMIN', `Administrador General autenticado exitosamente (${adminSession.email})`);
        try {
          sessionStorage.removeItem('fmp_splash_completed');
          sessionStorage.removeItem('fmp_splash_played');
        } catch(e){}
        closeAuthModal();
        showToast('¡Bienvenido Administrador General Saider Boadas!', 'success', 2500);
        navigateToView('admin');
        if (getNormalizedRoute() === 'admin') {
          runDashboardEntranceSequence(true);
        }
        return;
      }

      if (userInput === 'admin@futbolmaster.co') {
        showToast('Credenciales no válidas. El acceso de demostración anterior ha sido desactivado.', 'error', 3500);
        return;
      }

      const users = FMPStore.getUsers();
      const matched = users.find(u => 
        (u.email && u.email.toLowerCase() === userInput && (!u.password || u.password === passInput)) || 
        (u.name && u.name.toLowerCase() === userInput && (!u.password || u.password === passInput)) ||
        (userInput === 'organizador@futbolmaster.co' && u.id === 'usr-org-carlos' && (!u.password || u.password === passInput))
      ) || DEMO_USERS.find(u => 
        (u.email && u.email.toLowerCase() === userInput && (!u.password || u.password === passInput)) ||
        (userInput === 'organizador@futbolmaster.co' && u.id === 'usr-org-carlos' && (!u.password || u.password === passInput))
      );

      if (matched) {
        const sessionData = {
          userId: matched.id,
          name: matched.name,
          email: matched.email,
          phone: matched.phone,
          role: matched.role,
          roleTitle: matched.roleTitle || 'Usuario',
          activeTournamentId: activeTournamentId,
          loggedIn: true,
          ip: getRandomColombianIp()
        };
        saveUserSession(sessionData);
        logAudit('INICIO_SESION', `Inició sesión con éxito (${matched.email})`);
        closeAuthModal();
        showToast(`¡Bienvenido de nuevo, ${matched.name}!`, 'success', 2500);
        const normRole = normalizeRole(matched.role);
        if (normRole === 'admin') {
          try {
            sessionStorage.removeItem('fmp_splash_completed');
            sessionStorage.removeItem('fmp_splash_played');
          } catch(e){}
          navigateToView('admin');
          if (getNormalizedRoute() === 'admin') {
            runDashboardEntranceSequence(true);
          }
        } else if (normRole === 'organizer') {
          try {
            sessionStorage.removeItem('fmp_splash_completed');
            sessionStorage.removeItem('fmp_splash_played');
          } catch(e){}
          navigateToView('organizador');
          if (getNormalizedRoute() === 'organizador') {
            runDashboardEntranceSequence(true);
          }
        } else if (isCoachRole(normRole)) {
          navigateToView('club');
        } else {
          navigateToView('home');
        }
      } else {
        showToast('Usuario o contraseña incorrectos. Si no tienes cuenta, completa tu registro.', 'warning', 3500);
      }
    });
  }

  // Formulario de Registro con Verificación de Correo (Ley 1581 Habeas Data)
  const authRegisterForm = document.getElementById('authRegisterForm');
  if (authRegisterForm) {
    authRegisterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = (document.getElementById('regFullName')?.value || '').trim();
      const email = (document.getElementById('regEmail')?.value || '').trim().toLowerCase();
      const phone = (document.getElementById('regPhone')?.value || '').trim();
      const roleVal = document.getElementById('regRole')?.value;
      if (!roleVal) {
        showToast('Por favor selecciona tu rol principal para el registro', 'warning', 3500);
        document.getElementById('regRole')?.focus();
        return;
      }
      const role = roleVal;
      const clubName = (document.getElementById('regClubName')?.value || '').trim();
      const pass = document.getElementById('regPassword')?.value || '';
      const passConfirm = document.getElementById('regPasswordConfirm')?.value || '';
      const habeasConsent = document.getElementById('regHabeasData')?.checked;

      if (!habeasConsent) {
        showToast('Debe autorizar el tratamiento de datos (Ley 1581) para continuar', 'error', 3500);
        return;
      }

      // Validación estricta de correo real
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showToast('Ingresa un correo electrónico válido (ej: usuario@dominio.com)', 'warning', 3500);
        return;
      }

      // Validación de contraseña
      if (pass.length < 6 && pass !== '123Sai') {
        showToast('La contraseña debe tener mínimo 6 caracteres', 'warning', 3000);
        return;
      }

      if (pass !== passConfirm) {
        showToast('Las contraseñas no coinciden', 'error', 3000);
        return;
      }

      // Bloquear intento de registrarse como admin
      if (role === 'admin') {
        showToast('No está permitido registrarse como Administrador desde el formulario público', 'error', 3500);
        return;
      }

      // Validar si el correo ya existe en FMPStore
      const existing = FMPStore.getUserByEmail(email);
      if (existing) {
        showToast('Ya existe una cuenta registrada con este correo electrónico', 'error', 3500);
        return;
      }

      const roleTitles = {
        admin: 'Administrador General',
        organizer: 'Organizador de Torneo',
        organizador: 'Organizador de Torneo',
        coach: 'Director Técnico / Delegado',
        tecnico: 'Director Técnico / Delegado',
        fan: 'Aficionado / Visitante',
        aficionado: 'Aficionado / Visitante'
      };

      const canonicalRole = normalizeRole(role);
      const newUser = {
        id: 'usr-' + Date.now(),
        name: fullName,
        email: email,
        phone: phone,
        password: pass,
        role: canonicalRole,
        roleTitle: roleTitles[canonicalRole] || 'Organizador de Torneo',
        clubName: clubName || 'Club Deportivo',
        habeasDataConsent: true,
        createdAt: new Date().toISOString()
      };

      const sessionData = {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: canonicalRole,
        roleTitle: newUser.roleTitle,
        activeTournamentId: activeTournamentId,
        loggedIn: true,
        ip: getRandomColombianIp()
      };

      // Paso de Verificación de Correo interactivo
      const verifyStep = document.getElementById('authVerificationStep');
      const verifyHint = document.getElementById('verificationHintText');
      const verifyCodeInput = document.getElementById('regVerifyCodeInput');
      const btnConfirmCode = document.getElementById('btnConfirmEmailCode');

      const securityCode = Math.floor(100000 + Math.random() * 900000).toString();
      authRegisterForm._pendingRegistration = { user: newUser, session: sessionData, code: securityCode };

      if (verifyStep) {
        verifyStep.style.display = 'block';
        if (verifyHint) {
          verifyHint.innerHTML = `Código de verificación enviado a <strong>${escapeHtml(email)}</strong>.<br>Código generado para pruebas: <strong style="color: #34d399; font-size: 1.1rem; letter-spacing: 2px;">${securityCode}</strong>`;
        }
        showToast(`Código de verificación enviado a ${email}: ${securityCode}`, 'info', 4500);
        if (verifyCodeInput) {
          verifyCodeInput.value = securityCode;
          verifyCodeInput.focus();
        }

        if (btnConfirmCode && !btnConfirmCode._hasBound) {
          btnConfirmCode._hasBound = true;
          btnConfirmCode.addEventListener('click', () => {
            const pending = authRegisterForm._pendingRegistration;
            if (!pending) return;
            const inputVal = (document.getElementById('regVerifyCodeInput')?.value || '').trim();
            if (inputVal === pending.code || inputVal === '123456' || inputVal.length === 6) {
              FMPStore.saveUser(pending.user);
              saveUserSession(pending.session);
              logAudit('REGISTRO_USUARIO', `Se registró cuenta oficial y verificó correo para ${pending.user.name} (${pending.user.email})`);
              addNotification({
                title: '¡Cuenta creada y verificada con éxito!',
                message: `Bienvenido a Fútbol Master Pro, ${pending.user.name}. Tu cuenta está activa.`,
                type: 'success',
                linkRoute: 'torneos'
              });
              closeAuthModal();
              showToast(`¡Cuenta registrada y verificada con éxito! Bienvenido ${pending.user.name}`, 'success', 3000);
              verifyStep.style.display = 'none';
              authRegisterForm.reset();
              authRegisterForm._pendingRegistration = null;
              if (pending.user.role === 'coach' || pending.user.role === 'tecnico') navigateToView('torneos');
              else navigateToView('home');
            } else {
              showToast('Código de verificación incorrecto.', 'error', 3000);
            }
          });
        }
      } else {
        FMPStore.saveUser(newUser);
        saveUserSession(sessionData);
        closeAuthModal();
        showToast(`¡Cuenta registrada exitosamente! Bienvenido ${fullName}`, 'success', 3000);
      }
    });
  }

// Cerrar Sesión Universal y Definitivo
  const btnLogoutUser = document.getElementById('btnLogoutUser');
  if (btnLogoutUser) {
    btnLogoutUser.addEventListener('click', window.handleLogout);
  }
  const btnAdminDirectLogout = document.getElementById('btnAdminDirectLogout');
  if (btnAdminDirectLogout) {
    btnAdminDirectLogout.addEventListener('click', window.handleLogout);
  }
  const btnMobileLogout = document.getElementById('btnMobileLogout');
  if (btnMobileLogout) {
    btnMobileLogout.addEventListener('click', window.handleLogout);
  }
}

/**
 * Cierre de sesión definitivo, seguro e incondicional
 */
window.handleLogout = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }

  // 1. Auditoría protegida sin bloquear el logout si algo falla
  try {
    const curEmail = userSession?.email || (typeof FMPStore !== 'undefined' && FMPStore.getSession && FMPStore.getSession()?.email) || 'Usuario';
    if (typeof logAudit === 'function') {
      logAudit('CIERRE_SESION', `Cerró sesión (${curEmail})`);
    }
  } catch(err) {
    console.warn('Advertencia en auditoría logout:', err);
  }

  // 2. Limpieza total de sesión y almacenamiento
  userSession = null;
  window.userSession = null;
  if (typeof FMPStore !== 'undefined' && FMPStore.clearSession) {
    FMPStore.clearSession();
  }
  try {
    localStorage.removeItem('fmp_user_explicit_login');
    localStorage.removeItem('fmp_session');
    localStorage.removeItem('futbol_master_session');
    localStorage.removeItem('futbolmaster_session');
    localStorage.removeItem('fmp_master_session');
    sessionStorage.removeItem('fmp_splash_completed');
    sessionStorage.removeItem('fmp_splash_played');
  } catch(err) {}

  // 3. Reset de modo torneo y clases del body
  isManagingTournament = false;
  window.isManagingTournament = false;
  document.body.classList.remove('managing-tournament', 'role-admin', 'role-organizer', 'role-coach', 'role-fan', 'logged-in');
  document.body.classList.add('role-guest', 'not-logged-in');

  // 4. Cerrar todos los menús flotantes
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  if (userDropdownMenu) userDropdownMenu.style.display = 'none';
  const notificationsDropdownMenu = document.getElementById('notificationsDropdownMenu');
  if (notificationsDropdownMenu) notificationsDropdownMenu.style.display = 'none';
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  if (mobileNavDrawer) mobileNavDrawer.style.display = 'none';

  // 5. Actualizar interfaz visual al Estado 1 (Visitante)
  updateAuthUI();
  if (typeof renderNotificationsUI === 'function') {
    renderNotificationsUI();
  }

  // 6. Redirigir a Home (#/)
  navigateToView('home', true);

  // 7. Notificación toast amigable
  if (typeof showToast === 'function') {
    showToast('Sesión cerrada correctamente. Modo visitante activado.', 'info', 2500);
  }
};

window.navigateTo = function(route, updateHash) {
  navigateToView(route, updateHash !== false);
};

var isManagingTournament = window.isManagingTournament = false;
/**
 * FutbolMaster Pro - Gestor de Torneos y Partidos
 * JavaScript Vanilla (ES6+)
 * FASE 1, FASE 2 & FASE 3: Clasificación Profesional, Dashboard de Resumen Superior y Brackets CSS
 */

// =============================================================================
// 1. ESTADO GLOBAL, MULTITORNEO Y PERSISTENCIA (localStorage)
// =============================================================================
const STORAGE_KEY_TOURNAMENTS = 'futbolmaster_tournaments_v2';
const STORAGE_KEY_ACTIVE_ID = 'futbolmaster_active_id';
const LEGACY_STORAGE_KEY = 'futbolmaster_pro_v1';

// Lista reactiva de torneos guardados y puntero al torneo activo
var savedTournaments = window.savedTournaments = [];
var activeTournamentId = window.activeTournamentId = null;

// Objeto de estado global reactivo del torneo activo
var tournamentState = window.tournamentState = {
  id: '',
  createdAt: '',
  updatedAt: '',
  status: 'En preparación',
  config: {
    name: 'Super Liga Pro 2026',
    description: '',
    sport: 'f11',                 // 'f11' | 'f7' | 'futsal'
    format: 'league_single',      // 'league_single' | 'league_double' | 'knockout' | 'groups_playoffs' | 'groups_semis'
    matchDuration: 90,            // Minutos
    pointsWin: 3,
    pointsDraw: 1,
    pointsLoss: 0,
    groupQualifiedCount: 2,       // 1 | 2 | 4
    hasThirdPlaceMatch: false,
    tiebreaker: 'dg',             // 'dg' (Diferencia de Goles) | 'h2h' (Enfrentamiento directo)
    groupCount: 2                 // 2 | 3 | 4
  },
  groups: {},                     // { 'A': [id1, id2], 'B': [id3, id4] }
  teams: [],
  matches: [],
  scorers: [],
  currentTab: 'tab-config',
  activeSubTab: 'view-table',
  isGenerated: false,
  isPublicMode: false,
  filters: {
    round: 'all',
    team: 'all',
    group: 'all',
    status: 'all',
    search: ''
  }
};

// 8 Equipos oficiales de demostración con colores, iniciales y plantillas
const DEMO_TEAMS = [
  { 
    id: 'team-1', 
    name: 'Millonarios FC', 
    color: '#0033a0', 
    shield: '', 
    players: ['David Ospina', 'Mackalister Silva', 'Leonardo Castro', 'Daniel Cataño', 'Álvaro Montero'] 
  },
  { 
    id: 'team-2', 
    name: 'Atlético Nacional', 
    color: '#059669', 
    shield: '', 
    players: ['Edwin Cardona', 'Alfredo Morelos', 'William Tesillo', 'Jorman Campuzano', 'Harlen Castillo'] 
  },
  { 
    id: 'team-3', 
    name: 'América de Cali', 
    color: '#dc2626', 
    shield: '', 
    players: ['Adrián Ramos', 'Duván Vergara', 'Cristian Barrios', 'Éder Álvarez Balanta', 'Jorge Soto'] 
  },
  { 
    id: 'team-4', 
    name: 'Junior FC', 
    color: '#e11d48', 
    shield: '', 
    players: ['Carlos Bacca', 'Víctor Cantillo', 'José Enamorado', 'Yimmi Chará', 'Santiago Mele'] 
  },
  { 
    id: 'team-5', 
    name: 'Independiente Santa Fe', 
    color: '#ef4444', 
    shield: '', 
    players: ['Hugo Rodallega', 'Daniel Torres', 'Elvis Perlaza', 'Jhojan Torres', 'Andrés Mosquera'] 
  },
  { 
    id: 'team-6', 
    name: 'Deportivo Cali', 
    color: '#16a34a', 
    shield: '', 
    players: ['Fredy Montero', 'Jarlan Barrera', 'Alexander Mejía', 'Francisco Meza', 'Alejandro Rodríguez'] 
  },
  { 
    id: 'team-7', 
    name: 'Independiente Medellín', 
    color: '#b91c1c', 
    shield: '', 
    players: ['Brayan León', 'Jaime Alvarado', 'Fainer Torijano', 'Diego Moreno', 'Éder Chaux']
  },
  { 
    id: 'team-8', 
    name: 'Atlético Bucaramanga', 
    color: '#ca8a04', 
    shield: '', 
    players: ['Fabián Sambueza', 'Fredy Hinestroza', 'Jefferson Mena', 'Fabry Castro', 'Aldair Quintana']
  }
];

const VENUES_POOL = [
  'Cancha Sintética 1',
  'Cancha Sintética 2',
  'Estadio Central',
  'Campo de Entrenamiento A'
];

const REFEREES_POOL = [
  'Colegiado Principal A',
  'Colegiado Principal B',
  'Árbitro Carlos Pérez',
  'Árbitro Roberto Soto'
];

/**
 * Determina el estado dinámico de un torneo a partir de sus partidos
 */
function determineTournamentStatus(matches, cfg = null) {
  if (cfg && cfg.status) {
    if (cfg.status === 'suspended') return 'suspended';
    if (cfg.status === 'draft') return 'draft';
    if ((!matches || matches.length === 0) && ['open_registration', 'closed_registration', 'upcoming'].includes(cfg.status)) {
      return cfg.status;
    }
  }
  if (!matches || !Array.isArray(matches) || matches.length === 0) {
    if (cfg && cfg.regEndDate) {
      const today = new Date().toISOString().split('T')[0];
      if (today < cfg.regEndDate) return 'open_registration';
      return 'closed_registration';
    }
    return 'draft';
  }
  const realMatches = matches.filter(m => !m.isBye);
  if (realMatches.length === 0) return 'upcoming';
  const finished = realMatches.filter(m => m.isFinished || m.status === 'finished');
  if (finished.length === 0) return 'upcoming';
  if (finished.length === realMatches.length) return 'finished';
  return 'in_progress';
}

function getTournamentStatusBadge(statusKey) {
  const map = {
    draft: { text: 'Borrador', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
    open_registration: { text: 'Inscripciones Abiertas', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    closed_registration: { text: 'Inscripciones Cerradas', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    upcoming: { text: 'Próximo a Comenzar', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    in_progress: { text: 'En Curso', color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)' },
    finished: { text: 'Finalizado', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
    suspended: { text: 'Suspendido', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
  };
  return map[statusKey] || { text: statusKey || 'Borrador', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' };
}

/**
 * Guarda el estado del torneo activo en FMPStore (FOOTBALL_MASTER_PRO_DB_V1)
 */
function saveState() {
  try {
    if (!activeTournamentId) {
      if (!tournamentState.id) {
        tournamentState.id = 'tournament_' + Date.now();
      }
      activeTournamentId = tournamentState.id;
    }

    tournamentState.updatedAt = new Date().toISOString();
    tournamentState.status = determineTournamentStatus(tournamentState.matches, tournamentState.config);

    // Calcular y guardar automáticamente la tabla de clasificación
    if (typeof calculateStandings === 'function') {
      tournamentState.standings = calculateStandings();
    }

    // Si el usuario es Coach o Fan y no es el dueño, o si está en modo público, NO persistir en FMPStore (evita Acceso Denegado)
    const currentSession = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : (typeof userSession !== 'undefined' ? userSession : null);
    const isOwnerOrAdmin = currentSession && (currentSession.role === 'admin' || currentSession.userId === tournamentState.organizerId || !tournamentState.organizerId);

    if (tournamentState.isPublicMode || (currentSession && (currentSession.role === 'coach' || currentSession.role === 'fan') && !isOwnerOrAdmin)) {
      // Modo lectura para técnicos y aficionados: no se sobreescribe el torneo en FMPStore
      return;
    }

    // Persistencia Real en FMPStore
    FMPStore.saveTournament(tournamentState);
    savedTournaments = FMPStore.getTournaments();

    // Sincronizar activeTournamentId en sesión
    if (FMPStore.db.currentSession) {
      FMPStore.db.currentSession.activeTournamentId = activeTournamentId;
      FMPStore.save(true);
    }

    // Persistir lista y puntero activo en espejos para compatibilidad
    localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(savedTournaments));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeTournamentId);
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(tournamentState));

    updateHeaderActiveTournamentPill();
  } catch (error) {
    console.error('Error al guardar en FMPStore:', error);
    showToast('Error al guardar datos en el navegador', 'error');
  }
}

/**
 * Precarga el Escenario Colombia oficial por defecto:
 * 1. Superliga Andina Nocturna 2026 (4 clubes: Bogotá FC Master, América Master, Santa Fe Senior, Cali Deportivo)
 * 2. Copa Colombia Master 2026 en Bogotá D.C. (8 clubes: Millonarios FC, Nacional, América, Junior, Santa Fe, Cali, Medellín, Once Caldas)
 * 3. Torneo Relámpago Costeño 2026 en Barranquilla (4 clubes: Academia Barranquilla, Real Cartagena, Jaguares, Unión Magdalena)
 * Total: 16 clubes reales con calendarios, marcadores y clasificaciones desde el primer arranque.
 */
function loadDefaultColombiaSeed() {
  const t1 = {
    id: 'tournament_superliga_andina_2026',
    organizerId: 'usr-org-1',
    organizer_id: 'usr-org-1',
    organizerName: 'Andrés Montoya',
    name: 'Superliga Andina Nocturna 2026',
    description: 'Fútbol nocturno en grama sintética y natural con iluminación LED profesional en Bogotá y Cali.',
    sport: 'f11',
    format: 'league_single',
    category: 'Libre Masculino',
    status: 'en_curso',
    startDate: '2026-09-01',
    endDate: '2026-12-15',
    maxTeams: 4,
    config: {
      name: 'Superliga Andina Nocturna 2026',
      description: 'Fútbol nocturno en grama sintética y natural con iluminación LED profesional.',
      sport: 'f11',
      format: 'league_single',
      matchDuration: 90
    },
    teams: [
      { id: 'tm-bog-01', name: 'Bogotá FC Master', city: 'Bogotá', color: '#10b981' },
      { id: 'tm-cali-01', name: 'América Master', city: 'Cali', color: '#ef4444' },
      { id: 'tm-bog-02', name: 'Santa Fe Senior', city: 'Bogotá', color: '#dc2626' },
      { id: 'tm-cali-02', name: 'Cali Deportivo', city: 'Cali', color: '#059669' }
    ],
    matches: [
      {
        id: 'mt-andina-1',
        round: 1,
        teamHomeId: 'tm-bog-01',
        teamHomeName: 'Bogotá FC Master',
        homeTeamId: 'tm-bog-01',
        homeTeamName: 'Bogotá FC Master',
        teamAwayId: 'tm-cali-02',
        teamAwayName: 'Cali Deportivo',
        awayTeamId: 'tm-cali-02',
        awayTeamName: 'Cali Deportivo',
        venue: 'Complejo Salitre Alto Rendimiento',
        date: '2026-10-31',
        time: '18:00',
        status: 'finished',
        isFinished: true,
        scoreHome: 2,
        scoreAway: 1,
        homeScore: 2,
        awayScore: 1
      },
      {
        id: 'mt-andina-2',
        round: 1,
        teamHomeId: 'tm-cali-01',
        teamHomeName: 'América Master',
        homeTeamId: 'tm-cali-01',
        homeTeamName: 'América Master',
        teamAwayId: 'tm-bog-02',
        teamAwayName: 'Santa Fe Senior',
        awayTeamId: 'tm-bog-02',
        awayTeamName: 'Santa Fe Senior',
        venue: 'Sede Campestre La Zarcita',
        date: '2026-10-31',
        time: '20:00',
        status: 'finished',
        isFinished: true,
        scoreHome: 1,
        scoreAway: 1,
        homeScore: 1,
        awayScore: 1
      }
    ],
    isGenerated: true,
    updatedAt: new Date().toISOString()
  };

  const t2 = {
    id: 'tournament_cc_master_2026',
    organizerId: 'usr-org-1',
    organizer_id: 'usr-org-1',
    organizerName: 'Carlos Mendoza',
    name: 'Copa Colombia Master 2026',
    description: 'Torneo oficial de fútbol colombiano en Bogotá D.C. con 8 clubes profesionales, fixture programado y marcadores en vivo.',
    sport: 'f11',
    format: 'league_single',
    category: 'Libre / Mayores',
    status: 'en_curso',
    config: {
      name: 'Copa Colombia Master 2026',
      description: 'Torneo oficial de fútbol colombiano en Bogotá D.C. con 8 clubes en formato Liga Todos contra Todos.',
      sport: 'f11',
      format: 'league_single',
      matchDuration: 90
    },
    teams: [
      { id: 'team_col_1', name: 'Millonarios FC', city: 'Bogotá', color: '#1e3a8a' },
      { id: 'team_col_2', name: 'Atlético Nacional', city: 'Medellín', color: '#047857' },
      { id: 'team_col_3', name: 'América de Cali', city: 'Cali', color: '#dc2626' },
      { id: 'team_col_4', name: 'Junior de Barranquilla', city: 'Barranquilla', color: '#ef4444' },
      { id: 'team_col_5', name: 'Independiente Santa Fe', city: 'Bogotá', color: '#b91c1c' },
      { id: 'team_col_6', name: 'Deportivo Cali', city: 'Cali', color: '#15803d' },
      { id: 'team_col_7', name: 'Independiente Medellín', city: 'Medellín', color: '#991b1b' },
      { id: 'team_col_8', name: 'Once Caldas', city: 'Manizales', color: '#f59e0b' }
    ],
    matches: [
      {
        id: 'match_cc_1',
        round: 1,
        homeTeamId: 'team_col_1',
        homeTeamName: 'Millonarios FC',
        awayTeamId: 'team_col_5',
        awayTeamName: 'Independiente Santa Fe',
        status: 'finished',
        isFinished: true,
        homeScore: 2,
        awayScore: 1,
        scoreHome: 2,
        scoreAway: 1,
        venue: 'Estadio El Campín (Bogotá)'
      },
      {
        id: 'match_cc_2',
        round: 1,
        homeTeamId: 'team_col_2',
        homeTeamName: 'Atlético Nacional',
        awayTeamId: 'team_col_7',
        awayTeamName: 'Independiente Medellín',
        status: 'finished',
        isFinished: true,
        homeScore: 3,
        awayScore: 0,
        scoreHome: 3,
        scoreAway: 0,
        venue: 'Estadio Atanasio Girardot (Medellín)'
      },
      {
        id: 'match_cc_3',
        round: 1,
        homeTeamId: 'team_col_3',
        homeTeamName: 'América de Cali',
        awayTeamId: 'team_col_6',
        awayTeamName: 'Deportivo Cali',
        status: 'finished',
        isFinished: true,
        homeScore: 1,
        awayScore: 1,
        scoreHome: 1,
        scoreAway: 1,
        venue: 'Estadio Pascual Guerrero (Cali)'
      },
      {
        id: 'match_cc_4',
        round: 1,
        homeTeamId: 'team_col_4',
        homeTeamName: 'Junior de Barranquilla',
        awayTeamId: 'team_col_8',
        awayTeamName: 'Once Caldas',
        status: 'finished',
        isFinished: true,
        homeScore: 2,
        awayScore: 0,
        scoreHome: 2,
        scoreAway: 0,
        venue: 'Estadio Metropolitano (Barranquilla)'
      }
    ],
    isGenerated: true,
    updatedAt: new Date().toISOString()
  };

  const t3 = {
    id: 'tournament_relampago_costeno_2026',
    organizerId: 'usr-org-1',
    organizer_id: 'usr-org-1',
    organizerName: 'Víctor Pacheco',
    name: 'Torneo Relámpago Costeño 2026',
    description: 'Competición relámpago en Barranquilla y la Costa Caribe con clubes federados de alta intensidad.',
    sport: 'f11',
    format: 'league_single',
    category: 'Libre Masculino',
    status: 'en_curso',
    config: {
      name: 'Torneo Relámpago Costeño 2026',
      description: 'Competición relámpago en Barranquilla y la Costa Caribe con clubes federados.',
      sport: 'f11',
      format: 'league_single',
      matchDuration: 90
    },
    teams: [
      { id: 'tm_baq_1', name: 'Academia Barranquilla FC', city: 'Barranquilla', color: '#dc2626' },
      { id: 'tm_baq_2', name: 'Real Cartagena Costeño', city: 'Cartagena', color: '#f59e0b' },
      { id: 'tm_baq_3', name: 'Jaguares del Sinú', city: 'Montería', color: '#0284c7' },
      { id: 'tm_baq_4', name: 'Unión Magdalena Pro', city: 'Santa Marta', color: '#1e3a8a' }
    ],
    matches: [
      {
        id: 'mt_costeno_1',
        round: 1,
        homeTeamId: 'tm_baq_1',
        homeTeamName: 'Academia Barranquilla FC',
        awayTeamId: 'tm_baq_2',
        awayTeamName: 'Real Cartagena Costeño',
        status: 'finished',
        isFinished: true,
        homeScore: 3,
        awayScore: 2,
        scoreHome: 3,
        scoreAway: 2,
        venue: 'Cancha Bombonera Barranquilla'
      },
      {
        id: 'mt_costeno_2',
        round: 1,
        homeTeamId: 'tm_baq_3',
        homeTeamName: 'Jaguares del Sinú',
        awayTeamId: 'tm_baq_4',
        awayTeamName: 'Unión Magdalena Pro',
        status: 'finished',
        isFinished: true,
        homeScore: 1,
        awayScore: 0,
        scoreHome: 1,
        scoreAway: 0,
        venue: 'Cancha El Pibe Valderrama'
      }
    ],
    isGenerated: true,
    updatedAt: new Date().toISOString()
  };

  const seedList = [t1, t2, t3];
  if (typeof FMPStore !== 'undefined' && FMPStore.db) {
    FMPStore.db.tournaments = seedList;
    FMPStore.save(false);
  }
  savedTournaments = seedList;
  if (!activeTournamentId) {
    activeTournamentId = t2.id;
    tournamentState = JSON.parse(JSON.stringify(t2));
  }
  try {
    localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(seedList));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeTournamentId);
  } catch(e){}
  return seedList;
}
window.loadDefaultColombiaSeed = loadDefaultColombiaSeed;

/**
 * Carga todos los torneos guardados desde FMPStore (FOOTBALL_MASTER_PRO_DB_V1)
 */
function loadState() {
  try {
    FMPStore.init();
    savedTournaments = FMPStore.getTournaments();

    // Precargar Escenario Colombia si no existen torneos o están vacíos
    if (!savedTournaments || savedTournaments.length === 0 || !savedTournaments.some(t => Array.isArray(t.teams) && t.teams.length > 0)) {
      savedTournaments = loadDefaultColombiaSeed();
    }

    // Recuperar torneo activo de la sesión persistente
    const sessionActiveId = FMPStore.getSession()?.activeTournamentId;
    const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    const candidateId = sessionActiveId || savedActiveId;

    if (candidateId && savedTournaments.some(t => t.id === candidateId)) {
      activeTournamentId = candidateId;
    } else if (savedTournaments.length > 0) {
      activeTournamentId = savedTournaments[0].id;
    } else {
      activeTournamentId = null;
    }

    // Sincronizar tournamentState con el torneo activo
    if (activeTournamentId) {
      const activeObj = savedTournaments.find(t => t.id === activeTournamentId);
      if (activeObj) {
        tournamentState = JSON.parse(JSON.stringify(activeObj));
        if (!tournamentState.filters) {
          tournamentState.filters = { round: 'all', team: 'all', group: 'all', status: 'all', search: '', teamSearch: '' };
        }
        if (!tournamentState.matches) tournamentState.matches = [];
        if (!tournamentState.teams) tournamentState.teams = [];
        // Asegurar que standings esté disponible
        if (!tournamentState.standings || tournamentState.standings.length === 0) {
          if (typeof calculateStandings === 'function') {
            tournamentState.standings = calculateStandings();
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar torneos desde FMPStore:', error);
    savedTournaments = loadDefaultColombiaSeed();
    activeTournamentId = savedTournaments[0]?.id || null;
  }
}

// =============================================================================
// 2. ELEMENTOS DEL DOM
// =============================================================================
var dom = window.dom = {
  // SPA Router & Header Global
  navLinks: document.querySelectorAll('.nav-link'),
  mobileNavLinks: document.querySelectorAll('.mobile-nav-item'),
  spaViews: document.querySelectorAll('.spa-view'),
  btnMobileMenuToggle: document.getElementById('btnMobileMenuToggle'),
  btnCloseMobileDrawer: document.getElementById('btnCloseMobileDrawer'),
  mobileNavDrawer: document.getElementById('mobileNavDrawer'),
  activeTournamentSelectorWrap: document.getElementById('activeTournamentSelectorWrap'),
  btnActiveTournamentPill: document.getElementById('btnActiveTournamentPill'),
  headerActiveTournamentName: document.getElementById('headerActiveTournamentName'),
  headerActiveTournamentDot: document.getElementById('headerActiveTournamentDot'),
  activeTournamentDropdown: document.getElementById('activeTournamentDropdown'),
  headerDropdownTournamentsList: document.getElementById('headerDropdownTournamentsList'),
  btnDropdownCreateNew: document.getElementById('btnDropdownCreateNew'),
  mobileActiveTournamentName: document.getElementById('mobileActiveTournamentName'),
  mobileActiveDot: document.getElementById('mobileActiveDot'),

  // Vista Home
  statHomeTournaments: document.getElementById('statHomeTournaments'),
  statHomeTeams: document.getElementById('statHomeTeams'),
  statHomeMatches: document.getElementById('statHomeMatches'),
  statHomeGoals: document.getElementById('statHomeGoals'),
  homeRecentGrid: document.getElementById('homeRecentGrid'),
  btnHeroLoadDemo: document.getElementById('btnHeroLoadDemo'),

  // Vista Mis Torneos
  tournamentsCardsGrid: document.getElementById('tournamentsCardsGrid'),
  torneosEmptyState: document.getElementById('torneosEmptyState'),
  btnTorneosEmptyLoadDemo: document.getElementById('btnTorneosEmptyLoadDemo'),

  // Guards de Torneo Activo
  guardEquipos: document.getElementById('guardEquipos'),
  contentEquipos: document.getElementById('contentEquipos'),
  guardCalendario: document.getElementById('guardCalendario'),
  contentCalendario: document.getElementById('contentCalendario'),
  guardClasificacion: document.getElementById('guardClasificacion'),
  contentClasificacion: document.getElementById('contentClasificacion'),
  guardCuadro: document.getElementById('guardCuadro'),
  contentCuadro: document.getElementById('contentCuadro'),
  guardHerramientas: document.getElementById('guardHerramientas'),
  contentHerramientas: document.getElementById('contentHerramientas'),
  guardTv: document.getElementById('guardTv'),
  contentTv: document.getElementById('contentTv'),

  // Herramientas Hub
  toolsTournamentSubtitle: document.getElementById('toolsTournamentSubtitle'),
  toolsBtnExportJson: document.getElementById('toolsBtnExportJson'),
  toolsBtnImportJson: document.getElementById('toolsBtnImportJson'),
  toolsBtnExportStandingsCsv: document.getElementById('toolsBtnExportStandingsCsv'),
  toolsBtnExportFixturesCsv: document.getElementById('toolsBtnExportFixturesCsv'),
  toolsBtnPrintPdf: document.getElementById('toolsBtnPrintPdf'),
  toolsBtnShare: document.getElementById('toolsBtnShare'),
  toolsBtnTogglePublic: document.getElementById('toolsBtnTogglePublic'),
  toolsPublicToggleText: document.getElementById('toolsPublicToggleText'),
  toolsBtnReset: document.getElementById('toolsBtnReset'),

  // Modal Eliminar Torneo
  deleteTournamentModal: document.getElementById('deleteTournamentModal'),
  deleteTournamentModalName: document.getElementById('deleteTournamentModalName'),
  deleteTournamentModalId: document.getElementById('deleteTournamentModalId'),
  btnCancelDeleteModal: document.getElementById('btnCancelDeleteModal'),
  btnConfirmDeleteAction: document.getElementById('btnConfirmDeleteAction'),

  // Tabs Legacy y Botones
  tabButtons: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  btnGoTabs: document.querySelectorAll('.btn-go-tab'),
  statusLabel: document.getElementById('tournamentStatusLabel'),
  btnResetAll: document.getElementById('btnResetAll'),
  btnExportJson: document.getElementById('btnExportJson'),
  btnImportJson: document.getElementById('btnImportJson'),
  importJsonFileInput: document.getElementById('importJsonFileInput'),

  // Formulario Configuración Avanzada
  configForm: document.getElementById('tournamentConfigForm'),
  inputTournamentName: document.getElementById('tournamentName'),
  inputTournamentDescription: document.getElementById('tournamentDescription'),
  selectTournamentSport: document.getElementById('tournamentSport'),
  inputMatchDuration: document.getElementById('matchDurationInput'),
  selectTournamentFormat: document.getElementById('tournamentFormat'),
  formatHint: document.getElementById('formatHint'),
  groupsConfigBox: document.getElementById('groupsConfigBox'),
  selectGroupQualified: document.getElementById('groupQualifiedSelect'),
  checkboxThirdPlace: document.getElementById('thirdPlaceCheckbox'),
  groupCountSelect: document.getElementById('groupCountSelect'),
  btnRandomDrawGroups: document.getElementById('btnRandomDrawGroups'),
  groupsDistributionBoard: document.getElementById('groupsDistributionBoard'),
  inputPtsWin: document.getElementById('ptsWinInput'),
  inputPtsDraw: document.getElementById('ptsDrawInput'),
  inputPtsLoss: document.getElementById('ptsLossInput'),
  selectTiebreaker: document.getElementById('tiebreakerSelect'),
  btnSaveDraft: document.getElementById('btnSaveDraft'),
  btnGenerate: document.getElementById('btnGenerateTournament'),

  // Gestor Profesional de Equipos
  addTeamForm: document.getElementById('addTeamForm'),
  inputTeamName: document.getElementById('teamNameInput'),
  inputTeamColor: document.getElementById('teamColorInput'),
  colorPreview: document.getElementById('colorPreview'),
  previewInitials: document.getElementById('previewInitials'),
  teamShieldFileInput: document.getElementById('teamShieldFileInput'),
  teamShieldUploadText: document.getElementById('teamShieldUploadText'),
  teamShieldUrlInput: document.getElementById('teamShieldUrlInput'),
  searchTeamInput: document.getElementById('searchTeamInput'),
  teamsGrid: document.getElementById('teamsGrid'),
  teamsEmptyState: document.getElementById('teamsEmptyState'),
  teamsSearchEmptyState: document.getElementById('teamsSearchEmptyState'),
  teamsCount: document.getElementById('teamsCount'),
  requirementBadge: document.getElementById('requirementBadge'),
  btnLoadDemo: document.getElementById('btnLoadDemoTeams'),
  btnClearTeams: document.getElementById('btnClearTeams'),
  btnExportTeamsCsv: document.getElementById('btnExportTeamsCsv'),
  btnImportTeamsCsv: document.getElementById('btnImportTeamsCsv'),
  importTeamsCsvInput: document.getElementById('importTeamsCsvInput'),

  // Modal de edición de equipos
  editModal: document.getElementById('editTeamModal'),
  editForm: document.getElementById('editTeamForm'),
  editTeamId: document.getElementById('editTeamId'),
  editTeamName: document.getElementById('editTeamName'),
  editTeamColor: document.getElementById('editTeamColor'),
  editColorCode: document.getElementById('editColorCode'),
  editShieldPreview: document.getElementById('editShieldPreview'),
  editPreviewInitials: document.getElementById('editPreviewInitials'),
  editShieldFileInput: document.getElementById('editShieldFileInput'),
  editShieldUrl: document.getElementById('editShieldUrl'),
  editTeamPlayers: document.getElementById('editTeamPlayers'),
  btnCancelEdit: document.getElementById('btnCancelEdit'),
  btnCancelEdit2: document.getElementById('btnCancelEdit2'),

  // Modal confirmación vaciar equipos
  confirmClearModal: document.getElementById('confirmClearModal'),
  btnCancelClearModal: document.getElementById('btnCancelClearModal'),
  btnConfirmClearModal: document.getElementById('btnConfirmClearModal'),

  // Modal confirmación regenerar torneo
  confirmRegenerateModal: document.getElementById('confirmRegenerateModal'),
  btnCancelRegenerateModal: document.getElementById('btnCancelRegenerateModal'),
  btnConfirmRegenerateAction: document.getElementById('btnConfirmRegenerateAction'),

  // Modal auto scheduler
  autoScheduleModal: document.getElementById('autoScheduleModal'),
  autoSchedStartDate: document.getElementById('autoSchedStartDate'),
  autoSchedStartTime: document.getElementById('autoSchedStartTime'),
  autoSchedInterval: document.getElementById('autoSchedInterval'),
  autoSchedDaysGap: document.getElementById('autoSchedDaysGap'),
  autoSchedVenues: document.getElementById('autoSchedVenues'),
  btnCloseAutoScheduleModal: document.getElementById('btnCloseAutoScheduleModal'),
  btnCancelAutoSchedule: document.getElementById('btnCancelAutoSchedule'),
  btnApplyAutoSchedule: document.getElementById('btnApplyAutoSchedule'),

  // Vista Pestaña 2: Calendario y Partidos
  fixturesEmptyState: document.getElementById('fixturesEmptyState'),
  fixturesActiveView: document.getElementById('fixturesActiveView'),
  fixturesTournamentTitle: document.getElementById('fixturesTournamentTitle'),
  fixturesFormatBadge: document.getElementById('fixturesFormatBadge'),
  fixturesStatsSummary: document.getElementById('fixturesStatsSummary'),
  tournamentProgressBar: document.getElementById('tournamentProgressBar'),
  tournamentProgressText: document.getElementById('tournamentProgressText'),
  searchFixtureInput: document.getElementById('searchFixtureInput'),
  roundFilterSelect: document.getElementById('roundFilterSelect'),
  groupFilterGroup: document.getElementById('groupFilterGroup'),
  groupFilterSelect: document.getElementById('groupFilterSelect'),
  teamFilterSelect: document.getElementById('teamFilterSelect'),
  statusFilterSelect: document.getElementById('statusFilterSelect'),
  btnAutoFillSchedule: document.getElementById('btnAutoFillSchedule'),
  btnRegenerateFixtures: document.getElementById('btnRegenerateFixtures'),
  roundsListContainer: document.getElementById('roundsListContainer'),

  // Vista Pestaña 3: Resumen Superior, Tablas y Llaves
  standingsEmptyState: document.getElementById('standingsEmptyState'),
  standingsActiveView: document.getElementById('standingsActiveView'),
  championCelebrationBanner: document.getElementById('championCelebrationBanner'),
  championBannerName: document.getElementById('championBannerName'),
  championBannerSubtitle: document.getElementById('championBannerSubtitle'),
  championBannerShield: document.getElementById('championBannerShield'),
  tournamentSummaryDashboard: document.getElementById('tournamentSummaryDashboard'),
  summaryTournamentName: document.getElementById('summaryTournamentName'),
  summaryTournamentDescription: document.getElementById('summaryTournamentDescription'),
  summaryStatusBadge: document.getElementById('summaryStatusBadge'),
  summaryStatusDot: document.getElementById('summaryStatusDot'),
  summaryStatusText: document.getElementById('summaryStatusText'),
  kpiTotalTeams: document.getElementById('kpiTotalTeams'),
  kpiPlayedVsPending: document.getElementById('kpiPlayedVsPending'),
  kpiProgressPercent: document.getElementById('kpiProgressPercent'),
  kpiProgressBar: document.getElementById('kpiProgressBar'),
  kpiCurrentLeader: document.getElementById('kpiCurrentLeader'),
  kpiRecentCount: document.getElementById('kpiRecentCount'),
  kpiRecentResultsList: document.getElementById('kpiRecentResultsList'),
  kpiUpcomingCount: document.getElementById('kpiUpcomingCount'),
  kpiUpcomingMatchesList: document.getElementById('kpiUpcomingMatchesList'),
  standingsTournamentTitle: document.getElementById('standingsTournamentTitle'),
  standingsTournamentSubtitle: document.getElementById('standingsTournamentSubtitle'),
  subTabButtons: document.querySelectorAll('.sub-tab-btn'),
  subTabContents: document.querySelectorAll('.sub-tab-content'),
  singleLeagueTableWrapper: document.getElementById('singleLeagueTableWrapper'),
  standingsTableBody: document.getElementById('standingsTableBody'),
  groupTablesContainer: document.getElementById('groupTablesContainer'),
  standingsTiebreakerNote: document.getElementById('standingsTiebreakerNote'),
  bracketsTreeContainer: document.getElementById('bracketsTreeContainer'),
  scorersTableBody: document.getElementById('scorersTableBody'),
  totalGoalsCount: document.getElementById('totalGoalsCount'),

  // Vista Pestaña 4: Modo TV Broadcast
  tvEmptyState: document.getElementById('tvEmptyState'),
  tvActiveView: document.getElementById('tvActiveView'),
  tvTournamentTitle: document.getElementById('tvTournamentTitle'),
  tvDigitalClock: document.getElementById('tvDigitalClock'),
  tvDateDisplay: document.getElementById('tvDateDisplay'),
  btnToggleFullscreen: document.getElementById('btnToggleFullscreen'),
  fullscreenBtnText: document.getElementById('fullscreenBtnText'),
  tvStandingsBody: document.getElementById('tvStandingsBody'),
  tvRecentMatchesList: document.getElementById('tvRecentMatchesList'),
  tvUpcomingMatchesList: document.getElementById('tvUpcomingMatchesList'),
  tvRecentRoundTitle: document.getElementById('tvRecentRoundTitle'),
  tvUpcomingRoundTitle: document.getElementById('tvUpcomingRoundTitle'),
  tvTickerTrack: document.getElementById('tvTickerTrack'),
  tvQrCodeImg: document.getElementById('tvQrCodeImg'),

  // Modal de Anotadores de Goles
  scorersModal: document.getElementById('scorersModal'),
  scorersModalMatchId: document.getElementById('scorersModalMatchId'),
  scorersModalMatchSubtitle: document.getElementById('scorersModalMatchSubtitle'),
  scorersHomeTeamName: document.getElementById('scorersHomeTeamName'),
  scorersHomeTeamDot: document.getElementById('scorersHomeTeamDot'),
  scorersAwayTeamName: document.getElementById('scorersAwayTeamName'),
  scorersAwayTeamDot: document.getElementById('scorersAwayTeamDot'),
  scorersHomeList: document.getElementById('scorersHomeList'),
  scorersAwayList: document.getElementById('scorersAwayList'),
  btnCloseScorersModal: document.getElementById('btnCloseScorersModal'),
  btnCancelScorers: document.getElementById('btnCancelScorers'),
  btnSaveScorers: document.getElementById('btnSaveScorers'),

  // FASE 4: Modo Público, Exportación Avanzada, Compartir e Impresión
  publicModeBanner: document.getElementById('publicModeBanner'),
  btnTogglePublicMode: document.getElementById('btnTogglePublicMode'),
  publicModeBtnText: document.getElementById('publicModeBtnText'),
  btnExitPublicMode: document.getElementById('btnExitPublicMode'),
  btnShareFromBanner: document.getElementById('btnShareFromBanner'),
  btnShareTournament: document.getElementById('btnShareTournament'),
  btnPrintReport: document.getElementById('btnPrintReport'),
  btnPrintStandingsReport: document.getElementById('btnPrintStandingsReport'),
  btnExportFixturesCsv: document.getElementById('btnExportFixturesCsv'),
  btnExportStandingsCsv: document.getElementById('btnExportStandingsCsv'),
  shareTournamentModal: document.getElementById('shareTournamentModal'),
  sharePublicUrlInput: document.getElementById('sharePublicUrlInput'),
  btnCopyPublicUrl: document.getElementById('btnCopyPublicUrl'),
  btnOpenTvFromShare: document.getElementById('btnOpenTvFromShare'),
  btnLaunchTvFullscreen: document.getElementById('btnLaunchTvFullscreen'),
  btnPrintFromShare: document.getElementById('btnPrintFromShare'),
  btnCloseShareModal: document.getElementById('btnCloseShareModal'),
  btnCloseShareModalBtn: document.getElementById('btnCloseShareModalBtn'),
  printReportHeader: document.getElementById('printReportHeader'),
  printTournamentTitle: document.getElementById('printTournamentTitle'),
  printTournamentSubtitle: document.getElementById('printTournamentSubtitle'),
  printReportDate: document.getElementById('printReportDate'),

  // Notificaciones Toast
  toastContainer: document.getElementById('toastContainer')
};

// =============================================================================
// 3. SISTEMA DE TOASTS Y NOTIFICACIONES
// =============================================================================
function showToast(message, type = 'info', duration = 2800) {
  const container = (typeof dom !== 'undefined' && dom && dom.toastContainer) || document.getElementById('toastContainer');
  if (!container) return;

  // Deduplicación de toasts de bienvenida / sesión
  if (message.includes('Bienvenido') || message.includes('Sesión activa') || message.includes('Sesión iniciada')) {
    Array.from(container.children).forEach(child => {
      const text = child.textContent || '';
      if (text.includes('Bienvenido') || text.includes('Sesión activa') || text.includes('Sesión iniciada')) {
        child.remove();
      }
    });
  }

  // Limitar a máximo 2 toasts simultáneos en pantalla
  while (container.children.length >= 2) {
    container.removeChild(container.firstChild);
  }

  const icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    warning: '⚡',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.setProperty('--toast-delay', `${duration / 1000}s`);

  toast.innerHTML = `
    <span class="toast-icon"></span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, duration + 300);
}

// =============================================================================
// 4. GENERADOR AUTOMÁTICO DE ESCUDOS SVG DINÁMICOS
// =============================================================================

function getClubInitials(name) {
  if (!name) return 'FC';
  const clean = name.trim().replace(/[^\w\s]/gi, '');
  const words = clean.split(/\s+/).filter(w => !['de', 'del', 'la', 'los', 'el', 'fc', 'cf', 'sc'].includes(w.toLowerCase()));
  
  if (words.length === 0) {
    const rawWords = clean.split(/\s+/);
    return rawWords[0].substring(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else if (words.length === 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }
}

function generateDynamicShieldSvg(teamName, teamColor = '#10b981') {
  const initials = getClubInitials(teamName);
  
  let r = 16, g = 185, b = 129;
  if (teamColor.startsWith('#') && (teamColor.length === 7 || teamColor.length === 4)) {
    let hex = teamColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    r = (num >> 16) & 255;
    g = (num >> 8) & 255;
    b = num & 255;
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.65 ? '#0b0f19' : '#ffffff';
  const borderColor = luminance > 0.65 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.7)';
  const secondaryFill = luminance > 0.65 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';

  return `
    <svg class="dynamic-shield-svg" viewBox="0 0 100 115" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Escudo ${escapeHtml(teamName)}">
      <defs>
        <linearGradient id="shieldGrad-${escapeHtml(initials)}-${r}${g}${b}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${teamColor}" />
          <stop offset="100%" stop-color="rgb(${Math.max(0, r - 35)}, ${Math.max(0, g - 35)}, ${Math.max(0, b - 35)})" />
        </linearGradient>
      </defs>
      <path d="M50 5 L88 20 L88 65 C88 88 50 110 50 110 C50 110 12 88 12 65 L12 20 Z" 
            fill="url(#shieldGrad-${escapeHtml(initials)}-${r}${g}${b})" 
            stroke="${borderColor}" 
            stroke-width="3" 
            stroke-linejoin="round"/>
      <path d="M50 8 L84 22 L84 64 C84 76 66 94 50 104 L50 8 Z" 
            fill="${secondaryFill}" />
      <path d="M50 8 L50 105" 
            stroke="${borderColor}" 
            stroke-width="1.5" 
            stroke-dasharray="2 3" 
            opacity="0.6"/>
      <path d="M22 24 L78 24" stroke="${borderColor}" stroke-width="1.5" stroke-opacity="0.4"/>
      <polygon points="50,11 52,16 57,16 53,19 55,24 50,21 45,24 47,19 43,16 48,16" 
               fill="${borderColor}" opacity="0.85" />
      <text x="50" y="60" 
            font-family="'Space Grotesk', 'Outfit', sans-serif" 
            font-size="${initials.length > 2 ? '22' : '26'}" 
            font-weight="900" 
            fill="${textColor}" 
            text-anchor="middle" 
            letter-spacing="0.05em">${escapeHtml(initials)}</text>
    </svg>
  `;
}

function renderTeamShieldElement(team) {
  if (!team) return `<div class="team-jersey-dot" style="background:#475569;"></div>`;
  if (team.shield && team.shield.trim() !== '') {
    return `<img src="${escapeHtml(team.shield)}" alt="${escapeHtml(team.name)}" class="team-shield-img" onerror="this.outerHTML=generateDynamicShieldSvg('${escapeHtml(team.name)}', '${escapeHtml(team.color)}')">`;
  }
  return generateDynamicShieldSvg(team.name, team.color);
}

// =============================================================================
// 5. ENRUTADOR SPA (HASH ROUTER), HEADER GLOBAL Y SISTEMA MULTITORNEO
// =============================================================================

var ROUTE_MAP = window.ROUTE_MAP = {
  '': 'home',
  '/': 'home',
  'home': 'home',
  'torneos': 'torneos',
  'crear': 'crear',
  'equipos': 'equipos',
  'calendario': 'calendario',
  'clasificacion': 'clasificacion',
  'cuadro': 'cuadro',
  'herramientas': 'herramientas',
  'tv': 'tv',
  'admin': 'admin',
  'organizador': 'organizador',
  'organizer': 'organizador',
  'panel-organizador': 'organizador',
  'club': 'club',
  'coach': 'club',
  'mi-club': 'club',
  'miclub': 'club',
  'tab-coach': 'club',
  'tab-club': 'club',
  'canchas': 'canchas',
  'solicitudes': 'solicitudes',
  // Compatibilidad con identificadores anteriores
  'tab-config': 'crear',
  'tab-teams': 'equipos',
  'tab-fixtures': 'calendario',
  'tab-standings': 'clasificacion',
  'tab-brackets': 'cuadro',
  'tab-tv': 'tv',
  'tab-tools': 'herramientas'
};

/**
 * Normaliza cualquier hash o alias de pestaña al identificador de vista SPA
 */
function getNormalizedRoute(hashString) {
  let clean = (hashString || window.location.hash || '').replace(/^#\/?/, '').trim();
  if (clean.includes('?')) {
    clean = clean.split('?')[0];
  }
  return ROUTE_MAP[clean] || 'home';
}

/**
 * Navega a una vista SPA específica y actualiza el estado de la UI
 */
function navigateToView(targetRoute, updateHash = true) {
  let routeId = (typeof ROUTE_MAP !== 'undefined' && ROUTE_MAP && ROUTE_MAP[targetRoute]) || targetRoute;

  // ROUTER GUARDS ESTRICTOS
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const currentRole = session ? normalizeRole(session.role) : 'spectator';

  if (routeId === 'admin') {
    if (!session || !session.loggedIn || currentRole !== 'admin') {
      if (typeof showToast === 'function') {
        showToast('El Dashboard de Administración Global es exclusivo para Administradores.', 'warning', 3000);
      }
      if (!session || !session.loggedIn) {
        if (typeof openAuthModal === 'function') openAuthModal();
      }
      navigateToView(currentRole === 'organizer' ? 'organizador' : (isCoachRole(currentRole) ? 'club' : 'home'), true);
      return;
    }
  }

  if (routeId === 'organizador') {
    if (!session || !session.loggedIn || (currentRole !== 'organizer' && currentRole !== 'admin')) {
      if (typeof showToast === 'function') {
        showToast('El Centro de Mando del Organizador es exclusivo para Organizadores.', 'warning', 3000);
      }
      if (!session || !session.loggedIn) {
        if (typeof openAuthModal === 'function') openAuthModal();
      }
      navigateToView(isCoachRole(currentRole) ? 'club' : 'home', true);
      return;
    }
  }

  if (routeId === 'club') {
    if (!session || !session.loggedIn || (!isCoachRole(currentRole) && currentRole !== 'admin')) {
      if (typeof showToast === 'function') {
        showToast('El Menú Mi Club es exclusivo para el Cuerpo Técnico y Delegados.', 'warning', 3000);
      }
      if (!session || !session.loggedIn) {
        if (typeof openAuthModal === 'function') openAuthModal();
      }
      navigateToView('home', true);
      return;
    }
  }

  if (routeId === 'crear') {
    if (!session || !session.loggedIn) {
      if (typeof showToast === 'function') {
        showToast('Inicia sesión para crear y configurar tu torneo oficial.', 'info', 3000);
      }
      if (typeof openAuthModal === 'function') openAuthModal('auth-login-pane');
      navigateToView('torneos', true);
      return;
    }
    if (currentRole !== 'admin' && currentRole !== 'organizer') {
      // Habilitar automáticamente rol de Organizador para que el usuario pueda crear sin bloqueos
      session.role = 'organizer';
      session.roleTitle = 'Organizador de Torneo';
      saveUserSession(session);
      if (typeof FMPStore !== 'undefined' && FMPStore.saveUser) {
        const u = FMPStore.getUserById(session.userId);
        if (u) {
          u.role = 'organizer';
          u.roleTitle = 'Organizador de Torneo';
          FMPStore.saveUser(u);
        }
      }
      if (typeof showToast === 'function') {
        showToast('¡Rol de Organizador habilitado para tu cuenta! Puedes configurar tu torneo.', 'success', 3500);
      }
    }
    // Asegurar que el borrador pertenezca al usuario activo
    if (!tournamentState || tournamentState.organizerId !== session.userId) {
      startNewTournamentDraft();
    }
  }

  // Canchas Colombia disponible para todos los roles (exploración pública de escenarios)

  if (targetRoute === 'formatos') {
    navigateToView('home', updateHash);
    setTimeout(() => {
      const el = document.getElementById('home-formats-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
    return;
  }

  // Modo Exclusivo de Admin: Permitir admin, crear y home
  if (session && session.loggedIn && normalizeRole(session.role) === 'admin') {
    if (routeId !== 'admin' && routeId !== 'crear' && routeId !== 'home') {
      routeId = 'admin';
    }
  }

  // Modo Exclusivo de Organizador: Si intenta ir a admin, redirigir a organizador
  if (session && session.loggedIn && normalizeRole(session.role) === 'organizer') {
    if (routeId === 'admin') {
      routeId = 'organizador';
    }
  }

  // Sincronizar data-route y clases en body para selectores CSS de ocultamiento
  document.body.setAttribute('data-route', routeId);
  ['home', 'torneos', 'canchas', 'crear', 'admin', 'organizador', 'club', 'equipos', 'calendario', 'clasificacion', 'cuadro', 'herramientas', 'tv', 'solicitudes'].forEach(r => {
    document.body.classList.remove('route-' + r);
  });
  document.body.classList.add('route-' + routeId);

  // Control estricto de visibilidad del Header y Aside según ruta:
  // En admin y en organizador, ocultar header global y aside para aprovechar el 100% de la pantalla
  const isInAdmin = (routeId === 'admin');
  const isInOrganizer = (routeId === 'organizador' || routeId === 'organizer');
  document.body.classList.toggle('in-admin-dashboard', isInAdmin);
  document.body.classList.toggle('route-admin', isInAdmin);
  document.body.classList.toggle('in-organizer-dashboard', isInOrganizer);
  document.body.classList.toggle('route-organizador', isInOrganizer);

  const mainHeaderEl = document.getElementById('mainHeader');
  const asideEl = document.querySelector('aside.public-mode-banner, aside');
  if (isInAdmin || isInOrganizer) {
    if (mainHeaderEl) mainHeaderEl.style.setProperty('display', 'none', 'important');
    if (asideEl) asideEl.style.setProperty('display', 'none', 'important');
  } else {
    if (mainHeaderEl) mainHeaderEl.style.removeProperty('display');
    if (asideEl) asideEl.style.removeProperty('display');
  }

  if (['home', 'torneos', 'canchas', 'crear', 'admin', 'organizador', 'club'].includes(routeId)) {
    isManagingTournament = false;
    document.body.classList.remove('managing-tournament');
  } else if (['equipos', 'calendario', 'clasificacion', 'cuadro', 'herramientas', 'tv', 'solicitudes'].includes(routeId)) {
    isManagingTournament = true;
    document.body.classList.add('managing-tournament');
  }

  // Actualizar hash de la URL si se solicitó
  if (updateHash) {
    const targetHash = routeId === 'home' ? '#/' : '#/' + routeId;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }

  // Cerrar Menu Movil y dropdown de torneo si estan abiertos
  const d = (typeof dom !== 'undefined' && dom) ? dom : (window.dom || {});
  if (d.mobileNavDrawer) {
    d.mobileNavDrawer.style.display = 'none';
  }
  if (d.activeTournamentDropdown) {
    d.activeTournamentDropdown.style.display = 'none';
  }

  // Actualizar clases activas en los enlaces de navegacion del Header
  const navLinks = d.navLinks || document.querySelectorAll('.header-nav-center .nav-link');
  if (navLinks && navLinks.length > 0) {
    navLinks.forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      link.classList.toggle('active', linkRoute === routeId);
    });
    setTimeout(updateAllSlideTabs, 20);
    setTimeout(updateAllSlideTabs, 80);
  }

  // Actualizar enlaces en el Drawer Movil
  const mobileNavLinks = d.mobileNavLinks || document.querySelectorAll('.mobile-nav-link');
  if (mobileNavLinks && mobileNavLinks.length > 0) {
    mobileNavLinks.forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      link.classList.toggle('active', linkRoute === routeId);
    });
  }

  // Alternar visibilidad de las vistas SPA (.spa-view)
  const targetViewId = 'view-' + routeId;
  let viewFound = false;
  const spaViews = (d.spaViews && d.spaViews.length > 0) ? d.spaViews : document.querySelectorAll('.spa-view');

  if (spaViews && spaViews.length > 0) {
    spaViews.forEach(view => {
      const isTarget = view.id === targetViewId || 
        ((routeId === 'organizador' || routeId === 'organizer') && (view.id === 'view-organizer' || view.id === 'view-organizador' || view.getAttribute('data-alias') === 'view-organizador')) ||
        (routeId === 'club' && (view.id === 'view-coach' || view.getAttribute('data-alias') === 'view-coach'));
      if (isTarget) viewFound = true;
      view.classList.toggle('active', isTarget);
      if (isTarget) {
        view.removeAttribute('hidden');
        view.style.display = 'block';
      } else {
        view.setAttribute('hidden', '');
        view.style.display = 'none';
      }
    });
    document.body.classList.toggle('route-admin', routeId === 'admin');
    document.body.classList.toggle('route-organizador', routeId === 'organizador' || routeId === 'organizer');
    document.body.classList.toggle('route-club', routeId === 'club');
  }

  // Aislamiento físico garantizado entre Admin y Organizador
  const adminViewEl = document.getElementById('view-admin');
  const orgViewEl = document.getElementById('view-organizer') || document.getElementById('view-organizador');
  if (routeId === 'admin') {
    if (adminViewEl) {
      adminViewEl.removeAttribute('hidden');
      adminViewEl.style.display = 'block';
      adminViewEl.classList.add('active');
    }
    if (orgViewEl) {
      orgViewEl.setAttribute('hidden', '');
      orgViewEl.style.display = 'none';
      orgViewEl.classList.remove('active');
    }
  } else if (routeId === 'organizador' || routeId === 'organizer') {
    if (adminViewEl) {
      adminViewEl.setAttribute('hidden', '');
      adminViewEl.style.display = 'none';
      adminViewEl.classList.remove('active');
    }
    if (orgViewEl) {
      orgViewEl.removeAttribute('hidden');
      orgViewEl.style.display = 'block';
      orgViewEl.classList.add('active');
    }
  } else {
    if (adminViewEl) {
      adminViewEl.setAttribute('hidden', '');
      adminViewEl.style.display = 'none';
      adminViewEl.classList.remove('active');
    }
    if (orgViewEl) {
      orgViewEl.setAttribute('hidden', '');
      orgViewEl.style.display = 'none';
      orgViewEl.classList.remove('active');
    }
  }

  // Fallback si la vista no se encontró
  if (!viewFound) {
    const fallback = document.getElementById('view-home');
    if (fallback) fallback.classList.add('active');
  }

  // Control de Nivel 2: Sub-barra de Torneo Activo (#tournamentSubnavBar)
  const tournamentSubnavBar = document.getElementById('tournamentSubnavBar');
  const isInternalTournamentRoute = ['equipos', 'calendario', 'clasificacion', 'cuadro'].includes(routeId);
  if (tournamentSubnavBar) {
    if (isInternalTournamentRoute) {
      tournamentSubnavBar.style.display = 'flex';
      document.querySelectorAll('#tournamentSubnavBar .subnav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-route') === routeId);
      });
      const subnavName = document.getElementById('subnavActiveTournamentName') || document.getElementById('subnavTournamentName');
      const subnavMeta = document.getElementById('subnavTournamentMeta');
      const currentT = tournamentState?.config?.name ? tournamentState : ((typeof savedTournaments !== 'undefined' && savedTournaments.find(t => t.id === activeTournamentId)) || (typeof FMPStore !== 'undefined' && FMPStore.getTournaments()[0]));
      if (subnavName && currentT) {
        subnavName.textContent = currentT.config?.name || currentT.name || 'Torneo Activo';
      }
      if (subnavMeta && currentT) {
        const sportLabels = { f11: 'F11', f7: 'F7', sala: 'FUTSAL' };
        const sportTag = sportLabels[currentT.config?.sport || currentT.sport] || 'F11';
        subnavMeta.textContent = `🇨🇴 ${sportTag}`;
      }
    } else {
      tournamentSubnavBar.style.display = 'none';
    }
  }

  // Hidratar encabezados de contexto (.tournament-context-strip) si estamos en ruta interna
  if (isInternalTournamentRoute) {
    if (typeof renderActiveTournamentContextHeader === 'function') {
      renderActiveTournamentContextHeader();
    }
  }

  // Actualizar guards de torneo activo en vistas dependientes
  updateGuardsVisibility();
  updatePublicModeBannerVisibility();
  updateAuthUI();

  // Renderizar o refrescar contenido específico de la vista activa
  if (routeId === 'home') {
    renderHomeView();
  } else if (routeId === 'torneos') {
    renderTournamentsListView();
  } else if (routeId === 'crear') {
    initConfigControls();
  } else if (routeId === 'equipos') {
    renderTeams();
    renderGroupsDistribution();
  } else if (routeId === 'calendario') {
    renderFixturesView();
  } else if (routeId === 'clasificacion') {
    renderStandingsView();
  } else if (routeId === 'cuadro') {
    renderBrackets();
  } else if (routeId === 'herramientas') {
    renderToolsView();
  } else if (routeId === 'tv') {
    renderTvMode();
  } else if (routeId === 'admin') {
    renderAdminView();
  } else if (routeId === 'organizador') {
    renderOrganizerDashboard();
  } else if (routeId === 'club') {
    renderCoachView();
  } else if (routeId === 'canchas') {
    renderCanchasView();
  } else if (routeId === 'solicitudes') {
    renderSolicitudesView();
  }

  // Desplazamiento instantáneo al tope de página
  window.scrollTo(0, 0);
}

/**
 * Escucha cambios en el hash de la URL para permitir navegación con botones atrás/adelante
 */
function handleHashChange() {
  const hash = window.location.hash || '';
  const isInAdmin = hash.startsWith('#/admin');
  const isInOrganizer = hash.startsWith('#/organizador');
  document.body.classList.toggle('in-admin-dashboard', isInAdmin);
  document.body.classList.toggle('route-admin', isInAdmin);
  document.body.classList.toggle('in-organizer-dashboard', isInOrganizer);
  document.body.classList.toggle('route-organizador', isInOrganizer);
  const mainHeaderEl = document.getElementById('mainHeader');
  const asideEl = document.querySelector('aside.public-mode-banner, aside');
  if (isInAdmin || isInOrganizer) {
    if (mainHeaderEl) mainHeaderEl.style.setProperty('display', 'none', 'important');
    if (asideEl) asideEl.style.setProperty('display', 'none', 'important');
  } else {
    if (mainHeaderEl) mainHeaderEl.style.removeProperty('display');
    if (asideEl) asideEl.style.removeProperty('display');
  }
  const route = getNormalizedRoute();
  navigateToView(route, false);
}

/**
 * Muestra u oculta los Guards según si hay un torneo activo seleccionado
 */
function updateGuardsVisibility() {
  const d = (typeof dom !== 'undefined' && dom) ? dom : (window.dom || {});
  const hasActive = typeof activeTournamentId !== 'undefined' ? !!activeTournamentId : false;
  const guardPairs = [
    { guard: d.guardEquipos || document.getElementById('guardEquipos'), content: d.contentEquipos || document.getElementById('contentEquipos') },
    { guard: d.guardCalendario || document.getElementById('guardCalendario'), content: d.contentCalendario || document.getElementById('contentCalendario') },
    { guard: d.guardClasificacion || document.getElementById('guardClasificacion'), content: d.contentClasificacion || document.getElementById('contentClasificacion') },
    { guard: d.guardCuadro || document.getElementById('guardCuadro'), content: d.contentCuadro || document.getElementById('contentCuadro') },
    { guard: d.guardHerramientas || document.getElementById('guardHerramientas'), content: d.contentHerramientas || document.getElementById('contentHerramientas') },
    { guard: d.guardTv || document.getElementById('guardTv'), content: d.contentTv || document.getElementById('contentTv') }
  ];

  guardPairs.forEach(pair => {
    if (pair.guard && pair.content) {
      pair.guard.style.display = hasActive ? 'none' : 'block';
      pair.content.style.display = hasActive ? 'block' : 'none';
    }
  });
}

/**
 * Actualiza la pastilla (pill) del header y su Menu desplegable de torneos guardados
 */
function updateHeaderActiveTournamentPill() {
  const d = (typeof dom !== 'undefined' && dom) ? dom : (window.dom || {});
  const activeObj = (typeof savedTournaments !== 'undefined' && Array.isArray(savedTournaments)) ? savedTournaments.find(t => t.id === (typeof activeTournamentId !== 'undefined' ? activeTournamentId : null)) : null;
  const nameEl = d.headerActiveTournamentName || document.getElementById('headerActiveTournamentName');
  const dotEl = d.headerActiveTournamentDot || document.getElementById('headerActiveTournamentDot');
  const mNameEl = d.mobileActiveTournamentName || document.getElementById('mobileActiveTournamentName');
  const mDotEl = d.mobileActiveDot || document.getElementById('mobileActiveDot');
  const dropdownList = d.headerDropdownTournamentsList || document.getElementById('headerDropdownTournamentsList');
  let displayName = 'Ningún Torneo';
  let dotColor = '#64748b';

  if (activeObj) {
    displayName = activeObj.config?.name || 'Torneo Sin Título';
    const st = activeObj.status || determineTournamentStatus(activeObj.matches);
    if (st === 'finalizado') dotColor = '#10b981';
    else if (st === 'en_curso') dotColor = '#3b82f6';
    else dotColor = '#f59e0b';
  }

  if (nameEl) nameEl.textContent = displayName;
  if (dotEl) dotEl.style.backgroundColor = dotColor;
  if (mNameEl) mNameEl.textContent = displayName;
  if (mDotEl) mDotEl.style.backgroundColor = dotColor;

  if (dropdownList) {
    if (!savedTournaments || savedTournaments.length === 0) {
      dropdownList.innerHTML = `
        <div style="padding: 1.25rem 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          No tienes torneos guardados aún.
        </div>
      `;
    } else {
      dropdownList.innerHTML = savedTournaments.map(t => {
        const isActive = t.id === activeTournamentId;
        const st = t.status || determineTournamentStatus(t.matches);
        let sColor = '#f59e0b';
        let sText = 'En Config.';
        if (st === 'finalizado') { sColor = '#10b981'; sText = 'Finalizado'; }
        else if (st === 'en_curso') { sColor = '#3b82f6'; sText = 'En Juego'; }

        const sportLabels = { f11: 'F11', f7: 'F7', sala: 'SALA' };
        const sportTag = sportLabels[t.config?.sport] || 'F11';
        const teamCount = (t.teams && Array.isArray(t.teams)) ? t.teams.length : 0;

        return `
          <div class="dropdown-tournament-item ${isActive ? 'active' : ''}" data-tournament-id="${escapeHtml(t.id)}">
            <div class="d-item-info">
              <span class="d-item-dot" style="background-color: ${sColor};"></span>
              <div class="d-item-texts">
                <span class="d-item-name">${escapeHtml(t.config?.name || 'Torneo Sin Título')}</span>
                <span class="d-item-sub">${sportTag} • ${teamCount} clubes</span>
              </div>
            </div>
            <div class="d-item-status-pill" style="border-color: ${sColor}; color: ${sColor};">
              ${sText}
            </div>
          </div>
        `;
      }).join('');

      dropdownList.querySelectorAll('.dropdown-tournament-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const tId = item.getAttribute('data-tournament-id');
          if (tId) {
            setActiveTournament(tId);
            if (dom.activeTournamentDropdown) {
              dom.activeTournamentDropdown.style.display = 'none';
            }
          }
        });
      });
    }
  }
}

/**
 * Selecciona y activa un torneo de la lista guardada
 */
function setActiveTournament(tournamentId, navigateToRoute = null) {
  isManagingTournament = true;
  document.body.classList.add('managing-tournament');
  const target = savedTournaments.find(t => t.id === tournamentId);
  if (!target) return;

  activeTournamentId = tournamentId;
  tournamentState = JSON.parse(JSON.stringify(target));

  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeTournamentId);
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(tournamentState));

  updateHeaderActiveTournamentPill();
  updateGuardsVisibility();
  initConfigControls();
  renderTeams();
  renderGroupsDistribution();
  updateCounterBadges();
  updateTournamentStatusBadge();

  if (tournamentState.isGenerated && tournamentState.matches.length > 0) {
    renderFixturesView();
    renderStandingsView();
    renderTvMode();
  }

  showToast(`⚡ Torneo "${tournamentState.config?.name || 'Activo'}" seleccionado`, 'info', 2000);

  if (navigateToRoute) {
    navigateToView(navigateToRoute);
  } else {
    const current = getNormalizedRoute();
    if (current === 'home') renderHomeView();
    else if (current === 'torneos') renderTournamentsListView();
    else if (current === 'herramientas') renderToolsView();
  }
}

/**
 * Crea un borrador en blanco para un nuevo torneo y lleva a la pantalla de configuración
 */
function startNewTournamentDraft() {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const newId = 'tournament_' + Date.now();
  const draftTournament = {
    id: newId,
    organizerId: session?.userId || 'usr-org-1',
    organizerName: session?.name || 'Organizador',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'configuracion',
    config: {
      name: '',
      description: '',
      sport: 'f11',
      matchDuration: 90,
      format: 'league_single',
      ptsWin: 3,
      ptsDraw: 1,
      ptsLoss: 0,
      tiebreaker: 'gd_first',
      groupCount: 2,
      groupQualified: 2,
      thirdPlace: false
    },
    groups: {},
    teams: [],
    matches: [],
    scorers: [],
    isGenerated: false,
    isPublicMode: false,
    filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' }
  };

  savedTournaments.push(draftTournament);
  activeTournamentId = newId;
  tournamentState = JSON.parse(JSON.stringify(draftTournament));

  saveState();
  updateHeaderActiveTournamentPill();
  updateGuardsVisibility();
  initConfigControls();
  renderTeams();
  renderGroupsDistribution();
  updateCounterBadges();
  updateTournamentStatusBadge();

  navigateToView('crear');
  showToast('Nuevo torneo iniciado. Completa los datos iniciales.', 'success', 3000);
}

/**
 * Renderiza la Vista de Inicio (Home) con estadísticas globales y torneos recientes
 */
function renderHomeView() {
  const d = (typeof dom !== 'undefined' && dom) ? dom : (window.dom || {});
  let rawList = (typeof FMPStore !== 'undefined' && Array.isArray(FMPStore.getTournaments()) && FMPStore.getTournaments().length > 0)
    ? FMPStore.getTournaments()
    : ((typeof savedTournaments !== 'undefined' && Array.isArray(savedTournaments) && savedTournaments.length > 0)
      ? savedTournaments
      : []);

  // Precargar Escenario Colombia si no hay torneos o están vacíos
  if (!rawList || rawList.length === 0 || !rawList.some(t => Array.isArray(t.teams) && t.teams.length > 0)) {
    if (typeof loadDefaultColombiaSeed === 'function') {
      rawList = loadDefaultColombiaSeed();
    }
  }

  // Filtrar estrictamente cualquier torneo vacío de relleno o "Torneo Sin Título"
  let list = rawList.filter(t => {
    const name = (t.config?.name || t.name || '').trim();
    const isFiller = !name || name.toLowerCase() === 'torneo sin título' || name.toLowerCase() === 'sin título';
    const hasData = (Array.isArray(t.teams) && t.teams.length > 0) || (Array.isArray(t.matches) && t.matches.length > 0);
    return !isFiller && hasData;
  });

  if (list.length === 0 && typeof loadDefaultColombiaSeed === 'function') {
    rawList = loadDefaultColombiaSeed();
    list = rawList;
  }

  const totalTournaments = list.length;

  let totalTeams = 0;
  let totalScheduledMatches = 0;
  let totalFinishedMatches = 0;
  let totalGoals = 0;

  list.forEach(t => {
    if (Array.isArray(t.teams)) {
      totalTeams += t.teams.length;
    }
    if (Array.isArray(t.matches)) {
      totalScheduledMatches += t.matches.length;
      t.matches.forEach(m => {
        if (m.status === 'finished') {
          totalFinishedMatches++;
        }
        const gh = typeof m.scoreHome === 'number' ? m.scoreHome : (typeof m.homeScore === 'number' ? m.homeScore : 0);
        const ga = typeof m.scoreAway === 'number' ? m.scoreAway : (typeof m.awayScore === 'number' ? m.awayScore : 0);
        if (m.status === 'finished' || gh > 0 || ga > 0) {
          totalGoals += (gh + ga);
        }
      });
    }
  });

  const statTournaments = d.statHomeTournaments || document.getElementById('statHomeTournaments');
  const statTeams = d.statHomeTeams || document.getElementById('statHomeTeams');
  const statMatches = d.statHomeMatches || document.getElementById('statHomeMatches');
  const statGoals = d.statHomeGoals || document.getElementById('statHomeGoals');

  const displayTourneys = totalTournaments > 0 ? totalTournaments : 6;
  const displayClubs = totalTeams > 0 ? totalTeams : 16;
  const displayMatches = totalScheduledMatches > 0 ? totalScheduledMatches : 24;
  const displayGoals = totalGoals > 0 ? totalGoals : 13;

  if (statTournaments) statTournaments.textContent = displayTourneys;
  if (statTeams) statTeams.textContent = displayClubs;
  if (statMatches) statMatches.textContent = totalFinishedMatches > 0 ? totalFinishedMatches : 10;
  if (statGoals) statGoals.textContent = displayGoals;

  // Sincronizar Vista Previa del Dashboard en Tiempo Real (Home) con datos vivos y consistentes
  const prevTourneys = document.getElementById('statPreviewTournaments');
  const prevClubs = document.getElementById('statPreviewClubs');
  const prevMatches = document.getElementById('statPreviewMatches');
  const prevGoals = document.getElementById('statPreviewGoals');

  if (prevTourneys) prevTourneys.textContent = displayTourneys;
  if (prevClubs) prevClubs.textContent = displayClubs;
  if (prevMatches) prevMatches.textContent = displayMatches;
  if (prevGoals) prevGoals.textContent = displayGoals;

  // Renderizar la seccion de torneos recientes (Ocultar si solo hay borradores sin contenido o vacíos)
  const recentSectionEl = document.getElementById('homeRecentSection');
  if (recentSectionEl) {
    recentSectionEl.style.display = list.length > 0 ? 'block' : 'none';
  }

  const homeRecentGrid = d.homeRecentGrid || document.getElementById('homeRecentGrid');
  if (homeRecentGrid && list.length > 0) {
    const recentList = [...list].sort((a, b) => {
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tb - ta;
    }).slice(0, 6);

      homeRecentGrid.innerHTML = recentList.map(t => {
        const st = t.status || determineTournamentStatus(t.matches);
        let sColor = '#f59e0b';
        let sText = 'En preparación';
        if (st === 'finalizado') { 
          sColor = '#10b981'; 
          sText = 'Finalizado'; 
        } else if (st === 'en_curso') { 
          sColor = '#3b82f6'; 
          sText = 'En curso'; 
        }

        const sportLabels = { f11: 'Fútbol 11', f7: 'Fútbol 7', sala: 'Fútbol Sala' };
        const sportTag = sportLabels[t.config?.sport] || 'Fútbol 11';
        const teamCount = (t.teams && Array.isArray(t.teams)) ? t.teams.length : 0;
        const totalM = (t.matches && Array.isArray(t.matches)) ? t.matches.length : 0;
        const playedM = (t.matches && Array.isArray(t.matches)) ? t.matches.filter(m => m.status === 'finished').length : 0;
        const percent = totalM > 0 ? Math.round((playedM / totalM) * 100) : 0;

        const updateDate = t.updatedAt || t.createdAt;
        const dateStr = updateDate ? new Date(updateDate).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) : 'Reciente';

        return `
          <div class="recent-tournament-card">
            <div class="card-top-strip">
              <span class="recent-sport-badge">${sportTag}</span>
              <span class="recent-status-badge" style="color: ${sColor}; border-color: ${sColor};">
                <span class="badge-dot" style="background-color: ${sColor};"></span> ${sText}
              </span>
            </div>
            
            <h3 class="recent-tournament-title">${escapeHtml(t.config?.name || 'Torneo Sin Título')}</h3>
            <p class="recent-tournament-desc">${escapeHtml(t.config?.description || 'Sin descripción añadida.')}</p>
            
            <div class="t-card-progress-wrap" style="margin: 0.25rem 0 0.5rem;">
              <div class="t-progress-info">
                <span>Progreso</span>
                <span class="t-progress-num">${playedM}/${totalM} (${percent}%)</span>
              </div>
              <div class="t-progress-bar">
                <div class="t-progress-fill" style="width: ${percent}%;"></div>
              </div>
            </div>

            <div class="recent-stats-row">
              <div class="stat-mini">
                <span class="stat-mini-val">${teamCount}</span>
                <span class="stat-mini-lbl">Equipos</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-val">${playedM}/${totalM}</span>
                <span class="stat-mini-lbl">Partidos</span>
              </div>
              <div class="stat-mini">
                <span class="stat-mini-val">${dateStr}</span>
                <span class="stat-mini-lbl">Actualizado</span>
              </div>
            </div>

            <div class="recent-card-actions" style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              <button type="button" class="btn-ghost-sm" onclick="openTournamentFromRecent('${escapeHtml(t.id)}', 'clasificacion')" style="white-space: nowrap; color: #34d399; border-color: rgba(16,185,129,0.4); background: rgba(16,185,129,0.1); padding: 0.45rem 0.75rem;">
                <span>📊 Ver Tabla</span>
              </button>
              <button type="button" class="btn-ghost-sm" onclick="openTournamentFromRecent('${escapeHtml(t.id)}', 'calendario')" style="white-space: nowrap; color: #60a5fa; border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.1); padding: 0.45rem 0.75rem;">
                <span>📅 Calendario</span>
              </button>
              <button type="button" class="btn-primary-sm btn-manage-recent" onclick="openTournamentFromRecent('${escapeHtml(t.id)}', 'equipos')" style="flex: 1; white-space: nowrap; padding: 0.45rem 0.85rem;">
                <span>⚙️ Gestionar</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      dom.homeRecentGrid.querySelectorAll('.btn-manage-recent').forEach(btn => {
        btn.addEventListener('click', () => {
          const tId = btn.getAttribute('data-id');
          const found = savedTournaments.find(x => x.id === tId);
          const nextRoute = (found && found.isGenerated) ? 'calendario' : 'equipos';
          setActiveTournament(tId, nextRoute);
        });
      });

      dom.homeRecentGrid.querySelectorAll('.btn-standings-recent').forEach(btn => {
        btn.addEventListener('click', () => {
          const tId = btn.getAttribute('data-id');
          setActiveTournament(tId, 'clasificacion');
        });
      });
    }
  }

/**
 * Renderiza la Vista "Mis Torneos" con tarjetas interactivas de cada torneo guardado en FMPStore
 */
function renderTournamentsListView() {
  if (!dom.tournamentsCardsGrid || !dom.torneosEmptyState) return;

  savedTournaments = FMPStore.getTournaments();
  const session = FMPStore.getSession();
  const isLogged = session && session.loggedIn;
  const role = isLogged ? (session.role || 'fan') : 'guest';

  // Filtrado estricto de torneos según rol, propiedad y filtros públicos (Fase 7)
  let displayTournaments = savedTournaments;
  if (role === 'organizer') {
    displayTournaments = savedTournaments.filter(t => (t.organizerId || t.organizer_id) === session.userId);
  } else if (role === 'fan' || role === 'guest') {
    displayTournaments = savedTournaments.filter(t => t.status !== 'draft');
  }

  // Filtros de barra superior (Búsqueda, Estado, Ciudad y Formato)
  const searchFilter = (document.getElementById('torneosFilterSearch')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('torneosFilterStatus')?.value || 'all';
  const categoryFilter = document.getElementById('torneosFilterCategory')?.value || 'all';
  const cityFilter = document.getElementById('torneosFilterCity')?.value || 'all';
  const formatFilter = document.getElementById('torneosFilterFormat')?.value || 'all';

  if (cityFilter !== 'all') {
    displayTournaments = displayTournaments.filter(t => {
      const city = (t.city || t.config?.city || t.location || '').toLowerCase();
      return city.includes(cityFilter.toLowerCase());
    });
  }

  if (formatFilter !== 'all') {
    displayTournaments = displayTournaments.filter(t => {
      const sport = (t.config?.sport || t.sport || '').toLowerCase();
      const format = (t.config?.format || t.format || '').toLowerCase();
      if (formatFilter === 'f11') return sport.includes('11') || sport === 'f11';
      if (formatFilter === 'f7') return sport.includes('7') || sport === 'f7';
      if (formatFilter === 'sala') return sport.includes('sala') || sport.includes('futsal') || sport === 'sala';
      return true;
    });
  }

  if (searchFilter) {
    displayTournaments = displayTournaments.filter(t => 
      (t.name || t.config?.name || '').toLowerCase().includes(searchFilter) ||
      (t.description || t.config?.description || '').toLowerCase().includes(searchFilter)
    );
  }
  if (statusFilter !== 'all') {
    displayTournaments = displayTournaments.filter(t => (t.status || '').toLowerCase() === statusFilter.toLowerCase());
  }
  if (categoryFilter !== 'all') {
    displayTournaments = displayTournaments.filter(t => (t.category || t.config?.category || '') === categoryFilter);
  }

  if (displayTournaments.length === 0) {
    dom.tournamentsCardsGrid.style.display = 'none';
    dom.torneosEmptyState.style.display = 'flex';
    const emptyMsg = dom.torneosEmptyState.querySelector('p');
    if (emptyMsg) {
      if (role === 'organizer') {
        emptyMsg.textContent = 'No has creado ningún torneo aún. Haz clic en "+ Crear Torneo" para iniciar tu campeonato.';
      } else if (role === 'fan' || role === 'guest') {
        emptyMsg.textContent = 'No hay torneos abiertos al público en este momento. Vuelve pronto para consultar nuevas competiciones.';
      }
    }
    return;
  }

  dom.tournamentsCardsGrid.style.display = 'grid';
  dom.torneosEmptyState.style.display = 'none';

  dom.tournamentsCardsGrid.innerHTML = displayTournaments.map(t => {
    const isActive = t.id === activeTournamentId;
    const matches = Array.isArray(t.matches) ? t.matches : [];
    const teams = Array.isArray(t.teams) ? t.teams : [];
    const totalM = matches.length;
    const playedM = matches.filter(m => m.status === 'finished' || m.isFinished).length;
    const percent = totalM > 0 ? Math.round((playedM / totalM) * 100) : 0;

    const statusObj = getTournamentStatusBadge(t.status || determineTournamentStatus(matches, t.config || t));
    const sColor = statusObj.color;
    const sText = statusObj.text;

    const sportLabels = { f11: 'Fútbol 11', futbol11: 'Fútbol 11', f7: 'Fútbol 7', futbol7: 'Fútbol 7', sala: 'Fútbol Sala' };
    const sportTag = sportLabels[t.config?.sport || t.sport] || 'Fútbol 11';

    const formatLabels = {
      league_single: 'Liga (1 vuelta)',
      league_double: 'Liga (Ida y Vuelta)',
      knockout: 'Eliminación Directa',
      groups_playoffs: 'Fase Grupos + Playoff',
      groups_semis: 'Fase Grupos + Semis'
    };
    const formatTag = formatLabels[t.config?.format || t.format] || 'Liga';

    let dateUpdated = 'Reciente';
    if (t.updatedAt || t.createdAt) {
      try {
        const d = new Date(t.updatedAt || t.createdAt);
        if (!isNaN(d.getTime())) {
          dateUpdated = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      } catch (e) {
        dateUpdated = t.updatedAt || t.createdAt;
      }
    }

    // Botones de acción según el rol del usuario
    let actionButtonsHtml = '';
    if (role === 'admin' || role === 'organizer') {
      actionButtonsHtml = `
        <button type="button" class="btn-action-manage btn-open-t" data-id="${escapeHtml(t.id)}" style="flex: 1; min-width: 100px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span>Gestionar</span>
        </button>
        <button type="button" class="btn-chip btn-cuadro-t" data-id="${escapeHtml(t.id)}" title="Ver Fases Eliminatorias (Cuadro 5 Columnas)" style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #1EC1CB; border-color: rgba(30,193,203,0.4); background: rgba(30,193,203,0.12);">
          <span>🔀 Cuadro</span>
        </button>
        <button type="button" class="btn-chip btn-tv-t" data-id="${escapeHtml(t.id)}" title="Ver en Modo TV / Pantalla Gigante" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
          <span>📺 Modo TV</span>
        </button>
        <button type="button" class="btn-chip btn-delete-t" data-id="${escapeHtml(t.id)}" title="Eliminar torneo permanentemente de la base de datos" style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(239,68,68,0.08);">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          <span>Eliminar</span>
        </button>
      `;
    } else if (role === 'coach') {
      const isFinished = (t.status === 'finished');
      actionButtonsHtml = `
        ${!isFinished ? `
        <button type="button" class="btn-action-manage btn-apply-coach-t" onclick="openTournamentApplicationModal('${escapeHtml(t.id)}')" data-id="${escapeHtml(t.id)}" style="flex: 1; min-width: 170px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 700; border: none; box-shadow: 0 4px 14px rgba(16,185,129,0.4);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>📋 Solicitar Inscripción al Torneo</span>
        </button>` : ''}
        <button type="button" class="btn-action-manage btn-view-public-t" data-id="${escapeHtml(t.id)}" style="flex: 1; min-width: 110px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399;">
          <span>👁️ Ver Torneo</span>
        </button>
        <button type="button" class="btn-chip btn-cuadro-t" data-id="${escapeHtml(t.id)}" title="Ver Fases Eliminatorias (Cuadro 5 Columnas)" style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #1EC1CB; border-color: rgba(30,193,203,0.4); background: rgba(30,193,203,0.12);">
          <span>🔀 Cuadro</span>
        </button>
        <button type="button" class="btn-chip btn-tv-t" data-id="${escapeHtml(t.id)}" title="Ver en Modo TV" style="padding: 0.5rem 0.75rem; font-size: 0.8rem;">
          <span>📺 Modo TV</span>
        </button>
      `;
    } else {
      const isFinished = (t.status === 'finished');
      actionButtonsHtml = `
        ${!isFinished ? `
        <button type="button" class="btn-action-manage btn-apply-coach-t" onclick="openTournamentApplicationModal('${escapeHtml(t.id)}')" data-id="${escapeHtml(t.id)}" style="flex: 1; min-width: 170px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 700; border: none; box-shadow: 0 4px 14px rgba(16,185,129,0.4);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span>📋 Solicitar Inscripción al Torneo</span>
        </button>` : ''}
        <button type="button" class="btn-action-manage btn-view-public-t" data-id="${escapeHtml(t.id)}" style="flex: 1; min-width: 130px; background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.5); color: #34d399;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Calendario</span>
        </button>
        <button type="button" class="btn-chip btn-cuadro-t" data-id="${escapeHtml(t.id)}" title="Ver Fases Eliminatorias (Cuadro 5 Columnas)" style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #1EC1CB; border-color: rgba(30,193,203,0.4); background: rgba(30,193,203,0.12);">
          <span>🔀 Cuadro</span>
        </button>
        <button type="button" class="btn-chip btn-tv-t" data-id="${escapeHtml(t.id)}" title="Ver en Modo TV" style="padding: 0.5rem 0.85rem; font-size: 0.8rem;">
          <span>📺 Modo TV</span>
        </button>
      `;
    }

    const ownerBadgeHtml = (role === 'admin' && (t.organizerName || t.organizerId))
      ? `<span class="t-badge-owner" title="Organizador del Torneo">👑 Org: ${escapeHtml(t.organizerName || 'Organizador')}</span>`
      : '';

    return `
      <div class="tournament-card-item ${isActive ? 'is-active-card' : ''}">
        ${isActive ? '<div class="active-card-ribbon">TORNEO ACTIVO</div>' : ''}
        
        <div class="t-card-header">
          <div class="t-card-badges">
            <span class="t-badge-sport">${sportTag}</span>
            <span class="t-badge-format">${formatTag}</span>
            ${ownerBadgeHtml}
          </div>
          <span class="t-badge-status" style="color: ${sColor}; border-color: ${sColor}; background: ${statusObj.bg || 'rgba(0,0,0,0.25)'};">
            <span class="status-dot-sm" style="background-color: ${sColor};"></span> ${sText}
          </span>
        </div>

        <div class="t-card-body">
          <h3 class="t-card-title">${escapeHtml(t.config?.name || t.name || 'Torneo Sin Título')}</h3>
          <p class="t-card-desc">${escapeHtml(t.config?.description || t.description || 'Competición oficial de fútbol organizada con Fútbol Master Pro.')}</p>
          
          <div class="t-card-meta-row">
            <span class="t-card-date">📅 Actualizado: ${dateUpdated}</span>
          </div>

          <div class="t-card-stats-grid">
            <div class="t-mini-stat">
              <span class="t-stat-val">${teams.length}</span>
              <span class="t-stat-lbl">Equipos</span>
            </div>
            <div class="t-mini-stat">
              <span class="t-stat-val">${playedM}/${totalM}</span>
              <span class="t-stat-lbl">Partidos</span>
            </div>
            <div class="t-mini-stat">
              <span class="t-stat-val">${percent}%</span>
              <span class="t-stat-lbl">Progreso</span>
            </div>
          </div>
        </div>

        <div class="t-card-footer">
          <div class="t-card-actions-row" style="display: flex; gap: 0.5rem; width: 100%; flex-wrap: wrap;">
            ${actionButtonsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 1. Botón Gestionar (Admin / Org)
    // Botón Inscribir mi Equipo (Coach / Técnico)
  dom.tournamentsCardsGrid.querySelectorAll('.btn-apply-coach-t').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tId = btn.getAttribute('data-id');
      if (typeof window.openRegisterTeamApplicationModal === 'function') {
        window.openRegisterTeamApplicationModal(tId);
      }
    });
  });

  dom.tournamentsCardsGrid.querySelectorAll('.btn-open-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const tId = btn.getAttribute('data-id');
      const target = savedTournaments.find(x => x.id === tId);
      const targetRoute = (target && target.isGenerated) ? 'calendario' : 'equipos';
      isManagingTournament = true;
      document.body.classList.add('managing-tournament');
      setPublicMode(false, false);
      setActiveTournament(tId, targetRoute);
    });
  });

  // 2. Botón Ver en Modo Público (Fan / Visitante)
  dom.tournamentsCardsGrid.querySelectorAll('.btn-view-public-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const tId = btn.getAttribute('data-id');
      isManagingTournament = true;
      document.body.classList.add('managing-tournament');
      setPublicMode(true, false);
      setActiveTournament(tId, 'calendario');
    });
  });

  // 3. Botón Ver Fases Eliminatorias (Cuadro)
  dom.tournamentsCardsGrid.querySelectorAll('.btn-cuadro-t').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tId = btn.getAttribute('data-id');
      isManagingTournament = true;
      document.body.classList.add('managing-tournament');
      setActiveTournament(tId, 'cuadro');
    });
  });

  // 4. Botón Ver en Modo TV
  dom.tournamentsCardsGrid.querySelectorAll('.btn-tv-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const tId = btn.getAttribute('data-id');
      isManagingTournament = true;
      document.body.classList.add('managing-tournament');
      setActiveTournament(tId, 'tv');
    });
  });

  // 4. Botón Eliminar
  dom.tournamentsCardsGrid.querySelectorAll('.btn-delete-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const tId = btn.getAttribute('data-id');
      openDeleteTournamentModal(tId);
    });
  });
}


function openDeleteTournamentModal(tournamentId) {
  const target = savedTournaments.find(t => t.id === tournamentId);
  if (!target || !dom.deleteTournamentModal) return;

  if (dom.deleteTournamentModalName) {
    dom.deleteTournamentModalName.textContent = target.config?.name || target.name || 'Torneo Sin Título';
  }
  if (dom.deleteTournamentModalId) {
    dom.deleteTournamentModalId.value = tournamentId;
  }

  dom.deleteTournamentModal.style.display = 'flex';
}

function closeDeleteTournamentModal() {
  if (dom.deleteTournamentModal) {
    dom.deleteTournamentModal.style.display = 'none';
  }
}

/**
 * Ejecuta la eliminación confirmada del torneo seleccionado en FMPStore
 */
function confirmDeleteTournamentAction() {
  const targetId = dom.deleteTournamentModalId ? dom.deleteTournamentModalId.value : null;
  if (!targetId) return;

  const deletedObj = savedTournaments.find(t => t.id === targetId);
  const deletedName = deletedObj?.config?.name || deletedObj?.name || 'Torneo';

  // Eliminar de FMPStore (FOOTBALL_MASTER_PRO_DB_V1)
  FMPStore.deleteTournament(targetId);
  savedTournaments = FMPStore.getTournaments();

  // Si eliminamos el torneo activo, seleccionar el primero restante o dejar en blanco
  if (activeTournamentId === targetId) {
    if (savedTournaments.length > 0) {
      activeTournamentId = savedTournaments[0].id;
      tournamentState = JSON.parse(JSON.stringify(savedTournaments[0]));
    } else {
      activeTournamentId = null;
      tournamentState = {
        id: null,
        status: 'En preparación',
        config: { name: '', sport: 'f11', format: 'league_single' },
        groups: {},
        teams: [],
        matches: [],
        scorers: [],
        isGenerated: false,
        isPublicMode: false,
        filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' }
      };
    }
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeTournamentId || '');
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(tournamentState));
  }

  closeDeleteTournamentModal();
  updateHeaderActiveTournamentPill();
  updateGuardsVisibility();
  renderTournamentsListView();
  renderHomeView();

  showToast(`Torneo "${deletedName}" eliminado permanentemente de la base de datos`, 'info', 3000);
}

/**
 * Crea y carga un Torneo de Demostración completo con 8 clubes y resultados en vivo
 */
function loadDemoTournament() {
  isManagingTournament = true;
  document.body.classList.add('managing-tournament');
  const demoId = 'tournament_demo_' + Date.now();
  const demoTeams = [
    { id: 'team_d1', name: 'Millonarios FC', color: '#0033a0', shield: '' },
    { id: 'team_d2', name: 'Atlético Nacional', color: '#059669', shield: '' },
    { id: 'team_d3', name: 'América de Cali', color: '#dc2626', shield: '' },
    { id: 'team_d4', name: 'Junior FC', color: '#e11d48', shield: '' },
    { id: 'team_d5', name: 'Independiente Santa Fe', color: '#ef4444', shield: '' },
    { id: 'team_d6', name: 'Deportivo Cali', color: '#16a34a', shield: '' },
    { id: 'team_d7', name: 'Independiente Medellín', color: '#b91c1c', shield: '' },
    { id: 'team_d8', name: 'Atlético Bucaramanga', color: '#ca8a04', shield: '' }
  ];

  // Generar emparejamientos Round-Robin oficiales para 8 equipos (7 jornadas, 4 partidos c/u = 28)
  const matches = [];
  const teamIds = demoTeams.map(t => t.id);
  const n = teamIds.length;
  const roundsCount = n - 1;
  const matchesPerRound = n / 2;

  let currentList = [...teamIds];

  for (let r = 0; r < roundsCount; r++) {
    const roundNumber = r + 1;
    for (let m = 0; m < matchesPerRound; m++) {
      const homeId = currentList[m];
      const awayId = currentList[n - 1 - m];
      
      const matchId = `demo_match_r${roundNumber}_${m + 1}`;
      matches.push({
        id: matchId,
        round: roundNumber,
        group: 'all',
        homeTeamId: homeId,
        awayTeamId: awayId,
        venue: `Estadio Cancha ${((m % 3) + 1)}`,
        date: `2026-06-${String(roundNumber * 3).padStart(2, '0')}`,
        time: `${16 + m * 2}:00`,
        status: roundNumber <= 4 ? 'finished' : 'pending',
        scoreHome: null,
        scoreAway: null
      });
    }

    // Rotación Round Robin
    const fixed = currentList[0];
    const rest = currentList.slice(1);
    const last = rest.pop();
    rest.unshift(last);
    currentList = [fixed, ...rest];
  }

  // Asignar marcadores realistas a las primeras 4 jornadas
  const demoResults = [
    // Jornada 1
    { h: 3, a: 1 }, { h: 2, a: 2 }, { h: 1, a: 0 }, { h: 0, a: 2 },
    // Jornada 2
    { h: 2, a: 1 }, { h: 3, a: 3 }, { h: 0, a: 1 }, { h: 4, a: 0 },
    // Jornada 3
    { h: 1, a: 1 }, { h: 2, a: 0 }, { h: 3, a: 2 }, { h: 1, a: 2 },
    // Jornada 4
    { h: 2, a: 3 }, { h: 1, a: 0 }, { h: 2, a: 2 }, { h: 3, a: 1 }
  ];

  const demoScorers = [];
  const starPlayers = {
    team_d1: ['Vinicius Jr.', 'K. Mbappé', 'J. Bellingham'],
    team_d2: ['R. Lewandowski', 'L. Yamal', 'Raphinha'],
    team_d3: ['E. Haaland', 'K. De Bruyne', 'P. Foden'],
    team_d4: ['H. Kane', 'J. Musiala', 'L. Sané'],
    team_d5: ['O. Dembélé', 'B. Barcola', 'Vitinha'],
    team_d6: ['M. Salah', 'L. Díaz', 'D. Núñez'],
    team_d7: ['D. VlahoviÄ‡', 'F. Chiesa', 'Bremer'],
    players: ['Lautaro Martínez', 'Marcus Thuram', 'Nicolò Barella', 'Hakan Çalhanoğlu', 'Yann Sommer']
  };

  for (let i = 0; i < 16; i++) {
    const m = matches[i];
    const res = demoResults[i];
    m.scoreHome = res.h;
    m.scoreAway = res.a;

    // Goleadores del equipo local
    const hPool = starPlayers[m.homeTeamId] || ['Jugador Local'];
    for (let g = 0; g < res.h; g++) {
      demoScorers.push({
        id: `sc_h_${i}_${g}`,
        matchId: m.id,
        teamId: m.homeTeamId,
        playerName: hPool[g % hPool.length]
      });
    }

    // Goleadores del equipo visitante
    const aPool = starPlayers[m.awayTeamId] || ['Jugador Visitante'];
    for (let g = 0; g < res.a; g++) {
      demoScorers.push({
        id: `sc_a_${i}_${g}`,
        matchId: m.id,
        teamId: m.awayTeamId,
        playerName: aPool[g % aPool.length]
      });
    }
  }

  const demoTournament = {
    id: demoId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'en_curso',
    config: {
      name: 'Champions League Demo 2026',
      description: 'Torneo de demostración oficial con 8 clubes europeos, 4 jornadas completadas y tabla en vivo.',
      sport: 'f11',
      matchDuration: 90,
      format: 'league_single',
      ptsWin: 3,
      ptsDraw: 1,
      ptsLoss: 0,
      tiebreaker: 'gd_first',
      groupCount: 2,
      groupQualified: 2,
      thirdPlace: false
    },
    groups: {},
    teams: demoTeams,
    matches: matches,
    scorers: demoScorers,
    isGenerated: true,
    isPublicMode: false,
    filters: { round: 'all', team: 'all', group: 'all', status: 'all', search: '' }
  };

  // Guardar en la lista y activar
  savedTournaments.unshift(demoTournament);
  activeTournamentId = demoId;
  tournamentState = JSON.parse(JSON.stringify(demoTournament));

  saveState();
  updateHeaderActiveTournamentPill();
  updateGuardsVisibility();
  initConfigControls();
  renderTeams();
  updateCounterBadges();
  updateTournamentStatusBadge();

  // Navegar a la tabla de clasificación
  navigateToView('clasificacion');
  showToast('¡Torneo Demo "Champions League 2026" cargado con éxito!', 'success', 3500);
}

/**
 * Renderiza y conecta el Centro de Herramientas y Datos
 */
function renderToolsView() {
  if (dom.toolsTournamentSubtitle) {
    if (activeTournamentId && tournamentState.config?.name) {
      dom.toolsTournamentSubtitle.textContent = `Gestión y exportación para: "${tournamentState.config.name}"`;
    } else {
      dom.toolsTournamentSubtitle.textContent = 'Opciones avanzadas de exportación, difusión, copias de seguridad e informes';
    }
  }

  if (dom.toolsPublicToggleText) {
    dom.toolsPublicToggleText.textContent = tournamentState.isPublicMode
      ? 'Salir de Modo Espectador (Editor Activo)'
      : 'Activar Modo Espectador (Solo Lectura)';
  }
}

/**
 * Función heredada switchTab: mapea identificadores antiguos al Enrutador SPA
 */
function switchTab(targetTabId) {
  const route = ROUTE_MAP[targetTabId] || targetTabId.replace('tab-', '');
  navigateToView(route);
}

/**
 * Inicializa los controladores de navegación SPA, Header Global y Sistema Multitorneo
 */
function initSpaRouterAndGlobalNav() {
  // Escuchar cambios de hash en la ventana
  window.addEventListener('hashchange', handleHashChange);

  // Escuchar clics directos en enlaces de navegación SPA del Header y Menú Móvil
  document.querySelectorAll('.nav-link, .mobile-nav-item, .btn-create-header, .btn-hero-create, .header-brand').forEach(link => {
    link.addEventListener('click', (e) => {
      const route = link.getAttribute('data-route');
      if (route === 'formatos') {
        e.preventDefault();
        navigateToView('home', true);
        setTimeout(() => {
          const section = document.getElementById('home-formats-section');
          if (section) section.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        return;
      }
      if (route) {
        e.preventDefault();
        navigateToView(route, true);
      } else if (link.classList.contains('header-brand')) {
        e.preventDefault();
        navigateToView('home', true);
      } else if (link.classList.contains('btn-create-header') || link.classList.contains('btn-hero-create')) {
        e.preventDefault();
        const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
        if (session && session.loggedIn && isOrganizerOrAdmin(session.role)) {
          startNewTournamentDraft();
        } else {
          navigateToView('crear', true);
        }
      }
    });
  });

  // Selector y Menú desplegable del Torneo Activo en el Header
  if (dom.btnActiveTournamentPill) {
    if (dom.btnActiveTournamentPill) dom.btnActiveTournamentPill.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!dom.activeTournamentDropdown) return;
      const isVisible = dom.activeTournamentDropdown.style.display === 'block';
      dom.activeTournamentDropdown.style.display = isVisible ? 'none' : 'block';
    });
  }

  // Cerrar Menú desplegable al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (dom.activeTournamentDropdown && dom.activeTournamentSelectorWrap) {
      if (!dom.activeTournamentSelectorWrap.contains(e.target)) {
        dom.activeTournamentDropdown.style.display = 'none';
      }
    }
  });

  // Botón iniciar nuevo torneo en el desplegable
  if (dom.btnDropdownCreateNew) {
    if (dom.btnDropdownCreateNew) dom.btnDropdownCreateNew.addEventListener('click', (e) => {
      e.preventDefault();
      startNewTournamentDraft();
    });
  }

  // Menú Hamburguesa Móvil
  if (dom.btnMobileMenuToggle && dom.mobileNavDrawer) {
    if (dom.btnMobileMenuToggle) dom.btnMobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dom.mobileNavDrawer.style.display === 'block';
      dom.mobileNavDrawer.style.display = isOpen ? 'none' : 'block';
    });
  }

  if (dom.btnCloseMobileDrawer && dom.mobileNavDrawer) {
    if (dom.btnCloseMobileDrawer) dom.btnCloseMobileDrawer.addEventListener('click', () => {
      dom.mobileNavDrawer.style.display = 'none';
    });
  }

  // Botón Hero "Cargar Torneo Demo" y Empty State Demo
  if (dom.btnHeroLoadDemo) {
    if (dom.btnHeroLoadDemo) dom.btnHeroLoadDemo.addEventListener('click', loadDemoTournament);
  }
  if (dom.btnTorneosEmptyLoadDemo) {
    if (dom.btnTorneosEmptyLoadDemo) dom.btnTorneosEmptyLoadDemo.addEventListener('click', loadDemoTournament);
  }

  // Modal Eliminar Torneo
  if (dom.btnCancelDeleteModal) {
    if (dom.btnCancelDeleteModal) dom.btnCancelDeleteModal.addEventListener('click', closeDeleteTournamentModal);
  }
  if (dom.btnConfirmDeleteAction) {
    if (dom.btnConfirmDeleteAction) dom.btnConfirmDeleteAction.addEventListener('click', confirmDeleteTournamentAction);
  }

  // Vincular herramientas del Hub
  if (dom.toolsBtnExportJson) {
    if (dom.toolsBtnExportJson) dom.toolsBtnExportJson.addEventListener('click', handleExportJson);
  }
  if (dom.toolsBtnImportJson && dom.importJsonFileInput) {
    if (dom.toolsBtnImportJson) dom.toolsBtnImportJson.addEventListener('click', () => dom.importJsonFileInput.click());
  }
  if (dom.toolsBtnExportStandingsCsv) {
    if (dom.toolsBtnExportStandingsCsv) dom.toolsBtnExportStandingsCsv.addEventListener('click', exportStandingsCsv);
  }
  if (dom.toolsBtnExportFixturesCsv) {
    if (dom.toolsBtnExportFixturesCsv) dom.toolsBtnExportFixturesCsv.addEventListener('click', exportFixturesCsv);
  }
  if (dom.toolsBtnPrintPdf) {
    if (dom.toolsBtnPrintPdf) dom.toolsBtnPrintPdf.addEventListener('click', handlePrintReport);
  }
  if (dom.toolsBtnShare) {
    if (dom.toolsBtnShare) dom.toolsBtnShare.addEventListener('click', () => {
      if (typeof openShareModal === 'function') openShareModal();
    });
  }
  if (dom.toolsBtnTogglePublic) {
    if (dom.toolsBtnTogglePublic) dom.toolsBtnTogglePublic.addEventListener('click', () => {
      if (typeof togglePublicMode === 'function') {
        togglePublicMode();
        renderToolsView();
      }
    });
  }
  if (dom.toolsBtnReset) {
    if (dom.toolsBtnReset) dom.toolsBtnReset.addEventListener('click', () => {
      if (typeof openConfirmResetModal === 'function') openConfirmResetModal();
      else if (dom.btnResetAll) dom.btnResetAll.click();
    });
  }

  // Compatibilidad con botones de navegación con data-target (btn-go-tab)
  if (dom.btnGoTabs) {
    dom.btnGoTabs.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.getAttribute('data-target');
        if (target) switchTab(target);
      });
    });
  }

  // Inicializar interacciones completas de la Home (FAQ, Formatos, CTAs, Modal Acerca De, Footer)
  initHomeInteractions();

  // Enrutar inmediatamente según el hash de la página al cargar
  handleHashChange();
}

/**
 * Aplica un formato seleccionado desde las tarjetas del Home y navega a la creación
 */
function applyFormatAndCreate(format) {
  const FORMAT_MAP = {
    'single_round': 'league_single',
    'league_single': 'league_single',
    'double_round': 'league_double',
    'league_double': 'league_double',
    'playoffs': 'knockout',
    'knockout': 'knockout',
    'groups_playoffs': 'groups_playoffs',
    'groups_semis': 'groups_semis'
  };

  const targetFormat = FORMAT_MAP[format] || format;

  const formatNames = {
    league_single: 'Liga todos contra todos (1 vuelta)',
    league_double: 'Liga a ida y vuelta (2 vueltas)',
    knockout: 'Eliminación directa (Play-offs)',
    groups_playoffs: 'Fase de grupos + Eliminatorias',
    groups_semis: 'Grupos con semifinales y final'
  };

  if (!activeTournamentId || (tournamentState.isGenerated && tournamentState.matches.length > 0)) {
    startNewTournamentDraft();
  }

  tournamentState.config.format = targetFormat;
  if (dom.selectTournamentFormat) {
    dom.selectTournamentFormat.value = targetFormat;
    updateFormatDetails(targetFormat);
    dom.selectTournamentFormat.dispatchEvent(new Event('change', { bubbles: true }));
  }
  saveState();
  navigateToView('crear');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Formato ' + (formatNames[targetFormat] || targetFormat) + ' aplicado. Configura tus equipos.', 'success', 3500);
}

/**
 * Registra los escuchadores para el acordeón FAQ, botones de formato, scroll suave y modal Acerca De
 */
function initHomeInteractions() {
  // 1. Acordeón interactivo de Preguntas Frecuentes (FAQ)
  document.querySelectorAll('.faq-question-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentItem = btn.closest('.faq-item');
      if (!parentItem) return;
      const isOpen = parentItem.classList.contains('active');
      
      // Cerrar otros acordeones para mantener orden visual
      document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== parentItem) {
          item.classList.remove('active');
          const otherBtn = item.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      parentItem.classList.toggle('active', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // 2. Botones «Usar este formato» en las tarjetas de la Home
  document.querySelectorAll('.btn-use-format').forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      if (format) {
        applyFormatAndCreate(format);
      }
    });
  });

  // 3. Botón Explorar Funciones (Smooth Scroll a características)
  const btnHeroExplore = document.getElementById('btnHeroExplore');
  if (btnHeroExplore) {
    btnHeroExplore.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('home-features-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 4. Modal «Acerca de FutbolMaster Pro»
  const aboutModal = document.getElementById('aboutModal');
  const btnCloseAboutModal = document.getElementById('btnCloseAboutModal');
  const btnCloseAboutModalBtn = document.getElementById('btnCloseAboutModalBtn');
  const btnAboutCreateTournament = document.getElementById('btnAboutCreateTournament');

  function openAboutModal() {
    if (aboutModal) aboutModal.style.display = 'flex';
  }

  function closeAboutModal() {
    if (aboutModal) aboutModal.style.display = 'none';
  }

  document.querySelectorAll('.btn-open-about-modal, .btn-open-privacy-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openAboutModal();
    });
  });

  if (btnCloseAboutModal) btnCloseAboutModal.addEventListener('click', closeAboutModal);
  if (btnCloseAboutModalBtn) btnCloseAboutModalBtn.addEventListener('click', closeAboutModal);

  if (aboutModal) {
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) closeAboutModal();
    });
  }

  if (btnAboutCreateTournament) {
    btnAboutCreateTournament.addEventListener('click', () => {
      closeAboutModal();
      startNewTournamentDraft();
    });
  }

  // 5. Enlaces de Disciplina en el Footer
  document.querySelectorAll('.footer-sport-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const sport = link.getAttribute('data-sport') || 'f11';
      if (!activeTournamentId || (tournamentState.isGenerated && tournamentState.matches.length > 0)) {
        startNewTournamentDraft();
      }
      tournamentState.config.sport = sport;
      if (dom.selectTournamentSport) {
        dom.selectTournamentSport.value = sport;
        if (SPORT_DEFAULT_DURATIONS[sport] && dom.inputMatchDuration) {
          dom.inputMatchDuration.value = SPORT_DEFAULT_DURATIONS[sport];
          tournamentState.config.matchDuration = SPORT_DEFAULT_DURATIONS[sport];
        }
      }
      saveState();
      navigateToView('crear');
      showToast(`⚽ Modalidad ${sport.toUpperCase()} seleccionada`, 'info', 2500);
    });
  });

  // 6. Enlace FAQ en Footer
  const footerLinkFaq = document.getElementById('footerLinkFaq');
  if (footerLinkFaq) {
    footerLinkFaq.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToView('home');
      setTimeout(() => {
        const faqSection = document.getElementById('home-faq-section');
        if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    });
  }

  // 7. Año actual dinámico en el footer
  const footerYearEl = document.getElementById('footerCurrentYear');
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }
}

// =============================================================================
// FASE 1: PANEL DE ADMINISTRADOR GENERAL (view-admin)
// Auditoría, Canchas Colombia, Supervisión de Torneos y Directorio con Habeas Data
// =============================================================================

function exportAuditLogCsv() {
  const logs = (typeof FMPStore !== 'undefined' && FMPStore.getAuditLog) ? FMPStore.getAuditLog() : [];
  if (!logs || logs.length === 0) {
    if (typeof showToast === 'function') showToast('No hay registros de auditoría para exportar', 'info');
    return;
  }
  const headers = ['ID', 'Usuario', 'Rol', 'Accion', 'Detalles', 'IP', 'Fecha'];
  const csvRows = [headers.join(',')];
  logs.forEach(l => {
    const row = [
      `"${l.id || ''}"`,
      `"${(l.userName || '').replace(/"/g, '""')}"`,
      `"${l.userRole || ''}"`,
      `"${l.action || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip || ''}"`,
      `"${l.timestamp || ''}"`
    ];
    csvRows.push(row.join(','));
  });
  const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(csvBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `auditoria_fmp_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  if (typeof showToast === 'function') showToast('Auditoría exportada a CSV exitosamente', 'success', 3000);
}


// =============================================================================
// DASHBOARD V22: COREOGRAFÍA DE CARGA, COUNT-UP Y NAVEGACIÓN EN PÍLDORA (VISTAS 1, 2, 3)
// =============================================================================

/**
 * Hook / Función useCountUp: Anima números progresivamente cuadro por cuadro
 */
function useCountUp(el, targetValue, duration = 900, decimals = 0, prefix = '', suffix = '') {
  if (!el) return;
  const target = parseFloat(targetValue) || 0;
  const isCurrency = el.dataset.currency === 'true';
  const start = 0;
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateNumber(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    const current = start + (target - start) * easedProgress;

    let formatted = '';
    if (isCurrency) {
      formatted = prefix + Math.round(current).toLocaleString('es-CO') + ' COP';
    } else if (decimals > 0) {
      formatted = prefix + current.toFixed(decimals).replace('.', ',') + suffix;
    } else {
      formatted = prefix + Math.round(current).toString().padStart(target >= 10 ? 2 : 2, '0') + suffix;
    }

    el.textContent = formatted;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    } else {
      if (isCurrency) {
        el.textContent = prefix + Math.round(target).toLocaleString('es-CO') + ' COP';
      } else if (decimals > 0) {
        el.textContent = prefix + target.toFixed(decimals).replace('.', ',') + suffix;
      } else {
        el.textContent = prefix + Math.round(target).toString().padStart(target >= 10 ? 2 : 2, '0') + suffix;
      }
    }
  }

  requestAnimationFrame(updateNumber);
}
window.useCountUp = useCountUp;

function animateAllCountUps(container = document, duration = 1400) {
  const elements = container.querySelectorAll('.count-up');
  elements.forEach(el => {
    const target = el.dataset.target || el.textContent.replace(/[^0-9.]/g, '') || 0;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    useCountUp(el, target, duration, decimals, prefix, suffix);
  });
}
window.animateAllCountUps = animateAllCountUps;

function animateAllBars(container = document) {
  const bars = container.querySelectorAll('.v22-bar-dynamic');
  bars.forEach(bar => {
    bar.style.height = '0%';
    const targetHeight = bar.dataset.height || '60';
    setTimeout(() => {
      bar.style.height = targetHeight + '%';
    }, 60);
  });
}
window.animateAllBars = animateAllBars;

function updatePillSlidingIndicator(index) {
  const indicator = document.getElementById('pillSlidingIndicator');
  const capsule = document.querySelector('.pill-dock-capsule');
  if (capsule) {
    capsule.style.setProperty('--active-index', index);
  }
  if (indicator) {
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
      indicator.style.transform = `translateX(${index * 48}px)`;
    } else {
      indicator.style.transform = `translateY(${index * 48}px)`;
    }
  }
}
window.updatePillSlidingIndicator = updatePillSlidingIndicator;

function triggerMicroSkeleton(targetPane, callback) {
  if (!targetPane) return;
  targetPane.classList.add('is-micro-skeleton');
  setTimeout(() => {
    targetPane.classList.remove('is-micro-skeleton');
    targetPane.classList.add('fade-stagger-in');
    setTimeout(() => targetPane.classList.remove('fade-stagger-in'), 400);
    if (typeof callback === 'function') callback();
  }, 250);
}
window.triggerMicroSkeleton = triggerMicroSkeleton;

// Caché de apartados ya montados para evitar re-renderizar innerHTML al alternar pestañas
window._adminMountedSections = window._adminMountedSections || {};

function mountAdminSectionData(normSection, force = false) {
  if (!window._adminMountedSections) window._adminMountedSections = {};
  if (!force && window._adminMountedSections[normSection]) {
    return false; // Ya montado previamente; cambio instantáneo sin costo de CPU
  }
  window._adminMountedSections[normSection] = true;

  if (normSection === 'overview') {
    if (typeof renderAdminLiveDashboard === 'function') renderAdminLiveDashboard();
  } else if (normSection === 'torneos' || normSection === 'tournaments') {
    if (typeof renderAdminTournamentsTable === 'function') renderAdminTournamentsTable();
    if (typeof renderAdminCorrectionsTab === 'function') renderAdminCorrectionsTab();
  } else if (normSection === 'organizadores') {
    if (typeof renderAdminOrganizersTable === 'function') renderAdminOrganizersTable();
  } else if (normSection === 'equipos') {
    if (typeof renderAdminTeamsTable === 'function') renderAdminTeamsTable();
  } else if (normSection === 'usuarios') {
    if (typeof renderAdminUsersTableDedicated === 'function') renderAdminUsersTableDedicated();
  } else if (normSection === 'canchas' || normSection === 'venues') {
    if (typeof renderAdminVenuesCatalog === 'function') renderAdminVenuesCatalog();
  } else if (normSection === 'solicitudes' || normSection === 'clubes' || normSection === 'clubs-finances' || normSection === 'profile') {
    if (typeof renderAdminPendingApplications === 'function') renderAdminPendingApplications();
    if (typeof renderAdminOrganizerTab === 'function') renderAdminOrganizerTab();
    if (typeof renderAdminProfileTab === 'function') renderAdminProfileTab();
  } else if (normSection === 'estadisticas' || normSection === 'stats') {
    if (typeof renderAdminStatsDashboard === 'function') renderAdminStatsDashboard();
  } else if (normSection === 'auditoria' || normSection === 'audit') {
    if (typeof renderAdminAuditTable === 'function') renderAdminAuditTable();
  } else if (normSection === 'configuracion' || normSection === 'config') {
    // Configuración general
  }

  return true;
}
window.mountAdminSectionData = mountAdminSectionData;

function refreshAdminDashboardData(btnEl) {
  const btn = btnEl || document.querySelector('.sidebar-ball-refresh-btn') || document.getElementById('pillSidebarTopLogo');
  if (btn) {
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 650);
  }

  // Limpiar caché de montado para forzar recarga de datos frescos
  window._adminMountedSections = {};

  const activeBtn = document.querySelector('.admin-subtab-btn.active');
  const activeSec = activeBtn ? (activeBtn.getAttribute('data-section') || activeBtn.getAttribute('data-subtab')?.replace('admin-tab-', '') || 'overview') : 'overview';

  mountAdminSectionData(activeSec, true);

  const targetSection = document.querySelector(`section[data-admin-section="${activeSec}"]`);
  if (targetSection) {
    if (typeof animateAllCountUps === 'function') animateAllCountUps(targetSection);
    if (typeof animateAllBars === 'function') animateAllBars(targetSection);
  }

  if (typeof renderAdminPendingApplications === 'function') {
    renderAdminPendingApplications();
  }

  if (typeof showToast === 'function') {
    showToast('Datos del Dashboard actualizados ⚽', 'success', 2200);
  }
}
window.refreshAdminDashboardData = refreshAdminDashboardData;

function setActiveAdminSection(sectionId) {
  if (!sectionId) sectionId = 'overview';
  const normSection = sectionId.replace('admin-tab-', '');

  // 1. Detectar botón previo para cálculo de inercia deslizante (Liquid Glide)
  const prevBtn = document.querySelector('.admin-subtab-btn.active');
  const prevSec = prevBtn ? (prevBtn.getAttribute('data-section') || prevBtn.getAttribute('data-subtab')?.replace('admin-tab-', '')) : null;

  // Si ya está activo ese apartado, no re-ejecutar ni reiniciar animación innecesariamente
  if (prevBtn && prevSec === normSection && prevBtn.style.getPropertyValue('--glide-from')) {
    prevBtn.classList.add('just-selected');
    return;
  }

  const allBtns = document.querySelectorAll('.admin-subtab-btn');
  let activeBtn = null;
  allBtns.forEach(b => {
    const sec = b.getAttribute('data-section') || b.getAttribute('data-subtab')?.replace('admin-tab-', '');
    const isMatch = (sec === normSection || b.getAttribute('data-subtab') === sectionId || b.getAttribute('data-section') === sectionId);
    b.classList.toggle('active', isMatch);
    if (isMatch) {
      activeBtn = b;
      b.classList.add('just-selected');
      b._selectedAt = Date.now();
    } else {
      b.classList.remove('just-selected');
    }
  });

  // Animación de deslizamiento líquido vertical con inercia elástica (igual al Nav de Inicio)
  if (activeBtn && prevBtn && prevBtn !== activeBtn) {
    const deltaY = prevBtn.offsetTop - activeBtn.offsetTop;
    activeBtn.style.setProperty('--glide-from', `${deltaY}px`);
    activeBtn.style.animation = 'none';
    void activeBtn.offsetHeight;
    activeBtn.style.animation = '';
  } else if (activeBtn && !activeBtn.style.getPropertyValue('--glide-from')) {
    activeBtn.style.setProperty('--glide-from', '0px');
  }

  // 2. Ocultar absolutamente todas las secciones con display: none !important (Cero lag)
  const allSections = document.querySelectorAll('section[data-admin-section], .admin-section-pane');
  allSections.forEach(sec => {
    sec.classList.remove('active', 'active-view');
    sec.style.setProperty('display', 'none', 'important');
  });

  // 3. Activar y desplegar la sección solicitada (SOLO alternar visibilidad a 60 FPS)
  const targetSection = document.querySelector(`section[data-admin-section="${normSection}"]`) || 
                        document.getElementById(`admin-tab-${normSection}`) ||
                        document.getElementById(sectionId);
  const rightPanel = document.getElementById('adminBentoRightPanel');

  if (targetSection) {
    targetSection.classList.remove('active-view');
    targetSection.classList.add('active', 'active-view');

    if (normSection === 'overview') {
      targetSection.style.setProperty('display', 'grid', 'important');
      if (rightPanel) rightPanel.style.setProperty('display', 'flex', 'important');
    } else {
      targetSection.style.setProperty('display', 'block', 'important');
      if (rightPanel && targetSection.contains(rightPanel)) {
        // En overview ya se oculta junto con el padre
      } else if (rightPanel) {
        rightPanel.style.setProperty('display', 'none', 'important');
      }
    }

    // 4. Montar datos ÚNICAMENTE la primera vez que se visita (Lazy Mount)
    const wasJustMounted = mountAdminSectionData(normSection, false);
    if (wasJustMounted) {
      if (typeof animateAllCountUps === 'function') animateAllCountUps(targetSection);
      if (typeof animateAllBars === 'function') animateAllBars(targetSection);
    }
  }

  // 5. Sincronizar indicador deslizante si existe
  if (activeBtn && typeof updatePillSlidingIndicator === 'function') {
    const idx = parseInt(activeBtn.getAttribute('data-index') || '0', 10);
    updatePillSlidingIndicator(idx);
  }
}
window.setActiveAdminSection = setActiveAdminSection;

function handleAdminSubtabSwitch(btn) {
  if (!btn || btn.classList.contains('active')) return;
  const targetSubtab = btn.getAttribute('data-subtab');
  const sectionKey = btn.getAttribute('data-section') || (targetSubtab ? targetSubtab.replace('admin-tab-', '') : 'overview');
  setActiveAdminSection(sectionKey);
}
window.handleAdminSubtabSwitch = handleAdminSubtabSwitch;

// Limpieza estricta de atributos 'title' para evitar el tooltip negro nativo del navegador (estilo Linear / visionOS)
const cleanSidebarTitles = () => {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('.pill-sidebar-container [title], .pill-sidebar-dock [title], .sidebar-nav-btn[title]').forEach(el => {
    el.removeAttribute('title');
  });
};
window.cleanSidebarTitles = cleanSidebarTitles;

// Observer para eliminar automáticamente cualquier atributo title que se intente inyectar en la barra
function initSidebarTitleObserver() {
  cleanSidebarTitles();
  if (typeof document === 'undefined') return;

  const sidebars = document.querySelectorAll('.pill-sidebar-container, .pill-sidebar-dock, #adminPillSidebar');
  sidebars.forEach(sidebar => {
    if (sidebar.dataset.titleObserverAttached) return;
    sidebar.dataset.titleObserverAttached = 'true';

    const observer = new MutationObserver(mutations => {
      let needsClean = false;
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'title') {
          needsClean = true;
          break;
        } else if (m.type === 'childList') {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1 && (node.hasAttribute('title') || node.querySelector?.('[title]'))) {
              needsClean = true;
              break;
            }
          }
        }
      }
      if (needsClean) cleanSidebarTitles();
    });

    observer.observe(sidebar, {
      attributes: true,
      attributeFilter: ['title'],
      subtree: true,
      childList: true
    });
  });
}
window.initSidebarTitleObserver = initSidebarTitleObserver;

// Interacción de Hover y Selección en Pill Sidebar
function initSidebarHoverInteraction() {
  cleanSidebarTitles();
  initSidebarTitleObserver();

  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    if (!btn.dataset.hoverAttached) {
      btn.dataset.hoverAttached = 'true';
      btn.addEventListener('click', () => {
        // Al seleccionar, ocultar inmediatamente el nombre aunque el cursor siga encima
        btn.classList.add('just-selected');
        btn._selectedAt = Date.now();
        cleanSidebarTitles();
      });
      btn.addEventListener('mouseleave', () => {
        // Ignorar mouseleave espurio si la pastilla está viajando por la animación navLiquidGlide (0.45s)
        if (Date.now() - (btn._selectedAt || 0) < 480) {
          setTimeout(() => {
            if (!btn.matches(':hover')) {
              btn.classList.remove('just-selected');
            }
          }, 480);
          return;
        }
        // Al sacar el cursor, permitir que vuelva a aparecer la próxima vez que pase el mouse
        btn.classList.remove('just-selected');
      });
    }
  });
}
window.initSidebarHoverInteraction = initSidebarHoverInteraction;

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarHoverInteraction);
  } else {
    initSidebarHoverInteraction();
  }
}

function renderAdminProfileTab() {
  const titleEl = document.getElementById('v22ProfileTournamentTitle');
  const activeT = tournamentState?.config?.name ? tournamentState : ((typeof savedTournaments !== 'undefined' && savedTournaments.find(t => t.id === activeTournamentId)) || (typeof FMPStore !== 'undefined' && FMPStore.getTournaments()[0]));
  if (titleEl && activeT) {
    titleEl.textContent = activeT.config?.name || activeT.name || 'Superliga Andina Nocturna 2026';
  }
}
window.renderAdminProfileTab = renderAdminProfileTab;

let isDashboardEntranceRunning = false;

function runSplashKickToSidebar() {
  const splashBall = document.getElementById('splash-main-ball') || document.querySelector('.splash-ball-wrapper');
  const sidebarBallBtn = document.querySelector('#view-organizer.active .sidebar-ball-refresh-btn, #view-organizador.active .sidebar-ball-refresh-btn, #view-admin.active .sidebar-ball-refresh-btn, .sidebar-ball-refresh-btn, #pillSidebarTopLogo, #orgPillSidebarTopLogo');
  const splashOverlay = document.querySelector('.splash-screen-overlay, #admin-splash-screen, #dashboardSplashOverlay, .dashboard-splash-overlay');

  if (splashBall && sidebarBallBtn) {
    // Ocultar temporalmente el botón de destino en la barra lateral mientras el balón central se forma y despliega
    sidebarBallBtn.style.opacity = '0';

    const splashRect = splashBall.getBoundingClientRect();
    const targetRect = sidebarBallBtn.getBoundingClientRect();

    if (splashRect.width > 0 && targetRect.width > 0) {
      const deltaX = (targetRect.left + targetRect.width / 2) - (splashRect.left + splashRect.width / 2);
      const deltaY = (targetRect.top + targetRect.height / 2) - (splashRect.top + splashRect.height / 2);
      const targetScale = targetRect.width / splashRect.width;

      splashBall.style.setProperty('--dock-x', `${deltaX}px`);
      splashBall.style.setProperty('--dock-y', `${deltaY}px`);
      splashBall.style.setProperty('--dock-scale', `${targetScale || 0.5}`);
    }
  }

  // A los 1340ms exactos (cuando termina el despliegue al botón superior):
  setTimeout(() => {
    try {
      sessionStorage.setItem('fmp_splash_completed', 'true');
    } catch(e){}
    if (sidebarBallBtn) {
      sidebarBallBtn.style.opacity = '1';
      sidebarBallBtn.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      sidebarBallBtn.style.transform = 'scale(1.15)';
      setTimeout(() => { sidebarBallBtn.style.transform = 'scale(1)'; }, 250);
    }
    if (splashOverlay) {
      splashOverlay.style.transition = 'opacity 0.25s ease';
      splashOverlay.style.opacity = '0';
      setTimeout(() => {
        splashOverlay.style.display = 'none';
        splashOverlay.classList.remove('is-animating');
        isDashboardEntranceRunning = false;
      }, 250);
    }
  }, 1340);
}

function runDashboardEntranceSequence(force = false) {
  if (isDashboardEntranceRunning && !force) return;
  isDashboardEntranceRunning = false;

  const overlay = document.getElementById('dashboardSplashOverlay') || document.querySelector('.splash-screen-overlay, #admin-splash-screen, .dashboard-splash-overlay');
  const splashContent = document.getElementById('splashCenterContent');
  const container = document.querySelector('.admin-panel-container');

  if (!overlay) return;

  // Si no es forzado y ya se completó el splash en esta sesión, entrar directo en <150ms
  const hasCompleted = (sessionStorage.getItem('fmp_splash_completed') === 'true');
  if (!force && hasCompleted) {
    overlay.classList.add('is-hidden');
    overlay.classList.remove('is-animating');
    overlay.style.setProperty('display', 'none', 'important');
    if (splashContent) splashContent.classList.add('text-fade-out');
    if (container) container.classList.add('entrance-expanding');
    const sidebarBallBtn = document.querySelector('#view-organizer.active .sidebar-ball-refresh-btn, #view-organizador.active .sidebar-ball-refresh-btn, #view-admin.active .sidebar-ball-refresh-btn, .sidebar-ball-refresh-btn, #pillSidebarTopLogo, #orgPillSidebarTopLogo');
    if (sidebarBallBtn) {
      sidebarBallBtn.style.opacity = '1';
      sidebarBallBtn.style.transform = 'scale(1)';
    }

    const activePane = document.querySelector('.admin-subtab-pane.active') || document.getElementById('admin-tab-overview');
    if (activePane) {
      if (typeof animateAllCountUps === 'function') animateAllCountUps(activePane, 350);
      if (typeof animateAllBars === 'function') animateAllBars(activePane);
    }
    return;
  }

  isDashboardEntranceRunning = true;

  // 1. Reset instantáneo al tope absoluto de la ventana (0, 0)
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch (e) {
    window.scrollTo(0, 0);
  }

  // 2. Fase 1: Overlay visible y limpio de estados previos
  overlay.style.removeProperty('display');
  overlay.style.setProperty('display', 'flex', 'important');
  overlay.style.opacity = '1';
  overlay.classList.remove('is-hidden');
  if (splashContent) splashContent.classList.remove('text-fade-out');

  // Limpiar estilos inline previos del botón de destino en la barra lateral
  const sidebarBallBtn = document.querySelector('#view-organizer.active .sidebar-ball-refresh-btn, #view-organizador.active .sidebar-ball-refresh-btn, #view-admin.active .sidebar-ball-refresh-btn, .sidebar-ball-refresh-btn, #pillSidebarTopLogo, #orgPillSidebarTopLogo');
  if (sidebarBallBtn) {
    sidebarBallBtn.style.transform = '';
    sidebarBallBtn.style.animation = '';
    sidebarBallBtn.style.opacity = '0';
  }

  // 3. Forzar reinicio de animaciones CSS/SVG en SPA (sin recargar F5)
  // Reemplazar nodo .splash-ball-forge-stage con un clon idéntico fresco
  const forgeStage = overlay.querySelector('.splash-ball-forge-stage');
  if (forgeStage) {
    const freshStage = forgeStage.cloneNode(true);
    const clonedBall = freshStage.querySelector('.splash-ball-wrapper, #splash-main-ball');
    if (clonedBall) {
      clonedBall.style.transform = '';
      clonedBall.style.animation = '';
      clonedBall.style.removeProperty('--dock-x');
      clonedBall.style.removeProperty('--dock-y');
      clonedBall.style.removeProperty('--dock-scale');
    }
    forgeStage.replaceWith(freshStage);
  }

  // Forzar reflow en el overlay ANTES de calcular getBoundingClientRect()
  overlay.classList.remove('is-animating');
  void overlay.offsetWidth;
  overlay.classList.add('is-animating');

  // 4. Calcular coordenadas y ejecutar docking balístico al sidebar
  runSplashKickToSidebar();

  // 5. A los 0.95s: Desvanecer subtítulo y título de splash suavemente
  setTimeout(() => {
    if (splashContent) splashContent.classList.add('text-fade-out');
  }, 950);

  // 6. Al completarse los 1340ms exactos: Balón aterriza, guardar fmp_splash_completed y activar vista
  setTimeout(() => {
    try {
      sessionStorage.setItem('fmp_splash_completed', 'true');
    } catch(e){}
    overlay.classList.add('is-hidden');
    overlay.classList.remove('is-animating');
    overlay.style.setProperty('display', 'none', 'important');
    isDashboardEntranceRunning = false;
    if (container) container.classList.add('entrance-expanding');

    // Fase 2: Shimmer Skeleton en tarjetas (0.7s)
    const activePane = document.querySelector('.admin-subtab-pane.active') || document.getElementById('admin-tab-overview');
    if (activePane) {
      activePane.classList.add('is-micro-skeleton');
      setTimeout(() => {
        activePane.classList.remove('is-micro-skeleton');
        activePane.classList.add('fade-stagger-in');

        // Fase 3: Count-up cinematográfico de 1400ms & crecimiento elástico de barras
        if (typeof animateAllCountUps === 'function') animateAllCountUps(activePane, 1400);
        if (typeof animateAllBars === 'function') animateAllBars(activePane);
      }, 700);
    }
  }, 1340);
}

window.runSplashKickToSidebar = runSplashKickToSidebar;
window.runDashboardEntranceSequence = runDashboardEntranceSequence;

function initAdminPanelControls() {
  if (window.__adminControlsInitialized) return;
  window.__adminControlsInitialized = true;

  // Listener para Corrección Auditada de Resultados (Fase 3)
  const formCorrection = document.getElementById('adminFormCorrection');
  if (formCorrection && !formCorrection.dataset.initAttached) {
    formCorrection.dataset.initAttached = 'true';
    formCorrection.addEventListener('submit', (e) => {
      e.preventDefault();
      const tId = document.getElementById('correctSelectTournament')?.value;
      const mId = document.getElementById('correctSelectMatch')?.value;
      const hScore = document.getElementById('correctScoreHome')?.value;
      const aScore = document.getElementById('correctScoreAway')?.value;
      const reason = document.getElementById('correctReason')?.value;

      if (!tId || !mId) {
        showToast('Selecciona un torneo y un partido para corregir', 'warning', 3000);
        return;
      }
      if (reason.trim().length < 5) {
        showToast('Debes ingresar un motivo válido para la auditoría oficial', 'warning', 3000);
        return;
      }

      const res = FMPStore.correctMatchScore(tId, mId, hScore, aScore, reason.trim());
      if (res.ok) {
        showToast('✓ Marcador corregido y auditado. Tabla de posiciones recalculada.', 'success', 3500);
        renderAdminStats();
        renderAdminTournamentsTable();
        renderAdminCorrectionsTab();
        renderAdminAuditTable();
        // Si el torneo corregido es el activo, actualizar vista
        if (activeTournamentId === tId) {
          loadState();
          renderApp();
        }
      } else {
        showToast(res.error || 'Error al aplicar la corrección', 'error', 3500);
      }
    });
  }

  // 1. Navegación por subpestañas con Pill Dock y Micro-Skeleton
  if (typeof initSidebarHoverInteraction === 'function') initSidebarHoverInteraction();
  const subtabBtns = document.querySelectorAll('.admin-subtab-btn');
  subtabBtns.forEach(btn => {
    if (!btn.dataset.v22Attached) {
      btn.dataset.v22Attached = 'true';
      btn.addEventListener('click', () => handleAdminSubtabSwitch(btn));
    }
  });

  const orgSelect = document.getElementById('orgDashboardTournamentSelect');
  if (orgSelect) {
    orgSelect.addEventListener('change', () => renderAdminOrganizerTab());
  }

  // 2. Filtros de Auditoría
  const auditSearchInput = document.getElementById('auditSearchInput');
  const auditRoleFilter = document.getElementById('auditRoleFilter');
  if (auditSearchInput) auditSearchInput.addEventListener('input', renderAdminAuditTable);
  if (auditRoleFilter) auditRoleFilter.addEventListener('change', renderAdminAuditTable);

  // 3. Exportar Auditoría a CSV
  const btnExportAuditCsv = document.getElementById('btnExportAuditCsv');
  if (btnExportAuditCsv) {
    btnExportAuditCsv.addEventListener('click', exportAuditLogCsv);
  }

  // 4. Restaurar Demo de Auditoría
  const btnClearAuditLogs = document.getElementById('btnClearAuditLogs');
  if (btnClearAuditLogs) {
    btnClearAuditLogs.addEventListener('click', () => {
      localStorage.setItem(FMP_KEYS.AUDIT_LOG, JSON.stringify(SEED_AUDIT_LOGS));
      renderAdminAuditTable();
      renderAdminStats();
      showToast('Auditoría restaurada a los datos de demostración', 'info', 2500);
    });
  }

  // 5. Filtros y Modal de Canchas Colombia
    const btnLoadScenario = document.getElementById('btnLoadCompleteColombiaScenario');
  if (btnLoadScenario) {
    btnLoadScenario.addEventListener('click', loadCompleteColombiaScenario);
  }

  const venuesSearchInput = document.getElementById('venuesSearchInput');
  const venuesCityFilter = document.getElementById('venuesCityFilter');
  if (venuesSearchInput) venuesSearchInput.addEventListener('input', renderAdminVenuesCatalog);
  if (venuesCityFilter) venuesCityFilter.addEventListener('change', renderAdminVenuesCatalog);

  const btnOpenNewVenueModal = document.getElementById('btnOpenNewVenueModal');
  const modalNewVenue = document.getElementById('modalNewVenue');
  const btnCloseNewVenueModal = document.getElementById('btnCloseNewVenueModal');
  const btnCancelNewVenueModal = document.getElementById('btnCancelNewVenueModal');
  const formNewVenue = document.getElementById('formNewVenue');

  if (btnOpenNewVenueModal && modalNewVenue) {
    btnOpenNewVenueModal.addEventListener('click', () => {
      modalNewVenue.style.display = 'flex';
    });
  }
  const closeVenueModal = () => {
    if (modalNewVenue) modalNewVenue.style.display = 'none';
  };
  if (btnCloseNewVenueModal) btnCloseNewVenueModal.addEventListener('click', closeVenueModal);
  if (btnCancelNewVenueModal) btnCancelNewVenueModal.addEventListener('click', closeVenueModal);
  if (modalNewVenue) {
    modalNewVenue.addEventListener('click', (e) => {
      if (e.target === modalNewVenue) closeVenueModal();
    });
  }

  // El envío y guardado de canchas se gestiona de forma centralizada en initCanchasViewControls
}

/**
 * Renderiza el Monitor en Vivo (Live Dashboard Deportivo) del Panel Admin
 * Inspirado en la arquitectura visual moderna de SaaS Template (Dark Stadium)
 */
function renderAdminLiveDashboard() {
  const tournaments = FMPStore.getTournaments() || [];
  const teams = FMPStore.getTeams() || [];
  const venues = FMPStore.getVenues() || [];

  if (tournaments.length === 0) return;

  // 1. Selector de Torneo Activo en el Dashboard
  const selector = document.getElementById('adminLiveTournamentSelector');
  let selectedId = selector ? selector.value : null;

  if (selector) {
    if (selector.options.length === 0 || selector.options.length !== tournaments.length) {
      selector.innerHTML = tournaments.map(t => {
        const tName = t.name || (t.config && t.config.name) || 'Torneo Sin Nombre';
        const st = t.status === 'in_progress' ? '🟢 En Juego' : (t.status === 'open_registration' ? '📝 Inscripción' : '⏳ Próximo');
        return `<option value="${escapeHtml(t.id)}">${st} • ${escapeHtml(tName)}</option>`;
      }).join('');
      
      if (!selector._boundEvent) {
        selector._boundEvent = true;
        selector.addEventListener('change', () => {
          renderAdminLiveDashboard();
        });
      }
    }
  }

  // Torneo actualmente enfocado
  const currentTourney = (selectedId && tournaments.find(t => t.id === selectedId))
    || tournaments.find(t => t.status === 'in_progress')
    || tournaments[0];

  if (!currentTourney) return;
  if (selector && currentTourney.id) selector.value = currentTourney.id;

  // 2. Barra de URL y Estado en Vivo
  const urlBar = document.getElementById('adminDashboardUrlBar');
  if (urlBar) {
    const slug = (currentTourney.id || 'copa-colombia').replace(/_/g, '-');
    urlBar.textContent = `dashboard.futbolmasterpro.co/${slug}`;
  }

  const statusText = document.getElementById('adminDashboardStatusText');
  if (statusText) {
    const stLabels = {
      'in_progress': 'Torneo en Juego • Colombia 2026',
      'open_registration': 'Inscripciones Abiertas • Cupos Disponibles',
      'upcoming': 'Próximo Inicio • Fase de Sorteo',
      'finished': 'Temporada Finalizada • Campeón Coronado'
    };
    statusText.textContent = stLabels[currentTourney.status] || 'Competición Oficial FCF';
  }

  // 3. Encabezado del Torneo Enfocado
  const tTitle = document.getElementById('adminLiveSelectedTournamentTitle');
  if (tTitle) {
    tTitle.textContent = currentTourney.name || (currentTourney.config && currentTourney.config.name) || 'Torneo Oficial';
  }

  const tDesc = document.getElementById('adminLiveSelectedTournamentDesc');
  if (tDesc) {
    const assignedVenues = (currentTourney.venueIds || (currentTourney.config && currentTourney.config.venues) || [])
      .map(vId => {
        const v = venues.find(x => x.id === vId);
        return v ? (v.nombre || v.name) : vId;
      }).filter(Boolean);
    tDesc.textContent = assignedVenues.length > 0 
      ? `Sedes oficiales: ${assignedVenues.join(' • ')}` 
      : (currentTourney.description || 'Campeonato nacional oficial en Colombia');
  }

  // 4. KPIs Globales de Plataforma
  let totalMatches = 0;
  let playedMatches = 0;
  let totalGoals = 0;

  tournaments.forEach(t => {
    (t.matches || []).forEach(m => {
      if (!m.isBye) {
        totalMatches++;
        if (m.isFinished || m.status === 'finished') {
          playedMatches++;
          const gh = parseInt(m.homeScore ?? m.scoreHome, 10);
          const ga = parseInt(m.awayScore ?? m.scoreAway, 10);
          if (!isNaN(gh) && !isNaN(ga)) totalGoals += (gh + ga);
        }
      }
    });
  });

  const kpiTourneys = document.getElementById('adminLiveKpiTournaments');
  if (kpiTourneys) kpiTourneys.textContent = tournaments.length;

  const kpiTeams = document.getElementById('adminLiveKpiTeams');
  if (kpiTeams) kpiTeams.textContent = teams.length;

  const kpiMatches = document.getElementById('adminLiveKpiMatches');
  if (kpiMatches) kpiMatches.textContent = `${playedMatches}/${totalMatches}`;

  const kpiGoals = document.getElementById('adminLiveKpiGoals');
  if (kpiGoals) kpiGoals.textContent = totalGoals;

  // 5. Tabla de Posiciones en Tiempo Real
  const tbody = document.getElementById('adminLiveStandingsTbody');
  if (tbody) {
    let standings = Array.isArray(currentTourney.standings) && currentTourney.standings.length > 0
      ? currentTourney.standings
      : [];

    if (standings.length === 0 && (!currentTourney.teams || currentTourney.teams.length === 0) && Array.isArray(currentTourney.matches) && currentTourney.matches.length > 0) {
      const teamMap = new Map();
      currentTourney.matches.forEach(m => {
        if (!m.isBye) {
          const hId = m.teamHomeId || m.homeTeamId;
          const hName = m.teamHomeName || m.homeTeamName;
          const aId = m.teamAwayId || m.awayTeamId;
          const aName = m.teamAwayName || m.awayTeamName;
          if (hId && !teamMap.has(hId)) teamMap.set(hId, { id: hId, name: hName || hId });
          if (aId && !teamMap.has(aId)) teamMap.set(aId, { id: aId, name: aName || aId });
        }
      });
      if (teamMap.size > 0) {
        currentTourney.teams = Array.from(teamMap.values());
      }
    }

    if (standings.length === 0 && Array.isArray(currentTourney.teams) && currentTourney.teams.length > 0) {
      standings = currentTourney.teams.map((t, idx) => ({
        teamId: t.id,
        teamName: t.name,
        played: 4,
        won: Math.max(0, 3 - idx),
        drawn: idx === 0 ? 1 : 0,
        lost: idx > 1 ? 1 : 0,
        gf: Math.max(1, 8 - idx * 2),
        ga: 2 + idx,
        gd: Math.max(1, 8 - idx * 2) - (2 + idx),
        points: (Math.max(0, 3 - idx) * 3) + (idx === 0 ? 1 : 0)
      })).sort((a, b) => (b.points || 0) - (a.points || 0));
    }

    if (standings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 1.5rem; color: #94a3b8;">No hay clubes registrados aún para este torneo.</td></tr>`;
    } else {
      tbody.innerHTML = standings.map((s, idx) => {
        const pos = idx + 1;
        const isLeader = pos <= 2;
        const posColor = isLeader ? '#34d399' : '#94a3b8';
        const teamName = s.teamName || s.name || 'Club Deportivo';
        const initials = teamName.split(' ').map(w => w[0]).slice(0, 3).join('').toUpperCase();
        const gd = (s.gd ?? s.dg ?? 0);
        const gdSign = gd > 0 ? `+${gd}` : `${gd}`;
        return `
          <tr>
            <td style="color: ${posColor}; font-weight: 800; text-align: center;">${pos}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="width: 22px; height: 22px; border-radius: 50%; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4); font-size: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: #60a5fa;">${escapeHtml(initials)}</span>
                <span style="font-weight: 700; color: #ffffff;">${escapeHtml(teamName)}</span>
              </div>
            </td>
            <td style="text-align: center; color: #cbd5e1;">${s.played ?? s.pj ?? 0}</td>
            <td style="text-align: center; color: #cbd5e1;">${s.won ?? s.pg ?? 0}</td>
            <td style="text-align: center; color: #cbd5e1;">${s.drawn ?? s.pe ?? 0}</td>
            <td style="text-align: center; color: #cbd5e1;">${s.lost ?? s.pp ?? 0}</td>
            <td style="text-align: center; color: ${gd > 0 ? '#34d399' : (gd < 0 ? '#ef4444' : '#cbd5e1')}; font-weight: 700;">${gdSign}</td>
            <td style="text-align: right; color: #34d399; font-weight: 900; font-size: 0.95rem;">${s.points ?? s.pts ?? 0}</td>
          </tr>
        `;
      }).join('');
    }
  }

  // 6. Cartelera de Partidos y Sedes
  const matchesList = document.getElementById('adminLiveMatchesList');
  if (matchesList) {
    const list = (currentTourney.matches || []).filter(m => !m.isBye).slice(0, 4);
    if (list.length === 0) {
      matchesList.innerHTML = `
        <div style="padding: 1.5rem 1rem; text-align: center; color: #94a3b8; font-size: 0.8rem;">
          No hay partidos generados aún para este torneo.
        </div>
      `;
    } else {
      matchesList.innerHTML = list.map(m => {
        const homeName = m.homeTeamName || m.teamHomeName || 'Equipo Local';
        const awayName = m.awayTeamName || m.teamAwayName || 'Equipo Visitante';
        const isFin = m.isFinished || m.status === 'finished';
        const scoreLabel = isFin ? `${m.homeScore ?? m.scoreHome ?? 0} - ${m.awayScore ?? m.scoreAway ?? 0}` : 'VS';
        const scoreColor = isFin ? '#34d399' : '#60a5fa';
        const vName = m.venue || m.venueName || 'Escenario Deportivo Asignado';
        const timeLabel = m.time ? `${m.date || 'Jornada'} • ${m.time}` : 'Horario Oficial FCF';
        return `
          <div class="admin-live-match-item">
            <div class="admin-live-match-teams">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40%;">${escapeHtml(homeName)}</span>
              <span style="padding: 0.2rem 0.6rem; border-radius: 6px; background: rgba(0,0,0,0.45); color: ${scoreColor}; font-size: 0.78rem; font-weight: 800;">${scoreLabel}</span>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40%; text-align: right;">${escapeHtml(awayName)}</span>
            </div>
            <div class="admin-live-match-meta">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%;">🏟️ ${escapeHtml(vName)}</span>
              <span style="color: #34d399; font-weight: 600;">${escapeHtml(timeLabel)}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 6. Módulos Bento Grid: Mini Calendario y Feed de Actividad en Vivo
  initBentoMiniCalendar();
  renderBentoSideFeed();
}

function initBentoMiniCalendar() {
  const grid = document.getElementById('miniCalendarGrid');
  if (!grid) return;
  const daysHeader = `
    <span class="cal-day-name">L</span>
    <span class="cal-day-name">M</span>
    <span class="cal-day-name">M</span>
    <span class="cal-day-name">J</span>
    <span class="cal-day-name">V</span>
    <span class="cal-day-name">S</span>
    <span class="cal-day-name">D</span>
  `;
  let html = daysHeader;
  for (let i = 1; i < 7; i++) {
    html += `<span class="cal-day-cell cal-empty" style="opacity: 0.2;">•</span>`;
  }
  const matchDays = [3, 7, 10, 14, 16, 17, 21, 24, 28];
  const today = 16;
  for (let d = 1; d <= 30; d++) {
    const isToday = d === today ? 'today' : '';
    const hasMatch = matchDays.includes(d) ? 'has-match' : '';
    html += `<span class="cal-day-cell ${isToday} ${hasMatch}" title="Jornada ${d} de Noviembre">${d}</span>`;
  }
  grid.innerHTML = html;
}

function renderBentoSideFeed() {
  const feedEl = document.getElementById('sideLiveFeedList');
  if (!feedEl) return;
  feedEl.innerHTML = `
    <div class="side-feed-item">
      <span class="side-feed-icon">📝</span>
      <div><strong style="color:#a5f3fc;">Atlético Bogotá FC</strong> postuló plantilla oficial con 18 jugadores.<br><small style="color:#94a3b8">Hace 8 min • Verificado</small></div>
    </div>
    <div class="side-feed-item">
      <span class="side-feed-icon">⚽</span>
      <div><strong style="color:#ffffff;">Millonarios 3 - 2 Santa Fe</strong> acta de partido finalizada.<br><small style="color:#10b981">Hace 22 min • 3 puntos sumados</small></div>
    </div>
    <div class="side-feed-item">
      <span class="side-feed-icon">⚖️</span>
      <div>Paz y Salvo Disciplinario emitido para <strong style="color:#34d399;">Deportivo Cali</strong>.<br><small style="color:#94a3b8">Hace 45 min • Mesa de Control</small></div>
    </div>
    <div class="side-feed-item">
      <span class="side-feed-icon">🏟️</span>
      <div>Cancha Central Salitre reservada para <strong style="color:#a5f3fc;">Jornada 7</strong>.<br><small style="color:#94a3b8">Hoy 14:00 • Programación</small></div>
    </div>
  `;
}

function renderAdminView() {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const role = normalizeRole(session?.role || 'fan');

  // SEGURIDAD ESTRICTA: El panel de Admin solo se ejecuta para Administradores
  if (role !== 'admin') {
    navigateToView(role === 'organizer' ? 'organizador' : (isCoachRole(role) ? 'club' : 'home'), true);
    return;
  }

  // Asegurar sección activa sin apilar otras vistas
  let activeSubtab = document.querySelector('.admin-subtab-btn.active');
  const sectionKey = activeSubtab ? (activeSubtab.getAttribute('data-section') || activeSubtab.getAttribute('data-subtab')?.replace('admin-tab-', '') || 'overview') : 'overview';
  
  setActiveAdminSection(sectionKey);
  renderAdminStats();

  if (typeof renderAdminPendingApplications === 'function') {
    renderAdminPendingApplications();
  }

  // Coreografía exacta de entrada V22 (00:00.0s a 00:02.5s)
  runDashboardEntranceSequence();
}

function renderAdminStats() {
  const tournaments = FMPStore.getTournaments();
  const users = FMPStore.getUsers();
  const registrations = FMPStore.getRegistrations();
  const venues = FMPStore.getVenues();
  const teams = FMPStore.getTeams();

  let upcomingCount = 0;
  let inProgressCount = 0;
  let finishedCount = 0;
  let totalMatchesCount = 0;
  let playedMatchesCount = 0;
  let totalGoalsCount = 0;
  let matchesWithoutScoreCount = 0;

  tournaments.forEach(t => {
    const st = t.status || determineTournamentStatus(t.matches, t.config || t);
    if (st === 'finished') finishedCount++;
    else if (st === 'in_progress') inProgressCount++;
    else upcomingCount++;

    if (Array.isArray(t.matches)) {
      t.matches.forEach(m => {
        if (!m.isBye) {
          totalMatchesCount++;
          if (m.status === 'finished' || m.isFinished) {
            playedMatchesCount++;
            const h = parseInt(m.homeScore, 10);
            const a = parseInt(m.awayScore, 10);
            if (!isNaN(h) && !isNaN(a)) {
              totalGoalsCount += (h + a);
            } else {
              matchesWithoutScoreCount++;
            }
          }
        }
      });
    }
  });

  let pendingRegs = 0;
  let acceptedRegs = 0;
  let rejectedRegs = 0;
  registrations.forEach(r => {
    if (r.status === 'pendiente_inicial' || r.status === 'revision_final') pendingRegs++;
    else if (r.status === 'habilitado' || r.status === 'aprobada_inicial') acceptedRegs++;
    else if (r.status === 'rechazada') rejectedRegs++;
  });

  const roleCounts = { admin: 0, organizer: 0, coach: 0, fan: 0 };
  users.forEach(u => {
    const r = u.role || 'fan';
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });

  const elTourn = document.getElementById('adminStatTournaments');
  const elTournDetail = document.getElementById('adminStatTournamentsDetail');
  if (elTourn) elTourn.textContent = tournaments.length;
  if (elTournDetail) elTournDetail.textContent = `Próximos: ${upcomingCount} • En Curso: ${inProgressCount} • Fin: ${finishedCount}`;

  const elTeams = document.getElementById('adminStatTeams');
  if (elTeams) elTeams.textContent = teams.length;

  const elRegs = document.getElementById('adminStatRegistrations');
  const elRegsDetail = document.getElementById('adminStatRegistrationsDetail');
  if (elRegs) elRegs.textContent = registrations.length;
  if (elRegsDetail) elRegsDetail.textContent = `${pendingRegs} Pendientes • ${acceptedRegs} Aprobadas • ${rejectedRegs} Rechazadas`;

  const elMatches = document.getElementById('adminStatMatches');
  const elMatchesDetail = document.getElementById('adminStatMatchesDetail');
  if (elMatches) elMatches.textContent = `${playedMatchesCount}/${totalMatchesCount}`;
  const matchPct = totalMatchesCount > 0 ? Math.round((playedMatchesCount / totalMatchesCount) * 100) : 0;
  if (elMatchesDetail) elMatchesDetail.textContent = `${matchPct}% disputados (${totalMatchesCount - playedMatchesCount} por jugar)`;

  const elGoals = document.getElementById('adminStatGoals');
  if (elGoals) elGoals.textContent = totalGoalsCount;

  const elUsers = document.getElementById('adminStatUsers');
  const elUsersDetail = document.getElementById('adminStatUsersDetail');
  if (elUsers) elUsers.textContent = users.length;
  if (elUsersDetail) elUsersDetail.textContent = `Admin: ${roleCounts.admin} • Org: ${roleCounts.organizer} • DT: ${roleCounts.coach} • Fan: ${roleCounts.fan}`;

  // Alertas Activas en vivo
  const bannerAlerts = document.getElementById('adminActiveAlertsBanner');
  const listAlerts = document.getElementById('adminAlertsList');
  if (bannerAlerts && listAlerts) {
    const alerts = [];
    if (pendingRegs > 0) {
      alerts.push(`🚨 Hay <strong>${pendingRegs} solicitud(es) de clubes</strong> esperando revisión.`);
    }
    if (matchesWithoutScoreCount > 0) {
      alerts.push(`⚠️ Se detectaron <strong>${matchesWithoutScoreCount} partido(s) finalizados</strong> sin marcador registrado.`);
    }
    if (tournaments.length === 0) {
      alerts.push('ℹ️ No hay torneos creados en la base de datos actualmente.');
    }

    if (alerts.length > 0) {
      bannerAlerts.style.display = 'block';
      listAlerts.innerHTML = alerts.map(a => `<li>${a}</li>`).join('');
    } else {
      bannerAlerts.style.display = 'none';
    }
  }

  // Sincronización del contador de clubes y botón
  const confirmedClubsCount = (teams && teams.length > 0) ? teams.length : 16;
  const elClubsCount = document.getElementById('v22ClubsCount');
  if (elClubsCount) {
    elClubsCount.textContent = confirmedClubsCount < 10 ? `0${confirmedClubsCount}` : `${confirmedClubsCount}`;
    elClubsCount.setAttribute('data-target', confirmedClubsCount);
  }
  const elBtnAllClubs = document.getElementById('btnViewAllClubsAdmin');
  if (elBtnAllClubs) {
    elBtnAllClubs.textContent = `Ver los ${confirmedClubsCount} clubes →`;
  }
  const btnColScenario = document.getElementById('btnLoadCompleteColombiaScenario');
  if (btnColScenario) {
    const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
    const role = session ? normalizeRole(session.role) : 'spectator';
    btnColScenario.style.display = (role === 'admin') ? 'inline-flex' : 'none';
  }
}

function renderAdminAuditTable() {
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  const logs = (typeof FMPStore !== 'undefined' && FMPStore.getAuditLog) ? FMPStore.getAuditLog() : [];
  const search = (document.getElementById('auditSearchInput')?.value || '').toLowerCase().trim();
  const roleFilter = document.getElementById('auditRoleFilter')?.value || 'all';

  const filtered = logs.filter(log => {
    const matchRole = roleFilter === 'all' || log.role === roleFilter;
    const matchSearch = !search ||
      (log.user && log.user.toLowerCase().includes(search)) ||
      (log.userName && log.userName.toLowerCase().includes(search)) ||
      (log.action && log.action.toLowerCase().includes(search)) ||
      (log.details && log.details.toLowerCase().includes(search));
    return matchRole && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 2rem;">No se encontraron registros de auditoría</td></tr>';
    return;
  }

  const rolePills = {
    admin: '<span class="user-role-pill role-admin">👑 Admin</span>',
    organizer: '<span class="user-role-pill role-organizer">🏆 Org</span>',
    coach: '<span class="user-role-pill role-coach">📋 DT</span>',
    fan: '<span class="user-role-pill role-fan">👀 Fan</span>'
  };

  tbody.innerHTML = filtered.map(log => `
    <tr>
      <td><span style="font-size: 0.8rem; color: #94a3b8;">${new Date(log.timestamp || log.date || Date.now()).toLocaleString('es-ES')}</span></td>
      <td><strong>${escapeHtml(log.user || log.userName || 'Usuario')}</strong></td>
      <td>${rolePills[log.role || log.userRole] || '<span class="user-role-pill">General</span>'}</td>
      <td><span class="table-badge">${escapeHtml(log.action || 'EVENTO')}</span></td>
      <td style="max-width: 380px;">${escapeHtml(log.details || '')}</td>
      <td><code style="font-size: 0.75rem; color: #34d399;">${escapeHtml(log.ip || log.ipAddress || '127.0.0.1')}</code></td>
    </tr>
  `).join('');
}

function renderAdminVenuesCatalog() {
  const grid = document.getElementById('venuesCatalogGrid');
  if (!grid) return;

  const venues = FMPStore.getVenues();
  const search = (document.getElementById('venuesSearchInput')?.value || '').toLowerCase().trim();
  const cityFilter = document.getElementById('venuesCityFilter')?.value || 'all';

  const filtered = venues.filter(v => {
    const vCity = (v.ciudad || v.city || '');
    const matchCity = cityFilter === 'all' || vCity.includes(cityFilter);
    const matchSearch = !search ||
      (v.nombre || v.name || '').toLowerCase().includes(search) ||
      (v.direccion || v.address || '').toLowerCase().includes(search) ||
      vCity.toLowerCase().includes(search);
    return matchCity && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 3rem;">No se encontraron canchas en el catálogo</div>';
    return;
  }

  grid.innerHTML = filtered.map(v => `
    <div class="venue-admin-card" style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; color: #34d399; background: rgba(16,185,129,0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">✓ ${escapeHtml(v.estadoConfirmacion || v.verified || 'Verificada')}</span>
          <h4 style="margin: 0.5rem 0 0.25rem 0; font-size: 1.05rem; color: #f8fafc;">${escapeHtml(v.nombre || v.name)}</h4>
          <span style="font-size: 0.8rem; color: #94a3b8;">📍 ${escapeHtml(v.ciudad || v.city)}, ${escapeHtml(v.departamento || v.department)}</span>
        </div>
        <button type="button" class="btn-chip btn-delete-venue" data-id="${v.id}" style="color: #f87171; border-color: rgba(248,113,113,0.3); font-size: 0.75rem; padding: 0.25rem 0.5rem;">Eliminar</button>
      </div>
      <div style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.6;">
        <div>🏠 ${escapeHtml(v.direccion || v.address || 'Dirección oficial')}</div>
        <div>🌱 Superficie: <strong>${escapeHtml(v.superficie || v.surface || 'Sintética')}</strong> (${escapeHtml(v.modalidad || v.modality || 'Fútbol 11')})</div>
        <div>💡 Iluminación: ${escapeHtml(v.iluminacion || v.lighting || 'LED Profesional')}</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-delete-venue').forEach(btn => {
    btn.addEventListener('click', () => {
      const vid = btn.getAttribute('data-id');
      if (confirm('¿Eliminar esta cancha del catálogo nacional?')) {
        FMPStore.deleteVenue(vid);
        renderAdminVenuesCatalog();
        showToast('Cancha eliminada del catálogo', 'info', 2000);
      }
    });
  });
}

function renderAdminTournamentsTable() {
  const tbody = document.getElementById('adminTournamentsTableBody');
  if (!tbody) return;

  const tournaments = FMPStore.getTournaments();
  if (tournaments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 2rem;">No hay torneos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = tournaments.map(t => {
    const matches = Array.isArray(t.matches) ? t.matches : [];
    const teams = Array.isArray(t.teams) ? t.teams : [];
    const played = matches.filter(m => m.status === 'finished' || m.isFinished).length;
    const stBadge = getTournamentStatusBadge(t.status || determineTournamentStatus(matches, t.config || t));

    return `
      <tr>
        <td>
          <strong>${escapeHtml(t.config?.name || t.name || 'Sin título')}</strong>
          <div style="font-size: 0.75rem; color: #38bdf8;">👑 Org: ${escapeHtml(t.organizerName || 'Organizador')}</div>
        </td>
        <td><span class="table-badge">${escapeHtml(t.config?.sport || t.sport || 'Fútbol 11')}</span></td>
        <td><span class="table-badge">${escapeHtml(t.config?.format || t.format || 'Liga')}</span></td>
        <td><strong>${teams.length}</strong> equipos</td>
        <td><strong>${played}/${matches.length}</strong></td>
        <td>
          <span class="t-badge-status" style="color: ${stBadge.color}; border-color: ${stBadge.color}; background: ${stBadge.bg}; font-size: 0.75rem; padding: 0.2rem 0.5rem;">
            ${stBadge.text}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <button type="button" class="btn-action-view btn-admin-manage-t" data-id="${t.id}" title="Ver y editar calendario">📅 Calendario</button>
            <button type="button" class="btn-action-view btn-admin-table-t" data-id="${t.id}" title="Ver tabla de posiciones">📊 Tabla</button>
            <button type="button" class="btn-action-view btn-admin-bracket-t" data-id="${t.id}" title="Ver cuadro de llaves">🔀 Cuadro</button>
            <button type="button" class="btn-action-view btn-admin-delete-t" data-id="${t.id}" style="color: #f87171; border-color: rgba(248,113,113,0.3);" title="Eliminar torneo">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-admin-manage-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      isManagingTournament = true;
      document.body.classList.add('managing-tournament');
      setPublicMode(false, false);
      setActiveTournament(id, 'calendario');
    });
  });

  tbody.querySelectorAll('.btn-admin-table-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      setActiveTournament(id, 'clasificacion');
    });
  });

  tbody.querySelectorAll('.btn-admin-bracket-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      setActiveTournament(id, 'cuadro');
    });
  });

  tbody.querySelectorAll('.btn-admin-delete-t').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openDeleteTournamentModal(id);
    });
  });
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  const users = FMPStore.getUsers();
  tbody.innerHTML = users.map(u => {
    return `
      <tr>
        <td><strong>${escapeHtml(u.name)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || '+57 300 000 0000')}</td>
        <td>
          <select class="admin-user-role-select select-filter-pill" data-user-id="${u.id}" style="padding: 0.25rem 0.5rem; font-size: 0.78rem;">
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>👑 Admin General</option>
            <option value="organizer" ${u.role === 'organizer' ? 'selected' : ''}>🏆 Organizador</option>
            <option value="coach" ${u.role === 'coach' ? 'selected' : ''}>📋 DT / Delegado</option>
            <option value="fan" ${u.role === 'fan' ? 'selected' : ''}>👀 Aficionado</option>
          </select>
        </td>
        <td>${escapeHtml(u.clubName || 'Plataforma FMP')}</td>
        <td><span style="color: #34d399; font-weight: 700; font-size: 0.8rem;">✓ Autorizado</span></td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.admin-user-role-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const uid = sel.getAttribute('data-user-id');
      const newRole = sel.value;
      const roleTitles = {
        admin: 'Administrador General',
        organizer: 'Organizador de Torneo',
        coach: 'Director Técnico / Delegado',
        fan: 'Aficionado / Visitante'
      };
      const user = FMPStore.getUsers().find(x => x.id === uid);
      if (user) {
        user.role = newRole;
        user.roleTitle = roleTitles[newRole];
        FMPStore.saveUser(user);
        FMPStore.logAudit('CAMBIO_ROL_ADMIN', `Rol de usuario ${user.name} cambiado a '${roleTitles[newRole]}'`);
        showToast(`Rol de ${user.name} actualizado a ${roleTitles[newRole]}`, 'success', 2500);
        renderAdminStats();
      }
    });
  });
}

function renderAdminCorrectionsTab() {
  const selTourn = document.getElementById('correctSelectTournament');
  const selMatch = document.getElementById('correctSelectMatch');
  const tbody = document.getElementById('correctionsTableBody');
  if (!selTourn || !selMatch) return;

  const tournaments = FMPStore.getTournaments();
  selTourn.innerHTML = '<option value="">-- Selecciona un torneo --</option>' +
    tournaments.map(t => `<option value="${t.id}">${escapeHtml(t.config?.name || t.name)} (${t.matches?.length || 0} partidos)</option>`).join('');

  selTourn.onchange = () => {
    const tId = selTourn.value;
    const tourney = tournaments.find(t => t.id === tId);
    if (!tourney || !Array.isArray(tourney.matches) || tourney.matches.length === 0) {
      selMatch.innerHTML = '<option value="">-- No hay partidos en este torneo --</option>';
      return;
    }

    selMatch.innerHTML = '<option value="">-- Selecciona el partido a corregir --</option>' +
      tourney.matches.filter(m => !m.isBye).map(m => {
        const h = m.homeScore !== undefined ? m.homeScore : '-';
        const a = m.awayScore !== undefined ? m.awayScore : '-';
        return `<option value="${m.id}">[J${m.round}] ${escapeHtml(m.homeTeam || m.homeTeamName)} (${h}) vs (${a}) ${escapeHtml(m.awayTeam || m.awayTeamName)}</option>`;
      }).join('');
  };

  selMatch.onchange = () => {
    const tId = selTourn.value;
    const mId = selMatch.value;
    const tourney = tournaments.find(t => t.id === tId);
    if (!tourney) return;
    const match = tourney.matches.find(m => m.id === mId);
    if (match) {
      const hInput = document.getElementById('correctScoreHome');
      const aInput = document.getElementById('correctScoreAway');
      if (hInput) hInput.value = match.homeScore !== undefined ? match.homeScore : 0;
      if (aInput) aInput.value = match.awayScore !== undefined ? match.awayScore : 0;
    }
  };

  if (tbody) {
    const rawLogs = (typeof FMPStore !== 'undefined' && FMPStore.getAuditLog) ? FMPStore.getAuditLog() : [];
    const logs = rawLogs.filter(l => l.action === 'CORRECCION_MARCADOR_AUDITADA' || (l.details && l.details.includes('corregido')));
    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No hay correcciones registradas aún</td></tr>';
    } else {
      tbody.innerHTML = logs.map(l => `
        <tr>
          <td><span style="font-size: 0.8rem; color: #94a3b8;">${new Date(l.timestamp || l.date || Date.now()).toLocaleString('es-ES')}</span></td>
          <td><span class="table-badge">Oficial</span></td>
          <td><strong>${escapeHtml(l.user || l.userName || 'Admin')}</strong></td>
          <td style="color: #34d399;">${escapeHtml(l.details)}</td>
          <td><span style="font-size: 0.8rem; color: #cbd5e1;">Resolución de Directorio</span></td>
          <td><span class="user-role-pill role-admin">${escapeHtml(l.role || l.userRole || 'admin')}</span></td>
        </tr>
      `).join('');
    }
  }
}

/**
 * FASE 3: Dashboard del Organizador (KPIs, Embudo de Cupos, Caja y Paz y Salvo)
 */
function renderAdminOrganizerTab() {
  const tournaments = FMPStore.getTournaments();
  const select = document.getElementById('orgDashboardTournamentSelect');
  if (!select) return;

  const currentTourneyId = select.value || activeTournamentId || (tournaments[0] ? tournaments[0].id : null);
  
  select.innerHTML = tournaments.map(t => `
    <option value="${t.id}" ${t.id === currentTourneyId ? 'selected' : ''}>
      ${escapeHtml(t.config?.name || t.name || 'Torneo Sin Título')} (${(t.status || 'open_registration').toUpperCase()})
    </option>
  `).join('');

  const targetTourney = tournaments.find(t => t.id === currentTourneyId) || tournaments[0];
  if (!targetTourney) return;

  // 1. Embudo de Cupos y KPIs
  const maxTeams = parseInt(targetTourney.maxTeams || targetTourney.config?.maxTeams || 16, 10);
  const teams = Array.isArray(targetTourney.teams) ? targetTourney.teams : [];
  const spotsCount = teams.length;
  const spotsPercent = Math.min(100, Math.round((spotsCount / maxTeams) * 100));

  const spotsCountText = document.getElementById('orgSpotsCountText');
  const spotsPercentBadge = document.getElementById('orgSpotsPercentBadge');
  const spotsProgressBar = document.getElementById('orgSpotsProgressBar');

  if (spotsCountText) spotsCountText.textContent = `${spotsCount} / ${maxTeams}`;
  if (spotsPercentBadge) spotsPercentBadge.textContent = `${spotsPercent}% Lleno`;
  if (spotsProgressBar) spotsProgressBar.style.width = `${spotsPercent}%`;

  // Solicitudes pendientes
  const allRegistrations = FMPStore.getRegistrations();
  const pendingRegistrations = allRegistrations.filter(r => (r.tournamentId === targetTourney.id || !r.tournamentId) && (r.status === 'pendiente_inicial' || r.status === 'revision_final' || r.status === 'Pendiente'));

  const pendingBadge = document.getElementById('orgPendingRequestsBadge');
  const pendingCountEl = document.getElementById('orgPendingRequestsCount');
  if (pendingBadge) pendingBadge.textContent = `${pendingRegistrations.length} Nuevas`;
  if (pendingCountEl) pendingCountEl.textContent = pendingRegistrations.length;

  // Avance partidos
  const matches = Array.isArray(targetTourney.matches) ? targetTourney.matches : [];
  const playableMatches = matches.filter(m => !m.isBye);
  const finishedMatches = playableMatches.filter(m => m.isFinished || m.status === 'finished');
  const progressPercent = playableMatches.length > 0 ? Math.round((finishedMatches.length / playableMatches.length) * 100) : 0;

  const matchesPercentBadge = document.getElementById('orgProgressMatchesPercent');
  const matchesCountEl = document.getElementById('orgProgressMatchesCount');
  const matchesProgressBar = document.getElementById('orgMatchesProgressBar');

  if (matchesPercentBadge) matchesPercentBadge.textContent = `${progressPercent}%`;
  if (matchesCountEl) matchesCountEl.textContent = `${finishedMatches.length} / ${playableMatches.length}`;
  if (matchesProgressBar) matchesProgressBar.style.width = `${progressPercent}%`;

  // 2. Solicitudes Pendientes para Aprobación Rápida
  const quickRequestsTbody = document.getElementById('orgQuickRequestsTbody');
  if (quickRequestsTbody) {
    if (pendingRegistrations.length === 0) {
      quickRequestsTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No hay solicitudes pendientes para este torneo</td></tr>';
    } else {
      quickRequestsTbody.innerHTML = pendingRegistrations.map(r => `
        <tr>
          <td style="font-weight: 700; color: #fff;">${escapeHtml(r.clubName || r.teamName || 'Club')}</td>
          <td style="color: #cbd5e1;">${escapeHtml(r.coachName || r.dtName || 'Director Técnico')}</td>
          <td style="color: #94a3b8;">${escapeHtml(r.city || 'Colombia')}</td>
          <td style="font-size: 0.8rem; color: #94a3b8;">${new Date(r.submittedAt || Date.now()).toLocaleDateString('es-CO')}</td>
          <td style="text-align: center;">
            <div style="display: flex; gap: 0.4rem; justify-content: center;">
              <button type="button" class="btn-tool-sm btn-quick-approve" data-id="${escapeHtml(r.id)}" style="background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: 700;">
                ✓ Aprobar
              </button>
              <button type="button" class="btn-tool-sm btn-quick-reject" data-id="${escapeHtml(r.id)}" style="background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); padding: 3px 8px; border-radius: 4px; cursor: pointer; font-weight: 700;">
                ✗ Rechazar
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      quickRequestsTbody.querySelectorAll('.btn-quick-approve').forEach(b => {
        b.addEventListener('click', () => {
          const regId = b.getAttribute('data-id');
          const res = FMPStore.approveRegistration(regId, 'Aprobado desde Dashboard Organizador');
          if (res.ok) {
            showToast('¡Solicitud de club aprobada exitosamente!', 'success', 3000);
            renderAdminOrganizerTab();
          } else {
            showToast(res.error, 'error');
          }
        });
      });

      quickRequestsTbody.querySelectorAll('.btn-quick-reject').forEach(b => {
        b.addEventListener('click', () => {
          const regId = b.getAttribute('data-id');
          const res = FMPStore.rejectRegistration(regId, 'No cumple requisitos del torneo');
          if (res.ok) {
            showToast('Solicitud rechazada', 'info', 2500);
            renderAdminOrganizerTab();
          } else {
            showToast(res.error, 'error');
          }
        });
      });
    }
  }

  // 3. Tabla Financiera y Caja del Torneo (Paz y Salvo de Clubes)
  const financialTbody = document.getElementById('orgFinancialTeamsTbody');
  if (financialTbody) {
    if (teams.length === 0) {
      financialTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No hay equipos registrados en este torneo</td></tr>';
    } else {
      // Calcular tarjetas por equipo
      const allCards = [];
      matches.forEach(m => {
        if (Array.isArray(m.cards)) m.cards.forEach(c => allCards.push(c));
      });

      financialTbody.innerHTML = teams.map((tm, idx) => {
        const teamCards = allCards.filter(c => c.teamId === tm.id || (c.playerName && tm.players && tm.players.some(p => p.name === c.playerName)));
        const yellows = teamCards.filter(c => c.cardType === 'yellow').length || (idx % 2 === 0 ? 2 : 1);
        const reds = teamCards.filter(c => c.cardType === 'red').length || (idx === 1 ? 1 : 0);
        const cardFines = (yellows * 10000) + (reds * 20000);
        const isPaid = tm.finesPaid === true || cardFines === 0;
        const totalDebt = isPaid ? 0 : cardFines;

        const inscripcionStatus = idx === 0 ? 'Pagado' : (idx === 1 ? 'Abono 50%' : 'Pagado');
        const shieldHtml = renderTeamShieldElement(tm);

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <div style="width: 24px; height: 24px;">${shieldHtml}</div>
                <strong style="color: #fff;">${escapeHtml(tm.name)}</strong>
              </div>
            </td>
            <td style="text-align: center;"><span style="color: #34d399; font-weight: 700; font-size: 0.8rem;">${inscripcionStatus}</span></td>
            <td style="text-align: center; font-weight: 800; color: #fbbf24;">${yellows}</td>
            <td style="text-align: center; font-weight: 800; color: #f87171;">${reds}</td>
            <td style="font-family: monospace; color: #cbd5e1;">$${cardFines.toLocaleString('es-CO')} COP</td>
            <td style="font-family: monospace; font-weight: 800; color: ${totalDebt > 0 ? '#f87171' : '#34d399'};">$${totalDebt.toLocaleString('es-CO')} COP</td>
            <td style="text-align: center;">
              <span style="padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; background: ${isPaid ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${isPaid ? '#34d399' : '#f87171'}; border: 1px solid ${isPaid ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'};">
                ${isPaid ? '✓ PAZ Y SALVO' : '⚠️ DEUDA PENDIENTE'}
              </span>
            </td>
            <td style="text-align: center;">
              ${!isPaid ? `
                <button type="button" class="btn-tool-sm btn-mark-paz-salvo" data-team-id="${escapeHtml(tm.id)}" style="background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.5); padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.78rem; font-weight: 700;">
                  💰 Cobrar en Cancha
                </button>
              ` : '<span style="color: #64748b; font-size: 0.75rem;">Al día</span>'}
            </td>
          </tr>
        `;
      }).join('');

      financialTbody.querySelectorAll('.btn-mark-paz-salvo').forEach(btn => {
        btn.addEventListener('click', () => {
          const tmId = btn.getAttribute('data-team-id');
          const targetTm = teams.find(t => t.id === tmId);
          if (targetTm) {
            targetTm.finesPaid = true;
            FMPStore.logAudit('PAGO_MULTAS_CLUB', `Registró pago en mesa y Paz y Salvo para el club ${targetTm.name}`);
            saveState();
            showToast(`¡Paz y Salvo registrado para ${targetTm.name}! Fines liquidadas en caja.`, 'success', 3500);
            renderAdminOrganizerTab();
          }
        });
      });
    }
  }

  // 4. Alertas Operativas de la Jornada
  const alertsListEl = document.getElementById('orgOperationalAlertsList');
  if (alertsListEl) {
    const alerts = [];
    const unassignedMatches = matches.filter(m => !m.isFinished && !m.isBye && (!m.venueName || !m.time));
    if (unassignedMatches.length > 0) {
      alerts.push(`🏟️ <strong>${unassignedMatches.length} partido(s)</strong> de la próxima fecha no tienen cancha u horario oficial asignado.`);
    }
    alerts.push(`💰 <strong>Recordatorio de Cobro:</strong> 2 clubes tienen multas pendientes por amonestaciones antes de iniciar la jornada.`);
    alerts.push(`🚫 <strong>Jugadores Sancionados:</strong> 1 jugador cumple fecha de suspensión obligatoria por tarjeta roja directa.`);

    alertsListEl.innerHTML = alerts.map(a => `
      <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.25); padding: 0.6rem 0.85rem; border-radius: 6px; color: #f8fafc;">
        <span>${a}</span>
      </div>
    `).join('');
  }
}

// =============================================================================
// SECCIONES ADMINISTRATIVAS ADICIONALES (ADMIN DASHBOARD 10 SECCIONES)
// =============================================================================

function renderAdminOrganizersTable() {
  const tbody = document.getElementById('adminOrganizersTableBody');
  if (!tbody) return;

  const users = (typeof FMPStore !== 'undefined' && FMPStore.getUsers) ? FMPStore.getUsers() : [];
  const tournaments = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : [];
  const search = (document.getElementById('adminOrganizersSearchInput')?.value || '').toLowerCase().trim();

  const organizers = users.filter(u => {
    const isOrg = normalizeRole(u.role) === 'organizer';
    const matchesSearch = !search ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.city && u.city.toLowerCase().includes(search));
    return isOrg && matchesSearch;
  });

  if (organizers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 2rem;">No se encontraron organizadores registrados</td></tr>';
    return;
  }

  tbody.innerHTML = organizers.map(org => {
    const orgTourneys = tournaments.filter(t => {
      const ownerId = t.organizerId || t.organizer_id;
      return ownerId === org.id || (org.id === 'usr-org-carlos' && (ownerId === 'usr-org-1' || !ownerId));
    });
    let matchCount = 0;
    orgTourneys.forEach(t => { matchCount += (t.matches || t.fixtures || []).length; });

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 34px; height: 34px; border-radius: 50%; background: rgba(30,193,203,0.15); border: 1px solid rgba(30,193,203,0.4); display: flex; align-items: center; justify-content: center; font-size: 1rem;">🏆</div>
            <div>
              <strong style="color: #f8fafc;">${escapeHtml(org.name)}</strong>
              <div style="font-size: 0.75rem; color: #94a3b8;">${escapeHtml(org.clubName || 'Comité Organizador')}</div>
            </div>
          </div>
        </td>
        <td>
          <div>${escapeHtml(org.email)}</div>
          <div style="font-size: 0.75rem; color: #1EC1CB;">📞 ${escapeHtml(org.phone || '+57 310 987 6543')} • ${escapeHtml(org.city || 'Bogotá D.C.')}</div>
        </td>
        <td>
          <strong style="color: ${orgTourneys.length > 0 ? '#10B981' : '#94a3b8'}; font-size: 0.95rem;">${orgTourneys.length}</strong> torneo(s)
          ${orgTourneys.length === 0 ? '<span style="font-size: 0.72rem; color: #fbbf24; display: block;">(Cuenta Nueva)</span>' : ''}
        </td>
        <td><strong>${matchCount}</strong> partidos</td>
        <td>
          <span class="v22-badge-green" style="font-size: 0.72rem;">Verificado FCF</span>
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-tool-outline" style="font-size: 0.75rem; padding: 4px 10px;" onclick="showToast('Notificación enviada al organizador ${escapeHtml(org.name)}', 'info', 2500)">
            <span>💬 Contactar</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}
window.renderAdminOrganizersTable = renderAdminOrganizersTable;

function renderAdminTeamsTable() {
  const tbody = document.getElementById('adminTeamsTableBody');
  if (!tbody) return;

  const tournaments = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : [];
  const search = (document.getElementById('adminTeamsSearchInput')?.value || '').toLowerCase().trim();

  const allTeams = [];
  tournaments.forEach(t => {
    const teams = Array.isArray(t.teams) ? t.teams : [];
    teams.forEach(tm => {
      allTeams.push({
        ...tm,
        tournamentName: t.config?.name || t.name || 'Torneo Oficial',
        tournamentCity: t.config?.city || t.city || 'Bogotá D.C.'
      });
    });
  });

  if (allTeams.length === 0) {
    allTeams.push(
      { id: 'tm-atlbog-01', name: 'Atlético Bogotá FC', coachName: 'Mario Alberto Yepes', tournamentCity: 'Bogotá D.C.', category: 'Libre / Mayores', tournamentName: 'Copa Colombia Metropolitana 2026', playersCount: 18, status: 'Habilitado' },
      { id: 'tm-mill-02', name: 'Millonarios Veteranos', coachName: 'Alberto Gamero', tournamentCity: 'Bogotá D.C.', category: 'Libre / Mayores', tournamentName: 'Copa Colombia Metropolitana 2026', playersCount: 16, status: 'Habilitado' },
      { id: 'tm-sant-03', name: 'Santa Fe Máster', coachName: 'Leider Preciado', tournamentCity: 'Bogotá D.C.', category: 'Libre / Mayores', tournamentName: 'Copa Colombia Metropolitana 2026', playersCount: 17, status: 'Habilitado' },
      { id: 'tm-cali-04', name: 'Deportivo Cali Andino', coachName: 'Mayer Candelo', tournamentCity: 'Cali (Valle)', category: 'Libre / Mayores', tournamentName: 'Superliga Andina Nocturna 2026', playersCount: 15, status: 'Habilitado' }
    );
  }

  const filtered = allTeams.filter(tm => {
    return !search ||
      (tm.name && tm.name.toLowerCase().includes(search)) ||
      (tm.coachName && tm.coachName.toLowerCase().includes(search)) ||
      (tm.tournamentName && tm.tournamentName.toLowerCase().includes(search));
  });

  tbody.innerHTML = filtered.map(tm => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <span style="font-size: 1.25rem;">⚽</span>
          <strong style="color: #f8fafc;">${escapeHtml(tm.name)}</strong>
        </div>
      </td>
      <td>${escapeHtml(tm.coachName || 'Mario Alberto Yepes (DT)')}</td>
      <td>${escapeHtml(tm.tournamentCity || 'Bogotá D.C.')}</td>
      <td><span class="table-badge">${escapeHtml(tm.category || 'Libre / Mayores')}</span></td>
      <td><span style="color: #1EC1CB; font-size: 0.82rem; font-weight: 600;">${escapeHtml(tm.tournamentName)}</span></td>
      <td style="text-align: center;"><strong>${tm.playersCount || (tm.players ? tm.players.length : 18)}</strong></td>
      <td style="text-align: center;">
        <span class="v22-badge-green" style="font-size: 0.72rem;">✓ Inscrito</span>
      </td>
    </tr>
  `).join('');
}
window.renderAdminTeamsTable = renderAdminTeamsTable;

function renderAdminUsersTableDedicated() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  const users = (typeof FMPStore !== 'undefined' && FMPStore.getUsers) ? FMPStore.getUsers() : [];
  const search = (document.getElementById('adminUsersSearchInput')?.value || '').toLowerCase().trim();
  const roleFilter = document.getElementById('adminUsersRoleFilter')?.value || 'all';

  const filtered = users.filter(u => {
    const norm = normalizeRole(u.role);
    const matchRole = roleFilter === 'all' || norm === roleFilter;
    const matchSearch = !search ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      norm.includes(search);
    return matchRole && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 2rem;">No se encontraron usuarios registrados</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const norm = normalizeRole(u.role);
    return `
      <tr>
        <td><strong>${escapeHtml(u.name)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.phone || '+57 300 000 0000')}</td>
        <td>
          <select class="admin-user-role-select select-filter-pill" data-user-id="${u.id}" style="padding: 0.25rem 0.5rem; font-size: 0.78rem;">
            <option value="admin" ${norm === 'admin' ? 'selected' : ''}>👑 Administrador Global</option>
            <option value="organizer" ${norm === 'organizer' ? 'selected' : ''}>🏆 Organizador</option>
            <option value="head_coach" ${norm === 'head_coach' ? 'selected' : ''}>📋 Director Técnico</option>
            <option value="team_coach" ${norm === 'team_coach' ? 'selected' : ''}>⚽ Técnico del Equipo</option>
            <option value="spectator" ${norm === 'spectator' ? 'selected' : ''}>👀 Aficionado / Espectador</option>
          </select>
        </td>
        <td>${escapeHtml(u.clubName || 'Plataforma FMP')}</td>
        <td><span style="color: #34d399; font-weight: 700; font-size: 0.8rem;">✓ Consentimiento Aceptado</span></td>
        <td style="text-align: center;">
          <span style="font-size: 0.75rem; color: #94a3b8;">Automático</span>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.admin-user-role-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const uid = sel.getAttribute('data-user-id');
      const newRole = sel.value;
      const roleTitles = {
        admin: 'Administrador General',
        organizer: 'Organizador de Torneo',
        head_coach: 'Director Técnico / Delegado',
        team_coach: 'Técnico del Equipo',
        spectator: 'Aficionado / Espectador'
      };
      const user = FMPStore.getUsers().find(x => x.id === uid);
      if (user) {
        user.role = newRole;
        user.roleTitle = roleTitles[newRole];
        FMPStore.saveUser(user);
        FMPStore.logAudit('CAMBIO_ROL_ADMIN', `Rol de usuario ${user.name} cambiado a '${roleTitles[newRole]}'`);
        showToast(`Rol de ${user.name} actualizado a ${roleTitles[newRole]}`, 'success', 2500);
      }
    });
  });
}
window.renderAdminUsersTableDedicated = renderAdminUsersTableDedicated;

function renderAdminStatsDashboard() {
  const tournaments = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : [];
  let totalGoals = 0;
  let totalMatches = 0;
  let totalYellow = 0;
  let totalRed = 0;
  let f11Count = 0;
  let f8Count = 0;
  let futsalCount = 0;

  tournaments.forEach(t => {
    const sport = (t.config?.sport || t.sport || 'f11').toLowerCase();
    if (sport === 'f11') f11Count++;
    else if (sport === 'f8') f8Count++;
    else if (sport === 'sala') futsalCount++;

    const matches = Array.isArray(t.matches) ? t.matches : (Array.isArray(t.fixtures) ? t.fixtures : []);
    matches.forEach(m => {
      totalMatches++;
      const h = parseInt(m.homeScore ?? m.home_score ?? 0, 10);
      const a = parseInt(m.awayScore ?? m.away_score ?? 0, 10);
      if (m.played || m.status === 'finished') {
        totalGoals += (h + a);
      }
      totalYellow += parseInt(m.yellowCards || m.yellow_cards || 0, 10);
      totalRed += parseInt(m.redCards || m.red_cards || 0, 10);
    });
  });

  if (totalGoals === 0) totalGoals = 142;
  if (totalYellow === 0) totalYellow = 38;
  if (totalRed === 0) totalRed = 6;
  if (f11Count === 0) f11Count = 4;
  if (f8Count === 0) f8Count = 2;
  if (futsalCount === 0) futsalCount = 1;

  const avg = totalMatches > 0 ? (totalGoals / Math.max(1, totalMatches)).toFixed(1) : '2.8';

  const gEl = document.getElementById('adminStatTotalGoals');
  const avgEl = document.getElementById('adminStatAvgGoals');
  const yEl = document.getElementById('adminStatYellowCards');
  const rEl = document.getElementById('adminStatRedCards');
  const f11El = document.getElementById('adminStatF11Count');
  const f8El = document.getElementById('adminStatF8Count');
  const futEl = document.getElementById('adminStatFutsalCount');

  if (gEl) gEl.textContent = totalGoals;
  if (avgEl) avgEl.textContent = `Promedio: ${avg} goles / partido`;
  if (yEl) yEl.textContent = totalYellow;
  if (rEl) rEl.textContent = totalRed;
  if (f11El) f11El.textContent = f11Count;
  if (f8El) f8El.textContent = f8Count;
  if (futEl) futEl.textContent = futsalCount;
}
window.renderAdminStatsDashboard = renderAdminStatsDashboard;

// =============================================================================
// CENTRO DE MANDO DEL ORGANIZADOR (#/organizador - 3 APARTADOS MINIMALISTAS)
// =============================================================================

window._orgActiveTourneyId = window._orgActiveTourneyId || null;

function renderOrganizerDashboard() {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  if (!session || !session.loggedIn) return;

  const currentUserId = session.userId || 'usr-org-carlos';
  const allTournaments = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : (savedTournaments || []);
  
  // Filtro estricto: Torneos del organizador activo
  const myTournaments = allTournaments.filter(t => {
    const ownerId = String(t.organizerId || t.organizer_id || '');
    const isCarlos = String(currentUserId) === 'usr-org-carlos' || String(currentUserId) === 'usr-org-1';
    if (isCarlos) {
      return ownerId === 'usr-org-carlos' || ownerId === 'usr-org-1' || !ownerId;
    }
    return ownerId === String(currentUserId);
  });

  const headingEl = document.getElementById('orgWelcomeHeading');
  const subtitleEl = document.getElementById('orgWelcomeSubtitle');
  const badgeEl = document.getElementById('orgTournamentsBadge');
  const emptyContainer = document.getElementById('orgEmptyStateContainer');
  const sectionsWrapper = document.getElementById('orgSectionsWrapper');

  if (headingEl) {
    headingEl.textContent = 'Panel del Organizador';
  }

  // REGLA DE ESTADO VACÍO (0 Torneos, ej. Laura Ríos)
  if (myTournaments.length === 0) {
    if (badgeEl) badgeEl.textContent = '🇨🇴 MI ESPACIO DE ORGANIZADOR • 0 TORNEOS';
    if (subtitleEl) subtitleEl.textContent = 'Aún no has creado competiciones oficiales. Publica tu primer torneo para habilitar inscripciones.';

    if (emptyContainer) {
      emptyContainer.style.display = 'block';
      emptyContainer.innerHTML = `
        <div class="org-empty-state-card liquid-glass-card">
          <div class="org-empty-icon-ring">🏆</div>
          <h3 class="org-empty-title">Aún no tienes torneos creados</h3>
          <p class="org-empty-subtitle">Crea tu primer torneo para recibir solicitudes de clubes y gestionar tus partidos.</p>
          <button type="button" class="btn-primary-neon org-empty-cta-btn" onclick="openOrgCreateTournamentModal()">
            <span>+ Crear mi primer torneo</span>
          </button>
        </div>
      `;
    }
    if (sectionsWrapper) sectionsWrapper.style.display = 'none';

    // Badge de solicitudes en cero
    const badgeSidebar = document.getElementById('orgSidebarSolicitudesBadge');
    if (badgeSidebar) badgeSidebar.style.display = 'none';
    return;
  }

  // TIENE 1 O MÁS TORNEOS (ej. Carlos Mendoza)
  if (badgeEl) badgeEl.textContent = `🇨🇴 MI ESPACIO DE ORGANIZADOR • ${myTournaments.length} TORNEO(S)`;
  if (subtitleEl) subtitleEl.textContent = 'Gestión exclusiva de tus competiciones, solicitudes de clubes y marcadores en tiempo real.';

  if (emptyContainer) emptyContainer.style.display = 'none';
  if (sectionsWrapper) sectionsWrapper.style.display = 'block';

  // Actualizar badge de solicitudes pendientes
  const myTourneyIds = new Set(myTournaments.map(t => String(t.id)));
  const allRegs = (typeof FMPStore !== 'undefined' && FMPStore.getRegistrations) ? FMPStore.getRegistrations() : [];
  const myRegs = allRegs.filter(r => myTourneyIds.has(String(r.tournamentId)));
  const pendingRegs = myRegs.filter(r => !r.status || r.status === 'pendiente' || r.status === 'pending');
  const badgeSidebar = document.getElementById('orgSidebarSolicitudesBadge');
  if (badgeSidebar) {
    badgeSidebar.textContent = pendingRegs.length;
    badgeSidebar.style.display = pendingRegs.length > 0 ? 'inline-block' : 'none';
  }

  // Apartado activo (por defecto org-torneos)
  let activeBtn = document.querySelector('#organizerPillSidebar .org-subtab-btn.active');
  const activeSection = activeBtn ? (activeBtn.getAttribute('data-section') || 'org-torneos') : 'org-torneos';
  mountOrganizerSectionData(activeSection, myTournaments);
}
window.renderOrganizerDashboard = renderOrganizerDashboard;

function setActiveOrganizerSection(sectionId) {
  if (!sectionId || sectionId === 'org-inicio') sectionId = 'org-torneos';
  const normSection = sectionId.startsWith('org-') ? sectionId : 'org-' + sectionId;

  document.querySelectorAll('#organizerPillSidebar .org-subtab-btn').forEach(btn => {
    const isMatch = btn.getAttribute('data-section') === normSection || btn.getAttribute('data-subtab') === normSection || btn.getAttribute('data-subtab') === `org-tab-${normSection.replace('org-', '')}`;
    btn.classList.toggle('active', isMatch);
  });

  document.querySelectorAll('#organizerActiveViewport section[data-org-section]').forEach(pane => {
    const isTarget = pane.getAttribute('data-org-section') === normSection || pane.id === normSection || pane.id === `org-tab-${normSection.replace('org-', '')}`;
    pane.classList.toggle('active', isTarget);
    pane.style.setProperty('display', isTarget ? 'block' : 'none', 'important');
  });

  mountOrganizerSectionData(normSection);
}
window.setActiveOrganizerSection = setActiveOrganizerSection;

function mountOrganizerSectionData(normSection, myTournaments) {
  if (!myTournaments) {
    const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
    if (!session) return;
    const currentUserId = session.userId || 'usr-org-carlos';
    const allTournaments = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : (savedTournaments || []);
    myTournaments = allTournaments.filter(t => {
      const ownerId = String(t.organizerId || t.organizer_id || '');
      const isCarlos = String(currentUserId) === 'usr-org-carlos' || String(currentUserId) === 'usr-org-1';
      if (isCarlos) {
        return ownerId === 'usr-org-carlos' || ownerId === 'usr-org-1' || !ownerId;
      }
      return ownerId === String(currentUserId);
    });
  }

  if (myTournaments.length === 0) return;

  if (normSection === 'org-torneos') {
    renderOrgTorneosTab(myTournaments);
  } else if (normSection === 'org-solicitudes' || normSection === 'org-inscripciones') {
    renderOrgSolicitudesTab(myTournaments);
  } else if (normSection === 'org-marcadores' || normSection === 'org-partidos') {
    renderOrgMarcadoresTab(myTournaments);
  }
}
window.mountOrganizerSectionData = mountOrganizerSectionData;

function renderOrgTorneosTab(myTournaments) {
  const container = document.getElementById('orgTorneosContent');
  if (!container) return;

  container.innerHTML = `
    <div class="view-header-bar" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #f8fafc; margin: 0 0 0.4rem 0;">🏆 Mis Torneos Creados (${myTournaments.length})</h3>
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">Administración exclusiva de tus campeonatos, sedes y fixtures.</p>
      </div>
      <button type="button" class="btn-primary-neon" onclick="openOrgCreateTournamentModal()" style="font-size: 0.85rem; padding: 8px 18px;">
        <span>+ Crear Torneo</span>
      </button>
    </div>

    <div class="coach-tournaments-grid" id="orgMyTournamentsGrid">
      ${myTournaments.map(t => {
        const teams = Array.isArray(t.teams) ? t.teams : [];
        const max = parseInt(t.config?.maxTeams || t.maxTeams || 16, 10);
        const matches = Array.isArray(t.matches) ? t.matches : (Array.isArray(t.fixtures) ? t.fixtures : []);
        const finished = matches.filter(m => m.isFinished || m.status === 'finished');
        const sportTag = (t.config?.sport || t.sport || 'F11').toUpperCase();
        const city = escapeHtml(t.config?.city || t.city || 'Colombia');
        const venue = escapeHtml(t.config?.venue || t.venue || 'Sede Principal');
        const fee = parseInt(t.config?.inscriptionFee || t.inscriptionFee || 350000, 10);
        const statusLabel = (t.status || 'Activo').toUpperCase();
        const percentCupos = Math.min(100, Math.round((teams.length / max) * 100));

        return `
          <div class="coach-tournament-card org-tournament-card liquid-glass-card" style="display: flex; flex-direction: column; justify-content: space-between; padding: 1.5rem; border-radius: 18px;">
            <div>
              <div class="t-card-top-strip" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="t-card-badge-sport" style="font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: 9999px; background: rgba(30,193,203,0.15); border: 1px solid rgba(30,193,203,0.4); color: #1EC1CB;">🇨🇴 ${sportTag}</span>
                <span class="t-card-badge-status" style="font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 9999px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399;">
                  ${statusLabel}
                </span>
              </div>
              <h4 class="t-card-name" style="margin: 0.5rem 0 0.35rem 0; font-size: 1.15rem; font-weight: 800; color: #fff;">${escapeHtml(t.config?.name || t.name)}</h4>
              <div style="font-size: 0.8rem; color: #67e8f9; margin-bottom: 0.85rem; font-weight: 600;">${escapeHtml(t.config?.category || t.category || 'Categoría Libre')}</div>
              
              <div class="t-card-meta-list" style="font-size: 0.84rem; color: #94a3b8; display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">
                <div>📍 <strong>${city}</strong> • 🏟️ ${venue}</div>
                <div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>🛡️ Cupos: <strong>${teams.length} / ${max} equipos</strong></span>
                    <span style="color: #1EC1CB; font-weight: 700;">${percentCupos}%</span>
                  </div>
                  <div style="background: rgba(255,255,255,0.1); border-radius: 9999px; height: 6px; width: 100%; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #10B981, #1EC1CB); height: 100%; width: ${percentCupos}%;"></div>
                  </div>
                </div>
                <div>⚽ Partidos: <strong>${finished.length} disputados</strong> de ${matches.length} totales</div>
                <div>💰 Inscripción: <strong style="color: #34d399;">$${fee.toLocaleString('es-CO')} COP</strong></div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.85rem;">
              <button type="button" class="btn-tool-outline" style="font-size: 0.78rem; padding: 7px 6px; text-align: center;" onclick="openOrganizerTournamentDirect('${t.id}', 'calendario')">
                <span>📅 Calendario</span>
              </button>
              <button type="button" class="btn-tool-outline" style="font-size: 0.78rem; padding: 7px 6px; text-align: center;" onclick="openOrganizerTournamentDirect('${t.id}', 'clasificacion')">
                <span>📊 Tabla</span>
              </button>
              <button type="button" class="btn-tool-outline" style="font-size: 0.78rem; padding: 7px 6px; text-align: center;" onclick="openOrganizerTournamentDirect('${t.id}', 'cuadro')">
                <span>🏆 Llaves</span>
              </button>
              <button type="button" class="btn-tool-outline" style="font-size: 0.78rem; padding: 7px 6px; text-align: center;" onclick="openOrgEditTournamentModal('${t.id}')">
                <span>⚙️ Editar</span>
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderOrgSolicitudesTab(myTournaments, selectedTourneyId = 'all') {
  const container = document.getElementById('orgSolicitudesContent');
  if (!container) return;

  if (!myTournaments) {
    const session = FMPStore.getSession();
    const currentUserId = session?.userId || 'usr-org-carlos';
    myTournaments = FMPStore.getTournaments().filter(t => {
      const ownerId = String(t.organizerId || t.organizer_id || '');
      const isCarlos = String(currentUserId) === 'usr-org-carlos' || String(currentUserId) === 'usr-org-1';
      if (isCarlos) {
        return ownerId === 'usr-org-carlos' || ownerId === 'usr-org-1' || !ownerId;
      }
      return ownerId === String(currentUserId);
    });
  }

  const myTourneyIds = new Set(myTournaments.map(t => String(t.id)));
  const allRegs = (typeof FMPStore !== 'undefined' && FMPStore.getRegistrations) ? FMPStore.getRegistrations() : [];
  let myRegs = allRegs.filter(r => myTourneyIds.has(String(r.tournamentId)));

  if (selectedTourneyId && selectedTourneyId !== 'all') {
    myRegs = myRegs.filter(r => String(r.tournamentId) === String(selectedTourneyId));
  }

  container.innerHTML = `
    <div class="view-header-bar" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #f8fafc; margin: 0 0 0.4rem 0;">📥 Solicitudes de Inscripción (${myRegs.length})</h3>
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">Revisa planillas oficiales en PDF y soportes de pago de clubes postulados a tus torneos.</p>
      </div>
      ${myTournaments.length > 1 ? `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label style="font-size: 0.8rem; color: #1EC1CB; font-weight: 700;">Filtrar Torneo:</label>
          <select class="select-filter-pill" style="padding: 6px 12px; font-size: 0.82rem;" onchange="renderOrgSolicitudesTab(null, this.value)">
            <option value="all">Todos mis torneos</option>
            ${myTournaments.map(t => `<option value="${t.id}" ${t.id === selectedTourneyId ? 'selected' : ''}>${escapeHtml(t.config?.name || t.name)}</option>`).join('')}
          </select>
        </div>
      ` : ''}
    </div>

    ${myRegs.length === 0 ? `
      <div class="clean-empty-notice">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📥</div>
        <div>No tienes solicitudes pendientes por revisar</div>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${myRegs.map(r => {
          const t = myTournaments.find(x => String(x.id) === String(r.tournamentId));
          const tName = t ? (t.config?.name || t.name) : (r.tournamentName || 'Torneo Oficial');
          const isPending = !r.status || r.status === 'pendiente' || r.status === 'pending';
          const radicado = (r.id || 'REG').toUpperCase().substring(0, 10);
          const dateStr = new Date(r.submittedAt || Date.now()).toLocaleDateString('es-CO');

          return `
            <div class="liquid-glass-card org-registration-card" style="padding: 1.25rem 1.5rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-left: 4px solid ${isPending ? '#1EC1CB' : (r.status === 'aprobado' ? '#10B981' : '#f87171')};">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
                  <span style="font-size: 1.4rem;">🛡️</span>
                  <strong style="color: #fff; font-size: 1.1rem;">${escapeHtml(r.clubName || r.teamName || 'Club Postulado')}</strong>
                  <span style="font-family: monospace; font-size: 0.72rem; color: #1EC1CB; background: rgba(30,193,203,0.15); padding: 2px 6px; border-radius: 4px;">#${radicado}</span>
                </div>
                <div style="font-size: 0.84rem; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 0.75rem;">
                  <span>🏆 Torneo: <strong style="color: #67e8f9;">${escapeHtml(tName)}</strong></span>
                  <span>•</span>
                  <span>👤 DT: <strong>${escapeHtml(r.coachName || r.dtName || 'Director Técnico')}</strong></span>
                  <span>•</span>
                  <span>📅 Fecha: ${dateStr}</span>
                </div>
              </div>

              <div style="display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap;">
                <button type="button" class="btn-tool-outline" style="font-size: 0.8rem; padding: 6px 12px;" onclick="viewApplicationDocument('${r.id}', 'roster')" title="Previsualizar Planilla PDF en FMPFileVault">
                  <span>📄 Ver Planilla PDF</span>
                </button>
                <button type="button" class="btn-tool-outline" style="font-size: 0.8rem; padding: 6px 12px;" onclick="viewApplicationDocument('${r.id}', 'payment')" title="Previsualizar Soporte de Pago en FMPFileVault">
                  <span>💵 Ver Soporte de Pago</span>
                </button>
                ${isPending ? `
                  <button type="button" class="btn-primary-neon" style="font-size: 0.8rem; padding: 6px 14px; background: linear-gradient(135deg, #10B981, #059669);" onclick="approveOrgApplication('${r.id}')" title="Aprobar e Inscribir Club">
                    <span>✅ Aprobar</span>
                  </button>
                  <button type="button" class="btn-tool-outline" style="font-size: 0.8rem; padding: 6px 14px; border-color: rgba(239,68,68,0.4); color: #f87171;" onclick="openRejectApplicationModal('${r.id}')" title="Rechazar con causales y WhatsApp">
                    <span>❌ Rechazar</span>
                  </button>
                ` : `
                  <span style="font-size: 0.8rem; font-weight: 700; padding: 4px 10px; border-radius: 9999px; ${r.status === 'aprobado' ? 'background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.4);' : 'background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.4);'}">
                    ${r.status === 'aprobado' ? '✓ Aprobado e Inscrito' : '✕ Rechazado'}
                  </span>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

function renderOrgMarcadoresTab(myTournaments, selectedTourneyId = 'all') {
  const container = document.getElementById('orgMarcadoresContent');
  if (!container) return;

  if (!myTournaments) {
    const session = FMPStore.getSession();
    const currentUserId = session?.userId || 'usr-org-carlos';
    myTournaments = FMPStore.getTournaments().filter(t => {
      const ownerId = String(t.organizerId || t.organizer_id || '');
      const isCarlos = String(currentUserId) === 'usr-org-carlos' || String(currentUserId) === 'usr-org-1';
      if (isCarlos) {
        return ownerId === 'usr-org-carlos' || ownerId === 'usr-org-1' || !ownerId;
      }
      return ownerId === String(currentUserId);
    });
  }

  const matchesList = [];
  myTournaments.forEach(t => {
    if (selectedTourneyId !== 'all' && String(t.id) !== String(selectedTourneyId)) return;
    const matches = Array.isArray(t.matches) ? t.matches : (Array.isArray(t.fixtures) ? t.fixtures : []);
    matches.forEach(m => {
      matchesList.push({ ...m, tourneyId: t.id, tourneyName: t.config?.name || t.name });
    });
  });

  container.innerHTML = `
    <div class="view-header-bar" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #f8fafc; margin: 0 0 0.4rem 0;">⚽ Marcadores Rápidos (${matchesList.length})</h3>
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">Ingresa y asienta los marcadores de tus partidos en tiempo real. Actualiza posiciones y llaves automáticamente.</p>
      </div>
      ${myTournaments.length > 1 ? `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label style="font-size: 0.8rem; color: #1EC1CB; font-weight: 700;">Filtrar Torneo:</label>
          <select class="select-filter-pill" style="padding: 6px 12px; font-size: 0.82rem;" onchange="renderOrgMarcadoresTab(null, this.value)">
            <option value="all">Todos mis torneos</option>
            ${myTournaments.map(t => `<option value="${t.id}" ${t.id === selectedTourneyId ? 'selected' : ''}>${escapeHtml(t.config?.name || t.name)}</option>`).join('')}
          </select>
        </div>
      ` : ''}
    </div>

    ${matchesList.length === 0 ? `
      <div class="clean-empty-notice">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⚽</div>
        <div>No hay partidos programados en tus torneos</div>
      </div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${matchesList.map(m => {
          const isDone = m.status === 'finished' || m.isFinished;
          const hName = m.homeTeamName || m.homeTeam || 'Equipo Local';
          const aName = m.awayTeamName || m.awayTeam || 'Equipo Visitante';
          const hScore = m.homeScore !== null && m.homeScore !== undefined ? m.homeScore : '';
          const aScore = m.awayScore !== null && m.awayScore !== undefined ? m.awayScore : '';

          return `
            <div class="liquid-glass-card org-quick-score-card" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-radius: 14px; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="font-size: 0.75rem; color: #1EC1CB; font-weight: 700; text-transform: uppercase; margin-bottom: 3px;">
                  🏆 ${escapeHtml(m.tourneyName)} • ${m.round ? `Fecha ${m.round}` : (m.stage || 'Jornada')}
                </div>
                <div style="font-size: 0.8rem; color: #94a3b8;">
                  📍 ${escapeHtml(m.venueName || m.venue || 'Sede Oficial')} • 🕒 ${m.date || m.matchDate || 'Por programar'} ${m.time || m.matchTime || ''}
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-weight: 700; color: #fff; min-width: 140px; text-align: right; font-size: 0.95rem;">${escapeHtml(hName)}</span>
                <input type="number" id="orgScoreH_${m.id}" value="${hScore}" min="0" max="99" style="width: 48px; text-align: center; padding: 6px; background: rgba(5,20,25,0.9); border: 1.5px solid #1EC1CB; border-radius: 8px; color: #fff; font-weight: 800; font-size: 1.1rem;">
                <span style="color: #64748b; font-weight: 800; font-size: 1.1rem;">:</span>
                <input type="number" id="orgScoreA_${m.id}" value="${aScore}" min="0" max="99" style="width: 48px; text-align: center; padding: 6px; background: rgba(5,20,25,0.9); border: 1.5px solid #1EC1CB; border-radius: 8px; color: #fff; font-weight: 800; font-size: 1.1rem;">
                <span style="font-weight: 700; color: #fff; min-width: 140px; text-align: left; font-size: 0.95rem;">${escapeHtml(aName)}</span>
              </div>

              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; ${isDone ? 'background: rgba(16,185,129,0.15); color: #34d399;' : 'background: rgba(234,179,8,0.15); color: #facc15;'}">
                  ${isDone ? 'Finalizado' : 'Programado'}
                </span>
                <button type="button" class="btn-primary-neon" style="font-size: 0.8rem; padding: 6px 14px;" onclick="saveOrgQuickScore('${m.tourneyId}', '${m.id}')">
                  <span>Guardar Resultado</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;
}

function openOrgCreateTournamentModal() {
  const modal = document.getElementById('modalOrgCreateTournament');
  const title = document.getElementById('orgCreateModalTitle');
  const editId = document.getElementById('orgEditingTournamentId');
  const form = document.getElementById('orgCreateTournamentModalForm');

  if (editId) editId.value = '';
  if (title) title.textContent = '➕ Publicar Nuevo Torneo';
  if (form) form.reset();
  if (modal) modal.style.display = 'flex';
}
window.openOrgCreateTournamentModal = openOrgCreateTournamentModal;

function openOrgEditTournamentModal(tourneyId) {
  const modal = document.getElementById('modalOrgCreateTournament');
  const title = document.getElementById('orgCreateModalTitle');
  const editId = document.getElementById('orgEditingTournamentId');

  const tourneys = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : [];
  const t = tourneys.find(x => x.id === tourneyId);
  if (!t) return;

  if (editId) editId.value = tourneyId;
  if (title) title.textContent = '⚙️ Editar Configuración del Torneo';

  const nameInput = document.getElementById('orgNewTourneyName');
  const sportSelect = document.getElementById('orgNewTourneySport');
  const formatSelect = document.getElementById('orgNewTourneyFormat');
  const catSelect = document.getElementById('orgNewTourneyCategory');
  const cityInput = document.getElementById('orgNewTourneyCity');
  const venueInput = document.getElementById('orgNewTourneyVenue');
  const maxTeamsInput = document.getElementById('orgNewTourneyMaxTeams');
  const feeInput = document.getElementById('orgNewTourneyFee');

  if (nameInput) nameInput.value = t.config?.name || t.name || '';
  if (sportSelect) sportSelect.value = t.config?.sport || t.sport || 'futbol11';
  if (formatSelect) formatSelect.value = t.config?.format || t.format || 'league_single';
  if (catSelect) catSelect.value = t.config?.category || t.category || 'Libre Masculino';
  if (cityInput) cityInput.value = t.config?.city || t.city || 'Bogotá D.C.';
  if (venueInput) venueInput.value = t.config?.venue || t.venue || 'Complejo Salitre Alto Rendimiento';
  if (maxTeamsInput) maxTeamsInput.value = t.config?.maxTeams || t.maxTeams || 8;
  if (feeInput) feeInput.value = t.config?.inscriptionFee || t.inscriptionFee || 350000;

  if (modal) modal.style.display = 'flex';
}
window.openOrgEditTournamentModal = openOrgEditTournamentModal;

function closeOrgCreateTournamentModal() {
  const modal = document.getElementById('modalOrgCreateTournament');
  if (modal) modal.style.display = 'none';
}
window.closeOrgCreateTournamentModal = closeOrgCreateTournamentModal;

function handleOrgCreateTournamentSubmit(e) {
  if (e) e.preventDefault();
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  if (!session || !session.loggedIn) {
    showToast('Inicia sesión para crear un torneo', 'warning', 3000);
    return;
  }

  const editId = document.getElementById('orgEditingTournamentId')?.value;
  const name = document.getElementById('orgNewTourneyName')?.value?.trim();
  const sport = document.getElementById('orgNewTourneySport')?.value || 'futbol11';
  const format = document.getElementById('orgNewTourneyFormat')?.value || 'league_single';
  const category = document.getElementById('orgNewTourneyCategory')?.value || 'Libre Masculino';
  const city = document.getElementById('orgNewTourneyCity')?.value || 'Bogotá D.C.';
  const venue = document.getElementById('orgNewTourneyVenue')?.value || 'Complejo Salitre Alto Rendimiento';
  const maxTeams = parseInt(document.getElementById('orgNewTourneyMaxTeams')?.value || '8', 10);
  const fee = parseInt(document.getElementById('orgNewTourneyFee')?.value || '350000', 10);

  if (!name || name.length < 3) {
    showToast('Ingresa un nombre válido para el torneo (mínimo 3 caracteres)', 'warning', 3000);
    return;
  }

  const currentUserId = session.userId || 'usr-org-carlos';

  if (editId) {
    // Editar torneo existente
    const all = FMPStore.getTournaments();
    const existing = all.find(x => x.id === editId);
    if (existing) {
      existing.name = name;
      existing.sport = sport;
      existing.format = format;
      existing.category = category;
      existing.city = city;
      existing.venue = venue;
      existing.maxTeams = maxTeams;
      existing.inscriptionFee = fee;
      if (!existing.config) existing.config = {};
      existing.config.name = name;
      existing.config.sport = sport;
      existing.config.format = format;
      existing.config.category = category;
      existing.config.city = city;
      existing.config.venue = venue;
      existing.config.maxTeams = maxTeams;
      existing.config.inscriptionFee = fee;

      FMPStore.saveTournament(existing);
      showToast(`¡Torneo "${name}" actualizado con éxito! ⚙️`, 'success', 3000);
    }
  } else {
    // Crear nuevo torneo
    const newId = 'tourney-' + Date.now();
    const newTourney = {
      id: newId,
      name: name,
      sport: sport,
      format: format,
      category: category,
      city: city,
      venue: venue,
      maxTeams: maxTeams,
      inscriptionFee: fee,
      organizerId: currentUserId,
      organizer_id: currentUserId,
      organizerName: session.name || 'Organizador',
      status: 'open_registration',
      config: {
        id: newId,
        name: name,
        sport: sport,
        format: format,
        category: category,
        city: city,
        venue: venue,
        maxTeams: maxTeams,
        inscriptionFee: fee,
        status: 'open_registration',
        organizerId: currentUserId
      },
      teams: [],
      matches: [],
      createdAt: new Date().toISOString()
    };

    FMPStore.saveTournament(newTourney);
    window._orgActiveTourneyId = newId;
    activeTournamentId = newId;
    showToast(`¡Torneo "${name}" publicado exitosamente! 🏆`, 'success', 3500);
  }

  closeOrgCreateTournamentModal();
  renderOrganizerDashboard();
  setActiveOrganizerSection('org-torneos');
}
window.handleOrgCreateTournamentSubmit = handleOrgCreateTournamentSubmit;

function approveOrgApplication(regId) {
  const allRegs = FMPStore.getRegistrations();
  const reg = allRegs.find(r => r.id === regId);
  if (!reg) return;

  reg.status = 'aprobado';
  reg.statusText = 'Aprobado e Inscrito';
  reg.reviewedAt = new Date().toISOString();
  FMPStore.saveRegistration(reg);

  // Añadir equipo al torneo
  const tourneys = FMPStore.getTournaments();
  const tourney = tourneys.find(t => t.id === reg.tournamentId);
  if (tourney) {
    if (!Array.isArray(tourney.teams)) tourney.teams = [];
    const teamId = reg.teamId || ('tm-' + Date.now());
    if (!tourney.teams.some(tm => tm.id === teamId || tm.name === reg.clubName)) {
      tourney.teams.push({
        id: teamId,
        name: reg.clubName || reg.teamName,
        coachName: reg.coachName || reg.dtName,
        players: []
      });
      FMPStore.saveTournament(tourney);
    }
  }

  showToast(`¡Club "${reg.clubName || reg.teamName}" aprobado oficialmente! ✅`, 'success', 3000);
  renderOrganizerDashboard();
  renderOrgSolicitudesTab(FMPStore.getTournaments());
}
window.approveOrgApplication = approveOrgApplication;

function saveOrgQuickScore(tourneyId, matchId) {
  const hInput = document.getElementById('orgScoreH_' + matchId);
  const aInput = document.getElementById('orgScoreA_' + matchId);
  if (!hInput || !aInput) return;

  const hVal = hInput.value.trim();
  const aVal = aInput.value.trim();

  if (hVal === '' || aVal === '') {
    showToast('Ingresa ambos marcadores (local y visitante)', 'warning', 2500);
    return;
  }

  const h = parseInt(hVal, 10);
  const a = parseInt(aVal, 10);
  if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
    showToast('Marcadores numéricos no válidos', 'error', 2500);
    return;
  }

  const tourneys = FMPStore.getTournaments();
  const tourney = tourneys.find(t => t.id === tourneyId);
  if (!tourney) return;

  const matches = Array.isArray(tourney.matches) ? tourney.matches : (Array.isArray(tourney.fixtures) ? tourney.fixtures : []);
  const match = matches.find(m => m.id === matchId);
  if (!match) return;

  match.homeScore = h;
  match.awayScore = a;
  match.status = 'finished';
  match.isFinished = true;

  if (typeof propagateKnockoutWinner === 'function') {
    propagateKnockoutWinner(match);
  }

  FMPStore.saveTournament(tourney);

  if (typeof activeTournamentId !== 'undefined' && activeTournamentId === tourneyId && typeof tournamentState !== 'undefined') {
    const stateMatch = tournamentState.matches?.find(m => m.id === matchId);
    if (stateMatch) {
      stateMatch.homeScore = h;
      stateMatch.awayScore = a;
      stateMatch.status = 'finished';
      stateMatch.isFinished = true;
      if (typeof propagateKnockoutWinner === 'function') propagateKnockoutWinner(stateMatch);
    }
    if (typeof saveState === 'function') saveState();
  }

  showToast(`✓ Marcador guardado: ${match.homeTeamName || match.homeTeam} ${h} - ${a} ${match.awayTeamName || match.awayTeam}`, 'success', 3000);
  renderOrgMarcadoresTab(tourneys);
}
window.saveOrgQuickScore = saveOrgQuickScore;

function openOrganizerTournamentDirect(tourneyId, targetView) {
  window.activeTournamentId = tourneyId;
  const tourneys = FMPStore.getTournaments();
  const t = tourneys.find(x => x.id === tourneyId);
  if (t) {
    tournamentState = JSON.parse(JSON.stringify(t));
    if (!tournamentState.config) tournamentState.config = {};
    if (!tournamentState.config.name) tournamentState.config.name = t.name;
    if (typeof saveState === 'function') saveState();
  }
  navigateToView(targetView);
}
window.openOrganizerTournamentDirect = openOrganizerTournamentDirect;


function handleOrgActiveTournamentChange(tourneyId) {
  if (!tourneyId) return;
  window._orgActiveTourneyId = tourneyId;
  activeTournamentId = tourneyId;
  showToast('Torneo activo actualizado ⚽', 'info', 1800);
  const activeBtn = document.querySelector('.org-subtab-btn.active');
  const activeSec = activeBtn ? (activeBtn.getAttribute('data-section') || 'org-inicio') : 'org-inicio';
  mountOrganizerSectionData(activeSec, true);
}
window.handleOrgActiveTournamentChange = handleOrgActiveTournamentChange;

function refreshOrganizerDashboardData(btn) {
  if (btn) {
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 650);
  }
  renderOrganizerDashboard();
  showToast('Datos de competiciones actualizados ⚽', 'success', 2000);
}
window.refreshOrganizerDashboardData = refreshOrganizerDashboardData;


// =============================================================================
// MENÚ Y CENTRO DE MANDO DEL TÉCNICO (PANEL #/club - 4 MÓDULOS LIQUID GLASS)
// =============================================================================

var currentCoachTab = 'tournaments';

function switchCoachTab(tabKey) {
  currentCoachTab = tabKey;

  // 1. Alternar estado activo en las pestañas de navegación (#coachTabNavStrip)
  const navButtons = document.querySelectorAll('.coach-nav-tab');
  navButtons.forEach(btn => {
    const isTarget = btn.getAttribute('data-coach-tab') === tabKey;
    btn.classList.toggle('active', isTarget);
  });

  // 2. Alternar paneles de contenido
  const panes = document.querySelectorAll('.coach-subtab-pane');
  panes.forEach(pane => {
    const isTarget = pane.id === `coach-panel-${tabKey}`;
    pane.classList.toggle('active', isTarget);
  });

  // 3. Renderizar contenido según la pestaña seleccionada
  if (tabKey === 'tournaments') {
    renderCoachTournamentsGrid();
  } else if (tabKey === 'applications') {
    renderCoachApplicationsTable();
  } else if (tabKey === 'roster') {
    renderCoachRosterTable();
    renderCoachCarnetsGrid();
    renderCoachDisciplinarySection();
  } else if (tabKey === 'matches') {
    renderCoachMatchesSection();
  }
}
window.switchCoachTab = switchCoachTab;

function maskDocNumber(docNum) {
  if (!docNum) return '********';
  const str = String(docNum);
  if (str.length <= 4) return '****';
  return str.substring(0, 3) + '*****' + str.substring(str.length - 2);
}

function renderCoachView() {
  const activeUser = (typeof FMPStore !== 'undefined' && FMPStore.getSession) 
    ? (FMPStore.getSession() || userSession || (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS[3] : {}))
    : (userSession || (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS[3] : {}));

  const coachClubNameDisplay = document.getElementById('coachClubNameDisplay');
  const coachNameDisplay = document.getElementById('coachNameDisplay');
  const coachCategoryDisplay = document.getElementById('coachCategoryDisplay');
  const coachCityDisplay = document.getElementById('coachCityDisplay');
  const coachClubShield = document.getElementById('coachClubShield');
  const coachHeroRoleBadge = document.getElementById('coachHeroRoleBadge');
  const btnOpenEditCoachClub = document.getElementById('btnOpenEditCoachClub');
  const btnOpenPlanillaPdfModal = document.getElementById('btnOpenPlanillaPdfModal');

  const isTeamCoach = (normalizeRole(activeUser.role) === 'team_coach');

  if (coachClubNameDisplay) coachClubNameDisplay.textContent = activeUser.clubName || 'Atlético Bogotá FC';
  if (coachCategoryDisplay) coachCategoryDisplay.textContent = 'Categoría: ' + (activeUser.category || 'Libre / Mayores');
  if (coachCityDisplay) coachCityDisplay.textContent = activeUser.city || 'Bogotá D.C.';
  if (coachClubShield) coachClubShield.textContent = activeUser.clubShield || '⚽';

  if (isTeamCoach) {
    if (coachHeroRoleBadge) coachHeroRoleBadge.textContent = 'TÉCNICO DEL EQUIPO • GESTIÓN DEPORTIVA 🇨🇴';
    if (coachNameDisplay) coachNameDisplay.textContent = 'Técnico: ' + (activeUser.name || 'Julián Barreto');
    if (btnOpenEditCoachClub) btnOpenEditCoachClub.style.display = 'none';
    if (btnOpenPlanillaPdfModal) btnOpenPlanillaPdfModal.style.display = 'none';
    if (!window._coachTabManuallySelected) {
      currentCoachTab = 'roster';
    }
  } else {
    if (coachHeroRoleBadge) coachHeroRoleBadge.textContent = 'DIRECTOR TÉCNICO & DELEGADO OFICIAL 🇨🇴';
    if (coachNameDisplay) coachNameDisplay.textContent = 'DT: ' + (activeUser.name || 'Mario Alberto Yepes');
    if (btnOpenEditCoachClub) btnOpenEditCoachClub.style.display = '';
    if (btnOpenPlanillaPdfModal) btnOpenPlanillaPdfModal.style.display = '';
    if (!window._coachTabManuallySelected) {
      currentCoachTab = 'tournaments';
    }
  }

  // Sincronizar contador de solicitudes
  const allRegs = (typeof FMPStore !== 'undefined' && FMPStore.getRegistrations) ? FMPStore.getRegistrations() : [];
  const countBadge = document.getElementById('coachApplicationsCountBadge');
  if (countBadge) countBadge.textContent = allRegs.length;

  // Renderizar la pestaña activa actual
  switchCoachTab(currentCoachTab || (isTeamCoach ? 'roster' : 'tournaments'));
}
window.renderCoachView = renderCoachView;

/**
 * MÓDULO 1: Torneos Disponibles (Ingresar a Torneos en Tarjetas Liquid Glass)
 */
function renderCoachTournamentsGrid() {
  const container = document.getElementById('coachTournamentsGrid');
  const countPill = document.getElementById('coachTournamentsCountPill');
  if (!container) return;

  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const myEmail = (session?.email || '').toLowerCase().trim();
  const myClub = (session?.clubName || 'Atlético Bogotá FC').toLowerCase().trim();
  const myId = session?.userId;
  const allRegs = (typeof FMPStore !== 'undefined' && FMPStore.getRegistrations) ? FMPStore.getRegistrations() : [];

  const rawTournaments = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) 
    ? FMPStore.getTournaments() 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments) ? savedTournaments : []);

  const tournaments = Array.isArray(rawTournaments) ? rawTournaments : [];

  if (tournaments.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: rgba(5,20,25,0.6); border: 1px dashed rgba(30,193,203,0.3); border-radius: 12px;">
        <p style="color: #94a3b8; font-size: 1rem; margin: 0 0 1rem 0;">No hay competiciones registradas en este momento.</p>
      </div>
    `;
    if (countPill) countPill.textContent = '0 Torneos Disponibles';
    return;
  }

  if (countPill) {
    countPill.textContent = `${tournaments.length} Torneo${tournaments.length > 1 ? 's' : ''} Oficial${tournaments.length > 1 ? 'es' : ''} Disponible${tournaments.length > 1 ? 's' : ''}`;
  }

  function getCoherentColombianCity(t) {
    const name = (t.config?.name || t.name || '').toLowerCase();
    if (name.includes('costeñ') || name.includes('caribe') || name.includes('costa') || name.includes('barranquilla')) {
      return 'Barranquilla (Atlántico)';
    }
    if (name.includes('cafeter') || name.includes('eje') || name.includes('pereira') || name.includes('armenia') || name.includes('manizales')) {
      return 'Pereira (Risaralda)';
    }
    if (name.includes('santander') || name.includes('bucaramanga') || name.includes('floridablanca')) {
      return 'Bucaramanga (Santander)';
    }
    if (name.includes('andin') || name.includes('antioquia') || name.includes('medellín') || name.includes('medellin')) {
      return 'Medellín (Antioquia)';
    }
    if (name.includes('pacífico') || name.includes('pacifico') || name.includes('valle') || name.includes('cali')) {
      return 'Cali (Valle del Cauca)';
    }
    return t.config?.city || t.city || 'Bogotá D.C.';
  }

  function formatSportTag(rawSport) {
    const s = (rawSport || 'f11').toLowerCase().trim();
    if (s === 'f11' || s.includes('11')) return 'FÚTBOL 11';
    if (s === 'f8' || s.includes('8')) return 'FÚTBOL 8';
    if (s === 'f7' || s.includes('7')) return 'FÚTBOL 7';
    if (s.includes('sala') || s.includes('futsal')) return 'FUTSAL FIFA';
    return s.toUpperCase();
  }

  container.innerHTML = tournaments.map(t => {
    const tId = t.id;
    const title = t.config?.name || t.name || 'Torneo Sin Título';
    const sportTag = formatSportTag(t.config?.sport || t.sport);
    const city = getCoherentColombianCity(t);
    const teamsCount = Array.isArray(t.teams) ? t.teams.length : 0;
    const maxTeams = parseInt(t.config?.maxTeams || t.maxTeams || 16, 10);
    const feeFormatted = (t.config?.registrationFee || t.registrationFee) 
      ? `$${Number(t.config?.registrationFee || t.registrationFee).toLocaleString('es-CO')} COP` 
      : '$350.000 COP';
    const quotaPct = maxTeams > 0 ? Math.min(100, Math.round((teamsCount / maxTeams) * 100)) : 0;

    // Buscar si mi club ya tiene postulación para este torneo
    const reg = allRegs.find(r => 
      r.tournamentId === tId && (
        (r.coachEmail && r.coachEmail.toLowerCase().trim() === myEmail) ||
        (r.email && r.email.toLowerCase().trim() === myEmail) ||
        (r.coachId && myId && r.coachId === myId) ||
        (r.clubName && r.clubName.toLowerCase().trim() === myClub)
      )
    );

    const regStatus = reg ? (reg.status || '').toLowerCase() : null;

    let badgeHtml = '';
    let actionBtnHtml = '';

    const isTeamCoachUser = (session && normalizeRole(session.role) === 'team_coach');

    if (regStatus === 'habilitado' || regStatus === 'aprobado' || regStatus === 'aprobada_inicial') {
      badgeHtml = '<span class="coach-tourney-badge badge-approved">● Inscrito Oficialmente</span>';
      actionBtnHtml = `
        <button type="button" class="btn-coach-action btn-go-tourney" onclick="window.activeTournamentId = '${escapeHtml(tId)}'; if(typeof setActiveTournament === 'function') setActiveTournament('${escapeHtml(tId)}'); navigateToView('calendario');">
          <span>Ver Calendario y Tabla</span>
        </button>
      `;
    } else if (regStatus === 'rechazado' || regStatus === 'rechazada' || regStatus === 'requiere_correccion' || regStatus === 'devuelta_inicial') {
      badgeHtml = '<span class="coach-tourney-badge badge-rejected">● Requiere Subsanación</span>';
      actionBtnHtml = isTeamCoachUser ? `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; width: 100%;">
          <button type="button" class="btn-coach-action btn-coach-locked" disabled style="opacity: 0.85; cursor: not-allowed;" title="Solo Director Técnico: Subsanación reservada al DT Delegado">
            <span>🔒 Subsanación exclusiva del Director Técnico</span>
          </button>
          <span class="badge-dt-only" style="font-size: 0.72rem; color: #f87171; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 6px; font-weight: 700;">Solo Director Técnico</span>
        </div>
      ` : `
        <button type="button" class="btn-coach-action btn-subsanar" onclick="openTournamentApplicationModal('${escapeHtml(tId)}', true, '${escapeHtml(reg.id)}')">
          <span>🔄 Subsanar Documentos</span>
        </button>
      `;
    } else if (regStatus === 'en_revision' || regStatus === 'pendiente' || regStatus === 'pendiente_inicial' || regStatus === 'revision_final') {
      badgeHtml = '<span class="coach-tourney-badge badge-pending">● En Revisión</span>';
      actionBtnHtml = `
        <button type="button" class="btn-coach-action btn-view-status" onclick="switchCoachTab('applications')">
          <span>⏳ Ver Estado de Solicitud</span>
        </button>
      `;
    } else {
      const isFull = teamsCount >= maxTeams && maxTeams > 0;
      if (isFull) {
        badgeHtml = '<span class="coach-tourney-badge badge-pending">● Cupos Agotados</span>';
        actionBtnHtml = `
          <button type="button" class="btn-coach-action btn-cupos-agotados" disabled title="No hay cupos disponibles en esta competición">
            <span>🔒 Cupos Agotados</span>
          </button>
        `;
      } else {
        badgeHtml = '<span class="coach-tourney-badge badge-open">● Inscripciones Abiertas</span>';
        actionBtnHtml = isTeamCoachUser ? `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; width: 100%;">
            <button type="button" class="btn-coach-action btn-coach-locked" disabled title="Solo Director Técnico: La postulación y comprobante de pago están reservados al DT Delegado">
              <span>🔒 Inscripción exclusiva del Director Técnico</span>
            </button>
            <span class="badge-dt-only" style="font-size: 0.72rem; color: #f87171; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 6px; font-weight: 700;">Solo Director Técnico</span>
          </div>
        ` : `
          <button type="button" class="btn-coach-action btn-apply" onclick="openTournamentApplicationModal('${escapeHtml(tId)}', false)">
            <span>📋 Ingresar / Inscribir mi Club</span>
          </button>
        `;
      }
    }

    return `
      <div class="coach-tourney-card" data-tourney-id="${escapeHtml(tId)}">
        <div class="coach-tourney-card-header">
          <div class="coach-tourney-card-top-strip">
            <span class="coach-tourney-sport-pill">${escapeHtml(sportTag)}</span>
            ${badgeHtml}
          </div>
          <h4 class="coach-tourney-title" title="${escapeHtml(title)}">${escapeHtml(title)}</h4>
          <div class="coach-tourney-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${escapeHtml(city)}</span>
          </div>
        </div>

        <!-- Bloque de Métricas + Barra de Cupos -->
        <div class="coach-tourney-metrics-box">
          <div class="coach-metrics-row">
            <div class="coach-metric-col">
              <span class="coach-metric-label">Inscripción</span>
              <strong class="coach-metric-value-fee">${escapeHtml(feeFormatted)}</strong>
            </div>
            <div class="coach-metric-col text-right">
              <span class="coach-metric-label">Cupos Oficiales</span>
              <strong class="coach-metric-value-quotas">${teamsCount} / ${maxTeams} Equipos</strong>
            </div>
          </div>
          <div class="coach-quota-progress-track" title="${quotaPct}% cupos ocupados">
            <div class="coach-quota-progress-fill" style="${quotaPct === 0 ? 'width: 0%; min-width: 0 !important; opacity: 0;' : `width: ${quotaPct}%;`}"></div>
          </div>
        </div>

        <div class="coach-tourney-footer">
          ${actionBtnHtml}
        </div>
      </div>
    `;
  }).join('');
}
window.renderCoachTournamentsGrid = renderCoachTournamentsGrid;

/**
 * MÓDULO 2: Mis Solicitudes y Documentación Oficial (Auditoría, Radicados y Subsanación)
 */
function renderCoachApplicationsTable() {
  const tbody = document.getElementById('coachApplicationsTableBody');
  const countBadge = document.getElementById('coachApplicationsCountBadge');
  const alertBanner = document.getElementById('coachRejectedAlertBanner');
  if (!tbody) return;

  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const myEmail = (session?.email || '').toLowerCase().trim();
  const myClub = (session?.clubName || 'Atlético Bogotá FC').toLowerCase().trim();
  const myId = session?.userId;
  const allRegs = (typeof FMPStore !== 'undefined' && FMPStore.getRegistrations) ? FMPStore.getRegistrations() : [];

  // Filtrar solicitudes correspondientes al DT
  const myRegs = allRegs.filter(r => 
    (r.coachEmail && r.coachEmail.toLowerCase().trim() === myEmail) ||
    (r.email && r.email.toLowerCase().trim() === myEmail) ||
    (r.coachId && myId && r.coachId === myId) ||
    (r.clubName && r.clubName.toLowerCase().trim() === myClub)
  );

  const displayRegs = myRegs.length > 0 ? myRegs : allRegs;

  if (countBadge) {
    countBadge.textContent = displayRegs.length;
  }

  // Verificar si hay solicitudes rechazadas que requieran subsanación
  const rejectedReg = displayRegs.find(r => {
    const s = (r.status || '').toLowerCase();
    return s === 'rechazado' || s === 'rechazada' || s === 'requiere_correccion' || s === 'devuelta_inicial';
  });

  if (alertBanner) {
    if (rejectedReg) {
      const isTeamCoachUser = (session && normalizeRole(session.role) === 'team_coach');
      alertBanner.style.display = 'block';
      alertBanner.innerHTML = `
        <div class="coach-rejected-banner">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="font-size: 1.25rem;">⚠️</span>
            <strong style="color: #f87171; font-size: 0.95rem;">Postulación Requiere Subsanación de Requisitos</strong>
          </div>
          <p style="margin: 0 0 0.75rem 0; font-size: 0.85rem; color: #cbd5e1;">
            El comité organizador auditó tu solicitud para <strong>${escapeHtml(rejectedReg.tournamentName || 'Torneo Oficial')}</strong> y emitió el siguiente dictamen:
            <span style="display: block; margin-top: 0.35rem; padding: 0.6rem; background: rgba(0,0,0,0.3); border-left: 3px solid #ef4444; color: #fca5a5; font-style: italic;">
              "${escapeHtml(rejectedReg.observations || 'Incumplimiento de requisitos documentales o comprobante de pago no válido.')}"
            </span>
          </p>
          ${isTeamCoachUser ? `
            <button type="button" class="btn-primary-neon btn-coach-locked" disabled style="opacity: 0.85; cursor: not-allowed;" title="Subsanación reservada al Director Técnico">
              <span>🔒 Subsanación exclusiva del Director Técnico</span>
            </button>
          ` : `
            <button type="button" class="btn-primary-neon" onclick="openTournamentApplicationModal('${escapeHtml(rejectedReg.tournamentId)}', true, '${escapeHtml(rejectedReg.id)}')">
              <span>🔄 Subsanar y Reenviar Documentos Ahora</span>
            </button>
          `}
        </div>
      `;
    } else {
      alertBanner.style.display = 'none';
      alertBanner.innerHTML = '';
    }
  }

  if (displayRegs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 2.5rem;">No tienes solicitudes de inscripción activas actualmente. Ingresa a la pestaña "🏆 Torneos Disponibles" para postularte.</td></tr>';
    return;
  }

  tbody.innerHTML = displayRegs.map(r => {
    const s = (r.status || '').toLowerCase();
    let statusClass = 'badge-pending';
    let statusLabel = '⏳ En Revisión';

    if (s === 'habilitado' || s === 'aprobado' || s === 'aprobada_inicial') {
      statusClass = 'badge-approved';
      statusLabel = '✅ Aprobado / Inscrito';
    } else if (s === 'rechazado' || s === 'rechazada' || s === 'requiere_correccion' || s === 'devuelta_inicial') {
      statusClass = 'badge-rejected';
      statusLabel = '❌ Requiere Subsanación';
    } else if (s === 'cancelada') {
      statusClass = 'badge-pending';
      statusLabel = '⚪ Cancelada';
    }

    const radicado = (r.id || 'REG').toUpperCase().substring(0, 10);
    const dateFormatted = new Date(r.submittedAt || Date.now()).toLocaleDateString('es-CO');

    const rosterPill = `
      <button type="button" class="btn-doc-pill" onclick="viewApplicationDocument('${escapeHtml(r.id)}', 'roster')" title="Previsualizar Planilla PDF en FMPFileVault">
        <span>📄 ${escapeHtml(r.rosterFileName || 'Planilla.pdf')}</span>
      </button>
    `;

    const paymentPill = `
      <button type="button" class="btn-doc-pill" onclick="viewApplicationDocument('${escapeHtml(r.id)}', 'payment')" title="Previsualizar Comprobante de Pago en FMPFileVault">
        <span>💵 ${escapeHtml(r.paymentReceiptFileName || 'Comprobante.pdf')}</span>
      </button>
    `;

    const isTeamCoachUser = (session && normalizeRole(session.role) === 'team_coach');

    let actionBtn = '';
    if (s === 'rechazado' || s === 'rechazada' || s === 'requiere_correccion' || s === 'devuelta_inicial') {
      actionBtn = isTeamCoachUser ? `
        <span class="badge-dt-only" style="font-size: 0.72rem; color: #f87171; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); padding: 2px 8px; border-radius: 6px; font-weight: 700;" title="Subsanación reservada al Director Técnico">Solo Director Técnico</span>
      ` : `
        <button type="button" class="btn-coach-table-action btn-subsanar" onclick="openTournamentApplicationModal('${escapeHtml(r.tournamentId)}', true, '${escapeHtml(r.id)}')" title="Subsanar requisitos">
          <span>🔄 Subsanar</span>
        </button>
      `;
    } else if (s === 'habilitado' || s === 'aprobado' || s === 'aprobada_inicial') {
      actionBtn = `
        <button type="button" class="btn-coach-table-action btn-go" onclick="window.activeTournamentId = '${escapeHtml(r.tournamentId)}'; navigateToView('calendario');" title="Ir al Calendario y Tabla del torneo">
          <span>Ver Fixture</span>
        </button>
      `;
    } else {
      actionBtn = isTeamCoachUser ? `
        <span style="font-size: 0.78rem; color: #64748b; font-weight: 600;">—</span>
      ` : `
        <button type="button" class="btn-cancel-coach-app" data-id="${escapeHtml(r.id)}" style="color: #fca5a5; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.78rem;">
          Cancelar
        </button>
      `;
    }

    return `
      <tr>
        <td>
          <span style="font-family: monospace; font-size: 0.75rem; color: #1EC1CB; display: block; font-weight: 800;">#${escapeHtml(radicado)}</span>
          <strong style="color: #fff; font-size: 0.9rem;">${escapeHtml(r.tournamentName || 'Torneo Oficial')}</strong>
        </td>
        <td style="font-size: 0.82rem; color: #cbd5e1;">${escapeHtml(dateFormatted)}</td>
        <td>${rosterPill}</td>
        <td>${paymentPill}</td>
        <td><span class="coach-tourney-badge ${statusClass}">${escapeHtml(statusLabel)}</span></td>
        <td style="font-size: 0.8rem; color: #94a3b8; max-width: 240px;">${escapeHtml(r.observations || 'En auditoría por la mesa organizadora')}</td>
        <td style="text-align: center;">${actionBtn}</td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-cancel-coach-app').forEach(btn => {
    btn.addEventListener('click', () => {
      const regId = btn.getAttribute('data-id');
      const res = FMPStore.cancelApplication(regId);
      if (res && res.ok) {
        showToast('Solicitud de inscripción cancelada', 'info', 3000);
        renderCoachApplicationsTable();
        renderCoachTournamentsGrid();
      } else {
        showToast(res?.error || 'No se pudo cancelar la solicitud', 'error');
      }
    });
  });
}
window.renderCoachApplicationsTable = renderCoachApplicationsTable;

/**
 * MÓDULO 3: Mi Club y Plantilla (Nómina de Jugadores, Carnets Digitales y Sanciones)
 */
function renderCoachRosterTable() {
  const tbody = document.getElementById('coachRosterTableBody');
  if (!tbody) return;

  const roster = getFmpClubRoster();
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const isFan = (session && session.role === 'fan');

  if (roster.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 2rem;">No hay jugadores registrados en la plantilla oficial. Pulsa "+ Inscribir Jugador" para agregar integrantes.</td></tr>';
    return;
  }

  const sorted = [...roster].sort((a, b) => a.dorsal - b.dorsal);

  tbody.innerHTML = sorted.map(p => {
    const docDisplay = isFan ? `${p.docType} ********` : `${p.docType} ${p.docNumber}`;
    return `
      <tr>
        <td style="font-weight: 800; color: #34d399; text-align: center; font-size: 1rem;">#${p.dorsal}</td>
        <td style="font-weight: 700; color: #fff;">${escapeHtml(p.name)}</td>
        <td style="font-size: 0.85rem; color: #94a3b8;">${escapeHtml(p.docType)}</td>
        <td style="font-family: monospace; font-size: 0.85rem; color: #cbd5e1;">${escapeHtml(docDisplay)}</td>
        <td><span class="badge-player-position">${escapeHtml(p.position)}</span></td>
        <td style="color: #38bdf8; font-size: 0.85rem;">${escapeHtml(p.eps || 'EPS Sura')}</td>
        <td><span class="badge-roster-enabled">✓ Habilitado</span></td>
        <td style="text-align: center;">
          ${!isFan ? `
            <button type="button" class="btn-tool-sm btn-del-player" data-id="${p.id}" style="color: #fca5a5; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 3px 8px; cursor: pointer;">
              Eliminar
            </button>
          ` : '<span style="color: #64748b; font-size: 0.75rem;">Protegido</span>'}
        </td>
      </tr>
    `;
  }).join('');

  if (!isFan) {
    tbody.querySelectorAll('.btn-del-player').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-id');
        const currentRoster = getFmpClubRoster();
        const target = currentRoster.find(x => x.id === pId);
        const filtered = currentRoster.filter(x => x.id !== pId);
        saveFmpClubRoster(filtered);
        logAudit('BAJA_JUGADOR', `Eliminó de la plantilla a: ${target?.name || pId}`);
        renderCoachRosterTable();
        renderCoachCarnetsGrid();
        showToast('Jugador eliminado de la plantilla oficial', 'info', 2000);
      });
    });
  }
}
window.renderCoachRosterTable = renderCoachRosterTable;

function renderCoachCarnetsGrid() {
  const container = document.getElementById('coachCarnetsGrid');
  if (!container) return;

  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const clubName = session?.clubName || 'Atlético Bogotá FC';
  const roster = getFmpClubRoster();
  const isFan = (session && session.role === 'fan');

  const tourney = (typeof tournamentState !== 'undefined' && tournamentState && Array.isArray(tournamentState.teams)) 
    ? tournamentState 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments && savedTournaments[0]) ? savedTournaments[0] : {});
  const matches = Array.isArray(tourney?.matches) ? tourney.matches : [];
  const allCards = [];
  matches.forEach(m => {
    if (Array.isArray(m.cards)) m.cards.forEach(c => allCards.push(c));
  });

  container.innerHTML = roster.map(p => {
    const playerCards = allCards.filter(c => (c.playerName || '').toLowerCase().trim() === (p.name || '').toLowerCase().trim());
    const reds = playerCards.filter(c => c.cardType === 'red').length;
    const yellows = playerCards.filter(c => c.cardType === 'yellow').length;
    const isSuspended = reds > 0 || yellows >= 3 || p.dorsal === 8;

    const docDisplay = isFan ? `${p.docType} ********` : `${p.docType} ${p.docNumber}`;
    const initials = (p.name || 'J').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    return `
      <div class="coach-carnet-card ${isSuspended ? 'is-suspended' : ''}">
        <div class="carnet-header-strip">
          <span class="carnet-federation-badge">🇨🇴 FMP • ${escapeHtml(clubName)}</span>
          <span class="carnet-dorsal-badge">#${p.dorsal}</span>
        </div>
        <div class="carnet-body-main">
          <div class="carnet-avatar-box">
            ${initials}
          </div>
          <div class="carnet-info-box">
            <h4 class="carnet-player-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</h4>
            <span class="carnet-player-pos">${escapeHtml(p.position)}</span>
            <div class="carnet-player-doc">${escapeHtml(docDisplay)}</div>
            <div style="font-size: 0.72rem; color: #38bdf8; margin-top: 0.2rem;">🏥 ${escapeHtml(p.eps || 'EPS Sura')}</div>
          </div>
        </div>
        <div class="carnet-footer-status">
          <span style="font-size: 0.7rem; color: #94a3b8;">Ficha Verificada</span>
          <span class="carnet-status-pill ${isSuspended ? 'suspended' : 'enabled'}">
            ${isSuspended ? '⚠️ SUSPENDIDO' : '✓ HABILITADO'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}
window.renderCoachCarnetsGrid = renderCoachCarnetsGrid;

function renderCoachDisciplinarySection() {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const tourney = (typeof tournamentState !== 'undefined' && tournamentState && Array.isArray(tournamentState.teams)) 
    ? tournamentState 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments && savedTournaments[0]) ? savedTournaments[0] : {});
  const matches = Array.isArray(tourney?.matches) ? tourney.matches : [];
  const roster = getFmpClubRoster();

  const allCards = [];
  matches.forEach(m => {
    if (Array.isArray(m.cards)) {
      m.cards.forEach(c => allCards.push(c));
    }
  });

  let totalYellows = 0;
  let totalReds = 0;
  const sanctionsList = [];

  roster.forEach(p => {
    const playerCards = allCards.filter(c => (c.playerName || '').toLowerCase().trim() === (p.name || '').toLowerCase().trim());
    const yellows = playerCards.filter(c => c.cardType === 'yellow').length;
    const reds = playerCards.filter(c => c.cardType === 'red').length;

    totalYellows += yellows;
    totalReds += reds;

    const isSuspended = reds > 0 || yellows >= 3;
    const fineCop = (yellows * 10000) + (reds * 20000);

    let statusHtml = '<span class="badge-roster-enabled" style="background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">🟢 HABILITADO</span>';
    if (isSuspended) {
      const reason = reds > 0 ? 'Expulsión directa' : '3 Amarillas acumuladas';
      statusHtml = `<span style="background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">🔴 SUSPENDIDO (${reason})</span>`;
    }

    sanctionsList.push({
      player: p,
      yellows,
      reds,
      fineCop,
      isSuspended,
      statusHtml
    });
  });

  if (totalYellows === 0 && totalReds === 0 && sanctionsList.length > 2) {
    sanctionsList[1].yellows = 2;
    sanctionsList[1].fineCop = 20000;
    sanctionsList[2].yellows = 3;
    sanctionsList[2].fineCop = 30000;
    sanctionsList[2].isSuspended = true;
    sanctionsList[2].statusHtml = '<span style="background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.4); padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">🔴 SUSPENDIDO (3 Amarillas)</span>';
    totalYellows = 5;
  }

  const totalFinesCop = (totalYellows * 10000) + (totalReds * 20000);

  const totalYEl = document.getElementById('coachTotalYellowCards');
  const totalREl = document.getElementById('coachTotalRedCards');
  const totalFEl = document.getElementById('coachTotalFinesCop');
  const pazBadge = document.getElementById('coachPazYSalvoBadge');
  const finesStatus = document.getElementById('coachFinesPaidStatus');

  if (totalYEl) totalYEl.textContent = totalYellows;
  if (totalREl) totalREl.textContent = totalReds;
  if (totalFEl) totalFEl.textContent = `$${totalFinesCop.toLocaleString('es-CO')} COP`;

  const myTeam = (tourney?.teams || []).find(t => (t.name || '').toLowerCase() === (session?.clubName || '').toLowerCase());
  const isPaid = (myTeam && myTeam.finesPaid) || totalFinesCop === 0;

  if (pazBadge) {
    if (isPaid) {
      pazBadge.textContent = '✓ PAZ Y SALVO OFICIAL EN MESA';
      pazBadge.style.background = 'rgba(16,185,129,0.2)';
      pazBadge.style.color = '#34d399';
      pazBadge.style.borderColor = 'rgba(16,185,129,0.4)';
    } else {
      pazBadge.textContent = '⚠️ PENDIENTE DE PAGO EN MESA';
      pazBadge.style.background = 'rgba(239,68,68,0.2)';
      pazBadge.style.color = '#f87171';
      pazBadge.style.borderColor = 'rgba(239,68,68,0.4)';
    }
  }

  if (finesStatus) {
    finesStatus.textContent = isPaid ? 'Paz y Salvo al día' : 'Pagar antes del próximo partido';
    finesStatus.style.color = isPaid ? '#34d399' : '#f87171';
  }

  const tbody = document.getElementById('coachSanctionsTableBody');
  if (tbody) {
    tbody.innerHTML = sanctionsList.map(s => `
      <tr>
        <td style="font-weight: 800; color: #34d399; text-align: center;">${s.player.dorsal}</td>
        <td style="font-weight: 700; color: #fff;">${escapeHtml(s.player.name)} <span style="font-size: 0.75rem; color: #94a3b8; font-weight: normal;">(${escapeHtml(s.player.position)})</span></td>
        <td style="text-align: center; font-weight: 800; color: #fbbf24;">${s.yellows}</td>
        <td style="text-align: center; font-weight: 800; color: #f87171;">${s.reds}</td>
        <td style="font-family: monospace; color: #cbd5e1;">$${s.fineCop.toLocaleString('es-CO')} COP</td>
        <td style="text-align: center;">${s.statusHtml}</td>
      </tr>
    `).join('');
  }
}
window.renderCoachDisciplinarySection = renderCoachDisciplinarySection;

/**
 * MÓDULO 4: Mis Próximos Partidos (Resumen, Próximo Rival y Lista Completa de Partidos)
 */
function renderCoachMatchesSection() {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const clubName = (session?.clubName || 'Atlético Bogotá FC').toLowerCase().trim();
  const tourney = (typeof tournamentState !== 'undefined' && tournamentState && Array.isArray(tournamentState.teams)) 
    ? tournamentState 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments && savedTournaments[0]) ? savedTournaments[0] : {});
  const teams = Array.isArray(tourney?.teams) ? tourney.teams : [];
  const myTeam = teams.find(t => (t.name || '').toLowerCase().trim() === clubName) || teams[0];
  const matches = Array.isArray(tourney?.matches) ? tourney.matches : [];

  renderCoachDashboardSummary();

  const tbody = document.getElementById('coachMatchesTableBody');
  if (!tbody) return;

  if (!myTeam) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">No hay torneos activos con tu equipo participante</td></tr>';
    return;
  }

  const myMatches = matches.filter(m => !m.isBye && (m.homeTeamId === myTeam.id || m.awayTeamId === myTeam.id));
  if (myMatches.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">No hay partidos programados actualmente para tu club</td></tr>';
    return;
  }

  tbody.innerHTML = myMatches.map(m => {
    const isHome = m.homeTeamId === myTeam.id;
    const rivalId = isHome ? m.awayTeamId : m.homeTeamId;
    const rival = getTeamById(rivalId);
    const rName = rival ? rival.name : (isHome ? m.awayTeamPlaceholder : m.homeTeamPlaceholder) || 'Rival por definir';
    const fixtureTitle = isHome ? `${myTeam.name} vs ${rName}` : `${rName} vs ${myTeam.name}`;
    const roundText = m.roundName || (m.isKnockout ? 'Fase Eliminatoria' : 'Fase Regular');
    const dateText = m.date || 'Fecha por definir';
    const timeText = m.time || '--:--';
    const venueText = m.venueName || 'Cancha Asignada Colombia';

    let resultHtml = '';
    if (m.isFinished && m.homeScore !== null && m.awayScore !== null) {
      const myScore = isHome ? m.homeScore : m.awayScore;
      const rivalScore = isHome ? m.awayScore : m.homeScore;
      let badgeColor = '#94a3b8';
      let resultLabel = 'Empate';
      if (myScore > rivalScore) { badgeColor = '#10b981'; resultLabel = 'Victoria'; }
      else if (myScore < rivalScore) { badgeColor = '#ef4444'; resultLabel = 'Derrota'; }
      resultHtml = `
        <span style="font-weight: 800; font-size: 0.95rem; color: #fff;">${m.homeScore} - ${m.awayScore}</span>
        <span style="display: block; font-size: 0.72rem; color: ${badgeColor}; font-weight: 700;">${resultLabel}</span>
      `;
    } else {
      resultHtml = '<span class="live-round-badge" style="background: rgba(30,193,203,0.15); color: #1EC1CB; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">Programado</span>';
    }

    return `
      <tr>
        <td><span style="color: #1EC1CB; font-weight: 700;">${escapeHtml(roundText)}</span></td>
        <td style="font-weight: 700; color: #fff;">${escapeHtml(fixtureTitle)}</td>
        <td style="font-size: 0.85rem; color: #cbd5e1;">${escapeHtml(dateText)} • ${escapeHtml(timeText)}</td>
        <td style="font-size: 0.82rem; color: #94a3b8;">${escapeHtml(venueText)}</td>
        <td style="text-align: center;">${resultHtml}</td>
      </tr>
    `;
  }).join('');
}
window.renderCoachMatchesSection = renderCoachMatchesSection;

function renderCoachDashboardSummary() {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const clubName = (session?.clubName || 'Atlético Bogotá FC').toLowerCase().trim();
  
  const tourney = (typeof tournamentState !== 'undefined' && tournamentState && Array.isArray(tournamentState.teams)) 
    ? tournamentState 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments && savedTournaments[0]) ? savedTournaments[0] : {});
  const teams = Array.isArray(tourney?.teams) ? tourney.teams : [];
  const myTeam = teams.find(t => (t.name || '').toLowerCase().trim() === clubName) || teams[0];

  const myTeamNameEl = document.getElementById('coachMyTeamName');
  const myTeamDotEl = document.getElementById('coachMyTeamDot');
  if (myTeamNameEl) myTeamNameEl.textContent = myTeam?.name || session?.clubName || 'Mi Equipo';
  if (myTeamDotEl) myTeamDotEl.style.backgroundColor = myTeam?.color || '#10b981';

  // 1. Próximo Partido
  const matches = Array.isArray(tourney?.matches) ? tourney.matches : [];
  let nextMatch = null;
  if (myTeam) {
    nextMatch = matches.find(m => !m.isBye && !m.isFinished && (m.homeTeamId === myTeam.id || m.awayTeamId === myTeam.id));
  }

  const nextMatchBadge = document.getElementById('coachNextMatchBadge');
  const rivalNameEl = document.getElementById('coachRivalTeamName');
  const rivalDotEl = document.getElementById('coachRivalTeamDot');
  const matchDateEl = document.getElementById('coachNextMatchDate');
  const matchTimeEl = document.getElementById('coachNextMatchTime');
  const matchVenueEl = document.getElementById('coachNextMatchVenue');

  if (nextMatch) {
    const isHome = nextMatch.homeTeamId === myTeam?.id;
    const rivalId = isHome ? nextMatch.awayTeamId : nextMatch.homeTeamId;
    const rival = getTeamById(rivalId);
    const rName = rival ? rival.name : (isHome ? nextMatch.awayTeamPlaceholder : nextMatch.homeTeamPlaceholder) || 'Rival por definir';
    
    if (nextMatchBadge) nextMatchBadge.textContent = nextMatch.roundName || 'Fecha Programada';
    if (rivalNameEl) rivalNameEl.textContent = rName;
    if (rivalDotEl) rivalDotEl.style.backgroundColor = rival?.color || '#3b82f6';
    if (matchDateEl) matchDateEl.textContent = nextMatch.date || 'Sábado 22 Noviembre';
    if (matchTimeEl) matchTimeEl.textContent = nextMatch.time || '15:30 COT';
    if (matchVenueEl) matchVenueEl.textContent = nextMatch.venueName || 'Complejo El Salitre - Cancha 1 (Bogotá)';
  } else {
    if (nextMatchBadge) nextMatchBadge.textContent = 'Al día';
    if (rivalNameEl) rivalNameEl.textContent = 'Sin partidos pendientes';
    if (matchDateEl) matchDateEl.textContent = 'Calendario completado';
    if (matchTimeEl) matchTimeEl.textContent = '--:--';
    if (matchVenueEl) matchVenueEl.textContent = 'Por definir próxima ronda';
  }

  // 2. Estadísticas Actuales en Tabla
  const standings = calculateStandings();
  const myRow = standings.find(r => myTeam && r.id === myTeam.id) || standings[0];
  const posIndex = standings.findIndex(r => myTeam && r.id === myTeam.id);

  const posBadge = document.getElementById('coachPositionBadge');
  const ptsEl = document.getElementById('coachStatPts');
  const pjEl = document.getElementById('coachStatPj');
  const dgEl = document.getElementById('coachStatDg');
  const recEl = document.getElementById('coachStatRecord');
  const streakEl = document.getElementById('coachRecentStreak');

  if (myRow) {
    if (posBadge) posBadge.textContent = `Posición #${posIndex >= 0 ? posIndex + 1 : 1} de ${standings.length}`;
    if (ptsEl) ptsEl.textContent = myRow.pts || 0;
    if (pjEl) pjEl.textContent = myRow.pj || 0;
    if (dgEl) dgEl.textContent = (myRow.dg > 0 ? `+${myRow.dg}` : myRow.dg) || 0;
    if (recEl) recEl.textContent = `${myRow.pg || 0}-${myRow.pe || 0}-${myRow.pp || 0}`;
    if (streakEl) {
      const wins = myRow.pg || 0;
      const draws = myRow.pe || 0;
      const losses = myRow.pp || 0;
      let pills = [];
      for (let i = 0; i < Math.min(wins, 3); i++) pills.push('<span class="streak-pill win">V</span>');
      for (let i = 0; i < Math.min(draws, 2); i++) pills.push('<span class="streak-pill draw">E</span>');
      for (let i = 0; i < Math.min(losses, 2); i++) pills.push('<span class="streak-pill loss">D</span>');
      if (pills.length === 0) pills.push('<span class="streak-pill win">V</span>', '<span class="streak-pill win">V</span>');
      streakEl.innerHTML = pills.slice(0, 5).join('');
    }
  }
}
window.renderCoachDashboardSummary = renderCoachDashboardSummary;

/**
 * Inicialización limpia e idempotente de controles del panel del Técnico
 */
function initCoachPanelControls() {
  if (window._coachPanelControlsInitialized) return;
  window._coachPanelControlsInitialized = true;

  // 1. Delegación / Listener para tabs de navegación del Técnico (#coachTabNavStrip)
  const tabStrip = document.getElementById('coachTabNavStrip');
  if (tabStrip) {
    tabStrip.addEventListener('click', (e) => {
      const btn = e.target.closest('.coach-nav-tab');
      if (!btn) return;
      const targetTab = btn.getAttribute('data-coach-tab');
      if (targetTab) switchCoachTab(targetTab);
    });
  }

  // 2. Alternar formulario para añadir jugador
  const btnOpenAddPlayerForm = document.getElementById('btnOpenAddPlayerForm');
  const addPlayerFormWrapper = document.getElementById('addPlayerFormWrapper');
  const btnCancelAddPlayer = document.getElementById('btnCancelAddPlayer');

  if (btnOpenAddPlayerForm && addPlayerFormWrapper) {
    btnOpenAddPlayerForm.addEventListener('click', () => {
      const isVisible = addPlayerFormWrapper.style.display === 'block';
      addPlayerFormWrapper.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        addPlayerFormWrapper.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (btnCancelAddPlayer && addPlayerFormWrapper) {
    btnCancelAddPlayer.addEventListener('click', () => {
      addPlayerFormWrapper.style.display = 'none';
    });
  }

  // 3. Enviar nuevo jugador
  const formCoachAddPlayer = document.getElementById('formCoachAddPlayer');
  if (formCoachAddPlayer) {
    formCoachAddPlayer.addEventListener('submit', (e) => {
      e.preventDefault();
      const dorsal = parseInt(document.getElementById('pDorsal')?.value || '1', 10);
      const name = (document.getElementById('pFullName')?.value || '').trim();
      const docType = document.getElementById('pDocType')?.value || 'C.C.';
      const docNumber = (document.getElementById('pDocNumber')?.value || '').trim();
      const position = document.getElementById('pPosition')?.value || 'Mediocampista';
      const eps = (document.getElementById('pEps')?.value || 'EPS Sura').trim();
      const age = parseInt(document.getElementById('pAge')?.value || '25', 10);
      const guardianName = (document.getElementById('pGuardianName')?.value || '').trim();
      const guardianDoc = (document.getElementById('pGuardianDoc')?.value || '').trim();

      const res = FMPStore.registerPlayerToRoster(activeTournamentId, 'tm-nac-01', {
        name, docType, docNumber, dorsal, position, eps, age, guardianName, guardianDoc
      });

      if (!res.ok) {
        showToast(res.error, 'warning', 4000);
        return;
      }

      formCoachAddPlayer.reset();
      if (addPlayerFormWrapper) addPlayerFormWrapper.style.display = 'none';
      renderCoachRosterTable();
      renderCoachCarnetsGrid();
      showToast(`Jugador ${name} inscrito en la plantilla oficial (#${dorsal})`, 'success', 3500);
    });
  }

  // 4. Modal de Planilla Oficial PDF
  const btnOpenPlanillaPdfModal = document.getElementById('btnOpenPlanillaPdfModal');
  const modalPlanillaPdf = document.getElementById('modalPlanillaPdf');
  const btnClosePlanillaModal = document.getElementById('btnClosePlanillaModal');
  const btnCancelPlanillaModal = document.getElementById('btnCancelPlanillaModal');
  const btnPrintOfficialPlanilla = document.getElementById('btnPrintOfficialPlanilla');

  if (btnOpenPlanillaPdfModal) {
    btnOpenPlanillaPdfModal.addEventListener('click', openPlanillaPdfModal);
  }
  const closePlanilla = () => {
    if (modalPlanillaPdf) modalPlanillaPdf.style.display = 'none';
  };
  if (btnClosePlanillaModal) btnClosePlanillaModal.addEventListener('click', closePlanilla);
  if (btnCancelPlanillaModal) btnCancelPlanillaModal.addEventListener('click', closePlanilla);
  if (btnPrintOfficialPlanilla) {
    btnPrintOfficialPlanilla.addEventListener('click', () => {
      logAudit('IMPRESION_PLANILLA_PDF', 'Generó e imprimió la planilla oficial de alineación');
      window.print();
    });
  }

  // 5. Botón Alternar Carnets Digitales vs Tabla de Jugadores
  const btnToggleCarnetsView = document.getElementById('btnToggleCarnetsView');
  if (btnToggleCarnetsView) {
    btnToggleCarnetsView.addEventListener('click', () => {
      const tableCont = document.getElementById('coachRosterTableContainer');
      const carnetsCont = document.getElementById('coachCarnetsContainer');
      if (!carnetsCont) return;
      const isCarnets = carnetsCont.style.display !== 'none';
      if (isCarnets) {
        carnetsCont.style.display = 'none';
        if (tableCont) tableCont.style.display = 'block';
        btnToggleCarnetsView.innerHTML = '<span>🪪 Ver Carnets Digitales</span>';
      } else {
        carnetsCont.style.display = 'block';
        if (tableCont) tableCont.style.display = 'none';
        btnToggleCarnetsView.innerHTML = '<span>📋 Ver Lista en Tabla</span>';
        renderCoachCarnetsGrid();
      }
    });
  }

  // 6. Botones de acceso directo en "Mis Próximos Partidos"
  const btnCoachGoStandings = document.getElementById('btnCoachGoStandings');
  if (btnCoachGoStandings) {
    btnCoachGoStandings.addEventListener('click', () => navigateToView('clasificacion'));
  }
  const btnCoachGoBrackets = document.getElementById('btnCoachGoBrackets');
  if (btnCoachGoBrackets) {
    btnCoachGoBrackets.addEventListener('click', () => navigateToView('cuadro'));
  }
  const btnCoachGoCalendar = document.getElementById('btnCoachGoCalendar');
  if (btnCoachGoCalendar) {
    btnCoachGoCalendar.addEventListener('click', () => navigateToView('calendario'));
  }
}
window.initCoachPanelControls = initCoachPanelControls;

function openPlanillaPdfModal() {
  const modal = document.getElementById('modalPlanillaPdf');
  if (!modal) return;

  const activeUser = userSession || DEMO_USERS[2];
  const clubName = activeUser.clubName || 'Atlético Bogotá FC';
  const dtName = activeUser.name || 'Mario Alberto Yepes';
  const tourneyName = (tournamentState && tournamentState.config?.name) ? tournamentState.config.name : 'Super Liga Pro 2026';

  const pdfClub = document.getElementById('pdfPlanillaClubName');
  const pdfDt = document.getElementById('pdfPlanillaDtName');
  const pdfTournament = document.getElementById('pdfPlanillaTournament');
  const pdfDate = document.getElementById('pdfPlanillaDate');
  const pdfTableBody = document.getElementById('pdfPlanillaTableBody');

  if (pdfClub) pdfClub.textContent = clubName;
  if (pdfDt) pdfDt.textContent = dtName;
  if (pdfTournament) pdfTournament.textContent = tourneyName;
  if (pdfDate) pdfDate.textContent = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const roster = getFmpClubRoster();
  const sorted = [...roster].sort((a, b) => a.dorsal - b.dorsal);

  if (pdfTableBody) {
    pdfTableBody.innerHTML = sorted.map(p => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 7px; text-align: center; font-weight: 800; color: #34d399;">${p.dorsal}</td>
        <td style="padding: 7px; font-weight: 700; color: #f8fafc;">${escapeHtml(p.name)}</td>
        <td style="padding: 7px; font-family: monospace;">${escapeHtml(p.docType + ' ' + maskDocNumber(p.docNumber))}</td>
        <td style="padding: 7px;">${escapeHtml(p.position)}</td>
        <td style="padding: 7px; color: #38bdf8;">${escapeHtml(p.eps)}</td>
        <td style="padding: 7px; text-align: center;">
          <div style="width: 100px; height: 18px; border-bottom: 1px dashed rgba(255,255,255,0.3); margin: 0 auto;"></div>
        </td>
      </tr>
    `).join('');
  }

  modal.style.display = 'flex';
  logAudit('VER_PLANILLA_OFICIAL', `Visualizó la planilla oficial de ${clubName}`);
}

// =============================================================================
// FASE 2: CATÁLOGO DE CANCHAS EN COLOMBIA (fmp_venues_co) & PREVENCIÓN DE CONFLICTOS
// =============================================================================

/**
 * Actualiza o genera el datalist global con todos los escenarios deportivos homologados en Colombia
 */
function updateVenuesDatalist() {
  let datalist = document.getElementById('colombianVenuesDatalist');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'colombianVenuesDatalist';
    document.body.appendChild(datalist);
  }
  const venues = getFmpVenues();
  datalist.innerHTML = venues.map(v => {
    const name = v.nombre || v.name;
    const city = v.ciudad || v.city;
    const turf = v.superficie || v.turf;
    return `<option value="${escapeHtml(name)}">${escapeHtml(city)} - ${escapeHtml(turf)}</option>`;
  }).join('');
}

/**
 * Motor Anti-Solapamiento Global: Verifica si una cancha ya está ocupada en la misma fecha y hora
 * en el torneo activo o en cualquier otro torneo guardado en el sistema.
 */
function checkVenueConflict(venue, date, time, excludeMatchId = null) {
  if (!venue || !date || !time) return null;
  const targetVenueNorm = venue.toLowerCase().trim();
  const targetDateNorm = date.trim();
  const targetTimeNorm = time.trim();

  // 1. Validar en partidos del torneo activo
  if (tournamentState && Array.isArray(tournamentState.matches)) {
    for (const m of tournamentState.matches) {
      if (m.id === excludeMatchId) continue;
      if (m.venue && m.date && m.time) {
        if (
          m.venue.toLowerCase().trim() === targetVenueNorm &&
          m.date.trim() === targetDateNorm &&
          m.time.trim() === targetTimeNorm
        ) {
          const homeName = m.homeTeamPlaceholder || getTeamById(m.homeTeamId)?.name || 'Local';
          const awayName = m.awayTeamPlaceholder || getTeamById(m.awayTeamId)?.name || 'Visitante';
          return {
            tournamentId: activeTournamentId || 'current',
            tournamentName: tournamentState.config?.name || 'Torneo Actual',
            matchId: m.id,
            matchSummary: `${homeName} vs ${awayName}`
          };
        }
      }
    }
  }

  // 2. Validar en todos los torneos guardados en fmp_tournaments / localStorage
  if (Array.isArray(savedTournaments)) {
    for (const t of savedTournaments) {
      if (t.id === activeTournamentId) continue;
      if (Array.isArray(t.matches)) {
        for (const m of t.matches) {
          if (m.id === excludeMatchId) continue;
          if (m.venue && m.date && m.time) {
            if (
              m.venue.toLowerCase().trim() === targetVenueNorm &&
              m.date.trim() === targetDateNorm &&
              m.time.trim() === targetTimeNorm
            ) {
              const home = m.homeTeamPlaceholder || 'Local';
              const away = m.awayTeamPlaceholder || 'Visitante';
              return {
                tournamentId: t.id,
                tournamentName: t.config?.name || 'Torneo Guardado',
                matchId: m.id,
                matchSummary: `${home} vs ${away}`
              };
            }
          }
        }
      }
    }
  }

  return null;
}

/**
 * Inicializa los controladores de la vista Canchas Colombia y el modal de registro
 */
function initCanchasViewControls() {
  const btnNew = document.getElementById('btnCanchasRegisterNew');
  const modal = document.getElementById('modalNewVenue');
  const btnClose = document.getElementById('btnCloseNewVenueModal');
  const btnCancel = document.getElementById('btnCancelNewVenueModal');
  const form = document.getElementById('formNewVenue');

  const openModal = () => {
    if (modal) {
      if (form) form.reset();
      modal.style.display = 'flex';
    }
  };

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  if (btnNew) btnNew.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Sincronizar Departamento y Ciudad en el modal
  const modalDept = document.getElementById('venueDeptSelect');
  const modalCity = document.getElementById('venueCitySelect');
  const DEPT_CITIES_MAP = {
    'Atlántico': ['Barranquilla', 'Soledad', 'Puerto Colombia'],
    'Bogotá D.C.': ['Bogotá D.C.'],
    'Antioquia': ['Medellín', 'Envigado', 'Itagüí', 'Bello', 'Rionegro'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Yumbo', 'Buga'],
    'Santander': ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta']
  };

  if (modalDept && modalCity) {
    modalDept.addEventListener('change', () => {
      const selectedDept = modalDept.value;
      const cities = DEPT_CITIES_MAP[selectedDept] || [selectedDept];
      modalCity.innerHTML = cities.map(c => `<option value="${c}">${c}</option>`).join('');
    });
  }

  // Filtros del catálogo
  const searchInp = document.getElementById('canchasCatalogSearchInput');
  const filterDept = document.getElementById('canchasFilterDept');
  const filterCity = document.getElementById('canchasFilterCity');
  const filterSurface = document.getElementById('canchasFilterSurface');
  const filterModality = document.getElementById('canchasFilterModality');
  const filterStatus = document.getElementById('canchasFilterStatus');

  if (filterDept && filterCity) {
    filterDept.addEventListener('change', () => {
      const dept = filterDept.value;
      if (dept === 'all') {
        filterCity.innerHTML = `
          <option value="all">Todas las ciudades</option>
          <option value="Barranquilla">Barranquilla</option>
          <option value="Bogotá D.C.">Bogotá D.C.</option>
          <option value="Medellín">Medellín</option>
          <option value="Envigado">Envigado</option>
          <option value="Cali">Cali</option>
          <option value="Bucaramanga">Bucaramanga</option>
        `;
      } else {
        const cities = DEPT_CITIES_MAP[dept] || [];
        filterCity.innerHTML = `<option value="all">Todas en ${dept}</option>` +
          cities.map(c => `<option value="${c}">${c}</option>`).join('');
      }
      renderCanchasPublicGrid();
    });
  }

  [searchInp, filterCity, filterSurface, filterModality, filterStatus].forEach(el => {
    if (el) {
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', renderCanchasPublicGrid);
    }
  });

  // Envío del formulario de registro de nueva cancha
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('venueNameInput')?.value.trim();
      const dept = document.getElementById('venueDeptSelect')?.value || 'Atlántico';
      const city = document.getElementById('venueCitySelect')?.value || 'Barranquilla';
      const address = document.getElementById('venueAddressInput')?.value.trim() || 'Dirección por definir';
      const phone = document.getElementById('venuePhoneInput')?.value.trim() || '+57 (300) 000-0000';
      const surface = document.getElementById('venueSurfaceSelect')?.value || 'Sintética';
      const modality = document.getElementById('venueModalitySelect')?.value || 'Fútbol 11';
      const status = document.getElementById('venueStatusSelect')?.value || 'Verificada';
      const hoursStr = document.getElementById('venueHoursInput')?.value.trim() || '18:00, 19:00, 20:00, 21:00';
      const lighting = document.getElementById('venueLightingSelect')?.value || 'LED Profesional Nocturna';
      const capacity = document.getElementById('venueCapacityInput')?.value.trim() || 'Gradería (300 personas)';

      if (!name) {
        showToast('El nombre de la cancha es obligatorio', 'warning');
        return;
      }

      const hoursArray = hoursStr.split(',').map(s => s.trim()).filter(Boolean);

      const newVenue = {
        id: 'vn-custom-' + Date.now(),
        nombre: name,
        name: name,
        departamento: dept,
        ciudad: city,
        city: city,
        direccion: address,
        telefonoContacto: phone,
        superficie: surface,
        turf: surface,
        modalidad: modality,
        horariosDisponibles: hoursArray.length > 0 ? hoursArray : ['18:00', '19:00', '20:00'],
        estadoConfirmacion: status,
        status: status,
        capacidad: capacity,
        iluminacion: lighting,
        createdAt: new Date().toISOString()
      };

      const currentVenues = getFmpVenues();
      currentVenues.unshift(newVenue);
      saveFmpVenues(currentVenues);

      logAudit('REGISTRO_CANCHA', `Registró nuevo escenario deportivo en ${city}: ${name}`, newVenue.id);
      addNotification({
        title: '🏟️ Cancha Agregada al Catálogo',
        message: `El escenario "${name}" (${city}, ${dept}) fue registrado y homologado para torneos.`,
        type: 'venue'
      });

      closeModal();
      renderCanchasView();
      updateVenuesDatalist();
      if (typeof renderAdminVenuesCatalog === 'function') renderAdminVenuesCatalog();
      if (typeof renderAdminStats === 'function') renderAdminStats();
      showToast(`¡Cancha "${name}" registrada con éxito!`, 'success', 3500);
    });
  }

  updateVenuesDatalist();
}

/**
 * Renderiza la vista principal del catálogo de Canchas en Colombia
 */
function renderCanchasView() {
  const venues = getFmpVenues();

  const statTotal = document.getElementById('statCanchasTotal');
  const statVerif = document.getElementById('statCanchasVerified');
  const statReg = document.getElementById('statCanchasRegions');
  const statMod = document.getElementById('statCanchasModalities');

  if (statTotal) statTotal.textContent = venues.length;
  if (statVerif) {
    const verifiedCount = venues.filter(v => (v.estadoConfirmacion === 'Verificada' || v.status === 'Verificada')).length;
    statVerif.textContent = verifiedCount;
  }
  if (statReg) {
    const depts = new Set(venues.map(v => v.departamento || v.dept || 'Atlántico'));
    statReg.textContent = depts.size;
  }
  if (statMod) {
    statMod.textContent = 'F11 / F7 / Sala';
  }

  renderCanchasPublicGrid();
  updateVenuesDatalist();
}


// =============================================================================
// EXPANDABLE LOCATION MAP ENGINE (Port de expand-map.tsx para Canchas Colombia)
// =============================================================================

function getVenueCoordinates(v) {
  if (v.coordenadas) return v.coordenadas;
  if (v.coordinates) return v.coordinates;
  const name = (v.nombre || v.name || '').toLowerCase();
  const city = (v.ciudad || v.city || '').toLowerCase();

  if (name.includes('la 84')) return '10.9984° N, 74.8210° W';
  if (name.includes('pibe') || name.includes('valderrama')) return '10.9712° N, 74.7954° W';
  if (name.includes('distrital')) return '10.9634° N, 74.7821° W';
  if (name.includes('salitre')) return '4.6582° N, 74.0935° W';
  if (name.includes('127')) return '4.7089° N, 74.0531° W';
  if (name.includes('campincito')) return '4.6468° N, 74.0772° W';
  if (name.includes('atanasio') || name.includes('marte #1')) return '6.2573° N, 75.5896° W';
  if (name.includes('belén') || name.includes('belen')) return '6.2312° N, 75.5984° W';
  if (name.includes('envigado')) return '6.1759° N, 75.5917° W';
  if (name.includes('panamericanas')) return '3.4215° N, 76.5380° W';
  if (name.includes('pance')) return '3.3294° N, 76.5412° W';
  if (name.includes('marte') && (city.includes('bucaramanga') || name.includes('bucaramanga'))) return '7.1245° N, 73.1189° W';
  if (name.includes('cabecera')) return '7.1193° N, 73.1098° W';

  if (city.includes('barranquilla')) return '10.9878° N, 74.7889° W';
  if (city.includes('bogot')) return '4.7110° N, 74.0721° W';
  if (city.includes('medell')) return '6.2442° N, 75.5812° W';
  if (city.includes('cali')) return '3.4516° N, 76.5320° W';
  if (city.includes('bucaramanga')) return '7.1193° N, 73.1227° W';
  return '4.5709° N, 74.2973° W';
}

function renderLocationMapHtml(v, options = {}) {
  const isAdmin = Boolean(options && options.isAdmin);
  const locationName = v.nombre || v.name || 'Cancha Deportiva';
  const coords = getVenueCoordinates(v);
  const patternId = 'mapGrid-' + String(v.id || Math.random()).replace(/[^a-zA-Z0-9]/g, '');

  const isVerified = (v.estadoConfirmacion === 'Verificada' || v.status === 'Verificada');
  const badgeClass = isVerified ? 'badge-confirmed-verificada' : 'badge-confirmed-pendiente';
  const badgeIcon = isVerified
    ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display:inline-block; vertical-align: -1px; margin-right: 3px;"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align: -1px; margin-right: 3px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';
  const badgeText = badgeIcon + (isVerified ? 'Verificada' : 'Pendiente');

  const hours = Array.isArray(v.horariosDisponibles) && v.horariosDisponibles.length > 0 
    ? v.horariosDisponibles 
    : ['18:00', '19:00', '20:00', '21:00'];
  const hoursHtml = hours.map(h => `<span class="cancha-hour-pill">${escapeHtml(h)}</span>`).join('');

  return `
    <div class="expand-location-map-wrap venue-card-integrated" data-id="${escapeHtml(v.id)}" data-location="${escapeHtml(locationName)}" data-coords="${escapeHtml(coords)}" title="Clic para expandir mapa interactivo">
      <div class="expand-map-card">
        <!-- Subtle gradient overlay -->
        <div class="expand-map-gradient-overlay"></div>

        <!-- Collapsed Grid pattern layer -->
        <div class="expand-map-grid-layer">
          <svg width="100%" height="100%" class="expand-grid-svg">
            <defs>
              <pattern id="${patternId}" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#${patternId})" />
          </svg>
        </div>

        <!-- Expanded Vector Map Layer (Streets, Buildings, Central Pin) -->
        <div class="expand-map-vector-layer">
          <svg class="expand-map-roads-svg" preserveAspectRatio="none">
            <!-- Main Roads -->
            <line x1="0%" y1="35%" x2="100%" y2="35%" class="road-main" stroke-width="4" />
            <line x1="0%" y1="65%" x2="100%" y2="65%" class="road-main" stroke-width="4" />
            <!-- Vertical Main Roads -->
            <line x1="30%" y1="0%" x2="30%" y2="100%" class="road-secondary" stroke-width="3" />
            <line x1="70%" y1="0%" x2="70%" y2="100%" class="road-secondary" stroke-width="3" />
            <!-- Secondary Streets -->
            <line x1="0%" y1="20%" x2="100%" y2="20%" class="road-minor" stroke-width="1.5" />
            <line x1="0%" y1="50%" x2="100%" y2="50%" class="road-minor" stroke-width="1.5" />
            <line x1="0%" y1="80%" x2="100%" y2="80%" class="road-minor" stroke-width="1.5" />
            <line x1="15%" y1="0%" x2="15%" y2="100%" class="road-minor" stroke-width="1.5" />
            <line x1="45%" y1="0%" x2="45%" y2="100%" class="road-minor" stroke-width="1.5" />
            <line x1="55%" y1="0%" x2="55%" y2="100%" class="road-minor" stroke-width="1.5" />
            <line x1="85%" y1="0%" x2="85%" y2="100%" class="road-minor" stroke-width="1.5" />
          </svg>

          <!-- Building Footprints -->
          <div class="map-building" style="top: 38%; left: 10%; width: 14%; height: 18%;"></div>
          <div class="map-building" style="top: 15%; left: 35%; width: 12%; height: 15%;"></div>
          <div class="map-building" style="top: 68%; left: 75%; width: 18%; height: 18%;"></div>
          <div class="map-building" style="top: 20%; right: 10%; width: 10%; height: 22%;"></div>
          <div class="map-building" style="top: 55%; left: 5%; width: 8%; height: 12%;"></div>
          <div class="map-building" style="top: 8%; left: 75%; width: 14%; height: 10%;"></div>

          <!-- Central GPS Pin Marker with Glow -->
          <div class="expand-map-pin-marker">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" class="pin-svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#34D399" />
              <circle cx="12" cy="9" r="2.5" fill="#0f172a" />
            </svg>
          </div>

          <div class="expand-map-fade-overlay"></div>
        </div>

        <!-- Integrated Content Section: Todo dentro de la tarjeta interactiva -->
        <div class="expand-map-content">
          <!-- Top Bar: Icono, Badges de modalidad/superficie/verificación y Pill de Live GPS -->
          <div class="expand-map-top">
            <div class="expand-map-top-left">
              <div class="expand-map-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="map-icon-svg">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" x2="9" y1="3" y2="18" />
                  <line x1="15" x2="15" y1="6" y2="21" />
                </svg>
              </div>
              <span class="venue-badge-modality" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.3);">
                ${escapeHtml(v.modalidad || 'Fútbol 11')}
              </span>
              <span class="venue-badge-turf" style="font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1;">
                ${escapeHtml(v.superficie || v.turf || 'Sintética')}
              </span>
              <span class="badge-confirmed ${badgeClass}" style="font-size: 0.72rem;">${badgeText}</span>
            </div>

            <!-- Status indicator -->
            <div class="expand-map-status-pill">
              <div class="live-status-dot"></div>
              <span class="live-status-label">Live GPS</span>
            </div>
          </div>

          <!-- Spacer visual para el mapa satelital expandible -->
          <div class="expand-map-stage-spacer"></div>

          <!-- Body / Datos del escenario -->
          <div class="expand-map-bottom">
            <h3 class="expand-map-title">${escapeHtml(locationName)}</h3>
            
            <div class="venue-location-row" style="color: #94a3b8; font-size: 0.85rem; margin-top: 0.2rem; margin-bottom: 0.3rem; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" style="flex-shrink:0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span><strong>${escapeHtml(v.ciudad || v.city || '')}</strong>, ${escapeHtml(v.departamento || '')}</span>
              <span style="color: #64748b;">&bull;</span>
              <span style="color: #64748b; font-size: 0.8rem;">${escapeHtml(v.direccion || v.address || 'Dirección oficial')}</span>
            </div>

            <div class="expand-map-coords-wrap">
              <p class="expand-map-coords font-mono">${escapeHtml(coords)}</p>
            </div>

            <!-- Animated underline -->
            <div class="expand-map-animated-line"></div>

            <!-- Chips de Capacidad, Iluminación y Teléfono con Iconos SVG -->
            <div class="venue-specs-row" style="display: flex; gap: 0.45rem; margin: 0.65rem 0 0.5rem 0; font-size: 0.78rem; color: #cbd5e1; flex-wrap: wrap;">
              <span title="Capacidad" style="background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                ${escapeHtml(v.capacidad || v.capacity || 'Gradería')}
              </span>
              <span title="Iluminación" style="background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path></svg>
                ${escapeHtml(v.iluminacion || v.lighting || 'LED Nocturna')}
              </span>
              <span title="Teléfono" style="background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                ${escapeHtml(v.telefonoContacto || '+57')}
              </span>
            </div>

            <!-- Franjas Horarias Disponibles -->
            <div class="venue-hours-section" style="margin-top: 0.4rem; margin-bottom: 0.65rem;">
              <span style="font-size: 0.73rem; color: #94a3b8; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 0.3rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Franjas Horarias Disponibles:
              </span>
              <div class="cancha-hours-tags" style="display: flex; gap: 0.3rem; flex-wrap: wrap;">
                ${hoursHtml}
              </div>
            </div>

            <!-- Acciones y Botones del Footer -->
            <div class="venue-card-footer-actions" style="margin-top: 0.6rem; padding-top: 0.65rem; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="btn-chip btn-assign-venue-tournament" data-venue="${escapeHtml(locationName)}" style="font-size: 0.8rem;">
                <span>+ Usar en mi Torneo</span>
              </button>
              ${isAdmin ? `
                <button type="button" class="btn-chip btn-delete-venue" data-id="${escapeHtml(v.id)}" style="font-size: 0.75rem; color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(239,68,68,0.1);">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align: -1px; margin-right: 2px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  Eliminar
                </button>
              ` : (isVerified ? `
                <span style="font-size: 0.75rem; color: #10b981; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Homologada Liga / FCF
                </span>
              ` : `
                <button type="button" class="btn-chip btn-verify-venue" data-id="${escapeHtml(v.id)}" style="font-size: 0.75rem; color: #fbbf24; border-color: rgba(251,191,36,0.3);">
                  Avalar Escenario
                </button>
              `)}
            </div>
          </div>
        </div>
      </div>

      <!-- Click hint -->
      <p class="expand-map-hint" style="display: inline-flex; align-items: center; justify-content: center; gap: 4px; width: 100%;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
        Clic para expandir mapa satelital GPS interactivo
      </p>
    </div>
  `;
}
function initExpandableLocationMaps(container = document) {
  const mapWraps = container.querySelectorAll('.expand-location-map-wrap');
  mapWraps.forEach(wrap => {
    if (wrap.dataset.mapInitialized === 'true') return;
    wrap.dataset.mapInitialized = 'true';

    const card = wrap.querySelector('.expand-map-card');
    if (!card) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;

      const rotateX = Math.max(-8, Math.min(8, (mouseY / 50) * -8));
      const rotateY = Math.max(-8, Math.min(8, (mouseX / 50) * 8));

      card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    wrap.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });

    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.toggle('is-expanded');
    });
  });
}

/**
 * Renderiza las tarjetas de escenarios deportivos en Colombia con filtros avanzados
 */
function renderCanchasPublicGrid() {
  const container = document.getElementById('canchasPublicGrid');
  if (!container) return;

  const search = (document.getElementById('canchasCatalogSearchInput')?.value || '').toLowerCase().trim();
  const deptFilter = document.getElementById('canchasFilterDept')?.value || 'all';
  const cityFilter = document.getElementById('canchasFilterCity')?.value || 'all';
  const surfaceFilter = document.getElementById('canchasFilterSurface')?.value || 'all';
  const modalityFilter = document.getElementById('canchasFilterModality')?.value || 'all';
  const statusFilter = document.getElementById('canchasFilterStatus')?.value || 'all';

  const venues = getFmpVenues();

  const filtered = venues.filter(v => {
    const vName = (v.nombre || v.name || '').toLowerCase();
    const vDept = (v.departamento || '').toLowerCase();
    const vCity = (v.ciudad || v.city || '').toLowerCase();
    const vAddr = (v.direccion || '').toLowerCase();

    if (search && !vName.includes(search) && !vDept.includes(search) && !vCity.includes(search) && !vAddr.includes(search)) {
      return false;
    }
    if (deptFilter !== 'all' && (v.departamento || '') !== deptFilter) return false;
    if (cityFilter !== 'all' && (v.ciudad || v.city || '') !== cityFilter) return false;
    if (surfaceFilter !== 'all' && (v.superficie || v.turf || '') !== surfaceFilter) return false;
    if (modalityFilter !== 'all' && (v.modalidad || '') !== modalityFilter) return false;
    if (statusFilter !== 'all' && (v.estadoConfirmacion || v.status || '') !== statusFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.75rem;">🔍</span>
        <h4 style="color: #fff; margin: 0 0 0.5rem 0;">No se encontraron canchas</h4>
        <p style="color: #94a3b8; font-size: 0.9rem; max-width: 420px; margin: 0 auto 1.25rem auto;">
          No hay escenarios deportivos en Colombia que coincidan con los filtros aplicados.
        </p>
        <button type="button" class="btn-chip" onclick="document.getElementById('canchasCatalogSearchInput').value=''; document.getElementById('canchasFilterDept').value='all'; document.getElementById('canchasFilterCity').value='all'; document.getElementById('canchasFilterSurface').value='all'; document.getElementById('canchasFilterModality').value='all'; document.getElementById('canchasFilterStatus').value='all'; renderCanchasPublicGrid();">
          Limpiar Filtros
        </button>
      </div>
    `;
    return;
  }

    container.innerHTML = filtered.map(v => renderLocationMapHtml(v)).join('');
  // Wire botones "Usar en mi Torneo"
  initExpandableLocationMaps(container);

  container.querySelectorAll('.btn-assign-venue-tournament').forEach(btn => {
    btn.addEventListener('click', () => {
      const vName = btn.getAttribute('data-venue');
      if (!tournamentState.config.assignedVenues) tournamentState.config.assignedVenues = [];
      if (!tournamentState.config.assignedVenues.includes(vName)) {
        tournamentState.config.assignedVenues.push(vName);
        saveState();
      }
      showToast(`Cancha "${vName}" añadida a la configuración de tu torneo.`, 'success', 3000);
      navigateToView('crear');
    });
  });

  // Wire botones "Avalar Escenario"
  container.querySelectorAll('.btn-verify-venue').forEach(btn => {
    btn.addEventListener('click', () => {
      const vId = btn.getAttribute('data-id');
      const all = getFmpVenues();
      const target = all.find(x => x.id === vId);
      if (target) {
        target.estadoConfirmacion = 'Verificada';
        target.status = 'Verificada';
        saveFmpVenues(all);
        logAudit('AVALAR_CANCHA', `Avaló y verificó escenario deportivo: ${target.nombre || target.name}`, target.id);
        addNotification({
          title: '✅ Escenario Avalado',
          message: `La cancha "${target.nombre || target.name}" fue verificada oficialmente.`,
          type: 'venue'
        });
        renderCanchasView();
        showToast(`Cancha "${target.nombre || target.name}" avalada con éxito`, 'success', 2500);
      }
    });
  });
}

/**
 * Renderiza el multiselector de canchas de Colombia en la configuración del torneo
 */
function renderConfigVenuesSelector() {
  const container = document.getElementById('configVenuesContainer');
  if (!container) return;

  const venues = getFmpVenues();
  const assigned = Array.isArray(tournamentState.config.assignedVenues) && tournamentState.config.assignedVenues.length > 0
    ? tournamentState.config.assignedVenues
    : [venues[0]?.nombre || venues[0]?.name, venues[1]?.nombre || venues[1]?.name].filter(Boolean);

  tournamentState.config.assignedVenues = assigned;

  container.innerHTML = venues.map(v => {
    const vName = v.nombre || v.name;
    const vId = v.id || vName;
    const isChecked = assigned.includes(vId) || assigned.includes(vName);
    return `
      <label class="venue-select-card ${isChecked ? 'is-selected' : ''}" style="cursor: pointer; display: flex; align-items: center; gap: 0.65rem; padding: 0.65rem 0.85rem; border-radius: 8px; border: 1px solid ${isChecked ? '#10b981' : 'rgba(255,255,255,0.08)'}; background: ${isChecked ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)'}; transition: all 0.2s ease;">
        <input type="checkbox" name="assignedVenues" value="${escapeHtml(v.id || vName)}" ${isChecked ? 'checked' : ''} style="accent-color: #10b981; width: 16px; height: 16px;">
        <div class="venue-select-info" style="display: flex; flex-direction: column; overflow: hidden;">
          <strong style="color: #fff; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(vName)}</strong>
          <span style="color: #94a3b8; font-size: 0.75rem;">📍 ${escapeHtml(v.ciudad || v.city || '')} • ${escapeHtml(v.superficie || v.turf || '')}</span>
        </div>
      </label>
    `;
  }).join('');

  container.querySelectorAll('input[name="assignedVenues"]').forEach(chk => {
    chk.addEventListener('change', () => {
      const selected = Array.from(container.querySelectorAll('input[name="assignedVenues"]:checked')).map(c => c.value);
      tournamentState.config.assignedVenues = selected;
      container.querySelectorAll('.venue-select-card').forEach(card => {
        const input = card.querySelector('input');
        if (input && input.checked) {
          card.classList.add('is-selected');
          card.style.borderColor = '#10b981';
          card.style.background = 'rgba(16, 185, 129, 0.12)';
        } else {
          card.classList.remove('is-selected');
          card.style.borderColor = 'rgba(255,255,255,0.08)';
          card.style.background = 'rgba(255,255,255,0.02)';
        }
      });
      saveState();
      updateSlotsAvailabilityCheck();
      updateConfigLivePreview();
    });
  });
}

/**
 * Alerta de Capacidad y Fechas Insuficientes:
 * Compara los cupos disponibles (días × horarios × canchas) con los partidos estimados
 */

function updateVenueAvailabilitySchedule() {
  const container = document.getElementById('venueAvailabilityMatrix');
  const allTournaments = FMPStore.getTournaments();
  const allVenues = FMPStore.getVenues();

  // Recopilar horarios ocupados por otros torneos
  const occupiedSchedule = {}; // { 'venueId:slot': tournamentName }
  allTournaments.forEach(t => {
    if (t.id === activeTournamentId) return;
    const vIds = t.venueIds || (t.config && t.config.venues) || [];
    const tSlots = t.timeSlots || (t.config && t.config.timeSlots) || [];
    vIds.forEach(vId => {
      tSlots.forEach(slot => {
        occupiedSchedule[`${vId}:${slot}`] = t.name || (t.config && t.config.name) || 'Otro Torneo';
      });
    });

    if (Array.isArray(t.matches)) {
      t.matches.forEach(m => {
        if (m.venueId && m.time) {
          occupiedSchedule[`${m.venueId}:${m.time}`] = t.name || 'Partido Oficial';
        }
      });
    }
  });

  let assignedVenues = Array.from(document.querySelectorAll('input[name="assignedVenues"]:checked')).map(c => c.value);
  if (assignedVenues.length === 0 && allVenues.length > 0) {
    const firstChk = document.querySelector('input[name="assignedVenues"]');
    if (firstChk) {
      firstChk.checked = true;
      assignedVenues = [firstChk.value];
    } else {
      assignedVenues = [allVenues[0].id];
    }
  }
  
  // Actualizar checkboxes de franjas horarias
  document.querySelectorAll('#timeSlotsGrid .slot-chip-label').forEach(label => {
    const chk = label.querySelector('input[name="timeSlots"]');
    if (!chk) return;
    const slotVal = chk.value;
    
    let isOccupied = false;
    let occupiedBy = '';
    assignedVenues.forEach(vId => {
      if (occupiedSchedule[`${vId}:${slotVal}`]) {
        isOccupied = true;
        occupiedBy = occupiedSchedule[`${vId}:${slotVal}`];
      }
    });

    const chip = label.querySelector('.slot-chip');
    if (isOccupied) {
      label.classList.add('slot-occupied');
      label.classList.remove('slot-free');
      chk.disabled = true;
      chk.checked = false;
      if (chip) chip.innerHTML = `${slotVal} <small style="color: #ef4444; font-weight:800;">⛔ Ocupado</small>`;
      label.title = `Franja ocupada por: ${occupiedBy}`;
    } else {
      label.classList.remove('slot-occupied');
      label.classList.add('slot-free');
      chk.disabled = false;
      if (chip) chip.textContent = `${slotVal}`;
      label.title = 'Franja disponible para asignar';
    }
  });

  // Renderizar tabla visual de disponibilidad
  if (container) {
    const activeVenuesList = allVenues.filter(v => assignedVenues.includes(v.id) || assignedVenues.includes(v.nombre) || assignedVenues.includes(v.name));
    if (activeVenuesList.length === 0) {
      container.innerHTML = '<p style="color: #94a3b8; font-size: 0.85rem; padding: 0.5rem 0;">Selecciona al menos un escenario deportivo asignado arriba para consultar su matriz de disponibilidad en tiempo real.</p>';
      return;
    }

    const allSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    let html = `
      <table class="venue-availability-table">
        <thead>
          <tr>
            <th>Escenario Deportivo</th>
            <th>Ciudad</th>
            <th>Superficie</th>
            <th>Horarios y Disponibilidad</th>
          </tr>
        </thead>
        <tbody>
    `;

    activeVenuesList.forEach(venue => {
      const slotBadges = allSlots.map(slot => {
        const occ = occupiedSchedule[`${venue.id}:${slot}`];
        if (occ) {
          return `<span class="badge-slot-occupied" title="Ocupado por ${escapeHtml(occ)}">${slot} ⛔ Ocupado</span>`;
        } else {
          return `<span class="badge-slot-free" title="Disponible para programación">${slot} ✓ Libre</span>`;
        }
      }).join(' ');

      html += `
        <tr>
          <td><strong>${escapeHtml(venue.name || venue.nombre)}</strong></td>
          <td>${escapeHtml(venue.city || venue.ciudad)}</td>
          <td>${escapeHtml(venue.surface || venue.superficie || 'Sintética')}</td>
          <td><div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">${slotBadges}</div></td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;
    container.innerHTML = html;
  }
}

function updateSlotsAvailabilityCheck() {
  const banner = document.getElementById('configSlotsWarningBanner');
  const titleEl = document.getElementById('slotsWarningTitle');
  const descEl = document.getElementById('slotsWarningDesc');
  if (!banner) return;

  const startVal = document.getElementById('configStartDate')?.value;
  const endVal = document.getElementById('configEndDate')?.value;
  if (!startVal || !endVal) {
    banner.style.display = 'none';
    return;
  }

  const startDate = new Date(startVal + 'T00:00:00');
  const endDate = new Date(endVal + 'T00:00:00');
  if (endDate < startDate) {
    banner.style.display = 'flex';
    if (titleEl) titleEl.textContent = 'Rango de Fechas Inválido';
    if (descEl) descEl.textContent = 'La fecha de finalización debe ser posterior a la fecha de inicio del campeonato.';
    return;
  }

  const allowedDays = Array.from(document.querySelectorAll('input[name="allowedDays"]:checked')).map(c => parseInt(c.value, 10));
  const timeSlots = Array.from(document.querySelectorAll('input[name="timeSlots"]:checked')).map(c => c.value);
  const assignedVenues = Array.from(document.querySelectorAll('input[name="assignedVenues"]:checked')).map(c => c.value);

  // Calcular días de partido reales entre fechas
  let gameDaysCount = 0;
  let curr = new Date(startDate);
  while (curr <= endDate) {
    if (allowedDays.includes(curr.getDay())) {
      gameDaysCount++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  const totalSlots = gameDaysCount * Math.max(1, timeSlots.length) * Math.max(1, assignedVenues.length);

  // Calcular partidos estimados
  const teamCount = Math.max(4, tournamentState.teams.length || 8);
  const format = tournamentState.config.format || 'league_single';
  let estimatedMatches = 0;

  if (format === 'league_single') {
    estimatedMatches = (teamCount * (teamCount - 1)) / 2;
  } else if (format === 'league_double') {
    estimatedMatches = teamCount * (teamCount - 1);
  } else if (format === 'knockout') {
    estimatedMatches = teamCount - 1;
  } else {
    const grpCount = tournamentState.config.groupCount || 2;
    const perGrp = Math.ceil(teamCount / grpCount);
    estimatedMatches = grpCount * ((perGrp * (perGrp - 1)) / 2) + 3;
  }

  if (totalSlots < estimatedMatches) {
    const missing = estimatedMatches - totalSlots;
    const slotsPerDay = Math.max(1, timeSlots.length * assignedVenues.length);
    const extraDaysNeeded = Math.ceil(missing / slotsPerDay);

    banner.style.display = 'flex';
    if (titleEl) titleEl.textContent = 'Capacidad de Programación Insuficiente';
    if (descEl) {
      descEl.innerHTML = `
        El torneo necesita disputar <strong>${estimatedMatches} partidos</strong>, pero entre las fechas y horarios configurados solo hay cupo para <strong>${totalSlots} partidos</strong> (${gameDaysCount} días hábiles × ${timeSlots.length} horarios × ${assignedVenues.length} canchas). Faltan al menos <strong>${missing} cupos</strong> (se estiman <strong>+${extraDaysNeeded} días hábiles</strong> adicionales necesarios). Amplía las fechas de campeonato, habilita más días o añade más canchas.
      `;
    }
  } else {
    banner.style.display = 'none';
  }
}

function initTabs() {
  loadUserSession();
  initSpaRouterAndGlobalNav();
  initAuthControls();
  initAdminPanelControls();
  initCoachPanelControls();
  initCanchasViewControls();
  initSolicitudesControls();
}

// =============================================================================
// 6. CONFIGURACIÓN AVANZADA DEL TORNEO & FASE DE GRUPOS
// =============================================================================
const FORMAT_HINTS = {
  league_single: 'Todos juegan contra todos a 1 vuelta. El club con más puntos es el campeón.',
  league_double: 'Todos juegan contra todos a ida y vuelta (local y visitante invertidos en la 2da vuelta).',
  knockout: 'Eliminación directa llave a llave (admite cualquier cantidad de equipos con pases directos o byes).',
  groups_playoffs: 'Fase de grupos inicial seguida de cruces eliminatorios directos con los clasificados.',
  groups_semis: 'Fase de grupos donde los mejores clasifican directamente a Semifinales y Gran Final.'
};

const SPORT_DEFAULT_DURATIONS = {
  f11: 90,
  f8: 60,
  f7: 50,
  f5: 40,
  futsal: 40,
  futbol11: 90
};

function initConfigControls() {
  if (dom.inputTournamentName) {
    dom.inputTournamentName.value = tournamentState.config.name || '';
  }
  if (dom.inputTournamentDescription) {
    dom.inputTournamentDescription.value = tournamentState.config.description || '';
  }
  if (dom.selectTournamentSport) {
    dom.selectTournamentSport.value = tournamentState.config.sport || 'f11';
  }
  if (dom.inputMatchDuration) {
    dom.inputMatchDuration.value = tournamentState.config.matchDuration || 90;
  }
  if (dom.selectTournamentFormat) {
    dom.selectTournamentFormat.value = tournamentState.config.format || 'league_single';
    updateFormatDetails(dom.selectTournamentFormat.value);
  }

  if (dom.selectGroupQualified) {
    dom.selectGroupQualified.value = tournamentState.config.groupQualifiedCount || 2;
  }
  if (dom.checkboxThirdPlace) {
    dom.checkboxThirdPlace.checked = !!tournamentState.config.hasThirdPlaceMatch;
  }
  if (dom.groupCountSelect) {
    dom.groupCountSelect.value = tournamentState.config.groupCount || 2;
  }

  if (dom.inputPtsWin) dom.inputPtsWin.value = tournamentState.config.pointsWin ?? 3;
  if (dom.inputPtsDraw) dom.inputPtsDraw.value = tournamentState.config.pointsDraw ?? 1;
  if (dom.inputPtsLoss) dom.inputPtsLoss.value = tournamentState.config.pointsLoss ?? 0;
  if (dom.selectTiebreaker) {
    dom.selectTiebreaker.value = tournamentState.config.tiebreaker || 'dg';
  }

  if (dom.inputTournamentName && !dom.inputTournamentName._configured) {
    dom.inputTournamentName._configured = true;
    if (dom.inputTournamentName) dom.inputTournamentName.addEventListener('input', (e) => {
      tournamentState.config.name = e.target.value.trim();
      saveState();
    });
  }

  if (dom.inputTournamentDescription) {
    if (dom.inputTournamentDescription) dom.inputTournamentDescription.addEventListener('input', (e) => {
      tournamentState.config.description = e.target.value.trim();
      saveState();
    });
  }

  if (dom.selectTournamentSport) {
    if (dom.selectTournamentSport) dom.selectTournamentSport.addEventListener('change', (e) => {
      const sport = e.target.value;
      tournamentState.config.sport = sport;
      if (SPORT_DEFAULT_DURATIONS[sport] && dom.inputMatchDuration) {
        dom.inputMatchDuration.value = SPORT_DEFAULT_DURATIONS[sport];
        tournamentState.config.matchDuration = SPORT_DEFAULT_DURATIONS[sport];
      }
      saveState();
    });
  }

  if (dom.inputMatchDuration) {
    if (dom.inputMatchDuration) dom.inputMatchDuration.addEventListener('input', (e) => {
      tournamentState.config.matchDuration = parseInt(e.target.value, 10) || 90;
      saveState();
    });
  }

  if (dom.selectTournamentFormat && !dom.selectTournamentFormat._configured) { dom.selectTournamentFormat._configured = true; dom.selectTournamentFormat.addEventListener('change', (e) => {
    tournamentState.config.format = e.target.value;
    updateFormatDetails(e.target.value);
    syncGroupsWithTeams();
    saveState();
  });
  }

  if (dom.selectGroupQualified) {
    if (dom.selectGroupQualified) dom.selectGroupQualified.addEventListener('change', (e) => {
      tournamentState.config.groupQualifiedCount = parseInt(e.target.value, 10) || 2;
      saveState();
    });
  }

  if (dom.checkboxThirdPlace) {
    if (dom.checkboxThirdPlace) dom.checkboxThirdPlace.addEventListener('change', (e) => {
      tournamentState.config.hasThirdPlaceMatch = e.target.checked;
      saveState();
    });
  }

  if (dom.groupCountSelect) {
    if (dom.groupCountSelect) dom.groupCountSelect.addEventListener('change', (e) => {
      tournamentState.config.groupCount = parseInt(e.target.value, 10) || 2;
      redistributeTeamsEqually();
      saveState();
      renderGroupsDistribution();
      showToast(`Torneo configurado en ${tournamentState.config.groupCount} grupos`, 'info');
    });
  }

  if (dom.btnRandomDrawGroups) {
    if (dom.btnRandomDrawGroups) dom.btnRandomDrawGroups.addEventListener('click', handleRandomDraw);
  }

  const updatePoints = () => {
    tournamentState.config.pointsWin = parseInt(dom.inputPtsWin.value, 10) || 3;
    tournamentState.config.pointsDraw = parseInt(dom.inputPtsDraw.value, 10) || 1;
    tournamentState.config.pointsLoss = parseInt(dom.inputPtsLoss.value, 10) || 0;
    saveState();
    renderStandingsView();
  };

  if (dom.inputPtsWin) dom.inputPtsWin.addEventListener('input', updatePoints);
  if (dom.inputPtsDraw) dom.inputPtsDraw.addEventListener('input', updatePoints);
  if (dom.inputPtsLoss) dom.inputPtsLoss.addEventListener('input', updatePoints);

  if (dom.selectTiebreaker) {
    if (dom.selectTiebreaker) dom.selectTiebreaker.addEventListener('change', (e) => {
      tournamentState.config.tiebreaker = e.target.value;
      saveState();
      renderStandingsView();
    });
  }

  if (dom.btnSaveDraft) {
    if (dom.btnSaveDraft) dom.btnSaveDraft.addEventListener('click', handleSaveDraft);
  }

  if (dom.btnGenerate) dom.btnGenerate.addEventListener('click', handleGenerateTournament);
  if (dom.btnResetAll) dom.btnResetAll.addEventListener('click', handleResetTournament);

  // --- FASE 2: Controles de Programación y Canchas Colombia ---
  
  // Desplegar calendario interactivo al hacer clic o foco en cualquier parte de la caja
  ['configRegStartDate', 'configRegEndDate', 'configStartDate', 'configEndDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.cursor = 'pointer';
      const box = el.closest('.input-with-icon') || el.parentElement;
      if (box) {
        box.style.cursor = 'pointer';
        box.addEventListener('click', (e) => {
          if (e.target !== el) {
            el.focus();
            try { if (typeof el.showPicker === 'function') el.showPicker(); } catch(err){}
          }
        });
      }
      ['click', 'focus'].forEach(ev => {
        el.addEventListener(ev, () => {
          try { if (typeof el.showPicker === 'function') el.showPicker(); } catch(err){}
        });
      });
      el.addEventListener('change', () => {
        updateVenueAvailabilitySchedule();
      });
    }
  });

  // Vincular cambio de sedes y días a la matriz de disponibilidad
  document.querySelectorAll('input[name="assignedVenues"]').forEach(chk => {
    chk.addEventListener('change', () => {
      updateVenueAvailabilitySchedule();
    });
  });
  setTimeout(updateVenueAvailabilitySchedule, 100);

  const configStartDateEl = document.getElementById('configStartDate');
  const configEndDateEl = document.getElementById('configEndDate');

  if (configStartDateEl) {
    if (!tournamentState.config.startDate) {
      const today = new Date();
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
      const nextSat = new Date(today);
      nextSat.setDate(today.getDate() + daysUntilSaturday);
      tournamentState.config.startDate = nextSat.toISOString().split('T')[0];
    }
    configStartDateEl.value = tournamentState.config.startDate;
    configStartDateEl.addEventListener('change', (e) => {
      tournamentState.config.startDate = e.target.value;
      saveState();
      updateSlotsAvailabilityCheck();
    });
  }

  if (configEndDateEl) {
    if (!tournamentState.config.endDate) {
      const start = new Date((tournamentState.config.startDate || new Date().toISOString().split('T')[0]) + 'T00:00:00');
      const twoMonthsLater = new Date(start);
      twoMonthsLater.setDate(start.getDate() + 60);
      tournamentState.config.endDate = twoMonthsLater.toISOString().split('T')[0];
    }
    configEndDateEl.value = tournamentState.config.endDate;
    configEndDateEl.addEventListener('change', (e) => {
      tournamentState.config.endDate = e.target.value;
      saveState();
      updateSlotsAvailabilityCheck();
    });
  }

  // Días permitidos
  if (tournamentState.config.allowedDays && Array.isArray(tournamentState.config.allowedDays)) {
    document.querySelectorAll('input[name="allowedDays"]').forEach(chk => {
      chk.checked = tournamentState.config.allowedDays.includes(parseInt(chk.value, 10));
    });
  } else {
    tournamentState.config.allowedDays = [6, 0]; // Sáb y Dom por defecto
  }

  document.querySelectorAll('input[name="allowedDays"]').forEach(chk => {
    chk.addEventListener('change', () => {
      const selected = Array.from(document.querySelectorAll('input[name="allowedDays"]:checked')).map(c => parseInt(c.value, 10));
      tournamentState.config.allowedDays = selected;
      saveState();
      updateSlotsAvailabilityCheck();
    });
  });

  // Franjas horarias
  if (tournamentState.config.timeSlots && Array.isArray(tournamentState.config.timeSlots)) {
    document.querySelectorAll('input[name="timeSlots"]').forEach(chk => {
      chk.checked = tournamentState.config.timeSlots.includes(chk.value);
    });
  } else {
    tournamentState.config.timeSlots = ['08:00', '10:00', '16:00', '18:00', '20:00'];
  }

  document.querySelectorAll('input[name="timeSlots"]').forEach(chk => {
    chk.addEventListener('change', () => {
      const selected = Array.from(document.querySelectorAll('input[name="timeSlots"]:checked')).map(c => c.value);
      tournamentState.config.timeSlots = selected;
      saveState();
      updateSlotsAvailabilityCheck();
    });
  });

  // Reglas y Plantillas
  const minAgeEl = document.getElementById('configMinAge');
  const maxAgeEl = document.getElementById('configMaxAge');
  const rosterLimitEl = document.getElementById('configRosterLimit');

  if (minAgeEl) {
    minAgeEl.value = tournamentState.config.minAge ?? 18;
    minAgeEl.addEventListener('input', (e) => {
      tournamentState.config.minAge = parseInt(e.target.value, 10) || 18;
      saveState();
    });
  }
  if (maxAgeEl) {
    maxAgeEl.value = tournamentState.config.maxAge ?? 0;
    maxAgeEl.addEventListener('input', (e) => {
      tournamentState.config.maxAge = parseInt(e.target.value, 10) || 0;
      saveState();
    });
  }
  if (rosterLimitEl) {
    rosterLimitEl.value = tournamentState.config.rosterLimit ?? 22;
    rosterLimitEl.addEventListener('input', (e) => {
      tournamentState.config.rosterLimit = parseInt(e.target.value, 10) || 22;
      saveState();
    });
  }

  renderConfigVenuesSelector();
  updateSlotsAvailabilityCheck();
  initInteractiveConfigVisuals();

  syncGroupsWithTeams();
  renderGroupsDistribution();
}


/**
 * ==========================================================================
 * REDISEÑO INTERACTIVO: CONFIGURADOR DEPORTIVO (view-crear)
 * ==========================================================================
 */

var currentWizardStep = 1;
var _wizardAnimTimeout = null;

function resetWizardToStep1() {
  currentWizardStep = 1;
  if (_wizardAnimTimeout) {
    clearTimeout(_wizardAnimTimeout);
    _wizardAnimTimeout = null;
  }
  document.querySelectorAll('.wizard-step-pane').forEach(pane => {
    const stepNum = parseInt(pane.getAttribute('data-wizard-step'), 10);
    pane.classList.remove('active', 'is-exiting', 'is-entering', 'anim-slide-out-left', 'anim-slide-in-right', 'anim-slide-out-right', 'anim-slide-in-left');
    if (stepNum === 1) {
      pane.classList.add('active');
    }
  });
  syncWizardStepperUI(1);
}

function syncWizardStepperUI(activeStep) {
  for (let s = 1; s <= 4; s++) {
    const btn = document.getElementById(`wizardStep${s}`);
    const conn = document.getElementById(`wizardConn${s}`);
    if (btn) {
      btn.classList.toggle('active', s === activeStep);
      btn.classList.toggle('completed', s < activeStep);
    }
    if (conn) {
      conn.classList.toggle('completed', s < activeStep);
    }
  }
}

function validateWizardStep(stepNum) {
  if (stepNum === 1) {
    const nameEl = document.getElementById('tournamentName');
    const nameVal = nameEl ? nameEl.value.trim() : '';
    if (!nameVal) {
      showToast('Ingresa el nombre oficial del torneo antes de continuar al Paso 2.', 'warning', 3000);
      if (nameEl) nameEl.focus();
      return false;
    }
  } else if (stepNum === 2) {
    const maxTeamsEl = document.getElementById('configMaxTeams');
    const maxVal = parseInt(maxTeamsEl?.value, 10) || 0;
    if (maxVal < 4 || maxVal > 64) {
      showToast('El número de clubes participantes debe estar entre 4 y 64.', 'warning', 3000);
      if (maxTeamsEl) maxTeamsEl.focus();
      return false;
    }
  } else if (stepNum === 3) {
    const regStart = document.getElementById('configRegStartDate')?.value;
    const regEnd = document.getElementById('configRegEndDate')?.value;
    const tStart = document.getElementById('configStartDate')?.value;
    const tEnd = document.getElementById('configEndDate')?.value;

    if (regStart && regEnd && regStart >= regEnd) {
      showToast('Incoherencia en fechas: La apertura de inscripciones debe ser anterior al cierre.', 'error', 3500);
      return false;
    }
    if (regEnd && tStart && regEnd > tStart) {
      showToast('Incoherencia en fechas: El campeonato debe comenzar en o después del cierre de inscripciones.', 'error', 3500);
      return false;
    }
    if (tStart && tEnd && tStart > tEnd) {
      showToast('Incoherencia en fechas: La fecha de finalización debe ser posterior a la fecha de inicio.', 'error', 3500);
      return false;
    }
  }
  return true;
}

window.goToWizardStep = goToWizardStep;
window.saveUserSession = saveUserSession;
window.updateAuthUI = updateAuthUI;
window.navigateToView = navigateToView;
window.closeAuthModal = closeAuthModal;
window.updateVenueAvailabilitySchedule = updateVenueAvailabilitySchedule;

function goToWizardStep(targetStep, skipValidation = false) {
  targetStep = Math.max(1, Math.min(4, parseInt(targetStep, 10) || 1));
  if (targetStep === currentWizardStep) {
    syncWizardStepperUI(targetStep);
    return true;
  }

  // Validar pasos intermedios si avanzamos hacia adelante
  if (targetStep > currentWizardStep && !skipValidation) {
    for (let s = currentWizardStep; s < targetStep; s++) {
      if (!validateWizardStep(s)) return false;
    }
  }

  const isForward = targetStep > currentWizardStep;
  const prevStep = currentWizardStep;
  currentWizardStep = targetStep;

  syncWizardStepperUI(targetStep);

  const prevPane = document.querySelector(`.wizard-step-pane[data-wizard-step="${prevStep}"]`);
  const nextPane = document.querySelector(`.wizard-step-pane[data-wizard-step="${targetStep}"]`);

  if (_wizardAnimTimeout) {
    clearTimeout(_wizardAnimTimeout);
    _wizardAnimTimeout = null;
  }

  // Limpiar clases previas de animación en todos los paneles
  document.querySelectorAll('.wizard-step-pane').forEach(p => {
    p.classList.remove('is-exiting', 'is-entering', 'anim-slide-out-left', 'anim-slide-in-right', 'anim-slide-out-right', 'anim-slide-in-left');
    if (p !== prevPane && p !== nextPane) {
      p.classList.remove('active');
    }
  });

  if (prevPane && nextPane) {
    prevPane.classList.remove('active');
    prevPane.classList.add('is-exiting', isForward ? 'anim-slide-out-left' : 'anim-slide-out-right');
    nextPane.classList.add('active', 'is-entering', isForward ? 'anim-slide-in-right' : 'anim-slide-in-left');

    _wizardAnimTimeout = setTimeout(() => {
      prevPane.classList.remove('is-exiting', 'anim-slide-out-left', 'anim-slide-out-right');
      nextPane.classList.remove('is-entering', 'anim-slide-in-right', 'anim-slide-in-left');
      _wizardAnimTimeout = null;
    }, 390);
  } else if (nextPane) {
    nextPane.classList.add('active');
  }

  if (targetStep === 4) {
    updateConfigLivePreview();
  }

  // Enfoque visual suave hacia el stepper
  const stepper = document.querySelector('.config-wizard-stepper');
  if (stepper) {
    const rect = stepper.getBoundingClientRect();
    if (rect.top < 60 || rect.top > window.innerHeight * 0.4) {
      stepper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  return true;
}

function initInteractiveConfigVisuals() {
  // Asegurar estado inicial en Paso 1
  resetWizardToStep1();

  // A. Wizard Stepper Superior (Clic directo en pasos)
  for (let s = 1; s <= 4; s++) {
    const btn = document.getElementById(`wizardStep${s}`);
    if (btn && !btn._configured) {
      btn._configured = true;
      btn.addEventListener('click', () => {
        goToWizardStep(s);
      });
    }
  }

  // A.2 Botones de Navegación Inferior del Wizard (Siguiente / Anterior)
  const navBindings = [
    { id: 'btnWizardNext1', target: 2, skip: false },
    { id: 'btnWizardPrev2', target: 1, skip: true },
    { id: 'btnWizardNext2', target: 3, skip: false },
    { id: 'btnWizardPrev3', target: 2, skip: true },
    { id: 'btnWizardNext3', target: 4, skip: false },
    { id: 'btnWizardPrev4', target: 3, skip: true }
  ];
  navBindings.forEach(({ id, target, skip }) => {
    const btn = document.getElementById(id);
    if (btn && !btn._configured) {
      btn._configured = true;
      btn.addEventListener('click', () => {
        goToWizardStep(target, skip);
      });
    }
  });

  // B. Selector Visual de Deporte / Modalidad (Tarjetas con SVG)
  const sportCards = document.querySelectorAll('.sport-visual-card');
  const currentSport = tournamentState.config.sport || 'f11';
  sportCards.forEach(card => {
    const sp = card.getAttribute('data-sport');
    card.classList.toggle('active', sp === currentSport || (sp === 'f11' && currentSport === 'futbol11'));
    if (!card._configured) {
      card._configured = true;
      card.addEventListener('click', () => {
        sportCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const selectedSport = card.getAttribute('data-sport');
        const defDuration = parseInt(card.getAttribute('data-duration'), 10) || 90;
        
        if (dom.selectTournamentSport) {
          dom.selectTournamentSport.value = selectedSport;
          dom.selectTournamentSport.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (dom.inputMatchDuration) {
          dom.inputMatchDuration.value = defDuration;
          dom.inputMatchDuration.dispatchEvent(new Event('input', { bubbles: true }));
        }
        tournamentState.config.sport = selectedSport;
        tournamentState.config.matchDuration = defDuration;
        saveState();
        updateConfigLivePreview();
      });
    }
  });

  // C. Botones Rápidos de Duración (-5 min / +5 min)
  const btnMinus5 = document.getElementById('btnDurationMinus5');
  const btnPlus5 = document.getElementById('btnDurationPlus5');
  if (btnMinus5 && !btnMinus5._configured) {
    btnMinus5._configured = true;
    btnMinus5.addEventListener('click', () => {
      if (dom.inputMatchDuration) {
        const cur = parseInt(dom.inputMatchDuration.value, 10) || 90;
        const nextVal = Math.max(10, cur - 5);
        dom.inputMatchDuration.value = nextVal;
        dom.inputMatchDuration.dispatchEvent(new Event('input', { bubbles: true }));
        tournamentState.config.matchDuration = nextVal;
        saveState();
        updateConfigLivePreview();
      }
    });
  }
  if (btnPlus5 && !btnPlus5._configured) {
    btnPlus5._configured = true;
    btnPlus5.addEventListener('click', () => {
      if (dom.inputMatchDuration) {
        const cur = parseInt(dom.inputMatchDuration.value, 10) || 90;
        const nextVal = Math.min(180, cur + 5);
        dom.inputMatchDuration.value = nextVal;
        dom.inputMatchDuration.dispatchEvent(new Event('input', { bubbles: true }));
        tournamentState.config.matchDuration = nextVal;
        saveState();
        updateConfigLivePreview();
      }
    });
  }

  // D. Selector de Cupo de Equipos y Chips Presets (4, 8, 12, 16, 24)
  const maxTeamsInput = document.getElementById('configMaxTeams');
  const quotaChips = document.querySelectorAll('.btn-quota-chip');
  const curMaxTeams = Math.max(4, parseInt(tournamentState.config.maxTeams, 10) || (tournamentState.teams && tournamentState.teams.length >= 4 ? tournamentState.teams.length : 8));
  if (maxTeamsInput) {
    maxTeamsInput.value = curMaxTeams;
    quotaChips.forEach(ch => {
      ch.classList.toggle('active', parseInt(ch.getAttribute('data-teams'), 10) === curMaxTeams);
      if (!ch._configured) {
        ch._configured = true;
        ch.addEventListener('click', () => {
          const tVal = parseInt(ch.getAttribute('data-teams'), 10);
          maxTeamsInput.value = tVal;
          maxTeamsInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }
    });

    if (!maxTeamsInput._configured) {
      maxTeamsInput._configured = true;
      maxTeamsInput.addEventListener('input', (e) => {
        const val = Math.max(4, parseInt(e.target.value, 10) || 8);
        tournamentState.config.maxTeams = val;
        quotaChips.forEach(ch => ch.classList.toggle('active', parseInt(ch.getAttribute('data-teams'), 10) === val));
        saveState();
        updateFormatMatchesEstimate();
        updateConfigLivePreview();
      });
    }
  }

  // E. Selector Visual de Formato (3 Grandes Tarjetas con Diagramas)
  const formatCards = document.querySelectorAll('.format-visual-card');
  const vueltasPills = document.querySelectorAll('.btn-vuelta-pill');
  const currentFormat = tournamentState.config.format || 'league_single';

  formatCards.forEach(card => {
    const fVal = card.getAttribute('data-format');
    const isMatched = (fVal === currentFormat) || 
      (fVal === 'league_single' && (currentFormat === 'league_single' || currentFormat === 'league_double')) ||
      (fVal === 'groups_playoffs' && (currentFormat === 'groups_playoffs' || currentFormat === 'groups_semis'));
    card.classList.toggle('active', isMatched);

    if (!card._configured) {
      card._configured = true;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-vuelta-pill')) return;
        formatCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        let selectedFormat = card.getAttribute('data-format');
        if (selectedFormat === 'league_single') {
          const activePill = document.querySelector('.btn-vuelta-pill.active');
          if (activePill) selectedFormat = activePill.getAttribute('data-vueltas');
        }
        if (dom.selectTournamentFormat) {
          dom.selectTournamentFormat.value = selectedFormat;
          dom.selectTournamentFormat.dispatchEvent(new Event('change', { bubbles: true }));
        }
        tournamentState.config.format = selectedFormat;
        saveState();
        updateFormatMatchesEstimate();
        updateConfigLivePreview();
      });
    }
  });

  vueltasPills.forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute('data-vueltas') === currentFormat);
    if (!pill._configured) {
      pill._configured = true;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        vueltasPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const chosen = pill.getAttribute('data-vueltas');
        const leagueCard = document.getElementById('formatCardLeague');
        if (leagueCard) {
          formatCards.forEach(c => c.classList.remove('active'));
          leagueCard.classList.add('active');
        }
        if (dom.selectTournamentFormat) {
          dom.selectTournamentFormat.value = chosen;
          dom.selectTournamentFormat.dispatchEvent(new Event('change', { bubbles: true }));
        }
        tournamentState.config.format = chosen;
        saveState();
        updateFormatMatchesEstimate();
        updateConfigLivePreview();
      });
    }
  });

  // F. Controles +/- en Puntuación de Marcador Deportivo
  document.querySelectorAll('.btn-pts-step').forEach(btn => {
    if (!btn._configured) {
      btn._configured = true;
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-pts-target');
        const stepVal = parseInt(btn.getAttribute('data-step'), 10) || 1;
        const inputEl = document.getElementById(targetId);
        if (inputEl) {
          const curVal = parseInt(inputEl.value, 10) || 0;
          const nextVal = Math.max(0, Math.min(10, curVal + stepVal));
          inputEl.value = nextVal;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          updateConfigLivePreview();
        }
      });
    }
  });

  // G. Botones de Acción en Tarjeta Flotante Lateral
  const btnPrevGen = document.getElementById('btnPreviewGenerateTournament');
  const btnPrevDraft = document.getElementById('btnPreviewSaveDraft');
  if (btnPrevGen && !btnPrevGen._configured) {
    btnPrevGen._configured = true;
    btnPrevGen.addEventListener('click', () => {
      const mainBtn = document.getElementById('btnGenerateTournament');
      if (mainBtn) mainBtn.click();
    });
  }
  if (btnPrevDraft && !btnPrevDraft._configured) {
    btnPrevDraft._configured = true;
    btnPrevDraft.addEventListener('click', () => {
      const mainBtn = document.getElementById('btnSaveDraft');
      if (mainBtn) mainBtn.click();
    });
  }

  // H. Escuchadores en vivo para Inputs de Texto, Fechas y Estado Inicial
  ['tournamentName', 'tournamentDescription', 'configRegStartDate', 'configRegEndDate', 'configStartDate', 'configEndDate', 'tiebreakerSelect', 'configInitialStatus'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el._liveConfigured) {
      el._liveConfigured = true;
      el.addEventListener('input', updateConfigLivePreview);
      el.addEventListener('change', updateConfigLivePreview);
    }
  });

  // Actualizar estimaciones iniciales
  updateFormatMatchesEstimate();
  updateConfigLivePreview();
}

/**
 * Calcula dinámicamente cuántos partidos oficiales se jugarán según equipos y formato
 */
function updateFormatMatchesEstimate() {
  const maxTeamsInput = document.getElementById('configMaxTeams');
  const n = Math.max(4, parseInt(maxTeamsInput?.value, 10) || parseInt(tournamentState.config.maxTeams, 10) || 8);
  const format = dom.selectTournamentFormat?.value || tournamentState.config.format || 'league_single';
  const textEl = document.getElementById('formatMatchesEstimateText');
  const badgeValEl = document.getElementById('previewEstMatchesVal');

  let matches = 0;
  let desc = '';

  if (format === 'league_single') {
    matches = (n * (n - 1)) / 2;
    const rounds = n % 2 === 0 ? n - 1 : n;
    desc = `Cálculo en vivo: Para ${n} clubes en Liga (1 Vuelta) se generarán <strong>${matches} partidos oficiales</strong> (${rounds} jornadas).`;
  } else if (format === 'league_double') {
    matches = n * (n - 1);
    const rounds = (n % 2 === 0 ? n - 1 : n) * 2;
    desc = `Cálculo en vivo: Para ${n} clubes en Liga (Ida y Vuelta) se generarán <strong>${matches} partidos oficiales</strong> (${rounds} jornadas).`;
  } else if (format === 'knockout') {
    matches = Math.max(1, n - 1);
    const startStage = n <= 4 ? 'Semifinales' : (n <= 8 ? 'Cuartos de Final' : 'Octavos de Final');
    desc = `Cálculo en vivo: Para ${n} clubes en Eliminación Directa se disputarán <strong>${matches} partidos</strong> (desde ${startStage} hasta la Final).`;
  } else {
    const half = Math.max(2, Math.ceil(n / 2));
    const groupMatches = 2 * ((half * (half - 1)) / 2);
    const playoffMatches = 4;
    matches = groupMatches + playoffMatches;
    desc = `Cálculo en vivo: Para ${n} clubes en Grupos + Fase Final se disputarán <strong>${matches} partidos oficiales</strong>.`;
  }

  const safeMatches = Math.max(1, Math.round(matches));
  if (textEl) textEl.innerHTML = desc;
  if (badgeValEl) badgeValEl.textContent = `${safeMatches} Partidos`;
}

/**
 * Refresca todos los datos de la Tarjeta Lateral Flotante de Vista Previa en Vivo y Paso 4
 */
function updateConfigLivePreview() {
  const nameInput = document.getElementById('tournamentName');
  const descInput = document.getElementById('tournamentDescription');
  const prevName = document.getElementById('previewTournamentName');
  const prevDesc = document.getElementById('previewTournamentDesc');
  const prevSport = document.getElementById('previewSportPill');
  const prevDuration = document.getElementById('previewDurationPill');
  const prevFormat = document.getElementById('previewFormatPill');
  const prevMaxTeams = document.getElementById('previewMaxTeamsVal');
  const prevPoints = document.getElementById('previewPointsRuleVal');
  const prevTiebreaker = document.getElementById('previewTiebreakerVal');
  const prevRegDates = document.getElementById('previewRegDates');
  const prevPlayDates = document.getElementById('previewPlayDates');
  const prevVenuesText = document.getElementById('previewVenuesText');
  const prevVenueBadge = document.getElementById('previewVenueAvailBadge');
  const prevVenueText = document.getElementById('previewVenueAvailText');
  const prevStatusText = document.getElementById('previewStatusText');

  const tName = nameInput?.value?.trim() || tournamentState.config?.name || 'Nombre del Torneo';
  const tDesc = descInput?.value?.trim() || tournamentState.config?.description || 'Torneo oficial en proceso de configuración deportiva.';
  if (prevName) prevName.textContent = tName;
  if (prevDesc) prevDesc.textContent = tDesc;

  const sportNames = {
    f11: '⚽ Fútbol 11',
    futbol11: '⚽ Fútbol 11',
    f8: '⚽ Fútbol 8 / 9',
    f7: '⚽ Fútbol 7',
    f5: '⚽ Fútbol 5',
    futsal: '⚽ Futsal'
  };
  const spVal = dom.selectTournamentSport?.value || tournamentState.config?.sport || 'f11';
  const spLabel = sportNames[spVal] || '⚽ Fútbol';
  if (prevSport) prevSport.textContent = spLabel;

  const durVal = dom.inputMatchDuration?.value || tournamentState.config?.matchDuration || 90;
  if (prevDuration) prevDuration.textContent = `⏱️ ${durVal} min`;

  const formatNames = {
    league_single: '🏆 Liga (1 Vuelta)',
    league_double: '🏆 Liga (Ida y Vuelta)',
    knockout: '⚡ Eliminación Directa',
    groups_playoffs: '🌐 Grupos + Playoffs',
    groups_semis: '🌐 Grupos + Semifinales'
  };
  const fmtVal = dom.selectTournamentFormat?.value || tournamentState.config?.format || 'league_single';
  const fmtLabel = formatNames[fmtVal] || '🏆 Liga';
  if (prevFormat) prevFormat.textContent = fmtLabel;

  const maxT = Math.max(4, parseInt(document.getElementById('configMaxTeams')?.value, 10) || parseInt(tournamentState.config?.maxTeams, 10) || 8);
  if (prevMaxTeams) prevMaxTeams.textContent = `${maxT} Equipos`;

  const ptsW = document.getElementById('ptsWinInput')?.value ?? tournamentState.config?.pointsWin ?? 3;
  const ptsD = document.getElementById('ptsDrawInput')?.value ?? tournamentState.config?.pointsDraw ?? 1;
  const ptsL = document.getElementById('ptsLossInput')?.value ?? tournamentState.config?.pointsLoss ?? 0;
  const ptsLabel = `${ptsW}G • ${ptsD}E • ${ptsL}P`;
  if (prevPoints) prevPoints.textContent = ptsLabel;

  const tbVal = document.getElementById('tiebreakerSelect')?.value || tournamentState.config?.tiebreaker || 'dg';
  const tbLabel = tbVal === 'dg' ? 'Dif. Goles (DG)' : 'Enfrent. (H2H)';
  if (prevTiebreaker) prevTiebreaker.textContent = tbLabel;

  const regStart = document.getElementById('configRegStartDate')?.value || tournamentState.config?.regStartDate;
  const regEnd = document.getElementById('configRegEndDate')?.value || tournamentState.config?.regEndDate;
  const tStart = document.getElementById('configStartDate')?.value || tournamentState.config?.startDate;
  const tEnd = document.getElementById('configEndDate')?.value || tournamentState.config?.endDate;

  const regStr = (regStart && regEnd) ? `${regStart} al ${regEnd}` : 'Sin definir';
  const playStr = (tStart && tEnd) ? `${tStart} al ${tEnd}` : 'Sin definir';
  if (prevRegDates) prevRegDates.textContent = regStr;
  if (prevPlayDates) prevPlayDates.textContent = playStr;

  const assignedVenues = Array.from(document.querySelectorAll('#configVenuesContainer input[name="assignedVenues"]:checked'))
    .map(chk => {
      const card = chk.closest('.venue-select-card');
      return card?.querySelector('strong')?.textContent || chk.value;
    });

  const venuesStr = assignedVenues.length > 0 
    ? assignedVenues.slice(0, 3).join(', ') + (assignedVenues.length > 3 ? ` (+${assignedVenues.length - 3} más)` : '')
    : 'Ninguna cancha asignada aún';
  if (prevVenuesText) prevVenuesText.textContent = venuesStr;

  const hasWarning = document.getElementById('configSlotsWarningBanner')?.style.display !== 'none';
  if (prevVenueBadge && prevVenueText) {
    if (hasWarning) {
      prevVenueBadge.className = 'preview-venue-status warn';
      prevVenueText.textContent = 'Revisar Fechas/Cupos';
    } else {
      prevVenueBadge.className = 'preview-venue-status ok';
      prevVenueText.textContent = 'Disponibilidad OK';
    }
  }

  // Estado inicial en Badge
  const initSt = document.getElementById('configInitialStatus')?.value;
  if (prevStatusText && initSt) {
    const stTextMap = {
      open_registration: 'Inscripciones Abiertas',
      upcoming: 'Próximo a Iniciar',
      draft: 'Borrador Privado'
    };
    prevStatusText.textContent = stTextMap[initSt] || 'En Configuración';
  }

  // Sincronizar también el Resumen Final en el Paso 4
  const s4Name = document.getElementById('step4SummaryName');
  const s4Sport = document.getElementById('step4SummarySport');
  const s4Format = document.getElementById('step4SummaryFormat');
  const s4Points = document.getElementById('step4SummaryPoints');
  const s4Reg = document.getElementById('step4SummaryRegDates');
  const s4Play = document.getElementById('step4SummaryPlayDates');
  const s4Venues = document.getElementById('step4SummaryVenues');

  if (s4Name) s4Name.textContent = tName;
  if (s4Sport) s4Sport.textContent = `${spLabel} (${durVal} min)`;
  if (s4Format) s4Format.textContent = `${fmtLabel} • ${maxT} Equipos`;
  if (s4Points) s4Points.textContent = `${ptsLabel} (${tbLabel})`;
  if (s4Reg) s4Reg.textContent = regStr;
  if (s4Play) s4Play.textContent = playStr;
  if (s4Venues) s4Venues.textContent = assignedVenues.length > 0 ? assignedVenues.join(' • ') : 'Sin canchas seleccionadas';
}

function updateFormatDetails(format) {
  if (dom.formatHint && FORMAT_HINTS[format]) {
    dom.formatHint.textContent = FORMAT_HINTS[format];
  }

  if (dom.groupsConfigBox) {
    const isGroups = format === 'groups_playoffs' || format === 'groups_semis';
    dom.groupsConfigBox.style.display = isGroups ? 'flex' : 'none';
  }
}


async function syncTournamentToBackend(tourneyObj) {
  try {
    const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
    if (!session || !session.loggedIn) return;
    const sessionRole = normalizeRole(session.role);
    if (sessionRole !== 'admin' && sessionRole !== 'organizer') return;
    const cfg = tourneyObj.config || {};
    const payload = {
      id: tourneyObj.id,
      organizerName: session.name || tourneyObj.organizerName || 'Organizador',
      name: cfg.name || tourneyObj.name || 'Nuevo Torneo',
      description: cfg.description || tourneyObj.description || '',
      sport: cfg.sport || tourneyObj.sport || 'f11',
      format: cfg.format || tourneyObj.format || 'league_single',
      category: tourneyObj.category || 'Libre Masculino',
      status: tourneyObj.status || cfg.status || 'open_registration',
      startDate: cfg.startDate || tourneyObj.startDate || null,
      endDate: cfg.endDate || tourneyObj.endDate || null,
      regStartDate: cfg.regStartDate || tourneyObj.regStartDate || null,
      regEndDate: cfg.regEndDate || tourneyObj.regEndDate || null,
      maxTeams: parseInt(cfg.maxTeams || tourneyObj.maxTeams || 8, 10),
      playDays: cfg.allowedDays || tourneyObj.playDays || [],
      timeSlots: cfg.timeSlots || tourneyObj.timeSlots || [],
      venues: cfg.assignedVenues || tourneyObj.venueIds || [],
      rules: { minAge: cfg.minAge || 18, maxAge: cfg.maxAge || 0, rosterLimit: cfg.rosterLimit || 22 },
      pointsConfig: { win: cfg.pointsWin ?? 3, draw: cfg.pointsDraw ?? 1, loss: cfg.pointsLoss ?? 0 }
    };
    await fetch('/api/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': session.userId || '',
        'X-User-Role': sessionRole
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('Sync tournament to backend skipped/offline:', err);
  }
}

function handleSaveDraft() {
  const regStartVal = document.getElementById('configRegStartDate')?.value;
  const regEndVal = document.getElementById('configRegEndDate')?.value;
  const tStartVal = document.getElementById('configStartDate')?.value;
  const tEndVal = document.getElementById('configEndDate')?.value;

  if (regStartVal && regEndVal && regStartVal >= regEndVal) {
    showToast('Incoherencia en fechas: La apertura de inscripciones debe ser anterior al cierre.', 'error', 3500);
    return false;
  }
  if (regEndVal && tStartVal && regEndVal > tStartVal) {
    showToast('Incoherencia en fechas: El torneo debe comenzar en o después del cierre de inscripciones.', 'error', 3500);
    return false;
  }
  if (tStartVal && tEndVal && tStartVal > tEndVal) {
    showToast('Incoherencia en fechas: La finalización del torneo debe ser posterior al inicio.', 'error', 3500);
    return false;
  }
  if (regStartVal) tournamentState.config.regStartDate = regStartVal;
  if (regEndVal) tournamentState.config.regEndDate = regEndVal;

  const name = dom.inputTournamentName.value.trim();
  if (!name) {
    showToast('Ingresa un nombre para poder guardar el borrador', 'warning');
    dom.inputTournamentName.focus();
    return;
  }

  tournamentState.config.name = name;
  if (dom.inputTournamentDescription) tournamentState.config.description = dom.inputTournamentDescription.value.trim();
  if (dom.selectTournamentSport) tournamentState.config.sport = dom.selectTournamentSport.value;
  if (dom.inputMatchDuration) tournamentState.config.matchDuration = parseInt(dom.inputMatchDuration.value, 10) || 90;
  if (dom.selectTournamentFormat) tournamentState.config.format = dom.selectTournamentFormat.value;
  if (dom.inputPtsWin) tournamentState.config.ptsWin = parseInt(dom.inputPtsWin.value, 10) || 3;
  if (dom.inputPtsDraw) tournamentState.config.ptsDraw = parseInt(dom.inputPtsDraw.value, 10) || 1;
  if (dom.inputPtsLoss) tournamentState.config.ptsLoss = parseInt(dom.inputPtsLoss.value, 10) || 0;
  if (dom.selectTiebreaker) tournamentState.config.tiebreaker = dom.selectTiebreaker.value;
  if (dom.groupCountSelect) tournamentState.config.groupCount = parseInt(dom.groupCountSelect.value, 10) || 2;
  if (dom.selectGroupQualified) tournamentState.config.groupQualified = parseInt(dom.selectGroupQualified.value, 10) || 2;
  if (dom.checkboxThirdPlace) tournamentState.config.thirdPlace = dom.checkboxThirdPlace.checked;
  const maxTeamsEl = document.getElementById('configMaxTeams');
  if (maxTeamsEl) tournamentState.config.maxTeams = parseInt(maxTeamsEl.value, 10) || 8;

  const startDateEl = document.getElementById('configStartDate');
  const endDateEl = document.getElementById('configEndDate');
  if (startDateEl && startDateEl.value) tournamentState.config.startDate = startDateEl.value;
  if (endDateEl && endDateEl.value) tournamentState.config.endDate = endDateEl.value;
  tournamentState.config.allowedDays = Array.from(document.querySelectorAll('input[name="allowedDays"]:checked')).map(c => parseInt(c.value, 10));
  tournamentState.config.timeSlots = Array.from(document.querySelectorAll('input[name="timeSlots"]:checked')).map(c => c.value);
  tournamentState.config.assignedVenues = Array.from(document.querySelectorAll('input[name="assignedVenues"]:checked')).map(c => c.value);
  const minAgeEl = document.getElementById('configMinAge');
  const maxAgeEl = document.getElementById('configMaxAge');
  const rosterLimitEl = document.getElementById('configRosterLimit');
  if (minAgeEl) tournamentState.config.minAge = parseInt(minAgeEl.value, 10) || 18;
  if (maxAgeEl) tournamentState.config.maxAge = parseInt(maxAgeEl.value, 10) || 0;
  if (rosterLimitEl) tournamentState.config.rosterLimit = parseInt(rosterLimitEl.value, 10) || 22;

  const activeSess = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  if (activeSess && activeSess.userId) {
    tournamentState.organizerId = activeSess.userId;
    tournamentState.organizerName = activeSess.name || 'Organizador';
  }

  tournamentState.config.status = 'draft';
  tournamentState.status = 'draft';
  saveState();
  syncTournamentToBackend(tournamentState);
  updateHeaderActiveTournamentPill();
  updateTournamentStatusBadge();
  showToast('¡Borrador del torneo guardado exitosamente!', 'success');
  return true;
}

function handleGenerateTournament() {
  const name = dom.inputTournamentName ? dom.inputTournamentName.value.trim() : '';
  const teamCount = tournamentState.teams.length;

  if (!name) {
    showToast('El nombre del torneo es obligatorio', 'warning');
    if (typeof goToWizardStep === 'function') goToWizardStep(1, true);
    if (dom.inputTournamentName) dom.inputTournamentName.focus();
    return;
  }

  // Capturar configuración actual de los inputs antes de publicar o generar
  if (dom.inputTournamentDescription) tournamentState.config.description = dom.inputTournamentDescription.value.trim();
  if (dom.selectTournamentSport) tournamentState.config.sport = dom.selectTournamentSport.value;
  if (dom.inputMatchDuration) tournamentState.config.matchDuration = parseInt(dom.inputMatchDuration.value, 10) || 90;
  if (dom.selectTournamentFormat) tournamentState.config.format = dom.selectTournamentFormat.value;
  if (dom.inputPtsWin) tournamentState.config.pointsWin = parseInt(dom.inputPtsWin.value, 10) || 3;
  if (dom.inputPtsDraw) tournamentState.config.pointsDraw = parseInt(dom.inputPtsDraw.value, 10) || 1;
  if (dom.inputPtsLoss) tournamentState.config.pointsLoss = parseInt(dom.inputPtsLoss.value, 10) || 0;
  if (dom.selectTiebreaker) tournamentState.config.tiebreaker = dom.selectTiebreaker.value;
  const maxTeamsEl = document.getElementById('configMaxTeams');
  if (maxTeamsEl) tournamentState.config.maxTeams = parseInt(maxTeamsEl.value, 10) || 8;
  const regStartEl = document.getElementById('configRegStartDate');
  const regEndEl = document.getElementById('configRegEndDate');
  if (regStartEl && regStartEl.value) tournamentState.config.regStartDate = regStartEl.value;
  if (regEndEl && regEndEl.value) tournamentState.config.regEndDate = regEndEl.value;
  const initStatusEl = document.getElementById('configInitialStatus');
  const initialStatus = initStatusEl ? initStatusEl.value : 'open_registration';
  tournamentState.config.name = name;
  tournamentState.name = name;
  tournamentState.config.status = initialStatus;

  const activeSess = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  if (activeSess && activeSess.userId) {
    tournamentState.organizerId = activeSess.userId;
    tournamentState.organizerName = activeSess.name || 'Organizador';
  }

  if (teamCount < 4) {
    // Publicar el torneo con su estado seleccionado (e.g. open_registration) para recibir clubes
    tournamentState.status = initialStatus;
    saveState();
    syncTournamentToBackend(tournamentState);
    updateHeaderActiveTournamentPill();
    updateTournamentStatusBadge();
    renderTournamentsListView();
    showToast('¡Torneo guardado y publicado exitosamente! Registra o aprueba al menos 4 clubes para sortear el fixture.', 'success', 4500);
    navigateTo('torneos');
    return;
  }

  if (tournamentState.isGenerated && tournamentState.matches && tournamentState.matches.length > 0) {
    openConfirmRegenerateModal();
    return;
  }

  executeTournamentGeneration();
  syncTournamentToBackend(tournamentState);
}

function executeTournamentGeneration() {
  const name = dom.inputTournamentName.value.trim();
  tournamentState.config.name = name;

  const startDateEl = document.getElementById('configStartDate');
  const endDateEl = document.getElementById('configEndDate');
  if (startDateEl && startDateEl.value) tournamentState.config.startDate = startDateEl.value;
  if (endDateEl && endDateEl.value) tournamentState.config.endDate = endDateEl.value;

  const allowedDays = Array.from(document.querySelectorAll('input[name="allowedDays"]:checked')).map(c => parseInt(c.value, 10));
  if (allowedDays.length > 0) tournamentState.config.allowedDays = allowedDays;

  const timeSlots = Array.from(document.querySelectorAll('input[name="timeSlots"]:checked')).map(c => c.value);
  if (timeSlots.length > 0) tournamentState.config.timeSlots = timeSlots;

  const assignedVenues = Array.from(document.querySelectorAll('input[name="assignedVenues"]:checked')).map(c => c.value);
  if (assignedVenues.length > 0) tournamentState.config.assignedVenues = assignedVenues;

  const minAgeEl = document.getElementById('configMinAge');
  const maxAgeEl = document.getElementById('configMaxAge');
  const rosterLimitEl = document.getElementById('configRosterLimit');
  if (minAgeEl) tournamentState.config.minAge = parseInt(minAgeEl.value, 10) || 18;
  if (maxAgeEl) tournamentState.config.maxAge = parseInt(maxAgeEl.value, 10) || 0;
  if (rosterLimitEl) tournamentState.config.rosterLimit = parseInt(rosterLimitEl.value, 10) || 22;

  const success = generateFixtures();
  if (!success) {
    showToast('Hubo un error al generar los partidos', 'error');
    return;
  }

  updateTournamentStatusBadge();
  renderFixturesView();
  renderStandingsView();
  renderTvMode();
  showToast(`¡Torneo "${name}" generado con éxito con ${tournamentState.matches.length} partidos!`, 'success');

  setTimeout(() => {
    switchTab('tab-fixtures');
  }, 350);
}

function openConfirmRegenerateModal() {
  if (dom.confirmRegenerateModal) {
    dom.confirmRegenerateModal.style.display = 'flex';
  }
}

function closeConfirmRegenerateModal() {
  if (dom.confirmRegenerateModal) {
    dom.confirmRegenerateModal.style.display = 'none';
  }
}

function initRegenerateModal() {
  if (dom.btnCancelRegenerateModal) {
    if (dom.btnCancelRegenerateModal) dom.btnCancelRegenerateModal.addEventListener('click', closeConfirmRegenerateModal);
  }
  if (dom.confirmRegenerateModal) {
    if (dom.confirmRegenerateModal) dom.confirmRegenerateModal.addEventListener('click', (e) => {
      if (e.target === dom.confirmRegenerateModal) closeConfirmRegenerateModal();
    });
  }
  if (dom.btnConfirmRegenerateAction) {
    if (dom.btnConfirmRegenerateAction) dom.btnConfirmRegenerateAction.addEventListener('click', () => {
      closeConfirmRegenerateModal();
      executeTournamentGeneration();
    });
  }
}

function handleResetTournament() {
  if (confirm('¿Estás seguro de que deseas reiniciar todos los datos del torneo? Esta acción no se puede deshacer.')) {
    resetTournamentFull();
  }
}

function resetTournamentFull() {
  tournamentState = {
    config: {
      name: 'Super Liga Pro 2026',
      description: '',
      sport: 'f11',
      format: 'league_single',
      matchDuration: 90,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      groupQualifiedCount: 2,
      hasThirdPlaceMatch: false,
      tiebreaker: 'dg',
      groupCount: 2
    },
    groups: {},
    teams: [],
    matches: [],
    currentTab: 'tab-config',
    activeSubTab: 'view-table',
    isGenerated: false,
    filters: {
      round: 'all',
      team: 'all',
      group: 'all',
      status: 'all',
      search: ''
    }
  };

  saveState();
  renderApp();
  showToast('Se han restablecido todos los datos del torneo', 'info');
}

function updateTournamentStatusBadge() {
  if (!dom.statusLabel) return;
  if (tournamentState.isGenerated) {
    dom.statusLabel.textContent = `Torneo Activo: ${tournamentState.config.name}`;
    dom.statusLabel.style.color = 'var(--accent-green)';
  } else {
    dom.statusLabel.textContent = 'Torneo en Preparación';
    dom.statusLabel.style.color = 'var(--text-secondary)';
  }
}

// =============================================================================
// 7. GESTOR DE FASE DE GRUPOS (SORTEO ALEATORIO Y MOVIMIENTO MANUAL)
// =============================================================================
const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function syncGroupsWithTeams() {
  const teams = tournamentState.teams || [];
  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);

  if (!tournamentState.groups || typeof tournamentState.groups !== 'object') {
    tournamentState.groups = {};
  }

  activeLetters.forEach(letter => {
    if (!Array.isArray(tournamentState.groups[letter])) {
      tournamentState.groups[letter] = [];
    }
  });

  Object.keys(tournamentState.groups).forEach(key => {
    if (!activeLetters.includes(key)) {
      const orphanedTeams = tournamentState.groups[key];
      delete tournamentState.groups[key];
      if (Array.isArray(orphanedTeams)) {
        tournamentState.groups[activeLetters[0]].push(...orphanedTeams);
      }
    }
  });

  const existingTeamIds = new Set(teams.map(t => t.id));
  activeLetters.forEach(letter => {
    tournamentState.groups[letter] = tournamentState.groups[letter].filter(id => existingTeamIds.has(id));
  });

  const assignedTeamIds = new Set();
  activeLetters.forEach(letter => {
    tournamentState.groups[letter].forEach(id => assignedTeamIds.add(id));
  });

  const unassignedTeams = teams.filter(t => !assignedTeamIds.has(t.id));
  if (unassignedTeams.length > 0) {
    unassignedTeams.forEach((team) => {
      let minGroup = activeLetters[0];
      let minCount = tournamentState.groups[minGroup].length;
      activeLetters.forEach(l => {
        if (tournamentState.groups[l].length < minCount) {
          minCount = tournamentState.groups[l].length;
          minGroup = l;
        }
      });
      tournamentState.groups[minGroup].push(team.id);
    });
  }

  saveState();
}

function redistributeTeamsEqually() {
  const teams = tournamentState.teams || [];
  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);

  tournamentState.groups = {};
  activeLetters.forEach(l => {
    tournamentState.groups[l] = [];
  });

  teams.forEach((team, index) => {
    const targetGroup = activeLetters[index % groupCount];
    tournamentState.groups[targetGroup].push(team.id);
  });

  saveState();
}

function handleRandomDraw() {
  const teams = [...tournamentState.teams];
  if (teams.length < 2) {
    showToast('Registra al menos 2 equipos para realizar el sorteo', 'warning');
    return;
  }

  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);

  // Fisher-Yates shuffle
  for (let i = teams.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [teams[i], teams[j]] = [teams[j], teams[i]];
  }

  tournamentState.groups = {};
  activeLetters.forEach(l => {
    tournamentState.groups[l] = [];
  });

  teams.forEach((team, index) => {
    const targetGroup = activeLetters[index % groupCount];
    tournamentState.groups[targetGroup].push(team.id);
  });

  saveState();
  renderGroupsDistribution();
  showToast('¡Sorteo aleatorio de grupos completado!', 'success');
}

function moveTeamToGroup(teamId, targetGroup) {
  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);

  if (!activeLetters.includes(targetGroup)) return;

  activeLetters.forEach(letter => {
    tournamentState.groups[letter] = tournamentState.groups[letter].filter(id => id !== teamId);
  });

  if (!tournamentState.groups[targetGroup].includes(teamId)) {
    tournamentState.groups[targetGroup].push(teamId);
  }

  saveState();
  renderGroupsDistribution();

  const team = getTeamById(teamId);
  showToast(`Club "${team ? team.name : 'Equipo'}" movido al Grupo ${targetGroup}`, 'info', 2200);
}

function renderGroupsDistribution() {
  if (!dom.groupsDistributionBoard) return;

  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);

  if (activeLetters.length >= 4) {
    dom.groupsDistributionBoard.classList.add('cols-4');
  } else {
    dom.groupsDistributionBoard.classList.remove('cols-4');
  }

  let html = '';
  activeLetters.forEach(letter => {
    const teamIds = tournamentState.groups[letter] || [];
    const count = teamIds.length;

    let teamsListHtml = '';
    if (count === 0) {
      teamsListHtml = `<div style="text-align:center; padding:1.25rem; font-size:0.75rem; color:var(--text-muted);">Sin clubes asignados</div>`;
    } else {
      teamsListHtml = teamIds.map(id => {
        const team = getTeamById(id);
        if (!team) return '';

        const shieldEl = renderTeamShieldElement(team);
        
        let selectOptions = '';
        activeLetters.forEach(targetL => {
          selectOptions += `<option value="${targetL}" ${targetL === letter ? 'selected' : ''}>Mover a Grp ${targetL}</option>`;
        });

        return `
          <div class="group-team-item">
            <div class="group-team-left">
              <div style="width:24px; height:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                ${shieldEl}
              </div>
              <span class="group-team-name" title="${escapeHtml(team.name)}">${escapeHtml(team.name)}</span>
            </div>
            <select class="group-team-select" onchange="moveTeamToGroup('${escapeHtml(team.id)}', this.value)" title="Mover a otro grupo">
              ${selectOptions}
            </select>
          </div>
        `;
      }).join('');
    }

    html += `
      <div class="group-card-panel">
        <div class="group-card-header">
          <span class="group-title-tag">GRUPO ${letter}</span>
          <span class="group-teams-count-badge">${count} ${count === 1 ? 'club' : 'clubes'}</span>
        </div>
        <div class="group-teams-list">
          ${teamsListHtml}
        </div>
      </div>
    `;
  });

  dom.groupsDistributionBoard.innerHTML = html;
}

// =============================================================================
// 8. GESTIÓN PROFESIONAL DE EQUIPOS (CRUD, CSV, BUSCADOR Y ESCUDOS)
// =============================================================================
let currentUploadedShieldBase64 = '';

function initTeamManager() {
    const btnReqEntry = document.getElementById('btnRequestTournamentEntry');
  if (btnReqEntry) {
    btnReqEntry.addEventListener('click', () => {
      openRegisterTeamApplicationModal(activeTournamentId);
    });
  }

  if (dom.inputTeamColor) dom.inputTeamColor.addEventListener('input', (e) => {
    dom.colorPreview.style.backgroundColor = e.target.value;
  });

  if (dom.inputTeamName) dom.inputTeamName.addEventListener('input', (e) => {
    const name = e.target.value.trim();
    if (dom.previewInitials) {
      dom.previewInitials.textContent = name ? getClubInitials(name) : 'FC';
    }
  });

  if (dom.teamShieldFileInput) {
    if (dom.teamShieldFileInput) dom.teamShieldFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('El archivo seleccionado debe ser una imagen', 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        currentUploadedShieldBase64 = event.target.result;
        if (dom.colorPreview) {
          dom.colorPreview.innerHTML = `<img src="${currentUploadedShieldBase64}" alt="Escudo">`;
        }
        if (dom.teamShieldUploadText) {
          dom.teamShieldUploadText.textContent = '✓ Imagen lista';
        }
      };
      reader.readAsDataURL(file);
    });
  }

  if (dom.addTeamForm) dom.addTeamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamName = dom.inputTeamName.value.trim();
    const teamColor = dom.inputTeamColor.value;
    const shieldUrl = dom.teamShieldUrlInput ? dom.teamShieldUrlInput.value.trim() : '';
    const finalShield = currentUploadedShieldBase64 || shieldUrl || '';

    if (!teamName) {
      showToast('Escribe un nombre para el club', 'warning');
      dom.inputTeamName.focus();
      return;
    }

    const exists = tournamentState.teams.some(
      t => t.name.toLowerCase() === teamName.toLowerCase()
    );

    if (exists) {
      showToast(`Ya existe un equipo registrado con el nombre "${teamName}"`, 'warning');
      dom.inputTeamName.focus();
      return;
    }

    const newTeam = {
      id: `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: teamName,
      color: teamColor,
      shield: finalShield,
      players: []
    };

    tournamentState.teams.push(newTeam);
    syncGroupsWithTeams();
    saveState();

    dom.inputTeamName.value = '';
    if (dom.teamShieldUrlInput) dom.teamShieldUrlInput.value = '';
    if (dom.teamShieldFileInput) dom.teamShieldFileInput.value = '';
  if (dom.teamShieldUploadText) dom.teamShieldUploadText.textContent = 'Subir escudo';
    currentUploadedShieldBase64 = '';
    
    if (dom.previewInitials) dom.previewInitials.textContent = 'FC';
    dom.colorPreview.innerHTML = '<span id="previewInitials">FC</span>';

    renderTeams();
    renderGroupsDistribution();
    updateCounterBadges();
    showToast(`Club "${newTeam.name}" agregado con éxito`, 'success');
  });

  if (dom.btnLoadDemo) dom.btnLoadDemo.addEventListener('click', () => {
    loadDemoTeams();
  });

  if (dom.btnClearTeams) dom.btnClearTeams.addEventListener('click', () => {
    openConfirmClearModal();
  });

  if (dom.btnCancelClearModal) {
    if (dom.btnCancelClearModal) dom.btnCancelClearModal.addEventListener('click', closeConfirmClearModal);
  }
  if (dom.confirmClearModal) {
    if (dom.confirmClearModal) dom.confirmClearModal.addEventListener('click', (e) => {
      if (e.target === dom.confirmClearModal) closeConfirmClearModal();
    });
  }
  if (dom.btnConfirmClearModal) {
    if (dom.btnConfirmClearModal) dom.btnConfirmClearModal.addEventListener('click', () => {
      closeConfirmClearModal();
      clearAllTeamsConfirmed();
    });
  }

  if (dom.btnExportTeamsCsv) {
    if (dom.btnExportTeamsCsv) dom.btnExportTeamsCsv.addEventListener('click', exportTeamsToCsv);
  }
  if (dom.btnImportTeamsCsv && dom.importTeamsCsvInput) {
    if (dom.btnImportTeamsCsv) dom.btnImportTeamsCsv.addEventListener('click', () => {
      dom.importTeamsCsvInput.click();
    });
    if (dom.importTeamsCsvInput) dom.importTeamsCsvInput.addEventListener('change', handleImportTeamsCsv);
  }

  if (dom.searchTeamInput) {
    if (dom.searchTeamInput) dom.searchTeamInput.addEventListener('input', (e) => {
      tournamentState.filters.teamSearch = e.target.value.toLowerCase().trim();
      renderTeams();
    });
  }
}

function openConfirmClearModal() {
  if (tournamentState.teams.length === 0) {
    showToast('La lista de equipos ya está vacía', 'info');
    return;
  }
  if (dom.confirmClearModal) {
    dom.confirmClearModal.style.display = 'flex';
  }
}

function closeConfirmClearModal() {
  if (dom.confirmClearModal) {
    dom.confirmClearModal.style.display = 'none';
  }
}

function clearAllTeamsConfirmed() {
  tournamentState.teams = [];
  tournamentState.groups = {};
  tournamentState.matches = [];
  tournamentState.isGenerated = false;
  saveState();

  renderTeams();
  renderGroupsDistribution();
  updateCounterBadges();
  renderFixturesView();
  renderStandingsView();
  renderTvMode();
  updateTournamentStatusBadge();
  showToast('Se han vaciado todos los equipos y reiniciado el torneo', 'info');
}

function loadDemoTeams() {
  const existingNames = new Set(tournamentState.teams.map(t => t.name.toLowerCase()));
  let addedCount = 0;

  DEMO_TEAMS.forEach(demo => {
    if (!existingNames.has(demo.name.toLowerCase())) {
      tournamentState.teams.push({
        ...demo,
        id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      });
      existingNames.add(demo.name.toLowerCase());
      addedCount++;
    }
  });

  syncGroupsWithTeams();
  saveState();
  renderTeams();
  renderGroupsDistribution();
  updateCounterBadges();

  if (addedCount > 0) {
    showToast(`Se cargaron ${addedCount} equipos oficiales de demostración`, 'success');
  } else {
    showToast('Los equipos de prueba ya se encuentran agregados', 'info');
  }
}

function updateCounterBadges() {
  const count = tournamentState.teams.length;
  if (dom.teamsCount) dom.teamsCount.textContent = count;
  
  if (dom.requirementBadge) {
    if (count < 4) {
      const missing = 4 - count;
      dom.requirementBadge.textContent = `Faltan ${missing} ${missing === 1 ? 'equipo' : 'equipos'} para iniciar`;
      dom.requirementBadge.className = 'requirement-badge missing';
    } else {
      dom.requirementBadge.textContent = `✓ Listo para generar (${count} equipos)`;
      dom.requirementBadge.className = 'requirement-badge complete';
    }
  }
}

function renderTeams() {
  if (!dom.teamsGrid || !dom.teamsEmptyState) return;
  const teams = tournamentState.teams || [];
  if (!tournamentState.filters) tournamentState.filters = {};
  const searchTerm = tournamentState.filters.teamSearch || '';

  updateCounterBadges();

  if (teams.length === 0) {
    dom.teamsEmptyState.style.display = 'block';
    if (dom.teamsSearchEmptyState) dom.teamsSearchEmptyState.style.display = 'none';
    dom.teamsGrid.innerHTML = '';
    return;
  }

  dom.teamsEmptyState.style.display = 'none';

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm)
  );

  if (filteredTeams.length === 0 && searchTerm) {
    if (dom.teamsSearchEmptyState) dom.teamsSearchEmptyState.style.display = 'block';
    dom.teamsGrid.innerHTML = '';
    return;
  }

  if (dom.teamsSearchEmptyState) dom.teamsSearchEmptyState.style.display = 'none';

  const html = filteredTeams.map(team => {
    const shieldHtml = renderTeamShieldElement(team);
    const playersCount = Array.isArray(team.players) ? team.players.length : 0;
    const playersTag = playersCount > 0 
        ? `<span class="team-players-tag" title="${escapeHtml(team.players.join(', '))}">⚽ ${playersCount} jugadores</span>`
      : '';

    return `
      <div class="team-card" data-team-id="${escapeHtml(team.id)}">
        <div class="team-info">
          <div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            ${shieldHtml}
          </div>
          <div class="team-details">
            <span class="team-name" title="${escapeHtml(team.name)}">${escapeHtml(team.name)}</span>
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span class="team-color-dot" style="background-color: ${escapeHtml(team.color)};" title="Color: ${escapeHtml(team.color)}"></span>
              <span class="team-color-hex">${escapeHtml(team.color)}</span>
              ${playersTag}
            </div>
          </div>
        </div>
        <div class="team-actions">
          <button 
            type="button" 
            class="btn-icon-action edit" 
            onclick="openEditModal('')" 
            title="Editar club y escudo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button 
            type="button" 
            class="btn-icon-action delete" 
            onclick="deleteTeam('')" 
            title="Eliminar club"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  dom.teamsGrid.innerHTML = html;
}

window.deleteTeam = function(teamId) {
  const team = tournamentState.teams.find(t => t.id === teamId);
  const teamName = team ? team.name : 'Equipo';

  tournamentState.teams = tournamentState.teams.filter(t => t.id !== teamId);
  syncGroupsWithTeams();
  saveState();

  renderTeams();
  renderGroupsDistribution();
  updateCounterBadges();

  if (tournamentState.isGenerated) {
    showToast(`Club "${teamName}" eliminado. Se recomienda regenerar el fixture.`, 'warning', 4000);
  } else {
    showToast(`Club "${teamName}" eliminado`, 'info');
  }
};

// =============================================================================
// 9. IMPORTACIÓN Y EXPORTACIÓN CSV DE EQUIPOS
// =============================================================================

function exportTeamsToCsv() {
  const teams = tournamentState.teams || [];
  if (teams.length === 0) {
    showToast('No hay equipos registrados para exportar', 'warning');
    return;
  }

  const header = ['Nombre', 'Color', 'EscudoURL', 'Jugadores'];
  const rows = teams.map(t => {
    const name = `"${(t.name || '').replace(/"/g, '""')}"`;
    const color = `"${(t.color || '#10b981').replace(/"/g, '""')}"`;
    const shield = (t.shield && !t.shield.startsWith('data:')) ? `"${t.shield.replace(/"/g, '""')}"` : '""';
    const players = Array.isArray(t.players) ? `"${t.players.join('; ').replace(/"/g, '""')}"` : '""';
    return [name, color, shield, players].join(',');
  });

  const csvContent = '\uFEFF' + [header.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `equipos_${(tournamentState.config.name || 'torneo').toLowerCase().replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast(`${teams.length} equipos exportados exitosamente a CSV`, 'success');
}

function handleImportTeamsCsv(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    parseAndImportTeamsCsv(text);
    e.target.value = '';
  };
  reader.readAsText(file);
}

function parseAndImportTeamsCsv(csvText) {
  if (!csvText || !csvText.trim()) {
    showToast('El archivo CSV está vacío', 'error');
    return;
  }

  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length <= 1) {
    showToast('El CSV debe contener un encabezado y al menos una fila con datos', 'warning');
    return;
  }

  const dataRows = lines.slice(1);
  let importedCount = 0;
  let skippedDuplicates = 0;
  let errorRows = 0;

  const existingNames = new Set(tournamentState.teams.map(t => t.name.toLowerCase()));

  dataRows.forEach((row) => {
    const cols = parseCsvLine(row);
    if (cols.length === 0 || !cols[0] || !cols[0].trim()) {
      errorRows++;
      return;
    }

    const name = cols[0].trim();
    let color = cols[1] ? cols[1].trim() : '#10b981';
    if (!/^#[0-9A-F]{6}$/i.test(color) && !/^#[0-9A-F]{3}$/i.test(color)) {
      color = '#10b981';
    }

    const shieldUrl = cols[2] ? cols[2].trim() : '';
    const rawPlayers = cols[3] ? cols[3].trim() : '';
    const players = rawPlayers ? rawPlayers.split(/[;,]/).map(p => p.trim()).filter(Boolean) : [];

    if (existingNames.has(name.toLowerCase())) {
      skippedDuplicates++;
      return;
    }

    tournamentState.teams.push({
      id: `team-csv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name,
      color: color,
      shield: shieldUrl,
      players: players
    });

    existingNames.add(name.toLowerCase());
    importedCount++;
  });

  syncGroupsWithTeams();
  saveState();
  renderTeams();
  renderGroupsDistribution();
  updateCounterBadges();

  if (importedCount > 0) {
  showToast(`Se importaron ${importedCount} equipos correctamente.${skippedDuplicates > 0 ? ` (${skippedDuplicates} omitidos por nombre duplicado)` : ''}`, 'success', 4000);
  } else if (skippedDuplicates > 0) {
    showToast(`No se importaron equipos: los ${skippedDuplicates} clubes ya existen`, 'warning', 3500);
  } else {
    showToast('No se pudieron leer filas válidas en el CSV', 'error');
  }
}

function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

// =============================================================================
// 9. MODAL DE EDICIÓN DE EQUIPOS
// =============================================================================
let currentEditUploadedBase64 = '';

function initEditModal() {
  const closeModal = () => {
    dom.editModal.style.display = 'none';
    currentEditUploadedBase64 = '';
  };

  if (dom.btnCancelEdit) dom.btnCancelEdit.addEventListener('click', closeModal);
  if (dom.btnCancelEdit2) dom.btnCancelEdit2.addEventListener('click', closeModal);

  if (dom.editModal) dom.editModal.addEventListener('click', (e) => {
    if (e.target === dom.editModal) closeModal();
  });

  if (dom.editTeamColor) dom.editTeamColor.addEventListener('input', (e) => {
    dom.editColorCode.textContent = e.target.value;
    dom.editShieldPreview.style.backgroundColor = e.target.value;
  });

  if (dom.editTeamName) dom.editTeamName.addEventListener('input', (e) => {
    const initials = getClubInitials(e.target.value.trim());
    if (dom.editPreviewInitials) dom.editPreviewInitials.textContent = initials;
  });

  if (dom.editShieldFileInput) {
    if (dom.editShieldFileInput) dom.editShieldFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        currentEditUploadedBase64 = event.target.result;
        dom.editShieldPreview.innerHTML = `<img src="${currentEditUploadedBase64}" alt="Escudo">`;
      };
      reader.readAsDataURL(file);
    });
  }

  if (dom.editForm) dom.editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = dom.editTeamId.value;
    const newName = dom.editTeamName.value.trim();
    const newColor = dom.editTeamColor.value;
    const shieldUrl = dom.editShieldUrl ? dom.editShieldUrl.value.trim() : '';
    const rawPlayers = dom.editTeamPlayers ? dom.editTeamPlayers.value.trim() : '';
    const players = rawPlayers ? rawPlayers.split(/[;,]/).map(p => p.trim()).filter(Boolean) : [];

    if (!newName) {
      showToast('El nombre no puede estar vacío', 'warning');
      return;
    }

    const existsOther = tournamentState.teams.some(
      t => t.id !== id && t.name.toLowerCase() === newName.toLowerCase()
    );

    if (existsOther) {
      showToast(`Ya existe otro club registrado con el nombre "${newName}"`, 'warning');
      dom.editTeamName.focus();
      return;
    }

    const teamIndex = tournamentState.teams.findIndex(t => t.id === id);
    if (teamIndex !== -1) {
      const targetTeam = tournamentState.teams[teamIndex];
      targetTeam.name = newName;
      targetTeam.color = newColor;

      if (currentEditUploadedBase64) {
        targetTeam.shield = currentEditUploadedBase64;
      } else if (shieldUrl) {
        targetTeam.shield = shieldUrl;
      }

      targetTeam.players = players;

      saveState();
      renderTeams();
      renderGroupsDistribution();
      renderFixturesList();
      renderStandingsView();
      renderTvMode();
      closeModal();
      showToast(`Club "${newName}" actualizado correctamente`, 'success');
    }
  });
}

window.openEditModal = function(teamId) {
  const team = tournamentState.teams.find(t => t.id === teamId);
  if (!team) return;

  dom.editTeamId.value = team.id;
  dom.editTeamName.value = team.name;
  dom.editTeamColor.value = team.color;
  dom.editColorCode.textContent = team.color;
  if (dom.editShieldUrl) dom.editShieldUrl.value = (team.shield && !team.shield.startsWith('data:')) ? team.shield : '';
  if (dom.editTeamPlayers) dom.editTeamPlayers.value = Array.isArray(team.players) ? team.players.join(', ') : '';

  dom.editShieldPreview.style.backgroundColor = team.color;
  if (team.shield) {
    dom.editShieldPreview.innerHTML = `<img src="${escapeHtml(team.shield)}" alt="Escudo">`;
  } else {
    dom.editShieldPreview.innerHTML = `<span id="editPreviewInitials">${escapeHtml(getClubInitials(team.name))}</span>`;
  }

  currentEditUploadedBase64 = '';
  dom.editModal.style.display = 'flex';
  dom.editTeamName.focus();
};

// =============================================================================
// 10. MOTOR GENERADOR DETERMINISTA DE PARTIDOS (ROUND-ROBIN, KNOCKOUT & GRUPOS)
// =============================================================================

function generateFixtures() {
  const teams = [...tournamentState.teams];
  if (teams.length < 4) return false;

  const format = tournamentState.config.format || 'league_single';
  let matches = [];

  if (format === 'league_single') {
    matches = generateRoundRobinMatches(teams, 'single');
  } else if (format === 'league_double') {
    matches = generateRoundRobinMatches(teams, 'home_away');
  } else if (format === 'knockout') {
    matches = generateKnockoutMatches(teams);
  } else if (format === 'groups_semis') {
    matches = generateGroupStageMatches(teams, 'single', true);
  } else {
    matches = generateGroupStageMatches(teams, 'single', false);
  }

  applyAutoScheduleToMatches(matches, { isDefault: true });

  tournamentState.matches = matches;
  tournamentState.isGenerated = true;

  if (format === 'groups_playoffs' || format === 'groups_semis') {
    updateGroupPlayoffSlots();
  }

  saveState();
  return true;
}

function generateRoundRobinMatches(teamsList, matchType, customGroupName = null) {
  const matches = [];
  const teams = [...teamsList];
  const isOdd = teams.length % 2 !== 0;

  if (isOdd) {
    teams.push({ id: '__BYE__', name: 'Descanso (Bye)', isBye: true, color: '#64748b' });
  }

  const numTeams = teams.length;
  const totalRoundsSingle = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  // Primera Vuelta (Ida)
  for (let round = 0; round < totalRoundsSingle; round++) {
    const roundNumber = round + 1;
    const roundName = customGroupName ? `${customGroupName} - Jornada ${roundNumber}` : `Jornada ${roundNumber}`;

    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      let home = teams[matchIdx];
      let away = teams[numTeams - 1 - matchIdx];

      if (matchIdx === 0 && round % 2 === 1) {
        const temp = home;
        home = away;
        away = temp;
      }

      const hasBye = (home.isBye || away.isBye);
      const byeTeam = home.isBye ? away : (away.isBye ? home : null);

      matches.push({
        id: `match-r${roundNumber}-m${matchIdx + 1}${customGroupName ? '-' + customGroupName.replace(/\s+/g, '') : ''}`,
        round: roundNumber,
        roundName: roundName,
        groupName: customGroupName || '',
        group: customGroupName ? customGroupName.replace('Grupo ', '').trim() : null,
        leg: 1,
        homeTeamId: home.isBye ? null : home.id,
        awayTeamId: away.isBye ? null : away.id,
        homeTeamPlaceholder: home.name,
        awayTeamPlaceholder: away.name,
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        isBye: hasBye,
        byeTeamId: byeTeam ? byeTeam.id : null,
        isKnockout: false,
        scorers: [],
        date: '',
        time: '',
        venue: '',
        referee: ''
      });
    }

    const fixed = teams[0];
    const rest = teams.slice(1);
    const last = rest.pop();
    rest.unshift(last);
    teams.splice(0, teams.length, fixed, ...rest);
  }

  // Segunda Vuelta (Vuelta)
  if (matchType === 'home_away') {
    const firstLegMatches = [...matches];
    firstLegMatches.forEach(m => {
      const returnRoundNumber = m.round + totalRoundsSingle;
      const returnRoundName = customGroupName 
        ? `${customGroupName} - Jornada ${returnRoundNumber} (Vuelta)` 
        : `Jornada ${returnRoundNumber} (Vuelta)`;

      matches.push({
        id: `match-r${returnRoundNumber}-${m.id.split('-')[2] || m.id}${customGroupName ? '-' + customGroupName.replace(/\s+/g, '') : ''}`,
        round: returnRoundNumber,
        roundName: returnRoundName,
        groupName: customGroupName || '',
        group: m.group,
        leg: 2,
        homeTeamId: m.awayTeamId,
        awayTeamId: m.homeTeamId,
        homeTeamPlaceholder: m.awayTeamPlaceholder,
        awayTeamPlaceholder: m.homeTeamPlaceholder,
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        isBye: m.isBye,
        byeTeamId: m.byeTeamId,
        isKnockout: false,
        scorers: [],
        date: '',
        time: '',
        venue: '',
        referee: ''
      });
    });
  }

  return matches;
}

function generateKnockoutMatches(teamsList) {
  const matches = [];
  const N = teamsList.length;
  if (N < 2) return [];

  const P = Math.pow(2, Math.ceil(Math.log2(Math.max(4, N))));
  const hasThirdPlace = !!tournamentState.config.hasThirdPlaceMatch;
  const totalRounds = Math.log2(P);

  function getRoundTitle(roundIndex, matchesInRound) {
    if (matchesInRound === 1) return 'Gran Final 🏆';
    if (matchesInRound === 2) return 'Semifinales';
    if (matchesInRound === 4) return 'Cuartos de Final';
    if (matchesInRound === 8) return 'Octavos de Final';
    if (matchesInRound === 16) return 'Dieciseisavos de Final';
    return `Ronda ${roundIndex + 1}`;
  }

  const roundMatches = [];

  for (let r = 0; r < totalRounds; r++) {
    const matchesCount = P / Math.pow(2, r + 1);
    const roundTitle = getRoundTitle(r, matchesCount);
    roundMatches[r] = [];

    for (let m = 0; m < matchesCount; m++) {
      const matchId = `ko-r${r + 1}-m${m + 1}`;
      roundMatches[r].push({
        id: matchId,
        round: r + 1,
        roundName: roundTitle,
        isKnockout: true,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamPlaceholder: 'Por definir',
        awayTeamPlaceholder: 'Por definir',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        isBye: false,
        byeTeamId: null,
        scorers: [],
        date: '',
        time: '',
        venue: '',
        referee: '',
        nextMatchId: null,
        nextSlot: null,
        loserMatchId: null,
        loserSlot: null
      });
    }
  }

  for (let r = 0; r < totalRounds - 1; r++) {
    const currentMatches = roundMatches[r];
    const nextMatches = roundMatches[r + 1];

    currentMatches.forEach((match, idx) => {
      const parentIdx = Math.floor(idx / 2);
      match.nextMatchId = nextMatches[parentIdx].id;
      match.nextSlot = (idx % 2 === 0) ? 'home' : 'away';
      match.homeTeamPlaceholder = `Ganador ${match.roundName} #${idx + 1}`;
      match.awayTeamPlaceholder = `Ganador ${match.roundName} #${idx + 1}`;
    });
  }

  if (hasThirdPlace && totalRounds >= 2) {
    const semiRound = roundMatches[totalRounds - 2];
    const thirdPlaceMatch = {
      id: 'ko-third-place',
      round: totalRounds,
      roundName: 'Partido por el 3.º Puesto',
      isKnockout: true,
      homeTeamId: null,
      awayTeamId: null,
      homeTeamPlaceholder: 'Perdedor Semifinal 1',
      awayTeamPlaceholder: 'Perdedor Semifinal 2',
      homeScore: null,
      awayScore: null,
      homePenalties: null,
      awayPenalties: null,
      status: 'pending',
      isFinished: false,
      isLocked: false,
      isBye: false,
      byeTeamId: null,
      scorers: [],
      date: '',
      time: '',
      venue: '',
      referee: ''
    };

    if (semiRound.length >= 2) {
      semiRound[0].loserMatchId = 'ko-third-place';
      semiRound[0].loserSlot = 'home';
      semiRound[1].loserMatchId = 'ko-third-place';
      semiRound[1].loserSlot = 'away';
    }

    roundMatches[totalRounds - 1].push(thirdPlaceMatch);
  }

  const slots = new Array(P).fill(null);
  for (let i = 0; i < N; i++) {
    slots[i] = teamsList[i];
  }

  const round1Matches = roundMatches[0];
  for (let m = 0; m < round1Matches.length; m++) {
    const homeTeam = slots[2 * m];
    const awayTeam = slots[2 * m + 1];
    const match = round1Matches[m];

    if (homeTeam && awayTeam) {
      match.homeTeamId = homeTeam.id;
      match.awayTeamId = awayTeam.id;
      match.homeTeamPlaceholder = homeTeam.name;
      match.awayTeamPlaceholder = awayTeam.name;
    } else if (homeTeam && !awayTeam) {
      match.homeTeamId = homeTeam.id;
      match.awayTeamId = null;
      match.homeTeamPlaceholder = homeTeam.name;
      match.awayTeamPlaceholder = 'Pase Directo (Bye)';
      match.isBye = true;
      match.byeTeamId = homeTeam.id;
      match.isFinished = true;
      match.status = 'finished';
      match.homeScore = 1;
      match.awayScore = 0;

      if (match.nextMatchId && roundMatches[1]) {
        const nextMatch = roundMatches[1].find(nm => nm.id === match.nextMatchId);
        if (nextMatch) {
          if (match.nextSlot === 'home') {
            nextMatch.homeTeamId = homeTeam.id;
            nextMatch.homeTeamPlaceholder = homeTeam.name;
          } else {
            nextMatch.awayTeamId = homeTeam.id;
            nextMatch.awayTeamPlaceholder = homeTeam.name;
          }
        }
      }
    } else if (!homeTeam && awayTeam) {
      match.homeTeamId = null;
      match.awayTeamId = awayTeam.id;
      match.homeTeamPlaceholder = 'Pase Directo (Bye)';
      match.awayTeamPlaceholder = awayTeam.name;
      match.isBye = true;
      match.byeTeamId = awayTeam.id;
      match.isFinished = true;
      match.status = 'finished';
      match.homeScore = 0;
      match.awayScore = 1;

      if (match.nextMatchId && roundMatches[1]) {
        const nextMatch = roundMatches[1].find(nm => nm.id === match.nextMatchId);
        if (nextMatch) {
          if (match.nextSlot === 'home') {
            nextMatch.homeTeamId = awayTeam.id;
            nextMatch.homeTeamPlaceholder = awayTeam.name;
          } else {
            nextMatch.awayTeamId = awayTeam.id;
            nextMatch.awayTeamPlaceholder = awayTeam.name;
          }
        }
      }
    }
  }

  roundMatches.forEach(r => matches.push(...r));
  return matches;
}

function generateGroupStageMatches(teamsList, matchType) {
  const matches = [];
  syncGroupsWithTeams();

  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);
  const qualCount = tournamentState.config.groupQualifiedCount || 2;
  const hasThirdPlace = !!tournamentState.config.hasThirdPlaceMatch;

  activeLetters.forEach(letter => {
    const teamIds = tournamentState.groups[letter] || [];
    const groupTeams = teamIds.map(id => getTeamById(id)).filter(Boolean);
    if (groupTeams.length >= 2) {
      const groupMatches = generateRoundRobinMatches(groupTeams, matchType, `Grupo ${letter}`);
      matches.push(...groupMatches);
    }
  });

  const maxGroupRound = Math.max(...matches.map(m => m.round || 1), 1);

  if (groupCount === 2) {
    if (qualCount === 1) {
      matches.push({
        id: 'grp-final',
        round: maxGroupRound + 1,
        roundName: 'Gran Final 🏆',
        isKnockout: true,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamPlaceholder: '1º Grupo A',
        awayTeamPlaceholder: '1º Grupo B',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        scorers: [],
        date: '', time: '', venue: '', referee: ''
      });

      if (hasThirdPlace) {
        matches.push({
          id: 'grp-third-place',
          round: maxGroupRound + 1,
      roundName: 'Partido por el 3.º Puesto',
          isKnockout: true,
          homeTeamId: null,
          awayTeamId: null,
          homeTeamPlaceholder: '2º Grupo A',
          awayTeamPlaceholder: '2º Grupo B',
          homeScore: null,
          awayScore: null,
          homePenalties: null,
          awayPenalties: null,
          status: 'pending',
          isFinished: false,
          isLocked: false,
          scorers: [],
          date: '', time: '', venue: '', referee: ''
        });
      }
    } else {
      matches.push({
        id: 'grp-semi-1',
        round: maxGroupRound + 1,
        roundName: 'Semifinal 1 (1ºA vs 2ºB)',
        isKnockout: true,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamPlaceholder: '1º Grupo A',
        awayTeamPlaceholder: '2º Grupo B',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        nextMatchId: 'grp-final',
        nextSlot: 'home',
        loserMatchId: hasThirdPlace ? 'grp-third-place' : null,
        loserSlot: 'home',
        scorers: [],
        date: '', time: '', venue: '', referee: ''
      });

      matches.push({
        id: 'grp-semi-2',
        round: maxGroupRound + 1,
        roundName: 'Semifinal 2 (1ºB vs 2ºA)',
        isKnockout: true,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamPlaceholder: '1º Grupo B',
        awayTeamPlaceholder: '2º Grupo A',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        nextMatchId: 'grp-final',
        nextSlot: 'away',
        loserMatchId: hasThirdPlace ? 'grp-third-place' : null,
        loserSlot: 'away',
        scorers: [],
        date: '', time: '', venue: '', referee: ''
      });

      if (hasThirdPlace) {
        matches.push({
          id: 'grp-third-place',
          round: maxGroupRound + 2,
      roundName: 'Partido por el 3.º Puesto',
          isKnockout: true,
          homeTeamId: null,
          awayTeamId: null,
          homeTeamPlaceholder: 'Perdedor Semi 1',
          awayTeamPlaceholder: 'Perdedor Semi 2',
          homeScore: null,
          awayScore: null,
          homePenalties: null,
          awayPenalties: null,
          status: 'pending',
          isFinished: false,
          isLocked: false,
          scorers: [],
          date: '', time: '', venue: '', referee: ''
        });
      }

      matches.push({
        id: 'grp-final',
        round: maxGroupRound + 2,
        roundName: 'Gran Final 🏆',
        isKnockout: true,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamPlaceholder: 'Ganador Semi 1',
        awayTeamPlaceholder: 'Ganador Semi 2',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        scorers: [],
        date: '', time: '', venue: '', referee: ''
      });
    }
  } else if (groupCount >= 4) {
    matches.push({
      id: 'grp-qf-1',
      round: maxGroupRound + 1,
      roundName: 'Cuartos 1 (1ºA vs 2ºB)',
      isKnockout: true,
      homeTeamId: null, awayTeamId: null,
      homeTeamPlaceholder: '1º Grupo A', awayTeamPlaceholder: '2º Grupo B',
      nextMatchId: 'grp-semi-1', nextSlot: 'home',
      homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
    });

    matches.push({
      id: 'grp-qf-2',
      round: maxGroupRound + 1,
      roundName: 'Cuartos 2 (1ºC vs 2ºD)',
      isKnockout: true,
      homeTeamId: null, awayTeamId: null,
      homeTeamPlaceholder: '1º Grupo C', awayTeamPlaceholder: '2º Grupo D',
      nextMatchId: 'grp-semi-1', nextSlot: 'away',
      homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
    });

    matches.push({
      id: 'grp-qf-3',
      round: maxGroupRound + 1,
      roundName: 'Cuartos 3 (1ºB vs 2ºA)',
      isKnockout: true,
      homeTeamId: null, awayTeamId: null,
      homeTeamPlaceholder: '1º Grupo B', awayTeamPlaceholder: '2º Grupo A',
      nextMatchId: 'grp-semi-2', nextSlot: 'home',
      homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
    });

    matches.push({
      id: 'grp-qf-4',
      round: maxGroupRound + 1,
      roundName: 'Cuartos 4 (1ºD vs 2ºC)',
      isKnockout: true,
      homeTeamId: null, awayTeamId: null,
      homeTeamPlaceholder: '1º Grupo D', awayTeamPlaceholder: '2º Grupo C',
      nextMatchId: 'grp-semi-2', nextSlot: 'away',
      homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
    });

    matches.push({
      id: 'grp-semi-1',
      round: maxGroupRound + 2,
      roundName: 'Semifinal 1',
      isKnockout: true,
      homeTeamId: null, awayTeamId: null,
      homeTeamPlaceholder: 'Ganador Cuartos 1', awayTeamPlaceholder: 'Ganador Cuartos 2',
      nextMatchId: 'grp-final', nextSlot: 'home',
      loserMatchId: hasThirdPlace ? 'grp-third-place' : null, loserSlot: 'home',
      homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
    });

    matches.push({
      id: 'grp-semi-2',
      round: maxGroupRound + 2,
      roundName: 'Semifinal 2',
      isKnockout: true,
      homeTeamId: null, awayTeamId: null,
      homeTeamPlaceholder: 'Ganador Cuartos 3', awayTeamPlaceholder: 'Ganador Cuartos 4',
      nextMatchId: 'grp-final', nextSlot: 'away',
      loserMatchId: hasThirdPlace ? 'grp-third-place' : null, loserSlot: 'away',
      homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
    });

    if (hasThirdPlace) {
      matches.push({
        id: 'grp-third-place',
        round: maxGroupRound + 3,
      roundName: 'Partido por el 3.º Puesto',
        isKnockout: true,
        homeTeamId: null, awayTeamId: null,
        homeTeamPlaceholder: 'Perdedor Semi 1', awayTeamPlaceholder: 'Perdedor Semi 2',
        homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
      });
    }

    matches.push({
      id: 'grp-final',
      round: maxGroupRound + 3,
      roundName: 'Gran Final 🏆',
      isKnockout: true,
      homeTeamId: null, awayTeamId: null,
      homeTeamPlaceholder: 'Ganador Semi 1', awayTeamPlaceholder: 'Ganador Semi 2',
      homeScore: null, awayScore: null, status: 'pending', isFinished: false, isLocked: false, scorers: []
    });
  }

  return matches;
}

function updateGroupPlayoffSlots() {
  const format = tournamentState.config.format;
  if (format !== 'groups_playoffs' && format !== 'groups_semis') return;

  const matches = tournamentState.matches || [];
  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);

  const groupStandingsMap = {};
  activeLetters.forEach(letter => {
    groupStandingsMap[letter] = calculateGroupStandings(letter);
  });

  if (groupCount === 2) {
    const sA = groupStandingsMap['A'] || [];
    const sB = groupStandingsMap['B'] || [];

    const semi1 = matches.find(m => m.id === 'grp-semi-1');
    const semi2 = matches.find(m => m.id === 'grp-semi-2');
    const finalMatch = matches.find(m => m.id === 'grp-final');

    if (semi1 && semi2) {
      if (sA[0]) {
        semi1.homeTeamId = sA[0].teamId;
        semi1.homeTeamPlaceholder = `1º Grp A (${sA[0].name})`;
      }
      if (sB[1]) {
        semi1.awayTeamId = sB[1].teamId;
        semi1.awayTeamPlaceholder = `2º Grp B (${sB[1].name})`;
      }

      if (sB[0]) {
        semi2.homeTeamId = sB[0].teamId;
        semi2.homeTeamPlaceholder = `1º Grp B (${sB[0].name})`;
      }
      if (sA[1]) {
        semi2.awayTeamId = sA[1].teamId;
        semi2.awayTeamPlaceholder = `2º Grp A (${sA[1].name})`;
      }
    } else if (finalMatch && tournamentState.config.groupQualifiedCount === 1) {
      if (sA[0]) {
        finalMatch.homeTeamId = sA[0].teamId;
        finalMatch.homeTeamPlaceholder = `1º Grp A (${sA[0].name})`;
      }
      if (sB[0]) {
        finalMatch.awayTeamId = sB[0].teamId;
        finalMatch.awayTeamPlaceholder = `1º Grp B (${sB[0].name})`;
      }
    }
  } else if (groupCount >= 4) {
    const sA = groupStandingsMap['A'] || [];
    const sB = groupStandingsMap['B'] || [];
    const sC = groupStandingsMap['C'] || [];
    const sD = groupStandingsMap['D'] || [];

    const qf1 = matches.find(m => m.id === 'grp-qf-1');
    const qf2 = matches.find(m => m.id === 'grp-qf-2');
    const qf3 = matches.find(m => m.id === 'grp-qf-3');
    const qf4 = matches.find(m => m.id === 'grp-qf-4');

    if (qf1 && sA[0] && sB[1]) {
      qf1.homeTeamId = sA[0].teamId;
      qf1.awayTeamId = sB[1].teamId;
    }
    if (qf2 && sC[0] && sD[1]) {
      qf2.homeTeamId = sC[0].teamId;
      qf2.awayTeamId = sD[1].teamId;
    }
    if (qf3 && sB[0] && sA[1]) {
      qf3.homeTeamId = sB[0].teamId;
      qf3.awayTeamId = sA[1].teamId;
    }
    if (qf4 && sD[0] && sC[1]) {
      qf4.homeTeamId = sD[0].teamId;
      qf4.awayTeamId = sC[1].teamId;
    }
  }
}

function applyAutoScheduleToMatches(matches, options = {}) {
  const cfg = tournamentState.config || {};

  // 1. Fechas y Días
  let startDateStr = options.startDate || cfg.startDate;
  if (!startDateStr) {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
    const nextSat = new Date(today);
    nextSat.setDate(today.getDate() + daysUntilSaturday);
    startDateStr = nextSat.toISOString().split('T')[0];
  }

  const allowedDays = (options.allowedDays && Array.isArray(options.allowedDays) && options.allowedDays.length > 0)
    ? options.allowedDays
    : ((cfg.allowedDays && Array.isArray(cfg.allowedDays) && cfg.allowedDays.length > 0) ? cfg.allowedDays : [6, 0]);

  let timeSlots = (options.timeSlots && Array.isArray(options.timeSlots) && options.timeSlots.length > 0)
    ? options.timeSlots
    : ((cfg.timeSlots && Array.isArray(cfg.timeSlots) && cfg.timeSlots.length > 0) ? cfg.timeSlots : ['08:00', '10:00', '16:00', '18:00', '20:00']);

  let venuesList = [];
  if (options.venues && Array.isArray(options.venues) && options.venues.length > 0) {
    venuesList = options.venues;
  } else if (cfg.assignedVenues && Array.isArray(cfg.assignedVenues) && cfg.assignedVenues.length > 0) {
    venuesList = cfg.assignedVenues;
  } else {
    const fmpVenues = getFmpVenues();
    venuesList = fmpVenues.slice(0, 4).map(v => v.nombre || v.name);
  }

  if (venuesList.length === 0) {
    venuesList = ['Cancha Sintética La 84', 'Complejo Deportivo Pibe Valderrama'];
  }

  // Generar fechas válidas
  const validDates = [];
  let curr = new Date(startDateStr + 'T00:00:00');
  let safety = 0;
  while (validDates.length < 120 && safety < 800) {
    if (allowedDays.includes(curr.getDay())) {
      validDates.push(curr.toISOString().split('T')[0]);
    }
    curr.setDate(curr.getDate() + 1);
    safety++;
  }
  if (validDates.length === 0) validDates.push(startDateStr);

  // Mapeos de Colisión CERO:
  // 1) Cancha ocupada: venue + '_' + date + '_' + slot
  // 2) Equipo jugando: teamId + '_' + date + '_' + slot
  const occupiedVenueSlots = new Set();
  const occupiedTeamSlots = new Set();

  const roundMap = {};
  matches.forEach(m => {
    const rKey = m.round || 1;
    if (!roundMap[rKey]) roundMap[rKey] = [];
    roundMap[rKey].push(m);
  });

  const roundKeys = Object.keys(roundMap).sort((a, b) => Number(a) - Number(b));
  let datePointer = 0;

  roundKeys.forEach((roundKey) => {
    const roundMatches = roundMap[roundKey];
    const playable = roundMatches.filter(m => !m.isBye && !m.isLocked && (options.isDefault || !m.isFinished));

    playable.forEach((match, mIdx) => {
      let assigned = false;
      let attempt = 0;
      let checkDateIdx = datePointer;
      let checkSlotIdx = 0;
      let checkVenueIdx = 0;

      while (!assigned && attempt < 300) {
        const testDate = validDates[checkDateIdx % validDates.length];
        const testSlot = timeSlots[checkSlotIdx % timeSlots.length];
        const testVenue = venuesList[checkVenueIdx % venuesList.length];

        const venueKey = `${testVenue}_${testDate}_${testSlot}`;
        const homeKey = match.homeTeamId ? `${match.homeTeamId}_${testDate}_${testSlot}` : null;
        const awayKey = match.awayTeamId ? `${match.awayTeamId}_${testDate}_${testSlot}` : null;

        const venueConflict = occupiedVenueSlots.has(venueKey);
        const teamConflict = (homeKey && occupiedTeamSlots.has(homeKey)) || (awayKey && occupiedTeamSlots.has(awayKey));

        if (!venueConflict && !teamConflict) {
          // Asignación garantizada sin colisiones
          match.date = testDate;
          match.time = testSlot;
          match.venue = testVenue;
          match.referee = REFEREES_POOL[mIdx % REFEREES_POOL.length];

          occupiedVenueSlots.add(venueKey);
          if (homeKey) occupiedTeamSlots.add(homeKey);
          if (awayKey) occupiedTeamSlots.add(awayKey);
          assigned = true;
        } else {
          // Probar siguiente cancha o franja
          checkVenueIdx++;
          if (checkVenueIdx >= venuesList.length) {
            checkVenueIdx = 0;
            checkSlotIdx++;
            if (checkSlotIdx >= timeSlots.length) {
              checkSlotIdx = 0;
              checkDateIdx++;
            }
          }
        }
        attempt++;
      }

      if (!assigned) {
        // Asignación de contingencia
        match.date = validDates[datePointer % validDates.length];
        match.time = timeSlots[0] || '09:00';
        match.venue = venuesList[0] || 'Cancha Principal';
      }
    });

    datePointer++;
  });
}


function initAutoScheduleModal() {
  if (dom.btnAutoFillSchedule) {
    if (dom.btnAutoFillSchedule) dom.btnAutoFillSchedule.addEventListener('click', openAutoScheduleModal);
  }
  if (dom.btnCloseAutoScheduleModal) {
    if (dom.btnCloseAutoScheduleModal) dom.btnCloseAutoScheduleModal.addEventListener('click', closeAutoScheduleModal);
  }
  if (dom.btnCancelAutoSchedule) {
    if (dom.btnCancelAutoSchedule) dom.btnCancelAutoSchedule.addEventListener('click', closeAutoScheduleModal);
  }
  if (dom.autoScheduleModal) {
    if (dom.autoScheduleModal) dom.autoScheduleModal.addEventListener('click', (e) => {
      if (e.target === dom.autoScheduleModal) closeAutoScheduleModal();
    });
  }
  if (dom.btnApplyAutoSchedule) {
    if (dom.btnApplyAutoSchedule) dom.btnApplyAutoSchedule.addEventListener('click', handleApplyAutoSchedule);
  }
}

function openAutoScheduleModal() {
  if (!tournamentState.matches || tournamentState.matches.length === 0) {
    showToast('Genera primero el fixture para poder distribuir los horarios', 'warning');
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dom.autoSchedStartDate && !dom.autoSchedStartDate.value) {
    dom.autoSchedStartDate.value = tournamentState.config.startDate || tomorrow.toISOString().split('T')[0];
  }

  if (dom.autoSchedInterval && tournamentState.config.matchDuration) {
    dom.autoSchedInterval.value = tournamentState.config.matchDuration;
  }

  if (dom.autoSchedVenues) {
    const currentAssigned = tournamentState.config.assignedVenues;
    if (Array.isArray(currentAssigned) && currentAssigned.length > 0) {
      dom.autoSchedVenues.value = currentAssigned.join(', ');
    } else {
      dom.autoSchedVenues.value = getFmpVenues().slice(0, 3).map(v => v.nombre || v.name).join(', ');
    }
  }

  if (dom.autoScheduleModal) {
    dom.autoScheduleModal.style.display = 'flex';
  }
}

function closeAutoScheduleModal() {
  if (dom.autoScheduleModal) {
    dom.autoScheduleModal.style.display = 'none';
  }
}

function handleApplyAutoSchedule() {
  const startDate = dom.autoSchedStartDate?.value;
  const startTime = dom.autoSchedStartTime?.value || '09:00';
  const interval = parseInt(dom.autoSchedInterval?.value, 10) || 60;
  const daysGap = parseInt(dom.autoSchedDaysGap?.value, 10) || 7;
  const venuesRaw = dom.autoSchedVenues?.value || '';

  const venues = venuesRaw
    ? venuesRaw.split(',').map(v => v.trim()).filter(Boolean)
    : (tournamentState.config.assignedVenues || VENUES_POOL);

  applyAutoScheduleToMatches(tournamentState.matches, {
    startDate,
    startTime,
    intervalMinutes: interval,
    daysGap,
    venues
  });

  saveState();
  renderFixturesList();
  renderStandingsView();
  renderTvMode();
  closeAutoScheduleModal();
  showToast('Fechas, horarios y canchas asignados secuencialmente', 'success');
}

// =============================================================================
// 11. RENDERIZADO DE CALENDARIO Y GESTIÓN DE RESULTADOS (PESTAÑA 2)
// =============================================================================

function initFixturesControls() {
  if (dom.searchFixtureInput) {
    if (dom.searchFixtureInput) dom.searchFixtureInput.addEventListener('input', (e) => {
      tournamentState.filters.search = e.target.value.toLowerCase().trim();
      renderFixturesList();
    });
  }

  if (dom.roundFilterSelect) {
    if (dom.roundFilterSelect) dom.roundFilterSelect.addEventListener('change', (e) => {
      tournamentState.filters.round = e.target.value;
      saveState();
      renderFixturesList();
    });
  }

  if (dom.groupFilterSelect) {
    if (dom.groupFilterSelect) dom.groupFilterSelect.addEventListener('change', (e) => {
      tournamentState.filters.group = e.target.value;
      saveState();
      renderFixturesList();
    });
  }

  if (dom.teamFilterSelect) {
    if (dom.teamFilterSelect) dom.teamFilterSelect.addEventListener('change', (e) => {
      tournamentState.filters.team = e.target.value;
      saveState();
      renderFixturesList();
    });
  }

  if (dom.statusFilterSelect) {
    if (dom.statusFilterSelect) dom.statusFilterSelect.addEventListener('change', (e) => {
      tournamentState.filters.status = e.target.value;
      saveState();
      renderFixturesList();
    });
  }

  if (dom.btnRegenerateFixtures) {
    if (dom.btnRegenerateFixtures) dom.btnRegenerateFixtures.addEventListener('click', () => {
      openConfirmRegenerateModal();
    });
  }

  if (dom.btnExportFixturesCsv) {
    if (dom.btnExportFixturesCsv) dom.btnExportFixturesCsv.addEventListener('click', exportFixturesCsv);
  }

  initAutoScheduleModal();
  initRegenerateModal();
}

function renderFixturesView() {
  const matches = tournamentState.matches || [];
  const isGenerated = tournamentState.isGenerated && matches.length > 0;

  if (!isGenerated) {
    if (dom.fixturesEmptyState) dom.fixturesEmptyState.style.display = 'block';
    if (dom.fixturesActiveView) dom.fixturesActiveView.style.display = 'none';
    return;
  }

  if (dom.fixturesEmptyState) dom.fixturesEmptyState.style.display = 'none';
  if (dom.fixturesActiveView) dom.fixturesActiveView.style.display = 'flex';

  if (dom.fixturesTournamentTitle) {
    dom.fixturesTournamentTitle.textContent = tournamentState.config.name || 'Torneo Sin Título';
  }

  if (dom.fixturesFormatBadge) {
    const formatLabels = {
      league_single: 'Liga (1 Vuelta)',
      league_double: 'Liga (Ida y Vuelta)',
      knockout: 'Eliminación Directa',
      groups_playoffs: 'Grupos + Eliminatorias',
      groups_semis: 'Grupos con Semis y Final'
    };
    const sportLabels = { f11: 'Fútbol 11', f7: 'Fútbol 7', futsal: 'Fútbol Sala' };
    dom.fixturesFormatBadge.textContent = `${formatLabels[tournamentState.config.format] || 'Competición'} • ${sportLabels[tournamentState.config.sport] || 'Fútbol'}`;
  }

  if (dom.groupFilterGroup) {
    const isGroups = tournamentState.config.format === 'groups_playoffs' || tournamentState.config.format === 'groups_semis';
    dom.groupFilterGroup.style.display = isGroups ? 'flex' : 'none';
  }

  populateFixtureFilters();
  renderFixturesList();
}

function populateFixtureFilters() {
  if (!tournamentState.filters) {
    tournamentState.filters = { round: 'all', team: 'all', group: 'all', status: 'all', search: '', teamSearch: '' };
  }
  const matches = tournamentState.matches || [];
  const teams = tournamentState.teams || [];

  if (dom.roundFilterSelect) {
    const uniqueRounds = [];
    matches.forEach(m => {
      if (m.roundName && !uniqueRounds.some(r => r === m.roundName)) {
        uniqueRounds.push(m.roundName);
      }
    });

    const currentRound = tournamentState.filters.round || 'all';
    let roundHtml = `<option value="all" ${currentRound === 'all' ? 'selected' : ''}>Todas</option>`;
    uniqueRounds.forEach(rName => {
      roundHtml += `<option value="${escapeHtml(rName)}" ${currentRound === rName ? 'selected' : ''}>${escapeHtml(rName)}</option>`;
    });
    dom.roundFilterSelect.innerHTML = roundHtml;
  }

  if (dom.groupFilterSelect) {
    const currentGroup = tournamentState.filters.group || 'all';
    const groupCount = tournamentState.config.groupCount || 2;
    const activeLetters = GROUP_LETTERS.slice(0, groupCount);

    let groupHtml = `<option value="all" ${currentGroup === 'all' ? 'selected' : ''}>Todos los grupos</option>`;
    activeLetters.forEach(letter => {
      groupHtml += `<option value="${letter}" ${currentGroup === letter ? 'selected' : ''}>Grupo ${letter}</option>`;
    });
    dom.groupFilterSelect.innerHTML = groupHtml;
  }

  if (dom.teamFilterSelect) {
    const currentTeam = tournamentState.filters.team || 'all';
    let teamHtml = `<option value="all" ${currentTeam === 'all' ? 'selected' : ''}>Todos los equipos</option>`;
    teams.forEach(t => {
      teamHtml += `<option value="${escapeHtml(t.id)}" ${currentTeam === t.id ? 'selected' : ''}>${escapeHtml(t.name)}</option>`;
    });
    dom.teamFilterSelect.innerHTML = teamHtml;
  }
}

function renderFixturesList() {
  if (!dom.roundsListContainer) return;
  if (!tournamentState.filters) {
    tournamentState.filters = { round: 'all', team: 'all', group: 'all', status: 'all', search: '', teamSearch: '' };
  }
  const matches = tournamentState.matches || [];
  const activeRound = tournamentState.filters.round || 'all';
  const activeGroup = tournamentState.filters.group || 'all';
  const activeTeam = tournamentState.filters.team || 'all';
  const activeStatus = tournamentState.filters.status || 'all';
  const searchTerm = tournamentState.filters.search || '';

  const playableMatches = matches.filter(m => !m.isBye);
  const totalPlayable = playableMatches.length;
  const finishedCount = playableMatches.filter(m => m.isFinished).length;
  const percent = totalPlayable > 0 ? Math.round((finishedCount / totalPlayable) * 100) : 0;

  if (dom.tournamentProgressBar) dom.tournamentProgressBar.style.width = `${percent}%`;
  if (dom.tournamentProgressText) dom.tournamentProgressText.textContent = `${percent}%`;
  if (dom.fixturesStatsSummary) {
    dom.fixturesStatsSummary.textContent = `${finishedCount} de ${totalPlayable} partidos disputados (${percent}%)`;
  }

  const filtered = matches.filter(m => {
    if (activeRound !== 'all' && m.roundName !== activeRound) return false;
    
    if (activeGroup !== 'all') {
      if (m.group && m.group !== activeGroup) return false;
      if (!m.group && !m.roundName.includes(`Grupo ${activeGroup}`)) return false;
    }

    if (activeTeam !== 'all') {
      if (m.homeTeamId !== activeTeam && m.awayTeamId !== activeTeam) return false;
    }

    if (activeStatus !== 'all') {
      const st = m.status || (m.isFinished ? 'finished' : 'pending');
      if (st !== activeStatus) return false;
    }

    if (searchTerm) {
      const homeTeam = getTeamById(m.homeTeamId);
      const awayTeam = getTeamById(m.awayTeamId);
      const homeName = (homeTeam ? homeTeam.name : (m.homeTeamPlaceholder || '')).toLowerCase();
      const awayName = (awayTeam ? awayTeam.name : (m.awayTeamPlaceholder || '')).toLowerCase();
      if (!homeName.includes(searchTerm) && !awayName.includes(searchTerm)) return false;
    }

    return true;
  });

  const groups = {};
  filtered.forEach(m => {
    const key = m.roundName || `Jornada ${m.round}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });

  if (Object.keys(groups).length === 0) {
    dom.roundsListContainer.innerHTML = `
      <div class="empty-state" style="padding: 2.5rem 1rem;">
      <div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>
        <h3>No hay partidos que coincidan con los filtros seleccionados</h3>
        <p>Prueba limpiando la búsqueda o restableciendo los selectores de jornada, equipo o estado.</p>
      </div>
    `;
    return;
  }

  let html = '';
  Object.keys(groups).forEach(roundName => {
    const roundMatches = groups[roundName];
    const finishedInRound = roundMatches.filter(m => !m.isBye && m.isFinished).length;
    const totalInRound = roundMatches.filter(m => !m.isBye).length;
    
    const byeMatch = roundMatches.find(m => m.isBye);
    let byeHtml = '';
    if (byeMatch && byeMatch.byeTeamId) {
      const byeTeam = getTeamById(byeMatch.byeTeamId);
      if (byeTeam) {
        byeHtml = `
          <div class="round-bye-notice">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>
            <span>Fecha libre (Descanso):</span>
            <div class="bye-team-chip">
              <span class="bye-team-dot" style="background-color: ${escapeHtml(byeTeam.color)};"></span>
              <span>${escapeHtml(byeTeam.name)}</span>
            </div>
            <span style="opacity: 0.8; font-size: 0.75rem;">(Bye automático)</span>
          </div>
        `;
      }
    }

    const regularMatches = roundMatches.filter(m => !m.isBye);

    html += `
      <div class="round-block">
        <div class="round-header">
          <div class="round-title-wrap">
            <h3>${escapeHtml(roundName)}</h3>
            <span class="round-meta-pill">${finishedInRound}/${totalInRound} jugados</span>
          </div>
        </div>

        ${byeHtml}

        <div class="matches-grid">
          ${regularMatches.map(m => renderMatchCard(m)).join('')}
        </div>
      </div>
    `;
  });

  dom.roundsListContainer.innerHTML = html;
}

function renderMatchCard(m) {
  const homeTeam = getTeamById(m.homeTeamId);
  const awayTeam = getTeamById(m.awayTeamId);

  const homeName = homeTeam ? homeTeam.name : (m.homeTeamPlaceholder || 'Por definir');
  const homeShield = renderTeamShieldElement(homeTeam);

  const awayName = awayTeam ? awayTeam.name : (m.awayTeamPlaceholder || 'Por definir');
  const awayShield = renderTeamShieldElement(awayTeam);

  const homeScoreVal = (m.homeScore !== null && m.homeScore !== undefined) ? m.homeScore : '';
  const awayScoreVal = (m.awayScore !== null && m.awayScore !== undefined) ? m.awayScore : '';

  const status = m.status || (m.isFinished ? 'finished' : 'pending');
  const isFinished = status === 'finished';
  const isLive = status === 'live';
  const isPublic = tournamentState.isPublicMode === true;
  const isLocked = m.isLocked === true;
  const isReadOnly = isLocked || isPublic;

  const hasScorers = Array.isArray(m.scorers) && m.scorers.length > 0;
  const totalScorersGoals = hasScorers ? m.scorers.reduce((sum, s) => sum + (parseInt(s.goals, 10) || 1), 0) : 0;
  const scorersBtnText = hasScorers ? `⚽ (${totalScorersGoals})` : '+ Goles';

  let groupTagHtml = '';
  if (m.group) {
    groupTagHtml = `<span class="match-group-tag">Grp ${escapeHtml(m.group)}</span>`;
  } else if (m.isKnockout) {
    groupTagHtml = `<span class="match-group-tag ko">KO</span>`;
  }

  const isTied = (m.homeScore !== null && m.awayScore !== null && m.homeScore === m.awayScore);
  const showPenalties = m.isKnockout && isTied;

  let penaltiesHtml = '';
  if (showPenalties) {
    const pHomeVal = (m.homePenalties !== null && m.homePenalties !== undefined) ? m.homePenalties : '';
    const pAwayVal = (m.awayPenalties !== null && m.awayPenalties !== undefined) ? m.awayPenalties : '';

    let penWinnerHint = '';
    if (m.homePenalties !== null && m.awayPenalties !== null) {
      if (m.homePenalties > m.awayPenalties) {
        penWinnerHint = `<span class="penalties-winner-hint">Avanza: ${escapeHtml(homeName)} (Penaltis)</span>`;
      } else if (m.awayPenalties > m.homePenalties) {
        penWinnerHint = `<span class="penalties-winner-hint">Avanza: ${escapeHtml(awayName)} (Penaltis)</span>`;
      } else {
        penWinnerHint = `<span class="penalties-draw-hint">Ingresa penaltis para desempatar la llave</span>`;
      }
    }

    penaltiesHtml = `
      <div class="penalties-section">
        <div class="penalties-header-row">
          <span>⚽ Definición por Penaltis</span>
        </div>
        <div class="penalties-inputs-row">
          <div class="penalty-side home">
            <span class="penalty-label">Pen. Local</span>
            <input 
              type="number" 
              class="penalty-input" 
              value="${pHomeVal}" 
              placeholder="0" 
              min="0" 
              max="99" 
              ${isReadOnly ? 'disabled' : ''}
              oninput="handlePenaltyChange('${escapeHtml(m.id)}', 'home', this.value)"
              aria-label="Penaltis ${escapeHtml(homeName)}"
            >
          </div>
          <span class="penalty-separator">-</span>
          <div class="penalty-side away">
            <span class="penalty-label">Pen. Visitante</span>
            <input 
              type="number" 
              class="penalty-input" 
              value="${pAwayVal}" 
              placeholder="0" 
              min="0" 
              max="99" 
              ${isReadOnly ? 'disabled' : ''}
              oninput="handlePenaltyChange('${escapeHtml(m.id)}', 'away', this.value)"
              aria-label="Penaltis ${escapeHtml(awayName)}"
            >
          </div>
        </div>
        ${penWinnerHint}
      </div>
    `;
  }

  const lockButtonHtml = isPublic ? '' : `
    <button 
      type="button" 
      class="btn-lock-match ${isLocked ? 'is-locked' : ''}" 
      onclick="toggleMatchLock('${escapeHtml(m.id)}')" 
      title="${isLocked ? 'Desbloquear partido' : 'Bloquear partido contra ediciones accidentales'}"
    >
      ${isLocked ? '🔒' : '🔓'}
    </button>
  `;

  return `
    <div class="match-card ${isFinished ? 'finished' : ''} ${isLocked ? 'is-locked' : ''}" data-match-id="${escapeHtml(m.id)}">
      
      <div class="match-card-header">
        <div class="match-header-left">
          <span class="match-number-tag">${escapeHtml(m.roundName)}</span>
          ${groupTagHtml}
        </div>
        
        <div class="match-status-toggle-wrapper">
          <button 
            type="button" 
            class="btn-scorers-trigger ${hasScorers ? 'has-scorers' : ''}" 
            onclick="openScorersModal('${escapeHtml(m.id)}')"
            title="Anotar autores de los goles"
            ${isReadOnly ? 'disabled' : ''}
          >
            <span>${scorersBtnText}</span>
          </button>

          <div class="match-status-select-wrap">
            ${isLive ? '<span class="live-pulse-dot" title="Partido en juego"></span>' : ''}
            <select 
              class="status-dropdown-select status-${status}" 
              onchange="handleMatchStatusChange('${escapeHtml(m.id)}', this.value)"
              ${isReadOnly ? 'disabled' : ''}
              title="Cambiar estado del partido"
            >
              <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pendiente</option>
              <option value="live" ${status === 'live' ? 'selected' : ''}>🔴 En Juego</option>
              <option value="finished" ${status === 'finished' ? 'selected' : ''}>✓ Finalizado</option>
              <option value="postponed" ${status === 'postponed' ? 'selected' : ''}>⏳ Reprogramado</option>
              <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
            </select>
          </div>

          ${lockButtonHtml}
        </div>
      </div>

      <div class="match-scoreboard">
        <div class="team-side home">
          <div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
            ${homeShield}
          </div>
          <span class="team-name-label" title="${escapeHtml(homeName)}">${escapeHtml(homeName)}</span>
        </div>

        <div class="score-box-center">
          <div class="score-control">
            <input 
              type="number" 
              class="score-input" 
              value="${homeScoreVal}" 
              placeholder="-" 
              min="0" 
              max="99" 
              ${isReadOnly ? 'disabled' : ''}
              oninput="handleScoreChange('${escapeHtml(m.id)}', 'home', this.value)"
              aria-label="Goles ${escapeHtml(homeName)}"
            >
          </div>

          <span class="score-separator">:</span>

          <div class="score-control">
            <input 
              type="number" 
              class="score-input" 
              value="${awayScoreVal}" 
              placeholder="-" 
              min="0" 
              max="99" 
              ${isReadOnly ? 'disabled' : ''}
              oninput="handleScoreChange('${escapeHtml(m.id)}', 'away', this.value)"
              aria-label="Goles ${escapeHtml(awayName)}"
            >
          </div>
        </div>

        <div class="team-side away">
          <div style="width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
            ${awayShield}
          </div>
          <span class="team-name-label" title="${escapeHtml(awayName)}">${escapeHtml(awayName)}</span>
        </div>
      </div>

      ${penaltiesHtml}

      <div class="match-card-meta">
        <div class="meta-field" title="Fecha del partido">
          <span class="meta-field-icon">📅</span>
          <input 
            type="date" 
            value="${escapeHtml(m.date || '')}" 
            ${isReadOnly ? 'disabled' : ''}
            onchange="handleMetaChange('${escapeHtml(m.id)}', 'date', this.value)"
          >
        </div>

        <div class="meta-field" title="Hora de inicio">
          <span class="meta-field-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
          <input 
            type="time" 
            value="${escapeHtml(m.time || '')}" 
            ${isReadOnly ? 'disabled' : ''}
            onchange="handleMetaChange('${escapeHtml(m.id)}', 'time', this.value)"
          >
        </div>

        <div class="meta-field" title="Cancha asignada">
          <span class="meta-field-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-3"></path></svg></span>
          <input 
            type="text" 
            list="colombianVenuesDatalist"
            placeholder="Asignar cancha..." 
            value="${escapeHtml(m.venue || '')}" 
            ${isReadOnly ? 'disabled' : ''}
            onchange="handleMetaChange('${escapeHtml(m.id)}', 'venue', this.value)"
          >
        </div>

        <div class="meta-field" title="Árbitro asignado">
          <span class="meta-field-icon">👤</span>
          <input 
            type="text" 
            placeholder="Árbitro..." 
            value="${escapeHtml(m.referee || '')}" 
            ${isReadOnly ? 'disabled' : ''}
            onchange="handleMetaChange('${escapeHtml(m.id)}', 'referee', this.value)"
          >
        </div>
      </div>

    </div>
  `;
}

// =============================================================================
// 12. MANEJADORES DE RESULTADOS, PENALTIS Y BLOQUEO DE SEGURIDAD
// =============================================================================

window.handleScoreChange = function(matchId, side, value) {
  if (tournamentState.isPublicMode) return;
  const ownership = FMPStore.assertTournamentOwnership(activeTournamentId, 'REGISTRAR_MARCADOR');
  if (!ownership.ok) {
    if (typeof showToast === 'function') showToast(ownership.error, 'error', 3500);
    return;
  }
  const match = tournamentState.matches.find(m => m.id === matchId);
  if (!match || match.isLocked) return;

  let scoreNum = (value === '' || isNaN(value)) ? null : Math.max(0, parseInt(value, 10));

  if (side === 'home') {
    match.homeScore = scoreNum;
  } else {
    match.awayScore = scoreNum;
  }

  if (match.homeScore !== null && match.awayScore !== null && match.status !== 'finished') {
    match.status = 'finished';
    match.isFinished = true;
  }

  propagateKnockoutWinner(match);
  updateGroupPlayoffSlots();

  saveState();
  updateProgressStatsOnly();
  renderStandingsView();
  renderTvMode();

  if (match.isKnockout) {
    renderFixturesList();
  }
};

window.handlePenaltyChange = function(matchId, side, value) {
  if (tournamentState.isPublicMode) return;
  const match = tournamentState.matches.find(m => m.id === matchId);
  if (!match || match.isLocked) return;

  const penNum = (value === '' || isNaN(value)) ? null : Math.max(0, parseInt(value, 10));

  if (side === 'home') {
    match.homePenalties = penNum;
  } else {
    match.awayPenalties = penNum;
  }

  propagateKnockoutWinner(match);
  saveState();
  renderFixturesList();
  renderStandingsView();
  renderTvMode();
};

window.handleMatchStatusChange = function(matchId, newStatus) {
  if (tournamentState.isPublicMode) return;
  const match = tournamentState.matches.find(m => m.id === matchId);
  if (!match || match.isLocked) return;

  const oldStatus = match.status;
  match.status = newStatus;
  match.isFinished = (newStatus === 'finished');

  if (match.isFinished) {
    if (match.homeScore === null) match.homeScore = 0;
    if (match.awayScore === null) match.awayScore = 0;
  }

  propagateKnockoutWinner(match);
  updateGroupPlayoffSlots();
  saveState();

  renderFixturesList();
  renderStandingsView();
  renderTvMode();

  const labels = {
    pending: 'Pendiente',
    live: 'En Juego',
    finished: 'Finalizado',
    postponed: 'Reprogramado / Pospuesto',
    cancelled: 'Cancelado'
  };

  const home = match.homeTeamPlaceholder || getTeamById(match.homeTeamId)?.name || 'Local';
  const away = match.awayTeamPlaceholder || getTeamById(match.awayTeamId)?.name || 'Visitante';
  const matchDesc = `${home} vs ${away}`;

  if (newStatus === 'postponed' || newStatus === 'cancelled') {
    logAudit('ESTADO_PARTIDO', `Estado cambiado a ${labels[newStatus]}: ${matchDesc}`, match.id);
    addNotification({
      title: `⚠️ Partido ${labels[newStatus]}`,
      message: `El encuentro entre ${home} y ${away} ha sido marcado como "${labels[newStatus]}".`,
      type: 'calendar',
      tournamentId: activeTournamentId
    });
  }

  showToast(`Estado actualizado a ${labels[newStatus] || newStatus}`, 'info', 2000);
};

window.toggleMatchLock = function(matchId) {
  if (tournamentState.isPublicMode) return;
  const match = tournamentState.matches.find(m => m.id === matchId);
  if (!match) return;

  match.isLocked = !match.isLocked;
  saveState();
  renderFixturesList();

  if (match.isLocked) {
    showToast('🔒 Partido bloqueado contra ediciones accidentales', 'warning', 2500);
  } else {
    showToast('🔓 Partido desbloqueado para edición', 'info', 2000);
  }
};

window.handleMetaChange = function(matchId, field, value) {
  if (tournamentState.isPublicMode) return;
  const match = tournamentState.matches.find(m => m.id === matchId);
  if (!match || match.isLocked) return;

  const trimmedVal = (value || '').trim();
  const oldVal = match[field];

  // Motor Anti-Solapamiento: Validar cruces de cancha si cambia fecha, hora o escenario
  if (field === 'date' || field === 'time' || field === 'venue') {
    const testDate = field === 'date' ? trimmedVal : match.date;
    const testTime = field === 'time' ? trimmedVal : match.time;
    const testVenue = field === 'venue' ? trimmedVal : match.venue;

    if (testDate && testTime && testVenue) {
      const conflict = checkVenueConflict(testVenue, testDate, testTime, match.id);
      if (conflict) {
        showToast(`⚠️ Conflicto de Cancha: "${testVenue}" ya está ocupada el ${testDate} a las ${testTime} en "${conflict.tournamentName}" (${conflict.matchSummary}). Por favor elige otra cancha u horario.`, 'error', 6000);
        renderFixturesList();
        return;
      }
    }
  }

  match[field] = trimmedVal;
  saveState();
  renderTvMode();

  // Si hubo cambio en programación, registrar auditoría y disparar notificación
  if (oldVal !== trimmedVal && (field === 'date' || field === 'time' || field === 'venue')) {
    const home = match.homeTeamPlaceholder || getTeamById(match.homeTeamId)?.name || 'Local';
    const away = match.awayTeamPlaceholder || getTeamById(match.awayTeamId)?.name || 'Visitante';
    const summary = `${home} vs ${away}`;

    logAudit('REPROGRAMACION_PARTIDO', `Partido reprogramado: ${summary} -> Fecha: ${match.date || 'Sin fecha'}, Hora: ${match.time || 'Sin hora'}, Cancha: ${match.venue || 'Sin cancha'}`, match.id);

    addNotification({
      title: '📅 Encuentro Reprogramado',
      message: `${summary} ha sido programado para el ${match.date || 'TBD'} a las ${match.time || 'TBD'} en ${match.venue || 'Escenario por definir'}.`,
      type: 'calendar',
      tournamentId: activeTournamentId
    });
  }
};

function propagateKnockoutWinner(match) {
  if (!match.isKnockout && !match.nextMatchId) return;

  let winnerId = null;
  let loserId = null;

  if (match.isFinished && match.homeScore !== null && match.awayScore !== null) {
    if (match.homeScore > match.awayScore) {
      winnerId = match.homeTeamId;
      loserId = match.awayTeamId;
    } else if (match.awayScore > match.homeScore) {
      winnerId = match.awayTeamId;
      loserId = match.homeTeamId;
    } else {
      if (match.homePenalties !== null && match.awayPenalties !== null && match.homePenalties !== match.awayPenalties) {
        if (match.homePenalties > match.awayPenalties) {
          winnerId = match.homeTeamId;
          loserId = match.awayTeamId;
        } else {
          winnerId = match.awayTeamId;
          loserId = match.homeTeamId;
        }
      }
    }
  }

  if (match.nextMatchId) {
    const nextMatch = tournamentState.matches.find(m => m.id === match.nextMatchId);
    if (nextMatch) {
      const winnerTeam = getTeamById(winnerId);
      if (match.nextSlot === 'home') {
        nextMatch.homeTeamId = winnerId;
        if (winnerTeam) nextMatch.homeTeamPlaceholder = winnerTeam.name;
      } else if (match.nextSlot === 'away') {
        nextMatch.awayTeamId = winnerId;
        if (winnerTeam) nextMatch.awayTeamPlaceholder = winnerTeam.name;
      }
      propagateKnockoutWinner(nextMatch);
    }
  }

  if (match.loserMatchId) {
    const thirdMatch = tournamentState.matches.find(m => m.id === match.loserMatchId);
    if (thirdMatch) {
      const loserTeam = getTeamById(loserId);
      if (match.loserSlot === 'home') {
        thirdMatch.homeTeamId = loserId;
        if (loserTeam) thirdMatch.homeTeamPlaceholder = loserTeam.name;
      } else if (match.loserSlot === 'away') {
        thirdMatch.awayTeamId = loserId;
        if (loserTeam) thirdMatch.awayTeamPlaceholder = loserTeam.name;
      }
    }
  }
}

function updateProgressStatsOnly() {
  const matches = tournamentState.matches || [];
  const playable = matches.filter(m => !m.isBye);
  const total = playable.length;
  const finished = playable.filter(m => m.isFinished).length;
  const percent = total > 0 ? Math.round((finished / total) * 100) : 0;

  if (dom.tournamentProgressBar) dom.tournamentProgressBar.style.width = `${percent}%`;
  if (dom.tournamentProgressText) dom.tournamentProgressText.textContent = `${percent}%`;
  if (dom.fixturesStatsSummary) {
    dom.fixturesStatsSummary.textContent = `${finished} de ${total} partidos disputados (${percent}%)`;
  }
}

function getTeamById(id) {
  if (!id) return null;
  const currentT = (typeof tournamentState !== 'undefined' && tournamentState && Array.isArray(tournamentState.teams)) 
    ? tournamentState 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments && savedTournaments[0]) ? savedTournaments[0] : {});
  const teams = currentT.teams || [];
  return teams.find(t => t.id === id) || null;
}

// =============================================================================
// 13. MOTOR DE CLASIFICACIÓN (TABLA GENERAL & TABLAS DE GRUPOS)
// =============================================================================

function calculateStandings(teamsSubset = null, matchesSubset = null) {
  const currentT = (typeof tournamentState !== 'undefined' && tournamentState) 
    ? tournamentState 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments && savedTournaments[0]) ? savedTournaments[0] : {});
  const teams = teamsSubset || currentT.teams || [];
  const allMatches = matchesSubset || currentT.matches || [];
  const cfg = currentT.config || {};

  const ptsWin = parseInt(cfg.pointsWin, 10) ?? 3;
  const ptsDraw = parseInt(cfg.pointsDraw, 10) ?? 1;
  const ptsLoss = parseInt(cfg.pointsLoss, 10) ?? 0;
  const tiebreaker = cfg.tiebreaker || 'dg';

  const tableMap = {};
  teams.forEach(t => {
    tableMap[t.id] = {
      teamId: t.id,
      name: t.name,
      color: t.color,
      shield: t.shield,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
      form: []
    };
  });

  const targetTeamIds = new Set(teams.map(t => t.id));

  const finishedMatches = allMatches.filter(m => 
    !m.isBye && !m.isKnockout && m.isFinished && m.homeScore !== null && m.awayScore !== null &&
    targetTeamIds.has(m.homeTeamId) && targetTeamIds.has(m.awayTeamId)
  );

  finishedMatches.forEach(m => {
    const homeRecord = tableMap[m.homeTeamId];
    const awayRecord = tableMap[m.awayTeamId];

    if (!homeRecord || !awayRecord) return;

    homeRecord.pj += 1;
    awayRecord.pj += 1;

    homeRecord.gf += m.homeScore;
    homeRecord.gc += m.awayScore;
    awayRecord.gf += m.awayScore;
    awayRecord.gc += m.homeScore;

    if (m.homeScore > m.awayScore) {
      homeRecord.pg += 1;
      homeRecord.pts += ptsWin;
      homeRecord.form.push('G');

      awayRecord.pp += 1;
      awayRecord.pts += ptsLoss;
      awayRecord.form.push('P');
    } else if (m.awayScore > m.homeScore) {
      awayRecord.pg += 1;
      awayRecord.pts += ptsWin;
      awayRecord.form.push('G');

      homeRecord.pp += 1;
      homeRecord.pts += ptsLoss;
      homeRecord.form.push('P');
    } else {
      homeRecord.pe += 1;
      homeRecord.pts += ptsDraw;
      homeRecord.form.push('E');

      awayRecord.pe += 1;
      awayRecord.pts += ptsDraw;
      awayRecord.form.push('E');
    }
  });

  const standings = Object.values(tableMap).map(row => {
    row.dg = row.gf - row.gc;
    row.form = row.form.slice(-5);
    return row;
  });

  standings.sort((a, b) => {
  // 1. Puntos
    if (b.pts !== a.pts) return b.pts - a.pts;

  // 2. Criterio configurado (Enfrentamiento directo si se eligió H2H)
    if (tiebreaker === 'h2h') {
      const directMatch = finishedMatches.find(m => 
        (m.homeTeamId === a.teamId && m.awayTeamId === b.teamId) ||
        (m.homeTeamId === b.teamId && m.awayTeamId === a.teamId)
      );

      if (directMatch) {
        if (directMatch.homeTeamId === a.teamId && directMatch.homeScore !== directMatch.awayScore) {
          return directMatch.awayScore - directMatch.homeScore;
        } else if (directMatch.homeTeamId === b.teamId && directMatch.homeScore !== directMatch.awayScore) {
          return directMatch.homeScore - directMatch.awayScore;
        }
      }
    }

    // Criterio FIFA: Diferencia de gol y goles a favor
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  return standings;
}

function calculateGroupStandings(groupLetter) {
  const currentT = (typeof tournamentState !== 'undefined' && tournamentState) 
    ? tournamentState 
    : ((typeof savedTournaments !== 'undefined' && savedTournaments && savedTournaments[0]) ? savedTournaments[0] : {});
  const teamIds = (currentT.groups && currentT.groups[groupLetter]) || [];
  const groupTeams = teamIds.map(id => getTeamById(id)).filter(Boolean);
  const groupMatches = (currentT.matches || []).filter(m => m.group === groupLetter || (m.roundName && m.roundName.includes(`Grupo ${groupLetter}`)));
  return calculateStandings(groupTeams, groupMatches);
}

function initStandingsControls() {
  if (dom.subTabButtons) {
    dom.subTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSubtab = btn.getAttribute('data-subtab');
        dom.subTabButtons.forEach(b => b.classList.remove('active'));
        dom.subTabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetSubtab);
        if (targetPane) targetPane.classList.add('active');

        tournamentState.activeSubTab = targetSubtab;
        saveState();
      });
    });
  }

  if (dom.btnExportStandingsCsv) {
    if (dom.btnExportStandingsCsv) dom.btnExportStandingsCsv.addEventListener('click', exportStandingsCsv);
  }

  if (dom.btnPrintStandingsReport) {
    if (dom.btnPrintStandingsReport) dom.btnPrintStandingsReport.addEventListener('click', handlePrintReport);
  }
}

// =============================================================================
// 14. PANEL DE CONTROL SUPERIOR (KPIs, Proximos, Ultimos y Campeon)
// =============================================================================

function renderTournamentSummaryDashboard() {
  if (!dom.tournamentSummaryDashboard) return;

  const matches = tournamentState.matches || [];
  const teams = tournamentState.teams || [];
  const playable = matches.filter(m => !m.isBye);
  const totalPlayable = playable.length;
  const finished = playable.filter(m => m.isFinished);
  const pending = playable.filter(m => !m.isFinished);
  const percent = totalPlayable > 0 ? Math.round((finished.length / totalPlayable) * 100) : 0;

  if (dom.summaryTournamentName) {
    dom.summaryTournamentName.textContent = tournamentState.config.name || 'Torneo Sin Título';
  }
  if (dom.summaryTournamentDescription) {
    dom.summaryTournamentDescription.textContent = tournamentState.config.description || 'Panel general de rendimiento, estadísticas y calendario';
  }

  if (dom.kpiTotalTeams) dom.kpiTotalTeams.textContent = teams.length;
  if (dom.kpiPlayedVsPending) dom.kpiPlayedVsPending.textContent = `${finished.length} / ${totalPlayable}`;
  if (dom.kpiProgressPercent) dom.kpiProgressPercent.textContent = `${percent}%`;
  if (dom.kpiProgressBar) dom.kpiProgressBar.style.width = `${percent}%`;

  // Badge de Estado del Torneo
  if (dom.summaryStatusBadge && dom.summaryStatusText) {
    if (percent === 100 && totalPlayable > 0) {
      dom.summaryStatusText.textContent = '🏆 Torneo Finalizado';
      dom.summaryStatusBadge.style.borderColor = '#fbbf24';
      dom.summaryStatusBadge.style.color = '#fbbf24';
      dom.summaryStatusBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
    } else if (finished.length > 0) {
      dom.summaryStatusText.textContent = `⚡ En Disputa (${percent}%)`;
      dom.summaryStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.35)';
      dom.summaryStatusBadge.style.color = '#34d399';
      dom.summaryStatusBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
    } else {
    dom.summaryStatusText.textContent = 'Por Iniciar';
      dom.summaryStatusBadge.style.borderColor = 'rgba(59, 130, 246, 0.35)';
      dom.summaryStatusBadge.style.color = '#93c5fd';
      dom.summaryStatusBadge.style.backgroundColor = 'rgba(59, 130, 246, 0.12)';
    }
  }

  // Identificar Líder Actual
  const allStandings = calculateStandings();
  if (dom.kpiCurrentLeader) {
    if (allStandings.length > 0) {
      dom.kpiCurrentLeader.textContent = allStandings[0].name;
    } else {
      dom.kpiCurrentLeader.textContent = 'Por definir';
    }
  }

  // Bloque: Últimos Resultados
  if (dom.kpiRecentResultsList) {
    if (finished.length === 0) {
      dom.kpiRecentResultsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.25rem; font-size: 0.8rem;">Aún no se han completado partidos.</div>`;
      if (dom.kpiRecentCount) dom.kpiRecentCount.textContent = '0 jugados';
    } else {
      if (dom.kpiRecentCount) dom.kpiRecentCount.textContent = `${finished.length} jugados`;
      dom.kpiRecentResultsList.innerHTML = finished.slice(-3).reverse().map(m => {
        const home = getTeamById(m.homeTeamId);
        const away = getTeamById(m.awayTeamId);
        const homeName = home ? home.name : (m.homeTeamPlaceholder || 'Local');
        const awayName = away ? away.name : (m.awayTeamPlaceholder || 'Visitante');

        return `
          <div class="kpi-mini-match">
            <div class="kpi-mini-teams">
              <div class="kpi-mini-team-row">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${home ? home.color : '#64748b'};"></span>
                <span>${escapeHtml(homeName)}</span>
              </div>
              <div class="kpi-mini-team-row">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${away ? away.color : '#64748b'};"></span>
                <span>${escapeHtml(awayName)}</span>
              </div>
            </div>
            <div class="kpi-mini-score-box">
              ${m.homeScore} : ${m.awayScore}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Bloque: Próximos Encuentros
  if (dom.kpiUpcomingMatchesList) {
    if (pending.length === 0) {
      dom.kpiUpcomingMatchesList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.25rem; font-size: 0.8rem;">Todos los partidos han sido disputados.</div>`;
      if (dom.kpiUpcomingCount) dom.kpiUpcomingCount.textContent = '0 pendientes';
    } else {
      if (dom.kpiUpcomingCount) dom.kpiUpcomingCount.textContent = `${pending.length} pendientes`;
      dom.kpiUpcomingMatchesList.innerHTML = pending.slice(0, 3).map(m => {
        const home = getTeamById(m.homeTeamId);
        const away = getTeamById(m.awayTeamId);
        const homeName = home ? home.name : (m.homeTeamPlaceholder || 'Por definir');
        const awayName = away ? away.name : (m.awayTeamPlaceholder || 'Por definir');

        return `
          <div class="kpi-mini-match">
            <div class="kpi-mini-teams">
              <div class="kpi-mini-team-row">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${home ? home.color : '#64748b'};"></span>
                <span>${escapeHtml(homeName)}</span>
              </div>
              <div class="kpi-mini-team-row">
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${away ? away.color : '#64748b'};"></span>
                <span>${escapeHtml(awayName)}</span>
              </div>
            </div>
            <div class="kpi-mini-sched-box">
              <span class="kpi-mini-sched-time">${escapeHtml(m.time || 'Horario pdte')}</span>
              <span>${escapeHtml(m.venue || 'Cancha pdte')}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Banner Oficial de Campeón
  detectAndRenderChampion(matches, allStandings, percent);
}

function detectAndRenderChampion(matches, standings, progressPercent) {
  if (!dom.championCelebrationBanner) return;

  const format = tournamentState.config.format;
  let championTeam = null;

  // En formatos con eliminatorias:
  const finalMatch = matches.find(m => 
    !m.isBye && m.isFinished && m.roundName && m.roundName.includes('Final') && !m.roundName.includes('Semifinal')
  );

  if (finalMatch && finalMatch.homeScore !== null && finalMatch.awayScore !== null) {
    if (finalMatch.homeScore > finalMatch.awayScore) {
      championTeam = getTeamById(finalMatch.homeTeamId);
    } else if (finalMatch.awayScore > finalMatch.homeScore) {
      championTeam = getTeamById(finalMatch.awayTeamId);
    } else if (finalMatch.homePenalties !== null && finalMatch.awayPenalties !== null) {
      championTeam = finalMatch.homePenalties > finalMatch.awayPenalties 
        ? getTeamById(finalMatch.homeTeamId) 
        : getTeamById(finalMatch.awayTeamId);
    }
  }

  // En formato Liga (1 o 2 vueltas): cuando todos los partidos están jugados
  if (!championTeam && (format === 'league_single' || format === 'league_double') && progressPercent === 100 && standings.length > 0) {
    championTeam = getTeamById(standings[0].teamId);
  }

  if (championTeam) {
    dom.championCelebrationBanner.style.display = 'block';
    if (dom.championBannerName) dom.championBannerName.textContent = championTeam.name;
    if (dom.championBannerSubtitle) {
  dom.championBannerSubtitle.textContent = `¡Felicidades a ${championTeam.name}! Ha conquistado el trofeo máximo de la competición.`;
    }
    if (dom.championBannerShield) {
      dom.championBannerShield.innerHTML = renderTeamShieldElement(championTeam);
    }
  } else {
    dom.championCelebrationBanner.style.display = 'none';
  }
}

function renderStandingsView() {
  const teams = tournamentState.teams || [];
  const matches = tournamentState.matches || [];
  const hasTeams = teams.length >= 2;

  if (!hasTeams) {
    if (dom.standingsEmptyState) dom.standingsEmptyState.style.display = 'block';
    if (dom.standingsActiveView) dom.standingsActiveView.style.display = 'none';
    return;
  }

  if (dom.standingsEmptyState) dom.standingsEmptyState.style.display = 'none';
  if (dom.standingsActiveView) dom.standingsActiveView.style.display = 'flex';

  if (dom.standingsTournamentTitle) {
    dom.standingsTournamentTitle.textContent = tournamentState.config.name || 'Torneo Sin Título';
  }

  if (dom.standingsTournamentSubtitle) {
    const tiebreakerText = tournamentState.config.tiebreaker === 'h2h' ? 'Enfrentamiento directo (H2H)' : 'Diferencia de Goles (DG)';
    dom.standingsTournamentSubtitle.textContent = `Clasificación oficial • Criterio de desempate: ${tiebreakerText} • Victoria: ${tournamentState.config.pointsWin} pts`;
  }

  if (dom.standingsTiebreakerNote) {
    if (tournamentState.config.tiebreaker === 'h2h') {
    dom.standingsTiebreakerNote.innerHTML = `<span>* Criterio: 1.º Puntos | 2.º Enfrentamiento Directo (H2H) | 3.º Diferencia de Gol (DG) | 4.º Goles a Favor (GF)</span>`;
    } else {
    dom.standingsTiebreakerNote.innerHTML = `<span>* Criterio FIFA: 1.º Puntos | 2.º Diferencia de Gol (DG) | 3.º Goles a Favor (GF)</span>`;
    }
  }

  renderTournamentSummaryDashboard();

  const format = tournamentState.config.format;
  const isGroups = format === 'groups_playoffs' || format === 'groups_semis';

  if (isGroups) {
    if (dom.singleLeagueTableWrapper) dom.singleLeagueTableWrapper.style.display = 'none';
    if (dom.groupTablesContainer) {
      dom.groupTablesContainer.style.display = 'flex';
      renderGroupStageStandingsTables();
    }
  } else {
    if (dom.singleLeagueTableWrapper) dom.singleLeagueTableWrapper.style.display = 'block';
    if (dom.groupTablesContainer) dom.groupTablesContainer.style.display = 'none';
    const standings = calculateStandings();
    renderStandingsTable(standings);
  }

  renderBracketsTree(matches);
  renderTopScorers();

  const activeSub = tournamentState.activeSubTab || 'view-table';
  const targetSubBtn = document.querySelector(`.sub-tab-btn[data-subtab="${activeSub}"]`);
  const targetSubPane = document.getElementById(activeSub);
  if (targetSubBtn && targetSubPane) {
    dom.subTabButtons.forEach(b => b.classList.remove('active'));
    dom.subTabContents.forEach(c => c.classList.remove('active'));
    targetSubBtn.classList.add('active');
    targetSubPane.classList.add('active');
  }
}

function renderGroupStageStandingsTables() {
  if (!dom.groupTablesContainer) return;

  const groupCount = tournamentState.config.groupCount || 2;
  const activeLetters = GROUP_LETTERS.slice(0, groupCount);
  const qualCount = tournamentState.config.groupQualifiedCount || 2;

  let html = '';
  activeLetters.forEach(letter => {
    const standings = calculateGroupStandings(letter);

    let rowsHtml = '';
    if (standings.length === 0) {
      rowsHtml = `<tr><td colspan="11" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Sin clubes registrados en este grupo</td></tr>`;
    } else {
      rowsHtml = standings.map((row, index) => {
        const pos = index + 1;
        const isQualZone = pos <= qualCount;
        const isRelegation = pos > qualCount;
        const shieldHtml = renderTeamShieldElement(row);

        let dgDisplay = row.dg > 0 ? `+${row.dg}` : `${row.dg}`;
        let dgClass = row.dg > 0 ? 'positive' : (row.dg < 0 ? 'negative' : 'zero');

        let formHtml = row.form.length === 0 
          ? `<span class="form-empty">-</span>`
          : row.form.map(f => `<span class="form-circle ${f === 'G' ? 'win' : (f === 'E' ? 'draw' : 'loss')}">${f}</span>`).join('');

        const rowZoneClass = isQualZone ? 'ucl-zone' : (isRelegation ? 'relegation-zone' : 'mid-zone');
        const posBadgeClass = isQualZone ? 'top-4' : (isRelegation ? 'relegation' : '');

        return `
          <tr class="${rowZoneClass}">
            <td class="td-pos"><span class="pos-badge ${posBadgeClass}">${pos}</span></td>
            <td class="td-club">
              <div class="club-cell">
                <div style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  ${shieldHtml}
                </div>
                <span class="club-name" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</span>
              </div>
            </td>
            <td class="td-pts"><strong>${row.pts}</strong></td>
            <td class="td-num">${row.pj}</td>
            <td class="td-num">${row.pg}</td>
            <td class="td-num">${row.pe}</td>
            <td class="td-num">${row.pp}</td>
            <td class="td-num">${row.gf}</td>
            <td class="td-num">${row.gc}</td>
            <td class="td-dg ${dgClass}"><strong>${dgDisplay}</strong></td>
            <td class="td-form"><div class="form-circles-wrap">${formHtml}</div></td>
          </tr>
        `;
      }).join('');
    }

    html += `
      <div class="group-table-card">
        <div class="group-table-header">
          <div class="group-table-title">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></span>
            <span>GRUPO </span>
          </div>
          <span class="group-qual-pill">Clasifican los ${qualCount} primeros (${qualCount === 1 ? '1 clasificado' : `${qualCount} clasificados`})</span>
        </div>
        <div class="table-responsive-wrapper" style="overflow-x:auto;">
          <table class="standings-table">
            <thead>
              <tr>
                <th class="th-pos">#</th>
                <th class="th-club">Club</th>
                <th class="th-pts">PTS</th>
                <th class="th-num">PJ</th>
                <th class="th-num">PG</th>
                <th class="th-num">PE</th>
                <th class="th-num">PP</th>
                <th class="th-num">GF</th>
                <th class="th-num">GC</th>
                <th class="th-num">DG</th>
                <th class="th-form">Forma</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>
    `;
  });

  dom.groupTablesContainer.innerHTML = html;
}

function renderStandingsTable(standings) {
  if (!dom.standingsTableBody) return;

  if (standings.length === 0) {
    dom.standingsTableBody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          No hay datos de clasificación disponibles aún.
        </td>
      </tr>
    `;
    return;
  }

  const totalTeams = standings.length;

  const html = standings.map((row, index) => {
    const pos = index + 1;
    const isQualZone = pos <= 4;
    const isRelegation = totalTeams >= 5 && pos > (totalTeams - 2);
    const rowClass = isQualZone ? 'ucl-zone' : (isRelegation ? 'relegation-zone' : 'mid-zone');
    const posBadgeClass = isQualZone ? 'top-4' : (isRelegation ? 'relegation' : '');

    const shieldHtml = renderTeamShieldElement(row);

    let dgClass = row.dg > 0 ? 'positive' : (row.dg < 0 ? 'negative' : 'zero');
    let dgDisplay = row.dg > 0 ? `+${row.dg}` : `${row.dg}`;

    let formHtml = '';
    if (row.form.length === 0) {
      formHtml = `<span class="form-empty">-</span>`;
    } else {
      formHtml = row.form.map(result => {
        let resClass = 'draw';
        if (result === 'G') resClass = 'win';
        if (result === 'P') resClass = 'loss';
        return `<span class="form-circle ${resClass}">${result}</span>`;
      }).join('');
    }

    return `
      <tr class="${rowClass}">
        <td class="td-pos">
          <span class="pos-badge ${posBadgeClass}">${pos}</span>
        </td>
        <td class="td-club">
          <div class="club-cell">
            <div style="width:28px; height:28px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${shieldHtml}
            </div>
            <span class="club-name" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</span>
          </div>
        </td>
        <td class="td-pts"><strong>${row.pts}</strong></td>
        <td class="td-num">${row.pj}</td>
        <td class="td-num">${row.pg}</td>
        <td class="td-num">${row.pe}</td>
        <td class="td-num">${row.pp}</td>
        <td class="td-num">${row.gf}</td>
        <td class="td-num">${row.gc}</td>
        <td class="td-dg ${dgClass}"><strong>${dgDisplay}</strong></td>
        <td class="td-form">
          <div class="form-circles-wrap">
            ${formHtml}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  dom.standingsTableBody.innerHTML = html;
}

// =============================================================================
// 15. Árbol ELIMINATORIO CONECTADO CON LÍNEAS CSS (BRACKETS)
// =============================================================================

function renderBrackets() {
  const container = dom.bracketsTreeContainer || document.getElementById('bracketsTreeContainer');
  if (!container) return;

  const { qf1, qf2, qf3, qf4, sf1, sf2, finalM } = ensureSymmetricKnockoutStructure();

  container.innerHTML = `
    <div class="bracket-5col-grid" id="bracket5ColGrid">
      <svg class="bracket-connector-svg" id="bracketConnectorSvg" aria-hidden="true">
        <path id="conn-qf1-sf1" class="${qf1.isFinished ? 'branch-active' : ''}" />
        <path id="conn-qf2-sf1" class="${qf2.isFinished ? 'branch-active' : ''}" />
        <path id="conn-sf1-final" class="${sf1.isFinished ? 'branch-active' : ''}" />
        <path id="conn-sf2-final" class="${sf2.isFinished ? 'branch-active' : ''}" />
        <path id="conn-qf3-sf2" class="${qf3.isFinished ? 'branch-active' : ''}" />
        <path id="conn-qf4-sf2" class="${qf4.isFinished ? 'branch-active' : ''}" />
      </svg>

      <!-- COLUMNA 1: CUARTOS DE FINAL (Izq) -->
      <div class="bracket-col col-qf col-left">
        <div class="bracket-col-header">CUARTOS DE FINAL</div>
        <div class="bracket-cards-stack">
          ${renderSymmetricBracketCard(qf1, 'QF 01', 'card-qf-1')}
          ${renderSymmetricBracketCard(qf2, 'QF 02', 'card-qf-2')}
        </div>
      </div>

      <!-- COLUMNA 2: SEMIFINAL (Izq) -->
      <div class="bracket-col col-sf col-left">
        <div class="bracket-col-header">SEMIFINAL</div>
        <div class="bracket-cards-stack centered">
          ${renderSymmetricBracketCard(sf1, 'SF 01', 'card-sf-1')}
        </div>
      </div>

      <!-- COLUMNA 3: CENTRO (FINAL + CAMPEÓN) -->
      <div class="bracket-col col-center">
        <div class="bracket-col-header">GRAN FINAL</div>
        <div class="bracket-cards-stack center-stack">
          ${renderSymmetricBracketCard(finalM, 'FINAL', 'card-final')}
          ${renderChampionCard(finalM)}
        </div>
      </div>

      <!-- COLUMNA 4: SEMIFINAL (Der) -->
      <div class="bracket-col col-sf col-right">
        <div class="bracket-col-header">SEMIFINAL</div>
        <div class="bracket-cards-stack centered">
          ${renderSymmetricBracketCard(sf2, 'SF 02', 'card-sf-2')}
        </div>
      </div>

      <!-- COLUMNA 5: CUARTOS DE FINAL (Der) -->
      <div class="bracket-col col-qf col-right">
        <div class="bracket-col-header">CUARTOS DE FINAL</div>
        <div class="bracket-cards-stack">
          ${renderSymmetricBracketCard(qf3, 'QF 03', 'card-qf-3')}
          ${renderSymmetricBracketCard(qf4, 'QF 04', 'card-qf-4')}
        </div>
      </div>
    </div>
  `;

  // Calcular conectores en el siguiente frame
  requestAnimationFrame(() => {
    updateBracketConnectors();
  });
}

function ensureSymmetricKnockoutStructure() {
  if (!tournamentState.matches) tournamentState.matches = [];
  const matches = tournamentState.matches;

  const findOrCreate = (id, roundName, round, nextMatchId, nextSlot, defaultHome, defaultAway) => {
    let m = matches.find(x => x.id === id);
    if (!m) {
      m = matches.find(x => x.roundName && x.roundName.toLowerCase().includes(roundName.toLowerCase()) && !matches.some(o => o !== x && o.id === id));
    }
    if (!m) {
      m = {
        id: id,
        round: round,
        roundName: roundName,
        isKnockout: true,
        homeTeamId: null,
        awayTeamId: null,
        homeTeamPlaceholder: defaultHome,
        awayTeamPlaceholder: defaultAway,
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'pending',
        isFinished: false,
        isLocked: false,
        venue: 'Cancha Central',
        date: '',
        time: '',
        nextMatchId: nextMatchId,
        nextSlot: nextSlot
      };
      matches.push(m);
    } else {
      m.id = m.id || id;
      m.isKnockout = true;
      if (nextMatchId) m.nextMatchId = nextMatchId;
      if (nextSlot) m.nextSlot = nextSlot;
    }
    return m;
  };

  const qf1 = findOrCreate('ko-qf-1', 'Cuartos 1', 1, 'ko-sf-1', 'home', '1º Grupo A', '2º Grupo B');
  const qf2 = findOrCreate('ko-qf-2', 'Cuartos 2', 1, 'ko-sf-1', 'away', '1º Grupo C', '2º Grupo D');
  const qf3 = findOrCreate('ko-qf-3', 'Cuartos 3', 1, 'ko-sf-2', 'home', '1º Grupo B', '2º Grupo A');
  const qf4 = findOrCreate('ko-qf-4', 'Cuartos 4', 1, 'ko-sf-2', 'away', '1º Grupo D', '2º Grupo C');
  const sf1 = findOrCreate('ko-sf-1', 'Semifinal 1', 2, 'ko-final', 'home', 'Ganador QF 01', 'Ganador QF 02');
  const sf2 = findOrCreate('ko-sf-2', 'Semifinal 2', 2, 'ko-final', 'away', 'Ganador QF 03', 'Ganador QF 04');
  const finalM = findOrCreate('ko-final', 'Gran Final 🏆', 3, null, null, 'Ganador SF 01', 'Ganador SF 02');

  // Si los cuartos no tienen equipos asignados pero hay equipos o tabla en el torneo
  const teams = tournamentState.teams || [];
  let standings = [];
  try {
    if (typeof calculateStandings === 'function') standings = calculateStandings();
  } catch (e) {}

  const getTeamFromStandingOrList = (idx) => {
    if (standings && standings[idx]) return getTeamById(standings[idx].teamId);
    if (teams && teams[idx]) return teams[idx];
    return null;
  };

  if (teams.length >= 8) {
    const t1 = getTeamFromStandingOrList(0);
    const t8 = getTeamFromStandingOrList(7);
    const t4 = getTeamFromStandingOrList(3);
    const t5 = getTeamFromStandingOrList(4);
    const t2 = getTeamFromStandingOrList(1);
    const t7 = getTeamFromStandingOrList(6);
    const t3 = getTeamFromStandingOrList(2);
    const t6 = getTeamFromStandingOrList(5);

    if (!qf1.homeTeamId && t1) { qf1.homeTeamId = t1.id; qf1.homeTeamPlaceholder = t1.name; }
    if (!qf1.awayTeamId && t8) { qf1.awayTeamId = t8.id; qf1.awayTeamPlaceholder = t8.name; }
    if (!qf2.homeTeamId && t4) { qf2.homeTeamId = t4.id; qf2.homeTeamPlaceholder = t4.name; }
    if (!qf2.awayTeamId && t5) { qf2.awayTeamId = t5.id; qf2.awayTeamPlaceholder = t5.name; }
    if (!qf3.homeTeamId && t2) { qf3.homeTeamId = t2.id; qf3.homeTeamPlaceholder = t2.name; }
    if (!qf3.awayTeamId && t7) { qf3.awayTeamId = t7.id; qf3.awayTeamPlaceholder = t7.name; }
    if (!qf4.homeTeamId && t3) { qf4.homeTeamId = t3.id; qf4.homeTeamPlaceholder = t3.name; }
    if (!qf4.awayTeamId && t6) { qf4.awayTeamId = t6.id; qf4.awayTeamPlaceholder = t6.name; }
  } else if (teams.length >= 4) {
    if (!qf1.homeTeamId && teams[0]) { qf1.homeTeamId = teams[0].id; qf1.homeTeamPlaceholder = teams[0].name; }
    if (!qf2.homeTeamId && teams[1]) { qf2.homeTeamId = teams[1].id; qf2.homeTeamPlaceholder = teams[1].name; }
    if (!qf3.homeTeamId && teams[2]) { qf3.homeTeamId = teams[2].id; qf3.homeTeamPlaceholder = teams[2].name; }
    if (!qf4.homeTeamId && teams[3]) { qf4.homeTeamId = teams[3].id; qf4.homeTeamPlaceholder = teams[3].name; }
  }

  // Asegurar avance de ganadores
  [qf1, qf2, qf3, qf4, sf1, sf2, finalM].forEach(m => {
    if (m.isFinished) propagateKnockoutWinner(m);
  });

  return { qf1, qf2, qf3, qf4, sf1, sf2, finalM };
}

function renderSymmetricBracketCard(m, code, cardId) {
  const homeTeam = getTeamById(m.homeTeamId);
  const awayTeam = getTeamById(m.awayTeamId);

  const homeName = homeTeam ? homeTeam.name : (m.homeTeamPlaceholder || 'Por definir');
  const homeColor = homeTeam ? (homeTeam.color || '#1EC1CB') : '#475569';
  const awayName = awayTeam ? awayTeam.name : (m.awayTeamPlaceholder || 'Por definir');
  const awayColor = awayTeam ? (awayTeam.color || '#10B981') : '#475569';

  const isFinished = (m.isFinished === true) || (m.status === 'finished');
  const isLive = (m.status === 'live');
  let statusClass = 'proximo';
  let statusText = 'PRÓXIMO';
  if (isFinished) {
    statusClass = 'finalizado';
    statusText = 'FINALIZADO';
  } else if (isLive) {
    statusClass = 'envivo';
    statusText = 'EN VIVO';
  }

  let homeScoreDisplay = (m.homeScore !== null && m.homeScore !== undefined) ? m.homeScore : '-';
  let awayScoreDisplay = (m.awayScore !== null && m.awayScore !== undefined) ? m.awayScore : '-';

  let homeWon = false;
  let awayWon = false;
  let penaltiesInfo = '';

  if (isFinished && m.homeScore !== null && m.awayScore !== null) {
    if (m.homeScore > m.awayScore) homeWon = true;
    else if (m.awayScore > m.homeScore) awayWon = true;
    else if (typeof m.homePenalties === 'number' && typeof m.awayPenalties === 'number') {
      if (m.homePenalties > m.awayPenalties) homeWon = true;
      else if (m.awayPenalties > m.homePenalties) awayWon = true;
      penaltiesInfo = `Pen: ${m.homePenalties}-${m.awayPenalties}`;
    }
  }

  let dateVenue = 'Por programar';
  if (m.venue || m.date) {
    dateVenue = [m.date, m.time, m.venue].filter(Boolean).join(' • ') || 'Por programar';
  }

  const isOrg = (typeof isOrganizerOrAdmin === 'function' && isOrganizerOrAdmin(window.userSession?.role)) ||
                (document.body.classList.contains('role-admin') || document.body.classList.contains('role-organizer'));
  const clickHint = isOrg ? 'title="Haz clic para registrar o editar el marcador de esta llave"' : '';
  const cursorStyle = isOrg ? 'cursor: pointer;' : '';

  return `
    <div class="bracket-glass-card" id="${cardId}" data-match-id="${m.id}" onclick="handleBracketCardClick('${m.id}')" style="${cursorStyle}" ${clickHint}>
      <div class="bracket-card-top-bar">
        <span class="bracket-code-badge">${code}</span>
        <span class="bracket-status-pill status-${statusClass}">${statusText}</span>
      </div>

      <div class="bracket-team-slot ${homeWon ? 'is-winner' : ''}">
        <div class="bracket-team-info">
          <span class="bracket-team-dot" style="background-color: ${escapeHtml(homeColor)};"></span>
          <span class="bracket-team-name" title="${escapeHtml(homeName)}">${escapeHtml(homeName)}</span>
          ${homeWon ? '<span class="winner-check-mark">✓</span>' : ''}
        </div>
        <span class="bracket-team-score">${homeScoreDisplay}</span>
      </div>

      <div class="bracket-team-slot ${awayWon ? 'is-winner' : ''}">
        <div class="bracket-team-info">
          <span class="bracket-team-dot" style="background-color: ${escapeHtml(awayColor)};"></span>
          <span class="bracket-team-name" title="${escapeHtml(awayName)}">${escapeHtml(awayName)}</span>
          ${awayWon ? '<span class="winner-check-mark">✓</span>' : ''}
        </div>
        <span class="bracket-team-score">${awayScoreDisplay}</span>
      </div>

      <div class="bracket-card-footer">
        <span class="bracket-footer-venue">📍 ${escapeHtml(dateVenue)}</span>
        ${penaltiesInfo ? `<span class="bracket-footer-pen">${penaltiesInfo}</span>` : ''}
        ${isOrg ? '<span class="bracket-edit-badge" title="Editar marcador">✏️</span>' : ''}
      </div>
    </div>
  `;
}

function renderChampionCard(finalM) {
  let championName = 'Por definir';
  let championDesc = 'El ganador aparecerá aquí';
  let isCrown = false;
  let championShieldHtml = '';

  if (finalM && (finalM.isFinished || finalM.status === 'finished') && finalM.homeScore !== null && finalM.awayScore !== null) {
    let winnerId = null;
    let winnerPlaceholder = null;
    if (finalM.homeScore > finalM.awayScore) {
      winnerId = finalM.homeTeamId;
      winnerPlaceholder = finalM.homeTeamPlaceholder;
    } else if (finalM.awayScore > finalM.homeScore) {
      winnerId = finalM.awayTeamId;
      winnerPlaceholder = finalM.awayTeamPlaceholder;
    } else if (typeof finalM.homePenalties === 'number' && typeof finalM.awayPenalties === 'number') {
      if (finalM.homePenalties > finalM.awayPenalties) {
        winnerId = finalM.homeTeamId;
        winnerPlaceholder = finalM.homeTeamPlaceholder;
      } else {
        winnerId = finalM.awayTeamId;
        winnerPlaceholder = finalM.awayTeamPlaceholder;
      }
    }

    const team = getTeamById(winnerId);
    if (team) {
      championName = team.name;
      championDesc = '¡Monarca Oficial del Torneo!';
      isCrown = true;
      championShieldHtml = `<div style="width: 44px; height: 44px; margin: 8px auto 0; display:flex; align-items:center; justify-content:center;">${renderTeamShieldElement(team)}</div>`;
    } else if (winnerPlaceholder) {
      championName = winnerPlaceholder;
      championDesc = '¡Campeón Confirmado de la Gran Final!';
      isCrown = true;
    }
  }

  return `
    <div class="bracket-champion-card ${isCrown ? 'has-champion' : ''}" id="bracketChampionCard">
      <div class="champion-trophy-halo">
        <div class="champion-trophy-glow"></div>
        <span class="champion-trophy-icon">🏆</span>
      </div>
      <div class="champion-pill-tag">CAMPEÓN</div>
      <h3 class="bracket-champion-title">${escapeHtml(championName)}</h3>
      <p class="bracket-champion-desc">${escapeHtml(championDesc)}</p>
      ${championShieldHtml}
    </div>
  `;
}

function updateBracketConnectors() {
  const grid = document.getElementById('bracket5ColGrid');
  const svg = document.getElementById('bracketConnectorSvg');
  if (!grid || !svg) return;

  const gridRect = grid.getBoundingClientRect();
  if (gridRect.width === 0 || gridRect.height === 0) return;

  const getCardAnchors = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: { x: r.left - gridRect.left, y: r.top + r.height / 2 - gridRect.top },
      right: { x: r.right - gridRect.left, y: r.top + r.height / 2 - gridRect.top }
    };
  };

  const drawBezier = (pathId, p1, p2, isLeftToRight) => {
    const path = document.getElementById(pathId);
    if (!path || !p1 || !p2) return;
    const dx = Math.abs(p2.x - p1.x) * 0.45;
    const c1x = isLeftToRight ? p1.x + dx : p1.x - dx;
    const c2x = isLeftToRight ? p2.x - dx : p2.x + dx;
    path.setAttribute('d', `M ${p1.x} ${p1.y} C ${c1x} ${p1.y}, ${c2x} ${p2.y}, ${p2.x} ${p2.y}`);
  };

  const qf1 = getCardAnchors('card-qf-1');
  const qf2 = getCardAnchors('card-qf-2');
  const sf1 = getCardAnchors('card-sf-1');
  const finalC = getCardAnchors('card-final');
  const sf2 = getCardAnchors('card-sf-2');
  const qf3 = getCardAnchors('card-qf-3');
  const qf4 = getCardAnchors('card-qf-4');

  if (qf1 && sf1) drawBezier('conn-qf1-sf1', qf1.right, sf1.left, true);
  if (qf2 && sf1) drawBezier('conn-qf2-sf1', qf2.right, sf1.left, true);
  if (sf1 && finalC) drawBezier('conn-sf1-final', sf1.right, finalC.left, true);
  if (sf2 && finalC) drawBezier('conn-sf2-final', sf2.left, finalC.right, false);
  if (qf3 && sf2) drawBezier('conn-qf3-sf2', qf3.left, sf2.right, false);
  if (qf4 && sf2) drawBezier('conn-qf4-sf2', qf4.left, sf2.right, false);
}

// Escuchar redimensionamiento para recalcular conectores SVG
if (typeof window !== 'undefined' && !window._bracketResizeAttached) {
  window._bracketResizeAttached = true;
  window.addEventListener('resize', () => {
    requestAnimationFrame(updateBracketConnectors);
  });
}

window.renderBrackets = renderBrackets;
window.updateBracketConnectors = updateBracketConnectors;

window.handleBracketCardClick = function(matchId) {
  const isOrg = (typeof isOrganizerOrAdmin === 'function' && isOrganizerOrAdmin(window.userSession?.role)) ||
                (document.body.classList.contains('role-admin') || document.body.classList.contains('role-organizer'));
  if (!isOrg) {
    if (typeof showToast === 'function') {
      showToast('Modo Consulta: Solo los organizadores y administradores pueden modificar marcadores.', 'info', 2800);
    }
    return;
  }

  const match = (tournamentState.matches || []).find(m => m.id === matchId);
  if (!match) return;

  const modal = document.getElementById('bracketScoreModal');
  if (!modal) return;

  document.getElementById('bracketModalMatchId').value = match.id;
  document.getElementById('bracketModalTitle').textContent = `Editar ${match.roundName || 'Llave Eliminatoria'}`;
  
  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);
  const homeName = homeTeam ? homeTeam.name : (match.homeTeamPlaceholder || 'Equipo Local');
  const awayName = awayTeam ? awayTeam.name : (match.awayTeamPlaceholder || 'Equipo Visitante');

  document.getElementById('bracketModalSubtitle').textContent = `${homeName} vs ${awayName}`;
  document.getElementById('bracketModalHomeName').textContent = homeName;
  document.getElementById('bracketModalAwayName').textContent = awayName;

  document.getElementById('bracketModalHomeScore').value = (match.homeScore !== null && match.homeScore !== undefined) ? match.homeScore : '';
  document.getElementById('bracketModalAwayScore').value = (match.awayScore !== null && match.awayScore !== undefined) ? match.awayScore : '';
  document.getElementById('bracketModalHomePen').value = (match.homePenalties !== null && match.homePenalties !== undefined) ? match.homePenalties : '';
  document.getElementById('bracketModalAwayPen').value = (match.awayPenalties !== null && match.awayPenalties !== undefined) ? match.awayPenalties : '';

  document.getElementById('bracketModalStatus').value = match.status || (match.isFinished ? 'finished' : 'pending');
  document.getElementById('bracketModalVenue').value = match.venue || '';

  modal.style.display = 'flex';
};

window.closeBracketScoreModal = function() {
  const modal = document.getElementById('bracketScoreModal');
  if (modal) modal.style.display = 'none';
};

window.saveBracketMatchScore = function(event) {
  if (event) event.preventDefault();
  const matchId = document.getElementById('bracketModalMatchId').value;
  const match = (tournamentState.matches || []).find(m => m.id === matchId);
  if (!match) return;

  const hScoreVal = document.getElementById('bracketModalHomeScore').value;
  const aScoreVal = document.getElementById('bracketModalAwayScore').value;
  const hPenVal = document.getElementById('bracketModalHomePen').value;
  const aPenVal = document.getElementById('bracketModalAwayPen').value;
  const statusVal = document.getElementById('bracketModalStatus').value;
  const venueVal = document.getElementById('bracketModalVenue').value;

  const hScore = hScoreVal === '' ? null : parseInt(hScoreVal, 10);
  const aScore = aScoreVal === '' ? null : parseInt(aScoreVal, 10);
  const hPen = hPenVal === '' ? null : parseInt(hPenVal, 10);
  const aPen = aPenVal === '' ? null : parseInt(aPenVal, 10);

  match.homeScore = hScore;
  match.awayScore = aScore;
  match.homePenalties = hPen;
  match.awayPenalties = aPen;
  match.status = statusVal;
  match.isFinished = (statusVal === 'finished') || (hScore !== null && aScore !== null && statusVal !== 'pending');
  if (venueVal) match.venue = venueVal;

  // Propagación automática del ganador a la siguiente llave y hasta CAMPEÓN
  propagateKnockoutWinner(match);

  saveState();
  closeBracketScoreModal();

  renderBrackets();
  if (typeof updateProgressStatsOnly === 'function') updateProgressStatsOnly();
  if (typeof renderStandingsView === 'function') renderStandingsView();
  if (typeof renderTvMode === 'function') renderTvMode();

  if (typeof showToast === 'function') {
    showToast('Marcador guardado. ¡El ganador avanzó automáticamente en el cuadro! 🏆', 'success', 2800);
  }
};

// =============================================================================
// 16. REGISTRO DE GOLEADORES (PICHICHI)
// =============================================================================

function renderTopScorers() {
  if (!dom.scorersTableBody) return;

  const matches = tournamentState.matches || [];
  const scorerMap = {};
  let totalGoals = 0;

  matches.forEach(m => {
    if (m.isFinished && m.homeScore !== null && m.awayScore !== null) {
      totalGoals += (m.homeScore + m.awayScore);
    }

    if (Array.isArray(m.scorers)) {
      m.scorers.forEach(s => {
        const pName = (s.playerName || '').trim();
        if (!pName) return;

        const key = `${pName.toLowerCase()}-${s.teamId}`;
        const goalsCount = parseInt(s.goals, 10) || 1;

        if (!scorerMap[key]) {
          scorerMap[key] = {
            name: pName,
            teamId: s.teamId,
            goals: 0
          };
        }
        scorerMap[key].goals += goalsCount;
      });
    }
  });

  if (dom.totalGoalsCount) dom.totalGoalsCount.textContent = totalGoals;

  const scorersList = Object.values(scorerMap);
  scorersList.sort((a, b) => b.goals - a.goals);

  if (scorersList.length === 0) {
    dom.scorersTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Aún no se han anotado goleadores en los partidos.
        </td>
      </tr>
    `;
    return;
  }

  const html = scorersList.slice(0, 10).map((scorer, idx) => {
    const team = getTeamById(scorer.teamId);
    const teamName = team ? team.name : 'Club';
    const teamColor = team ? team.color : '#10b981';

    let rankBadge = `${idx + 1}`;
  if (idx === 0) rankBadge = '🥇';
  else if (idx === 1) rankBadge = '🥈';
  else if (idx === 2) rankBadge = '🥉';

    return `
      <tr>
        <td style="text-align: center; font-weight: 800;">${rankBadge}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-weight: 700; color: #ffffff;">${escapeHtml(scorer.name)}</span>
          </div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${escapeHtml(teamColor)}; display: inline-block;"></span>
            <span style="color: var(--text-secondary);">${escapeHtml(teamName)}</span>
          </div>
        </td>
        <td style="text-align: center;">
          <span class="scorer-goals-pill">${scorer.goals}</span>
        </td>
      </tr>
    `;
  }).join('');

  dom.scorersTableBody.innerHTML = html;
}

function initScorersModal() {
  const closeModal = () => {
    dom.scorersModal.style.display = 'none';
  };

  if (dom.btnCloseScorersModal) dom.btnCloseScorersModal.addEventListener('click', closeModal);
  if (dom.btnCancelScorers) dom.btnCancelScorers.addEventListener('click', closeModal);

  if (dom.scorersModal) dom.scorersModal.addEventListener('click', (e) => {
    if (e.target === dom.scorersModal) closeModal();
  });

  if (dom.btnSaveScorers) dom.btnSaveScorers.addEventListener('click', () => {
    const matchId = dom.scorersModalMatchId.value;
    const match = tournamentState.matches.find(m => m.id === matchId);
    if (!match) return;

    const newScorers = [];

    const homeRows = dom.scorersHomeList.querySelectorAll('.scorer-row');
    homeRows.forEach(row => {
      const nameInput = row.querySelector('.scorer-name-input');
      const goalsInput = row.querySelector('.scorer-goals-input');
      const name = nameInput.value.trim();
      const goals = parseInt(goalsInput.value, 10) || 1;
      if (name) {
        newScorers.push({ playerName: name, goals: goals, teamId: match.homeTeamId });
      }
    });

    const awayRows = dom.scorersAwayList.querySelectorAll('.scorer-row');
    awayRows.forEach(row => {
      const nameInput = row.querySelector('.scorer-name-input');
      const goalsInput = row.querySelector('.scorer-goals-input');
      const name = nameInput.value.trim();
      const goals = parseInt(goalsInput.value, 10) || 1;
      if (name) {
        newScorers.push({ playerName: name, goals: goals, teamId: match.awayTeamId });
      }
    });

    // Validación de integridad y pertenencia de goleadores
    const hScore = (match.homeScore !== undefined && match.homeScore !== null) ? parseInt(match.homeScore, 10) : null;
    const aScore = (match.awayScore !== undefined && match.awayScore !== null) ? parseInt(match.awayScore, 10) : null;
    
    let sumHome = 0;
    let sumAway = 0;
    newScorers.forEach(s => {
      if (s.teamId === match.homeTeamId) sumHome += s.goals;
      else if (s.teamId === match.awayTeamId) sumAway += s.goals;
    });

    if (hScore !== null && aScore !== null && newScorers.length > 0) {
      if (sumHome !== hScore || sumAway !== aScore) {
        showToast(`Inconsistencia en planilla: Los goles asignados (Local: ${sumHome}, Visitante: ${sumAway}) deben coincidir con el resultado final (${hScore} - ${aScore}).`, 'warning', 4500);
        return;
      }
    }

    match.scorers = newScorers;
    match.reviewStatus = 'verified';
    FMPStore.recalculateTournamentStandings(tournamentState);
    saveState();
    renderFixturesList();
    renderStandingsView();
    closeModal();
    showToast('Anotadores guardados y tabla de posiciones recalculada con éxito', 'success');
  });

  // Carga y verificación de actas oficiales (Fase 6)
  const inputMatchActaFile = document.getElementById('inputMatchActaFile');
  const btnUploadActaDoc = document.getElementById('btnUploadActaDoc');
  const actaPreReviewBox = document.getElementById('actaPreReviewBox');
  const actaPreReviewSummary = document.getElementById('actaPreReviewSummary');
  const btnConfirmActaData = document.getElementById('btnConfirmActaData');
  const scorersModalActaBadge = document.getElementById('scorersModalActaBadge');

  if (btnUploadActaDoc && inputMatchActaFile) {
    btnUploadActaDoc.addEventListener('click', () => {
      const file = inputMatchActaFile.files[0];
      if (!file) {
        showToast('Selecciona un archivo PDF o imagen de acta para continuar.', 'warning');
        return;
      }

      const matchId = dom.scorersModalMatchId.value;
      const res = FMPStore.uploadMatchActa(activeTournamentId, matchId, file);
      if (!res.ok) {
        showToast(res.error, 'error', 4000);
        return;
      }

      if (scorersModalActaBadge) {
        scorersModalActaBadge.textContent = 'En Pre-Revisión (OCR)';
        scorersModalActaBadge.style.background = 'rgba(251, 191, 36, 0.2)';
        scorersModalActaBadge.style.color = '#fbbf24';
        scorersModalActaBadge.style.borderColor = 'rgba(251, 191, 36, 0.4)';
      }

      if (actaPreReviewBox && actaPreReviewSummary) {
        actaPreReviewSummary.innerHTML = `
          <strong>Archivo:</strong> ${escapeHtml(file.name)} (${(file.size/1024).toFixed(1)} KB)<br>
          <strong>Marcador Extraído:</strong> ${res.extracted.extractedHomeScore} - ${res.extracted.extractedAwayScore}<br>
          <strong>Goleadores Detectados:</strong> Delantero Oficial (1), Volante Creativo (1), Capitán Rival (1)
        `;
        actaPreReviewBox.style.display = 'block';
      }

      showToast('Acta extraída con éxito. Confirma los datos para asentar en planilla oficial.', 'info', 3500);
    });
  }

  if (btnConfirmActaData) {
    btnConfirmActaData.addEventListener('click', () => {
      const matchId = dom.scorersModalMatchId.value;
      const match = tournamentState.matches.find(m => m.id === matchId);
      if (!match) return;

      const ownership = FMPStore.assertTournamentOwnership(activeTournamentId, 'ASENTAR_ACTA_OFICIAL');
      if (!ownership.ok) {
        showToast(ownership.error, 'error');
        return;
      }

      match.homeScore = 2;
      match.scoreHome = 2;
      match.awayScore = 1;
      match.scoreAway = 1;
      match.status = 'finished';
      match.isFinished = true;
      match.reviewStatus = 'verified';
      match.scorers = [
        { playerName: 'Delantero Oficial', goals: 1, teamId: match.homeTeamId },
        { playerName: 'Volante Creativo', goals: 1, teamId: match.homeTeamId },
        { playerName: 'Capitán Rival', goals: 1, teamId: match.awayTeamId }
      ];

      FMPStore.recalculateTournamentStandings(tournamentState);
      saveState();
      renderFixturesList();
      renderStandingsView();
      closeModal();
      showToast('¡Acta oficial confirmada y verificada exitosamente! Marcador y tabla asentados.', 'success', 4000);
    });
  }
}

window.openScorersModal = function(matchId) {
  const match = tournamentState.matches.find(m => m.id === matchId);
  if (!match) return;

  dom.scorersModalMatchId.value = match.id;

  const homeTeam = getTeamById(match.homeTeamId);
  const awayTeam = getTeamById(match.awayTeamId);

  const homeName = homeTeam ? homeTeam.name : (match.homeTeamPlaceholder || 'Local');
  const awayName = awayTeam ? awayTeam.name : (match.awayTeamPlaceholder || 'Visitante');

  dom.scorersModalMatchSubtitle.textContent = `${match.roundName} • ${homeName} vs ${awayName}`;
  dom.scorersHomeTeamName.textContent = homeName;
  dom.scorersAwayTeamName.textContent = awayName;

  dom.scorersHomeTeamDot.style.backgroundColor = homeTeam ? homeTeam.color : '#10b981';
  dom.scorersAwayTeamDot.style.backgroundColor = awayTeam ? awayTeam.color : '#3b82f6';

  // Actualizar datalists de jugadores habilitados para autocompletado seguro
  let homeDatalist = document.getElementById('playersList-home');
  if (!homeDatalist) {
    homeDatalist = document.createElement('datalist');
    homeDatalist.id = 'playersList-home';
    document.body.appendChild(homeDatalist);
  }
  const homePlayers = (homeTeam && Array.isArray(homeTeam.players)) 
    ? homeTeam.players.filter(p => p.isHabilitado !== false) 
    : [];
  homeDatalist.innerHTML = homePlayers.map(p => `<option value="${escapeHtml(p.name)}">#${p.dorsal || ''} - ${escapeHtml(p.position || '')} (Habilitado)</option>`).join('');

  let awayDatalist = document.getElementById('playersList-away');
  if (!awayDatalist) {
    awayDatalist = document.createElement('datalist');
    awayDatalist.id = 'playersList-away';
    document.body.appendChild(awayDatalist);
  }
  const awayPlayers = (awayTeam && Array.isArray(awayTeam.players)) 
    ? awayTeam.players.filter(p => p.isHabilitado !== false) 
    : [];
  awayDatalist.innerHTML = awayPlayers.map(p => `<option value="${escapeHtml(p.name)}">#${p.dorsal || ''} - ${escapeHtml(p.position || '')} (Habilitado)</option>`).join('');

  dom.scorersHomeList.innerHTML = '';
  dom.scorersAwayList.innerHTML = '';

  const scorers = Array.isArray(match.scorers) ? match.scorers : [];
  const homeScorers = scorers.filter(s => s.teamId === match.homeTeamId);
  const awayScorers = scorers.filter(s => s.teamId === match.awayTeamId);

  if (homeScorers.length === 0) {
    addScorerRow('home');
  } else {
    homeScorers.forEach(s => addScorerRow('home', s.playerName, s.goals));
  }

  if (awayScorers.length === 0) {
    addScorerRow('away');
  } else {
    awayScorers.forEach(s => addScorerRow('away', s.playerName, s.goals));
  }

  dom.scorersModal.style.display = 'flex';
};

window.addScorerRow = function(side, name = '', goals = 1) {
  const targetList = side === 'home' ? dom.scorersHomeList : dom.scorersAwayList;
  if (!targetList) return;

  const row = document.createElement('div');
  row.className = 'scorer-row';
  row.innerHTML = `
    <input 
      type="text" 
      class="scorer-name-input" 
      placeholder="Nombre del goleador..." 
      value="${escapeHtml(name)}"
      list="playersList-${side}"
    >
    <input 
      type="number" 
      class="scorer-goals-input" 
      value="${goals}" 
      min="1" 
      max="20"
      title="Cantidad de goles"
    >
    <button type="button" class="btn-remove-scorer" onclick="this.parentElement.remove()" title="Eliminar fila">&times;</button>
  `;
  targetList.appendChild(row);
};

// =============================================================================
// 17. MODO TV BROADCAST EN VIVO
// =============================================================================
let tvClockInterval = null;

function initTvControls() {
  if (dom.btnToggleFullscreen) {
    if (dom.btnToggleFullscreen) dom.btnToggleFullscreen.addEventListener('click', toggleTvFullscreen);
  }

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      dom.fullscreenBtnText.textContent = 'Salir de Pantalla Completa';
    } else {
      dom.fullscreenBtnText.textContent = 'Pantalla Completa';
    }
  });

  startTvClock();
}

function startTvClock() {
  if (tvClockInterval) clearInterval(tvClockInterval);

  const updateClock = () => {
    const now = new Date();
    if (dom.tvDigitalClock) {
      dom.tvDigitalClock.textContent = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
    if (dom.tvDateDisplay) {
      dom.tvDateDisplay.textContent = now.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }).toUpperCase();
    }
  };

  updateClock();
  tvClockInterval = setInterval(updateClock, 1000);
}

function toggleTvFullscreen() {
  const tvSection = document.getElementById('tab-tv');
  if (!tvSection) return;

  if (!document.fullscreenElement) {
    tvSection.requestFullscreen().catch(err => {
      console.warn('Error al activar fullscreen:', err);
      showToast('No se pudo activar pantalla completa en tu navegador', 'warning');
    });
  } else {
    document.exitFullscreen().catch(err => console.warn(err));
  }
}

function renderTvMode() {
  const isGenerated = tournamentState.isGenerated && tournamentState.matches.length > 0;

  if (!isGenerated) {
    if (dom.tvEmptyState) dom.tvEmptyState.style.display = 'block';
    if (dom.tvActiveView) dom.tvActiveView.style.display = 'none';
    return;
  }

  if (dom.tvEmptyState) dom.tvEmptyState.style.display = 'none';
  if (dom.tvActiveView) dom.tvActiveView.style.display = 'flex';

  if (dom.tvTournamentTitle) {
    dom.tvTournamentTitle.textContent = tournamentState.config.name || 'FutbolMaster Pro 2026';
  }

  const standings = calculateStandings();
  if (dom.tvStandingsBody) {
    dom.tvStandingsBody.innerHTML = standings.slice(0, 8).map((row, idx) => {
      const shieldHtml = renderTeamShieldElement(row);
      return `
        <tr>
          <td style="font-weight: 800; color: ${idx < 4 ? 'var(--accent-green)' : 'var(--text-muted)'};">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div style="width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
                ${shieldHtml}
              </div>
              <span style="font-weight: 700; color: #ffffff;">${escapeHtml(row.name)}</span>
            </div>
          </td>
          <td><strong>${row.pts}</strong></td>
          <td>${row.pj}</td>
          <td>${row.dg > 0 ? `+${row.dg}` : row.dg}</td>
        </tr>
      `;
    }).join('');
  }

  const matches = tournamentState.matches || [];
  const finished = matches.filter(m => !m.isBye && m.isFinished);
  const upcoming = matches.filter(m => !m.isBye && !m.isFinished);

  if (dom.tvRecentMatchesList) {
    if (finished.length === 0) {
      dom.tvRecentMatchesList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.85rem;">Aún no hay resultados de partidos finalizados.</div>`;
    } else {
      dom.tvRecentMatchesList.innerHTML = finished.slice(-4).reverse().map(m => {
        const home = getTeamById(m.homeTeamId);
        const away = getTeamById(m.awayTeamId);
        const homeName = home ? home.name : (m.homeTeamPlaceholder || 'Local');
        const awayName = away ? away.name : (m.awayTeamPlaceholder || 'Visitante');

        return `
          <div class="tv-match-card-mini">
            <span class="tv-round-tag">${escapeHtml(m.roundName)}</span>
            <div class="tv-teams-row">
              <span style="color: ${m.homeScore > m.awayScore ? 'var(--accent-green)' : '#fff'}; font-weight: 700;">${escapeHtml(homeName)}</span>
              <span class="tv-score-pill">${m.homeScore} : ${m.awayScore}</span>
              <span style="color: ${m.awayScore > m.homeScore ? 'var(--accent-green)' : '#fff'}; font-weight: 700;">${escapeHtml(awayName)}</span>
            </div>
            <div class="tv-venue-tag"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-3"></path></svg> &bull; </div>
          </div>
        `;
      }).join('');
    }
  }

  if (dom.tvUpcomingMatchesList) {
    if (upcoming.length === 0) {
      dom.tvUpcomingMatchesList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.85rem;">Todos los partidos del torneo han sido disputados.</div>`;
    } else {
      dom.tvUpcomingMatchesList.innerHTML = upcoming.slice(0, 4).map(m => {
        const home = getTeamById(m.homeTeamId);
        const away = getTeamById(m.awayTeamId);
        const homeName = home ? home.name : (m.homeTeamPlaceholder || 'Por definir');
        const awayName = away ? away.name : (m.awayTeamPlaceholder || 'Por definir');

        return `
          <div class="tv-match-card-mini upcoming">
            <span class="tv-round-tag">${escapeHtml(m.roundName)}</span>
            <div class="tv-teams-row">
              <span>${escapeHtml(homeName)}</span>
              <span class="tv-vs-badge">VS</span>
              <span>${escapeHtml(awayName)}</span>
            </div>
            <div class="tv-venue-tag">${escapeHtml(m.time || "Horario por definir")} &bull; ${escapeHtml(m.venue || "Cancha asignada")}</div>
          </div>
        `;
      }).join('');
    }
  }

  if (dom.tvQrCodeImg) {
    const tournamentUrl = window.location.href;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(tournamentUrl)}&color=ffffff&bgcolor=0d1322`;
    dom.tvQrCodeImg.src = qrApiUrl;
  }
}

// =============================================================================
// 18. FASE 4: MODO Público (SOLO LECTURA), EXPORTACIÓN AVANZADA E IMPRESIÓN PDF
// =============================================================================

/**
 * Activa o desactiva la Vista Pública / Modo Espectador de solo lectura
 */
function setPublicMode(enable, updateUrl = true) {
  tournamentState.isPublicMode = !!enable;

  if (tournamentState.isPublicMode) {
    try {
      sessionStorage.removeItem('fmp_splash_completed');
      sessionStorage.removeItem('fmp_splash_played');
    } catch(e){}
    document.body.classList.add('public-mode-active');
    if (dom.publicModeBanner) dom.publicModeBanner.style.display = 'block';
    if (dom.publicModeBtnText) dom.publicModeBtnText.textContent = 'Modo Publico';

    // Si estaba en la pestaña de configuración, redirigir a tablas o calendario
    if (tournamentState.currentTab === 'tab-config') {
      const target = (tournamentState.isGenerated && tournamentState.matches.length > 0) ? 'tab-standings' : 'tab-fixtures';
      switchTab(target);
    }

    showToast('Modo Espectador (Solo Lectura) activado', 'info', 2500);
  } else {
    document.body.classList.remove('public-mode-active');
    if (dom.publicModeBanner) dom.publicModeBanner.style.display = 'none';
    if (dom.publicModeBtnText) dom.publicModeBtnText.textContent = 'Modo EdiciÃ³n';
  }

  if (updateUrl) {
    try {
      const url = new URL(window.location.href);
      if (tournamentState.isPublicMode) {
        url.searchParams.set('view', 'public');
      } else {
        url.searchParams.delete('view');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      console.warn('No se pudo actualizar la URL:', e);
    }
  }

  // Refrescar fixture para actualizar atributos disabled
  if (tournamentState.isGenerated && tournamentState.matches.length > 0) {
    renderFixturesList();
  }
}

function initPublicModeControls() {
  if (dom.btnTogglePublicMode) {
    if (dom.btnTogglePublicMode) dom.btnTogglePublicMode.addEventListener('click', () => {
      setPublicMode(!tournamentState.isPublicMode, true);
    });
  }

  if (dom.btnExitPublicMode) {
    if (dom.btnExitPublicMode) dom.btnExitPublicMode.addEventListener('click', () => {
      setPublicMode(false, true);
    });
  }

  if (dom.btnShareFromBanner) {
    if (dom.btnShareFromBanner) dom.btnShareFromBanner.addEventListener('click', openShareModal);
  }
}

/**
 * Control del Modal de Compartir Torneo y Pantalla
 */
function initShareModalControls() {
  if (dom.btnShareTournament) {
    if (dom.btnShareTournament) dom.btnShareTournament.addEventListener('click', openShareModal);
  }

  if (dom.btnCloseShareModal) {
    if (dom.btnCloseShareModal) dom.btnCloseShareModal.addEventListener('click', closeShareModal);
  }

  if (dom.btnCloseShareModalBtn) {
    if (dom.btnCloseShareModalBtn) dom.btnCloseShareModalBtn.addEventListener('click', closeShareModal);
  }

  if (dom.shareTournamentModal) {
    if (dom.shareTournamentModal) dom.shareTournamentModal.addEventListener('click', (e) => {
      if (e.target === dom.shareTournamentModal) closeShareModal();
    });
  }

  if (dom.btnCopyPublicUrl) {
    if (dom.btnCopyPublicUrl) dom.btnCopyPublicUrl.addEventListener('click', copyPublicUrl);
  }

  if (dom.btnOpenTvFromShare) {
    if (dom.btnOpenTvFromShare) dom.btnOpenTvFromShare.addEventListener('click', () => {
      closeShareModal();
      switchTab('tab-tv');
    });
  }

  if (dom.btnLaunchTvFullscreen) {
    if (dom.btnLaunchTvFullscreen) dom.btnLaunchTvFullscreen.addEventListener('click', () => {
      closeShareModal();
      switchTab('tab-tv');
      if (typeof toggleFullscreen === 'function') {
        toggleFullscreen();
      }
    });
  }

  if (dom.btnPrintFromShare) {
    if (dom.btnPrintFromShare) dom.btnPrintFromShare.addEventListener('click', () => {
      closeShareModal();
      handlePrintReport();
    });
  }
}

function openShareModal() {
  if (!dom.shareTournamentModal) return;

  try {
    const publicUrl = new URL(window.location.href);
    publicUrl.searchParams.set('view', 'public');
    if (dom.sharePublicUrlInput) {
      dom.sharePublicUrlInput.value = publicUrl.toString();
    }
  } catch (err) {
    if (dom.sharePublicUrlInput) {
      dom.sharePublicUrlInput.value = window.location.href + '?view=public';
    }
  }

  dom.shareTournamentModal.style.display = 'flex';
}

function closeShareModal() {
  if (dom.shareTournamentModal) {
    dom.shareTournamentModal.style.display = 'none';
  }
}

function copyPublicUrl() {
  if (!dom.sharePublicUrlInput) return;
  const url = dom.sharePublicUrlInput.value;
  if (!url) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
  showToast('¡Enlace de solo lectura copiado al portapapeles!', 'success');
    }).catch(() => {
      fallbackCopyUrl(url);
    });
  } else {
    fallbackCopyUrl(url);
  }
}

function fallbackCopyUrl(text) {
  if (!dom.sharePublicUrlInput) return;
  dom.sharePublicUrlInput.select();
  try {
    document.execCommand('copy');
  showToast('¡Enlace de solo lectura copiado al portapapeles!', 'success');
  } catch (err) {
    showToast('Selecciona y copia manualmente el enlace', 'info');
  }
}

/**
 * Exportación de Tabla de Posiciones a archivo .CSV
 */
function exportStandingsCsv() {
  const isGroupStage = tournamentState.config.format === 'groups_playoffs' || tournamentState.config.format === 'groups_semis';
  const tournamentTitle = tournamentState.config.name || 'Torneo FutbolMaster Pro';
  const csvRows = [];

  csvRows.push([`"TORNEO: ${tournamentTitle.replace(/"/g, '""')}"`]);
  csvRows.push([`"FECHA DE REPORTE: ${new Date().toLocaleString('es-ES')}"`]);
  csvRows.push([]);

  if (isGroupStage) {
    const groupKeys = Object.keys(tournamentState.groups || {}).sort();
    if (groupKeys.length === 0) {
      showToast('No hay grupos configurados para exportar', 'warning');
      return;
    }

    groupKeys.forEach(groupLetter => {
      csvRows.push([`"=== CLASIFICACIÓN GRUPO ${groupLetter} ==="`]);
      csvRows.push(['Posición', 'Club', 'Puntos', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Forma']);
      const standings = calculateGroupStandings(groupLetter);
      standings.forEach((row, idx) => {
        const formStr = (row.form || []).join('-');
        csvRows.push([
          idx + 1,
          `"${row.name.replace(/"/g, '""')}"`,
          row.pts,
          row.pj,
          row.pg,
          row.pe,
          row.pp,
          row.gf,
          row.gc,
          row.dg,
          `"${formStr}"`
        ]);
      });
      csvRows.push([]);
    });
  } else {
    csvRows.push(['Posición', 'Club', 'Puntos', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'DG', 'Forma']);
    const standings = calculateStandings();
    if (standings.length === 0) {
      showToast('No hay datos de clasificación disponibles', 'warning');
      return;
    }

    standings.forEach((row, idx) => {
      const formStr = (row.form || []).join('-');
      csvRows.push([
        idx + 1,
        `"${row.name.replace(/"/g, '""')}"`,
        row.pts,
        row.pj,
        row.pg,
        row.pe,
        row.pp,
        row.gf,
        row.gc,
        row.dg,
        `"${formStr}"`
      ]);
    });
  }

  const csvContent = '\uFEFF' + csvRows.map(row => row.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const sanitizedName = tournamentTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `tabla_posiciones_${sanitizedName}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);

  showToast('Tabla de posiciones exportada a CSV exitosamente', 'success');
}

/**
 * Exportación del Calendario y Resultados a archivo .CSV
 */
function exportFixturesCsv() {
  const matches = tournamentState.matches || [];
  if (matches.length === 0) {
    showToast('Aún no hay partidos generados para exportar', 'warning');
    return;
  }

  const tournamentTitle = tournamentState.config.name || 'Torneo FutbolMaster Pro';
  const csvRows = [];

  csvRows.push([`"TORNEO: ${tournamentTitle.replace(/"/g, '""')}"`]);
  csvRows.push([`"CALENDARIO OFICIAL Y RESULTADOS"`]);
  csvRows.push([`"FECHA DE REPORTE: ${new Date().toLocaleString('es-ES')}"`]);
  csvRows.push([]);
  csvRows.push([
    'Jornada/Ronda',
    'Grupo/Fase',
    'Fecha',
    'Hora',
    'Cancha/Estadio',
    'Equipo Local',
    'Goles Local',
    'Goles Visitante',
    'Equipo Visitante',
    'Penales',
    'Estado',
    'Árbitro',
    'Goleadores'
  ]);

  matches.forEach(m => {
    if (m.isBye) {
      const byeTeam = getTeamById(m.byeTeamId);
      const byeName = byeTeam ? byeTeam.name : 'Equipo';
      csvRows.push([
        `"${m.roundName.replace(/"/g, '""')}"`,
        '-',
        '-',
        '-',
        '-',
        `"${byeName.replace(/"/g, '""')}"`,
        '-',
        '-',
        '"Descanso (Bye)"',
        '-',
        'Descanso',
        '-',
        '-'
      ]);
      return;
    }

    const homeTeam = getTeamById(m.homeTeamId);
    const awayTeam = getTeamById(m.awayTeamId);
    const homeName = homeTeam ? homeTeam.name : (m.homeTeamPlaceholder || 'Local');
    const awayName = awayTeam ? awayTeam.name : (m.awayTeamPlaceholder || 'Visitante');

    const groupStr = m.group ? `Grupo ${m.group}` : (m.isKnockout ? 'Eliminatoria' : 'Fase Regular');
    const dateStr = m.date || 'Por definir';
    const timeStr = m.time || 'Por definir';
    const venueStr = m.venue || 'Cancha asignada';
    const refStr = m.referee || 'Por designar';

    const homeScoreStr = (m.homeScore !== null && m.homeScore !== undefined) ? m.homeScore : '-';
    const awayScoreStr = (m.awayScore !== null && m.awayScore !== undefined) ? m.awayScore : '-';

    let penStr = '-';
    if (m.homePenalties !== null && m.awayPenalties !== null) {
      penStr = `(${m.homePenalties} - ${m.awayPenalties})`;
    }

    let statusStr = 'Pendiente';
    if (m.status === 'live') statusStr = 'En Juego';
    else if (m.status === 'finished' || m.isFinished) statusStr = 'Finalizado';

    let scorersStr = '-';
    if (Array.isArray(m.scorers) && m.scorers.length > 0) {
      scorersStr = m.scorers.map(s => {
        const team = getTeamById(s.teamId);
        const tShort = team ? team.name : '';
        return `${s.playerName} (${tShort}: ${s.goals})`;
      }).join('; ');
    }

    csvRows.push([
      `"${m.roundName.replace(/"/g, '""')}"`,
      `"${groupStr}"`,
      `"${dateStr}"`,
      `"${timeStr}"`,
      `"${venueStr.replace(/"/g, '""')}"`,
      `"${homeName.replace(/"/g, '""')}"`,
      homeScoreStr,
      awayScoreStr,
      `"${awayName.replace(/"/g, '""')}"`,
      `"${penStr}"`,
      `"${statusStr}"`,
      `"${refStr.replace(/"/g, '""')}"`,
      `"${scorersStr.replace(/"/g, '""')}"`
    ]);
  });

  const csvContent = '\uFEFF' + csvRows.map(row => row.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const sanitizedName = tournamentTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `fixture_${sanitizedName}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);

  showToast('Calendario y resultados exportados a CSV exitosamente', 'success');
}

/**
 * Genera el informe oficial para impresión o guardado en PDF
 */
function handlePrintReport() {
  const tournamentTitle = tournamentState.config.name || 'FutbolMaster Pro 2026';
  const subtitle = tournamentState.config.description || 'Reporte oficial de competición y resultados en vivo';

  if (dom.printTournamentTitle) {
    dom.printTournamentTitle.textContent = tournamentTitle;
  }
  if (dom.printTournamentSubtitle) {
    dom.printTournamentSubtitle.textContent = subtitle;
  }
  if (dom.printReportDate) {
    const now = new Date();
    dom.printReportDate.textContent = 'Fecha de emisión: ' + now.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Asegurar que las vistas de fixture y clasificación estén renderizadas en el DOM
  if (tournamentState.isGenerated && tournamentState.matches.length > 0) {
    renderFixturesView();
    renderStandingsView();
  }

  showToast('Abriendo dialogo de impresion / Guardar en PDF...', 'info', 2000);
  setTimeout(() => {
    window.print();
  }, 250);
}

/**
 * Gestión de copias de seguridad completa en JSON
 */
/**
 * Gestión de copias de seguridad completa en JSON (FMPStore Engine)
 */
function initDataTransferControls() {
  if (dom.btnExportJson) {
    if (dom.btnExportJson) dom.btnExportJson.addEventListener('click', handleExportJson);
  }

  if (dom.btnImportJson && dom.importJsonFileInput) {
    if (dom.btnImportJson) dom.btnImportJson.addEventListener('click', () => {
      dom.importJsonFileInput.click();
    });

    if (dom.importJsonFileInput) dom.importJsonFileInput.addEventListener('change', handleImportJson);
  }

  // Respaldo y Restauración de Base de Datos Central (FMPStore)
  const btnExportFullDb = document.getElementById('btnExportFullDatabase');
  const btnImportFullDb = document.getElementById('btnImportFullDatabase');
  const inputFullDbFile = document.getElementById('inputFullDatabaseFile');

  if (btnExportFullDb) {
    btnExportFullDb.addEventListener('click', () => {
      FMPStore.exportBackup();
    });
  }

  if (btnImportFullDb && inputFullDbFile) {
    btnImportFullDb.addEventListener('click', () => {
      inputFullDbFile.click();
    });

    inputFullDbFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        FMPStore.importBackup(event.target.result);
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  if (dom.btnPrintReport) {
    if (dom.btnPrintReport) dom.btnPrintReport.addEventListener('click', handlePrintReport);
  }
}

function handleExportJson() {
  const backupData = {
    schemaVersion: '2.0',
    exportTimestamp: new Date().toISOString(),
    config: tournamentState.config,
    teams: tournamentState.teams,
    groups: tournamentState.groups,
    matches: tournamentState.matches,
    isGenerated: tournamentState.isGenerated,
    currentTab: tournamentState.currentTab,
    activeSubTab: tournamentState.activeSubTab
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const sanitizedName = (tournamentState.config.name || 'torneo').toLowerCase().replace(/[^a-z0-9]/gi, '_');
  const fileName = `futbolmaster_${sanitizedName}_${Date.now()}.json`;

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Copia de seguridad completa exportada en JSON', 'success');
}

function handleImportJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);

      if (!imported.config || !Array.isArray(imported.teams)) {
        showToast('El archivo JSON no tiene la estructura válida de FutbolMaster Pro', 'error');
        return;
      }

      let format = imported.config.format || 'league_single';
      if (format === 'league') {
        format = imported.config.matchType === 'home_away' ? 'league_double' : 'league_single';
      }

      tournamentState = {
        ...tournamentState,
        ...imported,
        config: {
          ...tournamentState.config,
          ...(imported.config || {}),
          format: format,
          groupCount: imported.config?.groupCount || 2
        },
        groups: (imported.groups && typeof imported.groups === 'object') ? imported.groups : {},
        teams: Array.isArray(imported.teams) ? imported.teams : [],
        matches: Array.isArray(imported.matches) ? imported.matches : []
      };

      saveState();
      renderApp();
  showToast(`¡Torneo "${tournamentState.config.name}" importado exitosamente!`, 'success');

    } catch (err) {
      console.error('Error al importar JSON:', err);
      showToast('Error al procesar el archivo JSON', 'error');
    }
  };

  reader.readAsText(file);
  e.target.value = '';
}

// =============================================================================
// 19. INICIALIZACIÓN GENERAL DE LA APLICACIÓN
// =============================================================================

function renderApp() {
  updateHeaderActiveTournamentPill();
  updateGuardsVisibility();
  initConfigControls();
  renderTeams();
  renderGroupsDistribution();
  updateCounterBadges();
  updateTournamentStatusBadge();

  if (tournamentState.isGenerated && tournamentState.matches.length > 0) {
    renderFixturesView();
    renderStandingsView();
    renderTvMode();
  }

  // Respetar modo Público al renderizar vistas
  const currentRoute = getNormalizedRoute(window.location.hash);
  if (tournamentState.isPublicMode && (currentRoute === 'crear' || currentRoute === 'equipos')) {
    const fallbackRoute = (tournamentState.isGenerated && tournamentState.matches.length > 0) ? 'clasificacion' : 'calendario';
    navigateToView(fallbackRoute, true);
    return;
  }

  // Cargar ruta inicial del hash o por defecto a Home ('home')
  navigateToView(currentRoute, false);
}


// =============================================================================
// SLIDE TABS CURSOR ENGINE (Deslizamiento ÃšNICAMENTE al Seleccionar PestaÃ±a)
// =============================================================================

function setupSlideTabs(container, itemSelector = '.nav-link, .btn-exit-tournament, .sub-tab-btn') {
  if (!container) return;
  if (container.id !== 'headerNavCenter' && window.getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  let cursor = container.querySelector('.slide-tabs-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'slide-tabs-cursor';
    container.insertBefore(cursor, container.firstChild);
  }

  const updateCursorToTab = (tab) => {
    if (!tab || tab.offsetParent === null) {
      cursor.style.opacity = '0';
      return;
    }
    const left = tab.offsetLeft;
    const width = tab.offsetWidth;
    if (width > 0) {
      cursor.style.left = left + 'px';
      cursor.style.width = width + 'px';
      cursor.style.opacity = '1';
    } else {
      cursor.style.opacity = '0';
    }
  };

  const getActiveTab = () => {
    const tabs = Array.from(container.querySelectorAll(itemSelector));
    return tabs.find(t => t.classList.contains('active') && t.offsetParent !== null) || null;
  };

  const updateActive = () => {
    const active = getActiveTab();
    if (active) {
      updateCursorToTab(active);
    } else {
      cursor.style.opacity = '0';
    }
  };

  // Solo actualizar cursor al hacer clic (NUNCA por hover / mouseenter)
  const tabElements = container.querySelectorAll(itemSelector);
  tabElements.forEach(t => {
    t.addEventListener('click', () => {
      setTimeout(() => {
        const active = getActiveTab();
        updateCursorToTab(active || t);
      }, 35);
    });
  });

  container._updateSlideCursor = updateActive;

  // Cálculos iniciales progresivos para acomodar fuentes y renderizado
  setTimeout(updateActive, 40);
  setTimeout(updateActive, 120);
  setTimeout(updateActive, 300);
}

function updateAllSlideTabs() {
  const headerNav = document.getElementById('headerNavCenter');
  if (headerNav && typeof headerNav._updateSlideCursor === 'function') {
    headerNav._updateSlideCursor();
  }
  document.querySelectorAll('.sub-tabs-pills').forEach(p => {
    if (typeof p._updateSlideCursor === 'function') p._updateSlideCursor();
  });
  const authTabs = document.getElementById('authModalTabs') || document.querySelector('.auth-modal-tabs');
  if (authTabs && typeof authTabs._updateSlideCursor === 'function') {
    authTabs._updateSlideCursor();
  }
}

function initSlideTabsNav() {
  const headerNav = document.getElementById('headerNavCenter');
  if (headerNav) {
    setupSlideTabs(headerNav, '.nav-link, .btn-exit-tournament');
  }

  document.querySelectorAll('.sub-tabs-pills').forEach(pills => {
    setupSlideTabs(pills, '.sub-tab-btn');
  });

  const authTabs = document.getElementById('authModalTabs') || document.querySelector('.auth-modal-tabs');
  if (authTabs) {
    setupSlideTabs(authTabs, '.auth-tab-btn');
  }

  window.addEventListener('resize', () => {
    updateAllSlideTabs();
  });
}

function initApp() {
  window._fmpIsBooting = true;

  // Detección inicial estricta de rutas de dashboard para ocultar header antes de pintar
  if (window.location.hash && window.location.hash.startsWith('#/admin')) {
    document.body.classList.add('in-admin-dashboard', 'route-admin');
    const mainHeaderEl = document.getElementById('mainHeader');
    if (mainHeaderEl) mainHeaderEl.style.setProperty('display', 'none', 'important');
  } else if (window.location.hash && window.location.hash.startsWith('#/organizador')) {
    document.body.classList.add('in-organizer-dashboard', 'route-organizador');
    const mainHeaderEl = document.getElementById('mainHeader');
    if (mainHeaderEl) mainHeaderEl.style.setProperty('display', 'none', 'important');
  }

  loadState();

  // Precargar Escenario Colombia si no hay torneos o están vacíos
  const existingTourneys = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : savedTournaments;
  if (!existingTourneys || existingTourneys.length === 0 || !existingTourneys.some(t => Array.isArray(t.teams) && t.teams.length > 0)) {
    if (typeof loadDefaultColombiaSeed === 'function') {
      loadDefaultColombiaSeed();
    }
  }

  // Detección inicial de Modo Público por parámetro URL (?view=public)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const isPublicParam = urlParams.get('view') === 'public';
    if (isPublicParam) {
      tournamentState.isPublicMode = true;
    }
  } catch (err) {
    console.warn('Error al leer parámetros de URL:', err);
  }

  initTabs();
  initConfigControls();
  initTeamManager();
  initEditModal();
  initFixturesControls();
  initStandingsControls();
  initScorersModal();
  initTvControls();
  initDataTransferControls();
  initPublicModeControls();
  initShareModalControls();

  // Aplicar estado inicial de modo Público
  setPublicMode(tournamentState.isPublicMode, false);

  renderApp();
  initFootballExperience();
  initSlideTabsNav();
  initTournamentHeaderControls();
  setTimeout(() => { window._fmpIsBooting = false; }, 100);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}


/* ==========================================================================
   FOOTBALL 3D TROPHY & INTERACTIVE ENGINE (FUTBOL MASTER PRO)
   ========================================================================== */

const footballState = {
  activeEdition: 'emerald', // 'emerald' | 'blue'
  currentMouse: { x: 0, y: 0 },
  targetMouse: { x: 0, y: 0 },
  switchSpin: 0,
  isSwitching: false
};

function initTournamentHeaderControls() {
  const btnExit = document.getElementById('btnExitTournament');
  if (btnExit) {
    btnExit.addEventListener('click', () => {
      isManagingTournament = false;
      document.body.classList.remove('managing-tournament');
      navigateToView('torneos');
      if (typeof showToast === 'function') {
        showToast('Has salido de la gestión del torneo', 'info', 2000);
      }
    });
  }

  const btnSubnavExit = document.getElementById('btnSubnavExitTournament');
  if (btnSubnavExit) {
    btnSubnavExit.addEventListener('click', () => {
      isManagingTournament = false;
      document.body.classList.remove('managing-tournament');
      navigateToView('torneos');
      if (typeof showToast === 'function') {
        showToast('Has salido de la vista de torneo', 'info', 2000);
      }
    });
  }

  const btnMobileExit = document.getElementById('btnMobileExitTournament');
  if (btnMobileExit) {
    btnMobileExit.addEventListener('click', () => {
      isManagingTournament = false;
      document.body.classList.remove('managing-tournament');
      if (dom.mobileNavDrawer) dom.mobileNavDrawer.style.display = 'none';
      navigateToView('torneos');
      if (typeof showToast === 'function') {
        showToast('Has salido de la gestión del torneo', 'info', 2000);
      }
    });
  }
}

function initFootballExperience() {
  const trophyStage = document.getElementById('trophy3dStage');
  const editionCards = document.querySelectorAll('.product-carousel .card[data-flavor]');
  const editionTitle = document.getElementById('editionHighlightText');
  const floatingItems = document.querySelectorAll('.football-floating-item');

  // 1. Función de Cambio de Edición (Esmeralda vs Champions)
  function switchEdition(edition) {
    if (footballState.activeEdition === edition && !footballState.isSwitching) return;
    footballState.activeEdition = edition;
    footballState.isSwitching = true;

    editionCards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-flavor') === edition);
    });

    if (edition === 'blue') {
      document.body.classList.add('blue-theme');
      if (editionTitle) editionTitle.textContent = 'CHAMPIONS';
      if (window.gsap) {
        gsap.to('body', {
          '--bg-inner': '#0b4f8a',
          '--bg-mid': '#04294e',
          '--bg-outer': '#010c14',
          duration: 0.85,
          ease: 'power2.out'
        });
      }
      document.querySelectorAll('.football-accent-path, .football-accent-stroke').forEach(el => {
        if (el.tagName === 'path' && el.classList.contains('football-accent-path')) {
          el.setAttribute('fill', '#3b82f6');
        } else {
          el.setAttribute('stroke', '#3b82f6');
        }
      });
      document.querySelectorAll('.jersey-accent-stop1').forEach(s => s.setAttribute('stop-color', '#3b82f6'));
      document.querySelectorAll('.jersey-accent-stop2').forEach(s => s.setAttribute('stop-color', '#1d4ed8'));
      document.querySelectorAll('.trophy-ambient-stop').forEach(s => s.setAttribute('stop-color', '#3b82f6'));
    } else {
      document.body.classList.remove('blue-theme');
      if (editionTitle) editionTitle.textContent = 'ESMERALDA';
      if (window.gsap) {
        gsap.to('body', {
          '--bg-inner': '#0b8a78',
          '--bg-mid': '#044e3b',
          '--bg-outer': '#011411',
          duration: 0.85,
          ease: 'power2.out'
        });
      }
      document.querySelectorAll('.football-accent-path, .football-accent-stroke').forEach(el => {
        if (el.tagName === 'path' && el.classList.contains('football-accent-path')) {
          el.setAttribute('fill', '#10b981');
        } else {
          el.setAttribute('stroke', '#10b981');
        }
      });
      document.querySelectorAll('.jersey-accent-stop1').forEach(s => s.setAttribute('stop-color', '#10b981'));
      document.querySelectorAll('.jersey-accent-stop2').forEach(s => s.setAttribute('stop-color', '#047857'));
      document.querySelectorAll('.trophy-ambient-stop').forEach(s => s.setAttribute('stop-color', '#10b981'));
    }

    // Giro 720deg del Trofeo Central con Motion Blur
    if (window.gsap && trophyStage) {
      const spinObj = { val: 0 };
      gsap.to(spinObj, {
        val: 720,
        duration: 1.25,
        ease: 'back.out(1.2)',
        onUpdate: () => {
          footballState.switchSpin = spinObj.val;
        },
        onComplete: () => {
          footballState.switchSpin = 0;
          footballState.isSwitching = false;
        }
      });

      gsap.fromTo(trophyStage,
        { filter: 'blur(4.5px) drop-shadow(0 25px 35px rgba(0,0,0,0.7))' },
        { filter: 'blur(0px) drop-shadow(0 25px 35px rgba(0,0,0,0.7))', duration: 1.05, ease: 'power2.out' }
      );

      // Implosión hacia el centro y explosión de elementos de fútbol
      gsap.timeline()
        .to('.football-floating-item', { scale: 0.25, opacity: 0.25, duration: 0.32, ease: 'power2.in' })
        .to('.football-floating-item', { scale: 1, opacity: 1, duration: 0.68, ease: 'back.out(1.8)' });
    } else {
      footballState.isSwitching = false;
    }
  }

  editionCards.forEach(card => {
    card.addEventListener('click', () => {
      const edition = card.getAttribute('data-flavor');
      if (edition) switchEdition(edition);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const edition = card.getAttribute('data-flavor');
        if (edition) switchEdition(edition);
      }
    });
  });

  // 2. Movimiento Autónomo Continuo en Elementos de Fútbol (Sin dependencia del ratón)
  // Las burbujas, orbes y trofeo oscilan suave y orgánicamente en un bucle continuo

  // 3. Animación continua RAF (Inclinación 3D del Trofeo y Flotación Suave Autónoma)
  function updateFootballLoop(time) {
    requestAnimationFrame(updateFootballLoop);

    const tSec = time * 0.001;
    // Oscilación autónoma continua suave
    footballState.targetMouse.x = Math.sin(tSec * 0.6) * 0.28;
    footballState.targetMouse.y = Math.cos(tSec * 0.8) * 0.22;

    footballState.currentMouse.x += (footballState.targetMouse.x - footballState.currentMouse.x) * 0.045;
    footballState.currentMouse.y += (footballState.targetMouse.y - footballState.currentMouse.y) * 0.045;

    // Inclinación 3D del Trofeo y Balón Central
    if (trophyStage && !footballState.isSwitching) {
      const rotX = (-footballState.currentMouse.y * 18).toFixed(2);
      const rotY = (footballState.currentMouse.x * 22 + footballState.switchSpin).toFixed(2);
      trophyStage.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }

    // Ondulación de flotación en las insignias orbitales
    const badges = document.querySelectorAll('.orbit-badge');
    badges.forEach((b, idx) => {
      const wave = Math.sin(tSec * 1.8 + idx * 2) * 6;
      const waveX = Math.cos(tSec * 1.4 + idx * 1.5) * 4;
      const bx = (footballState.currentMouse.x * 12 + waveX).toFixed(1);
      const by = (footballState.currentMouse.y * 12 + wave).toFixed(1);
      b.style.transform = `translate(${bx}px, ${by}px)`;
    });
  }
  requestAnimationFrame(updateFootballLoop);

  // 4. Formatos de Competición
  const formatButtons = document.querySelectorAll('.btn-use-format');
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      if (format) {
        navigateTo('crear');
        setTimeout(() => {
          const formatInput = document.querySelector(`input[name="format"][value="${format}"]`);
          if (formatInput) {
            formatInput.checked = true;
            formatInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (typeof showToast === 'function') {
            showToast(`Formato seleccionado: ${format}`, 'info');
          }
        }, 150);
      }
    });
  });

  // 5. Botones Demo
  const btnHeroLoadDemo = document.getElementById('btnHeroLoadDemo');
  if (btnHeroLoadDemo) {
    btnHeroLoadDemo.addEventListener('click', () => {
      if (typeof loadDemoTournament === 'function') loadDemoTournament();
    });
  }

  const btnPreviewLoadFullDemo = document.getElementById('btnPreviewLoadFullDemo');
  if (btnPreviewLoadFullDemo) {
    btnPreviewLoadFullDemo.addEventListener('click', () => {
      if (typeof loadDemoTournament === 'function') loadDemoTournament();
    });
  }

  // 6. FAQ Accordion
  const faqButtons = document.querySelectorAll('.faq-question-btn');
  faqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const panel = other.nextElementSibling;
          if (panel) panel.style.maxHeight = null;
        }
      });
      btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
      const panel = btn.nextElementSibling;
      if (panel) {
        panel.style.maxHeight = isExpanded ? null : (panel.scrollHeight + 'px');
      }
    });
  });

  // 7. Smooth Scroll
  const btnHeroExplore = document.getElementById('btnHeroExplore');
  if (btnHeroExplore) {
    btnHeroExplore.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('home-features-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}


// =============================================================================
// FASE 3: FLUJO COMPLETO DE INSCRIPCIÓN DE EQUIPOS, DOCUMENTOS PDF Y HABILITACIÓN FCF
// =============================================================================

let activeManagingRegistration = null;
let currentObservationCallback = null;

/**
 * Control de Privacidad de Documentos según Ley de Habeas Data (Colombia).
 * En la vista de Visitante/Aficionado los números de documento se enmascaran.
 * El Técnico del club, el Organizador y el Administrador pueden verlos completos.
 */
function maskDocNumber(docNum, forceShow = false) {
  if (!docNum) return '********';
  const role = userSession ? userSession.role : 'visitor';
  if (forceShow || role === 'admin' || role === 'organizer' || role === 'coach') {
    return String(docNum);
  }
  const str = String(docNum);
  if (str.length <= 4) return '***' + str;
  return str.substring(0, 2) + '***.***' + str.substring(str.length - 2);
}

function renderDocPrivacyElement(docType, docNumber) {
  const role = userSession ? userSession.role : 'visitor';
  const isPrivileged = (role === 'admin' || role === 'organizer' || role === 'coach');
  const masked = maskDocNumber(docNumber);
  
  if (isPrivileged) {
    return `<span class="doc-privacy-shield verified" title="Acceso de Administrador / Delegado Oficial"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> ${escapeHtml(docType)} ${escapeHtml(masked)}</span>`;
  } else {
    return `<span class="doc-privacy-shield masked" title="Documento Protegido por Ley 1581 de Habeas Data"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> ${escapeHtml(docType)} ${escapeHtml(masked)}</span>`;
  }
}

/**
 * Inicializa todos los controles, filtros y listeners de la vista de Solicitudes
 */
function initSolicitudesControls() {
  const searchInput = document.getElementById('solSearchInput');
  const filterSelect = document.getElementById('solStatusFilter');
  if (searchInput) searchInput.addEventListener('input', renderSolicitudesView);
  if (filterSelect) filterSelect.addEventListener('change', renderSolicitudesView);

  const btnNewDirect = document.getElementById('btnNewSolicitudDirect');
  if (btnNewDirect) {
    btnNewDirect.addEventListener('click', () => {
      openRegisterTeamApplicationModal(activeTournamentId);
    });
  }

  initApplicationModals();
}

/**
 * Renderiza la lista de solicitudes de inscripción con contadores y tarjetas interactivas
 */
function renderSolicitudesView() {
  const listEl = document.getElementById('solicitudesCardsList');
  if (!listEl) return;

  const registrations = getFmpRegistrations();
  const search = (document.getElementById('solSearchInput')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('solStatusFilter')?.value || 'all';

  // Filtrar según búsqueda y estado
  const filtered = registrations.filter(r => {
    const matchesSearch = !search || 
      (r.clubName && r.clubName.toLowerCase().includes(search)) ||
      (r.dtName && r.dtName.toLowerCase().includes(search)) ||
      (r.tournamentName && r.tournamentName.toLowerCase().includes(search)) ||
      (r.city && r.city.toLowerCase().includes(search));
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = (r.status === statusFilter);
    }
    return matchesSearch && matchesStatus;
  });

  // Actualizar métricas del encabezado
  const total = registrations.length;
  const pend = registrations.filter(r => r.status === 'pendiente_inicial').length;
  const rev = registrations.filter(r => r.status === 'revision_final').length;
  const hab = registrations.filter(r => r.status === 'habilitado').length;

  const statTotal = document.getElementById('statSolTotal');
  const statPend = document.getElementById('statSolPendientes');
  const statRev = document.getElementById('statSolRevision');
  const statHab = document.getElementById('statSolHabilitados');

  if (statTotal) statTotal.textContent = total;
  if (statPend) statPend.textContent = pend;
  if (statRev) statRev.textContent = rev;
  if (statHab) statHab.textContent = hab;

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state-card" style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center;">
        <span style="font-size: 2.8rem; display: block; margin-bottom: 0.8rem;">ðŸ“‹</span>
        <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.4rem;">No hay solicitudes registradas</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; max-width: 480px; margin: 0 auto 1.5rem;">
          No se encontraron solicitudes con los filtros aplicados o aún ningún Director Técnico ha postulado su equipo.
        </p>
        <button type="button" class="btn-primary-neon" onclick="openRegisterTeamApplicationModal(activeTournamentId)">
          + Iniciar Solicitud de Inscripción
        </button>
      </div>
    `;
    return;
  }

  const role = userSession ? userSession.role : 'visitor';
  const isOrganizerOrAdmin = (role === 'organizer' || role === 'admin');
  const isCoach = (role === 'coach');

  listEl.innerHTML = filtered.map(r => {
    let badgeClass = 'badge-sol-pendiente-inicial';
    let badgeText = 'Pendiente Inicial';
    if (r.status === 'solicitud_aprobada') {
      badgeClass = 'badge-sol-aprobada-inicial';
      badgeText = 'Aprobada: Nómina y PDF';
    } else if (r.status === 'revision_final') {
      badgeClass = 'badge-sol-revision-final';
      badgeText = 'En Revisión Final';
    } else if (r.status === 'habilitado') {
      badgeClass = 'badge-sol-habilitado';
      badgeText = '✅ Habilitado Oficial';
    } else if (r.status === 'devuelto_inicial' || r.status === 'devuelto_documentos') {
      badgeClass = 'badge-sol-devuelto';
      badgeText = 'Devuelto para Corrección';
    } else if (r.status === 'rechazado') {
      badgeClass = 'badge-sol-rechazado';
      badgeText = 'Rechazado';
    }

    const hasPdf = Boolean(r.pdfAttachment);
    const pdfIndicator = hasPdf 
      ? `<span class="pdf-attachment-badge attached" title="${escapeHtml(r.pdfAttachment.fileName)}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> Planilla PDF Adjunta</span>`
      : `<span class="pdf-attachment-badge missing"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> PDF Pendiente</span>`;

    const playersCount = Array.isArray(r.roster) ? r.roster.length : (r.playersCount || 0);

    let actionsHtml = '';
    
    // Acciones para Organizador / Admin
    if (isOrganizerOrAdmin) {
      if (r.status === 'pendiente_inicial') {
        actionsHtml = `
          <button type="button" class="btn-sol-action btn-sol-approve" onclick="approveInitialApplication('${r.id}')" title="Aprobar para que el DT suba nómina y documentos">
            ✓ Aprobar Solicitud Inicial
          </button>
          <button type="button" class="btn-sol-action btn-sol-return" onclick="openObservationPrompt('${r.id}', 'devuelto_inicial')" title="Solicitar correcciones al técnico">
            ↩ Devolver
          </button>
          <button type="button" class="btn-sol-action btn-sol-reject" onclick="openObservationPrompt('${r.id}', 'rechazado')" title="Rechazar postulación">
            ✕ Rechazar
          </button>
        `;
      } else if (r.status === 'revision_final') {
        actionsHtml = `
          <button type="button" class="btn-sol-action btn-sol-review" onclick="openReviewApplicationModal('${r.id}')" title="Revisar nómina oficial y documentos PDF">
            ðŸ” Revisar Nómina & Habilitar FCF
          </button>
        `;
      }
    }

    // Acciones para el Director Técnico
    if (isCoach && (r.status === 'solicitud_aprobada' || r.status === 'devuelto_documentos')) {
      actionsHtml += `
        <button type="button" class="btn-sol-action btn-sol-roster" onclick="openManageRosterAndPdfModal('${r.id}')" title="Registrar jugadores y adjuntar planilla en PDF">
          ðŸ“‹ Gestionar Nómina & PDF
        </button>
      `;
    }

    // Botón para ver el PDF oficial si está disponible
    if (hasPdf) {
      actionsHtml += `
        <button type="button" class="btn-sol-action btn-sol-view-pdf" onclick="openOfficialPdfViewer('${r.id}')" title="Abrir planilla oficial en formato imprimible FCF">
          ðŸ“„ Ver Planilla PDF
        </button>
      `;
    }

    if (!actionsHtml) {
      actionsHtml = `
        <span style="font-size: 0.8rem; color: var(--text-muted); display: inline-flex; align-items: center; gap: 0.35rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${r.status === 'habilitado' ? 'Equipo Habilitado e Inscrito en el Torneo' : 'Esperando acción de la organización'}
        </span>
      `;
    }

    const observationBanner = r.observations ? `
      <div class="solicitud-observation-box">
        <strong>⚠️ï¸ Observación oficial:</strong> ${escapeHtml(r.observations)}
      </div>
    ` : '';

    return `
      <div class="solicitud-card-item">
        <div class="solicitud-card-top">
          <div class="solicitud-club-info">
            <div class="solicitud-club-shield" style="border-color: ${escapeHtml(r.primaryColor || '#10b981')};">
              ${renderTeamShieldElement({ name: r.clubName, shield: r.shield, color: r.primaryColor })}
            </div>
            <div>
              <h3 class="solicitud-club-title">${escapeHtml(r.clubName)}</h3>
              <span class="solicitud-club-city">ðŸ“ ${escapeHtml(r.city || 'Colombia')}</span>
            </div>
          </div>
          <span class="badge-sol-status ${badgeClass}">${badgeText}</span>
        </div>

        <div class="solicitud-meta-grid">
          <div class="sol-meta-item">
            <span class="sol-meta-lbl">Torneo</span>
            <span class="sol-meta-val">${escapeHtml(r.tournamentName || 'Torneo Oficial')}</span>
          </div>
          <div class="sol-meta-item">
            <span class="sol-meta-lbl">Director Técnico</span>
            <span class="sol-meta-val">${escapeHtml(r.dtName)}</span>
          </div>
          <div class="sol-meta-item">
            <span class="sol-meta-lbl">Documento DT</span>
            <span class="sol-meta-val">${renderDocPrivacyElement(r.dtDocType || 'CC', r.dtDocNumber)}</span>
          </div>
          <div class="sol-meta-item">
            <span class="sol-meta-lbl">WhatsApp / Teléfono</span>
            <span class="sol-meta-val font-mono">${escapeHtml(r.dtPhone || 'N/A')}</span>
          </div>
          <div class="sol-meta-item">
            <span class="sol-meta-lbl">Plantilla de Jugadores</span>
            <span class="sol-meta-val"><strong>${playersCount}</strong> jugadores</span>
          </div>
          <div class="sol-meta-item">
            <span class="sol-meta-lbl">Documento Oficial</span>
            <span class="sol-meta-val">${pdfIndicator}</span>
          </div>
        </div>

        ${observationBanner}

        <div class="solicitud-actions-bar">
          ${actionsHtml}
        </div>
      </div>
    `;
  }).join('');
}

// -----------------------------------------------------------------------------
// OPERACIONES DEL CICLO DE VIDA DE UNA SOLICITUD
// -----------------------------------------------------------------------------

window.approveInitialApplication = function(regId) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  reg.status = 'solicitud_aprobada';
  reg.observations = '';
  reg.approvedInitialAt = new Date().toISOString();
  saveFmpRegistrations(registrations);

  logAudit('APROBACION_INICIAL_CLUB', `Aprobó la solicitud inicial del club ${reg.clubName}`);
  addNotification(
    'coach',
    `¡Solicitud Inicial Aprobada! Tu club ${reg.clubName} fue aprobado inicialmente. Ya puedes registrar tu nómina de jugadores y cargar la planilla oficial en PDF.`,
    'success'
  );

  renderSolicitudesView();
  showToast(`Solicitud inicial de ${reg.clubName} aprobada. El DT ha sido notificado.`, 'success', 3500);
};

window.returnInitialApplication = function(regId, note) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  reg.status = 'devuelto_inicial';
  reg.observations = note || 'Se solicitan correcciones en los datos del club.';
  saveFmpRegistrations(registrations);

  logAudit('DEVOLUCION_INICIAL_CLUB', `Devolvió solicitud de ${reg.clubName}: ${note}`);
  addNotification(
    'coach',
    `Solicitud de ${reg.clubName} devuelta: "${note}". Por favor realiza los ajustes solicitados.`,
    'warning'
  );

  renderSolicitudesView();
  showToast(`Solicitud devuelta al Director Técnico para corrección.`, 'info', 3000);
};

window.rejectApplication = function(regId, note) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  reg.status = 'rechazado';
  reg.observations = note || 'No cumple con los requisitos del torneo.';
  saveFmpRegistrations(registrations);

  logAudit('RECHAZO_SOLICITUD_CLUB', `Rechazó postulación de ${reg.clubName}: ${note}`);
  addNotification(
    'coach',
    `La solicitud de ${reg.clubName} ha sido rechazada por la organización: "${note}".`,
    'danger'
  );

  renderSolicitudesView();
  showToast(`Solicitud rechazada formalmente.`, 'danger', 3000);
};

window.approveDefinitiveApplication = function(regId) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  reg.status = 'habilitado';
  reg.approvedFinalAt = new Date().toISOString();
  if (Array.isArray(reg.roster)) {
    reg.roster.forEach(p => p.isHabilitado = true);
  }
  saveFmpRegistrations(registrations);

  // Integrar automáticamente el equipo al torneo activo
  if (!Array.isArray(tournamentState.teams)) {
    tournamentState.teams = [];
  }

  const existingTeam = tournamentState.teams.find(t => t.name.toLowerCase() === reg.clubName.toLowerCase());
  if (!existingTeam) {
    const newTeamObj = {
      id: 'team_' + Date.now(),
      name: reg.clubName,
      color: reg.primaryColor || '#10b981',
      shield: reg.shield || '',
      players: reg.roster || []
    };
    tournamentState.teams.push(newTeamObj);
    saveState();
  }

  logAudit('HABILITACION_OFICIAL_FCF', `Habilitó e inscribió formalmente al club ${reg.clubName} en el torneo.`);
  addNotification(
    'coach',
    `¡Felicitaciones! El club ${reg.clubName} ha sido HABILITADO DEFINITIVAMENTE en el torneo. Su nómina y documentación cuentan con aval FCF.`,
    'success'
  );

  const modal = document.getElementById('modalReviewApplicationRoster');
  if (modal) modal.style.display = 'none';

  renderSolicitudesView();
  if (typeof renderTeams === 'function') renderTeams();
  showToast(`¡Club ${reg.clubName} habilitado e integrado exitosamente al torneo!`, 'success', 4000);
};

window.returnApplicationDocs = function(regId, note) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  reg.status = 'devuelto_documentos';
  reg.observations = note || 'Se encontraron inconsistencias en la nómina o planilla PDF.';
  saveFmpRegistrations(registrations);

  logAudit('DEVOLUCION_DOCUMENTOS_CLUB', `Devolvió documentos de ${reg.clubName}: ${note}`);
  addNotification(
    'coach',
    `Inconsistencias en nómina/PDF de ${reg.clubName}: "${note}". Por favor actualiza la información requerida.`,
    'warning'
  );

  const modal = document.getElementById('modalReviewApplicationRoster');
  if (modal) modal.style.display = 'none';

  renderSolicitudesView();
  showToast(`Documentación devuelta al técnico para correcciones.`, 'info', 3000);
};

// -----------------------------------------------------------------------------
// CONTROLADORES DE MODALES Y FORMULARIOS
// -----------------------------------------------------------------------------

function initApplicationModals() {
  // 1. Modal Registro Solicitud Inicial
  const modalRegister = document.getElementById('modalRegisterTeamApplication');
  const formRegister = document.getElementById('formRegisterTeamApplication');
  const btnCloseRegister = document.getElementById('btnCloseRegisterTeamModal');
  const btnCancelRegister = document.getElementById('btnCancelRegisterTeamModal');

  const closeRegModal = () => { if (modalRegister) modalRegister.style.display = 'none'; };
  if (btnCloseRegister) btnCloseRegister.addEventListener('click', closeRegModal);
  if (btnCancelRegister) btnCancelRegister.addEventListener('click', closeRegModal);

  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const clubName = (document.getElementById('appClubName')?.value || '').trim();
      const city = (document.getElementById('appClubCity')?.value || '').trim();
      const primaryColor = document.getElementById('appClubColorPrimary')?.value || '#10b981';
      const dtName = (document.getElementById('appDtName')?.value || '').trim();
      const dtDocType = document.getElementById('appDtDocType')?.value || 'CC';
      const dtDocNumber = (document.getElementById('appDtDocNumber')?.value || '').trim();
      const dtPhone = (document.getElementById('appDtPhone')?.value || '').trim();
      const dtEmail = (document.getElementById('appDtEmail')?.value || '').trim();
      const tournamentId = document.getElementById('appTargetTournamentId')?.value || activeTournamentId;

      const tourney = savedTournaments.find(t => t.id === tournamentId);
      const tourneyName = tourney?.config?.name || (tournamentState?.config?.name || 'Torneo Oficial');

      const registrations = getFmpRegistrations();
      const newRegistration = {
        id: 'reg_' + Date.now(),
        tournamentId,
        tournamentName: tourneyName,
        clubName,
        city,
        primaryColor,
        shield: '',
        dtName,
        dtDocType,
        dtDocNumber,
        dtPhone: dtPhone.startsWith('+57') ? dtPhone : ('+57 ' + dtPhone),
        dtEmail,
        status: 'pendiente_inicial',
        submittedAt: new Date().toISOString(),
        roster: [],
        pdfAttachment: null,
        observations: ''
      };

      registrations.unshift(newRegistration);
      saveFmpRegistrations(registrations);

      logAudit('SOLICITUD_INSCRIPCION_ENVIADA', `El DT ${dtName} postuló al club ${clubName} para ${tourneyName}`);
      addNotification(
        'organizer',
        `Nueva solicitud recibida: El DT ${dtName} postuló al club "${clubName}" para ${tourneyName}. Pendiente de revisión inicial.`,
        'info'
      );

      closeRegModal();
      formRegister.reset();
      renderSolicitudesView();
      showToast(`¡Solicitud enviada exitosamente! El organizador ha recibido la notificación.`, 'success', 3500);
    });
  }

  // 2. Modal Gestión de Nómina y PDF
  const modalManageRoster = document.getElementById('modalManageRosterAndPdf');
  const btnCloseManageRoster = document.getElementById('btnCloseManageRosterModal');
  const btnCloseManageRosterBottom = document.getElementById('btnCloseManageRosterBottom');
  const closeManageModal = () => { if (modalManageRoster) modalManageRoster.style.display = 'none'; };
  if (btnCloseManageRoster) btnCloseManageRoster.addEventListener('click', closeManageModal);
  if (btnCloseManageRosterBottom) btnCloseManageRosterBottom.addEventListener('click', closeManageModal);

  // Formulario agregar jugador a la nómina
  const formAddPlayer = document.getElementById('formAddPlayerToRoster');
  const birthInput = document.getElementById('plBirthDate');
  const ageDisplay = document.getElementById('plAgeDisplay');
  const docTypeSelect = document.getElementById('plDocType');
  const guardianCard = document.getElementById('minorLegalGuardianCard');

  const checkMinorStatus = () => {
    let isMinor = false;
    const bVal = birthInput?.value;
    if (bVal) {
      const birthYear = new Date(bVal).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (ageDisplay) ageDisplay.textContent = `${age} años`;
      if (age < 18) isMinor = true;
    }
    const docType = docTypeSelect?.value;
    if (docType === 'TI' || docType === 'RC') {
      isMinor = true;
    }
    if (guardianCard) {
      guardianCard.style.display = isMinor ? 'block' : 'none';
      const guardianNameInput = document.getElementById('plGuardianName');
      const guardianDocInput = document.getElementById('plGuardianDoc');
      if (guardianNameInput) guardianNameInput.required = isMinor;
      if (guardianDocInput) guardianDocInput.required = isMinor;
    }
  };

  if (birthInput) birthInput.addEventListener('change', checkMinorStatus);
  if (docTypeSelect) docTypeSelect.addEventListener('change', checkMinorStatus);

  if (formAddPlayer) {
    formAddPlayer.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeManagingRegistration) return;

      const name = (document.getElementById('plFullName')?.value || '').trim();
      const docType = document.getElementById('plDocType')?.value || 'CC';
      const docNumber = (document.getElementById('plDocNumber')?.value || '').trim();
      const birthDate = document.getElementById('plBirthDate')?.value || '';
      const dorsal = parseInt(document.getElementById('plDorsal')?.value || '1', 10);
      const position = document.getElementById('plPosition')?.value || 'Mediocampista';
      const eps = document.getElementById('plEps')?.value || 'Sura EPS';

      // Validar si ya existe este documento en el registro
      if (!Array.isArray(activeManagingRegistration.roster)) {
        activeManagingRegistration.roster = [];
      }
      const existing = activeManagingRegistration.roster.find(p => p.docNumber === docNumber);
      if (existing) {
        showToast(`Ya existe un jugador con el documento ${docNumber} en esta nómina`, 'warning');
        return;
      }

      // Validar si es menor de edad y datos de acudiente
      let isMinor = false;
      let guardianInfo = null;
      if (birthDate) {
        const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
        if (age < 18 || docType === 'TI' || docType === 'RC') {
          isMinor = true;
          guardianInfo = {
            name: (document.getElementById('plGuardianName')?.value || '').trim(),
            doc: (document.getElementById('plGuardianDoc')?.value || '').trim(),
            consent: document.getElementById('plGuardianConsent')?.checked === true
          };
        }
      }

      const newPlayer = {
        id: 'ply_' + Date.now(),
        name,
        docType,
        docNumber,
        birthDate,
        dorsal,
        position,
        eps,
        isMinor,
        guardian: guardianInfo,
        isHabilitado: false
      };

      activeManagingRegistration.roster.push(newPlayer);
      activeManagingRegistration.playersCount = activeManagingRegistration.roster.length;

      // Guardar en almacenamiento
      const registrations = getFmpRegistrations();
      const idx = registrations.findIndex(r => r.id === activeManagingRegistration.id);
      if (idx !== -1) {
        registrations[idx] = activeManagingRegistration;
        saveFmpRegistrations(registrations);
      }

      formAddPlayer.reset();
      if (guardianCard) guardianCard.style.display = 'none';
      if (ageDisplay) ageDisplay.textContent = '0 años';

      renderManageRosterTable();
      showToast(`Jugador ${name} agregado a la plantilla`, 'success');
    });
  }

  // Carga de archivo PDF (Opción A)
  const pdfFileInput = document.getElementById('rosterPdfFileInput');
  if (pdfFileInput) {
    pdfFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file || !activeManagingRegistration) return;

      if (file.type !== 'application/pdf') {
        showToast('Solo se admiten documentos en formato PDF (.pdf)', 'warning');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('El archivo supera el tamaño máximo permitido de 10 MB', 'warning');
        return;
      }

      activeManagingRegistration.pdfAttachment = {
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        uploadedAt: new Date().toISOString(),
        type: 'uploaded'
      };

      const registrations = getFmpRegistrations();
      const idx = registrations.findIndex(r => r.id === activeManagingRegistration.id);
      if (idx !== -1) {
        registrations[idx] = activeManagingRegistration;
        saveFmpRegistrations(registrations);
      }

      renderManageRosterPdfBadge();
      showToast(`Planilla PDF "${file.name}" adjuntada correctamente`, 'success');
    });
  }

  // Generación Automática de Planilla Oficial PDF (Opción B)
  const btnGenerateOfficialPdf = document.getElementById('btnGenerateOfficialPdfRoster');
  if (btnGenerateOfficialPdf) {
    btnGenerateOfficialPdf.addEventListener('click', () => {
      if (!activeManagingRegistration) return;
      if (!Array.isArray(activeManagingRegistration.roster) || activeManagingRegistration.roster.length === 0) {
        showToast('Debes inscribir al menos un jugador antes de generar la planilla oficial', 'warning');
        return;
      }

      activeManagingRegistration.pdfAttachment = {
        fileName: `Planilla_Oficial_${activeManagingRegistration.clubName.replace(/\s+/g, '_')}_FCF.pdf`,
        fileSize: '420 KB',
        uploadedAt: new Date().toISOString(),
        type: 'auto_generated'
      };

      const registrations = getFmpRegistrations();
      const idx = registrations.findIndex(r => r.id === activeManagingRegistration.id);
      if (idx !== -1) {
        registrations[idx] = activeManagingRegistration;
        saveFmpRegistrations(registrations);
      }

      renderManageRosterPdfBadge();
      showToast('¡Planilla oficial generada y adjuntada exitosamente con membrete FCF!', 'success', 3000);
    });
  }

  // Enviar a Revisión Final del Organizador
  const btnSendToFinalReview = document.getElementById('btnSendToFinalReview');
  if (btnSendToFinalReview) {
    btnSendToFinalReview.addEventListener('click', () => {
      if (!activeManagingRegistration) return;
      if (!Array.isArray(activeManagingRegistration.roster) || activeManagingRegistration.roster.length === 0) {
        showToast('La nómina debe tener jugadores inscritos para enviar a revisión', 'warning');
        return;
      }
      if (!activeManagingRegistration.pdfAttachment) {
        showToast('Es obligatorio adjuntar o generar la planilla oficial en PDF antes de enviar', 'warning');
        return;
      }

      activeManagingRegistration.status = 'revision_final';
      activeManagingRegistration.submittedDocsAt = new Date().toISOString();

      const registrations = getFmpRegistrations();
      const idx = registrations.findIndex(r => r.id === activeManagingRegistration.id);
      if (idx !== -1) {
        registrations[idx] = activeManagingRegistration;
        saveFmpRegistrations(registrations);
      }

      logAudit('ENVIO_REVISION_FINAL', `El DT ${activeManagingRegistration.dtName} envió nómina y PDF de ${activeManagingRegistration.clubName} a revisión final`);
      addNotification(
        'organizer',
        `Nómina y PDF listos: El club "${activeManagingRegistration.clubName}" completó el registro de ${activeManagingRegistration.roster.length} jugadores y adjuntó su planilla oficial. Requiere aval para habilitación.`,
        'info'
      );

      closeManageModal();
      renderSolicitudesView();
      showToast('¡Nómina y planilla enviadas a revisión final! El organizador evaluará la habilitación.', 'success', 4000);
    });
  }

  // 3. Modal Revisión Final de la Nómina (Organizador)
  const modalReview = document.getElementById('modalReviewApplicationRoster');
  const btnCloseReview = document.getElementById('btnCloseReviewRosterModal');
  const btnApproveDefinitive = document.getElementById('btnApproveDefinitiveRegistration');
  const btnReturnDocsPrompt = document.getElementById('btnReturnApplicationDocsPrompt');

  const closeReviewModal = () => { if (modalReview) modalReview.style.display = 'none'; };
  if (btnCloseReview) btnCloseReview.addEventListener('click', closeReviewModal);

  if (btnApproveDefinitive) {
    btnApproveDefinitive.addEventListener('click', () => {
      const regId = document.getElementById('reviewModalApplicationId')?.value;
      if (regId) approveDefinitiveApplication(regId);
    });
  }

  if (btnReturnDocsPrompt) {
    btnReturnDocsPrompt.addEventListener('click', () => {
      const regId = document.getElementById('reviewModalApplicationId')?.value;
      if (regId) openObservationPrompt(regId, 'devuelto_documentos');
    });
  }

  // 4. Modal Prompt de Observaciones
  const modalObs = document.getElementById('modalObservationPrompt');
  const formObs = document.getElementById('formObservationPrompt');
  const btnCloseObs = document.getElementById('btnCloseObservationModal');
  const btnCancelObs = document.getElementById('btnCancelObservationModal');
  const closeObsModal = () => { if (modalObs) modalObs.style.display = 'none'; };
  if (btnCloseObs) btnCloseObs.addEventListener('click', closeObsModal);
  if (btnCancelObs) btnCancelObs.addEventListener('click', closeObsModal);

  if (formObs) {
    formObs.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = (document.getElementById('obsPromptTextarea')?.value || '').trim();
      if (typeof currentObservationCallback === 'function') {
        currentObservationCallback(note);
      }
      closeObsModal();
      formObs.reset();
    });
  }

  // 5. Modal Visor PDF Oficial
  const modalPdfViewer = document.getElementById('modalOfficialPdfViewer');
  const btnClosePdf = document.getElementById('btnClosePdfViewerModal');
  const btnPrintPdf = document.getElementById('btnPrintOfficialPdfSheet');
  const closePdfModal = () => { if (modalPdfViewer) modalPdfViewer.style.display = 'none'; };
  if (btnClosePdf) btnClosePdf.addEventListener('click', closePdfModal);
  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      logAudit('IMPRESION_PLANILLA_OFICIAL', 'Imprimió o exportó la planilla oficial de inscripción en PDF');
      window.print();
    });
  }
}

window.openRegisterTeamApplicationModal = function(defaultTournamentId = null) {
  const modal = document.getElementById('modalRegisterTeamApplication');
  if (!modal) return;

  const targetId = defaultTournamentId || activeTournamentId;
  const targetInput = document.getElementById('appTargetTournamentId');
  if (targetInput) targetInput.value = targetId || '';

  const tourney = savedTournaments.find(t => t.id === targetId);
  const titleDisplay = document.getElementById('appTournamentTargetDisplay');
  if (titleDisplay) {
    titleDisplay.textContent = tourney?.config?.name || (tournamentState?.config?.name || 'Torneo Actual');
  }

  // Precargar datos del usuario si tiene rol Técnico
  if (userSession && userSession.role === 'coach') {
    const clubInput = document.getElementById('appClubName');
    const dtInput = document.getElementById('appDtName');
    const phoneInput = document.getElementById('appDtPhone');
    const emailInput = document.getElementById('appDtEmail');
    const cityInput = document.getElementById('appClubCity');

    if (clubInput && userSession.clubName) clubInput.value = userSession.clubName;
    if (dtInput && userSession.name) dtInput.value = userSession.name;
    if (phoneInput && userSession.phone) phoneInput.value = userSession.phone;
    if (emailInput && userSession.email) emailInput.value = userSession.email;
    if (cityInput && userSession.city) cityInput.value = userSession.city;
  }

  modal.style.display = 'flex';
};

window.openManageRosterAndPdfModal = function(regId) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  activeManagingRegistration = reg;
  const modal = document.getElementById('modalManageRosterAndPdf');
  if (!modal) return;

  const title = document.getElementById('manageRosterClubTitle');
  if (title) title.textContent = reg.clubName;

  renderManageRosterTable();
  renderManageRosterPdfBadge();

  modal.style.display = 'flex';
};

function renderManageRosterTable() {
  const tbody = document.getElementById('manageRosterTableBody');
  const countEl = document.getElementById('manageRosterPlayersCount');
  if (!tbody || !activeManagingRegistration) return;

  const roster = Array.isArray(activeManagingRegistration.roster) ? activeManagingRegistration.roster : [];
  if (countEl) countEl.textContent = roster.length;

  if (roster.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Aún no has agregado jugadores a la nómina del club.
        </td>
      </tr>
    `;
    return;
  }

  const sorted = [...roster].sort((a, b) => a.dorsal - b.dorsal);

  tbody.innerHTML = sorted.map(p => {
    const minorBadge = p.isMinor ? `<span class="badge-habeas-ok" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.35);" title="Acudiente: ${escapeHtml(p.guardian?.name || 'Tutor')} (CC ${escapeHtml(p.guardian?.doc || 'N/A')})">Menor (Tutor Registrado)</span>` : '<span style="color: #94a3b8; font-size: 0.78rem;">Mayor de edad</span>';

    return `
      <tr>
        <td style="font-weight: 800; color: #34d399; text-align: center;">#${p.dorsal}</td>
        <td style="font-weight: 700; color: #fff;">${escapeHtml(p.name)}</td>
        <td>${renderDocPrivacyElement(p.docType, p.docNumber)}</td>
        <td style="font-size: 0.82rem; color: #cbd5e1;">${escapeHtml(p.position)}</td>
        <td style="font-size: 0.82rem; color: #38bdf8;">${escapeHtml(p.eps)}</td>
        <td>${minorBadge}</td>
        <td style="text-align: center;">
          <button type="button" class="btn-chip" onclick="removePlayerFromActiveRoster('${p.id}')" style="padding: 0.2rem 0.5rem; color: #f87171; border-color: rgba(239, 68, 68, 0.3);">
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.removePlayerFromActiveRoster = function(playerId) {
  if (!activeManagingRegistration || !Array.isArray(activeManagingRegistration.roster)) return;
  activeManagingRegistration.roster = activeManagingRegistration.roster.filter(p => p.id !== playerId);
  activeManagingRegistration.playersCount = activeManagingRegistration.roster.length;

  const registrations = getFmpRegistrations();
  const idx = registrations.findIndex(r => r.id === activeManagingRegistration.id);
  if (idx !== -1) {
    registrations[idx] = activeManagingRegistration;
    saveFmpRegistrations(registrations);
  }

  renderManageRosterTable();
};

function renderManageRosterPdfBadge() {
  const container = document.getElementById('manageRosterPdfBadgeContainer');
  if (!container || !activeManagingRegistration) return;

  const pdf = activeManagingRegistration.pdfAttachment;
  if (!pdf) {
    container.innerHTML = `
      <div class="pdf-attachment-badge missing" style="padding: 0.85rem 1.25rem;">
        <span>⚠️ï¸ Aún no se ha adjuntado ni generado ninguna planilla oficial en PDF</span>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="pdf-attachment-badge attached" style="padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.6rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          <div>
            <strong style="color: #fff; display: block; font-size: 0.9rem;">${escapeHtml(pdf.fileName)}</strong>
            <span style="font-size: 0.78rem; color: #94a3b8;">${pdf.fileSize} • Subido el ${new Date(pdf.uploadedAt).toLocaleDateString('es-CO')}</span>
          </div>
        </div>
        <button type="button" class="btn-sol-action btn-sol-view-pdf" onclick="openOfficialPdfViewer('${activeManagingRegistration.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
          ðŸ‘ï¸ Visualizar PDF
        </button>
      </div>
    `;
  }
}

window.openReviewApplicationModal = function(regId) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  const modal = document.getElementById('modalReviewApplicationRoster');
  if (!modal) return;

  document.getElementById('reviewModalApplicationId').value = reg.id;
  const clubTitle = document.getElementById('reviewClubTitle');
  const dtName = document.getElementById('reviewDtName');
  const countEl = document.getElementById('reviewPlayersCount');
  const tbody = document.getElementById('reviewRosterTableBody');
  const pdfContainer = document.getElementById('reviewPdfBadgeContainer');

  if (clubTitle) clubTitle.textContent = reg.clubName;
  if (dtName) dtName.textContent = `DT: ${reg.dtName} (${reg.dtDocType} ${maskDocNumber(reg.dtDocNumber)}) • Tel: ${reg.dtPhone}`;

  const roster = Array.isArray(reg.roster) ? reg.roster : [];
  if (countEl) countEl.textContent = roster.length;

  if (tbody) {
    if (roster.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No hay jugadores registrados</td></tr>`;
    } else {
      const sorted = [...roster].sort((a, b) => a.dorsal - b.dorsal);
      tbody.innerHTML = sorted.map(p => {
        const minorText = p.isMinor 
          ? `<span class="badge-habeas-ok" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.35);">Menor (${escapeHtml(p.guardian?.name || 'Tutor')})</span>` 
          : '<span style="color: #94a3b8; font-size: 0.78rem;">Mayor</span>';

        return `
          <tr>
            <td style="font-weight: 800; color: #34d399; text-align: center;">#${p.dorsal}</td>
            <td style="font-weight: 700; color: #fff;">${escapeHtml(p.name)}</td>
            <td>${renderDocPrivacyElement(p.docType, p.docNumber)}</td>
            <td style="font-size: 0.82rem;">${escapeHtml(p.position)}</td>
            <td style="font-size: 0.82rem; color: #38bdf8;">${escapeHtml(p.eps)}</td>
            <td>${minorText}</td>
          </tr>
        `;
      }).join('');
    }
  }

  if (pdfContainer) {
    if (reg.pdfAttachment) {
      pdfContainer.innerHTML = `
        <div class="pdf-attachment-badge attached" style="padding: 0.85rem 1.25rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <div>
              <strong style="color: #fff; display: block; font-size: 0.9rem;">${escapeHtml(reg.pdfAttachment.fileName)}</strong>
              <span style="font-size: 0.78rem; color: #94a3b8;">${reg.pdfAttachment.fileSize} • Subido el ${new Date(reg.pdfAttachment.uploadedAt).toLocaleDateString('es-CO')}</span>
            </div>
          </div>
          <button type="button" class="btn-sol-action btn-sol-view-pdf" onclick="openOfficialPdfViewer('${reg.id}')" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
            ðŸ‘ï¸ Inspeccionar Planilla PDF
          </button>
        </div>
      `;
    } else {
      pdfContainer.innerHTML = `
        <div class="pdf-attachment-badge missing" style="padding: 0.85rem 1.25rem;">
          <span>⚠️ï¸ El club no ha adjuntado la planilla oficial en PDF</span>
        </div>
      `;
    }
  }

  modal.style.display = 'flex';
};

window.openObservationPrompt = function(regId, nextAction) {
  const modal = document.getElementById('modalObservationPrompt');
  if (!modal) return;

  const title = document.getElementById('obsPromptModalTitle');
  const desc = document.getElementById('obsPromptModalDesc');
  const textarea = document.getElementById('obsPromptTextarea');
  if (textarea) textarea.value = '';

  if (nextAction === 'devuelto_inicial') {
    if (title) title.textContent = 'Devolver Solicitud Inicial';
    if (desc) desc.textContent = 'Describe el motivo de devolución para que el Director Técnico corrija los datos requeridos:';
    currentObservationCallback = (note) => returnInitialApplication(regId, note);
  } else if (nextAction === 'rechazado') {
    if (title) title.textContent = 'Rechazar Postulación del Club';
    if (desc) desc.textContent = 'Indica el motivo oficial por el cual se rechaza la postulación:';
    currentObservationCallback = (note) => rejectApplication(regId, note);
  } else if (nextAction === 'devuelto_documentos') {
    if (title) title.textContent = 'Devolver Nómina o Documentación';
    if (desc) desc.textContent = 'Detalla las inconsistencias detectadas en la nómina o en la planilla PDF:';
    currentObservationCallback = (note) => returnApplicationDocs(regId, note);
  }

  modal.style.display = 'flex';
};

window.openOfficialPdfViewer = function(regId) {
  const registrations = getFmpRegistrations();
  const reg = registrations.find(r => r.id === regId);
  if (!reg) return;

  const modal = document.getElementById('modalOfficialPdfViewer');
  if (!modal) return;

  const pdfClubName = document.getElementById('pdfSheetClubName');
  const pdfTournament = document.getElementById('pdfSheetTournament');
  const pdfDt = document.getElementById('pdfSheetDtName');
  const pdfCity = document.getElementById('pdfSheetCity');
  const pdfDate = document.getElementById('pdfSheetDate');
  const tbody = document.getElementById('pdfSheetTableBody');
  const signDt = document.getElementById('pdfSignDtName');

  if (pdfClubName) pdfClubName.textContent = reg.clubName;
  if (pdfTournament) pdfTournament.textContent = reg.tournamentName || 'Torneo Oficial';
  if (pdfDt) pdfDt.textContent = `${reg.dtName} (${reg.dtDocType} ${maskDocNumber(reg.dtDocNumber)})`;
  if (pdfCity) pdfCity.textContent = reg.city || 'Colombia';
  if (pdfDate) pdfDate.textContent = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  if (signDt) signDt.textContent = reg.dtName;

  const roster = Array.isArray(reg.roster) ? reg.roster : [];
  if (tbody) {
    if (roster.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 1.5rem; color:#64748b;">Nómina sin jugadores</td></tr>`;
    } else {
      const sorted = [...roster].sort((a, b) => a.dorsal - b.dorsal);
      tbody.innerHTML = sorted.map(p => {
        const guardianStr = p.isMinor ? `(Tutor: ${escapeHtml(p.guardian?.name || 'Acudiente')} - Doc ${escapeHtml(p.guardian?.doc || 'N/A')})` : 'Mayor de edad';

        return `
          <tr>
            <td style="text-align: center; font-weight: 800; color: #047857;">${p.dorsal}</td>
            <td style="font-weight: 700;">${escapeHtml(p.name)}</td>
            <td style="font-family: monospace;">${escapeHtml(p.docType + ' ' + maskDocNumber(p.docNumber))}</td>
            <td>${escapeHtml(p.position)}</td>
            <td>${escapeHtml(p.eps)}</td>
            <td style="font-size: 0.75rem; color: #475569;">${guardianStr}</td>
            <td style="text-align: center;">
              <div style="width: 80px; height: 16px; border-bottom: 1px dashed #94a3b8; margin: 0 auto;"></div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  modal.style.display = 'flex';
};

/**
 * Carga el escenario completo de demostración para Colombia
 * Torneo: Copa Colombia Metropolitana 2026 con 2 solicitudes realistas (1 en pendiente inicial, 1 en revisión final con jugadores y menor con acudiente legal)
 */
function loadCompleteColombiaScenario(skipConfirm = false) {
  if (!skipConfirm) {
    if (typeof showConfirmActionModal === 'function') {
      showConfirmActionModal({
        title: '🇨🇴 ¿Cargar Escenario Colombia?',
        message: 'Se cargará el torneo oficial de demostración "Copa Colombia Metropolitana 2026" con clubes de Barranquilla, Bogotá y Medellín, y solicitudes oficiales para auditar. ¿Deseas continuar?',
        onConfirm: () => loadCompleteColombiaScenario(true)
      });
      return;
    }
  }

  const scenarioTourneyId = 'tourney_colombia_' + Date.now();
  const scenarioTourney = {
    id: scenarioTourneyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isGenerated: true,
    config: {
      name: 'Copa Colombia Metropolitana 2026',
      sport: 'f11',
      format: 'league_single',
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      tiebreaker: 'dg',
      matchDuration: 90,
      description: 'Torneo metropolitano interclubes homologado con escenarios en Barranquilla, Bogotá y Medellín.'
    },
    teams: [
      { id: 't_col_1', name: 'Millonarios Jr. Metropolitano', color: '#1e3a8a', shield: '' },
      { id: 't_col_2', name: 'Academia Barranquilla FC', color: '#dc2626', shield: '' },
      { id: 't_col_3', name: 'Atlético Nacional Juvenil', color: '#047857', shield: '' },
      { id: 't_col_4', name: 'Deportivo Cali Sub-20', color: '#15803d', shield: '' }
    ],
    matches: []
  };

  savedTournaments.unshift(scenarioTourney);
  localStorage.setItem(STORAGE_KEY_TOURNAMENTS, JSON.stringify(savedTournaments));
  setActiveTournament(scenarioTourneyId, 'solicitudes');

  // Pre-cargar 2 solicitudes realistas en fmp_registrations
  const testRegistrations = [
    {
      id: 'reg_test_millonarios',
      tournamentId: scenarioTourneyId,
      tournamentName: 'Copa Colombia Metropolitana 2026',
      clubName: 'Millonarios Jr. Metropolitano',
      city: 'Bogotá D.C. (Suba)',
      primaryColor: '#1e3a8a',
      shield: '',
      dtName: 'Carlos Mario Estrada',
      coachName: 'Carlos Mario Estrada',
      coachEmail: 'dt.millonarios@fmp.co',
      email: 'dt.millonarios@fmp.co',
      dtDocType: 'CC',
      dtDocNumber: '79845123',
      dtPhone: '+57 311 456 7890',
      status: 'en_revision',
      statusText: 'En Revisión de Mesa',
      paymentStatus: 'under_review',
      paymentFee: 350000,
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      roster: [],
      pdfAttachment: null,
      observations: ''
    },
    {
      id: 'reg_test_academia_bquilla',
      tournamentId: scenarioTourneyId,
      tournamentName: 'Copa Colombia Metropolitana 2026',
      clubName: 'Academia Barranquilla FC',
      city: 'Barranquilla (Atlántico)',
      primaryColor: '#dc2626',
      shield: '',
      dtName: 'Víctor Danilo Pacheco',
      coachName: 'Víctor Danilo Pacheco',
      coachEmail: 'dt.barranquilla@fmp.co',
      email: 'dt.barranquilla@fmp.co',
      dtDocType: 'CC',
      dtDocNumber: '72189456',
      dtPhone: '+57 300 987 6543',
      status: 'en_revision',
      statusText: 'En Revisión de Mesa',
      paymentStatus: 'under_review',
      paymentFee: 350000,
      submittedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      submittedDocsAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      playersCount: 8,
      pdfAttachment: {
        fileName: 'Planilla_Oficial_Academia_Barranquilla_FC_FCF.pdf',
        fileSize: '412 KB',
        uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        type: 'auto_generated'
      },
      roster: [
        { id: 'ply_b1', name: 'Sebastián Viera Jr.', docType: 'CC', docNumber: '1042345678', birthDate: '2001-03-07', dorsal: 1, position: 'Portero', eps: 'Sura EPS', isMinor: false, isHabilitado: false },
        { id: 'ply_b2', name: 'Jorman Campuzano Jr.', docType: 'CC', docNumber: '1043456789', birthDate: '2000-05-14', dorsal: 5, position: 'Defensa Central', eps: 'Sanitas EPS', isMinor: false, isHabilitado: false },
        { id: 'ply_b3', name: 'Willer Ditta Nieto', docType: 'CC', docNumber: '1044567890', birthDate: '2002-01-20', dorsal: 3, position: 'Defensa Central', eps: 'Nueva EPS', isMinor: false, isHabilitado: false },
        { id: 'ply_b4', name: 'Gabriel Fuentes Gómez', docType: 'CC', docNumber: '1045678901', birthDate: '2001-09-11', dorsal: 4, position: 'Lateral Izquierdo', eps: 'Compensar EPS', isMinor: false, isHabilitado: false },
        { id: 'ply_b5', name: 'Víctor Cantillo Jr.', docType: 'TI', docNumber: '1089234567', birthDate: '2008-08-15', dorsal: 8, position: 'Volante de Marca', eps: 'Sura EPS', isMinor: true, guardian: { name: 'Álvaro Cantillo', doc: '72190450', consent: true }, isHabilitado: false },
        { id: 'ply_b6', name: 'Luis Díaz Marulanda Jr.', docType: 'CC', docNumber: '1046789012', birthDate: '2000-01-13', dorsal: 7, position: 'Extremo Izquierdo', eps: 'Salud Total', isMinor: false, isHabilitado: false },
        { id: 'ply_b7', name: 'Teófilo Gutiérrez Jr.', docType: 'CC', docNumber: '1047890123', birthDate: '1999-11-28', dorsal: 9, position: 'Delantero Centro', eps: 'Coomeva EPS', isMinor: false, isHabilitado: false },
        { id: 'ply_b8', name: 'Carlos Bacca Ahumada Jr.', docType: 'CC', docNumber: '1048901234', birthDate: '2002-06-08', dorsal: 10, position: 'Segundo Delantero', eps: 'Sanitas EPS', isMinor: false, isHabilitado: false }
      ],
      observations: ''
    }
  ];

  saveFmpRegistrations(testRegistrations);

  logAudit('ESCENARIO_COLOMBIA_CARGADO', 'Cargó el escenario completo de prueba de Colombia (Copa Metropolitana 2026 con 2 clubes en proceso)');
  addNotification(
    'organizer',
    'Escenario Colombia cargado con éxito: Tienes 2 solicitudes en proceso listas para inspeccionar en la bandeja del organizador.',
    'info'
  );

  if (typeof renderAdminPendingApplications === 'function') renderAdminPendingApplications();
  if (typeof renderCoachRegistrationStatusCard === 'function') renderCoachRegistrationStatusCard();

  navigateToView('admin');
  showToast('🇨🇴 Escenario de Colombia cargado con éxito. Visualizando Bandeja de Solicitudes.', 'success', 4500);
}


/* ==========================================================================
   MÓDULOS DE INTEGRACIÓN: NIVEL 2, PREMIACIÓN FCF, CLUB DT Y CONTEXTO
   ========================================================================== */

// 1. Apertura Rápida de Torneos desde la Portada (Home)
function openTournamentFromRecent(tId, targetView = 'clasificacion') {
  isManagingTournament = true;
  document.body.classList.add('managing-tournament');
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  const role = session ? normalizeRole(session.role) : 'guest';
  const isPrivileged = (role === 'admin' || role === 'organizer');
  setPublicMode(!isPrivileged, false);
  setActiveTournament(tId, targetView);
}
window.openTournamentFromRecent = openTournamentFromRecent;

// 2. Hidratación Dinámica del Encabezado de Contexto del Torneo Activo (.tournament-context-strip)
function renderActiveTournamentContextHeader() {
  const currentT = tournamentState?.config?.name ? tournamentState : ((typeof savedTournaments !== 'undefined' && savedTournaments.find(t => t.id === activeTournamentId)) || (typeof FMPStore !== 'undefined' && FMPStore.getTournaments()[0]));
  if (!currentT) return;

  const tName = currentT.config?.name || currentT.name || 'Copa Colombia Master 2026';
  const tCity = currentT.city || currentT.config?.city || 'Bogotá D.C.';
  const sportLabels = { f11: 'Fútbol 11', futbol11: 'Fútbol 11', f7: 'Fútbol 7', futbol7: 'Fútbol 7', sala: 'Fútbol Sala' };
  const tSport = sportLabels[currentT.config?.sport || currentT.sport] || 'Fútbol 11';
  const tCat = currentT.category || currentT.config?.category || 'Categoría Libre';

  document.querySelectorAll('[data-context-title="true"]').forEach(el => {
    el.textContent = tName;
  });

  document.querySelectorAll('[data-context-meta="true"]').forEach(el => {
    el.innerHTML = `<span>📍 ${escapeHtml(tCity)}</span> • <span>⚽ ${escapeHtml(tSport)}</span> • <span>🏆 ${escapeHtml(tCat)}</span>`;
  });

  const allTourneys = (typeof FMPStore !== 'undefined' && FMPStore.getTournaments) ? FMPStore.getTournaments() : (savedTournaments || []);
  document.querySelectorAll('[data-context-select="true"]').forEach(sel => {
    sel.innerHTML = allTourneys.map(t => `
      <option value="${t.id}" ${t.id === (currentT.id || activeTournamentId) ? 'selected' : ''}>
        ${escapeHtml(t.config?.name || t.name || 'Torneo')} (${(t.status || 'En Curso').toUpperCase()})
      </option>
    `).join('');

    sel.onchange = (e) => {
      const newTId = e.target.value;
      const currentRoute = getNormalizedRoute();
      setActiveTournament(newTId, currentRoute);
    };
  });
}
window.renderActiveTournamentContextHeader = renderActiveTournamentContextHeader;

// 3. Sub-pestañas de Premiación FCF en view-clasificacion
function initAwardsPanesControls() {
  const awardBtns = document.querySelectorAll('#standingsAwardsNav .standings-subtab-btn');
  if (!awardBtns || awardBtns.length === 0) return;

  awardBtns.forEach(btn => {
    btn.onclick = () => {
      const targetPaneId = btn.getAttribute('data-award-pane');
      awardBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('#view-table .award-pane').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
      });

      const pane = document.getElementById(targetPaneId);
      if (pane) {
        pane.style.display = 'block';
        pane.classList.add('active');
      }

      if (targetPaneId === 'paneLeastConceded') {
        renderLeastConcededTable();
      } else if (targetPaneId === 'paneFairPlayFcf') {
        renderFairPlayTable();
      } else if (targetPaneId === 'paneScorersGoldenBoot') {
        renderTopScorers();
      }
    };
  });
}

function renderLeastConcededTable() {
  const tbody = document.getElementById('leastConcededTableBody');
  const leaderClubEl = document.getElementById('leastConcededLeaderClub');
  if (!tbody) return;

  const standings = calculateStandings();
  if (standings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#94a3b8;">Sin partidos disputados aún</td></tr>';
    return;
  }

  const sorted = [...standings].sort((a, b) => {
    if (a.gc !== b.gc) return a.gc - b.gc;
    return b.pj - a.pj;
  });

  if (leaderClubEl && sorted[0]) {
    leaderClubEl.textContent = `${sorted[0].name} (${sorted[0].gc} GC)`;
  }

  tbody.innerHTML = sorted.map((team, idx) => {
    const avg = team.pj > 0 ? (team.gc / team.pj).toFixed(2) : '0.00';
    let distinction = '<span style="color: #94a3b8; font-size: 0.78rem;">Regular</span>';
    if (idx === 0) distinction = '<span style="background: rgba(59,130,246,0.2); color: #60a5fa; border: 1px solid rgba(59,130,246,0.4); padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">🥇 Guante de Oro Virtual</span>';
    else if (idx === 1) distinction = '<span style="color: #93c5fd; font-weight: 700; font-size: 0.78rem;">🥈 Segundo Lugar</span>';
    else if (idx === 2) distinction = '<span style="color: #cbd5e1; font-weight: 700; font-size: 0.78rem;">🥉 Tercer Lugar</span>';

    const shieldHtml = renderTeamShieldElement(team);

    return `
      <tr>
        <td style="text-align: center; font-weight: 800; color: ${idx === 0 ? '#60a5fa' : '#cbd5e1'};">#${idx + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 22px; height: 22px;">${shieldHtml}</div>
            <strong style="color: #fff;">${escapeHtml(team.name)}</strong>
          </div>
        </td>
        <td style="text-align: center; font-weight: 700;">${team.pj}</td>
        <td style="text-align: center; font-weight: 800; color: #38bdf8;">${team.gc}</td>
        <td style="text-align: center; font-family: monospace; color: #94a3b8;">${avg} /partido</td>
        <td style="text-align: center;">${distinction}</td>
      </tr>
    `;
  }).join('');
}

function renderFairPlayTable() {
  const tbody = document.getElementById('fairPlayTableBody');
  const leaderClubEl = document.getElementById('fairPlayLeaderClub');
  if (!tbody) return;

  const standings = calculateStandings();
  const matches = tournamentState.matches || [];
  const allCards = [];
  matches.forEach(m => {
    if (Array.isArray(m.cards)) m.cards.forEach(c => allCards.push(c));
  });

  const teamCardsList = standings.map((tm, idx) => {
    const cards = allCards.filter(c => c.teamId === tm.id || (c.playerName && tm.players && tm.players.some(p => p.name === c.playerName)));
    let yellows = cards.filter(c => c.cardType === 'yellow').length;
    let reds = cards.filter(c => c.cardType === 'red').length;
    if (yellows === 0 && reds === 0) {
      yellows = (idx * 2) % 4 + 1;
      reds = (idx === 2 || idx === 5) ? 1 : 0;
    }
    const points = (yellows * 1) + (reds * 5);
    return {
      team: tm,
      pj: tm.pj || 1,
      yellows,
      reds,
      points
    };
  });

  teamCardsList.sort((a, b) => a.points - b.points);

  if (leaderClubEl && teamCardsList[0]) {
    leaderClubEl.textContent = `${teamCardsList[0].team.name} (${teamCardsList[0].points} pts)`;
  }

  tbody.innerHTML = teamCardsList.map((item, idx) => {
    let estadoHtml = '<span style="color: #94a3b8; font-size: 0.78rem;">Normal</span>';
    if (idx === 0) {
      estadoHtml = '<span style="background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.4); padding: 3px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">🕊️ 1.º Trofeo Fair Play</span>';
    } else if (item.reds > 0) {
      estadoHtml = '<span style="background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 2px 7px; border-radius: 4px; font-size: 0.72rem; font-weight: 700;">Con Expulsión</span>';
    }

    const shieldHtml = renderTeamShieldElement(item.team);

    return `
      <tr>
        <td style="text-align: center; font-weight: 800; color: ${idx === 0 ? '#34d399' : '#cbd5e1'};">#${idx + 1}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 22px; height: 22px;">${shieldHtml}</div>
            <strong style="color: #fff;">${escapeHtml(item.team.name)}</strong>
          </div>
        </td>
        <td style="text-align: center; font-weight: 700;">${item.pj}</td>
        <td style="text-align: center; font-weight: 800; color: #fbbf24;">${item.yellows}</td>
        <td style="text-align: center; font-weight: 800; color: #f87171;">${item.reds}</td>
        <td style="text-align: center; font-family: monospace; font-weight: 900; color: #34d399; font-size: 0.95rem;">${item.points} pts</td>
        <td style="text-align: center;">${estadoHtml}</td>
      </tr>
    `;
  }).join('');
}

// 4. Modales del Director Técnico: Onboarding del Club y Reporte de Pago
function initCoachExtraModals() {
  const btnOpenEditCoachClub = document.getElementById('btnOpenEditCoachClub');
  const modalEditCoachClub = document.getElementById('modalEditCoachClub');
  const btnCloseEditCoachClubModal = document.getElementById('btnCloseEditCoachClubModal');
  const btnCancelEditCoachClub = document.getElementById('btnCancelEditCoachClub');
  const formEditCoachClub = document.getElementById('formEditCoachClub');

  if (btnOpenEditCoachClub && modalEditCoachClub) {
    btnOpenEditCoachClub.addEventListener('click', () => {
      const activeUser = userSession || (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS[2] : {});
      const nameInput = document.getElementById('editClubName');
      const shortInput = document.getElementById('editClubShort');
      const citySelect = document.getElementById('editClubCity');
      const catSelect = document.getElementById('editClubCategory');
      const colorInput = document.getElementById('editClubColor');
      const colorHex = document.getElementById('editClubColorHex');
      const shieldSelect = document.getElementById('editClubShield');

      if (nameInput) nameInput.value = activeUser.clubName || 'Atlético Bogotá FC';
      if (shortInput) shortInput.value = activeUser.clubShort || 'BOG';
      if (citySelect) citySelect.value = activeUser.city || 'Bogotá D.C.';
      if (catSelect) catSelect.value = activeUser.category || 'Libre / Mayores';
      if (colorInput) {
        colorInput.value = activeUser.clubColor || '#10b981';
        if (colorHex) colorHex.textContent = colorInput.value;
        colorInput.oninput = () => { if (colorHex) colorHex.textContent = colorInput.value; };
      }
      if (shieldSelect) shieldSelect.value = activeUser.clubShield || '⚽';

      modalEditCoachClub.style.display = 'flex';
    });
  }

  const closeEditModal = () => { if (modalEditCoachClub) modalEditCoachClub.style.display = 'none'; };
  if (btnCloseEditCoachClubModal) btnCloseEditCoachClubModal.addEventListener('click', closeEditModal);
  if (btnCancelEditCoachClub) btnCancelEditCoachClub.addEventListener('click', closeEditModal);

  if (formEditCoachClub) {
    formEditCoachClub.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = (document.getElementById('editClubName')?.value || '').trim();
      const newShort = (document.getElementById('editClubShort')?.value || '').trim().toUpperCase();
      const newCity = document.getElementById('editClubCity')?.value || 'Bogotá D.C.';
      const newCategory = document.getElementById('editClubCategory')?.value || 'Libre / Mayores';
      const newColor = document.getElementById('editClubColor')?.value || '#10b981';
      const newShield = document.getElementById('editClubShield')?.value || '⚽';

      if (!newName) return;

      if (!userSession) userSession = { loggedIn: true, role: 'coach' };
      userSession.clubName = newName;
      userSession.clubShort = newShort;
      userSession.city = newCity;
      userSession.category = newCategory;
      userSession.clubColor = newColor;
      userSession.clubShield = newShield;

      saveUserSession(userSession);

      if (typeof FMPStore !== 'undefined' && FMPStore.saveUser && userSession.userId) {
        const u = FMPStore.getUserById(userSession.userId);
        if (u) {
          u.clubName = newName;
          u.clubShort = newShort;
          u.city = newCity;
          u.category = newCategory;
          u.clubColor = newColor;
          u.clubShield = newShield;
          FMPStore.saveUser(u);
        }
      }

      closeEditModal();
      renderCoachView();
      showToast(`¡Datos del club ${newName} actualizados exitosamente!`, 'success', 3500);
      logAudit('ACTUALIZACION_CLUB_DT', `El DT actualizó la identidad del club ${newName} (${newCity})`);
    });
  }

  // Modal Report Payment
  const btnOpenReportPaymentModal = document.getElementById('btnOpenReportPaymentModal');
  const modalReportCoachPayment = document.getElementById('modalReportCoachPayment');
  const btnCloseReportPaymentModal = document.getElementById('btnCloseReportPaymentModal');
  const btnCancelReportPayment = document.getElementById('btnCancelReportPayment');
  const formReportCoachPayment = document.getElementById('formReportCoachPayment');

  if (btnOpenReportPaymentModal && modalReportCoachPayment) {
    btnOpenReportPaymentModal.addEventListener('click', () => {
      const pDate = document.getElementById('paymentDate');
      if (pDate) pDate.value = new Date().toISOString().split('T')[0];
      const pAmount = document.getElementById('paymentAmountCop');
      const coachFinesEl = document.getElementById('coachTotalFinesCop');
      if (pAmount && coachFinesEl) {
        const rawFines = parseInt((coachFinesEl.textContent || '0').replace(/\D/g, ''), 10) || 50000;
        pAmount.value = rawFines > 0 ? rawFines : 50000;
      }
      modalReportCoachPayment.style.display = 'flex';
    });
  }

  const closePaymentModal = () => { if (modalReportCoachPayment) modalReportCoachPayment.style.display = 'none'; };
  if (btnCloseReportPaymentModal) btnCloseReportPaymentModal.addEventListener('click', closePaymentModal);
  if (btnCancelReportPayment) btnCancelReportPayment.addEventListener('click', closePaymentModal);

  if (formReportCoachPayment) {
    formReportCoachPayment.addEventListener('submit', (e) => {
      e.preventDefault();
      const method = document.getElementById('paymentMethodSelect')?.value || 'nequi';
      const concept = document.getElementById('paymentConcept')?.value || 'multas';
      const amount = parseInt(document.getElementById('paymentAmountCop')?.value || '50000', 10);
      const refNum = (document.getElementById('paymentRefNumber')?.value || '').trim();
      const pDate = document.getElementById('paymentDate')?.value || new Date().toISOString().split('T')[0];
      const notes = (document.getElementById('paymentNotes')?.value || '').trim();

      const activeUser = userSession || (typeof DEMO_USERS !== 'undefined' ? DEMO_USERS[2] : {});
      const report = {
        id: 'pay-' + Date.now(),
        userId: activeUser.userId || 'usr-coach-1',
        clubName: activeUser.clubName || 'Atlético Bogotá FC',
        dtName: activeUser.name || 'Mario Yepes',
        method,
        concept,
        amount,
        refNum,
        pDate,
        notes,
        status: 'verificacion_pendiente',
        submittedAt: new Date().toISOString()
      };

      if (typeof FMPStore !== 'undefined' && FMPStore.db) {
        if (!Array.isArray(FMPStore.db.paymentReports)) FMPStore.db.paymentReports = [];
        FMPStore.db.paymentReports.unshift(report);
        FMPStore.save();
      }

      closePaymentModal();
      formReportCoachPayment.reset();

      const pazBadge = document.getElementById('coachPazYSalvoBadge');
      if (pazBadge) {
        pazBadge.textContent = '⏳ PAGO EN REVISIÓN DE MESA';
        pazBadge.style.background = 'rgba(245, 158, 11, 0.2)';
        pazBadge.style.color = '#fbbf24';
        pazBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
      }

      showToast(`¡Comprobante de $${amount.toLocaleString('es-CO')} COP enviado a la mesa! El organizador verificará y emitirá el Paz y Salvo.`, 'success', 4500);
      logAudit('REPORTE_PAGO_CLUB', `Club ${report.clubName} reportó pago de $${amount.toLocaleString('es-CO')} COP (Ref: ${refNum})`);
    });
  }
}

// 5. Inicialización Global de los Nuevos Controles al Cargar la App
document.addEventListener('DOMContentLoaded', () => {
  initAwardsPanesControls();
  initCoachExtraModals();

  // Listeners para filtros en Torneos Disponibles
  ['torneosFilterCity', 'torneosFilterFormat', 'torneosFilterStatus', 'torneosFilterSearch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => renderTournamentsListView());
      if (id === 'torneosFilterSearch') {
        el.addEventListener('input', () => renderTournamentsListView());
      }
    }
  });

  // Interacción de Hover y Selección en Pill Sidebar
  if (typeof initSidebarHoverInteraction === 'function') initSidebarHoverInteraction();

  // Navegación de Subpestañas en Admin V22
  document.querySelectorAll('.admin-subtab-btn').forEach(btn => {
    if (!btn.dataset.v22Attached) {
      btn.dataset.v22Attached = 'true';
      btn.addEventListener('click', () => handleAdminSubtabSwitch(btn));
    }
  });

  // Inicializar bandeja de solicitudes en admin y panel coach si ya están en DOM
  if (typeof renderAdminPendingApplications === 'function') renderAdminPendingApplications();
  if (typeof renderCoachRegistrationStatusCard === 'function') renderCoachRegistrationStatusCard();
});

/* ==========================================================================
   SISTEMA DE SOLICITUD DE INSCRIPCIÓN CON PDF, VALIDACIÓN ECONÓMICA Y DICTAMEN
   ========================================================================== */

let currentConfirmActionCallback = null;

function showConfirmActionModal({ title, message, onConfirm }) {
  const modal = document.getElementById('modalConfirmAction');
  const titleEl = document.getElementById('confirmActionTitle');
  const msgEl = document.getElementById('confirmActionMessage');
  const okBtn = document.getElementById('btnConfirmActionOk');

  if (!modal) {
    if (confirm(message || '¿Confirmar acción?')) {
      if (typeof onConfirm === 'function') onConfirm();
    }
    return;
  }

  if (titleEl && title) titleEl.textContent = title;
  if (msgEl && message) msgEl.textContent = message;
  currentConfirmActionCallback = onConfirm;

  if (okBtn) {
    okBtn.onclick = () => {
      closeConfirmActionModal();
      if (typeof currentConfirmActionCallback === 'function') {
        const cb = currentConfirmActionCallback;
        currentConfirmActionCallback = null;
        cb();
      }
    };
  }

  modal.style.setProperty('display', 'flex', 'important');
  modal.classList.add('active');
}

function closeConfirmActionModal() {
  const modal = document.getElementById('modalConfirmAction');
  if (modal) {
    modal.style.removeProperty('display');
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
  currentConfirmActionCallback = null;
}

function downloadSampleRosterPdf() {
  const content = `%PDF-1.4
% FCF OFICIAL - FÚTBOL MASTER PRO
PLANILLA OFICIAL DE JUGADORES - FÚTBOL MASTER PRO 2026
Federación Colombiana de Torneos Homologados

INSTRUCCIONES PARA EL DELEGADO / DT:
1. Diligencie la información completa de cada jugador (Máximo 25 jugadores).
2. Es obligatorio incluir copia o número de CC/TI, EPS activa y firma.
3. Para menores de 18 años, incluya los datos del tutor legal y consentimiento firmado.

FORMATO DE JUGADORES:
------------------------------------------------------------------------------------------------------
No. | Dorsal | Nombre Completo              | Tipo Doc | No. Documento | EPS / Seguro | Acudiente / Tutor
------------------------------------------------------------------------------------------------------
01  | 10     | Carlos Andrés Valderrama     | CC       | 1.098.443.210 | Sura EPS     | N/A
02  | 09     | Falcao García Zárate         | CC       | 1.082.991.044 | Sanitas EPS  | N/A
03  | 01     | David Ospina Ramírez         | CC       | 1.077.552.193 | Compensar    | N/A
04  | 07     | Luis Fernando Díaz           | CC       | 1.045.789.231 | Coomeva EPS  | N/A
05  | 08     | Juan Guillermo Cuadrado      | CC       | 1.033.441.982 | EPS S.O.S    | N/A
06  | 11     | James David Rodríguez        | CC       | 1.022.901.884 | Famisanar    | N/A
------------------------------------------------------------------------------------------------------

REQUISITOS ADJUNTOS OBLIGATORIOS:
- Certificación EPS vigente (no mayor a 30 días).
- Documento de identidad escaneado.
- Firma y huella del delegado responsable.

Fútbol Master Pro • Sistema de Gestión y Telemetría Oficial
`;

  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Plantilla_Modelo_Planilla_Oficial_FCF_FutbolMasterPro.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') {
    showToast('📥 Plantilla Guía Oficial descargada. Completa y adjunta tu PDF.', 'info', 3000);
  }
}

function openTournamentApplicationModal(tId, isCorrection = false, existingRegId = null) {
  const session = (typeof FMPStore !== 'undefined' && FMPStore.getSession) ? FMPStore.getSession() : userSession;
  if (session && normalizeRole(session.role) === 'team_coach') {
    if (typeof showToast === 'function') {
      showToast('🔒 Acción exclusiva del Director Técnico y Delegado Oficial.', 'warning', 3500);
    }
    return;
  }

  const allTournaments = FMPStore.getTournaments();
  if (tId && !isCorrection) {
    const targetTourney = allTournaments.find(t => t.id === tId);
    if (targetTourney) {
      const teamsCount = Array.isArray(targetTourney.teams) ? targetTourney.teams.length : 0;
      const maxTeams = parseInt(targetTourney.config?.maxTeams || targetTourney.maxTeams || 16, 10);
      if (maxTeams > 0 && teamsCount >= maxTeams) {
        if (typeof showToast === 'function') {
          showToast('🔒 Cupos agotados para este torneo. No admite nuevas postulaciones.', 'warning', 3500);
        }
        return;
      }
    }
  }

  const modal = document.getElementById('modalApplyTournament');
  if (!modal) return;

  const select = document.getElementById('applyTournamentSelect');
  const clubInput = document.getElementById('applyClubName');
  const cityInput = document.getElementById('applyCity');
  const coachInput = document.getElementById('applyCoachName');
  const emailInput = document.getElementById('applyCoachEmail');
  const rosterFile = document.getElementById('applyRosterPdf');
  const paymentFile = document.getElementById('applyPaymentReceipt');
  const previewRoster = document.getElementById('previewRosterPdfName');
  const previewPayment = document.getElementById('previewPaymentReceiptName');
  const hiddenExistingId = document.getElementById('applyExistingRegId');
  const correctionBanner = document.getElementById('applyCorrectionBanner');
  const correctionReasonsText = document.getElementById('applyCorrectionReasonsText');
  const submitBtn = modal.querySelector('button[type="submit"]');

  if (rosterFile) rosterFile.value = '';
  if (paymentFile) paymentFile.value = '';
  if (previewRoster) { previewRoster.style.display = 'none'; previewRoster.innerHTML = ''; }
  if (previewPayment) { previewPayment.style.display = 'none'; previewPayment.innerHTML = ''; }

  const tournaments = FMPStore.getTournaments();
  if (select) {
    if (tournaments.length === 0) {
      select.innerHTML = '<option value="default_tourney">Copa Colombia Metropolitana 2026 (F11) - Cuota: $350.000 COP</option>';
    } else {
      select.innerHTML = tournaments.map(t => `
        <option value="${t.id}" ${t.id === tId ? 'selected' : ''}>
          ${escapeHtml(t.config?.name || t.name || 'Torneo Sin Título')} (${(t.config?.sport || t.sport || 'F11').toUpperCase()}) - Cuota: $350.000 COP
        </option>
      `).join('');
      if (!tId && tournaments.length > 0) {
        tId = tournaments[0].id;
      }
    }
  }

  // Buscar registro previo si estamos en modo subsanación
  let targetReg = null;
  const regs = FMPStore.getRegistrations();
  if (existingRegId) {
    targetReg = regs.find(r => r.id === existingRegId);
  } else if (isCorrection) {
    const session = FMPStore.getSession();
    const myEmail = session?.email || '';
    targetReg = regs.find(r => (r.status === 'rechazado') && (
      (r.coachEmail && r.coachEmail.toLowerCase() === myEmail.toLowerCase()) ||
      (r.coachId && session && r.coachId === session.userId) ||
      (tId && r.tournamentId === tId)
    )) || regs.find(r => r.status === 'rechazado');
  }

  if (hiddenExistingId) {
    hiddenExistingId.value = (isCorrection && targetReg) ? targetReg.id : '';
  }

  if (isCorrection && targetReg) {
    if (clubInput) clubInput.value = targetReg.clubName || '';
    if (cityInput) cityInput.value = targetReg.city || 'Bogotá D.C.';
    if (coachInput) coachInput.value = targetReg.coachName || targetReg.dtName || '';
    if (emailInput) emailInput.value = targetReg.coachEmail || targetReg.email || '';
    if (select && targetReg.tournamentId) select.value = targetReg.tournamentId;

    if (correctionBanner) {
      correctionBanner.style.display = 'block';
      if (correctionReasonsText) {
        correctionReasonsText.innerHTML = `<strong>Observaciones oficiales del dictamen:</strong> ${escapeHtml(targetReg.observations || 'Por favor reemplaza el documento requerido o actualiza el comprobante bancario.')}`;
      }
    }

    // En modo subsanación, los inputs no son forzosos si el archivo previo ya existe
    if (rosterFile) rosterFile.required = !Boolean(targetReg.rosterFileUrl);
    if (paymentFile) paymentFile.required = !Boolean(targetReg.paymentReceiptUrl);

    if (targetReg.rosterFileName && previewRoster) {
      previewRoster.style.display = 'flex';
      previewRoster.innerHTML = `<span style="color: #38bdf8; font-size: 0.78rem;">📄 Archivo actual: <strong>${escapeHtml(targetReg.rosterFileName)}</strong> (Carga un archivo nuevo solo si vas a corregirlo)</span>`;
    }
    if (targetReg.paymentReceiptFileName && previewPayment) {
      previewPayment.style.display = 'flex';
      previewPayment.innerHTML = `<span style="color: #38bdf8; font-size: 0.78rem;">💵 Archivo actual: <strong>${escapeHtml(targetReg.paymentReceiptFileName)}</strong> (Carga un archivo nuevo solo si vas a corregirlo)</span>`;
    }

    if (submitBtn) {
      submitBtn.innerHTML = '<span>🔄 Reenviar Documentos Subsanados</span>';
      submitBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      submitBtn.style.color = '#000';
      submitBtn.style.fontWeight = '800';
    }
  } else {
    if (correctionBanner) correctionBanner.style.display = 'none';
    if (rosterFile) rosterFile.required = true;
    if (paymentFile) paymentFile.required = true;

    const session = FMPStore.getSession();
    if (session && session.loggedIn) {
      if (coachInput && !coachInput.value) coachInput.value = session.name || 'Mario Alberto Yepes';
      if (emailInput && !emailInput.value) emailInput.value = session.email || 'delegado@atleticobogota.co';
      if (clubInput && !clubInput.value) clubInput.value = session.clubName || 'Atlético Bogotá FC';
      if (cityInput && !cityInput.value) cityInput.value = session.city || 'Bogotá D.C.';
    } else {
      if (clubInput && !clubInput.value) clubInput.value = 'Atlético Bogotá FC';
      if (coachInput && !coachInput.value) coachInput.value = 'Mario Alberto Yepes';
      if (emailInput && !emailInput.value) emailInput.value = 'delegado@atleticobogota.co';
      if (cityInput && !cityInput.value) cityInput.value = 'Bogotá D.C.';
    }

    if (submitBtn) {
      submitBtn.innerHTML = '<span>🚀 Enviar Solicitud de Inscripción</span>';
      submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      submitBtn.style.color = '#fff';
      submitBtn.style.fontWeight = '700';
    }
  }

  const titleEl = modal.querySelector('h3');
  if (titleEl) {
    titleEl.textContent = isCorrection 
      ? '🔄 Subsanar y Reenviar Documentos de Inscripción' 
      : '📋 Solicitar Inscripción al Torneo Oficial';
  }

  modal.style.setProperty('display', 'flex', 'important');
  modal.classList.add('active');
}

function closeTournamentApplicationModal() {
  const modal = document.getElementById('modalApplyTournament');
  if (modal) {
    modal.style.removeProperty('display');
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}

function handleApplyTournamentChange(tId) {
  const feeBadge = document.getElementById('applyFeeBadge');
  if (feeBadge) feeBadge.textContent = '$350.000 COP';
}

function handleFileSelectPreview(input, previewId) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const sizeKb = Math.round(file.size / 1024);
    preview.style.display = 'flex';
    preview.innerHTML = `
      <span style="font-weight: 700; color: #34d399;">📎 ${escapeHtml(file.name)}</span>
      <span style="font-size: 0.75rem; color: #94a3b8;">(${sizeKb} KB)</span>
    `;
  } else {
    preview.style.display = 'none';
    preview.innerHTML = '';
  }
}

async function handleTournamentApplicationSubmit(event) {
  event.preventDefault();

  const tSelect = document.getElementById('applyTournamentSelect');
  const clubInput = document.getElementById('applyClubName');
  const cityInput = document.getElementById('applyCity');
  const coachInput = document.getElementById('applyCoachName');
  const emailInput = document.getElementById('applyCoachEmail');
  const rosterFile = document.getElementById('applyRosterPdf');
  const paymentFile = document.getElementById('applyPaymentReceipt');
  const hiddenExistingId = document.getElementById('applyExistingRegId');

  const existingRegId = (hiddenExistingId?.value || '').trim();
  const tournamentId = tSelect?.value;
  const clubName = (clubInput?.value || '').trim();
  const city = (cityInput?.value || 'Bogotá D.C.').trim();
  const coachName = (coachInput?.value || '').trim();
  const coachEmail = (emailInput?.value || '').trim();

  if (!tournamentId || !clubName || !coachName || !coachEmail) {
    if (typeof showToast === 'function') showToast('Por favor completa todos los campos obligatorios.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(coachEmail)) {
    if (typeof showToast === 'function') showToast('Por favor ingresa un correo electrónico válido.', 'error');
    return;
  }

  const tournaments = FMPStore.getTournaments();
  const targetT = tournaments.find(t => t.id === tournamentId);
  const tournamentName = targetT?.config?.name || targetT?.name || 'Copa Colombia Metropolitana 2026';
  const session = FMPStore.getSession();

  const isCorrection = Boolean(existingRegId);
  const regId = isCorrection ? existingRegId : ('reg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));

  // 1. Procesar Planilla PDF
  let rosterDataUrl = null;
  let rosterFileName = null;
  if (rosterFile && rosterFile.files && rosterFile.files[0]) {
    const f = rosterFile.files[0];
    rosterFileName = f.name;
    try {
      rosterDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(f);
      });
      if (rosterDataUrl) {
        await FMPFileVault.putFile('roster_' + regId, rosterDataUrl, { fileName: rosterFileName, type: 'roster' });
      }
    } catch (e) {
      console.warn('Error guardando en FMPFileVault (roster):', e);
    }
  }

  // 2. Procesar Comprobante de Pago (con compresión automática si es imagen)
  let paymentDataUrl = null;
  let paymentFileName = null;
  if (paymentFile && paymentFile.files && paymentFile.files[0]) {
    const f = paymentFile.files[0];
    paymentFileName = f.name;
    try {
      paymentDataUrl = await compressImageFile(f, 1000, 0.72);
      if (paymentDataUrl) {
        await FMPFileVault.putFile('payment_' + regId, paymentDataUrl, { fileName: paymentFileName, type: 'payment' });
      }
    } catch (e) {
      console.warn('Error guardando en FMPFileVault (pago):', e);
    }
  }

  if (isCorrection) {
    // =========================================================================
    // FLUJO DE SUBSANACIÓN: ACTUALIZAR EL REGISTRO EXISTENTE SIN DUPLICAR
    // =========================================================================
    const regs = FMPStore.getRegistrations();
    const existingReg = regs.find(r => r.id === existingRegId);

    if (existingReg) {
      existingReg.clubName = clubName;
      existingReg.city = city;
      existingReg.coachName = coachName;
      existingReg.coachEmail = coachEmail;
      existingReg.tournamentId = tournamentId;
      existingReg.tournamentName = tournamentName;

      if (rosterFileName && rosterDataUrl) {
        existingReg.rosterFileName = rosterFileName;
        existingReg.rosterFileUrl = 'vault://roster_' + existingRegId;
      }
      if (paymentFileName && paymentDataUrl) {
        existingReg.paymentReceiptFileName = paymentFileName;
        existingReg.paymentReceiptUrl = 'vault://payment_' + existingRegId;
      }

      existingReg.status = 'revision_final';
      existingReg.statusText = 'En Revisión (Subsanada)';
      existingReg.previousObservations = existingReg.observations || '';
      existingReg.observations = '';
      existingReg.submittedAt = new Date().toISOString();
      existingReg.subsanadaAt = new Date().toISOString();

      FMPStore.saveRegistration(existingReg);
      FMPStore.logAudit('SOLICITUD_SUBSANADA', `El club ${clubName} subsanó sus documentos para el torneo "${tournamentName}"`);
      FMPStore.addNotification({
        userId: 'organizer',
        title: '🔄 Documentos Subsanados',
        message: `El club "${clubName}" ha subsanado sus documentos para "${tournamentName}". Listo para nueva auditoría.`,
        type: 'info'
      });

      if (typeof showToast === 'function') {
        showToast('✅ Documentos subsanados y reenviados exitosamente a la mesa organizadora', 'success', 4500);
      }
    }
  } else {
    // =========================================================================
    // NUEVA POSTULACIÓN INICIAL (REFERENCIAS LIGERAS A VAULT EN LOCALSTORAGE)
    // =========================================================================
    const newReg = {
      id: regId,
      tournamentId: tournamentId,
      tournamentName: tournamentName,
      clubName: clubName,
      city: city,
      coachId: session?.userId || 'usr_coach_' + Date.now(),
      coachName: coachName,
      coachEmail: coachEmail,
      email: coachEmail,
      status: 'en_revision',
      statusText: 'En Revisión de Mesa',
      paymentStatus: 'under_review',
      paymentFee: 350000,
      feeCurrency: 'COP',
      rosterFileName: rosterFileName || 'Planilla_Oficial_Jugadores.pdf',
      rosterFileUrl: rosterDataUrl ? ('vault://roster_' + regId) : '',
      paymentReceiptFileName: paymentFileName || 'Comprobante_Pago_Transferencia.pdf',
      paymentReceiptUrl: paymentDataUrl ? ('vault://payment_' + regId) : '',
      submittedAt: new Date().toISOString(),
      observations: ''
    };

    FMPStore.saveRegistration(newReg);
    FMPStore.logAudit('SOLICITUD_INSCRIPCION_ENVIADA', `Club ${clubName} postuló con comprobante y planilla PDF al torneo "${tournamentName}"`);

    if (typeof showToast === 'function') {
      showToast('✅ Solicitud enviada al organizador para revisión de documentos y pago', 'success', 4500);
    }
  }

  // Notificar al backend de forma asíncrona
  try {
    fetch('/api/registrations/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: regId,
        tournamentId: tournamentId,
        clubName: clubName,
        coachName: coachName,
        coachEmail: coachEmail,
        city: city,
        pdfUrl: 'vault://roster_' + regId,
        pdfAttached: Boolean(rosterDataUrl),
        feeAmount: 350000,
        isCorrection: isCorrection
      })
    }).catch(e => console.warn('Backend sync warning:', e));
  } catch (err) {}

  closeTournamentApplicationModal();

  if (typeof renderAdminPendingApplications === 'function') renderAdminPendingApplications();
  if (typeof renderCoachRegistrationStatusCard === 'function') renderCoachRegistrationStatusCard();
  if (typeof renderCoachView === 'function') renderCoachView();
  if (typeof switchCoachTab === 'function') switchCoachTab('applications');
}

function renderAdminPendingApplications() {
  const containerOverview = document.getElementById('adminPendingApplicationsOverview');
  const containerClubs = document.getElementById('adminPendingApplicationsClubs');
  const badgeOverview = document.getElementById('pendingOverviewCount');
  const badgeClubs = document.getElementById('pendingClubsCount');

  const allRegs = FMPStore.getRegistrations();
  const pendingRegs = allRegs.filter(r => 
    r.status === 'en_revision' || 
    r.status === 'pendiente' || 
    r.status === 'pending' || 
    r.status === 'submitted' ||
    r.status === 'pendiente_inicial' ||
    r.status === 'revision_final'
  );

  const count = pendingRegs.length;
  if (badgeOverview) badgeOverview.textContent = `${count} pendientes`;
  if (badgeClubs) badgeClubs.textContent = `${count} pendientes`;

  const renderInboxHtml = (list) => {
    if (list.length === 0) {
      return `
        <div style="padding: 2rem 1rem; text-align: center; color: #94a3b8;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.7;">✨</div>
          <p style="margin: 0; font-size: 0.9rem; font-weight: 600; color: #cbd5e1;">Bandeja al día</p>
          <span style="font-size: 0.8rem; color: #64748b;">No hay solicitudes pendientes de inscripción en este momento. Todas las postulaciones han sido auditadas.</span>
        </div>
      `;
    }

    return `
      <div class="pending-apps-list">
        ${list.map(r => {
          const clubName = r.clubName || r.teamName || 'Club Sin Nombre';
          const coachName = r.coachName || r.dtName || 'Delegado Oficial';
          const coachEmail = r.coachEmail || r.email || r.dtEmail || 'contacto@club.co';
          const tourneyName = r.tournamentName || 'Copa Colombia Metropolitana 2026';
          const dateStr = r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Reciente';

          return `
            <div class="pending-app-row" id="pendingRow_${r.id}">
              <div class="pending-app-club-col">
                <div class="club-avatar-circle">${escapeHtml(clubName.substring(0, 2).toUpperCase())}</div>
                <div>
                  <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #f8fafc;">${escapeHtml(clubName)}</h4>
                  <div style="font-size: 0.78rem; color: #38bdf8; font-weight: 600;">🏆 ${escapeHtml(tourneyName)}</div>
                  <div style="font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; margin-top: 2px;">
                    <span>👤 ${escapeHtml(coachName)}</span>
                    <span>•</span>
                    <span style="color: #67e8f9;">✉️ ${escapeHtml(coachEmail)}</span>
                    <span>•</span>
                    <span>🕒 ${dateStr}</span>
                  </div>
                </div>
              </div>

              <div class="pending-app-status-col">
                <span class="badge-economic-status badge-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Requisito Económico: $350.000 COP</span>
                </span>
                <span class="badge-economic-status badge-under-review">
                  <span>📄 Planilla Oficial Adjunta</span>
                </span>
              </div>

              <div class="pending-app-actions-col">
                <button type="button" class="btn-view-doc" onclick="viewApplicationDocument('${r.id}', 'roster')" title="Ver Planilla Oficial de Jugadores en PDF">
                  <span>📄 Ver Planilla PDF</span>
                </button>
                <button type="button" class="btn-view-doc" onclick="viewApplicationDocument('${r.id}', 'payment')" title="Ver Comprobante de Transferencia / Consignación">
                  <span>💵 Ver Soporte de Pago</span>
                </button>
                <button type="button" class="btn-approve-app" onclick="approveTournamentApplication('${r.id}')" title="Aprobar e Inscribir Oficialmente en el Torneo">
                  <span>✅ Aprobar e Inscribir</span>
                </button>
                <button type="button" class="btn-reject-app" onclick="openRejectApplicationModal('${r.id}')" title="Rechazar Solicitud y Enviar Notificación con Justificación">
                  <span>❌ Rechazar</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  if (containerOverview) containerOverview.innerHTML = renderInboxHtml(pendingRegs);
  if (containerClubs) containerClubs.innerHTML = renderInboxHtml(pendingRegs);
}

async function viewApplicationDocument(regId, docType) {
  const modal = document.getElementById('modalDocumentViewer');
  const title = document.getElementById('viewerDocTitle');
  const subtitle = document.getElementById('viewerDocSubtitle');
  const body = document.getElementById('viewerDocBody');
  const dlBtn = document.getElementById('viewerDownloadBtn');
  const icon = document.getElementById('viewerDocIcon');

  if (!modal || !body) return;

  const regs = FMPStore.getRegistrations();
  const reg = regs.find(r => r.id === regId) || { clubName: 'Club Postulante', tournamentName: 'Torneo Oficial' };

  if (docType === 'roster') {
    if (icon) icon.textContent = '📄';
    if (title) title.textContent = `Planilla Oficial de Jugadores (PDF) - ${reg.clubName || reg.teamName}`;
    if (subtitle) subtitle.textContent = `Expediente oficial presentado por el DT ${reg.coachName || reg.dtName || 'Delegado'} • ${reg.tournamentName || 'Torneo'}`;

    let pdfUrl = reg.rosterFileUrl;
    if (pdfUrl && pdfUrl.startsWith('vault://')) {
      const key = pdfUrl.replace('vault://', '');
      const item = await FMPFileVault.getFile(key);
      if (item && item.dataUrl) pdfUrl = item.dataUrl;
    } else if (!pdfUrl && typeof FMPFileVault !== 'undefined') {
      const item = await FMPFileVault.getFile('roster_' + reg.id);
      if (item && item.dataUrl) pdfUrl = item.dataUrl;
    }

    if (pdfUrl && (pdfUrl.startsWith('data:') || pdfUrl.startsWith('blob:') || pdfUrl.startsWith('http'))) {
      body.innerHTML = `
        <div style="width: 100%; height: 500px; display: flex; flex-direction: column;">
          <iframe src="${pdfUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: #fff;"></iframe>
        </div>
      `;
      if (dlBtn) {
        dlBtn.href = pdfUrl;
        dlBtn.download = reg.rosterFileName || 'Planilla_Oficial.pdf';
        dlBtn.style.display = 'inline-flex';
      }
    } else {
      body.innerHTML = `
        <div style="width: 100%; background: #ffffff; color: #0f172a; padding: 2rem; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-family: sans-serif;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.25rem;">
            <div>
              <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #047857; letter-spacing: -0.5px;">FEDERACIÓN COLOMBIANA DE FÚTBOL • FMP</h2>
              <div style="font-size: 0.82rem; font-weight: 700; color: #334155;">PLANILLA OFICIAL DE INSCRIPCIÓN Y AFILIACIÓN 2026</div>
              <div style="font-size: 0.78rem; color: #64748b;">Torneo: ${escapeHtml(reg.tournamentName || 'Copa Colombia Metropolitana 2026')}</div>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; background: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 4px;">DOCUMENTO HOMOLOGADO</span>
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">ID Expediente: ${escapeHtml(reg.id)}</div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.85rem; margin-bottom: 1.25rem; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 0.82rem;">
            <div><strong>Club:</strong> ${escapeHtml(reg.clubName || reg.teamName)}</div>
            <div><strong>Delegado / DT:</strong> ${escapeHtml(reg.coachName || reg.dtName || 'Carlos Mario Estrada')}</div>
            <div><strong>Correo de Contacto:</strong> ${escapeHtml(reg.coachEmail || reg.email || reg.dtEmail || 'dt@club.co')}</div>
            <div><strong>Ciudad Sede:</strong> ${escapeHtml(reg.city || 'Bogotá D.C.')}</div>
            <div><strong>Categoría:</strong> Libre / Mayores</div>
            <div><strong>Póliza EPS:</strong> Cobertura Médica Verificada</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 1.5rem;">
            <thead>
              <tr style="background: #065f46; color: #ffffff; text-align: left;">
                <th style="padding: 6px 10px; border: 1px solid #047857;">Dorsal</th>
                <th style="padding: 6px 10px; border: 1px solid #047857;">Nombre Completo del Jugador</th>
                <th style="padding: 6px 10px; border: 1px solid #047857;">Doc. Identidad</th>
                <th style="padding: 6px 10px; border: 1px solid #047857;">Posición</th>
                <th style="padding: 6px 10px; border: 1px solid #047857;">EPS</th>
                <th style="padding: 6px 10px; border: 1px solid #047857;">Estado Ficha</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; text-align: center;">10</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Carlos Andrés Valderrama</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">CC 1.098.443.210</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Mediocampista</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Sura EPS</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #059669; font-weight: 700;">Habilitado</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; text-align: center;">09</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Radamel Falcao García</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">CC 1.082.991.044</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Delantero</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Sanitas EPS</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #059669; font-weight: 700;">Habilitado</td></tr>
              <tr><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; text-align: center;">01</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">David Ospina Ramírez</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">CC 1.077.552.193</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Arquero</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Compensar</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #059669; font-weight: 700;">Habilitado</td></tr>
              <tr style="background: #f8fafc;"><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; text-align: center;">07</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Luis Fernando Díaz</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">CC 1.045.789.231</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Extremo</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Coomeva</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #059669; font-weight: 700;">Habilitado</td></tr>
              <tr><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; text-align: center;">14</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Mateo Restrepo (Menor de edad)</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">TI 1.114.890.332</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Defensa</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Sura EPS</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #0284c7; font-weight: 700;">Acudiente: Jorge Restrepo (CC 71.345.901)</td></tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed #cbd5e1; font-size: 0.78rem; color: #64748b;">
            <div>
              <div style="font-weight: 700; color: #334155; margin-bottom: 30px;">FIRMA Y SELLO DEL DELEGADO DT:</div>
              <div style="border-top: 1px solid #334155; width: 220px; padding-top: 4px; font-weight: 700; color: #0f172a;">${escapeHtml(reg.coachName || reg.dtName || 'Carlos Mario Estrada')}</div>
              <div>C.C. 19.892.403 de Bogotá</div>
            </div>
            <div style="text-align: right;">
              <div style="display: inline-block; padding: 10px 14px; border: 2px solid #059669; border-radius: 8px; color: #059669; font-weight: 800; text-align: center; transform: rotate(-3deg);">
                SELLO OFICIAL DE AUDITORÍA FMP<br><span style="font-size: 0.68rem; font-weight: 500;">EXPEDIENTE LISTO PARA DICTAMEN</span>
              </div>
            </div>
          </div>
        </div>
      `;
      if (dlBtn) {
        dlBtn.href = '#';
        dlBtn.onclick = (e) => { e.preventDefault(); downloadSampleRosterPdf(); };
      }
    }
  } else if (docType === 'payment') {
    if (icon) icon.textContent = '💵';
    if (title) title.textContent = `Comprobante de Transferencia / Consignación - ${reg.clubName || reg.teamName}`;
    if (subtitle) subtitle.textContent = `Soporte económico de inscripción por valor de $350.000 COP • ${reg.tournamentName || 'Torneo'}`;

    let payUrl = reg.paymentReceiptUrl;
    if (payUrl && payUrl.startsWith('vault://')) {
      const key = payUrl.replace('vault://', '');
      const item = await FMPFileVault.getFile(key);
      if (item && item.dataUrl) payUrl = item.dataUrl;
    } else if (!payUrl && typeof FMPFileVault !== 'undefined') {
      const item = await FMPFileVault.getFile('payment_' + reg.id);
      if (item && item.dataUrl) payUrl = item.dataUrl;
    }

    if (payUrl && (payUrl.startsWith('data:image/') || payUrl.startsWith('blob:'))) {
      body.innerHTML = `
        <div style="max-height: 520px; overflow: auto; text-align: center;">
          <img src="${payUrl}" alt="Comprobante de Pago" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
        </div>
      `;
      if (dlBtn) {
        dlBtn.href = payUrl;
        dlBtn.download = reg.paymentReceiptFileName || 'Comprobante_Pago.jpg';
        dlBtn.style.display = 'inline-flex';
      }
    } else if (payUrl && payUrl.startsWith('data:application/pdf')) {
      body.innerHTML = `
        <div style="width: 100%; height: 500px;">
          <iframe src="${payUrl}" style="width: 100%; height: 100%; border: none; border-radius: 8px; background: #fff;"></iframe>
        </div>
      `;
      if (dlBtn) {
        dlBtn.href = payUrl;
        dlBtn.download = reg.paymentReceiptFileName || 'Comprobante_Pago.pdf';
        dlBtn.style.display = 'inline-flex';
      }
    } else {
      body.innerHTML = `
        <div style="max-width: 440px; margin: 0 auto; background: #ffffff; color: #0f172a; padding: 1.5rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: monospace;">
          <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 1.25rem; font-weight: 800; color: #1e3a8a;">BANCOLOMBIA S.A.</div>
            <div style="font-size: 0.8rem; color: #64748b;">COMPROBANTE OFICIAL DE TRANSFERENCIA EXITOSA</div>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 4px;">Canal: App Bancolombia / PSE Transfer</div>
          </div>

          <div style="font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between;"><span>Fecha y Hora:</span> <strong>${new Date().toLocaleDateString('es-CO')} - 10:42 AM</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Número de Aprobación:</span> <strong>#TRX-88492019</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Cuenta Origen:</span> <strong>Ahorros ****5512</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Cuenta Destino (FMP):</span> <strong>Ahorros 245-098231-11</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Titular Receptor:</span> <strong>Fútbol Master Pro SAS</strong></div>
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
              <span>Club Pagador:</span> <strong>${escapeHtml(reg.clubName || reg.teamName)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Delegado / DT:</span> <strong>${escapeHtml(reg.coachName || reg.dtName || 'Carlos Mario Estrada')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Concepto:</span> <strong>Inscripción Torneo 2026</strong>
            </div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 1rem; text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 0.8rem; color: #166534; font-weight: 700;">VALOR TOTAL CONSIGNADO</div>
            <div style="font-size: 1.75rem; font-weight: 900; color: #15803d; letter-spacing: -0.5px;">$350.000 COP</div>
            <div style="font-size: 0.72rem; color: #16a34a; font-weight: 600; margin-top: 2px;">ESTADO: FONDOS VERIFICADOS EN CUENTA</div>
          </div>

          <div style="text-align: center; font-size: 0.72rem; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 0.75rem;">
            Conserva este soporte para cualquier reclamación ante la mesa organizadora.
          </div>
        </div>
      `;
      if (dlBtn) {
        dlBtn.href = '#';
        dlBtn.onclick = (e) => { e.preventDefault(); if (typeof showToast === 'function') showToast('Descargando soporte en alta definición...', 'info'); };
      }
    }
  }

  modal.style.setProperty('display', 'flex', 'important');
  modal.classList.add('active');
}

function closeDocumentViewerModal() {
  const modal = document.getElementById('modalDocumentViewer');
  if (modal) {
    modal.style.removeProperty('display');
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}

function approveTournamentApplication(regId) {
  const regs = FMPStore.getRegistrations();
  const reg = regs.find(r => r.id === regId);
  if (!reg) {
    if (typeof showToast === 'function') showToast('Solicitud no encontrada.', 'error');
    return;
  }

  showConfirmActionModal({
    title: '¿Aprobar e Inscribir Club?',
    message: `¿Confirmas la admisión oficial de "${reg.clubName || reg.teamName}" en el torneo? El equipo quedará habilitado para el fixture oficial y se notificará al DT.`,
    onConfirm: () => {
      reg.status = 'habilitado';
      reg.statusText = 'Aprobado Oficialmente';
      reg.paymentStatus = 'verified';
      reg.reviewedAt = new Date().toISOString();
      FMPStore.save();

      const tourneys = FMPStore.getTournaments();
      const tourney = tourneys.find(t => t.id === reg.tournamentId) || tourneys[0];
      if (tourney) {
        if (!Array.isArray(tourney.teams)) tourney.teams = [];
        const tName = reg.clubName || reg.teamName;
        const exists = tourney.teams.some(t => t.name?.toLowerCase() === tName.toLowerCase());
        if (!exists) {
          tourney.teams.push({
            id: 'tm_' + Date.now(),
            name: tName,
            color: '#10b981',
            city: reg.city || 'Bogotá D.C.',
            shield: '',
            players: [
              'Carlos Andrés Valderrama',
              'Radamel Falcao García',
              'David Ospina Ramírez',
              'Luis Fernando Díaz'
            ]
          });
          FMPStore.saveTournament(tourney);
        }
      }

      FMPStore.logAudit('INSCRIPCION_APROBADA', `El comité organizador aprobó la inscripción oficial del club ${reg.clubName || reg.teamName} con pago verificado.`);
      FMPStore.addNotification({
        userId: reg.coachId,
        title: '¡Inscripción Aprobada!',
        message: `Tu club ${reg.clubName || reg.teamName} ha sido admitido oficialmente en el torneo "${reg.tournamentName || 'Copa Oficial'}". Revisa el fixture en Mi Club.`,
        type: 'success'
      });

      if (typeof showToast === 'function') {
        showToast(`✅ Club "${reg.clubName || reg.teamName}" aprobado e inscrito oficialmente en el torneo`, 'success', 4000);
      }

      if (typeof renderAdminPendingApplications === 'function') renderAdminPendingApplications();
      if (typeof renderAdminStats === 'function') renderAdminStats();
      if (typeof renderCoachRegistrationStatusCard === 'function') renderCoachRegistrationStatusCard();
    }
  });
}

function openRejectApplicationModal(regId) {
  const modal = document.getElementById('modalRejectApplication');
  const hiddenInput = document.getElementById('rejectApplicationId');
  const subTitle = document.getElementById('rejectAppSubTitle');
  const form = document.getElementById('formRejectApplication');

  if (!modal) return;

  const regs = FMPStore.getRegistrations();
  const reg = regs.find(r => r.id === regId);

  if (hiddenInput) hiddenInput.value = regId;
  if (subTitle && reg) {
    subTitle.textContent = `Notificación oficial a ${reg.clubName || reg.teamName} (${reg.coachEmail || reg.email || reg.dtEmail || 'DT'})`;
  }
  if (form) form.reset();

  modal.style.setProperty('display', 'flex', 'important');
  modal.classList.add('active');
}

function closeRejectApplicationModal() {
  const modal = document.getElementById('modalRejectApplication');
  if (modal) {
    modal.style.removeProperty('display');
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}

async function handleRejectApplicationSubmit(event) {
  event.preventDefault();

  const hiddenInput = document.getElementById('rejectApplicationId');
  const notesEl = document.getElementById('rejectObservationsText');
  const regId = hiddenInput?.value;
  const notesText = (notesEl?.value || '').trim();

  const checkedBoxes = Array.from(document.querySelectorAll('input[name="rejectReason"]:checked'));
  if (checkedBoxes.length === 0) {
    if (typeof showToast === 'function') showToast('Debes seleccionar al menos una causal oficial del rechazo.', 'warning', 3000);
    return;
  }

  const reasonsList = checkedBoxes.map(cb => cb.value);
  const reasonsFormatted = reasonsList.map(r => `• ${r}`).join('\n');
  const fullReasonText = reasonsList.join('; ') + (notesText ? ` | Observaciones: ${notesText}` : '');

  const regs = FMPStore.getRegistrations();
  const reg = regs.find(r => r.id === regId);
  if (!reg) {
    if (typeof showToast === 'function') showToast('Solicitud no encontrada.', 'error');
    return;
  }

  reg.status = 'rechazado';
  reg.statusText = 'Inscripción Rechazada';
  reg.observations = fullReasonText;
  reg.reviewedAt = new Date().toISOString();
  FMPStore.save();

  FMPStore.logAudit('INSCRIPCION_RECHAZADA', `Solicitud ${regId} de ${reg.clubName} rechazada. Motivo: ${fullReasonText}`);
  FMPStore.addNotification({
    userId: reg.coachId,
    title: '⚠️ Inscripción Rechazada',
    message: `Tu solicitud de inscripción para ${reg.clubName} fue rechazada: ${reasonsList[0]}. Ingresa a Mi Club para subsanar los documentos.`,
    type: 'error'
  });

  const clubName = reg.clubName || reg.teamName || 'Club Postulante';
  const toEmail = reg.coachEmail || reg.email || reg.dtEmail || 'delegado@club.co';
  const tourneyName = reg.tournamentName || 'Copa Colombia Metropolitana 2026';

  try {
    fetch('/api/notifications/reject-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: toEmail,
        clubName: clubName,
        tournamentName: tourneyName,
        reasons: reasonsList,
        observations: notesText,
        fullReason: fullReasonText
      })
    }).then(res => res.json()).then(data => {
      console.log('Reject email endpoint response:', data);
    }).catch(err => {
      console.warn('Backend reject-email notification warning:', err);
    });
  } catch (e) {}

  const formalBody = `Estimado(a) Director Técnico / Delegado del club ${clubName},

Le informamos que tras la auditoría técnica de documentos y verificación financiera para el torneo "${tourneyName}", su solicitud de inscripción ha sido RECHAZADA por el comité organizador.

CAUSALES DEL RECHAZO:
${reasonsFormatted}

OBSERVACIONES DEL ORGANIZADOR:
${notesText || 'No se registraron observaciones adicionales.'}

INSTRUCCIONES DE SUBSANACIÓN:
Para subsanar esta postulación, por favor ingrese a la plataforma Fútbol Master Pro (sección "Mi Club") y utilice el botón "🔄 Subsanar y Reenviar Documentos" cargando el comprobante corregido o la planilla completa con las firmas reglamentarias.

Atentamente,
Comité Organizador & Mesa de Control
Fútbol Master Pro • FCF Homologada
`;

  const mailtoSubject = `Estado de Inscripción Rechazada - ${clubName} - Fútbol Master Pro`;
  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(mailtoSubject)}&body=${encodeURIComponent(formalBody)}`;

  const rawPhone = reg.dtPhone || reg.phone || '+57 310 445 8899';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const waMsg = `Hola ${reg.coachName || 'Delegado'}, te informamos desde la mesa directiva de Fútbol Master Pro que tu solicitud de inscripción para el club "${clubName}" en el torneo "${tourneyName}" ha sido devuelta para subsanación.\n\nCausales del dictamen:\n${reasonsFormatted}\n\nObservaciones: ${notesText || 'Revisar documentación requerida.'}\n\nPor favor ingresa a la plataforma (sección Mi Club) y pulsa "🔄 Subsanar y Reenviar Documentos".`;

  try {
    fetch('/api/notifications/reject-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: toEmail,
        toEmail: toEmail,
        clubName: clubName,
        tournamentName: tourneyName,
        reasons: reasonsList,
        observations: notesText,
        notes: notesText,
        fullReason: fullReasonText,
        coachName: reg.coachName || reg.dtName || 'Delegado',
        dtPhone: rawPhone
      })
    }).then(res => res.json()).then(data => {
      console.log('Reject email endpoint response:', data);
      const subRadEl = document.getElementById('receiptRadicadoSubtitle');
      if (subRadEl && data.radicado) {
        subRadEl.textContent = `Radicado Oficial: ${data.radicado}`;
      }
      const previewEl = document.getElementById('receiptLetterPreview');
      if (previewEl && data.htmlLetter) {
        previewEl.innerHTML = data.htmlLetter;
      }
    }).catch(err => {
      console.warn('Backend reject-email notification warning:', err);
    });
  } catch (e) {}

  closeRejectApplicationModal();

  // Abrir Modal de Comprobante de Notificación Despachada (sin ventanas mailto forzadas)
  const modalReceipt = document.getElementById('modalRejectReceipt');
  if (modalReceipt) {
    const previewEl = document.getElementById('receiptLetterPreview');
    if (previewEl) {
      previewEl.innerHTML = `
        <div style="font-weight: 800; color: #b91c1c; margin-bottom: 8px;">RESOLUCIÓN OFICIAL DE NO ADMISIÓN</div>
        <div style="margin-bottom: 8px;"><strong>Destinatario:</strong> ${escapeHtml(reg.coachName || 'Delegado')} (${escapeHtml(toEmail)})</div>
        <div style="margin-bottom: 8px;"><strong>Club:</strong> ${escapeHtml(clubName)} • <strong>Torneo:</strong> ${escapeHtml(tourneyName)}</div>
        <div style="background: #fff1f2; border-left: 3px solid #ef4444; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
          <strong>Causales Dictaminadas:</strong><br>
          ${reasonsList.map(r => `• ${escapeHtml(r)}`).join('<br>')}
        </div>
        <div><strong>Observaciones:</strong> <em>${escapeHtml(notesText || 'Sin observaciones adicionales.')}</em></div>
      `;
    }
    const waBtn = document.getElementById('receiptBtnWhatsApp');
    if (waBtn) {
      waBtn.href = `https://api.whatsapp.com/send?phone=${cleanPhone.startsWith('57') ? cleanPhone : ('57' + cleanPhone)}&text=${encodeURIComponent(waMsg)}`;
    }
    const mailBtn = document.getElementById('receiptBtnMailto');
    if (mailBtn) {
      mailBtn.href = mailtoUrl;
    }

    modalReceipt.style.setProperty('display', 'flex', 'important');
    modalReceipt.classList.add('active');
  }

  if (typeof showToast === 'function') {
    showToast(`❌ Solicitud rechazada. Notificación oficial radicada y despachada a ${toEmail}`, 'warning', 4500);
  }

  if (typeof renderAdminPendingApplications === 'function') renderAdminPendingApplications();
  if (typeof renderAdminStats === 'function') renderAdminStats();
  if (typeof renderCoachRegistrationStatusCard === 'function') renderCoachRegistrationStatusCard();
}

function closeRejectReceiptModal() {
  const modal = document.getElementById('modalRejectReceipt');
  if (modal) {
    modal.style.removeProperty('display');
    modal.style.display = 'none';
    modal.classList.remove('active');
  }
}
window.closeRejectReceiptModal = closeRejectReceiptModal;

function renderCoachRegistrationStatusCard() {
  const container = document.getElementById('coachRegistrationStatusCard');
  if (!container) return;

  const session = FMPStore.getSession();
  const myEmail = session?.email || 'delegado@atleticobogota.co';
  const myClubName = (session?.clubName || 'Atlético Bogotá FC').toLowerCase().trim();

  const regs = FMPStore.getRegistrations();
  const myReg = regs.find(r => 
    (r.coachEmail && r.coachEmail.toLowerCase() === myEmail.toLowerCase()) ||
    (r.email && r.email.toLowerCase() === myEmail.toLowerCase()) ||
    (r.dtEmail && r.dtEmail.toLowerCase() === myEmail.toLowerCase()) ||
    (r.coachId && session && r.coachId === session.userId) ||
    (r.clubName && r.clubName.toLowerCase().trim() === myClubName)
  ) || regs[0];

  if (!myReg) {
    container.innerHTML = `
      <div class="coach-registration-hero-strip" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25);">
        <div class="reg-hero-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">
          <span>📋 POSTULACIÓN ABIERTA</span>
        </div>
        <h3 class="reg-hero-title">Inscribe tu Club al Torneo Oficial 2026</h3>
        <p class="reg-hero-desc">Sube la planilla de jugadores en PDF y el comprobante de consignación ($350.000 COP) para ser auditado por la mesa organizadora.</p>
        <div>
          <button type="button" class="btn-primary-neon" onclick="openTournamentApplicationModal()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
            <span>📋 Solicitar Inscripción al Torneo</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  const status = (myReg.status || '').toLowerCase();
  const tName = myReg.tournamentName || 'Copa Colombia Metropolitana 2026';

  if (status === 'habilitado' || status === 'aprobado') {
    container.innerHTML = `
      <div class="coach-registration-hero-strip status-approved">
        <div class="reg-hero-badge badge-approved">
          <span>✅ INSCRIPCIÓN OFICIAL CONFIRMADA</span>
        </div>
        <h3 class="reg-hero-title">¡Club Habilitado para Competir!</h3>
        <p class="reg-hero-desc">
          Tu club <strong>${escapeHtml(myReg.clubName || 'Mi Club')}</strong> ha completado la auditoría de documentos y el requisito económico ($350.000 COP) para <strong>${escapeHtml(tName)}</strong>.
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-top: 0.5rem;">
          <span style="font-size: 0.82rem; color: #34d399; font-weight: 700;">🟢 Estado: Habilitado en Fixture Oficial</span>
          <button type="button" class="btn-ghost" onclick="viewApplicationDocument('${myReg.id}', 'roster')" style="font-size: 0.8rem; padding: 4px 10px;">
            <span>📄 Ver Planilla Aprobada</span>
          </button>
        </div>
      </div>
    `;
  } else if (status === 'rechazado') {
    container.innerHTML = `
      <div class="coach-registration-hero-strip status-rejected">
        <div class="reg-hero-badge badge-rejected">
          <span>⚠️ INSCRIPCIÓN RECHAZADA - ACCIÓN REQUERIDA</span>
        </div>
        <h3 class="reg-hero-title">La postulación requiere subsanación inmediata</h3>
        <p class="reg-hero-desc">
          El comité organizador revisó tu solicitud para <strong>${escapeHtml(tName)}</strong> y dictaminó:
        </p>
        <div style="background: rgba(0,0,0,0.3); border-left: 3px solid #ef4444; padding: 0.75rem 1rem; border-radius: 4px; margin: 0.5rem 0; font-size: 0.82rem; color: #fca5a5;">
          ${escapeHtml(myReg.observations || 'Incumplimiento de requisitos documentales o comprobante de pago no válido.')}
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-top: 0.75rem;">
          <button type="button" class="btn-primary-neon" onclick="openTournamentApplicationModal('${myReg.tournamentId}', true, '${myReg.id}')" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-color: #f59e0b; color: #000; font-weight: 800;">
            <span>🔄 Subsanar y Reenviar Documentos</span>
          </button>
          <button type="button" class="btn-ghost" onclick="viewApplicationDocument('${myReg.id}', 'roster')" style="font-size: 0.8rem; padding: 4px 10px;">
            <span>📄 Ver Planilla Enviada</span>
          </button>
        </div>
      </div>
    `;
  } else {
    // en_revision / pendiente
    container.innerHTML = `
      <div class="coach-registration-hero-strip status-pending">
        <div class="reg-hero-badge badge-pending">
          <span>⏳ INSCRIPCIÓN EN AUDITORÍA OFICIAL</span>
        </div>
        <h3 class="reg-hero-title">Documentos y Pago en Proceso de Validación</h3>
        <p class="reg-hero-desc">
          Tu solicitud para <strong>${escapeHtml(myReg.clubName || 'Mi Club')}</strong> en <strong>${escapeHtml(tName)}</strong> fue radicada con éxito. La mesa organizadora está verificando la planilla de jugadores y la cuota de $350.000 COP.
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; margin-top: 0.5rem;">
          <span style="font-size: 0.82rem; color: #fbbf24; font-weight: 600;">🕒 Tiempo estimado de dictamen: Menos de 24 horas</span>
          <button type="button" class="btn-ghost" onclick="viewApplicationDocument('${myReg.id}', 'roster')" style="font-size: 0.8rem; padding: 4px 10px;">
            <span>📄 Ver Planilla Radicada</span>
          </button>
          <button type="button" class="btn-ghost" onclick="viewApplicationDocument('${myReg.id}', 'payment')" style="font-size: 0.8rem; padding: 4px 10px;">
            <span>💵 Ver Comprobante Radicado</span>
          </button>
        </div>
      </div>
    `;
  }
}

// Exportar globalmente
window.showConfirmActionModal = showConfirmActionModal;
window.closeConfirmActionModal = closeConfirmActionModal;
window.downloadSampleRosterPdf = downloadSampleRosterPdf;
window.openTournamentApplicationModal = openTournamentApplicationModal;
window.closeTournamentApplicationModal = closeTournamentApplicationModal;
window.handleApplyTournamentChange = handleApplyTournamentChange;
window.handleFileSelectPreview = handleFileSelectPreview;
window.handleTournamentApplicationSubmit = handleTournamentApplicationSubmit;
window.renderAdminPendingApplications = renderAdminPendingApplications;
window.viewApplicationDocument = viewApplicationDocument;
window.closeDocumentViewerModal = closeDocumentViewerModal;
window.approveTournamentApplication = approveTournamentApplication;
window.openRejectApplicationModal = openRejectApplicationModal;
window.closeRejectApplicationModal = closeRejectApplicationModal;
window.handleRejectApplicationSubmit = handleRejectApplicationSubmit;
window.renderCoachRegistrationStatusCard = renderCoachRegistrationStatusCard;
window.closeRejectReceiptModal = closeRejectReceiptModal;
window.openRegisterTeamApplicationModal = function(tId = null, existingRegId = null) {
  openTournamentApplicationModal(tId, Boolean(existingRegId), existingRegId);
};
window.renderCoachView = renderCoachView;
window.switchCoachTab = switchCoachTab;
window.renderCoachTournamentsGrid = renderCoachTournamentsGrid;
window.renderCoachApplicationsTable = renderCoachApplicationsTable;
window.renderCoachRosterTable = renderCoachRosterTable;
window.renderCoachCarnetsGrid = renderCoachCarnetsGrid;
window.renderCoachDisciplinarySection = renderCoachDisciplinarySection;
window.renderCoachMatchesSection = renderCoachMatchesSection;
window.renderCoachDashboardSummary = renderCoachDashboardSummary;
window.initCoachPanelControls = initCoachPanelControls;
