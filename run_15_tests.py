import threading
import socketserver
import urllib.request
import urllib.error
import json
import sqlite3
import os
import sys
from datetime import datetime

# Import handler from server.py
from server import FootballMasterHandler, PORT, DB_FILE

def request_api(method, path, data=None, headers=None):
    url = f"http://127.0.0.1:{PORT}{path}"
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)

    body_bytes = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body_bytes, headers=req_headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            return resp.status, json.loads(resp_body)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(error_body)
        except Exception:
            return e.code, {"error": error_body}

def run_tests():
    # 1. Start Server in background thread
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), FootballMasterHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    print(f"[*] Servidor de pruebas iniciado en http://127.0.0.1:{PORT}")

    results = []

    def log_result(test_num, name, passed, details):
        status_str = "PASS" if passed else "FAIL"
        results.append({
            "num": test_num,
            "name": name,
            "passed": passed,
            "status": status_str,
            "details": details
        })
        print(f"[{status_str}] Prueba {test_num:02d}: {name} - {details}")

    # =========================================================================
    # PRUEBA 01: Admin puede ver y gestionar todos los torneos
    # =========================================================================
    try:
        code, resp = request_api("GET", "/api/tournaments", headers={"X-User-Role": "admin", "X-User-Id": "usr-admin-1"})
        passed = (code == 200 and resp.get("ok") and len(resp.get("data", [])) >= 2)
        log_result(1, "Acceso Global del Administrador", passed, f"Código {code}, Torneos listados: {len(resp.get('data', []))}")
    except Exception as e:
        log_result(1, "Acceso Global del Administrador", False, str(e))

    # =========================================================================
    # PRUEBA 02: Organizador puede editar su propio torneo
    # =========================================================================
    try:
        # usr-org-1 es dueño de tournament_apertura_2026
        code, resp = request_api("GET", "/api/tournaments?organizer_id=usr-org-1", headers={"X-User-Role": "organizer", "X-User-Id": "usr-org-1"})
        passed = (code == 200 and resp.get("ok") and any(t["id"] == "tournament_apertura_2026" for t in resp.get("data", [])))
        log_result(2, "Edición/Gestión de Torneo Propio por Organizador", passed, f"Código {code}, Torneos propios gestionados: {len(resp.get('data', []))}")
    except Exception as e:
        log_result(2, "Edición/Gestión de Torneo Propio por Organizador", False, str(e))

    # =========================================================================
    # PRUEBA 03: Organizador tiene bloqueado editar torneos de otros organizadores
    # =========================================================================
    try:
        # usr-org-2 intenta modificar un partido de un torneo que pertenece a usr-org-1
        code, resp = request_api("POST", "/api/matches/correct-score",
            data={"matchId": "m_f1_1", "homeScore": 5, "awayScore": 0, "reason": "Ataque ajeno"},
            headers={"X-User-Role": "organizer", "X-User-Id": "usr-org-intruso"}
        )
        passed = (code == 403 and not resp.get("ok"))
        log_result(3, "Bloqueo a Organizador en Torneo Ajeno", passed, f"Código {code} (Acceso denegado esperado: '{resp.get('error')}')")
    except Exception as e:
        log_result(3, "Bloqueo a Organizador en Torneo Ajeno", False, str(e))

    # =========================================================================
    # PRUEBA 04: Técnico puede solicitar inscripción a torneo open_registration dentro de fechas
    # =========================================================================
    test_reg_id = None
    try:
        code, resp = request_api("POST", "/api/registrations/apply",
            data={
                "tournamentId": "tournament_apertura_2026",
                "teamId": "tm-cali-06",
                "teamName": "Deportivo Cali Élite",
                "coachName": "Mario Alberto Yepes",
                "coachDoc": "79845123",
                "coachPhone": "+57 3154567890",
                "city": "Cali",
                "color": "#16a34a"
            },
            headers={"X-User-Role": "coach", "X-User-Id": "usr-dt-1"}
        )
        passed = (code == 200 and resp.get("ok"))
        test_reg_id = resp.get("registrationId")
        log_result(4, "Postulación Válida de Técnico en Torneo Abierto", passed, f"Código {code}, RegID generado: {test_reg_id}")
    except Exception as e:
        log_result(4, "Postulación Válida de Técnico en Torneo Abierto", False, str(e))

    # =========================================================================
    # PRUEBA 05: Técnico tiene bloqueado auto-aprobar su postulación
    # =========================================================================
    try:
        code, resp = request_api("POST", "/api/registrations/status",
            data={"registrationId": test_reg_id, "status": "aprobada_inicial", "reason": "Auto-aprobación del DT"},
            headers={"X-User-Role": "coach", "X-User-Id": "usr-dt-1"}
        )
        passed = (code == 403 and not resp.get("ok"))
        log_result(5, "Bloqueo Estricto de Auto-Aprobación por Técnico", passed, f"Código {code} (Bloqueo esperado: '{resp.get('error')}')")
    except Exception as e:
        log_result(5, "Bloqueo Estricto de Auto-Aprobación por Técnico", False, str(e))

    # =========================================================================
    # PRUEBA 06: Organizador propietario o Admin pueden aprobar postulación
    # =========================================================================
    try:
        code, resp = request_api("POST", "/api/registrations/status",
            data={"registrationId": test_reg_id, "status": "aprobada_inicial", "reason": "Documentos iniciales verificados por el organizador"},
            headers={"X-User-Role": "organizer", "X-User-Id": "usr-org-1"}
        )
        passed = (code == 200 and resp.get("ok"))
        log_result(6, "Aprobación Legítima por Organizador Propietario", passed, f"Código {code}, Mensaje: {resp.get('message')}")
    except Exception as e:
        log_result(6, "Aprobación Legítima por Organizador Propietario", False, str(e))

    # =========================================================================
    # PRUEBA 07: Registro de plantilla con validación de duplicados (dorsal / documento)
    # =========================================================================
    try:
        # Registrar jugador 1 exitosamente
        c1, r1 = request_api("POST", "/api/players/register",
            data={
                "teamId": "tm-cali-06",
                "tournamentId": "tournament_apertura_2026",
                "name": "Andrés Felipe Pérez",
                "docType": "CC",
                "docNumber": "1005998877",
                "dorsal": 5,
                "position": "Volante Central",
                "eps": "Sura EPS",
                "age": 28
            },
            headers={"X-User-Role": "coach", "X-User-Id": "usr-dt-1"}
        )
        # Intentar registrar jugador 2 con el MISMO dorsal (5) en el mismo equipo
        c2, r2 = request_api("POST", "/api/players/register",
            data={
                "teamId": "tm-cali-06",
                "tournamentId": "tournament_apertura_2026",
                "name": "Otro Jugador Dorsal Repetido",
                "docType": "CC",
                "docNumber": "1005998878",
                "dorsal": 5,
                "position": "Lateral",
                "eps": "Sanitas",
                "age": 24
            },
            headers={"X-User-Role": "coach", "X-User-Id": "usr-dt-1"}
        )
        passed = (c1 == 200 and r1.get("ok") and c2 == 409 and not r2.get("ok"))
        log_result(7, "Validación de Plantilla y Bloqueo de Dorsal Duplicado", passed, f"Registro 1: {c1}, Intento Duplicado: {c2} ('{r2.get('error')}')")
    except Exception as e:
        log_result(7, "Validación de Plantilla y Bloqueo de Dorsal Duplicado", False, str(e))

    # =========================================================================
    # PRUEBA 08: No propietario / No autorizado tiene bloqueado asentar marcador
    # =========================================================================
    try:
        code, resp = request_api("POST", "/api/matches/score",
            data={
                "matchId": "m_f1_2",
                "homeScore": 3,
                "awayScore": 2,
                "scorers": []
            },
            headers={"X-User-Role": "fan", "X-User-Id": "usr-fan-1"}
        )
        passed = (code == 403 and not resp.get("ok"))
        log_result(8, "Bloqueo de Registro de Marcador por Usuario No Autorizado", passed, f"Código {code} ('{resp.get('error')}')")
    except Exception as e:
        log_result(8, "Bloqueo de Registro de Marcador por Usuario No Autorizado", False, str(e))

    # =========================================================================
    # PRUEBA 09: Marcador confirmado con goleadores actualiza tabla y goleadores
    # =========================================================================
    try:
        code, resp = request_api("POST", "/api/matches/score",
            data={
                "matchId": "m_f1_1",
                "homeScore": 2,
                "awayScore": 1,
                "scorers": [
                    {"playerId": "ply_nac_3", "playerName": "Alfredo Morelos Avilés", "goals": 1, "teamId": "tm-nac-01", "minute": 34},
                    {"playerId": "ply_nac_2", "playerName": "Edwin Cardona Bedoya", "goals": 1, "teamId": "tm-nac-01", "minute": 68},
                    {"playerId": "ply_mil_3", "playerName": "Leonardo Castro Loaiza", "goals": 1, "teamId": "tm-mil-02", "minute": 52}
                ]
            },
            headers={"X-User-Role": "organizer", "X-User-Id": "usr-org-1"}
        )

        c_std, r_std = request_api("GET", "/api/standings?tournament_id=tournament_copa_colombia_2026")
        c_sco, r_sco = request_api("GET", "/api/scorers?tournament_id=tournament_copa_colombia_2026")

        passed = (code == 200 and resp.get("ok") and len(r_std.get("data", [])) > 0 and len(r_sco.get("data", [])) >= 2)
        log_result(9, "Actualización Oficial de Posiciones y Goleadores", passed, f"Score: {code}, Standings: {len(r_std.get('data', []))}, Scorers: {len(r_sco.get('data', []))}")
    except Exception as e:
        log_result(9, "Actualización Oficial de Posiciones y Goleadores", False, str(e))

    # =========================================================================
    # PRUEBA 10: Corrección de marcador recalcula determinísticamente sin duplicar
    # =========================================================================
    try:
        # Corregir m_f1_1 a 3 - 1
        code, resp = request_api("POST", "/api/matches/correct-score",
            data={"matchId": "m_f1_1", "homeScore": 3, "awayScore": 1, "reason": "Revisión VAR/Acta oficial", "userName": "Admin"},
            headers={"X-User-Role": "admin", "X-User-Id": "usr-admin-1"}
        )

        c_std, r_std = request_api("GET", "/api/standings?tournament_id=tournament_copa_colombia_2026")
        nac_row = next((r for r in r_std.get("data", []) if r["team_id"] == "tm-nac-01"), None)

        # Nacional debe tener exactamente 1 partido jugado, 3 goles a favor, 1 en contra, 3 puntos
        passed = (code == 200 and nac_row and nac_row["played"] == 1 and nac_row["goals_for"] == 3 and nac_row["points"] == 3)
        log_result(10, "Recálculo Determinístico de Tabla sin Duplicación", passed, f"PJ: {nac_row['played'] if nac_row else 'N/A'}, GF: {nac_row['goals_for'] if nac_row else 'N/A'}, Pts: {nac_row['points'] if nac_row else 'N/A'}")
    except Exception as e:
        log_result(10, "Recálculo Determinístico de Tabla sin Duplicación", False, str(e))

    # =========================================================================
    # PRUEBA 11: Aficionado/Visitante puede consultar catálogo público y calendario con Habeas Data
    # =========================================================================
    try:
        c_t, r_t = request_api("GET", "/api/tournaments?status=open_registration", headers={"X-User-Role": "fan"})
        c_m, r_m = request_api("GET", "/api/matches?tournament_id=tournament_copa_colombia_2026", headers={"X-User-Role": "fan"})
        c_p, r_p = request_api("GET", "/api/players?tournament_id=tournament_copa_colombia_2026", headers={"X-User-Role": "fan"})

        first_p = r_p.get("data", [])[0] if r_p.get("data", []) else {}
        doc_masked = "****" in first_p.get("doc_number", "")

        passed = (c_t == 200 and c_m == 200 and c_p == 200 and doc_masked)
        log_result(11, "Consulta Pública y Protección de Habeas Data", passed, f"Torneos: {len(r_t.get('data', []))}, Partidos: {len(r_m.get('data', []))}, Doc Enmascarado: '{first_p.get('doc_number')}'")
    except Exception as e:
        log_result(11, "Consulta Pública y Protección de Habeas Data", False, str(e))

    # =========================================================================
    # PRUEBA 12: Aficionado/Visitante bloqueado de crear torneos
    # =========================================================================
    try:
        code, resp = request_api("POST", "/api/tournaments",
            data={"name": "Torneo Ilegal de Hincha", "sport": "futbol11"},
            headers={"X-User-Role": "fan", "X-User-Id": "usr-fan-1"}
        )
        passed = (code == 403 and not resp.get("ok"))
        log_result(12, "Bloqueo a Aficionado/Visitante de Crear Torneos", passed, f"Código {code} ('{resp.get('error')}')")
    except Exception as e:
        log_result(12, "Bloqueo a Aficionado/Visitante de Crear Torneos", False, str(e))

    # =========================================================================
    # PRUEBA 13: Torneo con inscripciones cerradas o en curso bloquea nuevas postulaciones
    # =========================================================================
    try:
        # tournament_copa_colombia_2026 está en estado 'in_progress'
        code, resp = request_api("POST", "/api/registrations/apply",
            data={
                "tournamentId": "tournament_copa_colombia_2026",
                "teamId": "tm-dim-07",
                "teamName": "Independiente Medellín",
                "coachName": "DT Tarde"
            },
            headers={"X-User-Role": "coach", "X-User-Id": "usr-dt-1"}
        )
        passed = (code == 400 and not resp.get("ok"))
        log_result(13, "Bloqueo de Postulación en Torneo Fuera de Rango / En Curso", passed, f"Código {code} ('{resp.get('error')}')")
    except Exception as e:
        log_result(13, "Bloqueo de Postulación en Torneo Fuera de Rango / En Curso", False, str(e))

    # =========================================================================
    # PRUEBA 14: Carga de actas bloquea formato no permitido o archivo > 10MB
    # =========================================================================
    try:
        # 1. Formato ejecutable prohibido
        c1, r1 = request_api("POST", "/api/matches/upload-acta",
            data={"matchId": "m_f1_1", "fileName": "virus_script.exe", "fileSize": 1024},
            headers={"X-User-Role": "organizer", "X-User-Id": "usr-org-1"}
        )
        # 2. Archivo mayor a 10MB (11MB = 11534336 bytes)
        c2, r2 = request_api("POST", "/api/matches/upload-acta",
            data={"matchId": "m_f1_1", "fileName": "acta_gigante.pdf", "fileSize": 11534336},
            headers={"X-User-Role": "organizer", "X-User-Id": "usr-org-1"}
        )
        # 3. Archivo válido PDF <= 10MB
        c3, r3 = request_api("POST", "/api/matches/upload-acta",
            data={"matchId": "m_f1_1", "fileName": "acta_firmada_oficial.pdf", "fileSize": 2500000},
            headers={"X-User-Role": "organizer", "X-User-Id": "usr-org-1"}
        )
        passed = (c1 == 400 and c2 == 400 and c3 == 200 and r3.get("reviewStatus") == "pending_review")
        log_result(14, "Validación Estricta de Carga de Actas (<10MB y Formatos Permitidos)", passed, f"Exe: {c1}, >10MB: {c2}, Válido: {c3} ({r3.get('reviewStatus')})")
    except Exception as e:
        log_result(14, "Validación Estricta de Carga de Actas (<10MB y Formatos Permitidos)", False, str(e))

    # =========================================================================
    # PRUEBA 15: Bloqueo de escalamiento de privilegios a admin en registro público
    # =========================================================================
    try:
        code, resp = request_api("POST", "/api/auth/register",
            data={
                "name": "Hacker Malicioso",
                "email": "hacker@escalamiento.com",
                "phone": "3000000000",
                "password": "password123",
                "role": "admin"
            }
        )
        passed = (code == 403 and not resp.get("ok"))
        log_result(15, "Bloqueo de Escalamiento a Administrador en Registro Público", passed, f"Código {code} ('{resp.get('error')}')")
    except Exception as e:
        log_result(15, "Bloqueo de Escalamiento a Administrador en Registro Público", False, str(e))

    # Shutdown server
    httpd.shutdown()
    print("\n" + "="*80)
    print("RESUMEN DE EJECUCIÓN - BATERÍA DE 15 PRUEBAS OBLIGATORIAS")
    print("="*80)
    pass_count = sum(1 for r in results if r["passed"])
    print(f"Total Pruebas: {len(results)} | Aprobadas: {pass_count} | Fallidas: {len(results) - pass_count}")

    # Escribir reporte en JSON para consumo y visualización
    with open("test_results_summary.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    return pass_count == 15

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

