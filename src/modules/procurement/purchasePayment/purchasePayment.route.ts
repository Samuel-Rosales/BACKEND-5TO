import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { PurchasePaymentController } from "./purchasePayment.controller";
import { PurchasePaymentValidator } from "./purchasePayment.validator";

const purchasePaymentRouter = Router();

const controller = new PurchasePaymentController();
const validator = new PurchasePaymentValidator();

purchasePaymentRouter.post(
    "/",
    validator.createPurchasePaymentValidator,
    handleValidationErrors,
    controller.create,
);

purchasePaymentRouter.get(
    "/",
    controller.findAll,
);

purchasePaymentRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.PurchasePaymentExistsValidator,
    handleValidationErrors,
    controller.findOne,
);

purchasePaymentRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.PurchasePaymentExistsValidator,
    validator.updatePurchasePaymentValidator,
    handleValidationErrors,
    controller.update,
);

purchasePaymentRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.PurchasePaymentExistsValidator,
    handleValidationErrors,
    controller.delete,
);

export const PurchasePaymentRoute = purchasePaymentRouter;
