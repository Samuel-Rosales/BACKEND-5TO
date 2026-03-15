import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { DoctorAvailabilityController } from "./doctorAvailability.controller";
import { DoctorAvailabilityValidator } from "./doctorAvailability.validator";

const doctorAvailabilityRouter = Router();

const controller = new DoctorAvailabilityController();
const validator = new DoctorAvailabilityValidator();

doctorAvailabilityRouter.post(
    "/",
    validator.createDoctorAvailabilityValidator,
    handleValidationErrors,
    controller.create
);

doctorAvailabilityRouter.get(
    "/",
    controller.findAll
);

doctorAvailabilityRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorAvailabilityExistsValidator,
    handleValidationErrors,
    controller.findOne
);

doctorAvailabilityRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorAvailabilityExistsValidator,
    validator.updateDoctorAvailabilityValidator,
    handleValidationErrors,
    controller.update
);

doctorAvailabilityRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorAvailabilityExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const DoctorAvailabilityRoute = doctorAvailabilityRouter;
