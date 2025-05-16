import { Decimal } from '@prisma/client/runtime/library';

export interface MovimientoInventario {
  id: number;
  fecha: Date;
  tipoMovimiento: 'Entrada' | 'Salida' | 'Ajuste Positivo' | 'Ajuste Negativo';
  tipoElemento: string;
  elementoId: number;
  loteId?: number | null;
  cantidad: Decimal;
  unidadMedida: string;
  documentoReferencia?: string | null;
  referenciaId?: number | null;
  motivo?: string | null;
  usuarioId: number;
  notas?: string | null;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface MovimientoInventarioCreateInput {
  tipoMovimiento: 'Entrada' | 'Salida' | 'Ajuste Positivo' | 'Ajuste Negativo';
  tipoElemento: string;
  elementoId: number;
  loteId?: number | null;
  cantidad: Decimal;
  unidadMedida: string;
  documentoReferencia?: string | null;
  referenciaId?: number | null;
  motivo?: string | null;
  usuarioId: number;
  notas?: string | null;
}

export interface MovimientoInventarioFiltros {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoMovimiento?: string;
  tipoElemento?: string;
  elementoId?: number;
  loteId?: number;
  usuarioId?: number;
  documentoReferencia?: string;
  page?: number;
  limit?: number;
}

export interface MovimientoInventarioReporte {
  totalEntradas: number;
  totalSalidas: number;
  totalAjustesPositivos: number;
  totalAjustesNegativos: number;
  movimientosPorTipoElemento: {
    tipoElemento: string;
    cantidad: number;
  }[];
  movimientosPorUsuario: {
    usuarioId: number;
    nombreUsuario: string;
    cantidad: number;
  }[];
  movimientosPorFecha: {
    fecha: string;
    cantidad: number;
  }[];
}

export interface MovimientoInventarioDetallado extends MovimientoInventario {
  nombreElemento?: string;
  codigoElemento?: string;
  nombreUsuario?: string;
  codigoLote?: string;
} 