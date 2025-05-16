// src/index.ts
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { compress } from "hono/compress";
import { prettyJSON } from "hono/pretty-json";
import { createLogger } from "./utils/logger";

// Rutas de tu aplicación
import { inventarioRoutes } from "./routes/inventario.routes";
import { usuariosRoutes } from "./routes/usuarios.routes";
import { errorHandler } from "./middlewares/error-handler.middleware";

const app = new Hono();
const logg = createLogger('app');

// Get allowed origins from environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'http://localhost:3000']
  : ['http://localhost:3000', 'http://localhost:5174', 'localhost:5174'];

// Middlewares globales
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", compress());
app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
    credentials: true,
  }),
);
app.use("*", secureHeaders());
app.use("*", errorHandler);

// Ruta de prueba - ahora con /api prefix
app.get("/api/hello", (c) => {
  logg.info({ path: c.req.path }, "Hello endpoint called");
  return c.json({
    message: "Hello from La Cantera API!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    path: c.req.path
  });
});

// Ruta de estado - ahora con /api prefix
app.get("/api/status", (c) => {
  logg.info({ path: c.req.path }, "Status endpoint called");
  return c.json({
    status: "ok",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
    path: c.req.path
  });
});

// Rutas de la API - ahora con /api prefix
app.route("/api/v1/inventario", inventarioRoutes);
app.route("/api/v1/usuarios", usuariosRoutes);

// Manejo de errores global
app.onError((err, c) => {
  logg.error({ error: err, path: c.req.path }, "Error en app.onError");
  return c.json(
    {
      success: false,
      error: "Error interno del servidor",
      message: err.message,
      path: c.req.path
    },
    500,
  );
});

// Manejo de not found
app.notFound((c) => {
  logg.warn({ path: c.req.path }, "Ruta no encontrada");
  return c.json(
    {
      success: false,
      error: "Ruta no encontrada",
      path: c.req.path,
      availableRoutes: [
        "/api/hello",
        "/api/status",
        "/api/v1/inventario/*",
        "/api/v1/usuarios/*"
      ]
    },
    404,
  );
});

export default app;