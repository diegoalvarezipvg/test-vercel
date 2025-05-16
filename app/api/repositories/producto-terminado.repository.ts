import { PrismaClient, Prisma } from '@prisma/client';
import {
  ProductoTerminado,
  LoteProducto,
  MovimientoInventarioProducto,
  ProductoTerminadoCreateInput,
  ProductoTerminadoUpdateInput,
  LoteProductoCreateInput,
  LoteProductoUpdateInput,
  MovimientoInventarioProductoCreateInput,
  LoteProductoDetalle
} from '../models/producto-terminado.model';
import { NotFoundError } from '../middlewares/error-handler.middleware';
import { createLogger } from '../utils/logger';

const logger = createLogger('productoTerminadoRepository');

export interface ProductoTerminadoRepository {
  // Productos Terminados
  getProductosTerminados(filtros?: Record<string, any>): Promise<ProductoTerminado[]>;
  getProductoTerminadoById(id: number): Promise<ProductoTerminado | null>;
  getProductoTerminadoByCodigo(codigo: string): Promise<ProductoTerminado | null>;
  createProductoTerminado(data: ProductoTerminadoCreateInput): Promise<ProductoTerminado>;
  updateProductoTerminado(id: number, data: ProductoTerminadoUpdateInput): Promise<ProductoTerminado>;
  deleteProductoTerminado(id: number): Promise<void>;
  
  // Lotes de Productos
  getLotesProducto(filtros?: Record<string, any>): Promise<LoteProducto[]>;
  getLoteProductoById(id: number): Promise<LoteProductoDetalle | null>;
  getLotesByProductoTerminadoId(productoTerminadoId: number): Promise<LoteProducto[]>;
  createLoteProducto(data: LoteProductoCreateInput): Promise<LoteProducto>;
  updateLoteProducto(id: number, data: LoteProductoUpdateInput): Promise<LoteProducto>;
  deleteLoteProducto(id: number): Promise<void>;
  
  // Movimientos de Inventario
  getMovimientosInventarioProducto(productoTerminadoId: number): Promise<MovimientoInventarioProducto[]>;
  createMovimientoInventario(data: MovimientoInventarioProductoCreateInput): Promise<MovimientoInventarioProducto>;
  
  // Consultas especializadas
  getProductosTerminadosConStockBajo(): Promise<ProductoTerminado[]>;
  getProductosTerminadosPorCaducar(diasUmbral: number): Promise<any[]>;
  actualizarStockProductoTerminado(id: number, cantidad: number, tipo: 'Entrada' | 'Salida'): Promise<ProductoTerminado>;
}

export class PrismaProductoTerminadoRepository implements ProductoTerminadoRepository {
  constructor(private prisma: PrismaClient) {}

  // Implementación de métodos para Productos Terminados
  async getProductosTerminados(filtros: Record<string, any> = {}): Promise<ProductoTerminado[]> {
    try {
      const where: Prisma.ProductoTerminadoWhereInput = {};
      
      if (filtros.codigo) {
        where.codigo = { contains: filtros.codigo };
      }
      
      if (filtros.nombre) {
        where.nombre = { contains: filtros.nombre };
      }
      
      if (filtros.estilo) {
        where.estilo = filtros.estilo;
      }
      
      if (filtros.presentacion) {
        where.presentacion = filtros.presentacion;
      }
      
      if (filtros.estado) {
        where.estado = filtros.estado;
      }
      
      if (filtros.stockBajo === true) {
        where.stockActual = {
          lte: this.prisma.productoTerminado.fields.stockMinimo
        };
      }
      
      return this.prisma.productoTerminado.findMany({
        where,
        orderBy: { nombre: 'asc' }
      }) as Promise<ProductoTerminado[]>;
    } catch (error) {
      logger.error({ error }, 'Error al obtener productos terminados');
      throw error;
    }
  }

  async getProductoTerminadoById(id: number): Promise<ProductoTerminado | null> {
    try {
      return this.prisma.productoTerminado.findUnique({
        where: { id }
      }) as Promise<ProductoTerminado | null>;
    } catch (error) {
      logger.error({ error, id }, 'Error al obtener producto terminado por ID');
      throw error;
    }
  }

  async getProductoTerminadoByCodigo(codigo: string): Promise<ProductoTerminado | null> {
    try {
      return this.prisma.productoTerminado.findFirst({
        where: { codigo }
      }) as Promise<ProductoTerminado | null>;
    } catch (error) {
      logger.error({ error, codigo }, 'Error al obtener producto terminado por código');
      throw error;
    }
  }

  async createProductoTerminado(data: ProductoTerminadoCreateInput): Promise<ProductoTerminado> {
    try {
      return this.prisma.productoTerminado.create({
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          estilo: data.estilo,
          descripcion: data.descripcion,
          presentacion: data.presentacion,
          capacidad: data.capacidad,
          unidadMedida: data.unidadMedida,
          stockMinimo: data.stockMinimo,
          stockActual: 0, // Siempre inicia en 0
          precioBase: data.precioBase,
          estado: data.estado || 'Activo',
          imagen: data.imagen,
          notas: data.notas,
          fechaCreacion: new Date(),
        }
      }) as Promise<ProductoTerminado>;
    } catch (error) {
      logger.error({ error, data }, 'Error al crear producto terminado');
      throw error;
    }
  }

  async updateProductoTerminado(id: number, data: ProductoTerminadoUpdateInput): Promise<ProductoTerminado> {
    try {
      const productoTerminado = await this.prisma.productoTerminado.findUnique({
        where: { id }
      });
      
      if (!productoTerminado) {
        throw new NotFoundError(`Producto terminado con ID ${id} no encontrado`);
      }
      
      return this.prisma.productoTerminado.update({
        where: { id },
        data: {
          nombre: data.nombre,
          estilo: data.estilo,
          descripcion: data.descripcion,
          presentacion: data.presentacion,
          capacidad: data.capacidad,
          unidadMedida: data.unidadMedida,
          stockMinimo: data.stockMinimo,
          precioBase: data.precioBase,
          estado: data.estado,
          imagen: data.imagen,
          notas: data.notas,
          fechaModificacion: new Date()
        }
      }) as Promise<ProductoTerminado>;
    } catch (error) {
      logger.error({ error, id, data }, 'Error al actualizar producto terminado');
      throw error;
    }
  }

  async deleteProductoTerminado(id: number): Promise<void> {
    try {
      const productoTerminado = await this.prisma.productoTerminado.findUnique({
        where: { id },
        include: {
          lotes: true,
          recetas: true,
          detallesPedido: true,
          detallesVenta: true,
          detallesDevolucion: true
        }
      });
      
      if (!productoTerminado) {
        throw new NotFoundError(`Producto terminado con ID ${id} no encontrado`);
      }
      
      // Verificar si hay relaciones que impidan la eliminación
      if (
        productoTerminado.lotes.length > 0 || 
        productoTerminado.recetas.length > 0 ||
        productoTerminado.detallesPedido.length > 0 ||
        productoTerminado.detallesVenta.length > 0 ||
        productoTerminado.detallesDevolucion.length > 0
      ) {
        // En lugar de eliminar, marcamos como inactivo
        await this.prisma.productoTerminado.update({
          where: { id },
          data: {
            estado: 'Inactivo',
            fechaModificacion: new Date()
          }
        });
      } else {
        // Si no hay relaciones, podemos eliminar
        await this.prisma.productoTerminado.delete({
          where: { id }
        });
      }
    } catch (error) {
      logger.error({ error, id }, 'Error al eliminar producto terminado');
      throw error;
    }
  }

  // Implementación de métodos para Lotes de Productos
  async getLotesProducto(filtros: Record<string, any> = {}): Promise<LoteProducto[]> {
    try {
      const where: Prisma.LoteProductoWhereInput = {};
      
      if (filtros.codigoLote) {
        where.codigoLote = { contains: filtros.codigoLote };
      }
      
      if (filtros.productoTerminadoId) {
        where.productoTerminadoId = Number(filtros.productoTerminadoId);
      }
      
      if (filtros.loteFabricacionId) {
        where.loteFabricacionId = Number(filtros.loteFabricacionId);
      }
      
      if (filtros.estado) {
        where.estado = filtros.estado;
      }
      
      if (filtros.fechaDesde && filtros.fechaHasta) {
        where.fechaEnvasado = {
          gte: new Date(filtros.fechaDesde),
          lte: new Date(filtros.fechaHasta)
        };
      } else if (filtros.fechaDesde) {
        where.fechaEnvasado = {
          gte: new Date(filtros.fechaDesde)
        };
      } else if (filtros.fechaHasta) {
        where.fechaEnvasado = {
          lte: new Date(filtros.fechaHasta)
        };
      }
      
      return this.prisma.loteProducto.findMany({
        where,
        orderBy: { fechaEnvasado: 'desc' }
      }) as Promise<LoteProducto[]>;
    } catch (error) {
      logger.error({ error }, 'Error al obtener lotes de productos');
      throw error;
    }
  }

  async getLoteProductoById(id: number): Promise<LoteProductoDetalle | null> {
    try {
      const loteProducto = await this.prisma.loteProducto.findUnique({
        where: { id },
        include: {
          productoTerminado: true
        }
      });
      
      if (!loteProducto) return null;
      
      // Transformar a LoteProductoDetalle
      return {
        ...loteProducto,
        productoTerminado: {
          id: loteProducto.productoTerminado.id,
          codigo: loteProducto.productoTerminado.codigo,
          nombre: loteProducto.productoTerminado.nombre,
          estilo: loteProducto.productoTerminado.estilo,
          presentacion: loteProducto.productoTerminado.presentacion,
          capacidad: loteProducto.productoTerminado.capacidad,
          stockActual: loteProducto.productoTerminado.stockActual,
          stockMinimo: loteProducto.productoTerminado.stockMinimo,
          unidadMedida: loteProducto.productoTerminado.unidadMedida,
          estado: loteProducto.productoTerminado.estado
        }
      } as unknown as LoteProductoDetalle;
    } catch (error) {
      logger.error({ error, id }, 'Error al obtener lote de producto por ID');
      throw error;
    }
  }

  async getLotesByProductoTerminadoId(productoTerminadoId: number): Promise<LoteProducto[]> {
    try {
      return this.prisma.loteProducto.findMany({
        where: { 
          productoTerminadoId,
          estado: 'Disponible' 
        },
        orderBy: [
          { fechaCaducidad: 'asc' },
          { fechaEnvasado: 'asc' }
        ]
      }) as Promise<LoteProducto[]>;
    } catch (error) {
      logger.error({ error, productoTerminadoId }, 'Error al obtener lotes por producto terminado ID');
      throw error;
    }
  }

  async createLoteProducto(data: LoteProductoCreateInput): Promise<LoteProducto> {
    try {
      const cantidadDisponible = data.cantidadDisponible || data.cantidad;
      
      return this.prisma.loteProducto.create({
        data: {
          productoTerminadoId: data.productoTerminadoId,
          codigoLote: data.codigoLote,
          loteFabricacionId: data.loteFabricacionId,
          fechaEnvasado: new Date(data.fechaEnvasado),
          fechaOptimoConsumo: data.fechaOptimoConsumo ? new Date(data.fechaOptimoConsumo) : null,
          fechaCaducidad: data.fechaCaducidad ? new Date(data.fechaCaducidad) : null,
          cantidad: data.cantidad,
          cantidadDisponible,
          estado: data.estado || 'Disponible',
          ubicacionFisica: data.ubicacionFisica,
          notas: data.notas
        }
      }) as Promise<LoteProducto>;
    } catch (error) {
      logger.error({ error, data }, 'Error al crear lote de producto');
      throw error;
    }
  }

  async updateLoteProducto(id: number, data: LoteProductoUpdateInput): Promise<LoteProducto> {
    try {
      const loteProducto = await this.prisma.loteProducto.findUnique({
        where: { id }
      });
      
      if (!loteProducto) {
        throw new NotFoundError(`Lote de producto con ID ${id} no encontrado`);
      }
      
      return this.prisma.loteProducto.update({
        where: { id },
        data: {
          fechaOptimoConsumo: data.fechaOptimoConsumo ? new Date(data.fechaOptimoConsumo) : undefined,
          fechaCaducidad: data.fechaCaducidad ? new Date(data.fechaCaducidad) : undefined,
          cantidad: data.cantidad,
          cantidadDisponible: data.cantidadDisponible,
          estado: data.estado,
          ubicacionFisica: data.ubicacionFisica,
          notas: data.notas
        }
      }) as Promise<LoteProducto>;
    } catch (error) {
      logger.error({ error, id, data }, 'Error al actualizar lote de producto');
      throw error;
    }
  }

  async deleteLoteProducto(id: number): Promise<void> {
    try {
      const loteProducto = await this.prisma.loteProducto.findUnique({
        where: { id },
        include: {
          detallesVenta: true
        }
      });
      
      if (!loteProducto) {
        throw new NotFoundError(`Lote de producto con ID ${id} no encontrado`);
      }
      
      // Verificar si el lote tiene relaciones con detalles de venta
      if (loteProducto.detallesVenta.length > 0) {
        // Si tiene relaciones, solo marcamos como no disponible
        await this.prisma.loteProducto.update({
          where: { id },
          data: {
            estado: 'Bloqueado'
          }
        });
      } else {
        // Antes de eliminar, ajustamos el stock del producto
        await this.actualizarStockProductoTerminado(
          loteProducto.productoTerminadoId,
          loteProducto.cantidadDisponible.toNumber(),
          'Salida'
        );
        
        // Si no tiene relaciones, lo eliminamos
        await this.prisma.loteProducto.delete({
          where: { id }
        });
      }
    } catch (error) {
      logger.error({ error, id }, 'Error al eliminar lote de producto');
      throw error;
    }
  }

  // Implementación de métodos para Movimientos de Inventario
  async getMovimientosInventarioProducto(productoTerminadoId: number): Promise<MovimientoInventarioProducto[]> {
    try {
      return this.prisma.movimientoInventario.findMany({
        where: {
          tipoElemento: 'ProductoTerminado',
          elementoId: productoTerminadoId
        },
        orderBy: { fecha: 'desc' }
      }) as Promise<MovimientoInventarioProducto[]>;
    } catch (error) {
      logger.error({ error, productoTerminadoId }, 'Error al obtener movimientos de inventario');
      throw error;
    }
  }

  async createMovimientoInventario(data: MovimientoInventarioProductoCreateInput): Promise<MovimientoInventarioProducto> {
    try {
      return this.prisma.movimientoInventario.create({
        data: {
          fecha: new Date(),
          tipoMovimiento: data.tipoMovimiento,
          tipoElemento: data.tipoElemento,
          elementoId: data.elementoId,
          loteId: data.loteId,
          cantidad: data.cantidad,
          unidadMedida: data.unidadMedida,
          documentoReferencia: data.documentoReferencia,
          referenciaId: data.referenciaId,
          motivo: data.motivo,
          usuarioId: data.usuarioId,
          notas: data.notas
        }
      }) as Promise<MovimientoInventarioProducto>;
    } catch (error) {
      logger.error({ error, data }, 'Error al crear movimiento de inventario');
      throw error;
    }
  }

  // Implementación de métodos especializados
  async getProductosTerminadosConStockBajo(): Promise<ProductoTerminado[]> {
    try {
      return this.prisma.$queryRaw`
        SELECT * FROM productos_terminados
        WHERE stock_actual <= stock_minimo
          AND estado = 'Activo'
      ` as Promise<ProductoTerminado[]>;
    } catch (error) {
      logger.error({ error }, 'Error al obtener productos con stock bajo');
      throw error;
    }
  }

  async getProductosTerminadosPorCaducar(diasUmbral: number): Promise<any[]> {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + diasUmbral);
      
      return this.prisma.$queryRaw`
        SELECT lp.*, pt.nombre, pt.codigo, pt.estilo
        FROM lotes_producto lp
        JOIN productos_terminados pt ON lp.producto_terminado_id = pt.id
        WHERE lp.fecha_caducidad IS NOT NULL
          AND lp.fecha_caducidad <= ${fechaLimite}
          AND lp.cantidad_disponible > 0
          AND lp.estado = 'Disponible'
      `;
    } catch (error) {
      logger.error({ error, diasUmbral }, 'Error al obtener productos por caducar');
      throw error;
    }
  }

  async actualizarStockProductoTerminado(id: number, cantidad: number, tipo: 'Entrada' | 'Salida'): Promise<ProductoTerminado> {
    try {
      const productoTerminado = await this.prisma.productoTerminado.findUnique({
        where: { id }
      });
      
      if (!productoTerminado) {
        throw new NotFoundError(`Producto terminado con ID ${id} no encontrado`);
      }
      
      let nuevoStock = productoTerminado.stockActual.toNumber();
      
      if (tipo === 'Entrada') {
        nuevoStock += cantidad;
      } else { // Salida
        nuevoStock -= cantidad;
        if (nuevoStock < 0) {
          nuevoStock = 0; // No permitimos stock negativo
        }
      }
      
      return this.prisma.productoTerminado.update({
        where: { id },
        data: {
          stockActual: nuevoStock,
          fechaModificacion: new Date()
        }
      }) as Promise<ProductoTerminado>;
    } catch (error) {
      logger.error({ error, id, cantidad, tipo }, 'Error al actualizar stock del producto');
      throw error;
    }
  }
} 