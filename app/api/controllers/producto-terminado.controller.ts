import { Context } from 'hono';
import prisma from '../lib/prisma';
import { ProductoTerminadoService } from '../services/producto-terminado.service';
import { createLogger } from '../utils/logger';
import { validateId, toDecimal } from '../utils/helpers';

const productoTerminadoService = new ProductoTerminadoService(prisma);
const logger = createLogger('productoTerminadoController');

export const productoTerminadoController = {
  // Controladores para Productos Terminados
  getProductosTerminados: async (c: Context) => {
    try {
      const filtros = c.req.query();
      const productos = await productoTerminadoService.getProductosTerminados(filtros);
      
      return c.json({
        success: true,
        data: productos,
        count: productos.length
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener productos terminados');
      throw error;
    }
  },

  getProductoTerminadoById: async (c: Context) => {
    try {
      const id = validateId(c.req.param('id'), 'producto terminado');
      
      const producto = await productoTerminadoService.getProductoTerminadoById(id);
      
      return c.json({
        success: true,
        data: producto
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al obtener producto terminado por ID');
      throw error;
    }
  },

  createProductoTerminado: async (c: Context) => {
    try {
      const body = await c.req.json();
      
      // Convertir valores numéricos
      if (body.capacidad) {
        body.capacidad = toDecimal(body.capacidad);
      }
      if (body.stockMinimo) {
        body.stockMinimo = toDecimal(body.stockMinimo);
      }
      if (body.precioBase) {
        body.precioBase = toDecimal(body.precioBase);
      }
      
      const producto = await productoTerminadoService.createProductoTerminado(body);
      
      return c.json({
        success: true,
        message: 'Producto terminado creado exitosamente',
        data: producto
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Error al crear producto terminado');
      throw error;
    }
  },

  updateProductoTerminado: async (c: Context) => {
    try {
      const id = validateId(c.req.param('id'), 'producto terminado');
      
      const body = await c.req.json();
      
      // Convertir valores numéricos
      if (body.capacidad) {
        body.capacidad = toDecimal(body.capacidad);
      }
      if (body.stockMinimo) {
        body.stockMinimo = toDecimal(body.stockMinimo);
      }
      if (body.precioBase) {
        body.precioBase = toDecimal(body.precioBase);
      }
      
      const producto = await productoTerminadoService.updateProductoTerminado(id, body);
      
      return c.json({
        success: true,
        message: 'Producto terminado actualizado exitosamente',
        data: producto
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al actualizar producto terminado');
      throw error;
    }
  },

  deleteProductoTerminado: async (c: Context) => {
    try {
      const id = validateId(c.req.param('id'), 'producto terminado');
      
      await productoTerminadoService.deleteProductoTerminado(id);
      
      return c.json({
        success: true,
        message: 'Producto terminado eliminado exitosamente'
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al eliminar producto terminado');
      throw error;
    }
  },
  
  // Controladores para Lotes de Productos
  getLotesProducto: async (c: Context) => {
    try {
      const filtros = c.req.query();
      const lotes = await productoTerminadoService.getLotesProducto(filtros);
      
      return c.json({
        success: true,
        data: lotes,
        count: lotes.length
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener lotes de productos');
      throw error;
    }
  },

  getLoteProductoById: async (c: Context) => {
    try {
      const id = validateId(c.req.param('id'), 'lote de producto');
      
      const lote = await productoTerminadoService.getLoteProductoById(id);
      
      return c.json({
        success: true,
        data: lote
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al obtener lote de producto por ID');
      throw error;
    }
  },

  getLotesByProductoTerminadoId: async (c: Context) => {
    try {
      const productoTerminadoId = validateId(c.req.param('productoTerminadoId'), 'producto terminado');
      
      const lotes = await productoTerminadoService.getLotesByProductoTerminadoId(productoTerminadoId);
      
      return c.json({
        success: true,
        data: lotes,
        count: lotes.length
      });
    } catch (error) {
      logger.error({ error, productoTerminadoId: c.req.param('productoTerminadoId') }, 'Error al obtener lotes por producto terminado ID');
      throw error;
    }
  },

  createLoteProducto: async (c: Context) => {
    try {
      const body = await c.req.json();
      
      // Convertir valores numéricos
      body.productoTerminadoId = validateId(body.productoTerminadoId, 'producto terminado');
      body.loteFabricacionId = validateId(body.loteFabricacionId, 'lote de fabricación');
      
      if (body.cantidad) {
        body.cantidad = toDecimal(body.cantidad);
      }
      if (body.cantidadDisponible) {
        body.cantidadDisponible = toDecimal(body.cantidadDisponible);
      }
      
      // Obtener el ID del usuario desde el contexto de autenticación
      const usuarioId = c.get('user')?.id || 1; // Valor por defecto temporal
      
      // Añadir usuario al cuerpo de la solicitud
      body.usuarioId = usuarioId;
      
      const lote = await productoTerminadoService.createLoteProducto(body);
      
      return c.json({
        success: true,
        message: 'Lote de producto creado exitosamente',
        data: lote
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Error al crear lote de producto');
      throw error;
    }
  },

  updateLoteProducto: async (c: Context) => {
    try {
      const id = validateId(c.req.param('id'), 'lote de producto');
      
      const body = await c.req.json();
      
      // Convertir valores numéricos
      if (body.cantidad) {
        body.cantidad = toDecimal(body.cantidad);
      }
      if (body.cantidadDisponible) {
        body.cantidadDisponible = toDecimal(body.cantidadDisponible);
      }
      
      // Obtener el ID del usuario desde el contexto de autenticación
      const usuarioId = c.get('user')?.id || 1; // Valor por defecto temporal
      
      // Añadir usuario al cuerpo de la solicitud
      body.usuarioId = usuarioId;
      
      const lote = await productoTerminadoService.updateLoteProducto(id, body);
      
      return c.json({
        success: true,
        message: 'Lote de producto actualizado exitosamente',
        data: lote
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al actualizar lote de producto');
      throw error;
    }
  },

  deleteLoteProducto: async (c: Context) => {
    try {
      const id = validateId(c.req.param('id'), 'lote de producto');
      
      await productoTerminadoService.deleteLoteProducto(id);
      
      return c.json({
        success: true,
        message: 'Lote de producto eliminado exitosamente'
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al eliminar lote de producto');
      throw error;
    }
  },

  // Controladores para Movimientos de Inventario
  getMovimientosInventarioProducto: async (c: Context) => {
    try {
      const productoTerminadoId = validateId(c.req.param('productoTerminadoId'), 'producto terminado');
      
      const movimientos = await productoTerminadoService.getMovimientosInventarioProducto(productoTerminadoId);
      
      return c.json({
        success: true,
        data: movimientos,
        count: movimientos.length
      });
    } catch (error) {
      logger.error({ error, productoTerminadoId: c.req.param('productoTerminadoId') }, 'Error al obtener movimientos de inventario');
      throw error;
    }
  },

  createMovimientoInventario: async (c: Context) => {
    try {
      const body = await c.req.json();
      
      // Convertir valores numéricos
      body.elementoId = validateId(body.elementoId, 'elemento');
      if (body.loteId) {
        body.loteId = validateId(body.loteId, 'lote');
      }
      
      // Obtener el ID del usuario desde el contexto de autenticación
      body.usuarioId = c.get('user')?.id || 1; // Valor por defecto temporal
      
      if (body.cantidad) {
        body.cantidad = toDecimal(body.cantidad);
      }
      if (body.referenciaId) {
        body.referenciaId = validateId(body.referenciaId, 'referencia');
      }
      
      const movimiento = await productoTerminadoService.createMovimientoInventario(body);
      
      return c.json({
        success: true,
        message: 'Movimiento de inventario registrado exitosamente',
        data: movimiento
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Error al crear movimiento de inventario');
      throw error;
    }
  },

  // Controladores para métodos especializados
  getProductosTerminadosConStockBajo: async (c: Context) => {
    try {
      const productos = await productoTerminadoService.getProductosTerminadosConStockBajo();
      
      return c.json({
        success: true,
        data: productos,
        count: productos.length
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener productos con stock bajo');
      throw error;
    }
  },

  getProductosTerminadosPorCaducar: async (c: Context) => {
    try {
      const diasUmbralParam = c.req.query('diasUmbral');
      const diasUmbral = diasUmbralParam ? validateId(diasUmbralParam, 'días umbral') : 30;
      
      const productos = await productoTerminadoService.getProductosTerminadosPorCaducar(diasUmbral);
      
      return c.json({
        success: true,
        data: productos,
        count: productos.length
      });
    } catch (error) {
      logger.error({ error, diasUmbral: c.req.query('diasUmbral') }, 'Error al obtener productos por caducar');
      throw error;
    }
  }
};