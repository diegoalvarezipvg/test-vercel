import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { createLogger } from './logger';

const logger = createLogger('supabase');

// Crear cliente de Supabase
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;
const supabaseServiceKey = config.supabase.serviceRoleKey;

// Cliente con la clave anónima para operaciones públicas (registro, inicio de sesión)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con la clave de servicio para operaciones administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Función para crear un cliente con un token de usuario específico
export const createClientWithToken = (accessToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};

// Funciones auxiliares para manejo de errores
export const handleSupabaseError = (error: any) => {
  logger.error({ error }, 'Error en Supabase');
  return {
    message: error.message || 'Error del servidor de autenticación',
    code: error.code || 'UNKNOWN_ERROR',
    status: error.status || 500
  };
};