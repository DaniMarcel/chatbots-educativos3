import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/Login.css';

function Login() {
  const [rut, setRut] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('alumno'); // 'alumno' | 'profesor'
  const [mensaje, setMensaje] = useState('');
  const [verPwd, setVerPwd] = useState(false);

  // recovery side-panel state (solo para profesor/admin)
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recEmail, setRecEmail] = useState('');
  const [recResult, setRecResult] = useState(null);

  const navigate = useNavigate();
  const { login, recuperarContrasena, loading, error, setError } = useAuth();

  const normalizarRut = (v) => v.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();

  // Si cambias a "Alumno", cierra el panel de recuperación y limpia password
  useEffect(() => {
    if (rol === 'alumno') {
      setRecoveryOpen(false);
      setRecEmail('');
      setRecResult(null);
      setContrasena('');
    }
  }, [rol]);

  // Mostrar error del hook si existe
  useEffect(() => {
    if (error) {
      setMensaje(error);
      const timer = setTimeout(() => {
        setMensaje('');
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  /* ---------------- LOGIN ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const rutLimpio = normalizarRut(rut);
    const contrasenaLimpia = contrasena.trim();

    if (rol === 'alumno') {
      if (!rutLimpio) {
        setMensaje('Ingresa tu RUT.');
        setTimeout(() => setMensaje(''), 2500);
        return;
      }
    } else {
      if (!rutLimpio || !contrasenaLimpia) {
        setMensaje('Ingresa RUT y contraseña.');
        setTimeout(() => setMensaje(''), 2500);
        return;
      }
    }

    await login(rutLimpio, contrasenaLimpia, rol);
  };

  /* ---------------- RECOVERY (side-panel) ---------------- */
  const openRecovery = (initialEmail = '') => {
    if (rol === 'alumno') return;
    setRecEmail(initialEmail);
    setRecResult(null);
    setRecoveryOpen(true);
  };

  const closeRecovery = () => {
    if (loading) return;
    setRecoveryOpen(false);
    setRecEmail('');
    setRecResult(null);
  };

  const validateEmail = (v) => {
    if (!v) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(v).toLowerCase());
  };

  async function handleSendRecovery() {
    if (!validateEmail(recEmail)) {
      setRecResult({ ok: false, msg: 'Ingresa un correo válido.' });
      return;
    }

    const result = await recuperarContrasena(recEmail);
    setRecResult({ ok: result.success, msg: result.message });
  }

  /* ---------------- JSX ---------------- */
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <img src="/Logo-IA.png" alt="Logo" className="login-logo" />
        <h2>Portal Educativo</h2>
        <p className="login-info">
          {rol === 'alumno'
            ? 'Ingresa solo con tu RUT.'
            : 'Solo usuarios registrados por el administrador pueden ingresar.'}
        </p>

        <div className="rol-selector">
          <label>
            <input
              type="radio"
              name="rol"
              value="alumno"
              checked={rol === 'alumno'}
              onChange={() => setRol('alumno')}
            />{' '}
            Alumno
          </label>
          <label>
            <input
              type="radio"
              name="rol"
              value="profesor"
              checked={rol === 'profesor'}
              onChange={() => setRol('profesor')}
            />{' '}
            Profesor/Admin
          </label>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={rol === 'alumno' ? 'RUT (Ej: 12345678-9)' : 'RUT (Ej: 12345678-9)'}
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            autoComplete="username"
          />

          {rol !== 'alumno' && (
            <div className="pwd-field">
              <input
                type={verPwd ? 'text' : 'password'}
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                name="password"
              />
              <button
                type="button"
                className="toggle-pwd"
                aria-label={verPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setVerPwd(v => !v)}
                title={verPwd ? 'Ocultar' : 'Mostrar'}
              >
                {verPwd ? '🙈' : '👁️'}
              </button>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Link de recuperación: SOLO profesor/admin */}
        {rol !== 'alumno' && (
          <div style={{ marginTop: 12 }}>
            <button className="login-link" onClick={() => openRecovery('')}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        {mensaje && <p className="login-msg">{mensaje}</p>}

        <button className="volver-inicio" onClick={() => navigate('/')}>
          ← Volver al inicio
        </button>
      </div>

      {/* ===== Side-panel: Recuperar contraseña (solo profesor/admin) ===== */}
      {rol !== 'alumno' && recoveryOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal" aria-labelledby="recuperar-title">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 id="recuperar-title" style={{ margin: 0, color: '#ffffffff', fontSize: 14 }}>Recuperar contraseña</h3>
              <button className="modal-close" onClick={closeRecovery} aria-label="Cerrar">✕</button>
            </div>

            <div className="modal-body">
              <p style={{ margin: 0, color: '#ffffffff', fontSize: 14 }}>
                Ingresa el <strong>correo verificado</strong> en tu cuenta. Si existe, recibirás un email con instrucciones.
              </p>

              <label className="field" style={{ marginTop: 12 }}>
                <span style={{ display: 'block', marginBottom: 6, color: '#ffffffff' }}>Correo</span>
                <input
                  type="email"
                  value={recEmail}
                  onChange={(e) => setRecEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
              </label>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                <button
                  className="btn btn-pr"
                  onClick={closeRecovery}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendRecovery}
                  disabled={loading}
                  title={!validateEmail(recEmail) ? 'Ingresa un correo válido' : 'Enviar instrucciones'}
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>

              {/* Result */}
              {recResult && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: recResult.ok ? '#e6ffef' : '#fff4f4',
                    color: recResult.ok ? '#046a2f' : '#991b1b',
                    border: recResult.ok ? '1px solid #b7f2cf' : '1px solid #f1b0b0'
                  }}>
                    {recResult.msg}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <small style={{ color: '#ffffffff' }}>¿No recibes el email? Revisa la carpeta SPAM.</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;