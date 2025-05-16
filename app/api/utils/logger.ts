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

  private formatMessage(level: LogLevel, meta: Record<string, unknown>, message: string): string {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()} [${this.service}]: ${message}${metaStr}`;
  }

  private log(level: LogLevel, meta: Record<string, unknown>, message: string) {
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(level, meta, message);
      
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

  debug(meta: Record<string, unknown>, message: string) {
    this.log('debug', meta, message);
  }

  info(meta: Record<string, unknown>, message: string) {
    this.log('info', meta, message);
  }

  warn(meta: Record<string, unknown>, message: string) {
    this.log('warn', meta, message);
  }

  error(meta: Record<string, unknown>, message: string) {
    this.log('error', meta, message);
  }
}

export const createLogger = (service: string) => {
  const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  return new Logger({ service, level });
};