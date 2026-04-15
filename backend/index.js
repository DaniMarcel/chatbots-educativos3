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


app.get("/", (_req, res) => res.send("🚀 API funcionando correctamente en Render"));

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
  // Render Free Tier: spinea tras 15 min de inactividad → ping cada 5 min es suficiente
  const KEEPALIVE_INTERVAL = 5 * 60 * 1000;

  // Contador de intentos fallidos consecutivos
  let fallosConsecutivos = 0;
  const MAX_FALLBACK_INTENTOS = 3;

  setInterval(async () => {
    try {
      // 1) Primero intenta /health (no requiere auth ni usuario válido)
      //    Cuenta como tráfico entrante para Render y es mucho más rápido que /api/login.
      const baseUrlLocal = `http://localhost:${port}`;
      const urlHealth = `${baseUrlLocal}/health`;

      console.log(`[Keep-Alive] 🔄 Ping a /health`);

      const resHealth = await fetch(urlHealth, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (resHealth.ok) {
        const data = await resHealth.json();
        fallosConsecutivos = 0; // reset
        console.log(`[Keep-Alive] ✅ Servidor activo | MongoDB state: ${data.mongo} (1=conectado)`);
        return;
      }

      // 2) Si /health falla repetidamente, intenta login con RUT como fallback
      fallosConsecutivos++;
      if (fallosConsecutivos <= MAX_FALLBACK_INTENTOS) {
        const RUT = process.env.KEEPALIVE_RUT || "16543646-6";
        const urlLogin = `${baseUrlLocal}/api/login`;

        console.log(`[Keep-Alive] ⚠️ /health falló, intento fallback con /api/login (RUT: ${RUT})`);

        const resLogin = await fetch(urlLogin, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rut: RUT })
        });

        const dataLogin = await resLogin.json();

        if (resLogin.ok && dataLogin.token) {
          console.log(`[Keep-Alive] ✅ Login fallback exitoso. DB y servidor activos.`);
          fallosConsecutivos = 0;
        } else {
          console.log(`[Keep-Alive] ⚠️ Fallback falló:`, dataLogin.msg || dataLogin);
        }
      } else {
        console.log(`[Keep-Alive] ⛔ Demasiados fallos consecutivos (${fallosConsecutivos}). Reintentando /health...`);
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