import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger';

const logger = createLogger('prismaClient');

// Declaramos prisma fuera de la función para que sea un singleton global
let prisma: PrismaClient;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    logger.info('Inicializando nueva conexión de PrismaClient');
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });

    // Solo conectar a la base de datos si no estamos en build time
    if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV !== 'production') {
      prisma.$connect()
        .then(() => {
          logger.info('Conexión a la base de datos establecida correctamente');
        })
        .catch((error: Error) => {
          logger.error({ error }, 'Error al conectar con la base de datos');
        });
    }

    // Gestión de errores no manejados en Node.js
    process.on('unhandledRejection', (error) => {
      logger.error({ error }, 'Error no manejado en promesa detectado');
    });

    // Cierre correcto de la conexión al terminar la aplicación
    process.on('SIGINT', async () => {
      logger.info('Cerrando conexión a la base de datos debido a SIGINT');
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Cerrando conexión a la base de datos debido a SIGTERM');
      await prisma.$disconnect();
      process.exit(0);
    });
  }

  return prisma;
}

export default getPrismaClient(); 