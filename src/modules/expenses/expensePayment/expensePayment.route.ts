import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ExpensePaymentController } from "./expensePayment.controller";
import { ExpensePaymentValidator } from "./expensePayment.validator";

const expensePaymentRouter = Router();

const controller = new ExpensePaymentController();
const validator = new ExpensePaymentValidator();

expensePaymentRouter.post(
    "/",
    validator.createExpensePaymentValidator,
    handleValidationErrors,
    controller.create
);

expensePaymentRouter.get(
    "/",
    controller.findAll
);

expensePaymentRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.ExpensePaymentExistsValidator,
    handleValidationErrors,
    controller.findOne
);

expensePaymentRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.ExpensePaymentExistsValidator,
    validator.updateExpensePaymentValidator,
    handleValidationErrors,
    controller.update
);

expensePaymentRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.ExpensePaymentExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const ExpensePaymentRoute = expensePaymentRouter;
