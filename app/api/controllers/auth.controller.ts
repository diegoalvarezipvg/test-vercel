import { Context } from 'hono';
import { AuthService } from '../services/auth.service';
import { ValidationError, UnauthorizedError, AppError } from '../middlewares/error-handler.middleware';
import { createLogger } from '../utils/logger';
import { HTTPException } from 'hono/http-exception';
import prisma from '../lib/prisma';
import { StatusCode } from 'hono/utils/http-status';

const authService = new AuthService(prisma);
const logger = createLogger('authController');

export const authController = {
  login: async (c: Context) => {
    try {
      const body = await c.req.json();
      const result = await authService.login(body);
      
      return c.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result
      });
    } catch (error) {
      logger.error({ error }, 'Error en login');
      
      // Determinamos el mensaje y código de estado según el tipo de error
      let statusCode: StatusCode = 500;
      let message = 'Error en el inicio de sesión';
      let errorDetail = 'Ha ocurrido un error interno. Por favor, intente nuevamente.';
      
      if (error instanceof ValidationError) {
        statusCode = 400;
        message = 'Error de validación';
        errorDetail = error.message;
      } else if (error instanceof UnauthorizedError) {
        statusCode = 401;
        message = 'Error en el inicio de sesión';
        errorDetail = 'Credenciales inválidas';
      } else if (error instanceof AppError) {
        statusCode = (error.statusCode || 500) as StatusCode;
        message = error.message;
        errorDetail = error.name;
      } else if (error instanceof HTTPException) {
        statusCode = error.status as StatusCode;
        message = error.message;
      }
      
      // Devolvemos la respuesta usando c.status() y luego c.json()
      c.status(statusCode);
      return c.json({
        success: false,
        message: message,
        error: errorDetail
      });
    }
  },

  register: async (c: Context) => {
    try {
      const body = await c.req.json();
      const result = await authService.register(body);
      
      return c.json({
        success: true,
        message: 'Registro exitoso',
        data: result
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Error en registro');
      throw error;
    }
  },

  logout: async (c: Context) => {
    try {
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.split(' ')[1] || '';
      
      await authService.logout(token);
      
      return c.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      logger.error({ error }, 'Error en logout');
      throw error;
    }
  },

  refreshToken: async (c: Context) => {
    try {
      const body = await c.req.json();
      const result = await authService.refreshToken(body.refreshToken);
      
      return c.json({
        success: true,
        message: 'Token refrescado exitosamente',
        data: result
      });
    } catch (error) {
      logger.error({ error }, 'Error al refrescar token');
      throw error;
    }
  },

  resetPasswordRequest: async (c: Context) => {
    try {
      const body = await c.req.json();
      await authService.resetPasswordRequest(body);
      
      return c.json({
        success: true,
        message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña'
      });
    } catch (error) {
      logger.error({ error }, 'Error al solicitar reinicio de contraseña');
      throw error;
    }
  },

  updatePassword: async (c: Context) => {
    try {
      const body = await c.req.json();
      await authService.updatePassword(body);
      
      return c.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      logger.error({ error }, 'Error al actualizar contraseña');
      throw error;
    }
  },

  changePassword: async (c: Context) => {
    try {
      const userId = c.get('user').id;
      const body = await c.req.json();
      
      await authService.changePassword(userId, body);
      
      return c.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      logger.error({ error }, 'Error al cambiar contraseña');
      throw error;
    }
  },

  getProfile: async (c: Context) => {
    try {
      const userId = c.get('user').id;
      const profile = await authService.getProfile(userId);
      
      return c.json({
        success: true,
        data: profile
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener perfil');
      throw error;
    }
  },

  verifyToken: async (c: Context) => {
    try {
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HTTPException(401, { message: 'Token de autenticación no proporcionado' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        throw new HTTPException(401, { message: 'Token de autenticación inválido' });
      }
      
      const result = await authService.verifyToken(token);
      
      return c.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error({ error }, 'Error al verificar token');
      throw error;
    }
  }
};