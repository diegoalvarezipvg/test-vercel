import { z } from 'zod';

// Definición de tipos enumerados
export const TiposMovimiento = [
  'Entrada', 
  'Salida', 
  'Ajuste Positivo', 
  'Ajuste Negativo'
] as const;

export const TiposElemento = [
  'MateriaPrima', 
  'ProductoTerminado'
] as const;

// Esquema para crear un movimiento de inventario
export const movimientoInventarioCreateSchema = z.object({
  tipoMovimiento: z.enum(TiposMovimiento, {
    errorMap: () => ({ message: 'Tipo de movimiento no válido' })
  }),
  tipoElemento: z.enum(TiposElemento, {
    errorMap: () => ({ message: 'Tipo de elemento no válido' })
  }),
  elementoId: z.number().min(1, 'El ID del elemento es requerido'),
  loteId: z.number()
    .min(1, 'El ID de lote debe ser mayor a 0')
    .nullable()
    .optional(),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  unidadMedida: z.string().max(20, 'La unidad de medida no puede exceder 20 caracteres'),
  documentoReferencia: z.string()
    .max(50, 'La referencia de documento no puede exceder 50 caracteres')
    .nullable()
    .optional(),
  referenciaId: z.number()
    .min(1, 'El ID de referencia debe ser mayor a 0')
    .nullable()
    .optional(),
  motivo: z.string()
    .max(100, 'El motivo no puede exceder 100 caracteres')
    .nullable()
    .optional(),
  usuarioId: z.number().min(1, 'El ID de usuario es requerido'),
  notas: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .nullable()
    .optional(),
});

// Esquema para filtrar movimientos
export const movimientoInventarioFiltrosSchema = z.object({
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  tipoMovimiento: z.enum(TiposMovimiento).optional(),
  tipoElemento: z.enum(TiposElemento).optional(),
  elementoId: z.coerce.number().optional(),
  loteId: z.coerce.number().optional(),
  usuarioId: z.coerce.number().optional(),
  documentoReferencia: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10),
}); 