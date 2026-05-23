import { Router } from "express";
import { DoctorFinanceController } from "./doctorFinance.controller";

const router = Router();

router.get("/finance", DoctorFinanceController.getReport);

export const doctorFinanceRouter = router;
