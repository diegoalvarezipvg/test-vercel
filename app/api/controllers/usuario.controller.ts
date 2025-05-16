import { Context } from 'hono';
import { UsuarioService } from '../services/usuario.service';
import { ValidationError, NotFoundError, ForbiddenError, AppError } from '../middlewares/error-handler.middleware';
import { createLogger } from '../utils/logger';
import prisma from '../lib/prisma';

const usuarioService = new UsuarioService(prisma);
const logger = createLogger('usuarioController');

export const usuarioController = {
  getUsuarios: async (c: Context) => {
    try {
      const filtros = c.req.query();
      const usuarios = await usuarioService.getUsuarios(filtros);
      
      return c.json({
        success: true,
        data: usuarios,
        count: usuarios.length
      });
    } catch (error) {
      logger.error({ error }, 'Error al obtener usuarios');
      throw error;
    }
  },

  getUsuarioById: async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));
      
      if (isNaN(id)) {
        throw new ValidationError('ID inválido');
      }
      
      const usuario = await usuarioService.getUsuarioById(id);
      
      return c.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al obtener usuario por ID');
      throw error;
    }
  },

  getUsuarioConPermisos: async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));
      
      if (isNaN(id)) {
        throw new ValidationError('ID inválido');
      }
      
      const usuario = await usuarioService.getUsuarioConPermisos(id);
      
      return c.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al obtener usuario con permisos');
      throw error;
    }
  },

  createUsuario: async (c: Context) => {
    try {
      const body = await c.req.json();
      const requestingUserId = c.get('user').id;
      
      const usuario = await usuarioService.createUsuario(body, requestingUserId);
      
      return c.json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      }, 201);
    } catch (error) {
      logger.error({ error }, 'Error al crear usuario');
      throw error;
    }
  },

  updateUsuario: async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));
      
      if (isNaN(id)) {
        throw new ValidationError('ID inválido');
      }
      
      const body = await c.req.json();
      const requestingUserId = c.get('user').id;
      
      const usuario = await usuarioService.updateUsuario(id, body, requestingUserId);
      
      return c.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al actualizar usuario');
      throw error;
    }
  },

  deleteUsuario: async (c: Context) => {
    try {
      const id = parseInt(c.req.param('id'));
      
      if (isNaN(id)) {
        throw new ValidationError('ID inválido');
      }
      
      const requestingUserId = c.get('user').id;
      
      await usuarioService.deleteUsuario(id, requestingUserId);
      
      return c.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      logger.error({ error, id: c.req.param('id') }, 'Error al eliminar usuario');
      throw error;
    }
  }
};