import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { InfoPatientController } from "./info-patient.controller";
import { InfoPatientValidator } from "./info-patient.validator";

const infoPatientRouter = Router();

const controller = new InfoPatientController();
const validator = new InfoPatientValidator();

infoPatientRouter.post(
    "/patient/:patientId",
    validator.IdParamValidator,
    validator.PatientExistsValidator,
    validator.createInfoPatientValidator,
    handleValidationErrors,
    controller.create
);

infoPatientRouter.get(
    "/",
    controller.findAll
);

infoPatientRouter.get(
    "/patient/:patientId",
    validator.IdParamValidator,
    handleValidationErrors,
    controller.findByPatientId
);

infoPatientRouter.put(
    "/patient/:patientId",
    validator.IdParamValidator,
    handleValidationErrors,
    validator.updateInfoPatientValidator,
    handleValidationErrors,
    controller.updateByPatientId
);

infoPatientRouter.delete(
    "/patient/:patientId",
    validator.IdParamValidator,
    validator.PatientExistsValidator,
    handleValidationErrors,
    controller.deleteByPatientId
);

export const InfoPatientRoute = infoPatientRouter;
