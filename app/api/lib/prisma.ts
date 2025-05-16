import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger';

const logger = createLogger('prismaClient');

// Global variable to store the PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Use globalThis to ensure singleton across hot reloads in development
const prisma = globalThis.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Only set the global instance if it doesn't exist
if (!globalThis.prisma) {
  globalThis.prisma = prisma;

  // Only add event listeners once
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV !== 'production') {
    prisma.$connect()
      .then(() => {
        logger.info('Conexión a la base de datos establecida correctamente');
      })
      .catch((error: Error) => {
        logger.error({ error }, 'Error al conectar con la base de datos');
      });
  }

  // Set max listeners to a higher value to prevent warnings
  process.setMaxListeners(20);

  // Single error handler for unhandled rejections
  process.on('unhandledRejection', (error) => {
    logger.error({ error }, 'Error no manejado en promesa detectado');
  });

  // Single handler for graceful shutdown
  const handleShutdown = async (signal: string) => {
    logger.info(`Cerrando conexión a la base de datos debido a ${signal}`);
    await prisma.$disconnect();
    process.exit(0);
  };

  // Add shutdown handlers
  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

export default prisma; 