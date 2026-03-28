import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { InvoiceController } from "./invoice.controller";
import { InvoiceValidator } from "./invoice.validator";

const invoiceRouter = Router();

const controller = new InvoiceController();
const validator = new InvoiceValidator();

invoiceRouter.post(
    "/",
    validator.createInvoiceValidator,
    handleValidationErrors,
    controller.create
);

invoiceRouter.get(
    "/",
    controller.findAll
);

// invoiceRouter.get(
//     "/:id",
//     validator.IdParamValidator,
//     validator.InvoiceExistsValidator,
//     handleValidationErrors,
//     controller.findOne
// );

// invoiceRouter.put(
//     "/:id",
//     validator.IdParamValidator,
//     validator.InvoiceExistsValidator,
//     validator.updateInvoiceValidator,
//     handleValidationErrors,
//     controller.update
// );

// invoiceRouter.delete(
//     "/:id",
//     validator.IdParamValidator,
//     validator.InvoiceExistsValidator,
//     handleValidationErrors,
//     controller.delete
// );

export const InvoiceRoute = invoiceRouter;
