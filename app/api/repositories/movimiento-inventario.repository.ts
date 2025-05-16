import { PrismaClient, Prisma, MovimientoInventario as PrismaMovimientoInventario } from '@prisma/client';
import { 
  MovimientoInventario, 
  MovimientoInventarioCreateInput, 
  MovimientoInventarioFiltros,
  MovimientoInventarioReporte,
  MovimientoInventarioDetallado
} from '../models/movimiento-inventario.model';
import { createLogger } from '../utils/logger';
import { PaginatedResult, buildPagination } from '../utils/pagination';
import { NotFoundError } from '../middlewares/error-handler.middleware';

const logger = createLogger('movimientoInventarioRepository');

export interface MovimientoInventarioRepository {
  // Métodos básicos CRUD
  getAllMovimientos(filtros?: MovimientoInventarioFiltros): Promise<PaginatedResult<MovimientoInventario>>;
  getMovimientoById(id: number): Promise<MovimientoInventario | null>;
  createMovimiento(data: MovimientoInventarioCreateInput): Promise<MovimientoInventario>;
  
  // Consultas por tipo de elemento
  getMovimientosByTipoElemento(
    tipoElemento: string, 
    elementoId?: number, 
    filtros?: MovimientoInventarioFiltros
  ): Promise<PaginatedResult<MovimientoInventario>>;
  
  // Consultas para reportes
  getReporteMovimientos(filtros?: MovimientoInventarioFiltros): Promise<MovimientoInventarioReporte>;
  getMovimientosDetallados(filtros?: MovimientoInventarioFiltros): Promise<PaginatedResult<MovimientoInventarioDetallado>>;
}

export class PrismaMovimientoInventarioRepository implements MovimientoInventarioRepository {
  constructor(private prisma: PrismaClient) {}
  
  // Implementación de métodos básicos CRUD
  async getAllMovimientos(filtros?: MovimientoInventarioFiltros): Promise<PaginatedResult<MovimientoInventario>> {
    try {
      const where: Prisma.MovimientoInventarioWhereInput = {};
      
      if (filtros) {
        if (filtros.fechaDesde) {
          where.fecha = {
            ...(where.fecha as object || {}),
            gte: filtros.fechaDesde
          };
        }
        
        if (filtros.fechaHasta) {
          where.fecha = {
            ...(where.fecha as object || {}),
            lte: filtros.fechaHasta
          };
        }
        
        if (filtros.tipoMovimiento) {
          where.tipoMovimiento = filtros.tipoMovimiento;
        }
        
        if (filtros.tipoElemento) {
          where.tipoElemento = filtros.tipoElemento;
        }
        
        if (filtros.elementoId) {
          where.elementoId = filtros.elementoId;
        }
        
        if (filtros.loteId) {
          where.loteId = filtros.loteId;
        }
        
        if (filtros.usuarioId) {
          where.usuarioId = filtros.usuarioId;
        }
        
        if (filtros.documentoReferencia) {
          where.documentoReferencia = {
            contains: filtros.documentoReferencia,
            mode: 'insensitive'
          };
        }
      }
      
      const page = filtros?.page || 1;
      const limit = filtros?.limit || 10;
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        this.prisma.movimientoInventario.findMany({
          where,
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          },
          orderBy: { fecha: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.movimientoInventario.count({ where })
      ]);
      
      return buildPagination(
        data as unknown as MovimientoInventario[],
        total,
        page,
        limit
      );
    } catch (error) {
      logger.error({ error, filtros }, 'Error al obtener todos los movimientos de inventario');
      throw error;
    }
  }
  
  async getMovimientoById(id: number): Promise<MovimientoInventario | null> {
    try {
      const movimiento = await this.prisma.movimientoInventario.findUnique({
        where: { id },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        }
      });
      
      return movimiento as unknown as MovimientoInventario | null;
    } catch (error) {
      logger.error({ error, id }, 'Error al obtener movimiento de inventario por ID');
      throw error;
    }
  }
  
  async createMovimiento(data: MovimientoInventarioCreateInput): Promise<MovimientoInventario> {
    try {
      const movimiento = await this.prisma.movimientoInventario.create({
        data,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        }
      });
      
      return movimiento as unknown as MovimientoInventario;
    } catch (error) {
      logger.error({ error, data }, 'Error al crear movimiento de inventario');
      throw error;
    }
  }
  
  // Implementación de consultas por tipo de elemento
  async getMovimientosByTipoElemento(
    tipoElemento: string, 
    elementoId?: number, 
    filtros?: MovimientoInventarioFiltros
  ): Promise<PaginatedResult<MovimientoInventario>> {
    try {
      const where: Prisma.MovimientoInventarioWhereInput = {
        tipoElemento: tipoElemento
      };
      
      if (elementoId) {
        where.elementoId = elementoId;
      }
      
      if (filtros) {
        if (filtros.fechaDesde) {
          where.fecha = {
            ...(where.fecha as object || {}),
            gte: filtros.fechaDesde
          };
        }
        
        if (filtros.fechaHasta) {
          where.fecha = {
            ...(where.fecha as object || {}),
            lte: filtros.fechaHasta
          };
        }
        
        if (filtros.tipoMovimiento) {
          where.tipoMovimiento = filtros.tipoMovimiento;
        }
        
        if (filtros.loteId) {
          where.loteId = filtros.loteId;
        }
        
        if (filtros.usuarioId) {
          where.usuarioId = filtros.usuarioId;
        }
        
        if (filtros.documentoReferencia) {
          where.documentoReferencia = {
            contains: filtros.documentoReferencia,
            mode: 'insensitive'
          };
        }
      }
      
      const page = filtros?.page || 1;
      const limit = filtros?.limit || 10;
      const skip = (page - 1) * limit;
      
      const [data, total] = await Promise.all([
        this.prisma.movimientoInventario.findMany({
          where,
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellido: true
              }
            }
          },
          orderBy: { fecha: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.movimientoInventario.count({ where })
      ]);
      
      return buildPagination(
        data as unknown as MovimientoInventario[],
        total,
        page,
        limit
      );
    } catch (error) {
      logger.error({ error, tipoElemento, elementoId, filtros }, 'Error al obtener movimientos por tipo de elemento');
      throw error;
    }
  }
  
  // Implementación de consultas para reportes
  async getReporteMovimientos(filtros?: MovimientoInventarioFiltros): Promise<MovimientoInventarioReporte> {
    try {
      const where: Prisma.MovimientoInventarioWhereInput = {};
      
      if (filtros) {
        if (filtros.fechaDesde) {
          where.fecha = {
            ...(where.fecha as object || {}),
            gte: filtros.fechaDesde
          };
        }
        
        if (filtros.fechaHasta) {
          where.fecha = {
            ...(where.fecha as object || {}),
            lte: filtros.fechaHasta
          };
        }
        
        if (filtros.tipoElemento) {
          where.tipoElemento = filtros.tipoElemento;
        }
        
        if (filtros.elementoId) {
          where.elementoId = filtros.elementoId;
        }
        
        if (filtros.loteId) {
          where.loteId = filtros.loteId;
        }
        
        if (filtros.usuarioId) {
          where.usuarioId = filtros.usuarioId;
        }
      }
      
      // Consultar todos los movimientos según filtros
      const movimientos = await this.prisma.movimientoInventario.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        },
        orderBy: { fecha: 'desc' }
      });
      
      const movimientosTipados = movimientos as unknown as (PrismaMovimientoInventario & {
        usuario: { id: number; nombre: string; apellido: string };
      })[];
      
      // Contar por tipo de movimiento
      const totalEntradas = movimientosTipados.filter(m => m.tipoMovimiento === 'Entrada').length;
      const totalSalidas = movimientosTipados.filter(m => m.tipoMovimiento === 'Salida').length;
      const totalAjustesPositivos = movimientosTipados.filter(m => m.tipoMovimiento === 'Ajuste Positivo').length;
      const totalAjustesNegativos = movimientosTipados.filter(m => m.tipoMovimiento === 'Ajuste Negativo').length;
      
      // Agrupar por tipo de elemento
      const movimientosPorTipoElemento = Object.entries(
        movimientosTipados.reduce((acc, mov) => {
          acc[mov.tipoElemento] = (acc[mov.tipoElemento] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([tipoElemento, cantidad]) => ({ tipoElemento, cantidad }));
      
      // Agrupar por usuario
      const movimientosPorUsuario = Object.entries(
        movimientosTipados.reduce((acc, mov) => {
          const key = mov.usuarioId.toString();
          if (!acc[key]) {
            acc[key] = {
              usuarioId: mov.usuarioId,
              nombreUsuario: mov.usuario ? `${mov.usuario.nombre} ${mov.usuario.apellido}` : `Usuario ${mov.usuarioId}`,
              cantidad: 0
            };
          }
          acc[key].cantidad += 1;
          return acc;
        }, {} as Record<string, { usuarioId: number; nombreUsuario: string; cantidad: number }>)
      ).map(([_, value]) => value);
      
      // Agrupar por fecha (agrupado por día)
      const movimientosPorFecha = Object.entries(
        movimientosTipados.reduce((acc, mov) => {
          const fecha = mov.fecha.toISOString().split('T')[0];
          acc[fecha] = (acc[fecha] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([fecha, cantidad]) => ({ fecha, cantidad }))
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      
      return {
        totalEntradas,
        totalSalidas,
        totalAjustesPositivos,
        totalAjustesNegativos,
        movimientosPorTipoElemento,
        movimientosPorUsuario,
        movimientosPorFecha
      };
    } catch (error) {
      logger.error({ error, filtros }, 'Error al generar reporte de movimientos');
      throw error;
    }
  }
  
  async getMovimientosDetallados(filtros?: MovimientoInventarioFiltros): Promise<PaginatedResult<MovimientoInventarioDetallado>> {
    try {
      const result = await this.getAllMovimientos(filtros);
      const movimientos = result.data;
      
      // Obtener todos los IDs únicos de elementos por tipo
      const materiaPrimaIds = movimientos
        .filter(m => m.tipoElemento === 'MateriaPrima')
        .map(m => m.elementoId);
      
      const productoTerminadoIds = movimientos
        .filter(m => m.tipoElemento === 'ProductoTerminado')
        .map(m => m.elementoId);
      
      // Obtener todos los lotes únicos
      const lotesMPIds = movimientos
        .filter(m => m.tipoElemento === 'MateriaPrima' && m.loteId)
        .map(m => m.loteId as number);
      
      const lotesPTIds = movimientos
        .filter(m => m.tipoElemento === 'ProductoTerminado' && m.loteId)
        .map(m => m.loteId as number);
      
      // Consultar información adicional en paralelo
      const [materiaPrimas, productosTerminados, lotesMp, lotesPt] = await Promise.all([
        materiaPrimaIds.length > 0
          ? this.prisma.materiaPrima.findMany({
              where: { id: { in: materiaPrimaIds } },
              select: { id: true, nombre: true, codigo: true }
            })
          : [],
        productoTerminadoIds.length > 0
          ? this.prisma.productoTerminado.findMany({
              where: { id: { in: productoTerminadoIds } },
              select: { id: true, nombre: true, codigo: true }
            })
          : [],
        lotesMPIds.length > 0
          ? this.prisma.loteMateriaPrima.findMany({
              where: { id: { in: lotesMPIds } },
              select: { id: true, codigoLote: true }
            })
          : [],
        lotesPTIds.length > 0
          ? this.prisma.loteProducto.findMany({
              where: { id: { in: lotesPTIds } },
              select: { id: true, codigoLote: true }
            })
          : []
      ]);
      
      // Crear mapas para facilitar la búsqueda
      const materiaPrimaMap = new Map(materiaPrimas.map(mp => [mp.id, mp]));
      const productoTerminadoMap = new Map(productosTerminados.map(pt => [pt.id, pt]));
      const loteMpMap = new Map(lotesMp.map(l => [l.id, l]));
      const lotePtMap = new Map(lotesPt.map(l => [l.id, l]));
      
      // Enriquecer los movimientos con información detallada
      const movimientosDetallados: MovimientoInventarioDetallado[] = movimientos.map(movimiento => {
        const detallado: MovimientoInventarioDetallado = { ...movimiento };
        
        if (movimiento.tipoElemento === 'MateriaPrima') {
          const materiaPrima = materiaPrimaMap.get(movimiento.elementoId);
          if (materiaPrima) {
            detallado.nombreElemento = materiaPrima.nombre;
            detallado.codigoElemento = materiaPrima.codigo;
          }
          
          if (movimiento.loteId) {
            const lote = loteMpMap.get(movimiento.loteId);
            if (lote) {
              detallado.codigoLote = lote.codigoLote;
            }
          }
        } else if (movimiento.tipoElemento === 'ProductoTerminado') {
          const productoTerminado = productoTerminadoMap.get(movimiento.elementoId);
          if (productoTerminado) {
            detallado.nombreElemento = productoTerminado.nombre;
            detallado.codigoElemento = productoTerminado.codigo;
          }
          
          if (movimiento.loteId) {
            const lote = lotePtMap.get(movimiento.loteId);
            if (lote) {
              detallado.codigoLote = lote.codigoLote;
            }
          }
        }
        
        if (movimiento.usuario) {
          detallado.nombreUsuario = `${movimiento.usuario.nombre} ${movimiento.usuario.apellido}`;
        }
        
        return detallado;
      });
      
      return {
        ...result,
        data: movimientosDetallados
      };
    } catch (error) {
      logger.error({ error, filtros }, 'Error al obtener movimientos detallados');
      throw error;
    }
  }
} 