import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { PatientController } from "./patient.controller";
import { PatientValidator } from "./patient.validator";

const patientRouter = Router();

const controller = new PatientController();
const validator = new PatientValidator();

patientRouter.post(
    "/",
    validator.createPatientValidator,
    handleValidationErrors,
    controller.create
);

patientRouter.get(
    "/",
    controller.findAll
);
patientRouter.get(
    "/user/:id",
    validator.IdParamValidator,
    handleValidationErrors,
    controller.findAllFromUser
);

patientRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.PatientExistsValidator,
    handleValidationErrors,
    controller.findOne
);

patientRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.PatientExistsValidator,
    validator.updatePatientValidator,
    handleValidationErrors,
    controller.update
);

patientRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.PatientExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const PatientRoute = patientRouter;
