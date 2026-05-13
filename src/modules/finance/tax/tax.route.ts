import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { TaxController } from "./tax.controller";
import { TaxValidator } from "./tax.validator";

const taxRouter = Router();

const controller = new TaxController();
const validator = new TaxValidator();

taxRouter.post(
    "/",
    validator.createTaxValidator,
    handleValidationErrors,
    controller.create
);

taxRouter.get(
    "/",
    controller.findAll
);

taxRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.TaxExistsValidator,
    handleValidationErrors,
    controller.findOne
);

taxRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.TaxExistsValidator,
    validator.updateTaxValidator,
    handleValidationErrors,
    controller.update
);

taxRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.TaxExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const TaxRoute = taxRouter;
