import { config } from 'dotenv';
import express from 'express';
config({ path: '.env' });

import { Server } from './server/server.server';
import { startExchangeRateCron } from "@/cron/exchangeRate.cron";

void express;

const server = new Server();

server.listen();

startExchangeRateCron();
