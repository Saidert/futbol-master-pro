// Archivo: components/ui/neural-access-login.tsx
// Rediseño visual "MercuryLogin" (NEURAL ACCESS) con física líquida, efecto gooey y parallax
// REGLA DE ORO: Mantiene intacta toda la lógica funcional del login de Football Master Pro Colombia

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  roleTitle?: string;
  activeTournamentId?: string | null;
  loggedIn: boolean;
  token?: string;
  ip?: string;
}

export interface MercuryLoginProps {
  onSuccess?: (session: UserSession) => void;
  onCancel?: () => void;
  defaultRole?: 'organizer' | 'coach' | 'fan';
  className?: string;
}

export const MercuryLogin: React.FC<MercuryLoginProps> = ({
  onSuccess,
  onCancel,
  defaultRole = 'organizer',
  className
}) => {
  // ---------------------------------------------------------------------------
  // 1. ESTADOS FUNCIONALES DEL LOGIN Y REGISTRO (100% INTACTOS)
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [identity, setIdentity] = useState('boadasaidert466@gmail.com');
  const [password, setPassword] = useState('123Sai');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'organizer' | 'coach' | 'fan'>(defaultRole);

  // Campos para Registro (Ley 1581 Habeas Data)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [habeasDataAccepted, setHabeasDataAccepted] = useState(true);

  // Estados de interfaz y feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 2. FÍSICA LÍQUIDA Y PARALLAX DE MERCURIO (MercuryLogin Neural Access)
  // ---------------------------------------------------------------------------
  const blobsData = useMemo(() => {
    return Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 200 + 150,
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      animationDelay: Math.random() * -20,
      animationDuration: Math.random() * 15 + 15,
    }));
  }, []);

  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      // Parallax reactivo con las coordenadas del cursor sobre los blobs de mercurio
      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const speed = (index + 1) * 22;
          blob.style.marginLeft = `${x * speed}px`;
          blob.style.marginTop = `${y * speed}px`;
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ---------------------------------------------------------------------------
  // 3. LÓGICA DE NEGOCIO, AUTENTICACIÓN Y SESIONES (REGLA DE ORO)
  // ---------------------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const cleanInput = identity.trim().toLowerCase();
    const cleanPass = password;

    try {
      // A. Credenciales Maestras del Administrador General (Fase 1 / 2)
      if (cleanInput === 'boadasaidert466@gmail.com' && cleanPass === '123Sai') {
        const adminSession: UserSession = {
          userId: 'usr-admin-1',
          name: 'Saider Boadas',
          email: 'boadasaidert466@gmail.com',
          phone: '+57 310 445 8899',
          role: 'admin',
          roleTitle: 'Administrador General',
          activeTournamentId: null,
          loggedIn: true,
          token: 'jwt_admin_master_session_token_2026',
          ip: '190.158.42.110'
        };

        // Guardado persistente
        localStorage.setItem('fmp_user_session', JSON.stringify(adminSession));
        sessionStorage.setItem('fmp_token', adminSession.token || '');

        if (typeof (window as any).saveUserSession === 'function') {
          (window as any).saveUserSession(adminSession);
        }
        if (typeof (window as any).logAudit === 'function') {
          (window as any).logAudit('INICIO_SESION_ADMIN', `Administrador General autenticado (${adminSession.email})`);
        }

        window.dispatchEvent(new CustomEvent('fmp:auth-change', { detail: adminSession }));

        setSuccessMsg('¡ACCESO AUTORIZADO // NODO ADMINISTRADOR GENERAL!');
        setTimeout(() => {
          setIsLoading(false);
          if (onSuccess) onSuccess(adminSession);
          if (typeof (window as any).navigateToView === 'function') {
            (window as any).navigateToView('admin');
          } else {
            window.location.hash = '#/admin';
          }
        }, 600);
        return;
      }

      // B. Bloqueo de credenciales de demo obsoletas
      if (cleanInput === 'admin@futbolmaster.co') {
        setIsLoading(false);
        setErrorMsg('ACCESO DENEGADO: El acceso anterior ha sido desactivado permanentemente.');
        return;
      }

      // C. Intento con API REST Backend de Node.js / PostgreSQL (/api/auth/login)
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanInput, password: cleanPass })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            const sessionData: UserSession = {
              userId: data.user.id,
              name: data.user.fullName,
              email: data.user.email,
              role: data.user.roleId,
              roleTitle: data.user.roleName || data.user.roleId,
              activeTournamentId: null,
              loggedIn: true,
              token: data.token
            };

            localStorage.setItem('fmp_user_session', JSON.stringify(sessionData));
            if (data.token) sessionStorage.setItem('fmp_token', data.token);

            if (typeof (window as any).saveUserSession === 'function') {
              (window as any).saveUserSession(sessionData);
            }

            setSuccessMsg(`¡BIENVENIDO, ${data.user.fullName.toUpperCase()}!`);
            setTimeout(() => {
              setIsLoading(false);
              if (onSuccess) onSuccess(sessionData);
              if (typeof (window as any).navigateToView === 'function') {
                if (sessionData.role === 'admin' || sessionData.role === 'superadmin') {
                  (window as any).navigateToView('admin');
                } else {
                  (window as any).navigateToView('torneos');
                }
              }
            }, 600);
            return;
          }
        }
      } catch (apiErr) {
        // En caso de modo cliente autónomo (sin servidor activo), recurrimos al almacén local
        console.warn('[NEURAL LOGIN] Servidor API no disponible, consultando almacén local...', apiErr);
      }

      // D. Fallback al almacén local FMPStore
      let localUsers: any[] = [];
      if (typeof (window as any).FMPStore?.getUsers === 'function') {
        localUsers = (window as any).FMPStore.getUsers();
      } else {
        const stored = localStorage.getItem('fmp_users');
        if (stored) {
          try { localUsers = JSON.parse(stored); } catch {}
        }
      }

      const matched = localUsers.find((u: any) =>
        (u.email && u.email.toLowerCase() === cleanInput && (!u.password || u.password === cleanPass)) ||
        (u.name && u.name.toLowerCase() === cleanInput && (!u.password || u.password === cleanPass))
      );

      if (matched) {
        const sessionData: UserSession = {
          userId: matched.id,
          name: matched.name,
          email: matched.email,
          phone: matched.phone,
          role: matched.role || selectedRole,
          roleTitle: matched.roleTitle || 'Usuario Oficial',
          activeTournamentId: null,
          loggedIn: true
        };

        localStorage.setItem('fmp_user_session', JSON.stringify(sessionData));
        if (typeof (window as any).saveUserSession === 'function') {
          (window as any).saveUserSession(sessionData);
        }

        setSuccessMsg(`ACCESO VERIFICADO: ${matched.name.toUpperCase()}`);
        setTimeout(() => {
          setIsLoading(false);
          if (onSuccess) onSuccess(sessionData);
          if (typeof (window as any).navigateToView === 'function') {
            if (matched.role === 'admin') (window as any).navigateToView('admin');
            else (window as any).navigateToView('torneos');
          }
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMsg('CREDENCIALES INCORRECTAS: Usuario o clave no registrados en la red.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(`ERROR DE ACCESO: ${err.message || 'Fallo desconocido en el subsistema'}`);
    }
  };

  // ---------------------------------------------------------------------------
  // 4. REGISTRO OFICIAL (LEY 1581 HABEAS DATA)
  // ---------------------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regFullName || !regEmail || !regPassword) {
      setErrorMsg('DATOS INCOMPLETOS: Todos los campos marcados son obligatorios.');
      return;
    }

    if (!habeasDataAccepted) {
      setErrorMsg('AUTORIZACIÓN REQUERIDA: Debes aceptar la Ley 1581 de Habeas Data Colombia.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('SEGURIDAD INSUFICIENTE: La clave debe tener al menos 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('DISCORDANCIA: Las contraseñas ingresadas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      // Intento API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          password: regPassword,
          roleId: selectedRole,
          phone: regPhone,
          habeasDataAccepted: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMsg('¡REGISTRO EXITOSO! Accediendo a tu nodo oficial...');
        setTimeout(() => {
          setIdentity(regEmail);
          setPassword(regPassword);
          setActiveTab('login');
          setIsLoading(false);
        }, 1200);
        return;
      }
    } catch {
      // Modo cliente
    }

    // Guardado local de contingencia
    const newUser = {
      id: `usr-${Date.now()}`,
      name: regFullName,
      email: regEmail.toLowerCase(),
      phone: regPhone,
      role: selectedRole,
      password: regPassword,
      created_at: new Date().toISOString()
    };

    let existingUsers: any[] = [];
    try {
      existingUsers = JSON.parse(localStorage.getItem('fmp_users') || '[]');
    } catch {}
    existingUsers.push(newUser);
    localStorage.setItem('fmp_users', JSON.stringify(existingUsers));

    setSuccessMsg('¡NODO REGISTRADO! Inicia sesión para continuar.');
    setTimeout(() => {
      setIdentity(regEmail);
      setPassword(regPassword);
      setActiveTab('login');
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className={cn("mercury-wrapper", className)}>
      {/* =======================================================================
          ESTILOS CSS INTEGRADOS: FÍSICA LÍQUIDA, MERCURIO 3D Y EFECTOS GLOW
          ======================================================================= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --bg: #030708;
          --mercury: #e2e8f0;
          --mercury-glow: rgba(16, 185, 129, 0.45);
          --mercury-emerald: #10b981;
          --mercury-dark: #0f172a;
          --accent: #ffffff;
          --text-dim: rgba(255, 255, 255, 0.55);
          --filter-goo: url('#gooey-mercury');
        }

        .mercury-wrapper {
          background-color: var(--bg);
          color: var(--accent);
          font-family: 'Inter', -apple-system, sans-serif;
          min-height: 100vh;
          width: 100vw;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .mercury-wrapper * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        /* 1. Fondo de Física Líquida Dinámica (Efecto Mercurio) */
        .stage {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
          filter: var(--filter-goo);
          opacity: 0.75;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          background: linear-gradient(135deg, rgba(226, 232, 240, 0.9) 0%, rgba(16, 185, 129, 0.4) 50%, rgba(15, 23, 42, 0.8) 100%);
          border-radius: 50%;
          filter: blur(22px);
          animation: floatMercury 20s infinite alternate ease-in-out;
          box-shadow: inset -10px -10px 24px rgba(0,0,0,0.6), 
                      12px 12px 36px rgba(16, 185, 129, 0.35);
          transition: margin 0.12s ease-out;
        }

        @keyframes floatMercury {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(8vw, 15vh) scale(1.18); }
          66% { transform: translate(-6vw, 8vh) scale(0.85); }
          100% { transform: translate(6vw, -12vh) scale(1.12); }
        }

        /* 2. Contenedor de Interfaz Neural Compacto y Centrado */
        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          max-height: min(92vh, 640px);
          overflow-y: auto;
          overflow-x: hidden;
          padding: 26px 24px;
          background: rgba(4, 12, 16, 0.78);
          backdrop-filter: blur(28px) saturate(190%);
          -webkit-backdrop-filter: blur(28px) saturate(190%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-top: 1px solid rgba(255, 255, 255, 0.38);
          border-left: 1px solid rgba(167, 243, 208, 0.28);
          border-radius: 24px;
          box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.85),
                      0 0 32px -4px rgba(16, 185, 129, 0.22),
                      inset 0 1.5px 2px rgba(255, 255, 255, 0.35);
          margin: auto;
        }

        .auth-container::-webkit-scrollbar {
          width: 4px;
        }
        .auth-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .auth-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
        }

        .header {
          margin-bottom: 16px;
          text-align: left;
        }

        .brand-id {
          font-family: 'Space Mono', monospace;
          font-size: 9.5px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--mercury-emerald);
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header h1 {
          font-weight: 800;
          font-size: 2rem;
          line-height: 0.95;
          letter-spacing: -1.5px;
          margin: 0;
          color: #ffffff;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        /* 3. Selector de Modo Tabs (Iniciar Sesión / Registro) */
        .neural-tabs-switcher {
          display: flex;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          padding: 3px;
          margin-bottom: 16px;
        }

        .neural-tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-dim);
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.8px;
          padding: 6px 10px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
        }

        .neural-tab-btn.active {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4);
          font-weight: 700;
        }

        /* 4. Selector de Roles Minimalista */
        .role-pill-selector {
          margin-bottom: 14px;
        }

        .role-pill-selector label {
          display: block;
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 1px;
          color: var(--text-dim);
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .role-pills-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .role-pill-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 6px 4px;
          color: var(--text-dim);
          font-size: 9.5px;
          font-family: 'Space Mono', monospace;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          text-align: center;
        }

        .role-pill-btn.selected {
          background: rgba(16, 185, 129, 0.18);
          border-color: rgba(52, 211, 153, 0.6);
          color: #ffffff;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.25);
        }

        /* 5. Campos de Formulario con Resplandor Reactivo (.input-glow) */
        .form-group {
          position: relative;
          margin-bottom: 14px;
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .form-group:focus-within {
          transform: translateX(6px);
        }

        .form-group label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Space Mono', monospace;
          font-size: 9.5px;
          color: var(--text-dim);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-group input, .form-group select {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          color: var(--accent);
          padding: 6px 0;
          font-size: 14px;
          outline: none;
          transition: border-color 0.4s;
          font-family: 'Inter', sans-serif;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.25);
          font-size: 12.5px;
        }

        .input-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, var(--mercury-emerald), var(--mercury));
          transition: width 0.5s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: 0 0 16px var(--mercury-emerald);
        }

        .form-group input:focus + .input-glow,
        .input-box:focus-within .input-glow {
          width: 100%;
        }

        .btn-toggle-pass {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 4px;
        }

        .btn-toggle-pass:hover {
          color: #ffffff;
        }

        /* 6. El Botón Mercury Líquido (.submit-wrap y .mercury-drop) */
        .submit-wrap {
          margin-top: 20px;
          position: relative;
          filter: var(--filter-goo);
        }

        .btn-base {
          background: #ffffff;
          color: #050505;
          border: none;
          padding: 13px 24px;
          font-size: 12px;
          font-family: 'Space Mono', monospace;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          width: 100%;
          position: relative;
          z-index: 2;
          border-radius: 9999px;
          transition: letter-spacing 0.3s, background 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-base:hover:not(:disabled) {
          letter-spacing: 2.5px;
          background: #f1f5f9;
        }

        .btn-base:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          letter-spacing: 1.2px;
        }

        .mercury-drop {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ffffff 0%, #10b981 100%);
          transform: translate(-50%, -50%);
          z-index: 1;
          border-radius: 9999px;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .submit-wrap:hover:not(:disabled) .mercury-drop {
          transform: translate(-50%, -50%) scale(1.04, 1.18);
          filter: brightness(1.25);
        }

        /* 7. Alertas de Estado y Trazas */
        .status-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          margin-bottom: 18px;
          animation: alertSlideIn 0.3s ease;
        }

        .status-alert.error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }

        .status-alert.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.45);
          color: #6ee7b7;
        }

        @keyframes alertSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 8. Footer Nav y Enlaces */
        .footer-nav {
          margin-top: 26px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
        }

        .footer-nav a, .footer-nav button {
          color: var(--text-dim);
          text-decoration: none;
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          transition: color 0.3s;
          padding: 0;
        }

        .footer-nav a:hover, .footer-nav button:hover {
          color: var(--mercury-emerald);
        }

        .svg-filter-hidden {
          position: absolute;
          width: 0;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* =======================================================================
          DEFINICIÓN DEL FILTRO SVG GOOEY (FÍSICA DE MERCURIO)
          ======================================================================= */}
      <svg className="svg-filter-hidden" aria-hidden="true">
        <defs>
          <filter id="gooey-mercury">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
              result="goo" 
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Escenario de Simulación Líquida de Fondo */}
      <div className="stage" id="stage">
        {blobsData.map((data, index) => (
          <div
            key={index}
            ref={(el) => {
              blobRefs.current[index] = el;
            }}
            className="blob"
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              left: `${data.left}%`,
              top: `${data.top}%`,
              animationDelay: `${data.animationDelay}s`,
              animationDuration: `${data.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* =======================================================================
          INTERFAZ PRINCIPAL DE ACCESO (NEURAL ACCESS)
          ======================================================================= */}
      <main className="auth-container">
        {/* Cabecera Cyberpunk / Neural */}
        <header className="header">
          <span className="brand-id">
            <Sparkles size={13} />
            System Node: 0x992 • FÚTBOL MASTER PRO 🇨🇴
          </span>
          <h1>
            NEURAL<br />ACCESS
          </h1>
        </header>

        {/* Pestañas de Alternancia: Iniciar Sesión / Registro Oficial */}
        <nav className="neural-tabs-switcher">
          <button
            type="button"
            className={cn("neural-tab-btn", activeTab === 'login' && "active")}
            onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
          >
            INICIAR SESIÓN
          </button>
          <button
            type="button"
            className={cn("neural-tab-btn", activeTab === 'register' && "active")}
            onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
          >
            NUEVA CUENTA
          </button>
        </nav>

        {/* Notificaciones / Alertas de Seguridad */}
        {errorMsg && (
          <div className="status-alert error">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="status-alert success">
            <CheckCircle2 size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SELECTOR DE ROL RÁPIDO */}
        <div className="role-pill-selector">
          <label>Selección de Rol Oficial</label>
          <div className="role-pills-row">
            <button
              type="button"
              className={cn("role-pill-btn", selectedRole === 'organizer' && "selected")}
              onClick={() => setSelectedRole('organizer')}
            >
              <span>🏆 Organizador</span>
              <small>Competiciones</small>
            </button>
            <button
              type="button"
              className={cn("role-pill-btn", selectedRole === 'coach' && "selected")}
              onClick={() => setSelectedRole('coach')}
            >
              <span>📋 Técnico</span>
              <small>Plantillas</small>
            </button>
            <button
              type="button"
              className={cn("role-pill-btn", selectedRole === 'fan' && "selected")}
              onClick={() => setSelectedRole('fan')}
            >
              <span>👀 Aficionado</span>
              <small>Público</small>
            </button>
          </div>
        </div>

        {/* ===================================================================
            FORMULARIO A: INICIAR SESIÓN (LÓGICA CONECTADA)
            =================================================================== */}
        {activeTab === 'login' && (
          <form autoComplete="off" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>User Identity // Correo o Usuario</label>
              <div className="input-box">
                <input
                  type="text"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="ej: boadasaidert466@gmail.com"
                  required
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label>Sequence Key // Contraseña Maestra</label>
              <div className="input-box">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar clave" : "Mostrar clave"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <div className="input-glow"></div>
              </div>
            </div>

            {/* Mercury Submit Button */}
            <div className="submit-wrap">
              <div className="mercury-drop"></div>
              <button type="submit" className="btn-base" disabled={isLoading}>
                {isLoading ? (
                  <>INITIALIZING ACCESS...</>
                ) : (
                  <>
                    <span>INITIALIZE STREAM</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================
            FORMULARIO B: REGISTRO CON LEY 1581 HABEAS DATA COLOMBIA
            =================================================================== */}
        {activeTab === 'register' && (
          <form autoComplete="off" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>Full Identity // Nombre Completo *</label>
              <div className="input-box">
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Ej: Camilo Andrés Rodríguez"
                  required
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label>Official Comms // Correo Electrónico *</label>
              <div className="input-box">
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label>Contact Line // Teléfono Móvil (+57) *</label>
              <div className="input-box">
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="310 123 4567"
                  required
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label>Cipher Key // Contraseña *</label>
              <div className="input-box">
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <div className="input-glow"></div>
              </div>
            </div>

            <div className="form-group">
              <label>Verify Key // Confirmar Contraseña *</label>
              <div className="input-box">
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                />
                <div className="input-glow"></div>
              </div>
            </div>

            {/* Checkbox de Ley 1581 Habeas Data */}
            <div style={{ marginTop: '14px', marginBottom: '18px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                id="neuralHabeasData"
                checked={habeasDataAccepted}
                onChange={(e) => setHabeasDataAccepted(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#10b981' }}
              />
              <label htmlFor="neuralHabeasData" style={{ fontSize: '9.5px', color: 'var(--text-dim)', lineHeight: 1.4, cursor: 'pointer' }}>
                <strong style={{ color: '#ffffff' }}>Ley 1581 de 2012 (Habeas Data):</strong> Autorizo el tratamiento de mis datos personales conforme a los reglamentos de Football Master Pro Colombia.
              </label>
            </div>

            <div className="submit-wrap">
              <div className="mercury-drop"></div>
              <button type="submit" className="btn-base" disabled={isLoading}>
                {isLoading ? (
                  <>REGISTERING NODE...</>
                ) : (
                  <>
                    <span>REGISTER ARCHIVE</span>
                    <ShieldCheck size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Navegación Inferior */}
        <footer className="footer-nav">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'login') {
                setActiveTab('register');
              } else {
                setActiveTab('login');
              }
            }}
          >
            {activeTab === 'login' ? 'NEW ARCHIVE // REGISTRO' : 'EXISTING ARCHIVE // LOGIN'}
          </button>
          {onCancel ? (
            <button type="button" onClick={onCancel}>
              ABORT ACCESS
            </button>
          ) : (
            <a href="#/torneos" onClick={(e) => {
              if (typeof (window as any).navigateToView === 'function') {
                e.preventDefault();
                (window as any).navigateToView('torneos');
              }
            }}>
              PUBLIC DISCOVERY
            </a>
          )}
        </footer>
      </main>
    </div>
  );
};

export default MercuryLogin;
