import { config } from 'dotenv';
config({ path: '.env' });

import { Server } from './server/server.server';

const server = new Server();

server.listen();