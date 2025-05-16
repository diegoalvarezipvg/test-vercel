import { Decimal } from '@prisma/client/runtime/library';
import { 
  MovimientoInventario, 
  MovimientoInventarioCreateInput, 
  MovimientoInventarioFiltros,
  MovimientoInventarioReporte,
  MovimientoInventarioDetallado
} from '../models/movimiento-inventario.model';
import { MovimientoInventarioRepository, PrismaMovimientoInventarioRepository } from '../repositories/movimiento-inventario.repository';
import { MateriaPrimaRepository, PrismaMateriaPrimaRepository } from '../repositories/materia-prima.repository';
import { ProductoTerminadoRepository, PrismaProductoTerminadoRepository } from '../repositories/producto-terminado.repository';
import { movimientoInventarioCreateSchema, movimientoInventarioFiltrosSchema } from '../schemas/movimiento-inventario.schema';
import { createLogger } from '../utils/logger';
import { NotFoundError, ValidationError } from '../middlewares/error-handler.middleware';
import { PaginatedResult } from '../utils/pagination';
import { toNumber, toDecimal } from '../utils/helpers';

const logger = createLogger('movimientoInventarioService');

export class MovimientoInventarioService {
  constructor(
    private repository: MovimientoInventarioRepository,
    private materiaPrimaRepository: MateriaPrimaRepository,
    private productoTerminadoRepository: ProductoTerminadoRepository
  ) {}
  
  // Métodos para consulta de movimientos
  async getAllMovimientos(filtros?: MovimientoInventarioFiltros): Promise<PaginatedResult<MovimientoInventario>> {
    try {
      // Validar filtros con Zod si existen
      if (filtros) {
        movimientoInventarioFiltrosSchema.parse(filtros);
      }
      
      return this.repository.getAllMovimientos(filtros);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      logger.error({ error, filtros }, 'Error al obtener todos los movimientos de inventario');
      throw new Error('Error al consultar los movimientos de inventario');
    }
  }
  
  async getMovimientoById(id: number): Promise<MovimientoInventario> {
    if (!id || isNaN(id)) {
      throw new ValidationError('ID de movimiento inválido');
    }
    
    const movimiento = await this.repository.getMovimientoById(id);
    
    if (!movimiento) {
      throw new NotFoundError(`Movimiento con ID ${id} no encontrado`);
    }
    
    return movimiento;
  }
  
  async getMovimientosByTipoElemento(
    tipoElemento: string, 
    elementoId?: number, 
    filtros?: MovimientoInventarioFiltros
  ): Promise<PaginatedResult<MovimientoInventario>> {
    // Validar tipo de elemento
    if (tipoElemento !== 'MateriaPrima' && tipoElemento !== 'ProductoTerminado') {
      throw new ValidationError('Tipo de elemento no válido');
    }
    
    // Validar que el elemento exista si se proporciona un ID
    if (elementoId) {
      if (tipoElemento === 'MateriaPrima') {
        const materiaPrima = await this.materiaPrimaRepository.getMateriaPrimaById(elementoId);
        if (!materiaPrima) {
          throw new NotFoundError(`Materia prima con ID ${elementoId} no encontrada`);
        }
      } else if (tipoElemento === 'ProductoTerminado') {
        const productoTerminado = await this.productoTerminadoRepository.getProductoTerminadoById(elementoId);
        if (!productoTerminado) {
          throw new NotFoundError(`Producto terminado con ID ${elementoId} no encontrado`);
        }
      }
    }
    
    // Validar filtros con Zod si existen
    if (filtros) {
      movimientoInventarioFiltrosSchema.parse(filtros);
    }
    
    return this.repository.getMovimientosByTipoElemento(tipoElemento, elementoId, filtros);
  }
  
  // Métodos para reportes
  async getReporteMovimientos(filtros?: MovimientoInventarioFiltros): Promise<MovimientoInventarioReporte> {
    try {
      // Validar filtros con Zod si existen
      if (filtros) {
        movimientoInventarioFiltrosSchema.parse(filtros);
      }
      
      return this.repository.getReporteMovimientos(filtros);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      logger.error({ error, filtros }, 'Error al generar reporte de movimientos');
      throw new Error('Error al generar el reporte de movimientos');
    }
  }
  
  async getMovimientosDetallados(filtros?: MovimientoInventarioFiltros): Promise<PaginatedResult<MovimientoInventarioDetallado>> {
    try {
      // Validar filtros con Zod si existen
      if (filtros) {
        movimientoInventarioFiltrosSchema.parse(filtros);
      }
      
      return this.repository.getMovimientosDetallados(filtros);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      logger.error({ error, filtros }, 'Error al obtener movimientos detallados');
      throw new Error('Error al consultar los movimientos detallados');
    }
  }
  
  // Método para crear un nuevo movimiento (con actualización de stock)
  async createMovimiento(data: MovimientoInventarioCreateInput): Promise<MovimientoInventario> {
    try {
      // Validar datos con Zod
      movimientoInventarioCreateSchema.parse(data);
      
      const { tipoElemento, elementoId, tipoMovimiento, cantidad, loteId } = data;
      
      // Verificar que el elemento exista
      if (tipoElemento === 'MateriaPrima') {
        const materiaPrima = await this.materiaPrimaRepository.getMateriaPrimaById(elementoId);
        
        if (!materiaPrima) {
          throw new NotFoundError(`Materia prima con ID ${elementoId} no encontrada`);
        }
        
        // Validar el lote si se especifica
        if (loteId) {
          const lote = await this.materiaPrimaRepository.getLoteMateriaPrimaById(loteId);
          
          if (!lote) {
            throw new NotFoundError(`Lote de materia prima con ID ${loteId} no encontrado`);
          }
          
          // Validar que el lote pertenezca a la materia prima
          if (lote.materiaPrimaId !== elementoId) {
            throw new ValidationError(
              `El lote ${lote.codigoLote} no pertenece a la materia prima con ID ${elementoId}`
            );
          }
          
          // Validar cantidades disponibles para salidas
          if (tipoMovimiento === 'Salida' || tipoMovimiento === 'Ajuste Negativo') {
            const cantidadNumerica = toNumber(cantidad);
            const cantidadDisponible = toNumber(lote.cantidadDisponible);
              
            if (cantidadDisponible < cantidadNumerica) {
              throw new ValidationError(
                `No hay suficiente cantidad disponible en el lote ${lote.codigoLote}. Disponible: ${cantidadDisponible}`
              );
            }
            
            // Actualizar cantidad disponible en el lote
            const nuevaCantidadDisponible = toDecimal(cantidadDisponible - cantidadNumerica);
            
            await this.materiaPrimaRepository.updateLoteMateriaPrima(loteId, {
              cantidadDisponible: nuevaCantidadDisponible
            });
          } else if (tipoMovimiento === 'Entrada' || tipoMovimiento === 'Ajuste Positivo') {
            // Aumentar cantidad disponible en el lote
            const cantidadNumerica = toNumber(cantidad);
            const cantidadDisponible = toNumber(lote.cantidadDisponible);
              
            const nuevaCantidadDisponible = toDecimal(cantidadDisponible + cantidadNumerica);
            
            await this.materiaPrimaRepository.updateLoteMateriaPrima(loteId, {
              cantidadDisponible: nuevaCantidadDisponible
            });
          }
        }
        
        // Actualizar stock global de la materia prima
        const cantidadNumerica = toNumber(cantidad);
          
        if (tipoMovimiento === 'Entrada' || tipoMovimiento === 'Ajuste Positivo') {
          await this.materiaPrimaRepository.actualizarStockMateriaPrima(
            elementoId,
            cantidadNumerica,
            'Entrada'
          );
        } else if (tipoMovimiento === 'Salida' || tipoMovimiento === 'Ajuste Negativo') {
          // Validar que haya suficiente stock global
          const stockActual = toNumber(materiaPrima.stockActual);
          if (stockActual < cantidadNumerica && !loteId) {
            throw new ValidationError(
              `No hay suficiente stock de la materia prima. Stock actual: ${materiaPrima.stockActual.toString()}`
            );
          }
          
          await this.materiaPrimaRepository.actualizarStockMateriaPrima(
            elementoId,
            cantidadNumerica,
            'Salida'
          );
        }
      } else if (tipoElemento === 'ProductoTerminado') {
        const productoTerminado = await this.productoTerminadoRepository.getProductoTerminadoById(elementoId);
        
        if (!productoTerminado) {
          throw new NotFoundError(`Producto terminado con ID ${elementoId} no encontrado`);
        }
        
        // Validar el lote si se especifica
        if (loteId) {
          const lote = await this.productoTerminadoRepository.getLoteProductoById(loteId);
          
          if (!lote) {
            throw new NotFoundError(`Lote de producto con ID ${loteId} no encontrado`);
          }
          
          // Validar que el lote pertenezca al producto
          if (lote.productoTerminadoId !== elementoId) {
            throw new ValidationError(
              `El lote ${lote.codigoLote} no pertenece al producto con ID ${elementoId}`
            );
          }
          
          // Validar cantidades disponibles para salidas
          if (tipoMovimiento === 'Salida' || tipoMovimiento === 'Ajuste Negativo') {
            const cantidadNumerica = toNumber(cantidad);
            const cantidadDisponible = toNumber(lote.cantidadDisponible);
              
            if (cantidadDisponible < cantidadNumerica) {
              throw new ValidationError(
                `No hay suficiente cantidad disponible en el lote ${lote.codigoLote}. Disponible: ${cantidadDisponible}`
              );
            }
            
            // Actualizar cantidad disponible en el lote
            const nuevaCantidadDisponible = toDecimal(cantidadDisponible - cantidadNumerica);
            
            await this.productoTerminadoRepository.updateLoteProducto(loteId, {
              cantidadDisponible: nuevaCantidadDisponible
            });
          } else if (tipoMovimiento === 'Entrada' || tipoMovimiento === 'Ajuste Positivo') {
            // Aumentar cantidad disponible en el lote
            const cantidadNumerica = toNumber(cantidad);
            const cantidadDisponible = toNumber(lote.cantidadDisponible);
              
            const nuevaCantidadDisponible = toDecimal(cantidadDisponible + cantidadNumerica);
            
            await this.productoTerminadoRepository.updateLoteProducto(loteId, {
              cantidadDisponible: nuevaCantidadDisponible
            });
          }
        }
        
        // Actualizar stock global del producto
        const cantidadNumerica = toNumber(cantidad);
          
        if (tipoMovimiento === 'Entrada' || tipoMovimiento === 'Ajuste Positivo') {
          await this.productoTerminadoRepository.actualizarStockProductoTerminado(
            elementoId,
            cantidadNumerica,
            'Entrada'
          );
        } else if (tipoMovimiento === 'Salida' || tipoMovimiento === 'Ajuste Negativo') {
          // Validar que haya suficiente stock global
          const stockActual = toNumber(productoTerminado.stockActual);
          if (stockActual < cantidadNumerica && !loteId) {
            throw new ValidationError(
              `No hay suficiente stock del producto. Stock actual: ${productoTerminado.stockActual.toString()}`
            );
          }
          
          await this.productoTerminadoRepository.actualizarStockProductoTerminado(
            elementoId,
            cantidadNumerica,
            'Salida'
          );
        }
      } else {
        throw new ValidationError('Tipo de elemento no válido');
      }
      
      // Una vez validado todo y actualizados los stocks, crear el movimiento
      return this.repository.createMovimiento(data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, data }, 'Error al crear movimiento de inventario');
      throw new Error('Error al crear el movimiento de inventario');
    }
  }
} 