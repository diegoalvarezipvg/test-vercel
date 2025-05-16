import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger';

const logger = createLogger('prisma');

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log Prisma events
prisma.$on('query', (e: { query: string; params: string; duration: number }) => {
  logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma Query');
});

prisma.$on('error', (e: { message: string }) => {
  logger.error({ error: e.message }, 'Prisma Error');
});

prisma.$on('info', (e: { message: string }) => {
  logger.info({ message: e.message }, 'Prisma Info');
});

prisma.$on('warn', (e: { message: string }) => {
  logger.warn({ message: e.message }, 'Prisma Warning');
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma; 