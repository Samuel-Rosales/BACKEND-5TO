import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ConsultationController } from "./consultation.controller";
import { ConsultationValidator } from "./consultation.validator";

const consultationRouter = Router();

const controller = new ConsultationController();
const validator = new ConsultationValidator();

consultationRouter.post(
    "/",
    validator.createConsultationValidator,
    handleValidationErrors,
    controller.create
);

consultationRouter.get(
    "/",
    controller.findAll
);

consultationRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    handleValidationErrors,
    controller.findOne
);

consultationRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    validator.updateConsultationValidator,
    handleValidationErrors,
    controller.update
);

consultationRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const ConsultationRoute = consultationRouter;
