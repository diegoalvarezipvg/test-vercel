import { PrismaClient } from '@prisma/client';
import {
  ProductoTerminado,
  LoteProducto,
  MovimientoInventarioProducto,
  ProductoTerminadoCreateInput,
  ProductoTerminadoUpdateInput,
  LoteProductoCreateInput,
  LoteProductoUpdateInput,
  MovimientoInventarioProductoCreateInput
} from '../models/producto-terminado.model';
import { PrismaProductoTerminadoRepository, ProductoTerminadoRepository } from '../repositories/producto-terminado.repository';
import { 
  ValidationError, 
  NotFoundError, 
  AppError 
} from '../middlewares/error-handler.middleware';
import { createLogger } from '../utils/logger';
import {
  productoTerminadoCreateSchema,
  productoTerminadoUpdateSchema,
  loteProductoCreateSchema,
  loteProductoUpdateSchema,
  movimientoInventarioProductoCreateSchema
} from '../schemas/producto-terminado.schema';
import { Decimal } from '@prisma/client/runtime/library';

const logger = createLogger('productoTerminadoService');

export class ProductoTerminadoService {
  private repository: ProductoTerminadoRepository;
  
  constructor(prisma: PrismaClient) {
    this.repository = new PrismaProductoTerminadoRepository(prisma);
  }

  // Métodos para Productos Terminados
  async getProductosTerminados(filtros?: Record<string, any>): Promise<ProductoTerminado[]> {
    return this.repository.getProductosTerminados(filtros);
  }

  async getProductoTerminadoById(id: number): Promise<ProductoTerminado> {
    const productoTerminado = await this.repository.getProductoTerminadoById(id);
    
    if (!productoTerminado) {
      throw new NotFoundError(`Producto terminado con ID ${id} no encontrado`);
    }
    
    return productoTerminado;
  }

  async createProductoTerminado(data: ProductoTerminadoCreateInput): Promise<ProductoTerminado> {
    try {
      // Validar datos con Zod
      productoTerminadoCreateSchema.parse(data);
      
      // Verificar si ya existe un producto terminado con el mismo código
      const existente = await this.repository.getProductoTerminadoByCodigo(data.codigo);
      
      if (existente) {
        throw new ValidationError(`Ya existe un producto terminado con el código ${data.codigo}`);
      }
      
      return this.repository.createProductoTerminado(data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AppError) {
        throw error;
      }
      
      logger.error({ error, data }, 'Error al crear producto terminado');
      throw new ValidationError('Error de validación en los datos', error);
    }
  }

  async updateProductoTerminado(id: number, data: ProductoTerminadoUpdateInput): Promise<ProductoTerminado> {
    try {
      // Validar datos con Zod
      productoTerminadoUpdateSchema.parse(data);
      
      // Verificar que el producto terminado exista
      const productoTerminado = await this.repository.getProductoTerminadoById(id);
      
      if (!productoTerminado) {
        throw new NotFoundError(`Producto terminado con ID ${id} no encontrado`);
      }
      
      return this.repository.updateProductoTerminado(id, data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id, data }, 'Error al actualizar producto terminado');
      throw new ValidationError('Error de validación en los datos', error);
    }
  }

  async deleteProductoTerminado(id: number): Promise<void> {
    try {
      // Verificar que el producto terminado exista
      const productoTerminado = await this.repository.getProductoTerminadoById(id);
      
      if (!productoTerminado) {
        throw new NotFoundError(`Producto terminado con ID ${id} no encontrado`);
      }
      
      await this.repository.deleteProductoTerminado(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id }, 'Error al eliminar producto terminado');
      throw new AppError('Error al eliminar producto terminado');
    }
  }
  
  // Métodos para Lotes de Productos
  async getLotesProducto(filtros?: Record<string, any>): Promise<LoteProducto[]> {
    return this.repository.getLotesProducto(filtros);
  }

  async getLoteProductoById(id: number): Promise<LoteProducto> {
    const lote = await this.repository.getLoteProductoById(id);
    
    if (!lote) {
      throw new NotFoundError(`Lote de producto con ID ${id} no encontrado`);
    }
    
    return lote;
  }

  async getLotesByProductoTerminadoId(productoTerminadoId: number): Promise<LoteProducto[]> {
    // Verificar que el producto terminado exista
    const productoTerminado = await this.repository.getProductoTerminadoById(productoTerminadoId);
    
    if (!productoTerminado) {
      throw new NotFoundError(`Producto terminado con ID ${productoTerminadoId} no encontrado`);
    }
    
    return this.repository.getLotesByProductoTerminadoId(productoTerminadoId);
  }

  async createLoteProducto(data: LoteProductoCreateInput): Promise<LoteProducto> {
    try {
      // Validar datos con Zod
      loteProductoCreateSchema.parse(data);
      
      // Verificar que el producto terminado exista
      const productoTerminado = await this.repository.getProductoTerminadoById(data.productoTerminadoId);
      
      if (!productoTerminado) {
        throw new NotFoundError(`Producto terminado con ID ${data.productoTerminadoId} no encontrado`);
      }
      
      const lote = await this.repository.createLoteProducto(data);
      
      // Actualizar stock del producto terminado
      await this.repository.actualizarStockProductoTerminado(
        data.productoTerminadoId,
        data.cantidad.toNumber(),
        'Entrada'
      );
      
      // Registrar movimiento de inventario
      await this.repository.createMovimientoInventario({
        tipoMovimiento: 'Entrada',
        tipoElemento: 'ProductoTerminado',
        elementoId: data.productoTerminadoId,
        loteId: lote.id,
        cantidad: data.cantidad,
        unidadMedida: productoTerminado.unidadMedida,
        documentoReferencia: 'Envasado',
        referenciaId: lote.loteFabricacionId,
        motivo: 'Ingreso de nuevo lote',
        usuarioId: 1, // TODO: Aquí deberías obtener el ID del usuario actual
        notas: data.notas
      });
      
      return lote;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, data }, 'Error al crear lote de producto');
      throw new ValidationError('Error de validación en los datos');
    }
  }

  async updateLoteProducto(id: number, data: LoteProductoUpdateInput): Promise<LoteProducto> {
    try {
      // Validar datos con Zod
      loteProductoUpdateSchema.parse(data);
      
      // Verificar que el lote exista
      const lote = await this.repository.getLoteProductoById(id);
      
      if (!lote) {
        throw new NotFoundError(`Lote de producto con ID ${id} no encontrado`);
      }
      
      // Si se está actualizando la cantidad disponible, registrar movimiento de inventario
      if (data.cantidadDisponible !== undefined && lote.cantidadDisponible.toNumber() !== data.cantidadDisponible.toNumber()) {
        const diferencia = data.cantidadDisponible.toNumber() - lote.cantidadDisponible.toNumber();
        if (diferencia !== 0) {
          const tipoMovimiento = diferencia > 0 ? 'Ajuste Positivo' : 'Ajuste Negativo';
          
          // Actualizar stock del producto
          await this.repository.actualizarStockProductoTerminado(
            lote.productoTerminadoId,
            Math.abs(diferencia),
            diferencia > 0 ? 'Entrada' : 'Salida'
          );
          
          // Registrar movimiento de inventario
          await this.repository.createMovimientoInventario({
            tipoMovimiento,
            tipoElemento: 'ProductoTerminado',
            elementoId: lote.productoTerminadoId,
            loteId: lote.id,
            cantidad: new Decimal(Math.abs(diferencia)),
            unidadMedida: (await this.repository.getProductoTerminadoById(lote.productoTerminadoId))!.unidadMedida,
            documentoReferencia: 'Ajuste Manual',
            referenciaId: null,
            motivo: 'Ajuste de cantidad disponible',
            usuarioId: 1, // TODO: Aquí deberías obtener el ID del usuario actual
            notas: `Ajuste de cantidad disponible del lote ${lote.codigoLote}`
          });
        }
      }
      
      return this.repository.updateLoteProducto(id, data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id, data }, 'Error al actualizar lote de producto');
      throw new ValidationError('Error de validación en los datos', error);
    }
  }

  async deleteLoteProducto(id: number): Promise<void> {
    try {
      // Verificar que el lote exista
      const lote = await this.repository.getLoteProductoById(id);
      
      if (!lote) {
        throw new NotFoundError(`Lote de producto con ID ${id} no encontrado`);
      }
      
      await this.repository.deleteLoteProducto(id);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, id }, 'Error al eliminar lote de producto');
      throw new AppError('Error al eliminar lote de producto');
    }
  }

  // Métodos para Movimientos de Inventario
  async getMovimientosInventarioProducto(productoTerminadoId: number): Promise<MovimientoInventarioProducto[]> {
    // Verificar que el producto terminado exista
    const productoTerminado = await this.repository.getProductoTerminadoById(productoTerminadoId);
    
    if (!productoTerminado) {
      throw new NotFoundError(`Producto terminado con ID ${productoTerminadoId} no encontrado`);
    }
    
    return this.repository.getMovimientosInventarioProducto(productoTerminadoId);
  }

  async createMovimientoInventario(data: MovimientoInventarioProductoCreateInput): Promise<MovimientoInventarioProducto> {
    try {
      // Validar datos con Zod
      movimientoInventarioProductoCreateSchema.parse(data);
      
      // Verificar que el producto terminado exista
      const productoTerminado = await this.repository.getProductoTerminadoById(data.elementoId);
      
      if (!productoTerminado) {
        throw new NotFoundError(`Producto terminado con ID ${data.elementoId} no encontrado`);
      }
      
      // Si se especifica un lote, verificar que exista
      if (data.loteId) {
        const lote = await this.repository.getLoteProductoById(data.loteId);
        if (!lote) {
          throw new NotFoundError(`Lote de producto con ID ${data.loteId} no encontrado`);
        }
        
        // Actualizar cantidad disponible del lote
        const cantidadActual = lote.cantidadDisponible.toNumber();
        let nuevaCantidad = cantidadActual;
        
        if (data.tipoMovimiento === 'Salida' || data.tipoMovimiento === 'Ajuste Negativo') {
          nuevaCantidad = cantidadActual - data.cantidad.toNumber();
          if (nuevaCantidad < 0) {
            throw new ValidationError(`No hay suficiente cantidad disponible en el lote. Disponible: ${cantidadActual}`);
          }
        } else {
          nuevaCantidad = cantidadActual + data.cantidad.toNumber();
        }
        
        await this.repository.updateLoteProducto(data.loteId, {
          cantidadDisponible: new Decimal(nuevaCantidad)
        });
      }
      
      // Actualizar stock del producto
      if (data.tipoMovimiento === 'Entrada' || data.tipoMovimiento === 'Ajuste Positivo') {
        await this.repository.actualizarStockProductoTerminado(
          data.elementoId,
          data.cantidad.toNumber(),
          'Entrada'
        );
      } else {
        await this.repository.actualizarStockProductoTerminado(
          data.elementoId,
          data.cantidad.toNumber(),
          'Salida'
        );
      }
      
      return this.repository.createMovimientoInventario(data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      
      logger.error({ error, data }, 'Error al crear movimiento de inventario');
      throw new ValidationError('Error de validación en los datos', error);
    }
  }

  // Métodos especializados
  async getProductosTerminadosConStockBajo(): Promise<ProductoTerminado[]> {
    return this.repository.getProductosTerminadosConStockBajo();
  }

  async getProductosTerminadosPorCaducar(diasUmbral: number = 30): Promise<any[]> {
    return this.repository.getProductosTerminadosPorCaducar(diasUmbral);
  }
} 