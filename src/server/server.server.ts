import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { stream, connectDB } from '@/configs';
import { RoleRoute, UserRoute, RegisterRoute } from '@/modules/auth';
import { MedicalSpecialtyRoute, PatientRoute, DoctorRoute, ConsultationRoute, PrescriptionRoute, InfoPatientRoute } from '@/modules/medical';
import { AppointmentRoute, AppointmentTypeRoute, DoctorAvailabilityRoute, DoctorScheduleOverrideRoute, DoctorScheduleRoute, StatusAppointmentRoute } from '@/modules/scheduling';
import { ExpenseCategoryRoute, ExpensePaymentRoute, InvoiceExpenseRoute } from '@/modules/expenses';
import { CategoryRoute, MeasurementUnitRoute, SupplyRoute, StockLotRoute, StockMovementRoute, SupplyConsultationRoute, SupplyPresentationRoute } from '@/modules/inventory';
import { ExchangeRateRoute, InvoicePaymentRoute, InvoiceRoute, PaymentMethodRoute, PayrollLineRoute, PayrollRoute, SalaryPaymentRoute, StatusInvoiceRoute, TaxRoute } from '@/modules/finance';
import { PurchasePaymentRoute, PurchaseRoute, SupplierRoute } from '@/modules/procurement';
import { LoginRoute } from '@/modules/auth/login';
import { dailyBookRouter, expenseLedgerRouter, expenseSummaryRouter, incomeSummaryRouter } from '@/modules/report';

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
            login: `${this.prefix}/auth/login`,
            register: `${this.prefix}/auth/register`,
            
            medicalSpecialties: `${this.prefix}/medical/specialty`,
            patients: `${this.prefix}/medical/patient`,
            infoPatients: `${this.prefix}/medical/info-patient`,
            doctors: `${this.prefix}/medical/doctor`,
            consultations: `${this.prefix}/medical/consultation`,
            prescriptions: `${this.prefix}/medical/prescription`,

            appointmentStatuses: `${this.prefix}/scheduling/status-appointment`,
            appointmentTypes: `${this.prefix}/scheduling/appointment-type`,
            appointments: `${this.prefix}/scheduling/appointment`,
            doctorAvailabilities: `${this.prefix}/scheduling/doctor-availability`,
            doctorSchedules: `${this.prefix}/scheduling/doctor-schedule`,
            doctorScheduleOverrides: `${this.prefix}/scheduling/doctor-schedule-override`,

            expenseCategories: `${this.prefix}/expenses/category`,
            invoiceExpenses: `${this.prefix}/expenses/invoice-expense`,
            expensePayments: `${this.prefix}/expenses/expense-payment`,

            inventoryCategories: `${this.prefix}/inventory/category`,
            measurementUnits: `${this.prefix}/inventory/measurement-unit`,
            stockLots: `${this.prefix}/inventory/stock-lot`,
            stockMovements: `${this.prefix}/inventory/stock-movement`,
            supplyConsultations: `${this.prefix}/inventory/supply-consultation`,
            supplyPresentations: `${this.prefix}/inventory/supply-presentation`,
            supplies: `${this.prefix}/inventory/supply`,
            
            exchangeRates: `${this.prefix}/finance/exchange-rate`,
            taxes: `${this.prefix}/finance/tax`,
            paymentMethods: `${this.prefix}/finance/payment-method`,
            invoiceStatuses: `${this.prefix}/finance/status-invoice`,
            invoices: `${this.prefix}/finance/invoice`,
            invoicePayments: `${this.prefix}/finance/invoice-payment`,
            payrolls: `${this.prefix}/finance/payroll`,
            payrollLines: `${this.prefix}/finance/payroll-line`,
            salaryPayments: `${this.prefix}/finance/salary-payment`,

            suppliers: `${this.prefix}/procurement/supplier`,
            purchases: `${this.prefix}/procurement/purchase`,
            purchasePayments: `${this.prefix}/procurement/purchase-payment`,

            expenseLedger: `${this.prefix}/report/expense-ledger`,
            expenseSummary: `${this.prefix}/report/expense-summary`,
            incomeSummary: `${this.prefix}/report/income-summary`,
            dailyBook: `${this.prefix}/report/daily-book`,
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
        this.app.use(this.paths.login, LoginRoute);        
        this.app.use(this.paths.register, RegisterRoute);

        this.app.use(this.paths.supplies, SupplyRoute);
        this.app.use(this.paths.inventoryCategories, CategoryRoute);
        this.app.use(this.paths.measurementUnits, MeasurementUnitRoute);
        this.app.use(this.paths.stockLots, StockLotRoute);
        this.app.use(this.paths.stockMovements, StockMovementRoute);
        this.app.use(this.paths.supplyConsultations, SupplyConsultationRoute);
        this.app.use(this.paths.supplyPresentations, SupplyPresentationRoute);
        this.app.use(this.paths.medicalSpecialties, MedicalSpecialtyRoute);
        this.app.use(this.paths.patients, PatientRoute);
        this.app.use(this.paths.infoPatients, InfoPatientRoute);
        this.app.use(this.paths.doctors, DoctorRoute);
        this.app.use(this.paths.consultations, ConsultationRoute);
        this.app.use(this.paths.prescriptions, PrescriptionRoute);

        this.app.use(this.paths.appointmentStatuses, StatusAppointmentRoute);
        this.app.use(this.paths.appointmentTypes, AppointmentTypeRoute);
        this.app.use(this.paths.appointments, AppointmentRoute);
        this.app.use(this.paths.doctorAvailabilities, DoctorAvailabilityRoute);
        this.app.use(this.paths.doctorSchedules, DoctorScheduleRoute);
        this.app.use(this.paths.doctorScheduleOverrides, DoctorScheduleOverrideRoute);

        this.app.use(this.paths.expenseCategories, ExpenseCategoryRoute);
        this.app.use(this.paths.invoiceExpenses, InvoiceExpenseRoute);
        this.app.use(this.paths.expensePayments, ExpensePaymentRoute);

        this.app.use(this.paths.exchangeRates, ExchangeRateRoute);
        this.app.use(this.paths.taxes, TaxRoute);
        this.app.use(this.paths.paymentMethods, PaymentMethodRoute);
        this.app.use(this.paths.invoiceStatuses, StatusInvoiceRoute);
        this.app.use(this.paths.invoices, InvoiceRoute);
        this.app.use(this.paths.invoicePayments, InvoicePaymentRoute);

        this.app.use(this.paths.payrolls, PayrollRoute);
        this.app.use(this.paths.payrollLines, PayrollLineRoute);
        this.app.use(this.paths.salaryPayments, SalaryPaymentRoute);

        this.app.use(this.paths.suppliers, SupplierRoute);
        this.app.use(this.paths.purchases, PurchaseRoute);
        this.app.use(this.paths.purchasePayments, PurchasePaymentRoute);

        this.app.use(this.paths.expenseLedger, expenseLedgerRouter);
        this.app.use(this.paths.expenseSummary, expenseSummaryRouter);
        this.app.use(this.paths.incomeSummary, incomeSummaryRouter);
        this.app.use(this.paths.dailyBook, dailyBookRouter);

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
