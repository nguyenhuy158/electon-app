import winston from 'winston';
import path from 'path';
import { app } from 'electron';
import { Logger } from '../../application/ports/Logger';

export class WinstonLogger implements Logger {
  private logger: winston.Logger;

  constructor() {
    const logPath = app ? path.join(app.getPath('userData'), 'logs') : 'logs';

    const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
    const level = process.env.LOG_LEVEL || defaultLevel;

    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: [
        new winston.transports.File({
          filename: path.join(logPath, 'error.log'),
          level: 'error',
        }),
        new winston.transports.File({
          filename: path.join(logPath, 'combined.log'),
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
      );
    }
  }

  info(message: string, context?: any): void {
    this.logger.info(message, { context });
  }

  error(message: string, error?: any): void {
    this.logger.error(message, { error });
  }

  warn(message: string, context?: any): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: any): void {
    this.logger.debug(message, { context });
  }
}
