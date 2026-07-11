import { useEffect, useMemo, useState } from "react";
import { decryptLocalPassword } from "../utils/localVault";
import "../styles/PanelProfesor.css";

import RegistroAlumno from "./RegistroAlumno";
import CargarAlumnos from "./CargarAlumnos";
import DatosAlumnos from "./DatosAlumnos";
import CursosProfesor from "./CursosProfesor";
import AccesoChatbots from "./AccesoChatbots";
import VisitasAlumnos from "./VisitasAlumnos";

const Icon = ({ children, size = 19 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Icons = {
  account: () => <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icon>,
  page: () => <Icon><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /><path d="M8 14h3" /></Icon>,
  students: () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>,
  courses: () => <Icon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></Icon>,
  chatbot: () => <Icon><rect x="4" y="6" width="16" height="13" rx="3" /><path d="M12 2v4" /><path d="M8 11h.01" /><path d="M16 11h.01" /><path d="M8 15h8" /></Icon>,
  addUser: () => <Icon><path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></Icon>,
  upload: () => <Icon><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 21h14" /></Icon>,
  activity: () => <Icon><path d="M3 3v18h18" /><path d="m7 16 4-5 3 3 5-7" /></Icon>,
  menu: () => <Icon size={21}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Icon>,
  close: () => <Icon size={20}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></Icon>,
  logout: () => <Icon><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></Icon>,
  eye: () => <Icon><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon>,
  eyeOff: () => <Icon><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a17.7 17.7 0 0 1-2.1 3.2" /><path d="M6.6 6.6C3.5 8.5 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4.1-.9" /></Icon>,
};

const VIEW_META = {
  cuenta: { title: "Mi cuenta", description: "Información de perfil y acceso a la plataforma." },
  inicio: { title: "Página Chatbots", description: "Accede al asistente principal de la plataforma." },
  datos: { title: "Datos del alumno", description: "Consulta, filtra y administra tus estudiantes." },
  cursos: { title: "Cursos", description: "Gestiona módulos, chatbots y permisos de acceso." },
  chatbots: { title: "Acceso a chatbots", description: "Revisa el catálogo y los asistentes disponibles." },
  registro: { title: "Registrar alumno", description: "Incorpora un nuevo estudiante a tu cuenta." },
  carga: { title: "Carga masiva", description: "Importa estudiantes desde una planilla." },
  actividad: { title: "Actividad de alumnos", description: "Analiza ingresos y uso de la plataforma." },
};

export default function PanelProfesor() {
  const [vistaActiva, setVistaActiva] = useState("cursos");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [storedPwd, setStoredPwd] = useState("");

  const me = JSON.parse(localStorage.getItem("usuario") || "{}");
  const role = String(me?.rol || "").toLowerCase();
  const permisos = Array.isArray(me?.permisos) ? me.permisos : [];
  const displayName = [me?.nombre, me?.apellido].filter(Boolean).join(" ") || me?.correo || "Usuario";
  const initials = [me?.nombre, me?.apellido]
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PR";

  const canEditEstado = role === "superadmin" || role === "admin";
  const canEditRiesgo = ["superadmin", "admin", "profesor"].includes(role);
  const canDeleteAlumno =
    role === "superadmin" ||
    role === "admin" ||
    (role === "profesor" && permisos.includes("alumnos:eliminar"));
  const canLoadMassive =
    role === "superadmin" ||
    role === "admin" ||
    (role === "profesor" &&
      (permisos.includes("alumnos:carga_masiva") || permisos.includes("alumnos:registrar_masivo")));

  const navGroups = useMemo(() => [
    {
      label: "General",
      items: [
        { key: "cursos", label: "Cursos", icon: Icons.courses },
        { key: "inicio", label: "Página Chatbots", icon: Icons.page },
        { key: "cuenta", label: "Mi cuenta", icon: Icons.account },
      ],
    },
    {
      label: "Gestión académica",
      items: [
        { key: "datos", label: "Datos del alumno", icon: Icons.students },
        { key: "registro", label: "Registrar alumno", icon: Icons.addUser },
        ...(canLoadMassive ? [{ key: "carga", label: "Carga masiva", icon: Icons.upload }] : []),
        { key: "chatbots", label: "Acceso a chatbots", icon: Icons.chatbot },
      ],
    },
    {
      label: "Seguimiento",
      items: [{ key: "actividad", label: "Actividad de alumnos", icon: Icons.activity }],
    },
  ], [canLoadMassive]);

  const activeMeta = VIEW_META[vistaActiva] || VIEW_META.cursos;

  useEffect(() => {
    (async () => {
      const enc = localStorage.getItem("password_enc");
      const salt = me?._id || me?.correo || me?.id || "anon";
      if (enc && decryptLocalPassword) {
        try {
          const dec = await decryptLocalPassword(enc, salt);
          setStoredPwd(dec || "");
        } catch {
          setStoredPwd("");
        }
      } else {
        setStoredPwd(
          localStorage.getItem("password") ||
          localStorage.getItem("pwd") ||
          localStorage.getItem("pass") ||
          ""
        );
      }
    })();
  }, [me?._id, me?.correo, me?.id]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    const TIMEOUT = 30 * 60 * 1000;
    const KEY = "sessionExpiresAt";

    const refresh = () => {
      if (localStorage.getItem("token")) {
        localStorage.setItem(KEY, String(Date.now() + TIMEOUT));
      }
    };
    const check = () => {
      const exp = Number(localStorage.getItem(KEY) || 0);
      if (!exp) {
        if (localStorage.getItem("token")) refresh();
        return;
      }
      if (Date.now() > exp) {
        alert("Sesión expirada por inactividad.");
        handleLogout();
      }
    };

    if (!localStorage.getItem("token")) {
      handleLogout();
      return;
    }

    refresh();
    const id = setInterval(check, 15000);
    const onActivity = () => document.visibilityState === "visible" && refresh();
    const onStorage = (event) => event.key === KEY && check();
    const events = ["click", "keydown", "mousemove", "scroll", "touchstart", "focus"];

    events.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onActivity);
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(id);
      events.forEach((event) => window.removeEventListener(event, onActivity));
      document.removeEventListener("visibilitychange", onActivity);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSidebarVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleMenuClick = (view) => {
    setVistaActiva(view);
    setSidebarVisible(false);
  };

  return (
    <div className={`prof-shell ${isSidebarVisible ? "sidebar-open" : ""}`}>
      <div className="prof-sidebar-overlay" onClick={() => setSidebarVisible(false)} />

      <aside className="prof-sidebar" aria-label="Navegación del profesor">
        <div className="prof-brand">
          <span className="prof-brand-mark"><Icons.courses /></span>
          <div>
            <strong>Campus Chatbots</strong>
            <span>Panel docente</span>
          </div>
          <button className="prof-sidebar-close" onClick={() => setSidebarVisible(false)} aria-label="Cerrar menú">
            <Icons.close />
          </button>
        </div>

        <div className="prof-user-card">
          <span className="prof-avatar">{initials}</span>
          <div className="prof-user-copy">
            <strong title={displayName}>{displayName}</strong>
            <span>{role || "Profesor"}</span>
          </div>
        </div>

        <nav className="prof-nav">
          {navGroups.map((group) => (
            <div className="prof-nav-group" key={group.label}>
              <span className="prof-nav-label">{group.label}</span>
              {group.items.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`prof-nav-item ${vistaActiva === item.key ? "active" : ""}`}
                    onClick={() => handleMenuClick(item.key)}
                    aria-current={vistaActiva === item.key ? "page" : undefined}
                  >
                    <span className="prof-nav-icon"><ItemIcon /></span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <button className="prof-logout" type="button" onClick={handleLogout}>
          <Icons.logout />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      <div className="prof-workspace">
        <header className="prof-topbar">
          <button className="prof-menu-button" onClick={() => setSidebarVisible(true)} aria-label="Abrir menú">
            <Icons.menu />
          </button>
          <div className="prof-page-heading">
            <h1>{activeMeta.title}</h1>
            <p>{activeMeta.description}</p>
          </div>
          <div className="prof-top-user">
            <span className="prof-top-avatar">{initials}</span>
            <div>
              <strong>{displayName}</strong>
              <span>{role || "Profesor"}</span>
            </div>
          </div>
        </header>

        <main className="prof-main">
          {vistaActiva === "inicio" && (
            <section className="prof-view prof-embed-view">
              <iframe
                src="https://aipoweredchatbot-production.up.railway.app/"
                allowFullScreen
                title="IframePanelProfesor"
              />
            </section>
          )}

          {vistaActiva === "datos" && (
            <div className="prof-view">
              <DatosAlumnos
                canDeleteAlumno={canDeleteAlumno}
                canEditEstado={canEditEstado}
                canEditRiesgo={canEditRiesgo}
              />
            </div>
          )}

          {vistaActiva === "cursos" && <div className="prof-view"><CursosProfesor /></div>}
          {vistaActiva === "registro" && <div className="prof-view"><RegistroAlumno /></div>}
          {vistaActiva === "carga" && canLoadMassive && <div className="prof-view"><CargarAlumnos /></div>}
          {vistaActiva === "chatbots" && (
            <div className="prof-view">
              <AccesoChatbots token={localStorage.getItem("token")} me={me} />
            </div>
          )}
          {vistaActiva === "actividad" && <div className="prof-view"><VisitasAlumnos /></div>}

          {vistaActiva === "cuenta" && (
            <section className="prof-view prof-account">
              <div className="prof-account-summary">
                <span className="prof-account-avatar">{initials}</span>
                <div>
                  <span className="prof-eyebrow">Perfil docente</span>
                  <h2>{displayName}</h2>
                  <p>{me?.correo || me?.email || "Sin correo registrado"}</p>
                </div>
                <span className="prof-role-pill">{role || "Profesor"}</span>
              </div>

              <div className="prof-account-fields">
                <label className="prof-field">
                  <span>Nombre</span>
                  <input value={me?.nombre || ""} readOnly />
                </label>
                <label className="prof-field">
                  <span>Apellido</span>
                  <input value={me?.apellido || ""} readOnly />
                </label>
                <label className="prof-field">
                  <span>Correo</span>
                  <input value={me?.correo || me?.email || ""} readOnly />
                </label>
                <label className="prof-field">
                  <span>Rol</span>
                  <input value={role || ""} readOnly />
                </label>
              </div>

              <div className="prof-account-access">
                <div>
                  <h3>Acceso</h3>
                  <p>Credencial almacenada localmente en este dispositivo.</p>
                </div>
                <label className="prof-field prof-password-field">
                  <span>Contraseña</span>
                  <div className="prof-password-row">
                    <input
                      type={pwdVisible ? "text" : "password"}
                      value={storedPwd}
                      readOnly
                      placeholder="No disponible"
                    />
                    <button
                      type="button"
                      className="prof-icon-button"
                      onClick={() => setPwdVisible((value) => !value)}
                      title={pwdVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-label={pwdVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {pwdVisible ? <Icons.eyeOff /> : <Icons.eye />}
                    </button>
                  </div>
                </label>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
