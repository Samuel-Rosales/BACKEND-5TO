import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { DoctorScheduleValidator } from "./doctorSchedule.validator";

const doctorScheduleRouter = Router();

const controller = new DoctorScheduleController();
const validator = new DoctorScheduleValidator();

doctorScheduleRouter.post(
    "/",
    validator.createDoctorScheduleValidator,
    handleValidationErrors,
    controller.create
);

doctorScheduleRouter.get(
    "/",
    validator.findAllDoctorScheduleValidator,
    handleValidationErrors,
    controller.findAll
);
doctorScheduleRouter.get(
    "/available-doctors",
    validator.findAllDoctorScheduleValidator,
    handleValidationErrors,
    controller.findAllAvailableDrs
);

/*doctorScheduleRouter.get(
    "/doctor/:doctorId",
    validator.DoctorIdParamValidator,
    handleValidationErrors,
    controller.findAllByDoctor
);*/

doctorScheduleRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorScheduleExistsValidator,
    handleValidationErrors,
    controller.findOne
);

doctorScheduleRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorScheduleExistsValidator,
    validator.updateDoctorScheduleValidator,
    handleValidationErrors,
    controller.update
);

doctorScheduleRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorScheduleExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const DoctorScheduleRoute = doctorScheduleRouter;
