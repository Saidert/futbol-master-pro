import uuid
import http.server
import socketserver
import json
import sqlite3
import urllib.parse
from datetime import datetime
import os
import re

PORT = int(os.environ.get("PORT", 8080))
DB_FILE = "football_master_pro.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def mask_doc(doc_type, doc_number):
    if not doc_number:
        return f"{doc_type} ********"
    s = str(doc_number).strip()
    if len(s) <= 4:
        return f"{doc_type} ****"
    return f"{doc_type} *****{s[-3:]}"

def recalculate_standings(conn, tournament_id):
    cur = conn.cursor()
    # 1. Obtener equipos participantes
    cur.execute("SELECT team_id FROM tournament_teams WHERE tournament_id = ?", (tournament_id,))
    team_rows = cur.fetchall()
    team_ids = [r['team_id'] for r in team_rows]

    if not team_ids:
        cur.execute("SELECT DISTINCT home_team_id FROM matches WHERE tournament_id = ? UNION SELECT DISTINCT away_team_id FROM matches WHERE tournament_id = ?", (tournament_id, tournament_id))
        team_ids = [r[0] for r in cur.fetchall() if r[0]]

    conn.execute("DELETE FROM standings WHERE tournament_id = ?", (tournament_id,))

    stats = {}
    for tid in team_ids:
        cur.execute("SELECT name FROM teams WHERE id = ?", (tid,))
        tname_row = cur.fetchone()
        tname = tname_row['name'] if tname_row else tid
        stats[tid] = {
            'team_id': tid, 'team_name': tname,
            'played': 0, 'won': 0, 'drawn': 0, 'lost': 0,
            'gf': 0, 'ga': 0, 'gd': 0, 'pts': 0
        }

    cur.execute("SELECT * FROM matches WHERE tournament_id = ? AND status = 'finished' AND home_score IS NOT NULL AND away_score IS NOT NULL", (tournament_id,))
    matches = cur.fetchall()

    for m in matches:
        ht = m['home_team_id']
        at = m['away_team_id']
        hs = int(m['home_score'])
        as_ = int(m['away_score'])

        if ht not in stats:
            stats[ht] = {'team_id': ht, 'team_name': m['home_team_name'], 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0, 'gf': 0, 'ga': 0, 'gd': 0, 'pts': 0}
        if at not in stats:
            stats[at] = {'team_id': at, 'team_name': m['away_team_name'], 'played': 0, 'won': 0, 'drawn': 0, 'lost': 0, 'gf': 0, 'ga': 0, 'gd': 0, 'pts': 0}

        stats[ht]['played'] += 1
        stats[at]['played'] += 1
        stats[ht]['gf'] += hs
        stats[ht]['ga'] += as_
        stats[at]['gf'] += as_
        stats[at]['ga'] += hs

        if hs > as_:
            stats[ht]['won'] += 1
            stats[ht]['pts'] += 3
            stats[at]['lost'] += 1
        elif hs < as_:
            stats[at]['won'] += 1
            stats[at]['pts'] += 3
            stats[ht]['lost'] += 1
        else:
            stats[ht]['drawn'] += 1
            stats[ht]['pts'] += 1
            stats[at]['drawn'] += 1
            stats[at]['pts'] += 1

    table = list(stats.values())
    for row in table:
        row['gd'] = row['gf'] - row['ga']

    table.sort(key=lambda x: (x['pts'], x['gd'], x['gf']), reverse=True)

    for rank, row in enumerate(table, 1):
        sid = f"st_{tournament_id}_{row['team_id']}"
        conn.execute(
            "INSERT INTO standings (id, tournament_id, group_name, team_id, team_name, played, won, drawn, lost, goals_for, goals_against, goal_diff, points, rank) VALUES (?, ?, 'Grupo Único', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (sid, tournament_id, row['team_id'], row['team_name'], row['played'], row['won'], row['drawn'], row['lost'], row['gf'], row['ga'], row['gd'], row['pts'], rank)
        )
    conn.commit()


class FootballMasterHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Role, X-User-Id')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))

    def send_error_json(self, message, status=400):
        self.send_json({"ok": False, "error": message}, status=status)

    def parse_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                return json.loads(body)
            except Exception:
                return {}
        return {}

    def log_audit_db(self, conn, user_id, user_name, user_role, action, details):
        aid = f"aud-{int(datetime.now().timestamp()*1000)}"
        now = datetime.now().isoformat()
        client_ip = self.client_address[0] if self.client_address else "127.0.0.1"
        try:
            conn.execute(
                "INSERT INTO audit_log (id, user_id, user_name, user_role, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
                (aid, user_id or "usr-anon", user_name or "Anónimo", user_role or "guest", action, details, client_ip, now)
            )
            conn.commit()
        except Exception as e:
            print(f"Error logging audit: {e}")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        user_role = self.headers.get('X-User-Role', 'guest')
        user_id = self.headers.get('X-User-Id', None)

        if not path.startswith('/api/'):
            return super().do_GET()

        conn = get_db_connection()
        try:
            if path == '/api/health':
                return self.send_json({"status": "ok", "service": "Football Master Pro API", "version": "2.0-FMP"})

            if path == '/api/tournaments':
                org_id = query.get('organizer_id', [None])[0]
                status_filter = query.get('status', [None])[0]
                category_filter = query.get('category', [None])[0]

                query_sql = "SELECT * FROM tournaments WHERE 1=1"
                params = []
                if org_id:
                    query_sql += " AND organizer_id = ?"
                    params.append(org_id)
                if status_filter and status_filter != 'all':
                    query_sql += " AND status = ?"
                    params.append(status_filter)
                if category_filter and category_filter != 'all':
                    query_sql += " AND category = ?"
                    params.append(category_filter)
                query_sql += " ORDER BY created_at DESC"

                cur = conn.cursor()
                cur.execute(query_sql, params)
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": rows})

            if path == '/api/teams':
                coach_id = query.get('coach_id', [None])[0]
                cur = conn.cursor()
                if coach_id:
                    cur.execute("SELECT * FROM teams WHERE coach_id = ? ORDER BY name ASC", (coach_id,))
                else:
                    cur.execute("SELECT * FROM teams ORDER BY name ASC")
                teams = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": teams})

            if path == '/api/venues':
                city = query.get('city', [None])[0]
                dept = query.get('department', [None])[0]
                sql = "SELECT * FROM venues WHERE 1=1"
                params = []
                if city and city != 'all':
                    sql += " AND city = ?"
                    params.append(city)
                if dept and dept != 'all':
                    sql += " AND department = ?"
                    params.append(dept)
                sql += " ORDER BY name ASC"
                cur = conn.cursor()
                cur.execute(sql, params)
                venues = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": venues})

            if path == '/api/users':
                cur = conn.cursor()
                cur.execute("SELECT id, name, email, phone, role, role_title, club_name, created_at FROM users ORDER BY created_at DESC")
                users = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": users})

            if path == '/api/registrations':
                tournament_id = query.get('tournament_id', [None])[0]
                coach_id = query.get('coach_id', [None])[0]
                status_f = query.get('status', [None])[0]

                sql = "SELECT * FROM registrations WHERE 1=1"
                params = []
                if tournament_id:
                    sql += " AND tournament_id = ?"
                    params.append(tournament_id)
                if user_role == 'coach':
                    sql += " AND coach_id = ?"
                    params.append(user_id or coach_id)
                elif coach_id:
                    sql += " AND coach_id = ?"
                    params.append(coach_id)
                if status_f and status_f != 'all':
                    sql += " AND status = ?"
                    params.append(status_f)
                sql += " ORDER BY submitted_at DESC"

                cur = conn.cursor()
                cur.execute(sql, params)
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": rows})

            if path == '/api/players':
                tournament_id = query.get('tournament_id', [None])[0]
                team_id = query.get('team_id', [None])[0]
                sql = "SELECT * FROM players WHERE 1=1"
                params = []
                if tournament_id:
                    sql += " AND tournament_id = ?"
                    params.append(tournament_id)
                if team_id:
                    sql += " AND team_id = ?"
                    params.append(team_id)
                sql += " ORDER BY dorsal ASC"

                cur = conn.cursor()
                cur.execute(sql, params)
                players = []
                is_public = (user_role in ['fan', 'guest'] or not user_id)
                for r in cur.fetchall():
                    p = dict(r)
                    if is_public:
                        p['doc_number'] = mask_doc(p['doc_type'], p['doc_number'])
                        p.pop('guardian_doc', None)
                        p.pop('guardian_name', None)
                    players.append(p)
                return self.send_json({"ok": True, "data": players})

            if path == '/api/matches':
                tournament_id = query.get('tournament_id', [None])[0]
                sql = "SELECT * FROM matches WHERE 1=1"
                params = []
                if tournament_id:
                    sql += " AND tournament_id = ?"
                    params.append(tournament_id)
                sql += " ORDER BY round_number ASC, match_date ASC, match_time ASC"
                cur = conn.cursor()
                cur.execute(sql, params)
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": rows})

            if path == '/api/standings':
                tournament_id = query.get('tournament_id', [None])[0]
                if not tournament_id:
                    return self.send_error_json("Se requiere tournament_id", 400)
                cur = conn.cursor()
                cur.execute("SELECT * FROM standings WHERE tournament_id = ? ORDER BY points DESC, goal_diff DESC, goals_for DESC", (tournament_id,))
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": rows})

            if path == '/api/scorers':
                tournament_id = query.get('tournament_id', [None])[0]
                if not tournament_id:
                    return self.send_error_json("Se requiere tournament_id", 400)
                cur = conn.cursor()
                cur.execute("""
                    SELECT mg.player_name, t.name as team_name, COUNT(mg.id) as goals
                    FROM match_goals mg
                    LEFT JOIN teams t ON mg.team_id = t.id
                    WHERE mg.tournament_id = ?
                    GROUP BY mg.player_name, t.name
                    ORDER BY goals DESC
                """, (tournament_id,))
                rows = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": rows})

            if path == '/api/admin/stats':
                cur = conn.cursor()
                cur.execute("SELECT status, COUNT(*) as cnt FROM tournaments GROUP BY status")
                status_counts = {r['status']: r['cnt'] for r in cur.fetchall()}
                total_tournaments = sum(status_counts.values())

                cur.execute("SELECT COUNT(*) FROM teams")
                total_teams = cur.fetchone()[0]

                cur.execute("SELECT status, COUNT(*) as cnt FROM registrations GROUP BY status")
                reg_counts = {r['status']: r['cnt'] for r in cur.fetchall()}
                total_registrations = sum(reg_counts.values())

                cur.execute("SELECT role, COUNT(*) as cnt FROM users GROUP BY role")
                role_counts = {r['role']: r['cnt'] for r in cur.fetchall()}
                total_users = sum(role_counts.values())

                cur.execute("SELECT status, COUNT(*) as cnt FROM matches GROUP BY status")
                match_counts = {r['status']: r['cnt'] for r in cur.fetchall()}
                total_matches = sum(match_counts.values())
                played_matches = match_counts.get('finished', 0)

                cur.execute("SELECT COALESCE(SUM(home_score + away_score), 0) FROM matches WHERE status = 'finished'")
                total_goals = cur.fetchone()[0]

                pending_regs = reg_counts.get('pendiente_inicial', 0) + reg_counts.get('revision_final', 0)
                cur.execute("SELECT COUNT(*) FROM matches WHERE status = 'finished' AND (home_score IS NULL OR away_score IS NULL)")
                matches_without_scores = cur.fetchone()[0]

                alerts = []
                if pending_regs > 0:
                    alerts.append(f"Tienes {pending_regs} solicitud(es) de clubes pendientes de revisión.")
                if matches_without_scores > 0:
                    alerts.append(f"Hay {matches_without_scores} partido(s) finalizados con inconsistencia de marcador.")

                return self.send_json({
                    "ok": True,
                    "stats": {
                        "tournaments": {
                            "total": total_tournaments,
                            "byStatus": status_counts,
                            "upcoming": status_counts.get('upcoming', 0) + status_counts.get('open_registration', 0),
                            "inProgress": status_counts.get('in_progress', 0),
                            "finished": status_counts.get('finished', 0)
                        },
                        "teams": total_teams,
                        "registrations": {
                            "total": total_registrations,
                            "pending": pending_regs,
                            "accepted": reg_counts.get('habilitado', 0) + reg_counts.get('aprobada_inicial', 0),
                            "rejected": reg_counts.get('rechazada', 0)
                        },
                        "users": {
                            "total": total_users,
                            "byRole": role_counts
                        },
                        "matches": {
                            "total": total_matches,
                            "scheduled": total_matches - played_matches,
                            "played": played_matches
                        },
                        "totalGoals": total_goals,
                        "alerts": alerts
                    }
                })

            if path == '/api/audit':
                cur = conn.cursor()
                cur.execute("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100")
                logs = [dict(r) for r in cur.fetchall()]
                return self.send_json({"ok": True, "data": logs})

            return self.send_error_json("Ruta no encontrada", 404)
        finally:
            conn.close()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.parse_body()
        conn = get_db_connection()

        user_role = self.headers.get('X-User-Role', 'guest')
        user_id = self.headers.get('X-User-Id', None)

        try:
            # 1. Login
            if path == '/api/auth/login':
                email = body.get('email', '').strip().lower()
                password = body.get('password', '').strip()
                cur = conn.cursor()
                cur.execute("SELECT * FROM users WHERE LOWER(email) = ? AND password_hash = ?", (email, password))
                user = cur.fetchone()
                if user:
                    user_dict = dict(user)
                    user_dict.pop('password_hash', None)
                    self.log_audit_db(conn, user_dict['id'], user_dict['name'], user_dict['role'], "INICIO_SESION", f"Inicio de sesión exitoso ({email})")
                    return self.send_json({"ok": True, "user": user_dict})
                return self.send_error_json("Correo o contraseña incorrectos", 401)

            # 2. Registro Público (SEGURIDAD: Bloqueo estricto del rol 'admin')
            if path == '/api/auth/register':
                role = body.get('role', 'fan')
                if role == 'admin':
                    self.log_audit_db(conn, "anonymous", body.get('name', 'Desconocido'), "guest", "INTENTO_ESCALAMIENTO_ROL", f"Intento no autorizado de registrarse como admin con email {body.get('email')}")
                    return self.send_error_json("No está permitido registrarse como Administrador desde el formulario público.", 403)

                uid = f"usr-{int(datetime.now().timestamp()*1000)}"
                now = datetime.now().isoformat()
                role_titles = {
                    "organizer": "Organizador de Torneo",
                    "coach": "Director Técnico / Delegado",
                    "fan": "Aficionado / Visitante"
                }
                role_title = role_titles.get(role, "Aficionado")

                try:
                    conn.execute(
                        "INSERT INTO users (id, name, email, phone, password_hash, role, role_title, club_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
                        (uid, body.get('name'), body.get('email'), body.get('phone'), body.get('password'), role, role_title, body.get('clubName'), now)
                    )
                    conn.commit()
                    self.log_audit_db(conn, uid, body.get('name'), role, "REGISTRO_CUENTA", f"Nueva cuenta registrada ({body.get('email')}, Rol: {role_title})")
                    return self.send_json({"ok": True, "user": {"id": uid, "name": body.get('name'), "email": body.get('email'), "role": role, "roleTitle": role_title}})
                except sqlite3.IntegrityError:
                    return self.send_error_json("Ya existe una cuenta con este correo electrónico.", 409)

            # 3. Crear Torneo (Solo organizador o admin)
            if path == '/api/tournaments':
                if user_role not in ['admin', 'organizer']:
                    return self.send_error_json("No tienes permisos para crear torneos. Se requiere rol Organizador o Administrador.", 403)

                tid = body.get('id') or f"tourney_{int(datetime.now().timestamp()*1000)}"
                now = datetime.now().isoformat()
                t_data = (
                    tid,
                    user_id or "usr-org-1",
                    body.get('organizerName', 'Organizador'),
                    body.get('name', 'Nuevo Torneo'),
                    body.get('description', ''),
                    body.get('sport', 'futbol11'),
                    body.get('format', 'league_single'),
                    body.get('category', 'Libre Masculino'),
                    body.get('status', 'draft'),
                    body.get('startDate'),
                    body.get('endDate'),
                    body.get('regStartDate'),
                    body.get('regEndDate'),
                    int(body.get('maxTeams', 8)),
                    json.dumps(body.get('playDays', [])),
                    json.dumps(body.get('timeSlots', [])),
                    json.dumps(body.get('venues', [])),
                    json.dumps(body.get('rules', {})),
                    json.dumps(body.get('pointsConfig', {})),
                    now,
                    now
                )
                conn.execute("INSERT OR REPLACE INTO tournaments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", t_data)
                conn.commit()
                self.log_audit_db(conn, user_id, body.get('organizerName', 'Organizador'), user_role, "CREAR_TORNEO", f"Creó el torneo '{body.get('name')}' (ID: {tid})")
                return self.send_json({"ok": True, "id": tid})

            # 4. Solicitud de Inscripción por Director Técnico (Fase 5)
            if path == '/api/registrations/apply':
                if user_role not in ['coach', 'admin']:
                    return self.send_error_json("Solo los Directores Técnicos o Administradores pueden inscribir equipos.", 403)

                tournament_id = body.get('tournamentId')
                team_id = body.get('teamId')
                team_name = body.get('teamName')

                cur = conn.cursor()
                cur.execute("SELECT * FROM tournaments WHERE id = ?", (tournament_id,))
                tourney = cur.fetchone()
                if not tourney:
                    return self.send_error_json("Torneo no encontrado.", 404)

                # Regla 1: Estado del torneo debe ser open_registration
                if tourney['status'] != 'open_registration':
                    return self.send_error_json(f"El torneo no acepta inscripciones (Estado actual: {tourney['status']}). Solo permitido en 'open_registration'.", 400)

                # Regla 2: Fechas de inscripción
                today = datetime.now().strftime('%Y-%m-%d')
                if tourney['reg_start_date'] and tourney['reg_end_date']:
                    if today < tourney['reg_start_date'] or today > tourney['reg_end_date']:
                        return self.send_error_json(f"Periodo de inscripción cerrado. Disponible entre {tourney['reg_start_date']} y {tourney['reg_end_date']}.", 400)

                # Regla 3: Cupos disponibles
                cur.execute("SELECT COUNT(*) FROM registrations WHERE tournament_id = ? AND status IN ('aprobada_inicial', 'habilitado')", (tournament_id,))
                approved_count = cur.fetchone()[0]
                if approved_count >= tourney['max_teams']:
                    return self.send_error_json(f"No hay cupos disponibles. El torneo ha alcanzado su límite de {tourney['max_teams']} equipos.", 400)

                # Regla 4: Evitar duplicado de solicitud activa
                cur.execute("SELECT * FROM registrations WHERE tournament_id = ? AND (team_id = ? OR LOWER(team_name) = LOWER(?)) AND status NOT IN ('rechazada', 'cancelada')", (tournament_id, team_id, team_name))
                if cur.fetchone():
                    return self.send_error_json("Ya existe una postulación activa para este equipo en este torneo.", 409)

                reg_id = f"reg-{int(datetime.now().timestamp()*1000)}"
                now = datetime.now().isoformat()
                conn.execute("""
                    INSERT INTO registrations (id, tournament_id, tournament_name, team_id, team_name, city, color, shield_svg, coach_id, coach_name, coach_doc, coach_phone, coach_email, status, feedback_reason, pdf_attached, submitted_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente_inicial', '', 0, ?);
                """, (
                    reg_id,
                    tournament_id,
                    tourney['name'],
                    team_id,
                    team_name,
                    body.get('city', 'Bogotá D.C.'),
                    body.get('color', '#059669'),
                    body.get('shieldSvg', ''),
                    user_id or "usr-dt-1",
                    body.get('coachName', 'Director Técnico'),
                    body.get('coachDoc', '79845123'),
                    body.get('coachPhone', '+57 3001234567'),
                    body.get('coachEmail', 'coach@futbolmaster.co'),
                    now
                ))
                conn.commit()

                self.log_audit_db(conn, user_id, body.get('coachName', 'DT'), user_role, "POSTULACION_TORNEO", f"Postuló al equipo '{team_name}' al torneo '{tourney['name']}' (ID: {reg_id})")
                return self.send_json({"ok": True, "registrationId": reg_id, "message": "Postulación enviada exitosamente"})

            # 5. Cambio de Estado de Solicitud (Aprobación/Rechazo/Cancelación - Fase 5)
            if path == '/api/registrations/status':
                reg_id = body.get('registrationId')
                new_status = body.get('status')
                reason = body.get('reason', '')

                cur = conn.cursor()
                cur.execute("SELECT r.*, t.organizer_id FROM registrations r JOIN tournaments t ON r.tournament_id = t.id WHERE r.id = ?", (reg_id,))
                reg = cur.fetchone()
                if not reg:
                    return self.send_error_json("Solicitud de inscripción no encontrada.", 404)

                # SEGURIDAD CRÍTICA:
                # El DT solo puede CANCELAR su propia postulación pendiente.
                # NUNCA puede auto-aprobarse ni aprobar solicitudes ajenas.
                if user_role == 'coach':
                    if new_status in ['aprobada_inicial', 'habilitado', 'rechazada']:
                        self.log_audit_db(conn, user_id, "Técnico", user_role, "INTENTO_AUTO_APROBACION_DENEGADO", f"Técnico intentó auto-aprobar o dictaminar solicitud {reg_id} con estado {new_status}")
                        return self.send_error_json("Acceso denegado: Un Director Técnico no tiene facultades para aprobar o dictaminar solicitudes.", 403)
                    if new_status != 'cancelada':
                        return self.send_error_json("El técnico únicamente puede cancelar su propia postulación.", 403)

                # Si es organizador, validar que sea propietario del torneo
                if user_role == 'organizer' and reg['organizer_id'] != user_id:
                    self.log_audit_db(conn, user_id, "Organizador", user_role, "SEGURIDAD_ACCESO_DENEGADO", f"Intento no autorizado de dictaminar solicitud {reg_id} en torneo ajeno")
                    return self.send_error_json("Acceso denegado: No eres el organizador propietario de este torneo.", 403)

                now = datetime.now().isoformat()
                conn.execute(
                    "UPDATE registrations SET status = ?, feedback_reason = ?, reviewed_at = ?, reviewed_by = ? WHERE id = ?",
                    (new_status, reason, now, user_id, reg_id)
                )

                # Si se habilita definitivamente, vincular a tournament_teams
                if new_status == 'habilitado':
                    tt_id = f"tt_{reg['tournament_id']}_{reg['team_id'] or reg_id}"
                    conn.execute(
                        "INSERT OR IGNORE INTO tournament_teams (id, tournament_id, team_id, group_name, joined_at) VALUES (?, ?, ?, 'Grupo Único', ?)",
                        (tt_id, reg['tournament_id'], reg['team_id'] or reg_id, now)
                    )

                conn.commit()
                self.log_audit_db(conn, user_id, "Dictaminador", user_role, "REVISION_SOLICITUD", f"Solicitud {reg_id} ({reg['team_name']}) actualizada a '{new_status}'. Observación: {reason}")
                return self.send_json({"ok": True, "message": f"Solicitud actualizada a {new_status}"})

            # 6. Registro de Jugador en Plantilla (Fase 5)
            if path == '/api/players/register':
                if user_role not in ['coach', 'organizer', 'admin']:
                    return self.send_error_json("No tienes permisos para inscribir jugadores.", 403)

                team_id = body.get('teamId')
                tournament_id = body.get('tournamentId')
                name = (body.get('name') or '').strip()
                doc_type = body.get('docType', 'CC')
                doc_number = str(body.get('docNumber') or '').strip()
                dorsal = int(body.get('dorsal', 0))
                position = body.get('position', 'Mediocampista')
                eps = body.get('eps', 'Sura EPS')

                if not name or not doc_number or dorsal < 1 or dorsal > 99:
                    return self.send_error_json("Datos del jugador incompletos o número dorsal inválido (1-99).", 400)

                cur = conn.cursor()
                # Regla de duplicado 1: Número de documento único en el torneo
                if tournament_id:
                    cur.execute("SELECT id, name FROM players WHERE tournament_id = ? AND doc_number = ?", (tournament_id, doc_number))
                    dup_doc = cur.fetchone()
                    if dup_doc:
                        return self.send_error_json(f"Violación de integridad: El documento {doc_type} {mask_doc(doc_type, doc_number)} ya está registrado en el torneo a nombre de {dup_doc['name']}.", 409)

                # Regla de duplicado 2: Número dorsal único dentro del equipo
                cur.execute("SELECT id, name FROM players WHERE team_id = ? AND dorsal = ?", (team_id, dorsal))
                dup_dorsal = cur.fetchone()
                if dup_dorsal:
                    return self.send_error_json(f"El dorsal {dorsal} ya está asignado a {dup_dorsal['name']} en este club.", 409)

                pid = f"ply-{int(datetime.now().timestamp()*1000)}"
                now = datetime.now().isoformat()
                conn.execute("""
                    INSERT INTO players (id, team_id, tournament_id, registration_id, name, doc_type, doc_number, birth_date, age, dorsal, position, eps, guardian_name, guardian_doc, enabled, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?);
                """, (
                    pid, team_id, tournament_id, body.get('registrationId'), name, doc_type, doc_number,
                    body.get('birthDate'), body.get('age', 25), dorsal, position, eps,
                    body.get('guardianName'), body.get('guardianDoc'), now
                ))
                conn.commit()

                self.log_audit_db(conn, user_id, "Delegado", user_role, "REGISTRO_JUGADOR", f"Inscribió a {name} (Dorsal {dorsal}, {doc_type} {mask_doc(doc_type, doc_number)}) en equipo {team_id}")
                return self.send_json({"ok": True, "playerId": pid, "message": "Jugador inscrito en la plantilla oficial"})

            # 7. Registrar Resultado Oficial y Goleadores con Integridad (Fase 6)
            if path == '/api/matches/score':
                match_id = body.get('matchId')
                home_score = int(body.get('homeScore', 0))
                away_score = int(body.get('awayScore', 0))
                scorers = body.get('scorers', [])

                cur = conn.cursor()
                cur.execute("SELECT m.*, t.organizer_id FROM matches m JOIN tournaments t ON m.tournament_id = t.id WHERE m.id = ?", (match_id,))
                match = cur.fetchone()
                if not match:
                    return self.send_error_json("Partido no encontrado.", 404)

                # Validación de propiedad
                if user_role != 'admin' and match['organizer_id'] != user_id:
                    self.log_audit_db(conn, user_id, "Desconocido", user_role, "SEGURIDAD_ACCESO_DENEGADO", f"Intento no autorizado de asentar marcador en partido {match_id}")
                    return self.send_error_json("No tienes permisos para registrar marcadores en este torneo.", 403)

                # Validación de integridad de goleadores:
                # Suma de goles de cada equipo debe ser exactamente igual al score
                home_goals_sum = 0
                away_goals_sum = 0
                for s in scorers:
                    g_team = s.get('teamId')
                    g_count = int(s.get('goals', 1))
                    if g_team == match['home_team_id']:
                        home_goals_sum += g_count
                    elif g_team == match['away_team_id']:
                        away_goals_sum += g_count
                    else:
                        return self.send_error_json(f"El anotador {s.get('playerName')} no pertenece a ninguno de los dos equipos participantes.", 400)

                if scorers and (home_goals_sum != home_score or away_goals_sum != away_score):
                    return self.send_error_json(
                        f"Inconsistencia en planilla: Los goles asignados (Local: {home_goals_sum}, Visitante: {away_goals_sum}) "
                        f"no coinciden con el marcador final ({home_score} - {away_score}).", 400
                    )

                now = datetime.now().isoformat()
                conn.execute(
                    "UPDATE matches SET home_score = ?, away_score = ?, status = 'finished', review_status = 'verified', updated_at = ?, updated_by = ? WHERE id = ?",
                    (home_score, away_score, now, user_id, match_id)
                )

                # Guardar goles en match_goals
                conn.execute("DELETE FROM match_goals WHERE match_id = ?", (match_id,))
                for s in scorers:
                    g_count = int(s.get('goals', 1))
                    for i in range(g_count):
                        gid = f"goal_{match_id}_{uuid.uuid4().hex[:12]}"
                        conn.execute(
                            "INSERT INTO match_goals (id, match_id, tournament_id, team_id, player_id, player_name, minute, is_own_goal, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
                            (gid, match_id, match['tournament_id'], s.get('teamId'), s.get('playerId'), s.get('playerName'), s.get('minute', 45), now)
                        )

                # Recalcular posiciones de manera determinística sin duplicar
                recalculate_standings(conn, match['tournament_id'])

                self.log_audit_db(conn, user_id, "Organizador", user_role, "REGISTRO_RESULTADO_OFICIAL", f"Asentó resultado final: {match['home_team_name']} {home_score} - {away_score} {match['away_team_name']}")
                return self.send_json({"ok": True, "message": "Resultado y goleadores guardados, tabla recalculada exitosamente"})

            # 8. Carga y Extracción de Acta Oficial (Fase 6)
            if path == '/api/matches/upload-acta':
                match_id = body.get('matchId')
                file_name = body.get('fileName', '')
                file_size = int(body.get('fileSize', 0))

                # Validación de formato: PDF o Imágenes
                ext = os.path.splitext(file_name)[1].lower()
                if ext not in ['.pdf', '.png', '.jpg', '.jpeg']:
                    return self.send_error_json("Formato no permitido. Solo se aceptan actas en formato PDF o imágenes (PNG, JPG, JPEG).", 400)

                # Validación de tamaño: Máximo 10MB (10 * 1024 * 1024 = 10485760 bytes)
                if file_size > 10485760:
                    return self.send_error_json("El archivo supera el tamaño máximo permitido de 10MB.", 400)

                cur = conn.cursor()
                cur.execute("SELECT * FROM matches WHERE id = ?", (match_id,))
                match = cur.fetchone()
                if not match:
                    return self.send_error_json("Partido no encontrado.", 404)

                now = datetime.now().isoformat()
                doc_path = f"/uploads/actas/{file_name}"

                # Mock OCR extractor de datos del acta: devuelve pre-revisión sin asentar directamente
                extracted = {
                    "matchId": match_id,
                    "fileName": file_name,
                    "homeTeam": match['home_team_name'],
                    "awayTeam": match['away_team_name'],
                    "extractedHomeScore": body.get('mockHomeScore', 2),
                    "extractedAwayScore": body.get('mockAwayScore', 1),
                    "extractedScorers": [
                        {"playerName": "Delantero Estrella", "minute": 23, "goals": 1, "teamId": match['home_team_id']},
                        {"playerName": "Volante 10", "minute": 67, "goals": 1, "teamId": match['home_team_id']},
                        {"playerName": "Capitán Visitante", "minute": 80, "goals": 1, "teamId": match['away_team_id']}
                    ],
                    "status": "pending_review"
                }

                conn.execute(
                    "UPDATE matches SET support_doc_name = ?, support_doc_path = ?, review_status = 'pending_review', updated_at = ? WHERE id = ?",
                    (file_name, doc_path, now, match_id)
                )
                conn.commit()

                self.log_audit_db(conn, user_id, "Mesa de Control", user_role, "CARGA_ACTA_PARTIDO", f"Cargó acta oficial '{file_name}' ({file_size} bytes) para partido {match_id}. Estado: pending_review")
                return self.send_json({"ok": True, "extracted": extracted, "reviewStatus": "pending_review"})

            # 9. Corrección Auditada de Marcador (Admin o Propietario)
            if path == '/api/matches/correct-score':
                match_id = body.get('matchId')
                home_score = int(body.get('homeScore', 0))
                away_score = int(body.get('awayScore', 0))
                reason = body.get('reason', 'Corrección administrativa')

                cur = conn.cursor()
                cur.execute("SELECT m.*, t.organizer_id FROM matches m JOIN tournaments t ON m.tournament_id = t.id WHERE m.id = ?", (match_id,))
                match = cur.fetchone()
                if not match:
                    return self.send_error_json("Partido no encontrado", 404)

                if user_role != 'admin' and match['organizer_id'] != user_id:
                    self.log_audit_db(conn, user_id, "Desconocido", user_role, "SEGURIDAD_ACCESO_DENEGADO", f"Intento no autorizado de corregir partido {match_id}")
                    return self.send_error_json("No tienes permisos para modificar este partido.", 403)

                now = datetime.now().isoformat()
                old_score = f"{match['home_score']} - {match['away_score']}"
                new_score = f"{home_score} - {away_score}"

                conn.execute(
                    "UPDATE matches SET home_score = ?, away_score = ?, status = 'finished', observations = ?, updated_at = ?, updated_by = ? WHERE id = ?",
                    (home_score, away_score, f"{match['observations'] or ''} [CORREGIDO: {reason}]", now, user_id, match_id)
                )

                # Recalcular determinísticamente
                recalculate_standings(conn, match['tournament_id'])

                self.log_audit_db(
                    conn, user_id, body.get('userName', 'Admin'), user_role,
                    "CORRECCION_MARCADOR_AUDITADA",
                    f"Partido {match['home_team_name']} vs {match['away_team_name']} corregido de ({old_score}) a ({new_score}). Motivo: {reason}"
                )
                return self.send_json({"ok": True, "message": "Marcador corregido y auditado exitosamente, tabla recalculada"})

            return self.send_error_json("Endpoint no reconocido", 404)
        finally:
            conn.close()

def run_server():
    if not os.path.exists(DB_FILE):
        print("[*] Base de datos no detectada. Inicializando tablas y datos semilla...")
        try:
            import db_manager
            db_manager.init_db()
        except Exception as e:
            print(f"[!] Error inicializando BD: {e}")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), FootballMasterHandler) as httpd:
        print(f"Football Master Pro Backend Server running on port {PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Server stopped.")

if __name__ == "__main__":
    run_server()
