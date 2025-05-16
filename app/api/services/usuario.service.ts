import { PrismaClient } from "@prisma/client";
import {
  UsuarioResumen,
  UsuarioConPermisos,
  UsuarioCreateInput,
  UsuarioUpdateInput,
} from "../models/usuario.model";
import {
  PrismaUsuarioRepository,
  UsuarioRepository,
} from "../repositories/usuario.repository";
import {
  ValidationError,
  NotFoundError,
  AppError,
  ForbiddenError,
} from "../middlewares/error-handler.middleware";
import { createLogger } from "../utils/logger";
import {
  usuarioCreateSchema,
  usuarioUpdateSchema,
} from "../schemas/usuario.schema";
import { supabaseAdmin } from "../utils/supabase";
import bcrypt from "bcryptjs";

const logger = createLogger("usuarioService");

export class UsuarioService {
  private repository: UsuarioRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new PrismaUsuarioRepository(prisma);
  }

  async getUsuarios(filtros?: Record<string, any>): Promise<UsuarioResumen[]> {
    return this.repository.getUsuarios(filtros);
  }

  async getUsuarioById(id: number): Promise<UsuarioResumen> {
    const usuario = await this.repository.getUsuarioById(id);

    if (!usuario) {
      throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
    }

    // Excluir passwordHash por seguridad
    const { passwordHash, ...usuarioSinPassword } = usuario;

    return usuarioSinPassword as UsuarioResumen;
  }

  async getUsuarioConPermisos(id: number): Promise<UsuarioConPermisos> {
    const usuario = await this.getUsuarioById(id);
    const permisos = await this.repository.getUsuarioPermisos(id);

    return {
      ...usuario,
      permisos,
    };
  }

  async createUsuario(
    data: UsuarioCreateInput,
    requestingUserId: number,
  ): Promise<UsuarioResumen> {
    try {
      // Validar datos con Zod
      usuarioCreateSchema.parse(data);

      // Verificar si el solicitante es administrador
      const requestingUser =
        await this.repository.getUsuarioById(requestingUserId);

      if (!requestingUser || requestingUser.rol !== "Administrador") {
        throw new ForbiddenError(
          "Solo los administradores pueden crear usuarios",
        );
      }

      // Verificar si el email ya existe
      if (data.email) {
        const existingEmail = await this.repository.getUsuarioByEmail(
          data.email,
        );

        if (existingEmail) {
          throw new ValidationError(
            `El email ${data.email} ya está registrado`,
          );
        }
      }

      // Verificar si el nombre de usuario ya existe
      const existingUsername = await this.repository.getUsuarioByNombreUsuario(
        data.nombreUsuario,
      );

      if (existingUsername) {
        throw new ValidationError(
          `El nombre de usuario ${data.nombreUsuario} ya está en uso`,
        );
      }

      // Crear usuario en Supabase si tiene email
      if (data.email) {
        const { data: supabaseData, error } =
          await supabaseAdmin.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
              nombreUsuario: data.nombreUsuario,
              nombre: data.nombre,
              apellido: data.apellido,
              rol: data.rol,
            },
          });

        if (error) {
          throw new ValidationError(error.message);
        }
      }

      // Hashear contraseña para nuestro sistema
      const hashedPassword = data.email
        ? "**SUPABASE_AUTH**"
        : await bcrypt.hash(data.password, 10);

      // Crear usuario en nuestra base de datos
      const newUser = await this.repository.createUsuario({
        ...data,
        password: hashedPassword,
      });

      // Excluir passwordHash por seguridad
      const { passwordHash, ...usuarioSinPassword } = newUser;

      return usuarioSinPassword as UsuarioResumen;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ForbiddenError) {
        throw error;
      }

      logger.error(
        { error, data: { ...data, password: "******" } },
        "Error al crear usuario",
      );
      throw new ValidationError("Error al crear usuario");
    }
  }

  async updateUsuario(
    id: number,
    data: UsuarioUpdateInput,
    requestingUserId: number,
  ): Promise<UsuarioResumen> {
    try {
      // Validar datos con Zod
      usuarioUpdateSchema.parse(data);

      // Verificar si el usuario existe
      const usuario = await this.repository.getUsuarioById(id);

      if (!usuario) {
        throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
      }

      // Verificar permisos
      const requestingUser =
        await this.repository.getUsuarioById(requestingUserId);

      if (!requestingUser) {
        throw new ForbiddenError("Usuario no autorizado");
      }

      // Solo administradores pueden cambiar roles o actualizar otros usuarios
      if (requestingUserId !== id && requestingUser.rol !== "Administrador") {
        throw new ForbiddenError(
          "No tienes permisos para actualizar este usuario",
        );
      }

      // Solo administradores pueden cambiar roles
      if (
        data.rol &&
        data.rol !== usuario.rol &&
        requestingUser.rol !== "Administrador"
      ) {
        throw new ForbiddenError(
          "Solo los administradores pueden cambiar roles",
        );
      }

      // Verificar si el email ya existe (si se está actualizando)
      if (data.email && data.email !== usuario.email) {
        const existingEmail = await this.repository.getUsuarioByEmail(
          data.email,
        );

        if (existingEmail) {
          throw new ValidationError(
            `El email ${data.email} ya está registrado`,
          );
        }
      }

      // Actualizar en Supabase si tiene email
      if (usuario.email) {
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.admin.listUsers();

        const user = userData?.users?.find((u) => u.email === usuario.email);

        if (!userError && user) {
          const updateData: any = {
            user_metadata: {
              ...(user.user_metadata || {}),
              ...(data.nombre && { nombre: data.nombre }),
              ...(data.apellido && { apellido: data.apellido }),
              ...(data.rol && { rol: data.rol }),
            },
          };

          // Si se actualiza el email
          if (data.email && data.email !== usuario.email) {
            updateData.email = data.email;
          }

          const { error } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            updateData,
          );

          if (error) {
            logger.error(
              { error, userId: id },
              "Error al actualizar usuario en Supabase",
            );
          }
        }
      }

      // Actualizar en nuestra base de datos
      const updatedUser = await this.repository.updateUsuario(id, data);

      // Excluir passwordHash por seguridad
      const { passwordHash, ...usuarioSinPassword } = updatedUser;

      return usuarioSinPassword as UsuarioResumen;
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      logger.error({ error, id, data }, "Error al actualizar usuario");
      throw new ValidationError("Error al actualizar usuario");
    }
  }

  async deleteUsuario(id: number, requestingUserId: number): Promise<void> {
    try {
      // Verificar si el usuario existe
      const usuario = await this.repository.getUsuarioById(id);

      if (!usuario) {
        throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
      }

      // Verificar permisos
      const requestingUser =
        await this.repository.getUsuarioById(requestingUserId);

      if (!requestingUser || requestingUser.rol !== "Administrador") {
        throw new ForbiddenError(
          "Solo los administradores pueden eliminar usuarios",
        );
      }

      // No permitir eliminar al propio usuario administrador
      if (id === requestingUserId) {
        throw new ValidationError("No puedes eliminar tu propio usuario");
      }

      // Deshabilitar en Supabase si tiene email
      if (usuario.email) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        const user = data?.users?.find((u) => u.email === usuario.email);

        if (!error && user) {
          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...user.user_metadata,
              estado: "Inactivo",
            },
          });
        }
      }

      // "Eliminar" en nuestra base de datos (marcar como inactivo)
      await this.repository.deleteUsuario(id);
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof ForbiddenError
      ) {
        throw error;
      }

      logger.error({ error, id }, "Error al eliminar usuario");
      throw new AppError("Error al eliminar usuario");
    }
  }

  async getUsuarioByEmail(email: string): Promise<any> {
    try {
      const { data: supabaseUser, error } =
        await supabaseAdmin.auth.admin.listUsers();

      if (error) {
        throw new AppError(error.message);
      }

      const user = supabaseUser?.users?.find((u) => u.email === email);
      if (!user) {
        return null;
      }

      const usuario = await this.repository.getUsuarioByEmail(email);
      return usuario;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error({ error, email }, "Error al obtener usuario por email");
      throw new AppError("Error al obtener usuario por email");
    }
  }
}
