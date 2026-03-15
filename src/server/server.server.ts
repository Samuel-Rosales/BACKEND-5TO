import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { stream, connectDB } from '@/configs';
import { RoleRoute, UserRoute } from '@/modules/auth';
import { MedicalSpecialtyRoute } from '@/modules/medical';

export class Server {

    public app: express.Application;
    private apiPort: string;
    private apiUrl: string;
    private prefix: string;
    private paths: any;

    constructor() {
        this.app = express();
        this.apiPort = process.env.API_PORT || "3000";
        this.apiUrl = process.env.API_URL || `http://localhost:${this.apiPort}`;
        this.prefix = '/api/v1';
        this.paths = {
            roles: `${this.prefix}/auth/role`,
            users: `${this.prefix}/auth/user`,
            procducts: `${this.prefix}/inventory/product`,
            medicalSpecialties: `${this.prefix}/medical/specialty`,
        };

        this.dbConnection();
        this.middlewares();
        this.routes();
    }

    private middlewares() {
        this.app.use(cors({
            origin: "*",
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(express.static("src/public"));
        this.app.use(morgan('dev', { stream }));
    }

    private routes() {
        this.app.get('/', (req, res) => {
            res.status(200).json({
                status: 'online',
                message: 'Backend SaaS is running correctly'
            });
        });

        this.app.get('/health', (req, res) => {
            res.status(200).send('OK');
        });

        this.app.use(this.paths.roles, RoleRoute);
        this.app.use(this.paths.users, UserRoute);
        this.app.use(this.paths.medicalSpecialties, MedicalSpecialtyRoute);

        this.app.use((req, res) => {
            console.log(`[404 ERROR] Se intentó acceder a: ${req.originalUrl}`);
            res.status(404).json({
                error: 'Not Found',
                requestedPath: req.originalUrl,
                validPrefix: this.prefix
            });
        });
    }

    async dbConnection() {
        await connectDB();
    }

    async listen() {

        // initCronJobs();

        this.app.listen(this.apiPort, () => {

            console.log(`🚀 Server running at ${this.apiUrl}`);

            // Log opcional para ver las rutas activas al iniciar

            console.log(`Endpoints disponibles en ${this.prefix}/...`);

        })
    }
}