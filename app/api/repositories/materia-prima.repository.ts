import { PrismaClient, Prisma } from '@prisma/client';
import {
  MateriaPrima,
  LoteMateriaPrima,
  LoteMateriaPrimaDetalle,
  MovimientoInventarioMateriaPrima,
  MateriaPrimaCreateInput,
  MateriaPrimaUpdateInput,
  LoteMateriaPrimaCreateInput,
  LoteMateriaPrimaUpdateInput,
  MovimientoInventarioCreateInput
} from '../models/materia-prima.model';
import { NotFoundError } from '../middlewares/error-handler.middleware';
import { createLogger } from '../utils/logger';
import { Decimal } from '@prisma/client/runtime/library';
import { toDecimal, toNumber, isValidNumber } from '../utils/helpers';

const logger = createLogger('materiaPrimaRepository');

export interface MateriaPrimaRepository {
  // Materias Primas
  getMateriasPrimas(filtros?: Record<string, any>): Promise<MateriaPrima[]>;
  getMateriaPrimaById(id: number): Promise<MateriaPrima | null>;
  getMateriaPrimaByCodigo(codigo: string): Promise<MateriaPrima | null>;
  createMateriaPrima(data: MateriaPrimaCreateInput): Promise<MateriaPrima>;
  updateMateriaPrima(id: number, data: MateriaPrimaUpdateInput): Promise<MateriaPrima>;
  deleteMateriaPrima(id: number): Promise<void>;
  
  // Lotes de Materias Primas
  getLotesMateriasPrimas(filtros?: Record<string, any>): Promise<LoteMateriaPrima[]>;
  getLoteMateriaPrimaById(id: number): Promise<LoteMateriaPrimaDetalle | null>;
  getLotesByMateriaPrimaId(materiaPrimaId: number): Promise<LoteMateriaPrima[]>;
  createLoteMateriaPrima(data: LoteMateriaPrimaCreateInput): Promise<LoteMateriaPrima>;
  updateLoteMateriaPrima(id: number, data: LoteMateriaPrimaUpdateInput): Promise<LoteMateriaPrima>;
  deleteLoteMateriaPrima(id: number): Promise<void>;
  
  // Movimientos de Inventario
  getMovimientosInventarioMateriaPrima(materiaPrimaId: number): Promise<MovimientoInventarioMateriaPrima[]>;
  createMovimientoInventario(data: MovimientoInventarioCreateInput): Promise<MovimientoInventarioMateriaPrima>;
  
  // Consultas especializadas
  getMateriasPrimasConStockBajo(): Promise<MateriaPrima[]>;
  getMateriasPrimasPorCaducar(diasUmbral: number): Promise<any[]>;
  actualizarStockMateriaPrima(id: number, cantidad: number, tipo: 'Entrada' | 'Salida'): Promise<MateriaPrima>;
}
export class PrismaMateriaPrimaRepository implements MateriaPrimaRepository {
  constructor(private prisma: PrismaClient) {}

  // Implementación de métodos para Materias Primas
  async getMateriasPrimas(filtros: Record<string, any> = {}): Promise<MateriaPrima[]> {
    try {
      // Usar Prisma.ModelName + WhereInput, no el nombre de la tabla
      const where: Prisma.MateriaPrimaWhereInput = {};
      
      if (filtros.codigo) {
        where.codigo = { contains: filtros.codigo };
      }
      
      if (filtros.nombre) {
        where.nombre = { contains: filtros.nombre };
      }
      
      if (filtros.tipo) {
        where.tipo = filtros.tipo;
      }
      
      if (filtros.estado) {
        where.estado = filtros.estado;
      }
      
      if (filtros.stockBajo === true) {
        // Usar la referencia de campo para comparar columnas de la misma tabla
        where.stockActual = {
          lte: this.prisma.materiaPrima.fields.stockMinimo
        };
      }
      
      return this.prisma.materiaPrima.findMany({
        where,
        orderBy: { nombre: 'asc' }
      }) as Promise<MateriaPrima[]>;
    } catch (error) {
      logger.error({ error }, 'Error al obtener materias primas');
      throw error;
    }
  }

  async getMateriaPrimaById(id: number): Promise<MateriaPrima | null> {
    try {
      return this.prisma.materiaPrima.findUnique({
        where: { id }
      }) as Promise<MateriaPrima | null>;
    } catch (error) {
      logger.error({ error, id }, 'Error al obtener materia prima por ID');
      throw error;
    }
  }

  async getMateriaPrimaByCodigo(codigo: string): Promise<MateriaPrima | null> {
    try {
      return this.prisma.materiaPrima.findFirst({
        where: { codigo }
      }) as Promise<MateriaPrima | null>;
    } catch (error) {
      logger.error({ error, codigo }, 'Error al obtener materia prima por código');
      throw error;
    }
  }

  async createMateriaPrima(data: MateriaPrimaCreateInput): Promise<MateriaPrima> {
    try {
      return this.prisma.materiaPrima.create({
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          tipo: data.tipo,
          subtipo: data.subtipo,
          unidadMedida: data.unidadMedida,
          stockMinimo: data.stockMinimo,
          stockActual: 0, // Siempre inicia en 0
          ubicacionFisica: data.ubicacionFisica,
          atributosEspecificos: JSON.stringify(data.atributosEspecificos),
          estado: data.estado || 'Activo',
          notas: data.notas,
          fechaCreacion: new Date(),
        }
      }) as Promise<MateriaPrima>;
    } catch (error) {
      logger.error({ error, data }, 'Error al crear materia prima');
      throw error;
    }
  }

  async updateMateriaPrima(id: number, data: MateriaPrimaUpdateInput): Promise<MateriaPrima> {
    try {
      const materiaPrima = await this.prisma.materiaPrima.findUnique({
        where: { id }
      });
      
      if (!materiaPrima) {
        throw new NotFoundError(`Materia prima con ID ${id} no encontrada`);
      }
      
      return this.prisma.materiaPrima.update({
        where: { id },
        data: {
          nombre: data.nombre,
          tipo: data.tipo,
          subtipo: data.subtipo,
          unidadMedida: data.unidadMedida,
          stockMinimo: data.stockMinimo,
          ubicacionFisica: data.ubicacionFisica,
          atributosEspecificos: JSON.stringify(data.atributosEspecificos),
          estado: data.estado,
          notas: data.notas,
          fechaModificacion: new Date()
        }
      }) as Promise<MateriaPrima>;
    } catch (error) {
      logger.error({ error, id, data }, 'Error al actualizar materia prima');
      throw error;
    }
  }

  async deleteMateriaPrima(id: number): Promise<void> {
    try {
      const materiaPrima = await this.prisma.materiaPrima.findUnique({
        where: { id },
        include: {
          lotes: true,
          detallesOrdenCompra: true,
          detallesRecepcion: true,
          detallesReceta: true,
          consumos: true
        }
      });
      
      if (!materiaPrima) {
        throw new NotFoundError(`Materia prima con ID ${id} no encontrada`);
      }
      
      // Verificar si hay relaciones que impidan la eliminación
      if (
        materiaPrima.lotes.length > 0 || 
        materiaPrima.detallesOrdenCompra.length > 0 ||
        materiaPrima.detallesRecepcion.length > 0 ||
        materiaPrima.detallesReceta.length > 0 ||
        materiaPrima.consumos.length > 0
      ) {
        // En lugar de eliminar, marcamos como inactivo
        await this.prisma.materiaPrima.update({
          where: { id },
          data: {
            estado: 'Inactivo',
            fechaModificacion: new Date()
          }
        });
      } else {
        // Si no hay relaciones, podemos eliminar
        await this.prisma.materiaPrima.delete({
          where: { id }
        });
      }
    } catch (error) {
      logger.error({ error, id }, 'Error al eliminar materia prima');
      throw error;
    }
  }
  
  // Implementación de métodos para Lotes de Materias Primas
  async getLotesMateriasPrimas(filtros: Record<string, any> = {}): Promise<LoteMateriaPrima[]> {
    try {
      // Corregir el tipo
      const where: Prisma.LoteMateriaPrimaWhereInput = {};
      
      if (filtros.codigoLote) {
        where.codigoLote = { contains: filtros.codigoLote };
      }
      
      if (filtros.materiaPrimaId) {
        where.materiaPrimaId = Number(filtros.materiaPrimaId);
      }
      
      if (filtros.proveedorId) {
        where.proveedorId = Number(filtros.proveedorId);
      }
      
      if (filtros.estado) {
        where.estado = filtros.estado;
      }
      
      if (filtros.fechaCaducidadDesde) {
        where.fechaCaducidad = {
          ...(where.fechaCaducidad as Prisma.DateTimeFilter || {}),
          gte: new Date(filtros.fechaCaducidadDesde)
        };
      }
      
      if (filtros.fechaCaducidadHasta) {
        where.fechaCaducidad = {
          ...(where.fechaCaducidad as Prisma.DateTimeFilter || {}),
          lte: new Date(filtros.fechaCaducidadHasta)
        };
      }
      
      return this.prisma.loteMateriaPrima.findMany({
        where,
        include: {
          materiaPrima: true,
          proveedor: true
        },
        orderBy: { fechaRecepcion: 'desc' }
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener lotes de materias primas');
      throw error;
    }
  }

  async getLoteMateriaPrimaById(id: number): Promise<LoteMateriaPrimaDetalle | null> {
    try {
      return this.prisma.loteMateriaPrima.findUnique({
        where: { id },
        include: {
          materiaPrima: true,
          proveedor: true
        }
      });
    } catch (error) {
      logger.error({ error, id }, 'Error al obtener lote de materia prima por ID');
      throw error;
    }
  }

  async getLotesByMateriaPrimaId(materiaPrimaId: number): Promise<LoteMateriaPrima[]> {
    try {
      return this.prisma.loteMateriaPrima.findMany({
        where: { 
          materiaPrimaId,
          cantidadDisponible: {
            gt: 0
          },
          estado: 'Disponible'
        },
        orderBy: [
          { fechaCaducidad: 'asc' }, // FIFO por caducidad
          { fechaRecepcion: 'asc' }  // FIFO por recepción
        ]
      });
    } catch (error) {
      logger.error({ error, materiaPrimaId }, 'Error al obtener lotes por materia prima');
      throw error;
    }
  }

  async createLoteMateriaPrima(data: LoteMateriaPrimaCreateInput): Promise<LoteMateriaPrima> {
    try {
      // Si no se especifica la cantidad disponible, se asume que es igual a la cantidad total
      const cantidadDisponible = data.cantidadDisponible || data.cantidad;
      
      // Usar los helpers para convertir los valores numéricos
      const cantidad = toDecimal(data.cantidad);
      const cantidadDisponibleValue = toDecimal(cantidadDisponible);
      
      return this.prisma.loteMateriaPrima.create({
        data: {
          materiaPrimaId: data.materiaPrimaId,
          codigoLote: data.codigoLote,
          proveedorId: data.proveedorId,
          fechaRecepcion: new Date(data.fechaRecepcion),
          fechaProduccion: data.fechaProduccion ? new Date(data.fechaProduccion) : null,
          fechaCaducidad: data.fechaCaducidad ? new Date(data.fechaCaducidad) : null,
          cantidad: cantidad,
          cantidadDisponible: cantidadDisponibleValue,
          precio: data.precio,
          ordenCompraId: data.ordenCompraId,
          estado: data.estado || 'Disponible',
          notas: data.notas
        },
        include: {
          materiaPrima: true,
          proveedor: true
        }
      });
    } catch (error) {
      logger.error({ error, data }, 'Error al crear lote de materia prima');
      throw error;
    }
  }

  async updateLoteMateriaPrima(id: number, data: LoteMateriaPrimaUpdateInput): Promise<LoteMateriaPrima> {
    try {
      const lote = await this.prisma.loteMateriaPrima.findUnique({
        where: { id }
      });
      
      if (!lote) {
        throw new NotFoundError(`Lote de materia prima con ID ${id} no encontrado`);
      }
      
      return this.prisma.loteMateriaPrima.update({
        where: { id },
        data: {
          fechaProduccion: data.fechaProduccion ? new Date(data.fechaProduccion) : undefined,
          fechaCaducidad: data.fechaCaducidad ? new Date(data.fechaCaducidad) : undefined,
          cantidad: data.cantidad,
          cantidadDisponible: data.cantidadDisponible,
          precio: data.precio,
          estado: data.estado,
          notas: data.notas
        },
        include: {
          materiaPrima: true,
          proveedor: true
        }
      });
    } catch (error) {
      logger.error({ error, id, data }, 'Error al actualizar lote de materia prima');
      throw error;
    }
  }

  async deleteLoteMateriaPrima(id: number): Promise<void> {
    try {
      const lote = await this.prisma.loteMateriaPrima.findUnique({
        where: { id },
        include: {
          detallesRecepcion: true,
          consumos: true
        }
      });
      
      if (!lote) {
        throw new NotFoundError(`Lote de materia prima con ID ${id} no encontrado`);
      }
      
      // Verificar si hay relaciones que impidan la eliminación
      if (lote.detallesRecepcion.length > 0 || lote.consumos.length > 0) {
        // En lugar de eliminar, marcamos como inactivo
        await this.prisma.loteMateriaPrima.update({
          where: { id },
          data: {
            estado: 'Bloqueado'
          }
        });
      } else {
        // Si no hay relaciones, podemos eliminar
        await this.prisma.loteMateriaPrima.delete({
          where: { id }
        });
      }
    } catch (error) {
      logger.error({ error, id }, 'Error al eliminar lote de materia prima');
      throw error;
    }
  }
  
  // Implementación de métodos para Movimientos de Inventario
  async getMovimientosInventarioMateriaPrima(materiaPrimaId: number): Promise<MovimientoInventarioMateriaPrima[]> {
    try {
      return this.prisma.movimientoInventario.findMany({
        where: { 
          tipoElemento: 'MateriaPrima',
          elementoId: materiaPrimaId
        },
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
      }) as Promise<MovimientoInventarioMateriaPrima[]>;
    } catch (error) {
      logger.error({ error, materiaPrimaId }, 'Error al obtener movimientos de inventario');
      throw error;
    }
  }

  async createMovimientoInventario(data: MovimientoInventarioCreateInput): Promise<MovimientoInventarioMateriaPrima> {
    try {
      // Convertir cantidad a un valor numérico compatible con Prisma usando el helper
      const cantidad = toDecimal(data.cantidad);
      
      return this.prisma.movimientoInventario.create({
        data: {
          tipoMovimiento: data.tipoMovimiento,
          tipoElemento: data.tipoElemento,
          elementoId: data.elementoId,
          loteId: data.loteId,
          cantidad: cantidad,
          unidadMedida: data.unidadMedida,
          documentoReferencia: data.documentoReferencia,
          referenciaId: data.referenciaId,
          motivo: data.motivo,
          usuarioId: data.usuarioId,
          notas: data.notas
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true
            }
          }
        }
      }) as Promise<MovimientoInventarioMateriaPrima>;
    } catch (error) {
      logger.error({ error, data }, 'Error al crear movimiento de inventario');
      throw error;
    }
  }
  
  // Implementación de consultas especializadas
  async getMateriasPrimasConStockBajo(): Promise<MateriaPrima[]> {
    try {
      return this.prisma.$queryRaw`
        SELECT * FROM materias_primas
        WHERE stock_actual <= stock_minimo
        AND estado = 'Activo'
        ORDER BY (stock_minimo - stock_actual) DESC
      `;
    } catch (error) {
      logger.error({ error }, 'Error al obtener materias primas con stock bajo');
      throw error;
    }
  }

  async getMateriasPrimasPorCaducar(diasUmbral: number): Promise<any[]> {
    try {
      const fechaUmbral = new Date();
      fechaUmbral.setDate(fechaUmbral.getDate() + diasUmbral);
      
      return this.prisma.$queryRaw`
        SELECT 
          mp.id AS materia_prima_id,
          mp.codigo,
          mp.nombre,
          mp.tipo,
          mp.unidad_medida,
          lmp.id AS lote_id,
          lmp.codigo_lote,
          lmp.fecha_caducidad,
          lmp.cantidad_disponible,
          p.nombre AS proveedor,
          (lmp.fecha_caducidad - CURRENT_DATE) AS dias_para_caducar
        FROM lotes_materia_prima lmp
        JOIN materias_primas mp ON lmp.materia_prima_id = mp.id
        JOIN proveedores p ON lmp.proveedor_id = p.id
        WHERE lmp.fecha_caducidad IS NOT NULL
          AND lmp.fecha_caducidad <= ${fechaUmbral}
          AND lmp.fecha_caducidad >= CURRENT_DATE
          AND lmp.cantidad_disponible > 0
          AND lmp.estado = 'Disponible'
        ORDER BY lmp.fecha_caducidad ASC
      `;
    } catch (error) {
      logger.error({ error, diasUmbral }, 'Error al obtener materias primas por caducar');
      throw error;
    }
  }

  async actualizarStockMateriaPrima(id: number, cantidad: number, tipo: 'Entrada' | 'Salida'): Promise<MateriaPrima> {
    try {
      // Verificar que cantidad sea un número válido usando el helper
      if (!isValidNumber(cantidad) || cantidad <= 0) {
        throw new Error(`La cantidad debe ser un número positivo. Valor recibido: ${cantidad}`);
      }
      
      const materiaPrima = await this.prisma.materiaPrima.findUnique({
        where: { id }
      });
      
      if (!materiaPrima) {
        throw new NotFoundError(`Materia prima con ID ${id} no encontrada`);
      }
      
      // Convertir stockActual a número usando el helper
      let nuevoStock = toNumber(materiaPrima.stockActual);
      
      if (tipo === 'Entrada') {
        nuevoStock += cantidad;
      } else {
        nuevoStock -= cantidad;
        
        // Validar que no quede stock negativo
        if (nuevoStock < 0) {
          throw new Error(`Stock insuficiente. Stock actual: ${materiaPrima.stockActual}, Cantidad solicitada: ${cantidad}`);
        }
      }
      
      return this.prisma.materiaPrima.update({
        where: { id },
        data: {
          stockActual: nuevoStock,
          fechaModificacion: new Date()
        }
      }) as Promise<MateriaPrima>;
    } catch (error) {
      logger.error({ error, id, cantidad, tipo }, 'Error al actualizar stock de materia prima');
      throw error;
    }
  }
}