import serverless from 'serverless-http';
import { Server } from '../src/server/server.server';

const server = new Server();

export default serverless(server.app);