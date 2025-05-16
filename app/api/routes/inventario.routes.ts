import { Hono } from "hono";
import { materiaPrimaRoutes } from "./inventario/materia-prima.routes";
import { productoTerminadoRoutes } from "./inventario/producto-terminado.routes";
import { movimientoInventarioRoutes } from "./inventario/movimiento-inventario.routes";

const inventarioRoutes = new Hono();

/**
 * @openapi
 * tags:
 *   name: Inventario
 *   description: Gestión del inventario de la cervecería
 */

// Rutas de Materias Primas
/**
 * @openapi
 * /api/v1/inventario/materias-primas:
 *   get:
 *     summary: Obtiene todas las materias primas
 *     tags:
 *       - Inventario
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
 *         description: Filtrar por tipo de materia prima
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
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
 *                     $ref: '#/components/schemas/MateriaPrima'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
inventarioRoutes.route("/materias-primas", materiaPrimaRoutes);

/**
 * @openapi
 * /api/v1/inventario/productos:
 *   get:
 *     summary: Obtiene todos los productos terminados
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
 *         description: Filtrar por código
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre
 *       - in: query
 *         name: estilo
 *         schema:
 *           type: string
 *         description: Filtrar por estilo de cerveza
 *       - in: query
 *         name: presentacion
 *         schema:
 *           type: string
 *         description: Filtrar por presentación
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductoTerminado'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
inventarioRoutes.route("/productos", productoTerminadoRoutes);

// Rutas de Movimientos de Inventario
/**
 * @openapi
 * /api/v1/inventario/movimientos:
 *   get:
 *     summary: Gestión centralizada de movimientos de inventario
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
 *     security:
 *       - bearerAuth: []
 *     description: Endpoint para la gestión completa de movimientos de inventario, incluyendo reportes y consultas avanzadas
 */
inventarioRoutes.route("/movimientos", movimientoInventarioRoutes);

// Aquí puedes agregar otras subrutas del módulo de inventario
// Ejemplo: Envases Retornables, etc.

export { inventarioRoutes };
