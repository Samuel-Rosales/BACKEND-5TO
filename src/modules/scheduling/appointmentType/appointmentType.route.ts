import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { AppointmentTypeController } from "./appointmentType.controller";
import { AppointmentTypeValidator } from "./appointmentType.validator";

const appointmentTypeRouter = Router();

const controller = new AppointmentTypeController();
const validator = new AppointmentTypeValidator();

appointmentTypeRouter.post(
    "/",
    validator.createAppointmentTypeValidator,
    handleValidationErrors,
    controller.create
);

appointmentTypeRouter.get(
    "/",
    controller.findAll
);

appointmentTypeRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.AppointmentTypeExistsValidator,
    handleValidationErrors,
    controller.findOne
);

appointmentTypeRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.AppointmentTypeExistsValidator,
    validator.updateAppointmentTypeValidator,
    handleValidationErrors,
    controller.update
);

appointmentTypeRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.AppointmentTypeExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const AppointmentTypeRoute = appointmentTypeRouter;
