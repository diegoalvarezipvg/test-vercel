import { Context, Next } from 'hono';
import { UnauthorizedError } from './error-handler.middleware';
import { createLogger } from '../utils/logger';
import { config } from '../config';
// Importamos jose en lugar de jsonwebtoken
import * as jose from 'jose';

const logger = createLogger('authMiddleware');

export interface AuthUser {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  email?: string;
  rol: string;
  permisos: string[];
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autenticación no proporcionado');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Token de autenticación inválido');
    }
    
    try {
      // Convertimos el secret a Uint8Array para jose
      const secretKey = new TextEncoder().encode(config.jwt.secret);
      
      // Verificar JWT con jose
      const { payload } = await jose.jwtVerify(token, secretKey, {
        algorithms: ['HS256']
      });
      
      // Verificar que el token tenga la información necesaria
      if (!payload || !payload.sub) {
        throw new UnauthorizedError('Token de autenticación inválido');
      }
      
      // Almacenar información del usuario en el contexto para uso posterior
      c.set('user', payload as unknown as AuthUser);
      
      await next();
    } catch (error) {
      if (error instanceof jose.errors.JWTExpired) {
        throw new UnauthorizedError('Token de autenticación expirado');
      }
      
      if (error instanceof jose.errors.JWTInvalid || 
          error instanceof jose.errors.JWTClaimValidationFailed) {
        throw new UnauthorizedError('Token de autenticación inválido');
      }
      
      logger.error({ error }, 'Error al verificar token');
      throw new UnauthorizedError('Token de autenticación inválido o expirado');
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    logger.error({ error }, 'Error en middleware de autenticación');
    throw new UnauthorizedError('Error de autenticación');
  }
};