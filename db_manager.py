import sqlite3
import json
import os
from datetime import datetime

DB_FILE = "football_master_pro.db"

def init_db():
    if os.path.exists(DB_FILE):
        try:
            os.remove(DB_FILE)
        except Exception:
            pass

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'organizer', 'coach', 'fan')),
        role_title TEXT NOT NULL,
        club_name TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 2. Venues table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS venues (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        city TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        surface TEXT NOT NULL,
        modality TEXT NOT NULL,
        capacity INTEGER DEFAULT 100,
        lighting TEXT DEFAULT 'LED Profesional',
        slots_json TEXT NOT NULL,
        coordinates TEXT,
        verified TEXT DEFAULT 'Verificada',
        created_at TEXT NOT NULL
    );
    """)

    # 3. Teams master entity (Regla 10: entidad maestra independiente de torneos)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        coach_id TEXT,
        coach_name TEXT,
        city TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Libre Masculino',
        color TEXT NOT NULL DEFAULT '#059669',
        shield_svg TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)

    # 4. Tournaments table (con los 7 estados oficiales de ciclo de vida)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        organizer_id TEXT NOT NULL,
        organizer_name TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        sport TEXT NOT NULL DEFAULT 'futbol11',
        format TEXT NOT NULL DEFAULT 'league_single',
        category TEXT DEFAULT 'Libre Masculino',
        status TEXT NOT NULL CHECK(status IN ('draft', 'open_registration', 'closed_registration', 'upcoming', 'in_progress', 'finished', 'suspended')),
        start_date TEXT,
        end_date TEXT,
        reg_start_date TEXT,
        reg_end_date TEXT,
        max_teams INTEGER NOT NULL DEFAULT 8,
        play_days_json TEXT,
        time_slots_json TEXT,
        venues_json TEXT,
        rules_json TEXT,
        points_config_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 5. Tournament Teams relationship (participación de un equipo en un torneo)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tournament_teams (
        id TEXT PRIMARY KEY,
        tournament_id TEXT NOT NULL,
        team_id TEXT NOT NULL,
        group_name TEXT DEFAULT 'Grupo Único',
        joined_at TEXT NOT NULL,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        UNIQUE(tournament_id, team_id)
    );
    """)

    # 6. Registrations (solicitudes de inscripción)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        tournament_id TEXT NOT NULL,
        tournament_name TEXT NOT NULL,
        team_id TEXT,
        team_name TEXT NOT NULL,
        city TEXT NOT NULL,
        color TEXT DEFAULT '#059669',
        shield_svg TEXT,
        coach_id TEXT NOT NULL,
        coach_name TEXT NOT NULL,
        coach_doc TEXT,
        coach_phone TEXT,
        coach_email TEXT,
        status TEXT NOT NULL CHECK(status IN ('pendiente_inicial', 'aprobada_inicial', 'devuelta_inicial', 'revision_final', 'habilitado', 'rechazada', 'cancelada')),
        feedback_reason TEXT,
        pdf_attached INTEGER DEFAULT 0,
        pdf_name TEXT,
        submitted_at TEXT NOT NULL,
        reviewed_at TEXT,
        reviewed_by TEXT,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
        FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 7. Players (jugadores vinculados a equipo maestro y/o torneo)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        team_id TEXT,
        tournament_id TEXT,
        registration_id TEXT,
        name TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        doc_number TEXT NOT NULL,
        birth_date TEXT,
        age INTEGER,
        dorsal INTEGER NOT NULL,
        position TEXT NOT NULL,
        eps TEXT,
        guardian_name TEXT,
        guardian_doc TEXT,
        enabled INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE SET NULL
    );
    """)

    # 8. Matches (partidos con soporte de acta, revisión y bloqueo)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        tournament_id TEXT NOT NULL,
        round_number INTEGER NOT NULL,
        group_name TEXT DEFAULT 'Grupo Único',
        home_team_id TEXT NOT NULL,
        away_team_id TEXT NOT NULL,
        home_team_name TEXT NOT NULL,
        away_team_name TEXT NOT NULL,
        venue_id TEXT,
        venue_name TEXT,
        match_date TEXT,
        match_time TEXT,
        home_score INTEGER,
        away_score INTEGER,
        status TEXT NOT NULL CHECK(status IN ('scheduled', 'playing', 'finished', 'suspended', 'postponed')),
        observations TEXT,
        support_doc_name TEXT,
        support_doc_path TEXT,
        support_doc_data TEXT,
        review_status TEXT DEFAULT 'manual' CHECK(review_status IN ('pending_review', 'verified', 'manual')),
        is_locked INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL,
        updated_by TEXT,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
    );
    """)

    # 9. Match Goals (goles vinculados a partido, torneo, equipo y jugador)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS match_goals (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL,
        tournament_id TEXT NOT NULL,
        team_id TEXT NOT NULL,
        player_id TEXT,
        player_name TEXT NOT NULL,
        minute INTEGER,
        is_own_goal INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
    );
    """)

    # 10. Standings (tabla de posiciones)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS standings (
        id TEXT PRIMARY KEY,
        tournament_id TEXT NOT NULL,
        group_name TEXT DEFAULT 'Grupo Único',
        team_id TEXT NOT NULL,
        team_name TEXT NOT NULL,
        played INTEGER DEFAULT 0,
        won INTEGER DEFAULT 0,
        drawn INTEGER DEFAULT 0,
        lost INTEGER DEFAULT 0,
        goals_for INTEGER DEFAULT 0,
        goals_against INTEGER DEFAULT 0,
        goal_diff INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        rank INTEGER DEFAULT 1,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );
    """)

    # 11. Audit Log (historial inmutable de auditoría)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        user_role TEXT,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 12. Notifications (notificaciones segmentadas por rol y usuario)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        target_role TEXT NOT NULL,
        target_user_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    conn.commit()
    seed_db(cursor, conn)
    conn.close()
    print("Base de datos SQLite 'football_master_pro.db' inicializada exitosamente.")

def seed_db(cursor, conn):
    now = datetime.now().isoformat()
    
    # 1. Usuarios
    users = [
        ("usr-admin-1", "Saider Boadas", "boadasaidert466@gmail.com", "+57 310 445 8899", "123Sai", "admin", "Administrador General", "Fútbol Master Pro", now),
        ("usr-org-1", "Andrés Montoya", "organizador@torneoscolombia.com", "+57 300 123 4567", "org123", "organizer", "Organizador de Torneo", "Torneos y Ligas Colombia", now),
        ("usr-dt-1", "Prof. Héctor Ramírez", "dt.ramirez@nacional.co", "+57 312 888 9900", "dt123", "coach", "Director Técnico / Delegado", "Atlético Nacional Master", now),
        ("usr-fan-1", "Santiago Rojas", "hincha@futbolmaster.pro", "+57 320 555 1234", "fan123", "fan", "Aficionado / Visitante", None, now)
    ]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", users)

    # 2. Sedes Colombianas
    venues = [
        ("vn-bog-1", "Complejo Salitre Alto Rendimiento", "Bogotá D.C.", "Bogotá", "Calle 63 # 68-45, Cancha 1", "+57 310 234 5678", "Grama Sintética Pro", "Fútbol 11", 500, "LED 800 Lux", json.dumps(["08:00", "10:00", "14:00", "16:00", "18:00", "20:00"]), "4.6583° N, 74.0938° W", "Verificada", now),
        ("vn-med-1", "Cancha Marte 1 - Atanasio Girardot", "Antioquia", "Medellín", "Carrera 74 # 48-01", "+57 300 456 7890", "Grama Sintética Pro", "Fútbol 11", 1200, "LED Profesional 1000 Lux", json.dumps(["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]), "6.2568° N, 75.5905° W", "Verificada", now),
        ("vn-cali-1", "Sede Campestre La Zarcita", "Valle del Cauca", "Cali", "Km 4 Vía Pance", "+57 315 789 0123", "Grama Natural", "Fútbol 11", 300, "LED 500 Lux", json.dumps(["09:00", "11:00", "15:00", "17:00"]), "3.3284° N, 76.5412° W", "Verificada", now),
        ("vn-baq-1", "Cancha Sintética La 84", "Atlántico", "Barranquilla", "Calle 84 # 47-32, Riomar", "+57 300 481 9283", "Sintética", "Fútbol 7/8", 250, "LED Profesional 500 Lux", json.dumps(["16:00", "18:00", "19:00", "20:00", "21:00"]), "11.0041° N, 74.8070° W", "Verificada", now),
        ("vn-buc-1", "Parque Recrear del Norte", "Santander", "Bucaramanga", "Carrera 2W # 25-10", "+57 318 654 3210", "Grama Sintética", "Fútbol 8", 200, "LED Estándar", json.dumps(["16:00", "18:00", "20:00"]), "7.1512° N, 73.1384° W", "Verificada", now),
        ("vn-per-1", "Parque Metropolitano del Café", "Risaralda", "Pereira", "Sector Villa Olímpica", "+57 314 555 4321", "Grama Natural", "Fútbol 11", 400, "LED 600 Lux", json.dumps(["08:00", "10:00", "14:00", "16:00"]), "4.8083° N, 75.7333° W", "Verificada", now),
        ("vn-ctg-1", "Cancha El Campito Bocagrande", "Bolívar", "Cartagena", "Avenida San Martín # 8-40", "+57 301 987 6543", "Sintética Monofilamento", "Fútbol 7", 150, "LED Brisa Marina", json.dumps(["17:00", "19:00", "21:00"]), "10.4000° N, 75.5540° W", "Verificada", now),
        ("vn-iba-1", "Cancha Sintética Champagnat", "Tolima", "Ibagué", "Calle 19 # 4-88", "+57 311 222 3344", "Grama Sintética", "Fútbol 8", 180, "LED Nocturna", json.dumps(["16:00", "18:00", "20:00"]), "4.4389° N, 75.2322° W", "Verificada", now)
    ]
    cursor.executemany("INSERT INTO venues VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", venues)

    # 3. Equipos Maestros (Regla 10: entidad independiente)
    master_teams = [
        ("tm-nac-01", "Atlético Nacional Master", "usr-dt-1", "Prof. Héctor Ramírez", "Medellín", "Libre Masculino", "#059669", "", now),
        ("tm-mil-02", "Millonarios Senior FC", None, "Alberto Gamero", "Bogotá", "Libre Masculino", "#2563eb", "", now),
        ("tm-ame-03", "América de Cali Vintage", None, "Jorge Da Silva", "Cali", "Libre Masculino", "#dc2626", "", now),
        ("tm-jun-04", "Junior de Barranquilla Pro", None, "Arturo Reyes", "Barranquilla", "Libre Masculino", "#e11d48", "", now),
        ("tm-sf-05", "Independiente Santa Fe Master", None, "Pablo Peirano", "Bogotá", "Libre Masculino", "#ef4444", "", now),
        ("tm-cali-06", "Deportivo Cali Élite", None, "Hernán Torres", "Cali", "Libre Masculino", "#16a34a", "", now),
        ("tm-dim-07", "Independiente Medellín Clásicos", None, "Alfredo Arias", "Medellín", "Libre Masculino", "#b91c1c", "", now),
        ("tm-buc-08", "Atlético Bucaramanga Campeón", None, "Rafael Dudamel", "Bucaramanga", "Libre Masculino", "#ca8a04", "", now)
    ]
    cursor.executemany("INSERT INTO teams VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", master_teams)

    # 4. Torneo Demo "Copa Colombia Master 2026"
    t_id = "tournament_copa_colombia_2026"
    t_data = (
        t_id,
        "usr-org-1",
        "Andrés Montoya",
        "Copa Colombia Master 2026",
        "Torneo oficial de integración y alto rendimiento categoría abierta para clubes de Colombia.",
        "futbol11",
        "league_single",
        "Libre Masculino",
        "in_progress",
        "2026-03-01",
        "2026-05-15",
        "2026-01-10",
        "2026-02-25",
        8,
        json.dumps(["sábado", "domingo"]),
        json.dumps(["09:00", "11:00", "14:00", "16:00"]),
        json.dumps(["vn-bog-1", "vn-med-1", "vn-cali-1", "vn-baq-1"]),
        json.dumps({"matchDuration": 90, "cardsAccumulation": 3, "pointsWin": 3, "pointsDraw": 1, "pointsLoss": 0}),
        json.dumps({"win": 3, "draw": 1, "loss": 0}),
        now,
        now
    )
    cursor.execute("INSERT INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", t_data)

    # 4b. Torneo 2 en Inscripciones Abiertas: "Torneo Apertura Colombia 2026"
    t_open_id = "tournament_apertura_2026"
    t_open_data = (
        t_open_id,
        "usr-org-1",
        "Andrés Montoya",
        "Torneo Apertura Colombia 2026",
        "Competición de apertura para clubes federados y aficionados. Inscripciones abiertas.",
        "futbol11",
        "league_single",
        "Libre Masculino",
        "open_registration",
        "2026-11-01",
        "2026-12-20",
        "2026-01-01",
        "2026-12-31",
        8,
        json.dumps(["sábado", "domingo"]),
        json.dumps(["09:00", "11:00", "14:00", "16:00"]),
        json.dumps(["vn-bog-1", "vn-med-1"]),
        json.dumps({"matchDuration": 90, "cardsAccumulation": 3, "pointsWin": 3, "pointsDraw": 1, "pointsLoss": 0}),
        json.dumps({"win": 3, "draw": 1, "loss": 0}),
        now,
        now
    )
    cursor.execute("INSERT INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", t_open_data)

    # 4c. Torneo 3 en Inscripciones Abiertas: "Liga Élite del Caribe 2026"
    t_caribe_id = "tournament_liga_caribe_2026"
    t_caribe_data = (
        t_caribe_id,
        "usr-org-1",
        "Andrés Montoya",
        "Liga Élite del Caribe 2026",
        "Campeonato costero de alto rendimiento con sede en Barranquilla y Cartagena. Cupos limitados para clubes federados.",
        "futbol11",
        "league_single",
        "Libre Masculino",
        "open_registration",
        "2026-11-15",
        "2027-01-20",
        "2026-10-15",
        "2026-12-25",
        10,
        json.dumps(["viernes", "sábado", "domingo"]),
        json.dumps(["16:00", "18:00", "20:00"]),
        json.dumps(["vn-baq-1", "vn-ctg-1"]),
        json.dumps({"matchDuration": 90, "cardsAccumulation": 3, "pointsWin": 3, "pointsDraw": 1, "pointsLoss": 0}),
        json.dumps({"win": 3, "draw": 1, "loss": 0}),
        now,
        now
    )
    cursor.execute("INSERT INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", t_caribe_data)

    # 4d. Torneo 4 en Inscripciones Abiertas: "Copa Cafetera de Occidente 2026"
    t_cafe_id = "tournament_copa_cafetera_2026"
    t_cafe_data = (
        t_cafe_id,
        "usr-org-1",
        "Andrés Montoya",
        "Copa Cafetera de Occidente 2026",
        "Torneo regional del Eje Cafetero y Valle del Cauca. Formato dinámico con canchas naturales y sintéticas de primer nivel.",
        "futbol11",
        "groups_playoffs",
        "Sub-20 Masculino",
        "open_registration",
        "2026-11-20",
        "2027-01-30",
        "2026-10-20",
        "2026-12-28",
        8,
        json.dumps(["sábado", "domingo"]),
        json.dumps(["08:00", "10:00", "14:00", "16:00"]),
        json.dumps(["vn-per-1", "vn-cali-1"]),
        json.dumps({"matchDuration": 90, "cardsAccumulation": 3, "pointsWin": 3, "pointsDraw": 1, "pointsLoss": 0}),
        json.dumps({"win": 3, "draw": 1, "loss": 0}),
        now,
        now
    )
    cursor.execute("INSERT INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", t_cafe_data)

    # 4e. Torneo 5 Próximo a comenzar: "Torneo Metropolitano Santander 2026"
    t_sant_id = "tournament_metro_santander_2026"
    t_sant_data = (
        t_sant_id,
        "usr-org-1",
        "Andrés Montoya",
        "Torneo Metropolitano Santander 2026",
        "Competición cerrada de pretemporada en Bucaramanga. Equipos confirmados, inicio programado.",
        "futbol11",
        "league_single",
        "Libre Masculino",
        "upcoming",
        "2026-11-25",
        "2027-02-10",
        "2026-10-01",
        "2026-11-10",
        8,
        json.dumps(["sábado", "domingo"]),
        json.dumps(["16:00", "18:00", "20:00"]),
        json.dumps(["vn-buc-1"]),
        json.dumps({"matchDuration": 90, "cardsAccumulation": 3, "pointsWin": 3, "pointsDraw": 1, "pointsLoss": 0}),
        json.dumps({"win": 3, "draw": 1, "loss": 0}),
        now,
        now
    )
    cursor.execute("INSERT INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", t_sant_data)

    # 4f. Torneo 6 En Curso con Franjas Ocupadas: "Superliga Andina Nocturna 2026"
    t_andina_id = "tournament_superliga_andina_2026"
    t_andina_data = (
        t_andina_id,
        "usr-org-1",
        "Andrés Montoya",
        "Superliga Andina Nocturna 2026",
        "Fútbol nocturno en grama sintética y natural con iluminación LED profesional en Bogotá y Cali.",
        "futbol11",
        "league_single",
        "Libre Masculino",
        "in_progress",
        "2026-09-01",
        "2026-12-15",
        "2026-08-01",
        "2026-08-25",
        8,
        json.dumps(["miércoles", "viernes", "sábado"]),
        json.dumps(["18:00", "20:00"]),
        json.dumps(["vn-bog-1", "vn-cali-1"]),
        json.dumps({"matchDuration": 90, "cardsAccumulation": 3, "pointsWin": 3, "pointsDraw": 1, "pointsLoss": 0}),
        json.dumps({"win": 3, "draw": 1, "loss": 0}),
        now,
        now
    )
    cursor.execute("INSERT INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", t_andina_data)


    # 5. Participación de los 8 equipos en el torneo
    tourney_teams = [(f"tt_{t_id}_{tm[0]}", t_id, tm[0], "Grupo Único", now) for tm in master_teams]
    cursor.executemany("INSERT INTO tournament_teams VALUES (?, ?, ?, ?, ?);", tourney_teams)

    # 5b. Jugadores oficiales para Nacional y Millonarios
    seed_players = [
        ("ply_nac_1", "tm-nac-01", t_id, None, "David Ospina Ramírez", "CC", "1020485923", "1988-08-31", 37, 1, "Arquero", "Sura EPS", None, None, 1, now),
        ("ply_nac_2", "tm-nac-01", t_id, None, "Edwin Cardona Bedoya", "CC", "1020485924", "1992-12-08", 33, 10, "Mediocampista", "Sura EPS", None, None, 1, now),
        ("ply_nac_3", "tm-nac-01", t_id, None, "Alfredo Morelos Avilés", "CC", "1020485925", "1996-06-21", 29, 9, "Delantero", "Sura EPS", None, None, 1, now),
        ("ply_mil_1", "tm-mil-02", t_id, None, "Álvaro Montero Perales", "CC", "1023456789", "1995-03-29", 31, 31, "Arquero", "Sanitas", None, None, 1, now),
        ("ply_mil_2", "tm-mil-02", t_id, None, "Mackalister Silva Mosquera", "CC", "1025678901", "1986-12-13", 39, 14, "Mediocampista", "Sanitas", None, None, 1, now),
        ("ply_mil_3", "tm-mil-02", t_id, None, "Leonardo Castro Loaiza", "CC", "1026789012", "1992-06-14", 34, 23, "Delantero", "Compensar", None, None, 1, now)
    ]
    cursor.executemany("INSERT INTO players VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", seed_players)

    # 6. Partidos y Marcadores de Fecha 1 (Jugados) y Fechas 2 a 7
    # 4 partidos fecha 1 jugados con soporte
    matches = [
        ("m_f1_1", t_id, 1, "Grupo Único", "tm-nac-01", "tm-mil-02", "Atlético Nacional Master", "Millonarios Senior FC", "vn-med-1", "Cancha Marte 1 - Atanasio Girardot", "2026-03-01", "09:00", 2, 1, "finished", "Clásico disputado con normalidad.", "acta_oficial_f1_p1.pdf", "/uploads/actas/acta_oficial_f1_p1.pdf", None, "verified", 1, now, "usr-org-1"),
        ("m_f1_2", t_id, 1, "Grupo Único", "tm-ame-03", "tm-jun-04", "América de Cali Vintage", "Junior de Barranquilla Pro", "vn-cali-1", "Sede Campestre La Zarcita", "2026-03-01", "11:00", 3, 2, "finished", "Gran marco de público en Pance.", "acta_oficial_f1_p2.pdf", "/uploads/actas/acta_oficial_f1_p2.pdf", None, "verified", 1, now, "usr-org-1"),
        ("m_f1_3", t_id, 1, "Grupo Único", "tm-sf-05", "tm-cali-06", "Independiente Santa Fe Master", "Deportivo Cali Élite", "vn-bog-1", "Complejo Salitre Alto Rendimiento", "2026-03-01", "14:00", 1, 1, "finished", "Empate táctico.", "acta_oficial_f1_p3.pdf", "/uploads/actas/acta_oficial_f1_p3.pdf", None, "verified", 1, now, "usr-org-1"),
        ("m_f1_4", t_id, 1, "Grupo Único", "tm-dim-07", "tm-buc-08", "Independiente Medellín Clásicos", "Atlético Bucaramanga Campeón", "vn-med-1", "Cancha Marte 1 - Atanasio Girardot", "2026-03-01", "16:00", 0, 1, "finished", "Victoria visitante.", "acta_oficial_f1_p4.pdf", "/uploads/actas/acta_oficial_f1_p4.pdf", None, "verified", 1, now, "usr-org-1")
    ]
    cursor.executemany("INSERT INTO matches VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", matches)

    # 6b. Goles del partido m_f1_1: Nacional 2 - 1 Millonarios
    seed_goals = [
        ("goal_1", "m_f1_1", t_id, "tm-nac-01", "ply_nac_3", "Alfredo Morelos Avilés", 34, 0, now),
        ("goal_2", "m_f1_1", t_id, "tm-nac-01", "ply_nac_2", "Edwin Cardona Bedoya", 68, 0, now),
        ("goal_3", "m_f1_1", t_id, "tm-mil-02", "ply_mil_3", "Leonardo Castro Loaiza", 52, 0, now)
    ]
    cursor.executemany("INSERT INTO match_goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);", seed_goals)

    # 7. Tabla de posiciones inicial calculada para el torneo
    standings = [
        (f"st_{t_id}_ame", t_id, "Grupo Único", "tm-ame-03", "América de Cali Vintage", 1, 1, 0, 0, 3, 2, 1, 3, 1),
        (f"st_{t_id}_nac", t_id, "Grupo Único", "tm-nac-01", "Atlético Nacional Master", 1, 1, 0, 0, 2, 1, 1, 3, 2),
        (f"st_{t_id}_buc", t_id, "Grupo Único", "tm-buc-08", "Atlético Bucaramanga Campeón", 1, 1, 0, 0, 1, 0, 1, 3, 3),
        (f"st_{t_id}_sf", t_id, "Grupo Único", "tm-sf-05", "Independiente Santa Fe Master", 1, 0, 1, 0, 1, 1, 0, 1, 4),
        (f"st_{t_id}_cali", t_id, "Grupo Único", "tm-cali-06", "Deportivo Cali Élite", 1, 0, 1, 0, 1, 1, 0, 1, 5),
        (f"st_{t_id}_jun", t_id, "Grupo Único", "tm-jun-04", "Junior de Barranquilla Pro", 1, 0, 0, 1, 2, 3, -1, 0, 6),
        (f"st_{t_id}_mil", t_id, "Grupo Único", "tm-mil-02", "Millonarios Senior FC", 1, 0, 0, 1, 1, 2, -1, 0, 7),
        (f"st_{t_id}_dim", t_id, "Grupo Único", "tm-dim-07", "Independiente Medellín Clásicos", 1, 0, 0, 1, 0, 1, -1, 0, 8)
    ]
    cursor.executemany("INSERT INTO standings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", standings)

    # 8. Auditoría Inicial
    audit = [
        ("aud-1", "usr-admin-1", "Carlos Mendoza", "admin", "SISTEMA_INICIALIZADO", "Base de datos master Football Master Pro y tablas relacionales creadas.", "127.0.0.1", now),
        ("aud-2", "usr-org-1", "Andrés Montoya", "organizador", "TORNEO_CREADO", "Creó el torneo 'Copa Colombia Master 2026' con 8 clubes y 28 partidos programados.", "186.84.90.11", now),
        ("aud-3", "usr-org-1", "Andrés Montoya", "organizador", "ACTA_VALIDADA", "Asentó marcador y acta oficial de la Fecha 1: Nacional 2 - 1 Millonarios.", "186.84.90.11", now)
    ]
    cursor.executemany("INSERT INTO audit_log VALUES (?, ?, ?, ?, ?, ?, ?, ?);", audit)

    conn.commit()

if __name__ == "__main__":
    init_db()

