import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { SupplyPresentationController } from "./supplyPresentation.controller";
import { SupplyPresentationValidator } from "./supplyPresentation.validator";

const supplyPresentationRouter = Router();

const controller = new SupplyPresentationController();
const validator = new SupplyPresentationValidator();

supplyPresentationRouter.post(
    "/",
    validator.createSupplyPresentationValidator,
    handleValidationErrors,
    controller.create
);

supplyPresentationRouter.get(
    "/",
    controller.findAll
);

supplyPresentationRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyPresentationExistsValidator,
    handleValidationErrors,
    controller.findOne
);

supplyPresentationRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyPresentationExistsValidator,
    validator.updateSupplyPresentationValidator,
    handleValidationErrors,
    controller.update
);

supplyPresentationRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyPresentationExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const SupplyPresentationRoute = supplyPresentationRouter;
