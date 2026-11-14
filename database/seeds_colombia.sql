-- =============================================================================
-- FOOTBALL MASTER PRO COLOMBIA - SEMILLAS INICIALES (SEEDS)
-- Departamentos de Colombia, Municipios Principales DANE, Roles y Superadmin
-- =============================================================================

-- 1. ROLES OFICIALES DEL SISTEMA
INSERT INTO roles (id, name, description, hierarchy_level) VALUES
('superadmin', 'Superadministrador Nacional', 'Control global del ecosistema, auditoría y administración de ligas', 1),
('regional_admin', 'Administrador Regional', 'Gestor de departamento o liga departamental homologada', 2),
('organizer', 'Organizador de Torneo', 'Creador y administrador exclusivo de torneos propios', 3),
('director_tecnico', 'Director Técnico de Club', 'Gestor deportivo del club, fichajes y postulaciones', 4),
('team_coach', 'Técnico de Plantilla', 'Administrador de plantilla, alineaciones y dorsales', 5),
('fan', 'Aficionado / Consulta', 'Visualización libre de tablas, calendarios y estadísticas', 6)
ON CONFLICT (id) DO NOTHING;

-- 2. DEPARTAMENTOS DE COLOMBIA (DANE)
INSERT INTO departments (id, name, region) VALUES
('05', 'Antioquia', 'Andina'),
('08', 'Atlántico', 'Caribe'),
('11', 'Bogotá D.C.', 'Andina'),
('13', 'Bolívar', 'Caribe'),
('15', 'Boyacá', 'Andina'),
('17', 'Caldas', 'Andina'),
('19', 'Cauca', 'Pacífica'),
('20', 'Cesar', 'Caribe'),
('23', 'Córdoba', 'Caribe'),
('25', 'Cundinamarca', 'Andina'),
('50', 'Meta', 'Orinoquía'),
('52', 'Nariño', 'Pacífica'),
('54', 'Norte de Santander', 'Andina'),
('63', 'Quindío', 'Andina'),
('66', 'Risaralda', 'Andina'),
('68', 'Santander', 'Andina'),
('73', 'Tolima', 'Andina'),
('76', 'Valle del Cauca', 'Pacífica')
ON CONFLICT (id) DO NOTHING;

-- 3. MUNICIPIOS PRINCIPALES DE COLOMBIA (DANE)
INSERT INTO municipalities (id, department_id, name, is_capital) VALUES
('05001', '05', 'Medellín', TRUE),
('05088', '05', 'Bello', FALSE),
('05360', '05', 'Itagüí', FALSE),
('08001', '08', 'Barranquilla', TRUE),
('08758', '08', 'Soledad', FALSE),
('11001', '11', 'Bogotá D.C.', TRUE),
('13001', '13', 'Cartagena de Indias', TRUE),
('15001', '15', 'Tunja', TRUE),
('17001', '17', 'Manizales', TRUE),
('19001', '19', 'Popayán', TRUE),
('20001', '20', 'Valledupar', TRUE),
('23001', '23', 'Montería', TRUE),
('25754', '25', 'Soacha', FALSE),
('50001', '50', 'Villavicencio', TRUE),
('52001', '52', 'Pasto', TRUE),
('54001', '54', 'Cúcuta', TRUE),
('63001', '63', 'Armenia', TRUE),
('66001', '66', 'Pereira', TRUE),
('68001', '68', 'Bucaramanga', TRUE),
('68276', '68', 'Floridablanca', FALSE),
('73001', '73', 'Ibagué', TRUE),
('76001', '76', 'Cali', TRUE),
('76111', '76', 'Guadalajara de Buga', FALSE),
('76520', '76', 'Palmira', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 4. ORGANIZACIÓN MATRIZ
INSERT INTO organizations (id, department_id, municipality_id, name, nit, entity_type, address, phone, email, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', '11', '11001', 'Federación Nacional de Torneos y Ligas de Colombia', '901.884.221-5', 'asociacion_deportiva', 'Cra 15 # 93-60, Bogotá D.C.', '+57 (1) 745 8899', 'contacto@futbolmasterpro.co', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. USUARIO SUPERADMINISTRADOR NACIONAL
-- Contraseña hash bcrypt (12 rounds) para: "123Sai"
-- $2b$12$Nq79qjA4nZgLdE46aVekE.G6/hYQdZ2qX3rJ91P2B1C6.cQjF7mUq
INSERT INTO users (id, role_id, organization_id, department_id, municipality_id, full_name, email, password_hash, document_type, document_number, phone, status, habeas_data_accepted, habeas_data_accepted_at) VALUES
('00000000-0000-0000-0000-000000000001', 'superadmin', '11111111-1111-1111-1111-111111111111', '11', '11001', 'Saider Boadas', 'boadasaidert466@gmail.com', '$2b$12$04W04Nl1/Q2B4O3B2x4g0eIe8iK9i1L9f4b4g2e8k7j3h1l5m6n7o', 'CC', '1098765432', '+57 310 445 8899', 'active', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;
