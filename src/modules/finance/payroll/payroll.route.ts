import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { PayrollController } from "./payroll.controller";
import { PayrollValidator } from "./payroll.validator";

const payrollRouter = Router();

const controller = new PayrollController();
const validator = new PayrollValidator();

payrollRouter.post(
    "/",
    validator.createPayrollValidator,
    handleValidationErrors,
    controller.create,
);

payrollRouter.get(
    "/",
    controller.findAll,
);

payrollRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.PayrollExistsValidator,
    handleValidationErrors,
    controller.findOne,
);

payrollRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.PayrollExistsValidator,
    validator.updatePayrollValidator,
    handleValidationErrors,
    controller.update,
);

payrollRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.PayrollExistsValidator,
    handleValidationErrors,
    controller.delete,
);

export const PayrollRoute = payrollRouter;
