import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { StatusInvoiceController } from "./statusInvoice.controller";
import { StatusInvoiceValidator } from "./statusInvoice.validator";

const statusInvoiceRouter = Router();

const controller = new StatusInvoiceController();
const validator = new StatusInvoiceValidator();

statusInvoiceRouter.post(
    "/",
    validator.createStatusInvoiceValidator,
    handleValidationErrors,
    controller.create
);

statusInvoiceRouter.get(
    "/",
    controller.findAll
);

statusInvoiceRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.StatusInvoiceExistsValidator,
    handleValidationErrors,
    controller.findOne
);

statusInvoiceRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.StatusInvoiceExistsValidator,
    validator.updateStatusInvoiceValidator,
    handleValidationErrors,
    controller.update
);

statusInvoiceRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.StatusInvoiceExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const StatusInvoiceRoute = statusInvoiceRouter;
