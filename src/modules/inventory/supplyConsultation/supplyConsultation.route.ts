import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { SupplyConsultationController } from "./supplyConsultation.controller";
import { SupplyConsultationValidator } from "./supplyConsultation.validator";

const supplyConsultationRouter = Router();

const controller = new SupplyConsultationController();
const validator = new SupplyConsultationValidator();

supplyConsultationRouter.post(
    "/",
    validator.createSupplyConsultationValidator,
    handleValidationErrors,
    controller.create
);

supplyConsultationRouter.get(
    "/",
    controller.findAll
);

supplyConsultationRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyConsultationExistsValidator,
    handleValidationErrors,
    controller.findOne
);

supplyConsultationRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyConsultationExistsValidator,
    validator.updateSupplyConsultationValidator,
    handleValidationErrors,
    controller.update
);

supplyConsultationRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyConsultationExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const SupplyConsultationRoute = supplyConsultationRouter;
