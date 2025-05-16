import { PrismaClient } from '@prisma/client';
import {
  MateriaPrima,
  LoteMateriaPrima,
  MovimientoInventarioMateriaPrima,
  MateriaPrimaCreateInput,
  MateriaPrimaUpdateInput,
  LoteMateriaPrimaCreateInput,
  LoteMateriaPrimaUpdateInput,
  MovimientoInventarioCreateInput
} from '../models/materia-prima.model';
import { PrismaMateriaPrimaRepository, MateriaPrimaRepository } from '../repositories/materia-prima.repository';
import { 
  ValidationError, 
  NotFoundError, 
  AppError 
} from '../middlewares/error-handler.middleware';
import { createLogger } from '../utils/logger';
import {
  materiaPrimaCreateSchema,
  materiaPrimaUpdateSchema,
  loteMateriaPrimaCreateSchema,
  loteMateriaPrimaUpdateSchema,
  movimientoInventarioCreateSchema
} from '../schemas/materia-prima.schema';
import { Decimal } from '@prisma/client/runtime/library';
import { toNumber } from '../utils/helpers';

const logger = createLogger('materiaPrimaService');

export class MateriaPrimaService {
  private repository: MateriaPrimaRepository;
  
  constructor(prisma: PrismaClient) {
    this.repository = new PrismaMateriaPrimaRepository(prisma);
  }

  // Métodos para Materias Primas
  async getMateriasPrimas(filtros?: Record<string, any>): Promise<MateriaPrima[]> {
    return this.repository.getMateriasPrimas(filtros);
  }

  async getMateriaPrimaById(id: number): Promise<MateriaPrima> {
    const materiaPrima = await this.repository.getMateriaPrimaById(id);
    
    if (!materiaPrima) {
      throw new NotFoundError(`Materia prima con ID ${id} no encontrada`);
    }
    
    return materiaPrima;
  }

  async createMateriaPrima(data: MateriaPrimaCreateInput): Promise<MateriaPrima> {
    try {
      // Validar datos con Zod
      materiaPrimaCreateSchema.parse(data);
      
      // Verificar si ya existe una materia prima con el mismo código
      const existente = await this.repository.getMateriaPrimaByCodigo(data.codigo);
      
      if (existente) {
        throw new ValidationError(`Ya existe una materia prima con el código ${data.codigo}`);
      }
      
      return this.repository.createMateriaPrima(data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AppError) {
        throw error;
      }
      
      logger.error({ error, data }, 'Error al crear materia prima');
      throw new ValidationError('Error de validación en los datos', error);
    }
  }

  async updateMateriaPrima(id: number, data: MateriaPrimaUpdateInput): Promise<MateriaPrima> {
    try {
      // Validar datos con Zod
      materiaPrimaUpdateSchema.parse(data);
      
      // Verificar que la materia prima exista
      const materiaPrima = await this.repository.getMateriaPrimaById(id);
      
      if (!materiaPrima) {
        throw new NotFoundError(`Materia prima con ID ${id} no encontrada`);
      }
      
      return this.repository.updateMateriaPrima(id, data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id, data }, 'Error al actualizar materia prima');
      throw new ValidationError('Error de validación en los datos', error);
    }
  }

  async deleteMateriaPrima(id: number): Promise<void> {
    try {
      // Verificar que la materia prima exista
      const materiaPrima = await this.repository.getMateriaPrimaById(id);
      
      if (!materiaPrima) {
        throw new NotFoundError(`Materia prima con ID ${id} no encontrada`);
      }
      
      await this.repository.deleteMateriaPrima(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id }, 'Error al eliminar materia prima');
      throw new AppError('Error al eliminar materia prima');
    }
  }
  
  // Métodos para Lotes de Materias Primas
  async getLotesMateriasPrimas(filtros?: Record<string, any>): Promise<LoteMateriaPrima[]> {
    return this.repository.getLotesMateriasPrimas(filtros);
  }

  async getLoteMateriaPrimaById(id: number): Promise<LoteMateriaPrima> {
    const lote = await this.repository.getLoteMateriaPrimaById(id);
    
    if (!lote) {
      throw new NotFoundError(`Lote de materia prima con ID ${id} no encontrado`);
    }
    
    return lote;
  }

  async getLotesByMateriaPrimaId(materiaPrimaId: number): Promise<LoteMateriaPrima[]> {
    // Verificar que la materia prima exista
    const materiaPrima = await this.repository.getMateriaPrimaById(materiaPrimaId);
    
    if (!materiaPrima) {
      throw new NotFoundError(`Materia prima con ID ${materiaPrimaId} no encontrada`);
    }
    
    return this.repository.getLotesByMateriaPrimaId(materiaPrimaId);
  }

  async createLoteMateriaPrima(data: LoteMateriaPrimaCreateInput): Promise<LoteMateriaPrima> {
    try {
      // Validar datos con Zod
      loteMateriaPrimaCreateSchema.parse(data);
      
      // Verificar que la materia prima exista
      const materiaPrima = await this.repository.getMateriaPrimaById(data.materiaPrimaId);
      
      if (!materiaPrima) {
        throw new NotFoundError(`Materia prima con ID ${data.materiaPrimaId} no encontrada`);
      }
      
      const lote = await this.repository.createLoteMateriaPrima(data);
      
      // Convertir cantidad a número usando el helper
      const cantidadNumerica = toNumber(data.cantidad);
        
      // Actualizar stock de la materia prima
      await this.repository.actualizarStockMateriaPrima(
        data.materiaPrimaId,
        cantidadNumerica,
        'Entrada'
      );
      
      // Registrar movimiento de inventario
      await this.repository.createMovimientoInventario({
        tipoMovimiento: 'Entrada',
        tipoElemento: 'MateriaPrima',
        elementoId: data.materiaPrimaId,
        loteId: lote.id,
        cantidad: data.cantidad,
        unidadMedida: materiaPrima.unidadMedida,
        documentoReferencia: data.ordenCompraId ? 'OrdenCompra' : 'RegistroManual',
        referenciaId: data.ordenCompraId || null,
        motivo: 'Ingreso de nuevo lote',
        usuarioId: data.usuarioId || 1, // Usar el usuarioId si viene en los datos o el valor por defecto
        notas: data.notas
      });
      
      return lote;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, data }, 'Error al crear lote de materia prima');
      throw new ValidationError('Error de validación en los datos');
    }
  }

  async updateLoteMateriaPrima(id: number, data: LoteMateriaPrimaUpdateInput): Promise<LoteMateriaPrima> {
    try {
      // Validar datos con Zod
      loteMateriaPrimaUpdateSchema.parse(data);
      
      // Verificar que el lote exista
      const lote = await this.repository.getLoteMateriaPrimaById(id);
      
      if (!lote) {
        throw new NotFoundError(`Lote de materia prima con ID ${id} no encontrado`);
      }
      
      // Si se cambia la cantidad, actualizar el stock de la materia prima
      if (data.cantidad && data.cantidad !== lote.cantidad) {
        // Usar los helpers para convertir a números
        const nuevaCantidad = toNumber(data.cantidad);
        const cantidadActual = toNumber(lote.cantidad);
        const diferencia = nuevaCantidad - cantidadActual;
        
        if (diferencia !== 0) {
          await this.repository.actualizarStockMateriaPrima(
            lote.materiaPrimaId,
            Math.abs(diferencia),
            diferencia > 0 ? 'Entrada' : 'Salida'
          );
          
          // Registrar movimiento de inventario
          await this.repository.createMovimientoInventario({
            tipoMovimiento: diferencia > 0 ? 'Ajuste Positivo' : 'Ajuste Negativo',
            tipoElemento: 'MateriaPrima',
            elementoId: lote.materiaPrimaId,
            loteId: id,
            cantidad: new Decimal(Math.abs(diferencia)),
            unidadMedida: lote.materiaPrima.unidadMedida,
            documentoReferencia: 'AjusteLote',
            referenciaId: id,
            motivo: 'Ajuste de cantidad en lote',
            usuarioId: 1, // TODO: Aquí deberías obtener el ID del usuario actual
            notas: data.notas
          });
        }
      }
      
      return this.repository.updateLoteMateriaPrima(id, data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id, data }, 'Error al actualizar lote de materia prima');
      throw new ValidationError('Error de validación en los datos');
    }
  }

  async deleteLoteMateriaPrima(id: number): Promise<void> {
    try {
      // Verificar que el lote exista
      const lote = await this.repository.getLoteMateriaPrimaById(id);
      
      if (!lote) {
        throw new NotFoundError(`Lote de materia prima con ID ${id} no encontrado`);
      }
      
      // Actualizar stock de la materia prima si hay cantidad disponible
      const cantidadDisponible = toNumber(lote.cantidadDisponible);
      if (cantidadDisponible > 0) {
        await this.repository.actualizarStockMateriaPrima(
          lote.materiaPrimaId,
          cantidadDisponible,
          'Salida'
        );
        
        // Registrar movimiento de inventario
        await this.repository.createMovimientoInventario({
          tipoMovimiento: 'Ajuste Negativo',
          tipoElemento: 'MateriaPrima',
          elementoId: lote.materiaPrimaId,
          loteId: id,
          cantidad: lote.cantidadDisponible,
          unidadMedida: lote.materiaPrima.unidadMedida,
          documentoReferencia: 'EliminacionLote',
          referenciaId: id,
          motivo: 'Eliminación de lote',
          usuarioId: 1, // Aquí deberías obtener el ID del usuario actual
          notas: 'Eliminación de lote del sistema'
        });
      }
      
      await this.repository.deleteLoteMateriaPrima(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id }, 'Error al eliminar lote de materia prima');
      throw new AppError('Error al eliminar lote de materia prima');
    }
  }
  
  // Métodos para Movimientos de Inventario
  async getMovimientosInventarioMateriaPrima(materiaPrimaId: number): Promise<MovimientoInventarioMateriaPrima[]> {
    // Verificar que la materia prima exista
    const materiaPrima = await this.repository.getMateriaPrimaById(materiaPrimaId);
    
    if (!materiaPrima) {
      throw new NotFoundError(`Materia prima con ID ${materiaPrimaId} no encontrada`);
    }
    
    return this.repository.getMovimientosInventarioMateriaPrima(materiaPrimaId);
  }

  async createMovimientoInventario(data: MovimientoInventarioCreateInput): Promise<MovimientoInventarioMateriaPrima> {
    try {
      // Validar datos con Zod
      movimientoInventarioCreateSchema.parse(data);
      
      // Si es un movimiento para materia prima, verificar que exista
      if (data.tipoElemento === 'MateriaPrima') {
        const materiaPrima = await this.repository.getMateriaPrimaById(data.elementoId);
        
        if (!materiaPrima) {
          throw new NotFoundError(`Materia prima con ID ${data.elementoId} no encontrada`);
        }
        
        // Convertir cantidad a número y actualizar stock según el tipo de movimiento
        const cantidadNumerica = toNumber(data.cantidad);
        
        if (data.tipoMovimiento === 'Entrada' || data.tipoMovimiento === 'Ajuste Positivo') {
          await this.repository.actualizarStockMateriaPrima(
            data.elementoId,
            cantidadNumerica,
            'Entrada'
          );
        } else if (data.tipoMovimiento === 'Salida' || data.tipoMovimiento === 'Ajuste Negativo') {
          await this.repository.actualizarStockMateriaPrima(
            data.elementoId,
            cantidadNumerica,
            'Salida'
          );
        }
      }
      
      return this.repository.createMovimientoInventario(data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, data }, 'Error al crear movimiento de inventario');
      throw new ValidationError('Error de validación en los datos');
    }
  }
  
  // Métodos especializados
  async getMateriasPrimasConStockBajo(): Promise<MateriaPrima[]> {
    return this.repository.getMateriasPrimasConStockBajo();
  }

  async getMateriasPrimasPorCaducar(diasUmbral: number = 30): Promise<any[]> {
    return this.repository.getMateriasPrimasPorCaducar(diasUmbral);
  }
}