import { z } from 'zod';

// Tipos de materias primas permitidos
export const TiposMateriaPrima = ['MALTA', 'LUPULO', 'LEVADURA', 'ADJUNTO', 'OTRO'] as const;
export type TipoMateriaPrima = typeof TiposMateriaPrima[number];

// Validación para creación de materia prima
export const materiaPrimaCreateSchema = z.object({
  codigo: z.string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El código debe contener solo letras mayúsculas, números y guiones'),
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  tipo: z.enum(TiposMateriaPrima, {
    errorMap: () => ({ message: 'Tipo de materia prima no válido' })
  }),
  subtipo: z.string()
    .max(50, 'El subtipo no puede exceder 50 caracteres')
    .nullable(),
  unidadMedida: z.string()
    .min(1, 'La unidad de medida es requerida')
    .max(20, 'La unidad de medida no puede exceder 20 caracteres'),
  stockMinimo: z.number()
    .min(0, 'El stock mínimo no puede ser negativo'),
  ubicacionFisica: z.string()
    .max(50, 'La ubicación física no puede exceder 50 caracteres')
    .nullable(),
  atributosEspecificos: z.record(z.unknown()).optional(),
  estado: z.string()
    .max(20, 'El estado no puede exceder 20 caracteres')
    .optional(),
  notas: z.string().nullable()
});

export type MateriaPrima = z.infer<typeof materiaPrimaCreateSchema>;

// Validación para actualización de materia prima
export const materiaPrimaUpdateSchema = materiaPrimaCreateSchema.partial();

// Estados de lotes permitidos
export const EstadosLote = ['Disponible', 'Agotado', 'Caducado', 'Reservado', 'Bloqueado'] as const;

// Validación para creación de lote de materia prima
export const loteMateriaPrimaCreateSchema = z.object({
  materiaPrimaId: z.number().min(1, 'El ID de materia prima es requerido'),
  codigoLote: z.string()
    .min(1, 'El código de lote es requerido')
    .max(50, 'El código de lote no puede exceder 50 caracteres'),
  proveedorId: z.number().min(1, 'El ID de proveedor es requerido'),
  fechaRecepcion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD'),
  fechaProduccion: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD')
    .nullable(),
  fechaCaducidad: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida. Use formato YYYY-MM-DD')
    .nullable(),
  cantidad: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  cantidadDisponible: z.number().optional(),
  precio: z.number()
    .min(0, 'El precio no puede ser negativo')
    .nullable(),
  ordenCompraId: z.number()
    .min(1, 'El ID de orden de compra debe ser mayor a 0')
    .nullable(),
  estado: z.enum(EstadosLote, {
    errorMap: () => ({ message: 'Estado de lote no válido' })
  }).optional(),
  notas: z.string().nullable()
});

// Validación para actualización de lote de materia prima
export const loteMateriaPrimaUpdateSchema = loteMateriaPrimaCreateSchema.partial();

// Tipos de movimiento permitidos
export const TiposMovimiento = ['Entrada', 'Salida', 'Ajuste Positivo', 'Ajuste Negativo'] as const;

// Validación para creación de movimiento de inventario
export const movimientoInventarioCreateSchema = z.object({
  tipoMovimiento: z.enum(TiposMovimiento, {
    errorMap: () => ({ message: 'Tipo de movimiento no válido' })
  }),
  tipoElemento: z.string().min(1, 'El tipo de elemento es requerido'),
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

// Esquema para búsqueda de materias primas
export const materiaPrimaBusquedaSchema = z.object({
  codigo: z.string().optional(),
  nombre: z.string().optional(),
  tipo: z.string().optional(),
  estado: z.string().optional(),
  stockBajo: z.boolean().optional()
});