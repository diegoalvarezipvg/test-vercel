import { Context } from 'hono';
import { MovimientoInventarioService } from '../services/movimiento-inventario.service';
import { createLogger } from '../utils/logger';
import { validateId, toDecimal } from '../utils/helpers';

const logger = createLogger('movimientoInventarioController');

export const createMovimientoInventarioController = (movimientoInventarioService: MovimientoInventarioService) => {
  return {
    // Obtener todos los movimientos con filtros
    getAllMovimientos: async (c: Context) => {
      try {
        // Obtener parámetros de consulta
        const page = c.req.query('page') ? validateId(c.req.query('page') || '1', 'página') : 1;
        const limit = c.req.query('limit') ? validateId(c.req.query('limit') || '10', 'límite') : 10;
        const fechaDesde = c.req.query('fechaDesde') ? new Date(c.req.query('fechaDesde') || '') : undefined;
        const fechaHasta = c.req.query('fechaHasta') ? new Date(c.req.query('fechaHasta') || '') : undefined;
        const tipoMovimiento = c.req.query('tipoMovimiento');
        const tipoElemento = c.req.query('tipoElemento');
        const elementoId = c.req.query('elementoId') ? validateId(c.req.query('elementoId') || '0', 'elemento') : undefined;
        const loteId = c.req.query('loteId') ? validateId(c.req.query('loteId') || '0', 'lote') : undefined;
        const usuarioId = c.req.query('usuarioId') ? validateId(c.req.query('usuarioId') || '0', 'usuario') : undefined;
        const documentoReferencia = c.req.query('documentoReferencia') || undefined;
        
        // Construir filtros
        const filtros = {
          page,
          limit,
          fechaDesde,
          fechaHasta,
          tipoMovimiento,
          tipoElemento,
          elementoId,
          loteId,
          usuarioId,
          documentoReferencia
        };
        
        // Filtrar propiedades undefined
        Object.keys(filtros).forEach(key => {
          if (filtros[key as keyof typeof filtros] === undefined) {
            delete filtros[key as keyof typeof filtros];
          }
        });
        
        const result = await movimientoInventarioService.getAllMovimientos(filtros);
        
        return c.json(result);
      } catch (error) {
        logger.error({ error }, 'Error al obtener movimientos de inventario');
        throw error;
      }
    },
    
    // Obtener un movimiento por ID
    getMovimientoById: async (c: Context) => {
      try {
        const id = validateId(c.req.param('id'), 'movimiento');
        
        const movimiento = await movimientoInventarioService.getMovimientoById(id);
        
        return c.json({
          success: true,
          data: movimiento
        });
      } catch (error) {
        logger.error({ error, id: c.req.param('id') }, 'Error al obtener movimiento por ID');
        throw error;
      }
    },
    
    // Obtener movimientos por tipo de elemento
    getMovimientosByTipoElemento: async (c: Context) => {
      try {
        const tipoElemento = c.req.param('tipoElemento');
        const elementoId = c.req.query('elementoId') ? validateId(c.req.query('elementoId') || '0', 'elemento') : undefined;
        
        // Obtener parámetros de consulta para filtros
        const page = c.req.query('page') ? validateId(c.req.query('page') || '1', 'página') : 1;
        const limit = c.req.query('limit') ? validateId(c.req.query('limit') || '10', 'límite') : 10;
        const fechaDesde = c.req.query('fechaDesde') ? new Date(c.req.query('fechaDesde') || '') : undefined;
        const fechaHasta = c.req.query('fechaHasta') ? new Date(c.req.query('fechaHasta') || '') : undefined;
        const tipoMovimiento = c.req.query('tipoMovimiento');
        const loteId = c.req.query('loteId') ? validateId(c.req.query('loteId') || '0', 'lote') : undefined;
        const usuarioId = c.req.query('usuarioId') ? validateId(c.req.query('usuarioId') || '0', 'usuario') : undefined;
        const documentoReferencia = c.req.query('documentoReferencia') || undefined;
        
        // Construir filtros
        const filtros = {
          page,
          limit,
          fechaDesde,
          fechaHasta,
          tipoMovimiento,
          loteId,
          usuarioId,
          documentoReferencia
        };
        
        // Filtrar propiedades undefined
        Object.keys(filtros).forEach(key => {
          if (filtros[key as keyof typeof filtros] === undefined) {
            delete filtros[key as keyof typeof filtros];
          }
        });
        
        const result = await movimientoInventarioService.getMovimientosByTipoElemento(
          tipoElemento,
          elementoId,
          filtros
        );
        
        return c.json(result);
      } catch (error) {
        logger.error({ 
          error, 
          tipoElemento: c.req.param('tipoElemento'),
          elementoId: c.req.query('elementoId')
        }, 'Error al obtener movimientos por tipo de elemento');
        throw error;
      }
    },
    
    // Generar reporte de movimientos
    getReporteMovimientos: async (c: Context) => {
      try {
        // Obtener parámetros de consulta para filtros
        const fechaDesde = c.req.query('fechaDesde') ? new Date(c.req.query('fechaDesde') || '') : undefined;
        const fechaHasta = c.req.query('fechaHasta') ? new Date(c.req.query('fechaHasta') || '') : undefined;
        const tipoMovimiento = c.req.query('tipoMovimiento');
        const tipoElemento = c.req.query('tipoElemento');
        const elementoId = c.req.query('elementoId') ? validateId(c.req.query('elementoId') || '0', 'elemento') : undefined;
        const loteId = c.req.query('loteId') ? validateId(c.req.query('loteId') || '0', 'lote') : undefined;
        const usuarioId = c.req.query('usuarioId') ? validateId(c.req.query('usuarioId') || '0', 'usuario') : undefined;
        
        // Construir filtros
        const filtros = {
          fechaDesde,
          fechaHasta,
          tipoMovimiento,
          tipoElemento,
          elementoId,
          loteId,
          usuarioId
        };
        
        // Filtrar propiedades undefined
        Object.keys(filtros).forEach(key => {
          if (filtros[key as keyof typeof filtros] === undefined) {
            delete filtros[key as keyof typeof filtros];
          }
        });
        
        const reporte = await movimientoInventarioService.getReporteMovimientos(filtros);
        
        return c.json({
          success: true,
          data: reporte
        });
      } catch (error) {
        logger.error({ error }, 'Error al generar reporte de movimientos');
        throw error;
      }
    },
    
    // Obtener movimientos con información detallada
    getMovimientosDetallados: async (c: Context) => {
      try {
        // Obtener parámetros de consulta
        const page = c.req.query('page') ? validateId(c.req.query('page') || '1', 'página') : 1;
        const limit = c.req.query('limit') ? validateId(c.req.query('limit') || '10', 'límite') : 10;
        const fechaDesde = c.req.query('fechaDesde') ? new Date(c.req.query('fechaDesde') || '') : undefined;
        const fechaHasta = c.req.query('fechaHasta') ? new Date(c.req.query('fechaHasta') || '') : undefined;
        const tipoMovimiento = c.req.query('tipoMovimiento');
        const tipoElemento = c.req.query('tipoElemento');
        const elementoId = c.req.query('elementoId') ? validateId(c.req.query('elementoId') || '0', 'elemento') : undefined;
        const loteId = c.req.query('loteId') ? validateId(c.req.query('loteId') || '0', 'lote') : undefined;
        const usuarioId = c.req.query('usuarioId') ? validateId(c.req.query('usuarioId') || '0', 'usuario') : undefined;
        const documentoReferencia = c.req.query('documentoReferencia') || undefined;
        
        // Construir filtros
        const filtros = {
          page,
          limit,
          fechaDesde,
          fechaHasta,
          tipoMovimiento,
          tipoElemento,
          elementoId,
          loteId,
          usuarioId,
          documentoReferencia
        };
        
        // Filtrar propiedades undefined
        Object.keys(filtros).forEach(key => {
          if (filtros[key as keyof typeof filtros] === undefined) {
            delete filtros[key as keyof typeof filtros];
          }
        });
        
        const result = await movimientoInventarioService.getMovimientosDetallados(filtros);
        
        return c.json(result);
      } catch (error) {
        logger.error({ error }, 'Error al obtener movimientos detallados');
        throw error;
      }
    },
    
    // Crear un nuevo movimiento
    createMovimiento: async (c: Context) => {
      try {
        const body = await c.req.json();
        
        // Convertir valores numéricos
        if (body.elementoId) {
          body.elementoId = validateId(body.elementoId, 'elemento');
        }
        
        if (body.loteId) {
          body.loteId = validateId(body.loteId, 'lote');
        }
        
        if (body.cantidad) {
          body.cantidad = toDecimal(body.cantidad);
        }
        
        if (body.referenciaId) {
          body.referenciaId = validateId(body.referenciaId, 'referencia');
        }
        
        // Obtener el ID del usuario desde el contexto de autenticación
        body.usuarioId = c.get('user')?.id || 1; // Valor por defecto temporal
        
        const movimiento = await movimientoInventarioService.createMovimiento(body);
        
        return c.json({
          success: true,
          message: 'Movimiento de inventario registrado exitosamente',
          data: movimiento
        }, 201);
      } catch (error) {
        logger.error({ error }, 'Error al crear movimiento de inventario');
        throw error;
      }
    }
  };
}; 