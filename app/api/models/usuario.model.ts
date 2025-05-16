// Interfaces para Usuario
export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  email?: string | null;
  telefono?: string | null;
  passwordHash: string;
  rol: string;
  estado: string;
  fechaCreacion: Date;
  ultimoAcceso?: Date | null;
}

export interface UsuarioResumen {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  email?: string | null;
  rol: string;
  estado: string;
}

export interface UsuarioConPermisos extends UsuarioResumen {
  permisos: string[];
}

export interface UsuarioCreateInput {
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono?: string | null;
  password: string;
  rol: string;
}

export interface UsuarioUpdateInput {
  nombre?: string;
  apellido?: string;
  email?: string | null;
  telefono?: string | null;
  rol?: string;
  estado?: string;
}

export interface UsuarioPasswordUpdateInput {
  currentPassword: string;
  newPassword: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata: {
    nombre?: string;
    apellido?: string;
    nombreUsuario?: string;
    rol?: string;
  };
}

export interface AuthResponse {
  user: AuthUser | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  } | null;
  error?: {
    message: string;
    status: number;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  nombreUsuario: string;
  nombre: string;
  apellido: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface UpdatePasswordInput {
  password: string;
  resetToken: string;
}