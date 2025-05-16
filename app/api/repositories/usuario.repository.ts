import { PrismaClient, Prisma } from "@prisma/client";
import {
  Usuario,
  UsuarioResumen,
  UsuarioCreateInput,
  UsuarioUpdateInput,
} from "../models/usuario.model";
import { NotFoundError } from "../middlewares/error-handler.middleware";
import { createLogger } from "../utils/logger";
import { HTTPException } from 'hono/http-exception';

const logger = createLogger("usuarioRepository");

export interface UsuarioRepository {
  getUsuarios(filtros?: Record<string, any>): Promise<UsuarioResumen[]>;
  getUsuarioById(id: number): Promise<Usuario | null>;
  getUsuarioByEmail(email: string): Promise<Usuario | null>;
  getUsuarioByNombreUsuario(nombreUsuario: string): Promise<Usuario | null>;
  createUsuario(data: UsuarioCreateInput): Promise<Usuario>;
  updateUsuario(id: number, data: UsuarioUpdateInput): Promise<Usuario>;
  deleteUsuario(id: number): Promise<void>;
  getUsuarioPermisos(id: number): Promise<string[]>;
  updateUltimoAcceso(id: number): Promise<void>;
}

export class PrismaUsuarioRepository implements UsuarioRepository {
  constructor(private prisma: PrismaClient) {}

  async getUsuarios(
    filtros: Record<string, any> = {},
  ): Promise<UsuarioResumen[]> {
    try {
      const where: Prisma.UsuarioWhereInput = {};

      if (filtros.nombreUsuario) {
        where.nombreUsuario = { contains: filtros.nombreUsuario };
      }

      if (filtros.nombre) {
        where.nombre = { contains: filtros.nombre };
      }

      if (filtros.apellido) {
        where.apellido = { contains: filtros.apellido };
      }

      if (filtros.email) {
        where.email = { contains: filtros.email };
      }

      if (filtros.rol) {
        where.rol = filtros.rol;
      }

      if (filtros.estado) {
        where.estado = filtros.estado;
      }

      const usuarios = await this.prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombreUsuario: true,
          nombre: true,
          apellido: true,
          email: true,
          rol: true,
          estado: true,
        },
        orderBy: { nombre: "asc" },
      });

      return usuarios;
    } catch (error) {
      logger.error({ error }, "Error al obtener usuarios");
      throw error;
    }
  }

  async getUsuarioById(id: number): Promise<Usuario | null> {
    try {
      return this.prisma.usuario.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error({ error, id }, "Error al obtener usuario por ID");
      throw error;
    }
  }

  async getUsuarioByEmail(email: string): Promise<Usuario | null> {
    try {
      return this.prisma.usuario.findFirst({
        where: { email },
      });
    } catch (error) {
      logger.error({ error, email }, "Error al obtener usuario por email");
      throw error;
    }
  }

  async getUsuarioByNombreUsuario(
    nombreUsuario: string,
  ): Promise<Usuario | null> {
    try {
      return this.prisma.usuario.findFirst({
        where: { nombreUsuario },
      });
    } catch (error) {
      logger.error(
        { error, nombreUsuario },
        "Error al obtener usuario por nombre de usuario",
      );
      throw error;
    }
  }

  async createUsuario(data: UsuarioCreateInput): Promise<Usuario> {
    try {
      const createData: Prisma.UsuarioCreateInput = {
        nombreUsuario: data.nombreUsuario,
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        email: data.email || "",
        telefono: data.telefono || "",
        passwordHash: data.password, // Nota: En el servicio se debe encriptar antes de pasar al repo
        rol: data.rol,
        estado: "Activo",
        fechaCreacion: new Date(),
      };

      return this.prisma.usuario.create({
        data: createData,
      });
    } catch (error) {
      logger.error(
        { error, data: { ...data, password: "******" } },
        "Error al crear usuario",
      );
      throw error;
    }
  }

  async updateUsuario(id: number, data: UsuarioUpdateInput): Promise<Usuario> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuario) {
        throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
      }

      const updateData: Prisma.UsuarioUpdateInput = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email || "",
        telefono: data.telefono || "",
        rol: data.rol,
        estado: data.estado,
      };

      return this.prisma.usuario.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      logger.error({ error, id, data }, "Error al actualizar usuario");
      throw error;
    }
  }

  async deleteUsuario(id: number): Promise<void> {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
      });

      if (!usuario) {
        throw new NotFoundError(`Usuario con ID ${id} no encontrado`);
      }

      // En lugar de eliminar completamente, marcamos como inactivo
      await this.prisma.usuario.update({
        where: { id },
        data: {
          estado: "Inactivo",
        },
      });
    } catch (error) {
      logger.error({ error, id }, "Error al eliminar usuario");
      throw error;
    }
  }

  async getUsuarioPermisos(id: number): Promise<string[]> {
    try {
      const permisos = await this.prisma.usuarioPermiso.findMany({
        where: {
          usuarioId: id,
        },
        include: {
          permiso: true,
        },
      });

      return permisos.map((up: { permiso: { nombrePermiso: string } }) => up.permiso.nombrePermiso);
    } catch (error) {
      logger.error({ error, id }, "Error al obtener permisos de usuario");
      throw error;
    }
  }

  async updateUltimoAcceso(id: number): Promise<void> {
    try {
      await this.prisma.usuario.update({
        where: { id },
        data: { ultimoAcceso: new Date() },
      });
    } catch (error) {
      logger.error({ error, id }, "Error al actualizar último acceso");
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }
}
