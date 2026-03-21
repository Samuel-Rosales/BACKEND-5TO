import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { SupplierController } from "./supplier.controller";
import { SupplierValidator } from "./supplier.validator";

const supplierRouter = Router();

const controller = new SupplierController();
const validator = new SupplierValidator();

supplierRouter.post(
    "/",
    validator.createSupplierValidator,
    handleValidationErrors,
    controller.create,
);

supplierRouter.get(
    "/",
    controller.findAll,
);

supplierRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.SupplierExistsValidator,
    handleValidationErrors,
    controller.findOne,
);

supplierRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.SupplierExistsValidator,
    validator.updateSupplierValidator,
    handleValidationErrors,
    controller.update,
);

supplierRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.SupplierExistsValidator,
    handleValidationErrors,
    controller.delete,
);

export const SupplierRoute = supplierRouter;
