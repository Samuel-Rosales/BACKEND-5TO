import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ProductController } from "./product.controller";
import { ProductValidator } from "./product.validator";

const productRouter = Router();

const controller = new ProductController();
const validator = new ProductValidator();

productRouter.post(
    "/",
    validator.createProductValidator,
    handleValidationErrors,
    controller.create
);

productRouter.get(
    "/",
    controller.findAll
);

productRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.ProductExistsValidator,
    handleValidationErrors,
    controller.findOne
);

productRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.ProductExistsValidator,
    validator.updateProductValidator,
    handleValidationErrors,
    controller.update
);

productRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.ProductExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const ProductRoute = productRouter;
