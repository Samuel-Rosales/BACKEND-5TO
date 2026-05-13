import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { StatusAppointmentController } from "./statusAppointment.controller";
import { StatusAppointmentValidator } from "./statusAppointment.validator";

const statusAppointmentRouter = Router();

const controller = new StatusAppointmentController();
const validator = new StatusAppointmentValidator();

statusAppointmentRouter.post(
    "/",
    validator.createStatusAppointmentValidator,
    handleValidationErrors,
    controller.create
);

statusAppointmentRouter.get(
    "/",
    controller.findAll
);

statusAppointmentRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.StatusAppointmentExistsValidator,
    handleValidationErrors,
    controller.findOne
);

statusAppointmentRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.StatusAppointmentExistsValidator,
    validator.updateStatusAppointmentValidator,
    handleValidationErrors,
    controller.update
);

statusAppointmentRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.StatusAppointmentExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const StatusAppointmentRoute = statusAppointmentRouter;
