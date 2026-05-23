import winston from 'winston';

// Iniciamos solo con el transporte de consola (Seguro para Vercel)
const transportsList: winston.transport[] = [
    new winston.transports.Console({
        format: winston.format.simple(),
    })
];

// Opcional: Si quieres que guarde archivos SOLO cuando estás programando en tu PC local
if (process.env.NODE_ENV !== 'production') {
    transportsList.push(
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    );
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: transportsList,
});