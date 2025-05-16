import pino from 'pino';

export const createLogger = (service: string) => {
  return pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
    base: {
      service,
    },
  });
};