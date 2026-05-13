import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { StockLotController } from "./stockLot.controller";
import { StockLotValidator } from "./stockLot.validator";

const stockLotRouter = Router();

const controller = new StockLotController();
const validator = new StockLotValidator();

stockLotRouter.post(
    "/",
    validator.createStockLotValidator,
    handleValidationErrors,
    controller.create
);

stockLotRouter.get(
    "/",
    controller.findAll
);

stockLotRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.StockLotExistsValidator,
    handleValidationErrors,
    controller.findOne
);

stockLotRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.StockLotExistsValidator,
    validator.updateStockLotValidator,
    handleValidationErrors,
    controller.update
);

stockLotRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.StockLotExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const StockLotRoute = stockLotRouter;
