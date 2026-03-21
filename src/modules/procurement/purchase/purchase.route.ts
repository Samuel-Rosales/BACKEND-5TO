import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { PurchaseController } from "./purchase.controller";
import { PurchaseValidator } from "./purchase.validator";

const purchaseRouter = Router();

const controller = new PurchaseController();
const validator = new PurchaseValidator();

purchaseRouter.post(
    "/",
    validator.createPurchaseValidator,
    handleValidationErrors,
    controller.create,
);

purchaseRouter.get(
    "/",
    controller.findAll,
);

purchaseRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.PurchaseExistsValidator,
    handleValidationErrors,
    controller.findOne,
);

purchaseRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.PurchaseExistsValidator,
    validator.updatePurchaseValidator,
    handleValidationErrors,
    controller.update,
);

purchaseRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.PurchaseExistsValidator,
    handleValidationErrors,
    controller.delete,
);

export const PurchaseRoute = purchaseRouter;
