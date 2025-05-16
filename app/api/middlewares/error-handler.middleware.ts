import { Context, MiddlewareHandler, Next } from 'hono';
import { createLogger } from '../utils/logger';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Error de validación", public errors?: any) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403, "FORBIDDEN");
  }
}

const log = createLogger('errorHandler');

export const errorHandler: MiddlewareHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      log.error({ err: err.message, code: err.code, stack: err.stack }, 'Error controlado');
      
      const response: Record<string, any> = { 
        error: err.message,
        code: err.code,
      };
      
      if (err instanceof ValidationError && err.errors) {
        response.details = err.errors;
      }
      
      return c.json(response, err.statusCode as ContentfulStatusCode || 500);
    }
    
    // Error no controlado
    log.error({ err }, 'Error no controlado');
    
    return c.json({
      error: "Error interno del servidor",
      code: "INTERNAL_SERVER_ERROR"
    }, 500);
  }
};