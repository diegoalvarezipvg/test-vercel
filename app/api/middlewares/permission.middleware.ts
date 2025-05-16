import { Context, Next } from 'hono';
import prisma from '../lib/prisma';
import { ForbiddenError } from './error-handler.middleware';
import { createLogger } from '../utils/logger';

const logger = createLogger('permissionMiddleware');

// Cache de permisos para evitar consultas repetidas a la BD
const permissionCache: Record<string, string[]> = {};

// Función para obtener los permisos de un usuario
const getUserPermissions = async (userId: number): Promise<string[]> => {
  // Verificar si los permisos ya están en caché
  if (permissionCache[userId.toString()]) {
    return permissionCache[userId.toString()];
  }
  
  // Consultar los permisos del usuario en la BD
  const userPermissions = await prisma.usuarioPermiso.findMany({
    where: {
      usuarioId: userId
    },
    include: {
      permiso: true
    }
  });
  
  // Extraer los nombres de los permisos
  const permissions = userPermissions.map((up: { permiso: { nombrePermiso: any; }; }) => up.permiso.nombrePermiso);
  
  // Guardar en caché
  permissionCache[userId.toString()] = permissions;
  
  return permissions;
};

// Middleware para verificar permisos
export const permissionMiddleware = (requiredPermission: string) => {
  return async (c: Context, next: Next) => {
    try {
      const user = c.get('user');

      if (!user) {
        throw new ForbiddenError('Usuario no autenticado');
      }
      
      // Si el usuario es administrador, permitir acceso a todo
      if (user.user_metadata.rol === 'Administrador') {
        await next();
        return;
      }
      
      // Obtener permisos del usuario
      const permissions = await getUserPermissions(user.id);
      
      // Verificar si tiene el permiso requerido
      if (!permissions.includes(requiredPermission)) {
        throw new ForbiddenError(`No tiene permiso para realizar esta acción: ${requiredPermission}`);
      }
      
      await next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      
      logger.error({ error, requiredPermission }, 'Error en middleware de permisos');
      throw new ForbiddenError('Error al verificar permisos');
    }
  };
};

// Función para limpiar el caché de permisos (útil al cambiar permisos)
export const clearPermissionCache = (userId?: number) => {
  if (userId) {
    delete permissionCache[userId.toString()];
  } else {
    Object.keys(permissionCache).forEach(key => delete permissionCache[key]);
  }
};