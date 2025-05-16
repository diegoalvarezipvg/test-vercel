import { z } from 'zod';

// Roles permitidos
export const Roles = [
  "Administrador",
  "Produccion",
  "Inventario",
  "Comercial",
  "Visualizador",
] as const;

// Estados permitidos
export const Estados = ["Activo", "Inactivo", "Suspendido"] as const;

// Validación para crear usuario
export const usuarioCreateSchema = z.object({
  nombreUsuario: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string()
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string()
    .email("El correo electrónico no es válido"),
  telefono: z.string().nullable(),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(Roles, {
    errorMap: () => ({ message: "El rol debe ser uno de los siguientes: " + Roles.join(", ") })
  })
});

// Validación para actualizar usuario
export const usuarioUpdateSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  apellido: z.string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .optional(),
  email: z.string()
    .email("El correo electrónico no es válido")
    .optional(),
  telefono: z.string().nullable().optional(),
  rol: z.enum(Roles, {
    errorMap: () => ({ message: "El rol debe ser uno de los siguientes: " + Roles.join(", ") })
  }).optional(),
  estado: z.enum(Estados, {
    errorMap: () => ({ message: "El estado debe ser uno de los siguientes: " + Estados.join(", ") })
  }).optional()
});

// Validación para inicio de sesión
export const loginSchema = z.object({
  email: z.string()
    .email("El correo electrónico no es válido"),
  password: z.string()
    .min(1, "La contraseña es requerida")
});

// Validación para registro
export const registerSchema = z.object({
  nombreUsuario: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string()
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string()
    .email("El correo electrónico no es válido"),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
});

// Validación para solicitar reinicio de contraseña
export const resetPasswordRequestSchema = z.object({
  email: z.string()
    .email("El correo electrónico no es válido")
});

// Validación para actualizar contraseña
export const updatePasswordSchema = z.object({
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  resetToken: z.string()
    .min(1, "El token de reinicio es requerido")
});

// Validación para cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, "La contraseña actual es requerida"),
  newPassword: z.string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres")
});
