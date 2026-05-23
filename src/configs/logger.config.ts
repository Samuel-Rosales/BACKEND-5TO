import winston from 'winston';

// Iniciamos solo con el transporte de consola (Seguro para Vercel)
const transportsList: winston.transport[] = [
    new winston.transports.Console({
        format: winston.format.simple(),
    })
];

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: transportsList,
});