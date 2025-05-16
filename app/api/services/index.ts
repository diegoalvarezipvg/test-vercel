import getPrismaClient from '../lib/prisma';
import { 
  materiaPrimaRepository,
  productoTerminadoRepository,
  movimientoInventarioRepository
} from '../repositories';
import { MateriaPrimaService } from './materia-prima.service';
import { ProductoTerminadoService } from './producto-terminado.service';
import { MovimientoInventarioService } from './movimiento-inventario.service';

// Obtener la instancia del cliente Prisma
const prisma = getPrismaClient;

// Instancias de servicios
export const materiaPrimaService = new MateriaPrimaService(prisma);
export const productoTerminadoService = new ProductoTerminadoService(prisma);
export const movimientoInventarioService = new MovimientoInventarioService(
  movimientoInventarioRepository,
  materiaPrimaRepository,
  productoTerminadoRepository
); 