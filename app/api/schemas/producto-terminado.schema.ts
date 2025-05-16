import { z } from 'zod';

// Estilos de cerveza permitidos
export const EstilosCerveza = [
  'LAGER', 'PILSNER', 'IPA', 'APA', 'PALE_ALE', 'STOUT',
  'PORTER', 'WHEAT', 'SOUR', 'BELGIAN', 'AMBER', 'RED_ALE',
  'BROWN_ALE', 'GOLDEN_ALE', 'BARLEYWINE', 'BOCK', 'SAISON', 'OTRO'
] as const;
export type EstiloCerveza = typeof EstilosCerveza[number];

// Presentaciones permitidas
export const Presentaciones = ['BOTELLA', 'LATA', 'BARRIL', 'GROWLER', 'OTRO'] as const;
export type Presentacion = typeof Presentaciones[number];

// Validación para creación de producto terminado
export const productoTerminadoCreateSchema = z.object({
  codigo: z.string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código debe contener solo letras mayúsculas, números y guiones'),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  estilo: z.enum(EstilosCerveza, {
    errorMap: () => ({ message: 'Estilo de cerveza no válido' })
  }),
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .nullable(),
  presentacion: z.enum(Presentaciones, {
    errorMap: () => ({ message: 'Presentación no válida' })
  }),
  capacidad: z.number()
    .min(0, 'La capacidad no puede ser negativa'),
  unidadMedida: z.string()
    .min(1, 'La unidad de medida es requerida')
    .max(20, 'La unidad de medida no puede exceder 20 caracteres'),
  stockMinimo: z.number()
    .min(0, 'El stock mínimo no puede ser negativo'),
  precioBase: z.number()
    .min(0, 'El precio base no puede ser negativo')
    .nullable(),
  estado: z.string()
    .max(20, 'El estado no puede exceder 20 caracteres')
    .optional(),
  imagen: z.string()
    .url('El formato de URL de la imagen no es válido')
    .nullable(),
  notas: z.string().nullable()
});

export type ProductoTerminado = z.infer<typeof productoTerminadoCreateSchema>;

// Validación para actualización de producto terminado
export const productoTerminadoUpdateSchema = productoTerminadoCreateSchema.partial();

// Estados de lotes permitidos
export const EstadosLoteProducto = ['Disponible', 'Agotado', 'Caducado', 'Reservado', 'Bloqueado'] as const;

// Validación para creación de lote de producto
export const loteProductoCreateSchema = z.object({
  productoTerminadoId: z.number().min(1, 'El ID de producto terminado es requerido'),
  codigoLote: z.string()
    .min(1, 'El código de lote es requerido')
    .max(50, 'El código de lote no puede exceder 50 caracteres'),
  loteFabricacionId: z.number().min(1, 'El ID de lote de fabricación es requerido'),
  fechaEnvasado: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD'),
  fechaOptimoConsumo: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD')
    .nullable(),
  fechaCaducidad: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD')
    .nullable(),
  cantidad: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  cantidadDisponible: z.number().optional(),
  estado: z.enum(EstadosLoteProducto, {
    errorMap: () => ({ message: 'Estado de lote no válido' })
  }).optional(),
  ubicacionFisica: z.string()
    .max(50, 'La ubicación física no puede exceder 50 caracteres')
    .nullable(),
  notas: z.string().nullable()
});

// Validación para actualización de lote de producto
export const loteProductoUpdateSchema = loteProductoCreateSchema.partial();

// Tipos de movimiento permitidos
export const TiposMovimientoProducto = ['Entrada', 'Salida', 'Ajuste Positivo', 'Ajuste Negativo'] as const;

// Validación para creación de movimiento de inventario
export const movimientoInventarioProductoCreateSchema = z.object({
  tipoMovimiento: z.enum(TiposMovimientoProducto, {
    errorMap: () => ({ message: 'Tipo de movimiento no válido' })
  }),
  tipoElemento: z.literal('ProductoTerminado'),
  elementoId: z.number().min(1, 'El ID del elemento es requerido'),
  loteId: z.number()
    .min(1, 'El ID de lote debe ser mayor a 0')
    .nullable(),
  cantidad: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  unidadMedida: z.string().max(20, 'La unidad de medida no puede exceder 20 caracteres'),
  documentoReferencia: z.string()
    .max(50, 'La referencia de documento no puede exceder 50 caracteres')
    .nullable(),
  referenciaId: z.number()
    .min(1, 'El ID de referencia debe ser mayor a 0')
    .nullable(),
  motivo: z.string()
    .max(100, 'El motivo no puede exceder 100 caracteres')
    .nullable(),
  usuarioId: z.number().min(1, 'El ID de usuario es requerido'),
  notas: z.string().nullable()
});

// Esquema para búsqueda de productos terminados
export const productoTerminadoBusquedaSchema = z.object({
  codigo: z.string().optional(),
  nombre: z.string().optional(),
  estilo: z.string().optional(),
  presentacion: z.string().optional(),
  estado: z.string().optional(),
  stockBajo: z.boolean().optional()
}); 