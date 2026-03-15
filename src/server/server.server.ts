import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { stream, connectDB } from '@/configs';
import { RoleRoute, UserRoute } from '@/modules/auth';
import { MedicalSpecialtyRoute, PatientRoute, DoctorRoute, ConsultationRoute, PrescriptionRoute } from '@/modules/medical';
import { AppointmentRoute, AppointmentTypeRoute, DoctorAvailabilityRoute, DoctorScheduleOverrideRoute, StatusAppointmentRoute } from '@/modules/scheduling';
import { ExpenseCategoryRoute, ExpensePaymentRoute, InvoiceExpenseRoute } from '@/modules/expenses';
import { CategoryRoute, MeasurementUnitRoute, ProductRoute, StockLotRoute, StockMovementRoute, SupplyConsultationRoute } from '@/modules/inventory';

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
            patients: `${this.prefix}/medical/patient`,
            doctors: `${this.prefix}/medical/doctor`,
            consultations: `${this.prefix}/medical/consultation`,
            prescriptions: `${this.prefix}/medical/prescription`,
            appointmentStatuses: `${this.prefix}/scheduling/status-appointment`,
            appointmentTypes: `${this.prefix}/scheduling/appointment-type`,
            appointments: `${this.prefix}/scheduling/appointment`,
            doctorAvailabilities: `${this.prefix}/scheduling/doctor-availability`,
            doctorScheduleOverrides: `${this.prefix}/scheduling/doctor-schedule-override`,
            expenseCategories: `${this.prefix}/expenses/category`,
            invoiceExpenses: `${this.prefix}/expenses/invoice-expense`,
            expensePayments: `${this.prefix}/expenses/expense-payment`,
            inventoryCategories: `${this.prefix}/inventory/category`,
            measurementUnits: `${this.prefix}/inventory/measurement-unit`,
            stockLots: `${this.prefix}/inventory/stock-lot`,
            stockMovements: `${this.prefix}/inventory/stock-movement`,
            supplyConsultations: `${this.prefix}/inventory/supply-consultation`,
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
        this.app.use(this.paths.procducts, ProductRoute);
        this.app.use(this.paths.inventoryCategories, CategoryRoute);
        this.app.use(this.paths.measurementUnits, MeasurementUnitRoute);
        this.app.use(this.paths.stockLots, StockLotRoute);
        this.app.use(this.paths.stockMovements, StockMovementRoute);
        this.app.use(this.paths.supplyConsultations, SupplyConsultationRoute);
        this.app.use(this.paths.medicalSpecialties, MedicalSpecialtyRoute);
        this.app.use(this.paths.patients, PatientRoute);
        this.app.use(this.paths.doctors, DoctorRoute);
        this.app.use(this.paths.consultations, ConsultationRoute);
        this.app.use(this.paths.prescriptions, PrescriptionRoute);

        this.app.use(this.paths.appointmentStatuses, StatusAppointmentRoute);
        this.app.use(this.paths.appointmentTypes, AppointmentTypeRoute);
        this.app.use(this.paths.appointments, AppointmentRoute);
        this.app.use(this.paths.doctorAvailabilities, DoctorAvailabilityRoute);
        this.app.use(this.paths.doctorScheduleOverrides, DoctorScheduleOverrideRoute);

        this.app.use(this.paths.expenseCategories, ExpenseCategoryRoute);
        this.app.use(this.paths.invoiceExpenses, InvoiceExpenseRoute);
        this.app.use(this.paths.expensePayments, ExpensePaymentRoute);

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