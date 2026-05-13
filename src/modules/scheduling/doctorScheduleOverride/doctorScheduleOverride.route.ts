import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { DoctorScheduleOverrideController } from "./doctorScheduleOverride.controller";
import { DoctorScheduleOverrideValidator } from "./doctorScheduleOverride.validator";

const doctorScheduleOverrideRouter = Router();

const controller = new DoctorScheduleOverrideController();
const validator = new DoctorScheduleOverrideValidator();

doctorScheduleOverrideRouter.post(
    "/",
    validator.createDoctorScheduleOverrideValidator,
    handleValidationErrors,
    controller.create
);

doctorScheduleOverrideRouter.get(
    "/",
    controller.findAll
);

doctorScheduleOverrideRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorScheduleOverrideExistsValidator,
    handleValidationErrors,
    controller.findOne
);

doctorScheduleOverrideRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorScheduleOverrideExistsValidator,
    validator.updateDoctorScheduleOverrideValidator,
    handleValidationErrors,
    controller.update
);

doctorScheduleOverrideRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorScheduleOverrideExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const DoctorScheduleOverrideRoute = doctorScheduleOverrideRouter;
