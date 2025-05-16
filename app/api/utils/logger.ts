type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  service: string;
  level?: LogLevel;
}

class Logger {
  private service: string;
  private level: LogLevel;
  private isDevelopment: boolean;

  constructor({ service, level = 'info' }: LoggerOptions) {
    this.service = service;
    this.level = level;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()} [${this.service}]: ${message}${metaStr}`;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      switch (level) {
        case 'error':
          console.error(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'debug':
          if (this.isDevelopment) {
            console.debug(formattedMessage);
          }
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log('error', message, meta);
  }
}

export const createLogger = (service: string) => {
  const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  return new Logger({ service, level });
};