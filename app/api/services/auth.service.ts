import {
  AuthResponse,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdatePasswordInput,
  UsuarioPasswordUpdateInput,
} from "../models/usuario.model";
import {
  PrismaUsuarioRepository,
  UsuarioRepository,
} from "../repositories/usuario.repository";
import {
  ValidationError,
  UnauthorizedError,
  AppError,
  NotFoundError,
} from "../middlewares/error-handler.middleware";
import { createLogger } from "../utils/logger";
import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  updatePasswordSchema,
  changePasswordSchema,
} from "../schemas/usuario.schema";
import { supabaseClient, supabaseAdmin } from "../utils/supabase";
import * as jose from "jose";
import { config } from "../config";
import { PrismaClient } from "@prisma/client";

const logger = createLogger("authService");

export class AuthService {
  private usuarioRepository: UsuarioRepository;

  constructor(prisma: PrismaClient) {
    this.usuarioRepository = new PrismaUsuarioRepository(prisma);
  }

  async login(credentials: LoginInput): Promise<AuthResponse> {
    try {
      // Validar datos con Zod
      loginSchema.parse(credentials);

      // Autenticar con Supabase
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new UnauthorizedError(error.message);
      }

      if (!data.user || !data.session) {
        throw new UnauthorizedError("Error de autenticación");
      }

      // Actualizar último acceso en nuestro sistema
      try {
        const usuario = await this.usuarioRepository.getUsuarioByEmail(
          credentials.email,
        );
        logger.info({ usuarioId: usuario?.id }, "Actualizando último acceso");
        if (usuario) {
          await this.usuarioRepository.updateUltimoAcceso(usuario.id);
        }
      } catch (dbError) {
        // Capturamos errores específicos de Prisma pero continuamos la autenticación
        // ya que el usuario ya se autenticó correctamente con Supabase
        logger.error({ error: dbError, email: credentials.email }, "Error al actualizar último acceso en base de datos");
      }

      return {
        user: data.user,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
        },
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof UnauthorizedError
      ) {
        throw error;
      }

      // Capturar y registrar específicamente el error de inicialización de Prisma
      if (error && typeof error === 'object' && 'name' in error && error.name === "PrismaClientInitializationError") {
        logger.error(
          { 
            error, 
            email: credentials.email,
            clientVersion: 'clientVersion' in error ? error.clientVersion : undefined,
            errorCode: 'errorCode' in error ? error.errorCode : undefined
          }, 
          "Error de conexión a la base de datos durante login"
        );
        throw new AppError(
          "Error de conexión a la base de datos. Por favor, intente nuevamente más tarde.",
          500
        );
      }

      logger.error({ error, email: credentials.email }, "Error en login");
      throw new UnauthorizedError("Credenciales inválidas");
    }
  }

  async register(userData: RegisterInput): Promise<AuthResponse> {
    try {
      // Validar datos con Zod
      registerSchema.parse(userData);

      // Verificar si el email ya existe
      const existingEmail = await this.usuarioRepository.getUsuarioByEmail(
        userData.email,
      );

      if (existingEmail) {
        throw new ValidationError(
          `El email ${userData.email} ya está registrado`,
        );
      }

      // Verificar si el nombre de usuario ya existe
      const existingUsername =
        await this.usuarioRepository.getUsuarioByNombreUsuario(
          userData.nombreUsuario,
        );

      if (existingUsername) {
        throw new ValidationError(
          `El nombre de usuario ${userData.nombreUsuario} ya está en uso`,
        );
      }

      // Registrar en Supabase
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: {
          nombreUsuario: userData.nombreUsuario,
          nombre: userData.nombre,
          apellido: userData.apellido,
          rol: "Visualizador", // Rol por defecto para nuevos registros
        },
      });

      if (error) {
        throw new ValidationError(error.message);
      }

      if (!data.user) {
        throw new AppError("Error al crear usuario");
      }

      // Crear usuario en nuestra base de datos
      await this.usuarioRepository.createUsuario({
        nombreUsuario: userData.nombreUsuario,
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        password: "**SUPABASE_AUTH**", // No almacenamos la contraseña, la maneja Supabase
        rol: "Visualizador",
      });

      // Iniciar sesión automáticamente
      const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.signInWithPassword({
          email: userData.email,
          password: userData.password,
        });

      if (sessionError || !sessionData.session) {
        throw new UnauthorizedError(
          "Usuario creado pero no se pudo iniciar sesión",
        );
      }

      return {
        user: data.user,
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_at: sessionData.session.expires_at || 0,
        },
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof UnauthorizedError ||
        error instanceof AppError
      ) {
        throw error;
      }

      logger.error({ error, email: userData.email }, "Error en registro");
      throw new ValidationError("Error al registrar usuario", error);
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      logger.error({ error }, "Error en logout");
      // No lanzamos error para no afectar la experiencia del usuario
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabaseClient.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new UnauthorizedError(error.message);
      }

      if (!data.session) {
        throw new UnauthorizedError("Error al refrescar sesión");
      }

      return {
        user: data.user,
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      logger.error({ error }, "Error al refrescar token");
      throw new UnauthorizedError("Error al refrescar sesión");
    }
  }

  async resetPasswordRequest(data: ResetPasswordInput): Promise<void> {
    try {
      // Validar datos con Zod
      resetPasswordRequestSchema.parse(data);

      // Verificar si el email existe en nuestra base de datos
      const usuario = await this.usuarioRepository.getUsuarioByEmail(
        data.email,
      );

      if (!usuario) {
        // No revelamos si el email existe o no por seguridad
        return;
      }

      // Solicitar reinicio en Supabase
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${config.frontend.url}/reset-password`,
        },
      );

      if (error) {
        throw new AppError(error.message);
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AppError) {
        throw error;
      }

      logger.error(
        { error, email: data.email },
        "Error al solicitar reinicio de contraseña",
      );
      throw new AppError("Error al solicitar reinicio de contraseña");
    }
  }

  async updatePassword(data: UpdatePasswordInput): Promise<void> {
    try {
      // Validar datos con Zod
      updatePasswordSchema.parse(data);

      // Actualizar contraseña en Supabase
      const { error } = await supabaseClient.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw new AppError(error.message);
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AppError) {
        throw error;
      }

      logger.error({ error }, "Error al actualizar contraseña");
      throw new AppError("Error al actualizar contraseña");
    }
  }

  async changePassword(
    userId: number,
    data: UsuarioPasswordUpdateInput,
  ): Promise<void> {
    try {
      // Validar datos con Zod
      changePasswordSchema.parse(data);

      // Obtener usuario por ID
      const usuario = await this.usuarioRepository.getUsuarioById(userId);

      if (!usuario) {
        throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
      }

      // Cambiar contraseña en Supabase usando el servicio Admin
      // Primero debemos obtener el usuario de Supabase por email
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.listUsers();

      const user = userData?.users?.find(
        (u) => u.email === usuario.email || "",
      );

      if (userError || !user) {
        throw new AppError("Error al obtener usuario de Supabase");
      }

      const supabaseUser = user;

      // Luego actualizamos la contraseña
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        supabaseUser.id,
        {
          password: data.newPassword,
        },
      );

      if (error) {
        throw new AppError(error.message);
      }
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof AppError
      ) {
        throw error;
      }

      logger.error({ error, userId }, "Error al cambiar contraseña");
      throw new AppError("Error al cambiar contraseña");
    }
  }

  async getProfile(userId: number): Promise<any> {
    try {
      const usuario = await this.usuarioRepository.getUsuarioById(userId);

      if (!usuario) {
        throw new NotFoundError("Usuario no encontrado");
      }

      // Obtener datos de Supabase
      const { data: supabaseUser, error } =
        await supabaseAdmin.auth.admin.getUserById(userId.toString());

      if (error) {
        throw new AppError(error.message);
      }

      return {
        ...usuario,
        metadata: supabaseUser?.user?.user_metadata,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof AppError) {
        throw error;
      }

      logger.error({ error, userId }, "Error al obtener perfil");
      throw new AppError("Error al obtener perfil");
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const { data, error } = await supabaseClient.auth.getUser(token);

      if (error) {
        throw new UnauthorizedError(error.message);
      }

      if (!data.user) {
        throw new UnauthorizedError("Token inválido");
      }

      // Buscar el usuario en nuestra base de datos
      const usuario = await this.usuarioRepository.getUsuarioByEmail(
        data.user.email || "",
      );

      if (!usuario) {
        throw new UnauthorizedError("Usuario no encontrado en el sistema");
      }

      if (usuario.estado !== "Activo") {
        throw new UnauthorizedError("Usuario inactivo");
      }

      // Obtener permisos del usuario
      const permisos = await this.usuarioRepository.getUsuarioPermisos(
        usuario.id,
      );

      // Crear payload para el token JWT interno
      const payload = {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        permisos,
      };

      // Generar token JWT interno con la información de nuestro sistema
      // Convertimos el secret a Uint8Array para jose
      const secretKey = new TextEncoder().encode(config.jwt.secret);

      // Calcular la expiración en segundos
      const expiresIn = this.getExpirationSeconds(config.jwt.expiresIn);

      // Crear JWT usando jose
      const internalToken = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
        .setIssuedAt()
        .setSubject(usuario.id.toString())
        .sign(secretKey);

      return {
        user: payload,
        token: internalToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      logger.error({ error }, "Error al verificar token");
      throw new UnauthorizedError("Error al verificar token");
    }
  }

  // Función auxiliar para convertir string como "1d", "7h" a segundos
  private getExpirationSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhdw])$/);

    if (!match) {
      return 24 * 60 * 60; // Default: 1 día en segundos
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      case "w":
        return value * 7 * 24 * 60 * 60;
      default:
        return 24 * 60 * 60;
    }
  }
}
