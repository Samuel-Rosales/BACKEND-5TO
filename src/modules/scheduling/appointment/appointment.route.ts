import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { AppointmentController } from "./appointment.controller";
import { AppointmentValidator } from "./appointment.validator";

const appointmentRouter = Router();

const controller = new AppointmentController();
const validator = new AppointmentValidator();

appointmentRouter.post(
    "/",
    validator.createAppointmentValidator,
    handleValidationErrors,
    controller.create
);

appointmentRouter.get(
    "/",
    controller.findAll
);

appointmentRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.AppointmentExistsValidator,
    handleValidationErrors,
    controller.findOne
);

appointmentRouter.get(
    "/doctor/:id", //id del usuario 
    handleValidationErrors,
    controller.findManyByDr
);

appointmentRouter.get(
    "/doctor/:id/weekly-flow",
    validator.IdParamValidator,
    handleValidationErrors,
    controller.getWeeklyFlowByDoctor
);

appointmentRouter.get(
    "/doctor/:id/stats",
    validator.IdParamValidator,
    handleValidationErrors,
    controller.getDoctorStats
);

appointmentRouter.get(
    "/patient/:id", //id del paciente
    validator.IdParamValidator,
    handleValidationErrors,
    controller.findByPatientId
);

appointmentRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.AppointmentExistsValidator,
    validator.updateAppointmentValidator,
    handleValidationErrors,
    controller.update
);

appointmentRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.AppointmentExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const AppointmentRoute = appointmentRouter;
