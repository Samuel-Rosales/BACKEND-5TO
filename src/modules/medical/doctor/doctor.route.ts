import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { DoctorController } from "./doctor.controller";
import { DoctorValidator } from "./doctor.validator";

const doctorRouter = Router();

const controller = new DoctorController();
const validator = new DoctorValidator();

doctorRouter.post(
    "/",
    validator.createDoctorValidator,
    handleValidationErrors,
    controller.create
);

doctorRouter.get(
    "/",
    controller.findAll
);

doctorRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorExistsValidator,
    handleValidationErrors,
    controller.findOne
);

doctorRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorExistsValidator,
    validator.updateDoctorValidator,
    handleValidationErrors,
    controller.update
);

doctorRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.DoctorExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const DoctorRoute = doctorRouter;
