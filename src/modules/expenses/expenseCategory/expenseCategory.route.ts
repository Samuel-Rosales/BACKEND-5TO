import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ExpenseCategoryController } from "./expenseCategory.controller";
import { ExpenseCategoryValidator } from "./expenseCategory.validator";

const expenseCategoryRouter = Router();

const controller = new ExpenseCategoryController();
const validator = new ExpenseCategoryValidator();

expenseCategoryRouter.post(
    "/",
    validator.createExpenseCategoryValidator,
    handleValidationErrors,
    controller.create
);

expenseCategoryRouter.get(
    "/",
    controller.findAll
);

expenseCategoryRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.ExpenseCategoryExistsValidator,
    handleValidationErrors,
    controller.findOne
);

expenseCategoryRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.ExpenseCategoryExistsValidator,
    validator.updateExpenseCategoryValidator,
    handleValidationErrors,
    controller.update
);

expenseCategoryRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.ExpenseCategoryExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const ExpenseCategoryRoute = expenseCategoryRouter;
