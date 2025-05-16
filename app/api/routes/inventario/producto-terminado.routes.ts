import { Hono } from "hono";
import { productoTerminadoController } from "../../controllers/producto-terminado.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { permissionMiddleware } from "../../middlewares/permission.middleware";

const productoTerminadoRoutes = new Hono();

// Aplicar middleware de autenticación a todas las rutas
productoTerminadoRoutes.use("*", authMiddleware);

/**
 * @openapi
 * /api/v1/inventario/productos:
 *   get:
 *     summary: Obtiene todos los productos terminados
 *     description: Retorna una lista de productos terminados con opciones de filtrado
 *     tags:
 *       - Inventario
 *       - Productos Terminados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: codigo
 *         schema:
 *           type: string
 *         description: Filtrar por código del producto
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre del producto
 *       - in: query
 *         name: estilo
 *         schema:
 *           type: string
 *         description: Filtrar por estilo de cerveza
 *       - in: query
 *         name: presentacion
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de presentación
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado del producto
 *       - in: query
 *         name: stockBajo
 *         schema:
 *           type: boolean
 *         description: Filtrar productos con stock bajo
 *     responses:
 *       200:
 *         description: Lista de productos terminados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductoTerminado'
 *                 count:
 *                   type: integer
 *                   example: 10
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
productoTerminadoRoutes.get(
  "/",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getProductosTerminados
);

/**
 * @openapi
 * /api/v1/inventario/productos/stock-bajo:
 *   get:
 *     summary: Obtiene productos con stock bajo
 *     description: Retorna una lista de productos terminados cuyo stock actual está por debajo del mínimo
 *     tags:
 *       - Inventario
 *       - Productos Terminados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos con stock bajo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductoTerminado'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
productoTerminadoRoutes.get(
  "/stock-bajo",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getProductosTerminadosConStockBajo
);

/**
 * @openapi
 * /api/v1/inventario/productos/por-caducar:
 *   get:
 *     summary: Obtiene productos próximos a caducar
 *     description: Retorna una lista de productos terminados que están próximos a caducar
 *     tags:
 *       - Inventario
 *       - Productos Terminados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: diasUmbral
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Número de días para considerar como próximo a caducar
 *     responses:
 *       200:
 *         description: Lista de productos próximos a caducar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoteProductoDetalle'
 *                 count:
 *                   type: integer
 *                   example: 3
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
productoTerminadoRoutes.get(
  "/por-caducar",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getProductosTerminadosPorCaducar
);

/**
 * @openapi
 * /api/v1/inventario/productos/{id}:
 *   get:
 *     summary: Obtiene un producto terminado por ID
 *     description: Retorna los detalles de un producto terminado específico
 *     tags:
 *       - Inventario
 *       - Productos Terminados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto terminado
 *     responses:
 *       200:
 *         description: Detalles del producto terminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProductoTerminado'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.get(
  "/:id",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getProductoTerminadoById
);

/**
 * @openapi
 * /api/v1/inventario/productos:
 *   post:
 *     summary: Crea un nuevo producto terminado
 *     description: Crea un nuevo producto terminado en el sistema
 *     tags:
 *       - Inventario
 *       - Productos Terminados
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoTerminadoCreateInput'
 *     responses:
 *       201:
 *         description: Producto terminado creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Producto terminado creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/ProductoTerminado'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
productoTerminadoRoutes.post(
  "/",
  permissionMiddleware("inventario_modificar"),
  productoTerminadoController.createProductoTerminado
);

/**
 * @openapi
 * /api/v1/inventario/productos/{id}:
 *   put:
 *     summary: Actualiza un producto terminado
 *     description: Actualiza los datos de un producto terminado existente
 *     tags:
 *       - Inventario
 *       - Productos Terminados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto terminado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoTerminadoUpdateInput'
 *     responses:
 *       200:
 *         description: Producto terminado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Producto terminado actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/ProductoTerminado'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.put(
  "/:id",
  permissionMiddleware("inventario_modificar"),
  productoTerminadoController.updateProductoTerminado
);

/**
 * @openapi
 * /api/v1/inventario/productos/{id}:
 *   delete:
 *     summary: Elimina un producto terminado
 *     description: Elimina o marca como inactivo un producto terminado
 *     tags:
 *       - Inventario
 *       - Productos Terminados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto terminado
 *     responses:
 *       200:
 *         description: Producto terminado eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Producto terminado eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.delete(
  "/:id",
  permissionMiddleware("inventario_modificar"),
  productoTerminadoController.deleteProductoTerminado
);

/**
 * @openapi
 * /api/v1/inventario/productos/lotes:
 *   get:
 *     summary: Obtiene todos los lotes de productos
 *     description: Retorna una lista de lotes de productos con opciones de filtrado
 *     tags:
 *       - Inventario
 *       - Lotes de Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: codigoLote
 *         schema:
 *           type: string
 *         description: Filtrar por código de lote
 *       - in: query
 *         name: productoTerminadoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de producto terminado
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado del lote
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha de envasado desde
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar por fecha de envasado hasta
 *     responses:
 *       200:
 *         description: Lista de lotes de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoteProducto'
 *                 count:
 *                   type: integer
 *                   example: 15
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
productoTerminadoRoutes.get(
  "/lotes",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getLotesProducto
);

/**
 * @openapi
 * /api/v1/inventario/productos/lotes/{id}:
 *   get:
 *     summary: Obtiene un lote de producto por ID
 *     description: Retorna los detalles de un lote de producto específico
 *     tags:
 *       - Inventario
 *       - Lotes de Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del lote de producto
 *     responses:
 *       200:
 *         description: Detalles del lote de producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/LoteProductoDetalle'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.get(
  "/lotes/:id",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getLoteProductoById
);

/**
 * @openapi
 * /api/v1/inventario/productos/{productoTerminadoId}/lotes:
 *   get:
 *     summary: Obtiene lotes por producto terminado
 *     description: Retorna una lista de lotes asociados a un producto terminado específico
 *     tags:
 *       - Inventario
 *       - Lotes de Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoTerminadoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto terminado
 *     responses:
 *       200:
 *         description: Lista de lotes del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoteProducto'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.get(
  "/:productoTerminadoId/lotes",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getLotesByProductoTerminadoId
);

/**
 * @openapi
 * /api/v1/inventario/productos/lotes:
 *   post:
 *     summary: Crea un nuevo lote de producto
 *     description: Crea un nuevo lote de producto terminado
 *     tags:
 *       - Inventario
 *       - Lotes de Productos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoteProductoCreateInput'
 *     responses:
 *       201:
 *         description: Lote de producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lote de producto creado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/LoteProducto'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.post(
  "/lotes",
  permissionMiddleware("inventario_modificar"),
  productoTerminadoController.createLoteProducto
);

/**
 * @openapi
 * /api/v1/inventario/productos/lotes/{id}:
 *   put:
 *     summary: Actualiza un lote de producto
 *     description: Actualiza los datos de un lote de producto existente
 *     tags:
 *       - Inventario
 *       - Lotes de Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del lote de producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoteProductoUpdateInput'
 *     responses:
 *       200:
 *         description: Lote de producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lote de producto actualizado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/LoteProducto'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.put(
  "/lotes/:id",
  permissionMiddleware("inventario_modificar"),
  productoTerminadoController.updateLoteProducto
);

/**
 * @openapi
 * /api/v1/inventario/productos/lotes/{id}:
 *   delete:
 *     summary: Elimina un lote de producto
 *     description: Elimina o marca como bloqueado un lote de producto
 *     tags:
 *       - Inventario
 *       - Lotes de Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del lote de producto
 *     responses:
 *       200:
 *         description: Lote de producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Lote de producto eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.delete(
  "/lotes/:id",
  permissionMiddleware("inventario_modificar"),
  productoTerminadoController.deleteLoteProducto
);

/**
 * @openapi
 * /api/v1/inventario/productos/{productoTerminadoId}/movimientos:
 *   get:
 *     summary: Obtiene movimientos de inventario de un producto
 *     description: Retorna una lista de movimientos de inventario para un producto terminado específico
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoTerminadoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto terminado
 *     responses:
 *       200:
 *         description: Lista de movimientos de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MovimientoInventarioProducto'
 *                 count:
 *                   type: integer
 *                   example: 20
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.get(
  "/:productoTerminadoId/movimientos",
  permissionMiddleware("inventario_ver"),
  productoTerminadoController.getMovimientosInventarioProducto
);

/**
 * @openapi
 * /api/v1/inventario/productos/movimientos:
 *   post:
 *     summary: Crea un nuevo movimiento de inventario
 *     description: Registra un nuevo movimiento de inventario para un producto terminado
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovimientoInventarioProductoCreateInput'
 *     responses:
 *       201:
 *         description: Movimiento de inventario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Movimiento de inventario registrado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/MovimientoInventarioProducto'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
productoTerminadoRoutes.post(
  "/movimientos",
  permissionMiddleware("inventario_modificar"),
  productoTerminadoController.createMovimientoInventario
);

export { productoTerminadoRoutes }; 