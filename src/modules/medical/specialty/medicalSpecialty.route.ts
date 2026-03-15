import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { MedicalSpecialtyController } from "./medicalSpecialty.controller";
import { MedicalSpecialtyValidator } from "./medicalSpecialty.validator";

const medicalSpecialtyRouter = Router();

const controller = new MedicalSpecialtyController();
const validator = new MedicalSpecialtyValidator();

medicalSpecialtyRouter.post(
    "/",
    validator.createMedicalSpecialtyValidator,
    handleValidationErrors,
    controller.create
);

medicalSpecialtyRouter.get(
    "/",
    controller.findAll
);

medicalSpecialtyRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.MedicalSpecialtyExistsValidator,
    handleValidationErrors,
    controller.findOne
);

medicalSpecialtyRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.MedicalSpecialtyExistsValidator,
    validator.updateMedicalSpecialtyValidator,
    handleValidationErrors,
    controller.update
);

medicalSpecialtyRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.MedicalSpecialtyExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const MedicalSpecialtyRoute = medicalSpecialtyRouter;
