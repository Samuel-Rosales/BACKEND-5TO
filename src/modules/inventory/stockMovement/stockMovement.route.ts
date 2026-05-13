import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { StockMovementController } from "./stockMovement.controller";
import { StockMovementValidator } from "./stockMovement.validator";

const stockMovementRouter = Router();

const controller = new StockMovementController();
const validator = new StockMovementValidator();

stockMovementRouter.post(
    "/",
    validator.createStockMovementValidator,
    handleValidationErrors,
    controller.create
);

stockMovementRouter.get(
    "/",
    controller.findAll
);

stockMovementRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.StockMovementExistsValidator,
    handleValidationErrors,
    controller.findOne
);

stockMovementRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.StockMovementExistsValidator,
    validator.updateStockMovementValidator,
    handleValidationErrors,
    controller.update
);

stockMovementRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.StockMovementExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const StockMovementRoute = stockMovementRouter;
