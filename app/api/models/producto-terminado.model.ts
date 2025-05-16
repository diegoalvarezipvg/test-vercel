import { Decimal } from '@prisma/client/runtime/library';

export interface ProductoTerminado {
  id: number;
  codigo: string;
  nombre: string;
  estilo: string;
  descripcion?: string | null;
  presentacion: string;
  capacidad: Decimal;
  unidadMedida: string;
  stockActual: Decimal;
  stockMinimo: Decimal;
  precioBase?: Decimal | null;
  estado: string;
  imagen?: string | null;
  notas?: string | null;
  fechaCreacion: Date;
  fechaModificacion?: Date | null;
}

export interface LoteProducto {
  id: number;
  productoTerminadoId: number;
  codigoLote: string;
  loteFabricacionId: number;
  fechaEnvasado: Date;
  fechaOptimoConsumo?: Date | null;
  fechaCaducidad?: Date | null;
  cantidad: Decimal;
  cantidadDisponible: Decimal;
  estado: string;
  ubicacionFisica?: string | null;
  notas?: string | null;
}

export interface MovimientoInventarioProducto {
  id: number;
  fecha: Date;
  tipoMovimiento: 'Entrada' | 'Salida' | 'Ajuste Positivo' | 'Ajuste Negativo';
  tipoElemento: 'ProductoTerminado';
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

export interface ProductoTerminadoConLotes extends ProductoTerminado {
  lotes: LoteProducto[];
}

export interface ProductoTerminadoResumen {
  id: number;
  codigo: string;
  nombre: string;
  estilo: string;
  presentacion: string;
  capacidad: Decimal;
  stockActual: Decimal;
  stockMinimo: Decimal;
  unidadMedida: string;
  estado: string;
}

export interface LoteProductoDetalle extends LoteProducto {
  productoTerminado: ProductoTerminadoResumen;
}

export type ProductoTerminadoCreateInput = Omit<
  ProductoTerminado, 
  'id' | 'fechaCreacion' | 'fechaModificacion' | 'stockActual'
>;

export type ProductoTerminadoUpdateInput = Partial<Omit<
  ProductoTerminado, 
  'id' | 'codigo' | 'fechaCreacion' | 'fechaModificacion' | 'stockActual'
>>;

export type LoteProductoCreateInput = Omit<
  LoteProducto,
  'id' | 'cantidadDisponible'
> & {
  cantidadDisponible?: Decimal;
};

export type LoteProductoUpdateInput = Partial<Omit<
  LoteProducto,
  'id' | 'productoTerminadoId' | 'codigoLote'
>>;

export type MovimientoInventarioProductoCreateInput = Omit<
  MovimientoInventarioProducto,
  'id' | 'fecha'
>; 