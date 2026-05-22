import { Router } from "express";
import { DoctorAppointmentsController } from "./doctorAppointments.controller";

const router = Router();

router.get("/appointments", DoctorAppointmentsController.getReport);

export const doctorAppointmentsRouter = router;
