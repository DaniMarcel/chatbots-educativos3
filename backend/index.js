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
app.get("/health", (_req, res) => res.json({ ok: true, mongo: mongoose.connection.readyState })); // 1=ok

/* ====== Mantenedor de Actividad (Auto-Login) ====== */
function iniciarKeepAlive(port) {
  const KEEPALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutos en milisegundos
  
  setInterval(async () => {
    try {
      // Puedes usar variables de entorno en Railway si en el futuro cambias el RUT,
      // pero por defecto usaré el RUT del alumno que indicaste.
      const RUT = process.env.KEEPALIVE_RUT || "16543646-6";

      // Usar la URL pública en producción si está disponible, sino localhost
      const baseUrl = process.env.BACKEND_URL || `http://localhost:${port}`;
      const url = `${baseUrl}/api/login`;

      console.log(`[Keep-Alive] 🔄 Realizando login automático (cada 10 min) con RUT: ${RUT}`);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviamos únicamente el RUT (sin contraseña, tal como entran los alumnos)
        body: JSON.stringify({ rut: RUT })
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        console.log(`[Keep-Alive] ✅ Login exitoso. Servidor activo.`);
      } else {
        console.log(`[Keep-Alive] ⚠️ Fallo el login (pero el request se hizo):`, data.msg || data);
      }
    } catch (error) {
      console.error(`[Keep-Alive] ❌ Error al intentar login:`, error.message);
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
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
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