import { config } from 'dotenv';
config({ path: '.env' });

import { Server } from './server/server.server';
import { startExchangeRateCron } from "@/cron/exchangeRate.cron";

const server = new Server();

server.listen();

startExchangeRateCron();
