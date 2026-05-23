import { Server } from '../src/server/server.server';

const server = new Server();

// Vercel detecta automáticamente que es una app de Express
export default server.app;