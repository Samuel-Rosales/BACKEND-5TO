import { config } from 'dotenv';
import express from 'express';

import { Server } from './server/server.server';
// OJO: En Serverless (Vercel) los cron jobs de node-cron no funcionan porque el servidor se duerme. 
// Por ahora coméntalo para que no colapse el despliegue.
// import { startExchangeRateCron } from "@/cron/exchangeRate.cron";

void express;

const server = new Server();

// CRÍTICO: Comenta el listen para que Vercel controle el puerto
// server.listen();

// CRÍTICO: Exporta la app compilada
export default server.app;