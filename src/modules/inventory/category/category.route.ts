import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { CategoryController } from "./category.controller";
import { CategoryValidator } from "./category.validator";

const categoryRouter = Router();

const controller = new CategoryController();
const validator = new CategoryValidator();

categoryRouter.post(
    "/",
    validator.createCategoryValidator,
    handleValidationErrors,
    controller.create
);

categoryRouter.get(
    "/",
    controller.findAll
);

categoryRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.CategoryExistsValidator,
    handleValidationErrors,
    controller.findOne
);

categoryRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.CategoryExistsValidator,
    validator.updateCategoryValidator,
    handleValidationErrors,
    controller.update
);

categoryRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.CategoryExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const CategoryRoute = categoryRouter;
