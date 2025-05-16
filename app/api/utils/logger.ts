import pino from 'pino';

// Create a basic logger without worker threads
const createLogger = (name: string) => {
  return pino({
    name,
    level: process.env.LOG_LEVEL || 'info',
    browser: {
      write: {
        info: (...args) => console.log(...args),
        error: (...args) => console.error(...args),
        warn: (...args) => console.warn(...args),
        debug: (...args) => console.debug(...args),
        trace: (...args) => console.trace(...args),
      },
    },
    // Disable worker threads
    transport: undefined,
    // Use basic timestamp
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  });
};

export { createLogger };
