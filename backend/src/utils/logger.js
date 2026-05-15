const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'codesentry' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0 && meta.service === undefined) {
            msg += ` ${JSON.stringify(meta)}`;
          }
          if (stack) {
            msg += `\n${stack}`;
          }
          return msg;
        })
      )
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error',
    maxsize: 5242880,
    maxFiles: 5
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log',
    maxsize: 5242880,
    maxFiles: 5
  }));
}

module.exports = logger;
