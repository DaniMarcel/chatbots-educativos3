# Frontend - Chatbots Educativos

Aplicacion web en React para el portal **Chatbots Educativos**. Permite el acceso de alumnos, profesores y superadministradores a paneles diferenciados para gestionar cursos, usuarios, chatbots educativos, videos y visitas.

## Tecnologias principales

- React 19
- Vite
- React Router
- Axios
- SweetAlert2
- XLSX
- Capacitor para build Android

## Funcionalidades

- Pagina principal publica.
- Login de alumnos, profesores y superadmin.
- Registro de alumnos.
- Recuperacion y restablecimiento de contrasena.
- Panel de alumno con perfil, chatbots asignados y videos educativos.
- Panel de profesor para gestionar cursos, alumnos y chatbots.
- Panel de superadmin para gestionar usuarios, visitas y configuracion publica.
- Panel de visita/invitado con recursos publicos.
- Consumo de API REST del backend.

## Estructura relevante

```text
frontend/
  src/
    components/       Componentes reutilizables
    components/alumno Componentes del panel de alumno
    components/visita Componentes del panel de visita
    hooks/            Hooks de estado y carga de datos
    pages/            Vistas principales de la aplicacion
    services/         Cliente HTTP hacia el backend
    styles/           Hojas de estilo por pantalla
    utils/            Utilidades de usuario y almacenamiento local
  android/            Proyecto Android generado por Capacitor
  capacitor.config.json
  vite.config.js
```

## Requisitos

- Node.js
- npm
- Backend disponible localmente o desplegado

## Variables de entorno

Crea un archivo `.env` dentro de `frontend/` si quieres sobrescribir la API por defecto:

```env
VITE_API_URL=http://localhost:5000/api
```

Si no se define, los servicios usan la API desplegada configurada en el codigo.

## Instalacion

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Por configuracion de Vite, la app se abre en:

```text
http://localhost:3000
```

## Compilar para produccion

```bash
npm run build
```

El resultado se genera en:

```text
build/
```

## Vista previa del build

```bash
npm run preview
```

## Android con Capacitor

El proyecto incluye Capacitor con:

- `appId`: `com.chatbotseducativos.app`
- `appName`: `Chatbots Educativos`
- `webDir`: `build`

Flujo habitual:

```bash
npm run build
npx cap sync android
npx cap open android
```

## Scripts disponibles

```bash
npm run dev      # Servidor local de Vite
npm run build    # Build de produccion
npm run preview  # Preview del build
npm start        # Sirve build en entornos con PORT
```

## Notas

- Las rutas protegidas validan token y rol desde `localStorage`.
- Los servicios HTTP leen `VITE_API_URL` y agregan el token cuando corresponde.
- El backend debe tener CORS habilitado para el origen donde se ejecute el frontend.
