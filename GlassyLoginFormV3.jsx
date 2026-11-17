import React, { useState } from 'react';
import './styles.css'; // or import the Glassy CSS module

/**
 * GlassyLoginFormV3 - Futbol Master Pro
 * Sci-Fi Chamfered Glass Card with HUD Corners, 650ms Morph Animation & Shimmer Badge.
 */
export default function GlassyLoginFormV3({ isOpen = true, onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [activePane, setActivePane] = useState('login'); // controls which form is rendered in DOM
  const [isExiting, setIsExiting] = useState(false);

  // Selector de Rol en Registro
  const [role, setRole] = useState('organizer');

  // Trigger exact 650ms transition between 'login' and 'signup'
  const handleSwitchMode = (targetMode) => {
    if (isAnimating || targetMode === mode) return;
    setIsAnimating(true);
    setMode(targetMode);

    // Paso 1 (0ms - 180ms): Fade out del formulario saliente (opacity: 0, scale: 0.95)
    setIsExiting(true);

    setTimeout(() => {
      // Paso 2 (180ms - 480ms / 300ms de permanencia):
      // Ocultar formulario saliente y activar el Badge central de cristal con giro diagonal y shimmer
      setIsExiting(false);
      setActivePane(null);
      setShowBadge(true);

      setTimeout(() => {
        // Paso 3 (480ms - 750ms):
        // Desactivar badge y desplegar nuevo formulario en cascada con retrasos progresivos de 0.05s
        setShowBadge(false);
        setActivePane(targetMode);

        setTimeout(() => {
          setIsAnimating(false);
        }, 270);
      }, 300);
    }, 180);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay active" style={{ display: 'flex' }}>
      <div className={`glassy-v3-wrapper ${mode === 'signup' ? 'mode-signup' : 'mode-login'}`} id="glassyV3Wrapper">
        {/* Esquinas HUD Flotantes */}
        <div className="hud-corner-tl" aria-hidden="true" />
        <div className="hud-corner-br" aria-hidden="true" />

        {/* Marco Biselado Sci-Fi con Borde Luminoso Degradado */}
        <div className="glassy-v3-frame">
          <div className="glassy-v3-card">
            {/* Botón de Cierre Elegante */}
            {onClose && (
              <button 
                type="button" 
                className="glassy-v3-close" 
                onClick={onClose} 
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            )}

            {/* Paso 2: Badge Central de Cristal con Giro y Destello Shimmer */}
            {showBadge && (
              <div className="glassy-morph-badge auth-transition-badge active" aria-hidden="true">
                <div className="badge-cube">
                  <div className="badge-shimmer" />
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#A5F3FC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="12 6 15 10 13 15 11 15 9 10 12 6" />
                  </svg>
                </div>
              </div>
            )}

            {/* MODO A: INICIAR SESIÓN */}
            {(activePane === 'login' || (isExiting && activePane === 'login')) && (
              <div className={`glassy-form-pane ${isExiting ? 'is-exiting' : ''}`} id="auth-login-pane">
                <form 
                  id="authLoginForm" 
                  className="auth-form auth-form-content" 
                  onSubmit={(e) => { e.preventDefault(); if (onLogin) onLogin(e); }}
                >
                  <h2 className="glassy-v3-title">Bienvenido de <span className="highlight-cyan">Nuevo</span></h2>
                  <p className="glassy-v3-sub">Ingresa tus credenciales para acceder a Fútbol Master Pro</p>

                  <div className="glassy-input-group">
                    <label className="glassy-label" htmlFor="authUserName">Correo Electrónico</label>
                    <div className="glassy-input-wrap">
                      <svg className="icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <input type="text" id="authUserName" className="glassy-input no-toggle" placeholder="ej: usuario@correo.com" required autoComplete="username" />
                    </div>
                  </div>

                  <div className="glassy-input-group">
                    <label className="glassy-label" htmlFor="authUserPassword">Contraseña</label>
                    <div className="glassy-input-wrap">
                      <svg className="icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <input type="password" id="authUserPassword" className="glassy-input" placeholder="••••••••" required autoComplete="current-password" />
                    </div>
                  </div>

                  <div className="glassy-aux-row">
                    <label className="glassy-checkbox-label">
                      <input type="checkbox" id="authRememberMe" defaultChecked />
                      <span>Recordarme</span>
                    </label>
                    <a href="#forgot" className="auth-link-forgot" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
                  </div>

                  <button type="submit" className="glassy-btn-submit" id="btnSubmitLogin">
                    <span>Iniciar Sesión &rarr;</span>
                  </button>

                  <div className="glassy-footer-switch">
                    <div className="glassy-divider" />
                    <p className="switch-text">
                      ¿No tienes una cuenta?{' '}
                      <button type="button" className="btn-auth-switch" onClick={() => handleSwitchMode('signup')}>
                        Regístrate
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* MODO B: CREAR CUENTA */}
            {(activePane === 'signup' || (isExiting && activePane === 'signup')) && (
              <div className={`glassy-form-pane ${isExiting ? 'is-exiting' : ''}`} id="auth-register-pane">
                <form 
                  id="authRegisterForm" 
                  className="auth-form auth-form-content" 
                  onSubmit={(e) => { e.preventDefault(); if (onRegister) onRegister(e); }}
                >
                  <h2 className="glassy-v3-title">Crear <span className="highlight-cyan">Cuenta</span></h2>
                  <p className="glassy-v3-sub">Regístrate para gestionar tus torneos o tu club</p>

                  <div className="glassy-input-group">
                    <label className="glassy-label" htmlFor="regFullName">Nombre Completo</label>
                    <div className="glassy-input-wrap">
                      <svg className="icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <input type="text" id="regFullName" className="glassy-input no-toggle" placeholder="Tu nombre y apellido" required autoComplete="name" />
                    </div>
                  </div>

                  <div className="glassy-input-group">
                    <label className="glassy-label" htmlFor="regEmail">Correo Electrónico</label>
                    <div className="glassy-input-wrap">
                      <svg className="icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      <input type="email" id="regEmail" className="glassy-input no-toggle" placeholder="correo@ejemplo.com" required autoComplete="email" />
                    </div>
                  </div>

                  <div className="glassy-two-col-row">
                    <div className="glassy-input-group">
                      <label className="glassy-label" htmlFor="regPassword">Contraseña</label>
                      <div className="glassy-input-wrap">
                        <svg className="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <input type="password" id="regPassword" className="glassy-input" placeholder="••••••••" minLength={6} required autoComplete="new-password" />
                      </div>
                    </div>

                    <div className="glassy-input-group">
                      <label className="glassy-label" htmlFor="regPasswordConfirm">Confirmar</label>
                      <div className="glassy-input-wrap">
                        <svg className="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <input type="password" id="regPasswordConfirm" className="glassy-input no-toggle" placeholder="••••••••" minLength={6} required autoComplete="new-password" />
                      </div>
                    </div>
                  </div>

                  {/* Selector Compacto de Rol en Píldoras */}
                  <div className="glassy-role-selector">
                    <label className="glassy-label">Tipo de Cuenta</label>
                    <div className="role-pills-row">
                      <button 
                        type="button" 
                        className={`role-pill-btn ${role === 'organizer' ? 'active' : ''}`}
                        onClick={() => setRole('organizer')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                        <span>Organizador</span>
                      </button>
                      <button 
                        type="button" 
                        className={`role-pill-btn ${role === 'coach' ? 'active' : ''}`}
                        onClick={() => setRole('coach')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <span>D. Técnico</span>
                      </button>
                      <button 
                        type="button" 
                        className={`role-pill-btn ${role === 'fan' ? 'active' : ''}`}
                        onClick={() => setRole('fan')}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>Aficionado</span>
                      </button>
                    </div>
                  </div>

                  <div className="glassy-aux-row" style={{ marginBottom: '0.9rem' }}>
                    <label className="glassy-checkbox-label">
                      <input type="checkbox" id="regHabeasData" required defaultChecked />
                      <span style={{ fontSize: '0.78rem' }}>Acepto los Términos y Reglamento Oficial (Ley 1581)</span>
                    </label>
                  </div>

                  <button type="submit" className="glassy-btn-submit" id="btnSubmitRegister">
                    <span>Crear Cuenta &rarr;</span>
                  </button>

                  <div className="glassy-footer-switch">
                    <div className="glassy-divider" />
                    <p className="switch-text">
                      ¿Ya tienes una cuenta?{' '}
                      <button type="button" className="btn-auth-switch" onClick={() => handleSwitchMode('login')}>
                        Inicia Sesión
                      </button>
                    </p>
                  </div>

                  <input type="hidden" id="regPhone" value="+57 310 123 4567" />
                  <input type="hidden" id="regClubName" value="" />
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
