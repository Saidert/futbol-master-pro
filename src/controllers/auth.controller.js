/**
 * FOOTBALL MASTER PRO COLOMBIA
 * Controlador de Autenticación, Registro Seguro y Gestión de Sesiones
 * Seguridad: Bcrypt 12 rounds, JWT, Prevención de Escalamiento de Privilegios, Ley 1581
 */

const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../utils/token.util');
const { logAudit } = require('../utils/audit.logger');

/**
 * Registro de nuevos usuarios en la plataforma
 */
async function register(req, res, next) {
  try {
    const {
      fullName,
      email,
      password,
      roleId = 'organizer',
      documentType = 'CC',
      documentNumber,
      phone,
      departmentId,
      municipalityId,
      organizationId,
      habeasDataAccepted
    } = req.body;

    // 1. Validaciones de presencia
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Campos obligatorios incompletos: Nombre completo, correo electrónico y contraseña son requeridos.'
      });
    }

    // 2. Validación de Ley 1581 de 2012 (Habeas Data Colombia)
    if (!habeasDataAccepted) {
      return res.status(400).json({
        success: false,
        error: 'Debe aceptar los términos de la Ley 1581 de 2012 (Habeas Data Colombia) para completar el registro.'
      });
    }

    // 3. Prevención estricta de Escalamiento de Privilegios
    const protectedRoles = ['superadmin', 'regional_admin'];
    if (protectedRoles.includes(roleId)) {
      return res.status(403).json({
        success: false,
        error: `Violación de seguridad: No está permitido registrarse como '${roleId}' desde el formulario público.`
      });
    }

    // 4. Validación de complejidad mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener un mínimo de 6 caracteres.'
      });
    }

    // 5. Verificar si el correo ya existe
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'El correo electrónico ya se encuentra registrado en Football Master Pro.'
      });
    }

    // 6. Validar que el rol exista
    const roleCheck = await db.query('SELECT id, name FROM roles WHERE id = $1', [roleId]);
    if (roleCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: `El rol '${roleId}' no es válido en el sistema.`
      });
    }
    const roleName = roleCheck.rows[0].name;

    // 7. Hash criptográfico de contraseña con Bcrypt (12 rondas de salt)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 8. Insertar usuario en PostgreSQL
    const insertSql = `
      INSERT INTO users (
        full_name, email, password_hash, role_id, document_type, document_number,
        phone, department_id, municipality_id, organization_id, habeas_data_accepted,
        habeas_data_accepted_at, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), 'active', NOW(), NOW())
      RETURNING id, full_name, email, role_id, department_id, municipality_id, status, created_at
    `;
    const insertParams = [
      fullName.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      roleId,
      documentType,
      documentNumber || null,
      phone || null,
      departmentId || null,
      municipalityId || null,
      organizationId || null,
      Boolean(habeasDataAccepted)
    ];

    const result = await db.query(insertSql, insertParams);
    const newUser = result.rows[0];
    newUser.role_name = roleName;

    // 9. Generar Token JWT
    const token = generateToken(newUser);

    // 10. Auditoría inmutable
    await logAudit({
      userId: newUser.id,
      action: 'USER_REGISTERED',
      entityType: 'users',
      entityId: newUser.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Usuario ${newUser.email} registrado con rol ${roleId}`
    });

    return res.status(201).json({
      success: true,
      message: '¡Registro exitoso en Football Master Pro Colombia!',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.full_name,
        email: newUser.email,
        roleId: newUser.role_id,
        roleName: roleName,
        departmentId: newUser.department_id,
        municipalityId: newUser.municipality_id
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Inicio de sesión seguro con Bcrypt y JWT
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Debes ingresar correo electrónico y contraseña.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Consultar usuario en PostgreSQL con detalles del rol
    const sql = `
      SELECT u.id, u.full_name, u.email, u.password_hash, u.role_id, r.name as role_name,
             r.hierarchy_level, u.organization_id, u.department_id, u.municipality_id, u.status
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
    const result = await db.query(sql, [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas: Correo o contraseña incorrectos.'
      });
    }

    const user = result.rows[0];

    // 2. Validar estado de la cuenta
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: `La cuenta se encuentra '${user.status}'. Comunícate con soporte.`
      });
    }

    // 3. Comprobación segura de contraseña con bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Registrar intento fallido en auditoría
      await logAudit({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'users',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: `Intento de contraseña erróneo para ${cleanEmail}`
      });

      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas: Correo o contraseña incorrectos.'
      });
    }

    // 4. Actualizar fecha de último login
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // 5. Generar Token JWT
    const token = generateToken(user);

    // 6. Registro de auditoría de inicio de sesión exitoso
    await logAudit({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'users',
      entityId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: `Inicio de sesión exitoso como ${user.role_id}`
    });

    return res.status(200).json({
      success: true,
      message: `¡Bienvenido de nuevo, ${user.full_name}!`,
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        roleId: user.role_id,
        roleName: user.role_name,
        hierarchyLevel: user.hierarchy_level,
        organizationId: user.organization_id,
        departmentId: user.department_id,
        municipalityId: user.municipality_id
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Consulta del perfil del usuario actualmente autenticado
 */
async function getProfile(req, res, next) {
  try {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.document_type, u.document_number,
             u.phone, u.role_id, r.name as role_name, r.hierarchy_level,
             u.organization_id, o.name as organization_name,
             u.department_id, d.name as department_name,
             u.municipality_id, m.name as municipality_name,
             u.status, u.last_login_at, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN municipalities m ON u.municipality_id = m.id
      WHERE u.id = $1
    `;
    const result = await db.query(sql, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile
};
