import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { SupplyController } from "./supply.controller";
import { SupplyValidator } from "./supply.validator";

const productRouter = Router();

const controller = new SupplyController();
const validator = new SupplyValidator();

productRouter.post(
    "/",
    validator.createSupplyValidator,
    handleValidationErrors,
    controller.create
);

productRouter.get(
    "/",
    controller.findAll
);

productRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyExistsValidator,
    handleValidationErrors,
    controller.findOne
);

productRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyExistsValidator,
    validator.updateSupplyValidator,
    handleValidationErrors,
    controller.update
);

productRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.SupplyExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const SupplyRoute = productRouter;
