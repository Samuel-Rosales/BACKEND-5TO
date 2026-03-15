import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { InvoiceExpenseController } from "./invoiceExpense.controller";
import { InvoiceExpenseValidator } from "./invoiceExpense.validator";

const invoiceExpenseRouter = Router();

const controller = new InvoiceExpenseController();
const validator = new InvoiceExpenseValidator();

invoiceExpenseRouter.post(
    "/",
    validator.createInvoiceExpenseValidator,
    handleValidationErrors,
    controller.create
);

invoiceExpenseRouter.get(
    "/",
    controller.findAll
);

invoiceExpenseRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.InvoiceExpenseExistsValidator,
    handleValidationErrors,
    controller.findOne
);

invoiceExpenseRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.InvoiceExpenseExistsValidator,
    validator.updateInvoiceExpenseValidator,
    handleValidationErrors,
    controller.update
);

invoiceExpenseRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.InvoiceExpenseExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const InvoiceExpenseRoute = invoiceExpenseRouter;
