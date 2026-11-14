-- =============================================================================
-- FOOTBALL MASTER PRO COLOMBIA - ESQUEMA RELACIONAL POSTGRESQL (FASE 1)
-- Arquitectura de Base de Datos para Gestión Deportiva a Escala Nacional
-- Cumplimiento: Normalización 3FN, Integridad Referencial, Ley 1581 Habeas Data
-- =============================================================================

-- 1. EXTENSIONES DEL SISTEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- =============================================================================
-- 2. TABLAS GEOGRÁFICAS Y DIVISIÓN POLÍTICA DE COLOMBIA (DANE)
-- =============================================================================

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(2) PRIMARY KEY, -- Código DANE (ej: '05' Antioquia, '08' Atlántico, '11' Bogotá)
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL, -- Caribe, Andina, Pacífica, Orinoquía, Amazonía
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS municipalities (
    id VARCHAR(5) PRIMARY KEY, -- Código DANE (ej: '05001' Medellín, '08001' Barranquilla, '11001' Bogotá)
    department_id VARCHAR(2) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    name VARCHAR(120) NOT NULL,
    is_capital BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. CONTROL DE ACCESO, ROLES Y ORGANIZACIONES DEPORTIVAS (RBAC)
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(30) PRIMARY KEY, -- 'superadmin', 'regional_admin', 'organizer', 'director_tecnico', 'team_coach', 'fan'
    name VARCHAR(80) NOT NULL,
    description TEXT,
    hierarchy_level INT NOT NULL, -- 1: Superadmin (Global), 2: Regional Admin, 3: Organizador, 4: DT, 5: Técnico de Plantilla, 6: Aficionado
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id VARCHAR(2) REFERENCES departments(id) ON DELETE SET NULL,
    municipality_id VARCHAR(5) REFERENCES municipalities(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    nit VARCHAR(20) UNIQUE,
    entity_type VARCHAR(50) DEFAULT 'liga_departamental' CHECK (entity_type IN ('liga_departamental', 'comite_municipal', 'organizacion_privada', 'asociacion_deportiva')),
    address VARCHAR(200),
    phone VARCHAR(30),
    email CITEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id VARCHAR(30) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    department_id VARCHAR(2) REFERENCES departments(id) ON DELETE SET NULL,
    municipality_id VARCHAR(5) REFERENCES municipalities(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    document_type VARCHAR(10) DEFAULT 'CC' CHECK (document_type IN ('CC', 'TI', 'CE', 'PASAPORTE', 'PEP')),
    document_number VARCHAR(30),
    phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification')),
    habeas_data_accepted BOOLEAN DEFAULT FALSE,
    habeas_data_accepted_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. ESCENARIOS DEPORTIVOS Y CANCHAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    department_id VARCHAR(2) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    municipality_id VARCHAR(5) NOT NULL REFERENCES municipalities(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(200) NOT NULL,
    surface_type VARCHAR(30) NOT NULL CHECK (surface_type IN ('sintetica', 'grama_natural', 'salon_amf', 'tierra_mixta')),
    capacity INT DEFAULT 0,
    has_lighting BOOLEAN DEFAULT TRUE,
    is_covered BOOLEAN DEFAULT FALSE,
    hourly_rate NUMERIC(12,2) DEFAULT 0.00,
    contact_phone VARCHAR(30),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'reserved', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. CLUBES, EQUIPOS Y GESTIÓN DE PLANTILLAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    department_id VARCHAR(2) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    municipality_id VARCHAR(5) NOT NULL REFERENCES municipalities(id) ON DELETE RESTRICT,
    dt_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Director Técnico Principal
    name VARCHAR(120) NOT NULL,
    short_name VARCHAR(50),
    recognition_code VARCHAR(50), -- Código Personería Jurídica / Reconocimiento Deportivo
    founded_year INT,
    badge_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#10b981',
    secondary_color VARCHAR(10) DEFAULT '#0f172a',
    is_official BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Técnico del equipo específico
    name VARCHAR(120) NOT NULL, -- ej: "Real Bogotá Sub-20 A"
    category VARCHAR(50) NOT NULL, -- "Libre Mayores", "Sub-20", "Sub-17", "Veteranos 35+"
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('masculino', 'femenino', 'mixto')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jugadores con cumplimiento estricto de Habeas Data y enmascaramiento de identificación
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    document_type VARCHAR(10) NOT NULL CHECK (document_type IN ('CC', 'TI', 'CE', 'PASAPORTE', 'PEP')),
    document_number VARCHAR(30) NOT NULL,
    masked_document VARCHAR(30) NOT NULL, -- ej: "CC *****923" para vistas públicas
    birth_date DATE NOT NULL,
    eps VARCHAR(100), -- Entidad Promotora de Salud (Obligatorio en Colombia)
    blood_type VARCHAR(5),
    position VARCHAR(30) NOT NULL CHECK (position IN ('portero', 'defensa_central', 'lateral_derecho', 'lateral_izquierdo', 'mediocampista_defensivo', 'mediocampista_ofensivo', 'extremo', 'delantero_centro')),
    preferred_foot VARCHAR(10) DEFAULT 'diestro' CHECK (preferred_foot IN ('diestro', 'zurdo', 'ambidiestro')),
    photo_url TEXT,
    habeas_data_consent BOOLEAN NOT NULL DEFAULT TRUE,
    consent_signed_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'injured', 'transferred')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (club_id, document_number)
);

-- =============================================================================
-- 6. TORNEOS Y COMPETICIONES (AISLAMIENTO ESTRICTO POR ORGANIZADOR)
-- =============================================================================

CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    department_id VARCHAR(2) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    municipality_id VARCHAR(5) NOT NULL REFERENCES municipalities(id) ON DELETE RESTRICT,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    edition VARCHAR(50),
    sport_modality VARCHAR(30) NOT NULL CHECK (sport_modality IN ('futbol_11', 'futbol_8_9', 'futbol_7', 'futbol_5_sintetica', 'futsal_salon')),
    competition_format VARCHAR(30) NOT NULL CHECK (competition_format IN ('liga_todos_vs_todos', 'fase_grupos_playoffs', 'eliminacion_directa', 'ida_vuelta_final')),
    match_duration_minutes INT DEFAULT 90 CHECK (match_duration_minutes > 0),
    points_win INT DEFAULT 3,
    points_draw INT DEFAULT 1,
    points_loss INT DEFAULT 0,
    tie_breaker_rule VARCHAR(50) DEFAULT 'goal_difference' CHECK (tie_breaker_rule IN ('goal_difference', 'direct_match', 'goals_scored', 'fair_play')),
    max_teams INT NOT NULL CHECK (max_teams >= 2),
    current_teams_count INT DEFAULT 0,
    registration_start DATE,
    registration_end DATE,
    tournament_start DATE NOT NULL,
    tournament_end DATE,
    allowed_days JSONB DEFAULT '["sabado", "domingo"]'::jsonb,
    available_time_slots JSONB DEFAULT '["08:00", "10:00", "14:00", "16:00", "18:00"]'::jsonb,
    registration_fee NUMERIC(12,2) DEFAULT 0.00,
    prize_pool NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'open_registration', 'in_progress', 'playoffs', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. INSCRIPCIONES DE EQUIPOS Y ASIGNACIÓN DE PLANILLAS
-- =============================================================================

CREATE TABLE IF NOT EXISTS tournament_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved_initial', 'approved_final', 'rejected', 'withdrawn')),
    assigned_group VARCHAR(10) DEFAULT 'A',
    seed_number INT,
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'exempt')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tournament_id, team_id)
);

CREATE TABLE IF NOT EXISTS team_rosters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_team_id UUID NOT NULL REFERENCES tournament_teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
    dorsal INT NOT NULL CHECK (dorsal BETWEEN 1 AND 99),
    is_captain BOOLEAN DEFAULT FALSE,
    is_eligible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tournament_team_id, player_id),
    UNIQUE (tournament_team_id, dorsal) -- Dorsal único por equipo en el torneo
);

-- =============================================================================
-- 8. PARTIDOS, ACTAS ARBITRALES, GOLES Y SANCIONES
-- =============================================================================

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    round_number INT NOT NULL,
    match_phase VARCHAR(30) DEFAULT 'regular_season' CHECK (match_phase IN ('regular_season', 'group_stage', 'round_of_16', 'quarter_finals', 'semi_finals', 'third_place', 'final')),
    home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    match_datetime TIMESTAMPTZ NOT NULL,
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    home_penalty_score INT DEFAULT NULL,
    away_penalty_score INT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'played', 'suspended', 'postponed', 'cancelled')),
    referee_name VARCHAR(120),
    acta_arbitral_url TEXT,
    acta_uploaded_at TIMESTAMPTZ,
    acta_uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acta_status VARCHAR(20) DEFAULT 'none' CHECK (acta_status IN ('none', 'pending_review', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (home_team_id <> away_team_id)
);

CREATE TABLE IF NOT EXISTS match_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    assist_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    minute INT NOT NULL CHECK (minute BETWEEN 1 AND 130),
    goal_type VARCHAR(20) DEFAULT 'regular' CHECK (goal_type IN ('regular', 'penalty', 'free_kick', 'own_goal', 'header')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('yellow', 'red', 'second_yellow')),
    minute INT NOT NULL CHECK (minute BETWEEN 1 AND 130),
    reason VARCHAR(255),
    suspension_rounds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. TABLAS DE POSICIONES OFICIALES FIFA
-- =============================================================================

CREATE TABLE IF NOT EXISTS standings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    group_name VARCHAR(10) DEFAULT 'General',
    played INT DEFAULT 0,
    won INT DEFAULT 0,
    drawn INT DEFAULT 0,
    lost INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    goal_difference INT DEFAULT 0,
    fair_play_points INT DEFAULT 0,
    points INT DEFAULT 0,
    form VARCHAR(5) DEFAULT '', -- Últimos 5 partidos (ej: "VEEVD")
    rank INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (tournament_id, team_id, group_name)
);

-- =============================================================================
-- 10. AUDITORÍA INMUTABLE DEL SISTEMA
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(60) NOT NULL, -- ej: 'LOGIN_ADMIN', 'UPDATE_MATCH_SCORE', 'APPROVE_TEAM'
    entity_type VARCHAR(50) NOT NULL, -- 'matches', 'tournaments', 'tournament_teams'
    entity_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    previous_state JSONB,
    new_state JSONB,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 11. ÍNDICES DE ALTO RENDIMIENTO
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_role_org ON users(role_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer ON tournaments(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_tournaments_geo ON tournaments(department_id, municipality_id, status);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_status ON tournament_teams(tournament_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_date ON matches(tournament_id, match_datetime);
CREATE INDEX IF NOT EXISTS idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX IF NOT EXISTS idx_standings_ranking ON standings(tournament_id, points DESC, goal_difference DESC, goals_for DESC);
CREATE INDEX IF NOT EXISTS idx_players_club ON players(club_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);
