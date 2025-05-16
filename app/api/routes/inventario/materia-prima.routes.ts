import { Hono } from 'hono';
import { materiaPrimaController } from "../../controllers/materia-prima.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { permissionMiddleware } from "../../middlewares/permission.middleware";

const materiaPrimaRoutes = new Hono();

// Aplicar middleware de autenticación a todas las rutas
materiaPrimaRoutes.use("*", authMiddleware);

// Rutas para Materias Primas
/**
 * @openapi
 * /api/v1/inventario/materias-primas:
 *   get:
 *     summary: Obtiene todas las materias primas
 *     tags:
 *       - Materias Primas
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Lúpulo, Malta, Levadura, Agua, Otro]
 *         description: Filtrar por tipo de materia prima
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Inactivo, Agotado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de materias primas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/MateriaPrima"
 *                 pagination:
 *                   $ref: "#/components/schemas/Pagination"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 */
materiaPrimaRoutes.get(
  "/",
  permissionMiddleware("inventario_ver"),
  materiaPrimaController.getMateriasPrimas,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas:
 *   post:
 *     summary: Crea una nueva materia prima
 *     tags:
 *       - Materias Primas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nombre
 *               - tipo
 *               - unidadMedida
 *             properties:
 *               codigo:
 *                 type: string
 *                 description: Código único de la materia prima
 *               nombre:
 *                 type: string
 *                 description: Nombre de la materia prima
 *               tipo:
 *                 type: string
 *                 enum: [Lúpulo, Malta, Levadura, Agua, Otro]
 *                 description: Tipo de materia prima
 *               subtipo:
 *                 type: string
 *                 description: Subtipo de materia prima
 *               unidadMedida:
 *                 type: string
 *                 enum: [kg, g, l, ml, unidad]
 *                 description: Unidad de medida
 *               stockMinimo:
 *                 type: number
 *                 description: Stock mínimo requerido
 *               ubicacionFisica:
 *                 type: string
 *                 description: Ubicación física en el almacén
 *               atributosEspecificos:
 *                 type: object
 *                 description: Atributos específicos según el tipo
 *               notas:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       201:
 *         description: Materia prima creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MateriaPrima"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 */
materiaPrimaRoutes.post(
  "/",
  permissionMiddleware("inventario_modificar"),
  materiaPrimaController.createMateriaPrima,
);

// Manejador para errores comunes de rutas
materiaPrimaRoutes.get(
  "/lote",
  (c) => {
    return c.json({
      success: false,
      message: "Ruta incorrecta. Para acceder a los lotes, use /materias-primas/lotes",
      rutas_sugeridas: [
        "/api/v1/inventario/materias-primas/lotes", 
        "/api/v1/inventario/materias-primas/lotes/:id"
      ]
    }, 400);
  }
);

// Rutas para Lotes de Materias Primas
/**
 * @openapi
 * /api/v1/inventario/materias-primas/lotes:
 *   get:
 *     summary: Obtiene todos los lotes de materias primas
 *     tags:
 *       - Lotes Materias Primas
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
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Disponible, Agotado, Caducado, Reservado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de lotes de materias primas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/LoteMateriaPrima"
 *                 pagination:
 *                   $ref: "#/components/schemas/Pagination"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 */
materiaPrimaRoutes.get(
  "/lotes",
  permissionMiddleware("inventario_ver"),
  materiaPrimaController.getLotesMateriasPrimas,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/lotes/{id}:
 *   get:
 *     summary: Obtiene un lote de materia prima por su ID
 *     tags:
 *       - Lotes Materias Primas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del lote
 *     responses:
 *       200:
 *         description: Lote de materia prima encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoteMateriaPrima"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.get(
  "/lotes/:id",
  permissionMiddleware("inventario_ver"),
  materiaPrimaController.getLoteMateriaPrimaById,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/lotes:
 *   post:
 *     summary: Crea un nuevo lote de materia prima
 *     tags:
 *       - Lotes Materias Primas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - materiaPrimaId
 *               - codigoLote
 *               - proveedorId
 *               - fechaRecepcion
 *               - cantidad
 *             properties:
 *               materiaPrimaId:
 *                 type: integer
 *                 description: ID de la materia prima
 *               codigoLote:
 *                 type: string
 *                 description: Código único del lote
 *               proveedorId:
 *                 type: integer
 *                 description: ID del proveedor
 *               fechaRecepcion:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de recepción
 *               fechaProduccion:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de producción
 *               fechaCaducidad:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de caducidad
 *               cantidad:
 *                 type: number
 *                 description: Cantidad total del lote
 *               precio:
 *                 type: number
 *                 description: Precio unitario
 *               ordenCompraId:
 *                 type: integer
 *                 description: ID de la orden de compra
 *               notas:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       201:
 *         description: Lote creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoteMateriaPrima"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 */
materiaPrimaRoutes.post(
  "/lotes",
  permissionMiddleware("inventario_modificar"),
  materiaPrimaController.createLoteMateriaPrima,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/lotes/{id}:
 *   put:
 *     summary: Actualiza un lote de materia prima existente
 *     tags:
 *       - Lotes Materias Primas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del lote
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidadDisponible:
 *                 type: number
 *                 description: Cantidad disponible
 *               estado:
 *                 type: string
 *                 enum: [Disponible, Agotado, Caducado, Reservado]
 *                 description: Estado del lote
 *               notas:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Lote actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoteMateriaPrima"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.put(
  "/lotes/:id",
  permissionMiddleware("inventario_modificar"),
  materiaPrimaController.updateLoteMateriaPrima,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/lotes/{id}:
 *   delete:
 *     summary: Elimina un lote de materia prima
 *     tags:
 *       - Lotes Materias Primas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del lote
 *     responses:
 *       200:
 *         description: Lote eliminado exitosamente
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.delete(
  "/lotes/:id",
  permissionMiddleware("inventario_modificar"),
  materiaPrimaController.deleteLoteMateriaPrima,
);

// Rutas para Movimientos de Inventario
/**
 * @openapi
 * /api/v1/inventario/materias-primas/movimientos:
 *   post:
 *     summary: Crea un nuevo movimiento de inventario
 *     tags:
 *       - Movimientos Inventario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoMovimiento
 *               - tipoElemento
 *               - elementoId
 *               - cantidad
 *               - unidadMedida
 *             properties:
 *               tipoMovimiento:
 *                 type: string
 *                 enum: [entrada, salida, ajuste]
 *                 description: Tipo de movimiento
 *               tipoElemento:
 *                 type: string
 *                 enum: [materia_prima, producto_terminado]
 *                 description: Tipo de elemento
 *               elementoId:
 *                 type: integer
 *                 description: ID del elemento
 *               loteId:
 *                 type: integer
 *                 description: ID del lote
 *               cantidad:
 *                 type: number
 *                 description: Cantidad del movimiento
 *               unidadMedida:
 *                 type: string
 *                 description: Unidad de medida
 *               documentoReferencia:
 *                 type: string
 *                 description: Documento de referencia
 *               referenciaId:
 *                 type: integer
 *                 description: ID de referencia
 *               motivo:
 *                 type: string
 *                 description: Motivo del movimiento
 *               notas:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       201:
 *         description: Movimiento de inventario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MovimientoInventario"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 */
materiaPrimaRoutes.post(
  "/movimientos",
  permissionMiddleware("inventario_modificar"),
  materiaPrimaController.createMovimientoInventario,
);

// AHORA colocamos las rutas con parámetros dinámicos como /:id
/**
 * @openapi
 * /api/v1/inventario/materias-primas/{id}:
 *   get:
 *     summary: Obtiene una materia prima por su ID
 *     tags:
 *       - Materias Primas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la materia prima
 *     responses:
 *       200:
 *         description: Materia prima encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MateriaPrima"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.get(
  "/:id",
  permissionMiddleware("inventario_ver"),
  materiaPrimaController.getMateriaPrimaById,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/{id}:
 *   put:
 *     summary: Actualiza una materia prima existente
 *     tags:
 *       - Materias Primas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la materia prima
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la materia prima
 *               tipo:
 *                 type: string
 *                 enum: [Lúpulo, Malta, Levadura, Agua, Otro]
 *                 description: Tipo de materia prima
 *               subtipo:
 *                 type: string
 *                 description: Subtipo de materia prima
 *               unidadMedida:
 *                 type: string
 *                 enum: [kg, g, l, ml, unidad]
 *                 description: Unidad de medida
 *               stockMinimo:
 *                 type: number
 *                 description: Stock mínimo requerido
 *               ubicacionFisica:
 *                 type: string
 *                 description: Ubicación física en el almacén
 *               atributosEspecificos:
 *                 type: object
 *                 description: Atributos específicos según el tipo
 *               estado:
 *                 type: string
 *                 enum: [Activo, Inactivo, Agotado]
 *                 description: Estado de la materia prima
 *               notas:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Materia prima actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MateriaPrima"
 *       400:
 *         $ref: "#/components/responses/ValidationError"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.put(
  "/:id",
  permissionMiddleware("inventario_modificar"),
  materiaPrimaController.updateMateriaPrima,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/{id}:
 *   delete:
 *     summary: Elimina una materia prima
 *     tags:
 *       - Materias Primas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la materia prima
 *     responses:
 *       200:
 *         description: Materia prima eliminada exitosamente
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.delete(
  "/:id",
  permissionMiddleware("inventario_modificar"),
  materiaPrimaController.deleteMateriaPrima,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/{materiaPrimaId}/lotes:
 *   get:
 *     summary: Obtiene los lotes de una materia prima específica
 *     tags:
 *       - Lotes Materias Primas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materiaPrimaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la materia prima
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Disponible, Agotado, Caducado, Reservado]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de lotes de la materia prima
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/LoteMateriaPrima"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.get(
  "/:materiaPrimaId/lotes",
  permissionMiddleware("inventario_ver"),
  materiaPrimaController.getLotesByMateriaPrimaId,
);

/**
 * @openapi
 * /api/v1/inventario/materias-primas/{materiaPrimaId}/movimientos:
 *   get:
 *     summary: Obtiene los movimientos de inventario de una materia prima
 *     tags:
 *       - Movimientos Inventario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: materiaPrimaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la materia prima
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
 *         description: Lista de movimientos de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/MovimientoInventario"
 *                 pagination:
 *                   $ref: "#/components/schemas/Pagination"
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *       403:
 *         $ref: "#/components/responses/ForbiddenError"
 *       404:
 *         $ref: "#/components/responses/NotFoundError"
 */
materiaPrimaRoutes.get(
  "/:materiaPrimaId/movimientos",
  permissionMiddleware("inventario_ver"),
  materiaPrimaController.getMovimientosInventarioMateriaPrima,
);

export { materiaPrimaRoutes };
