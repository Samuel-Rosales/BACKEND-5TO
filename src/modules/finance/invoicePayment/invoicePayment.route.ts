import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { InvoicePaymentController } from "./invoicePayment.controller";
import { InvoicePaymentValidator } from "./invoicePayment.validator";

const invoicePaymentRouter = Router();

const controller = new InvoicePaymentController();
const validator = new InvoicePaymentValidator();

invoicePaymentRouter.post(
    "/",
    validator.createInvoicePaymentValidator,
    handleValidationErrors,
    controller.create
);

invoicePaymentRouter.get(
    "/",
    controller.findAll
);

invoicePaymentRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.InvoicePaymentExistsValidator,
    handleValidationErrors,
    controller.findOne
);

invoicePaymentRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.InvoicePaymentExistsValidator,
    validator.updateInvoicePaymentValidator,
    handleValidationErrors,
    controller.update
);

invoicePaymentRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.InvoicePaymentExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const InvoicePaymentRoute = invoicePaymentRouter;
