import { Decimal } from '@prisma/client/runtime/library';

export interface MateriaPrima {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  subtipo?: string | null;
  unidadMedida: string;
  stockActual: Decimal;
  stockMinimo: Decimal;
  ubicacionFisica?: string | null;
  atributosEspecificos?: Record<string, any> | null;
  estado: string;
  notas?: string | null;
  fechaCreacion: Date;
  fechaModificacion?: Date | null;
}

export interface LoteMateriaPrima {
  id: number;
  materiaPrimaId: number;
  codigoLote: string;
  proveedorId: number;
  fechaRecepcion: Date;
  fechaProduccion?: Date | null;
  fechaCaducidad?: Date | null;
  cantidad: Decimal;
  cantidadDisponible: Decimal;
  precio?: Decimal | null;
  ordenCompraId?: number | null;
  estado: string;
  notas?: string | null;
}

export interface MovimientoInventarioMateriaPrima {
  id: number;
  fecha: Date;
  tipoMovimiento: 'Entrada' | 'Salida' | 'Ajuste Positivo' | 'Ajuste Negativo';
  tipoElemento: 'MateriaPrima';
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

export interface MateriaPrimaConLotes extends MateriaPrima {
  lotes: LoteMateriaPrima[];
}

export interface MateriaPrimaResumen {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  stockActual: Decimal;
  stockMinimo: Decimal;
  unidadMedida: string;
  estado: string;
}

export interface LoteMateriaPrimaDetalle extends LoteMateriaPrima {
  materiaPrima: MateriaPrimaResumen;
  proveedor: {
    id: number;
    nombre: string;
  };
}

export type MateriaPrimaCreateInput = Omit<
  MateriaPrima, 
  'id' | 'fechaCreacion' | 'fechaModificacion' | 'stockActual'
>;

export type MateriaPrimaUpdateInput = Partial<Omit<
  MateriaPrima, 
  'id' | 'codigo' | 'fechaCreacion' | 'fechaModificacion' | 'stockActual'
>>;

export type LoteMateriaPrimaCreateInput = Omit<
  LoteMateriaPrima,
  'id' | 'cantidadDisponible'
> & {
  cantidadDisponible?: Decimal;
  usuarioId?: number;
};

export type LoteMateriaPrimaUpdateInput = Partial<Omit<
  LoteMateriaPrima,
  'id' | 'materiaPrimaId' | 'codigoLote'
>>;

export type MovimientoInventarioCreateInput = Omit<
  MovimientoInventarioMateriaPrima,
  'id' | 'fecha'
>;