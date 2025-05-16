import { PrismaClient } from '@prisma/client';
import getPrismaClient from '../lib/prisma';
import { PrismaMateriaPrimaRepository } from './materia-prima.repository';
import { PrismaProductoTerminadoRepository } from './producto-terminado.repository';
import { PrismaMovimientoInventarioRepository } from './movimiento-inventario.repository';

// Instancia de Prisma
const prisma: PrismaClient = getPrismaClient;

// Instancias de repositorios
export const materiaPrimaRepository = new PrismaMateriaPrimaRepository(prisma);
export const productoTerminadoRepository = new PrismaProductoTerminadoRepository(prisma);
export const movimientoInventarioRepository = new PrismaMovimientoInventarioRepository(prisma); 