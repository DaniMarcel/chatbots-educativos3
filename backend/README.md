# Backend - Chatbots Educativos

API REST en Node.js y Express para el portal **Chatbots Educativos**. Gestiona autenticacion, usuarios, alumnos, cursos, chatbots, asignaciones, panel de invitados, visitas, cargas de archivos y recuperacion de contrasena.

## Tecnologias principales

- Node.js
- Express
- MongoDB con Mongoose
- JWT para autenticacion
- bcryptjs para contrasenas
- SendGrid para correos de recuperacion
- Multer / GridFS para carga de archivos
- ExcelJS y XLSX para importacion/exportacion de datos

## Funcionalidades

- Login de alumnos, profesores, administradores y superadmin.
- Registro y gestion de alumnos.
- Gestion de profesores/admins.
- Creacion y gestion de cursos.
- Creacion, categorizacion y gestion de chatbots.
- Asignacion de chatbots a cursos y alumnos.
- Panel publico o de invitados.
- Registro y exportacion de visitas.
- Carga de archivos.
- Recuperacion de contrasena por correo.
- Health check para monitoreo del servidor y MongoDB.

## Estructura relevante

```text
backend/
  index.js              Entrada principal del servidor
  crearSuperadmin.js    Script para crear un superadmin
  verify_sendgrid.js    Script de verificacion de SendGrid
  middlewares/
    auth.js             Verificacion JWT y roles
  models/
    Admin.js
    Alumno.js
    AlumnoChatbot.js
    Chatbot.js
    ChatbotCategoria.js
    Curso.js
    GuestPanel.js
    Visita.js
  routes/
    admin.js
    alumno.js
    alumno-chatbots.js
    auth.js
    chatbot-categorias.js
    chatbots.js
    cursos.js
    guest-panel.js
    guest-panel-config.js
    password.js
    upload.js
    visita.js
```

## Requisitos

- Node.js
- npm
- Base de datos MongoDB
- Cuenta/configuracion de SendGrid si se usara recuperacion de contrasena por correo

## Variables de entorno

Crea un archivo `.env` dentro de `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://usuario:password@cluster/db
JWT_SECRET=clave_secreta_segura
FRONT_URL=http://localhost:3000

# Opcionales para despliegue/keep-alive
BACKEND_URL=http://localhost:5000
RAILWAY_PUBLIC_URL=

# Opcionales para recuperacion de contrasena
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM=
SENDGRID_FROM_NAME=Portal Educativo
FORGOT_TOKEN_EXPIRES_MS=3600000
STRICT_FORGOT=0
MAIL_DRY_RUN=0
```

No subas credenciales reales al repositorio.

## Instalacion

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

## Ejecutar en produccion/local simple

```bash
npm start
```

Por defecto el servidor usa:

```text
http://localhost:5000
```

## Endpoints principales

El backend monta las rutas bajo `/api`:

```text
GET    /health
GET    /

/api                  Autenticacion y registro base
/api/admin            Gestion de admins/profesores
/api/alumnos          Gestion de alumnos
/api/cursos           Gestion de cursos e inscripciones
/api/chatbots         Gestion de chatbots
/api/chatbot-categorias
/api/alumno-chatbots  Permisos/asignaciones de chatbots a alumnos
/api/visitas          Registro, consulta y exportacion de visitas
/api/upload           Carga de archivos
/api/password         Recuperacion y reset de contrasena
/api/guest-panel      Configuracion publica del panel invitado
/api/guest-panel/config
```

## Roles

El sistema trabaja con estos roles principales:

- `superadmin`: acceso completo a administracion, usuarios y visitas.
- `admin`: rol administrativo segun permisos configurados.
- `profesor`: gestion de cursos, alumnos y chatbots asociados.
- `alumno`: acceso a su perfil, chatbots y videos asignados.

## Crear superadmin

El repositorio incluye el script:

```bash
node crearSuperadmin.js
```

Antes de ejecutarlo, revisa el contenido del script y confirma que las credenciales iniciales sean las correctas para tu entorno.

## Verificar SendGrid

```bash
node verify_sendgrid.js
```

Requiere `SENDGRID_API_KEY` configurada.

## Health check

```text
GET /health
```

Devuelve el estado del servidor y de la conexion a MongoDB.

## Notas de despliegue

- CORS permite localhost, dominios Vercel/Render/Railway y dominios configurados en `FRONT_URL`.
- El servidor incluye un keep-alive que consulta `/health` periodicamente para mantener activo el backend en despliegues tipo Railway.
- La API se inicia solo despues de conectar correctamente con MongoDB.
