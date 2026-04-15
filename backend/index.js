// index.js
require("dotenv").config();

// Registra modelos base (y crea índices en arranque)
require("./models/Admin");
require("./models/Chatbot");
require("./models/AlumnoChatbot"); // 👈 opcional pero recomendado

const express  = require("express");
const cors     = require("cors");
const mongoose = require("mongoose");

const app = express();
app.disable("x-powered-by");

/* ====== CORS ====== */
const ALLOWED_STATIC = new Set([
  "capacitor://localhost", // Origen para Capacitor en Android/iOS
  "https://localhost", // Para apps nativas con Capacitor
  "http://localhost",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://chatbots-educativos3.vercel.app",
  "https://www.masoterapiachile-ia.cl",
  "https://masoterapiachile-ia.cl",
  "null", // Origen vacío común en WebViews móviles
  "file://", // Para archivos locales en apps
]);

if (process.env.FRONT_URL) {
  try {
    const u = new URL(process.env.FRONT_URL);
    ALLOWED_STATIC.add(`${u.protocol}//${u.host}`);
  } catch {}
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // Permitir orígenes vacíos
  if (ALLOWED_STATIC.has(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i.test(origin)) return true;
  return false;
}

app.use((req, _res, next) => {
  console.log("[REQ]", req.method, req.path, "Origin:", req.headers.origin || "—");
  next();
});

app.use(cors({
  origin(origin, cb) { cb(null, isAllowedOrigin(origin)); },
  credentials: true,
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
}));

app.use((req, res, next) => { if (req.method === "OPTIONS") return res.sendStatus(204); next(); });

/* ====== Parsers ====== */
app.use(express.json({ limit: "2mb" }));
const path = require("path");


/* ====== Rutas ====== */
// Nota: cada prefijo montado **una sola vez**
app.use("/api",          require("./routes/auth"));
app.use("/api/upload",   require("./routes/upload"));
app.use("/api/admin",    require("./routes/admin"));
app.use("/api/visitas",  require("./routes/visita"));
app.use("/api/alumnos",  require("./routes/alumno"));
app.use("/api/cursos",   require("./routes/cursos"));
app.use("/api/chatbots", require("./routes/chatbots"));             // ✅ una vez
app.use("/api/password", require("./routes/password"));
console.log("MONTADA: /api/password");
app.use("/api/chatbot-categorias", require("./routes/chatbot-categorias"));
app.use("/api", require("./routes/alumno-chatbots"));              // endpoints de permisos
app.use("/api/guest-panel", require("./routes/guest-panel"));
app.use("/api/guest-panel/config", require("./routes/guest-panel-config"));


app.get("/", (_req, res) => res.send("🚀 API funcionando correctamente en Railway"));

app.get("/health", async (_req, res) => {
  try {
    // Verificar que MongoDB sigue conectado
    const mongoState = mongoose.connection.readyState;
    if (mongoState === 1) {
      // 1 = conectado, hacer ping rápido a la DB
      await mongoose.connection.db?.admin()?.ping();
      return res.json({ ok: true, mongo: "connected", timestamp: new Date().toISOString() });
    } else {
      return res.status(503).json({
        ok: false,
        mongo: "disconnected",
        state: mongoState,
        detail: "MongoDB no está conectado. Intentando reconectar..."
      });
    }
  } catch (err) {
    return res.status(503).json({ ok: false, mongo: "error", detail: err.message });
  }
});

/* ====== Mantenedor de Actividad (Auto-Login) ====== */
function iniciarKeepAlive(port) {
  // Railway: spinea tras ~15 min de inactividad (plan trial/credits) → ping cada 5 min
  // Si usas plan serverless, spinea tras ~5 min → en ese caso baja a 3 min.
  const KEEPALIVE_INTERVAL = 5 * 60 * 1000;

  // URL pública del backend (Railway asigna una URL .up.railway.app)
  const RAILWAY_URL = process.env.RAILWAY_PUBLIC_URL
    || process.env.BACKEND_URL
    || `http://localhost:${port}`;

  // Contador de intentos fallidos consecutivos
  let fallosConsecutivos = 0;
  const MAX_FALLBACK_INTENTOS = 3;

  setInterval(async () => {
    try {
      // 1) Primero intenta /health (no requiere auth ni usuario válido)
      //    Cuenta como tráfico entrante para Railway y es mucho más rápido que /api/login.
      const urlHealth = `${RAILWAY_URL}/health`;

      console.log(`[Keep-Alive] 🔄 Ping a /health → ${urlHealth}`);

      const resHealth = await fetch(urlHealth, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (resHealth.ok) {
        const data = await resHealth.json();
        fallosConsecutivos = 0; // reset
        console.log(`[Keep-Alive] ✅ Railway activo | MongoDB: ${data.mongo}`);
        return;
      }

      // 2) Si /health falla, intenta localhost como fallback (el servidor local siempre está vivo)
      fallosConsecutivos++;
      if (fallosConsecutivos <= MAX_FALLBACK_INTENTOS) {
        const urlLocal = `http://localhost:${port}/health`;

        console.log(`[Keep-Alive] ⚠️ /health externo falló, verificando localhost...`);

        const resLocal = await fetch(urlLocal, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (resLocal.ok) {
          const dataLocal = await resLocal.json();
          console.log(`[Keep-Alive] ✅ Proceso vivo localmente | MongoDB: ${dataLocal.mongo}`);
          console.log(`[Keep-Alive] ⚠️ Si Railway spinea, considera usar UptimeRobot para ping externo`);
          fallosConsecutivos = 0;
        }
      } else {
        console.log(`[Keep-Alive] ⛔ Demasiados fallos consecutivos (${fallosConsecutivos})`);
      }
    } catch (error) {
      fallosConsecutivos++;
      console.error(`[Keep-Alive] ❌ Error de red (fallos: ${fallosConsecutivos}):`, error.message);
    }
  }, KEEPALIVE_INTERVAL);
}

/* ====== Start AFTER DB connect ====== */
(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Falta MONGO_URI");

    mongoose.set("bufferCommands", false);
    mongoose.connection.on("connected", () => console.log("✅ MongoDB conectado"));
    mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,   // timeout para seleccionar servidor (10s)
      socketTimeoutMS: 30000,            // timeout por operación (30s)
      connectTimeoutMS: 10000,           // timeout de conexión inicial (10s)
      maxPoolSize: 10,                   // máximo de conexiones simultáneos
      minPoolSize: 1,                    // mantener al menos 1 conexión abierta
      heartbeatFrequencyMS: 10000,       // chequear conexión cada 10s
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Backend corriendo en puerto ${PORT}`);
      iniciarKeepAlive(PORT); // <--- Llamada a nuestra función mantenedora
    });
  } catch (err) {
    console.error("No se pudo iniciar el servidor:", err);
    process.exit(1);
  }
})();