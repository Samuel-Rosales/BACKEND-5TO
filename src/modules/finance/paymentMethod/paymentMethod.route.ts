import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { PaymentMethodController } from "./paymentMethod.controller";
import { PaymentMethodValidator } from "./paymentMethod.validator";

const paymentMethodRouter = Router();

const controller = new PaymentMethodController();
const validator = new PaymentMethodValidator();

paymentMethodRouter.post(
    "/",
    validator.createPaymentMethodValidator,
    handleValidationErrors,
    controller.create
);

paymentMethodRouter.get(
    "/",
    controller.findAll
);

paymentMethodRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.PaymentMethodExistsValidator,
    handleValidationErrors,
    controller.findOne
);

paymentMethodRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.PaymentMethodExistsValidator,
    validator.updatePaymentMethodValidator,
    handleValidationErrors,
    controller.update
);

paymentMethodRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.PaymentMethodExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const PaymentMethodRoute = paymentMethodRouter;
