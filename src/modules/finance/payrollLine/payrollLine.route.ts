import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { PayrollLineController } from "./payrollLine.controller";
import { PayrollLineValidator } from "./payrollLine.validator";

const payrollLineRouter = Router();

const controller = new PayrollLineController();
const validator = new PayrollLineValidator();

payrollLineRouter.post(
    "/",
    validator.createPayrollLineValidator,
    handleValidationErrors,
    controller.create,
);

payrollLineRouter.get(
    "/",
    controller.findAll,
);

payrollLineRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.PayrollLineExistsValidator,
    handleValidationErrors,
    controller.findOne,
);

payrollLineRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.PayrollLineExistsValidator,
    validator.updatePayrollLineValidator,
    handleValidationErrors,
    controller.update,
);

payrollLineRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.PayrollLineExistsValidator,
    handleValidationErrors,
    controller.delete,
);

export const PayrollLineRoute = payrollLineRouter;
