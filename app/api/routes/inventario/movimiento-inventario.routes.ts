import { Hono } from 'hono';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { permissionMiddleware } from '../../middlewares/permission.middleware';
import { createMovimientoInventarioController } from '../../controllers/movimiento-inventario.controller';
import { MovimientoInventarioService } from '../../services/movimiento-inventario.service';
import { PrismaMovimientoInventarioRepository } from '../../repositories/movimiento-inventario.repository';
import getPrismaClient from '../../lib/prisma';

// Instanciar dependencias
const prisma = getPrismaClient;
const movimientoInventarioRepository = new PrismaMovimientoInventarioRepository(prisma);

// Inyección de dependencias para acceder al repositorio de materia prima y producto terminado
const materiaPrimaRepository = prisma.materiaPrima ? 
  { 
    getMateriaPrimaById: (id: number) => prisma.materiaPrima.findUnique({ where: { id } }),
    getLoteMateriaPrimaById: (id: number) => prisma.loteMateriaPrima.findUnique({ where: { id } }),
    updateLoteMateriaPrima: (id: number, data: any) => prisma.loteMateriaPrima.update({ where: { id }, data }),
    actualizarStockMateriaPrima: async (id: number, cantidad: number, tipo: 'Entrada' | 'Salida') => {
      const materiaPrima = await prisma.materiaPrima.findUnique({ where: { id } });
      if (!materiaPrima) throw new Error(`Materia prima con ID ${id} no encontrada`);
      
      const stockActual = materiaPrima.stockActual.toNumber();
      const nuevoStock = tipo === 'Entrada' ? 
        stockActual + cantidad : 
        stockActual - cantidad;
      
      return prisma.materiaPrima.update({
        where: { id },
        data: { stockActual: nuevoStock }
      });
    }
  } : null;

const productoTerminadoRepository = prisma.productoTerminado ? 
  {
    getProductoTerminadoById: (id: number) => prisma.productoTerminado.findUnique({ where: { id } }),
    getLoteProductoById: (id: number) => prisma.loteProducto.findUnique({ where: { id } }),
    updateLoteProducto: (id: number, data: any) => prisma.loteProducto.update({ where: { id }, data }),
    actualizarStockProductoTerminado: async (id: number, cantidad: number, tipo: 'Entrada' | 'Salida') => {
      const productoTerminado = await prisma.productoTerminado.findUnique({ where: { id } });
      if (!productoTerminado) throw new Error(`Producto terminado con ID ${id} no encontrado`);
      
      const stockActual = productoTerminado.stockActual.toNumber();
      const nuevoStock = tipo === 'Entrada' ? 
        stockActual + cantidad : 
        stockActual - cantidad;
      
      return prisma.productoTerminado.update({
        where: { id },
        data: { stockActual: nuevoStock }
      });
    }
  } : null;

// Servicio y controlador
const movimientoInventarioService = new MovimientoInventarioService(
  movimientoInventarioRepository,
  materiaPrimaRepository as any,
  productoTerminadoRepository as any
);

const movimientoInventarioController = createMovimientoInventarioController(movimientoInventarioService);

// Rutas
const movimientoInventarioRoutes = new Hono();

// Aplicar middleware de autenticación a todas las rutas
movimientoInventarioRoutes.use("*", authMiddleware);

/**
 * @openapi
 * /api/v1/inventario/movimientos:
 *   get:
 *     summary: Obtiene todos los movimientos de inventario
 *     description: Retorna una lista de movimientos de inventario con opciones de filtrado
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
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
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde esta fecha
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta esta fecha
 *       - in: query
 *         name: tipoMovimiento
 *         schema:
 *           type: string
 *           enum: [Entrada, Salida, Ajuste Positivo, Ajuste Negativo]
 *         description: Filtrar por tipo de movimiento
 *       - in: query
 *         name: tipoElemento
 *         schema:
 *           type: string
 *           enum: [MateriaPrima, ProductoTerminado]
 *         description: Filtrar por tipo de elemento
 *       - in: query
 *         name: elementoId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del elemento
 *       - in: query
 *         name: loteId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del lote
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del usuario
 *       - in: query
 *         name: documentoReferencia
 *         schema:
 *           type: string
 *         description: Filtrar por referencia de documento
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
 *                     $ref: '#/components/schemas/MovimientoInventario'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
movimientoInventarioRoutes.get(
  '/',
  permissionMiddleware('inventario_ver'),
  movimientoInventarioController.getAllMovimientos
);

/**
 * @openapi
 * /api/v1/inventario/movimientos:
 *   post:
 *     summary: Crea un nuevo movimiento de inventario
 *     description: Registra un nuevo movimiento de inventario y actualiza los stocks automáticamente
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
 *                 enum: [Entrada, Salida, Ajuste Positivo, Ajuste Negativo]
 *                 description: Tipo de movimiento
 *               tipoElemento:
 *                 type: string
 *                 enum: [MateriaPrima, ProductoTerminado]
 *                 description: Tipo de elemento
 *               elementoId:
 *                 type: integer
 *                 description: ID del elemento
 *               loteId:
 *                 type: integer
 *                 description: ID del lote (opcional)
 *               cantidad:
 *                 type: number
 *                 description: Cantidad del movimiento
 *               unidadMedida:
 *                 type: string
 *                 description: Unidad de medida
 *               documentoReferencia:
 *                 type: string
 *                 description: Documento de referencia (opcional)
 *               referenciaId:
 *                 type: integer
 *                 description: ID de referencia (opcional)
 *               motivo:
 *                 type: string
 *                 description: Motivo del movimiento (opcional)
 *               notas:
 *                 type: string
 *                 description: Notas adicionales (opcional)
 *     responses:
 *       201:
 *         description: Movimiento de inventario creado exitosamente
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
 *                   $ref: '#/components/schemas/MovimientoInventario'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
movimientoInventarioRoutes.post(
  '/',
  permissionMiddleware('inventario_modificar'),
  movimientoInventarioController.createMovimiento
);

/**
 * @openapi
 * /api/v1/inventario/movimientos/tipo/{tipoElemento}:
 *   get:
 *     summary: Obtiene movimientos por tipo de elemento
 *     description: Retorna una lista de movimientos filtrados por tipo de elemento (MateriaPrima o ProductoTerminado)
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoElemento
 *         required: true
 *         schema:
 *           type: string
 *           enum: [MateriaPrima, ProductoTerminado]
 *         description: Tipo de elemento (MateriaPrima o ProductoTerminado)
 *       - in: query
 *         name: elementoId
 *         schema:
 *           type: integer
 *         description: ID del elemento específico (opcional)
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
 *         description: Lista de movimientos filtrados por tipo de elemento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MovimientoInventario'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
movimientoInventarioRoutes.get(
  '/tipo/:tipoElemento',
  permissionMiddleware('inventario_ver'),
  movimientoInventarioController.getMovimientosByTipoElemento
);

/**
 * @openapi
 * /api/v1/inventario/movimientos/reportes:
 *   get:
 *     summary: Genera reportes avanzados de movimientos
 *     description: Retorna estadísticas y reportes agregados de movimientos de inventario
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
 *       - Reportes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar desde esta fecha
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar hasta esta fecha
 *       - in: query
 *         name: tipoElemento
 *         schema:
 *           type: string
 *           enum: [MateriaPrima, ProductoTerminado]
 *         description: Filtrar por tipo de elemento
 *     responses:
 *       200:
 *         description: Reporte de movimientos de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MovimientoInventarioReporte'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
movimientoInventarioRoutes.get(
  '/reportes',
  permissionMiddleware('inventario_ver'),
  movimientoInventarioController.getReporteMovimientos
);

/**
 * @openapi
 * /api/v1/inventario/movimientos/detallados:
 *   get:
 *     summary: Obtiene movimientos con información detallada
 *     description: Retorna movimientos de inventario con información adicional de elementos y lotes
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
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
 *         description: Lista de movimientos detallados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MovimientoInventarioDetallado'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
movimientoInventarioRoutes.get(
  '/detallados',
  permissionMiddleware('inventario_ver'),
  movimientoInventarioController.getMovimientosDetallados
);

/**
 * @openapi
 * /api/v1/inventario/movimientos/{id}:
 *   get:
 *     summary: Obtiene un movimiento de inventario por ID
 *     description: Retorna los detalles de un movimiento de inventario específico
 *     tags:
 *       - Inventario
 *       - Movimientos de Inventario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del movimiento de inventario
 *     responses:
 *       200:
 *         description: Detalles del movimiento de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MovimientoInventario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
movimientoInventarioRoutes.get(
  '/:id',
  permissionMiddleware('inventario_ver'),
  movimientoInventarioController.getMovimientoById
);

export { movimientoInventarioRoutes }; 