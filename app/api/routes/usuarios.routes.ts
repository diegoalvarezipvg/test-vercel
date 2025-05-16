import { Hono } from "hono";
import { authController } from "../controllers/auth.controller";
import { usuarioController } from "../controllers/usuario.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { permissionMiddleware } from "../middlewares/permission.middleware";

const usuariosRoutes = new Hono();

// Rutas públicas de autenticación
/**
 * @openapi
 * /api/v1/usuarios/auth/login:
 *   post:
 *     summary: Inicia sesión en el sistema
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email de usuario
 *               password:
 *                 type: string
 *                 description: Contraseña
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token de autenticación
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombreUsuario:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     email:
 *                       type: string
 *                     rol:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
usuariosRoutes.post("/auth/login", authController.login);
usuariosRoutes.post("/auth/register", authController.register);
usuariosRoutes.post("/auth/refresh-token", authController.refreshToken);
usuariosRoutes.post(
  "/auth/reset-password-request",
  authController.resetPasswordRequest,
);
usuariosRoutes.post("/auth/update-password", authController.updatePassword);
usuariosRoutes.post("/auth/verify-token", authController.verifyToken);

// Rutas protegidas de autenticación
usuariosRoutes.use("/auth/*", authMiddleware);
usuariosRoutes.post("/auth/logout", authController.logout);
usuariosRoutes.post("/auth/change-password", authController.changePassword);
usuariosRoutes.get("/auth/profile", authController.getProfile);

// Rutas de usuarios (todas protegidas)
usuariosRoutes.use("/usuarios/*", authMiddleware);

// Rutas de consulta
/**
 * @openapi
 * /api/v1/usuarios/usuarios:
 *   get:
 *     summary: Obtiene la lista de usuarios
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombreUsuario:
 *                         type: string
 *                       nombre:
 *                         type: string
 *                       apellido:
 *                         type: string
 *                       email:
 *                         type: string
 *                       rol:
 *                         type: string
 *                       estado:
 *                         type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
usuariosRoutes.get(
  "/usuarios",
  permissionMiddleware("administracion_ver"),
  usuarioController.getUsuarios,
);

/**
 * @openapi
 * /api/v1/usuarios/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombreUsuario:
 *                   type: string
 *                 nombre:
 *                   type: string
 *                 apellido:
 *                   type: string
 *                 email:
 *                   type: string
 *                 telefono:
 *                   type: string
 *                 rol:
 *                   type: string
 *                 estado:
 *                   type: string
 *                 fechaCreacion:
 *                   type: string
 *                   format: date-time
 *                 ultimoAcceso:
 *                   type: string
 *                   format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
usuariosRoutes.get(
  "/usuarios/:id",
  permissionMiddleware("administracion_ver"),
  usuarioController.getUsuarioById,
);

/**
 * @openapi
 * /api/v1/usuarios/usuarios/{id}/permisos:
 *   get:
 *     summary: Obtiene los permisos de un usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Permisos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 permisos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombrePermiso:
 *                         type: string
 *                       modulo:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
usuariosRoutes.get(
  "/usuarios/:id/permisos",
  permissionMiddleware("administracion_ver"),
  usuarioController.getUsuarioConPermisos,
);

// Rutas de modificación
/**
 * @openapi
 * /api/v1/usuarios/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreUsuario
 *               - nombre
 *               - apellido
 *               - email
 *               - password
 *               - rol
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombreUsuario:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
usuariosRoutes.post(
  "/usuarios",
  permissionMiddleware("administracion_modificar"),
  usuarioController.createUsuario,
);

/**
 * @openapi
 * /api/v1/usuarios/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
usuariosRoutes.put(
  "/usuarios/:id",
  permissionMiddleware("administracion_modificar"),
  usuarioController.updateUsuario,
);

/**
 * @openapi
 * /api/v1/usuarios/usuarios/{id}:
 *   delete:
 *     summary: Elimina un usuario
 *     tags:
 *       - Usuarios
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
usuariosRoutes.delete(
  "/usuarios/:id",
  permissionMiddleware("administracion_modificar"),
  usuarioController.deleteUsuario,
);

export { usuariosRoutes };
