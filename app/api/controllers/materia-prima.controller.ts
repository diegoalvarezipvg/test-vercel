import { Context } from 'hono';
import { MateriaPrimaService } from '../services/materia-prima.service';
import { ValidationError, NotFoundError, AppError } from '../middlewares/error-handler.middleware';
import { createLogger } from '../utils/logger';
import { validateId } from '../utils/helpers';
import prisma from '../lib/prisma'; // Importar prisma desde el singleton

const materiaPrimaService = new MateriaPrimaService(prisma);
const logger = createLogger('materiaPrimaController');

export const materiaPrimaController = {
  // Controladores para Materias Primas
  getMateriasPrimas: async (c: Context) => {
    try {
      const filtros = c.req.query();
      const materiasPrimas = await materiaPrimaService.getMateriasPrimas(filtros);
      
      return c.json({
        success: true,
        data: materiasPrimas,
        count: materiasPrimas.length
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener materias primas');
      throw error;
    }
  },

  getMateriaPrimaById: async (c: Context) => {
    try {
      const idParam = c.req.param('id');
      
      
      // Validar y convertir ID
      const id = validateId(idParam, 'materia prima');
      
      const materiaPrima = await materiaPrimaService.getMateriaPrimaById(id);
      
      return c.json({
        success: true,
        data: materiaPrima
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al obtener materia prima por ID');
      throw error;
    }
  },

  createMateriaPrima: async (c: Context) => {
    try {
      const body = await c.req.json();
      const materiaPrima = await materiaPrimaService.createMateriaPrima(body);
      
      return c.json({
        success: true,
        message: 'Materia prima creada exitosamente',
        data: materiaPrima
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Error al crear materia prima');
      throw error;
    }
  },

  updateMateriaPrima: async (c: Context) => {
    try {
      const idParam = c.req.param('id');
      const id = validateId(idParam, 'materia prima');
      
      const body = await c.req.json();
      const materiaPrima = await materiaPrimaService.updateMateriaPrima(id, body);
      
      return c.json({
        success: true,
        message: 'Materia prima actualizada exitosamente',
        data: materiaPrima
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al actualizar materia prima');
      throw error;
    }
  },

  deleteMateriaPrima: async (c: Context) => {
    try {
      const idParam = c.req.param('id');
      const id = validateId(idParam, 'materia prima');
      
      await materiaPrimaService.deleteMateriaPrima(id);
      
      return c.json({
        success: true,
        message: 'Materia prima eliminada exitosamente'
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al eliminar materia prima');
      throw error;
    }
  },
  
  // Controladores para Lotes de Materias Primas
  getLotesMateriasPrimas: async (c: Context) => {
    try {
      const filtros = c.req.query();
      const lotes = await materiaPrimaService.getLotesMateriasPrimas(filtros);
      
      return c.json({
        success: true,
        data: lotes,
        count: lotes.length
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener lotes de materias primas');
      throw error;
    }
  },

  getLoteMateriaPrimaById: async (c: Context) => {
    try {
      const idParam = c.req.param('id');
      const id = validateId(idParam, 'lote');
      
      const lote = await materiaPrimaService.getLoteMateriaPrimaById(id);
      
      return c.json({
        success: true,
        data: lote
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al obtener lote de materia prima por ID');
      throw error;
    }
  },

  getLotesByMateriaPrimaId: async (c: Context) => {
    try {
      const materiaPrimaIdParam = c.req.param('materiaPrimaId');
      const materiaPrimaId = validateId(materiaPrimaIdParam, 'materia prima');
      
      const lotes = await materiaPrimaService.getLotesByMateriaPrimaId(materiaPrimaId);
      
      return c.json({
        success: true,
        data: lotes,
        count: lotes.length
      });
    } catch (error) {
      logger.error({ error, materiaPrimaId: c.req.param('materiaPrimaId') }, 'Error al obtener lotes por materia prima');
      throw error;
    }
  },

  createLoteMateriaPrima: async (c: Context) => {
    try {
      const body = await c.req.json();
      
      // Obtener el ID del usuario desde el contexto de autenticación
      const usuarioId = c.get('user')?.id || 1; // Valor por defecto temporal
      
      // Añadir usuario al cuerpo de la solicitud
      body.usuarioId = usuarioId;
      
      const lote = await materiaPrimaService.createLoteMateriaPrima(body);
      
      return c.json({
        success: true,
        message: 'Lote de materia prima creado exitosamente',
        data: lote
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Error al crear lote de materia prima');
      throw error;
    }
  },

  updateLoteMateriaPrima: async (c: Context) => {
    try {
      const idParam = c.req.param('id');
      const id = validateId(idParam, 'lote');
      
      const body = await c.req.json();
      
      // Obtener el ID del usuario desde el contexto de autenticación
      const usuarioId = c.get('user')?.id || 1; // Valor por defecto temporal
      
      // Añadir usuario al cuerpo de la solicitud
      body.usuarioId = usuarioId;
      
      const lote = await materiaPrimaService.updateLoteMateriaPrima(id, body);
      
      return c.json({
        success: true,
        message: 'Lote de materia prima actualizado exitosamente',
        data: lote
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al actualizar lote de materia prima');
      throw error;
    }
  },

  deleteLoteMateriaPrima: async (c: Context) => {
    try {
      const idParam = c.req.param('id');
      const id = validateId(idParam, 'lote');
      
      await materiaPrimaService.deleteLoteMateriaPrima(id);
      
      return c.json({
        success: true,
        message: 'Lote de materia prima eliminado exitosamente'
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al eliminar lote de materia prima');
      throw error;
    }
  },
  
  // Controladores para Movimientos de Inventario
  getMovimientosInventarioMateriaPrima: async (c: Context) => {
    try {
      const materiaPrimaId = parseInt(c.req.param('materiaPrimaId'));
      
      if (isNaN(materiaPrimaId)) {
        throw new ValidationError('ID de materia prima inválido');
      }
      
      const movimientos = await materiaPrimaService.getMovimientosInventarioMateriaPrima(materiaPrimaId);
      
      return c.json({
        success: true,
        data: movimientos,
        count: movimientos.length
      });
    } catch (error) {
      logger.error({ error, materiaPrimaId: c.req.param('materiaPrimaId') }, 'Error al obtener movimientos de inventario');
      throw error;
    }
  },

  createMovimientoInventario: async (c: Context) => {
    try {
      const body = await c.req.json();
      
      // Obtener el ID del usuario desde el contexto de autenticación
      const usuarioId = c.get('user')?.id || 1; // Valor por defecto temporal
      
      // Añadir usuario al cuerpo de la solicitud
      body.usuarioId = usuarioId;
      
      const movimiento = await materiaPrimaService.createMovimientoInventario(body);
      
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
  
  // Controladores para consultas especializadas
  getMateriasPrimasConStockBajo: async (c: Context) => {
    try {
      const materiasPrimas = await materiaPrimaService.getMateriasPrimasConStockBajo();
      
      return c.json({
        success: true,
        data: materiasPrimas,
        count: materiasPrimas.length
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener materias primas con stock bajo');
      throw error;
    }
  },

  getMateriasPrimasPorCaducar: async (c: Context) => {
    try {
      const diasUmbral = parseInt(c.req.query('diasUmbral') || '30');
      
      if (isNaN(diasUmbral) || diasUmbral <= 0) {
        throw new ValidationError('El parámetro diasUmbral debe ser un número positivo');
      }
      
      const materiasPrimas = await materiaPrimaService.getMateriasPrimasPorCaducar(diasUmbral);
      
      return c.json({
        success: true,
        data: materiasPrimas,
        count: materiasPrimas.length
      });
    } catch (error) {
      logger.error({ error, diasUmbral: c.req.query('diasUmbral') }, 'Error al obtener materias primas por caducar');
      throw error;
    }
  }
};