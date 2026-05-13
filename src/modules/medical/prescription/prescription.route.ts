import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { PrescriptionController } from "./prescription.controller";
import { PrescriptionValidator } from "./prescription.validator";

const prescriptionRouter = Router();

const controller = new PrescriptionController();
const validator = new PrescriptionValidator();

prescriptionRouter.post(
    "/",
    validator.createPrescriptionValidator,
    handleValidationErrors,
    controller.create
);

prescriptionRouter.get(
    "/",
    controller.findAll
);

prescriptionRouter.get(
    "/patient/:id",
    validator.IdParamValidator,
    handleValidationErrors,
    controller.findByPatientId
);

prescriptionRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.PrescriptionExistsValidator,
    handleValidationErrors,
    controller.findOne
);

prescriptionRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.PrescriptionExistsValidator,
    validator.updatePrescriptionValidator,
    handleValidationErrors,
    controller.update
);

prescriptionRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.PrescriptionExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const PrescriptionRoute = prescriptionRouter;
