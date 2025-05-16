import { Decimal } from '@prisma/client/runtime/library';
import { ValidationError } from '../middlewares/error-handler.middleware';

/**
 * Tipo que representa valores que pueden ser convertidos a Decimal
 */
export type DecimalLike = number | string | Decimal | { toNumber: () => number };

/**
 * Convierte cualquier valor numérico a un objeto Decimal de Prisma
 * @param value Valor a convertir (number, string, Decimal, objeto con método toNumber)
 * @throws {ValidationError} Si el valor no puede ser convertido a un número válido
 * @returns Objeto Decimal de Prisma
 */
export const toDecimal = (value: DecimalLike): Decimal => {
  try {
    // Si ya es un objeto Decimal, lo devolvemos tal cual
    if (value instanceof Decimal) {
      return value;
    }
    
    // Si es un objeto con método toNumber, validamos antes de convertir
    if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
      const num = value.toNumber();
      if (!isFinite(num)) {
        throw new ValidationError(`El valor no puede ser convertido a un número válido: ${String(value)}`);
      }
      return new Decimal(String(num));
    }
    
    // Para strings y numbers, intentamos la conversión directa
    const decimal = new Decimal(String(value));
    
    // Verificamos que no sea NaN o Infinito
    if (!isFinite(decimal.toNumber())) {
      throw new ValidationError(`El valor no puede ser convertido a un número válido: ${String(value)}`);
    }
    
    return decimal;
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Error al convertir a Decimal: ${String(value)}. ${errorMessage}`);
  }
};

/**
 * Convierte cualquier valor numérico a un número primitivo
 * @param value Valor a convertir (number, Decimal, objeto con método toNumber)
 * @throws {ValidationError} Si el valor no puede ser convertido a un número válido
 * @returns Número primitivo
 */
export const toNumber = (value: DecimalLike): number => {
  try {
    // Si es un objeto con método toNumber (como Decimal de Prisma)
    if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
      const result = value.toNumber();
      if (!isFinite(result)) {
        throw new ValidationError(`El valor no puede ser convertido a un número válido: ${String(value)}`);
      }
      return result;
    }
    
    // Si es un número primitivo y válido, lo devolvemos
    if (typeof value === 'number' && isFinite(value)) {
      return value;
    }
    
    // Convertimos a número mediante el constructor Number
    const num = Number(value);
    
    // Verificamos que sea un número válido
    if (!isFinite(num)) {
      throw new ValidationError(`El valor no puede ser convertido a un número válido: ${String(value)}`);
    }
    
    return num;
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Error al convertir a número: ${String(value)}. ${errorMessage}`);
  }
};

/**
 * Determina si un valor puede ser convertido a un número válido
 * @param value Valor a validar
 * @returns true si el valor puede convertirse a un número válido (no NaN, no Infinito)
 */
export const isValidNumber = (value: any): boolean => {
  try {
    // Para objetos con método toNumber
    if (typeof value === 'object' && value !== null && typeof value.toNumber === 'function') {
      return isFinite(value.toNumber());
    }
    
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  } catch {
    return false;
  }
};

/**
 * Convierte cualquier valor numérico a Decimal solo si no es null o undefined
 * @param value Valor a convertir o null/undefined
 * @returns Objeto Decimal o null/undefined
 */
export const toDecimalOrNull = (value: DecimalLike | null | undefined): Decimal | null | undefined => {
  if (value === null || value === undefined) {
    return value;
  }
  return toDecimal(value);
};

/**
 * Formatea un valor numérico como moneda (CLP por defecto)
 * @param value Valor numérico a formatear
 * @param locale Configuración regional (por defecto 'es-CL')
 * @param currency Moneda a utilizar (por defecto 'CLP')
 * @returns String formateado como moneda
 */
export const formatCurrency = (
  value: DecimalLike,
  locale: string = 'es-CL',
  currency: string = 'CLP'
): string => {
  const num = toNumber(value);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(num);
};

/**
 * Valida y convierte un parámetro ID a número
 * @param id Valor del parámetro ID a validar
 * @param tipo Tipo de entidad (para mensajes de error más descriptivos)
 * @throws ValidationError si el ID no es válido
 * @returns ID como número
 */
export const validateId = (id: string | number, tipo: string = 'registro'): number => {
  const numericId = typeof id === 'number' ? id : parseInt(id);
  
  if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
    throw new ValidationError(
      `ID de ${tipo} inválido: '${id}'. Debe ser un número entero positivo.`
    );
  }
  
  return numericId;
};
