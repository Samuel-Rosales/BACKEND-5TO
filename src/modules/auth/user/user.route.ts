import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { UserController } from "./user.controller";
import { UserValidator } from "./user.validator";

const userRouter = Router();

const controller = new UserController();
const validator = new UserValidator();

userRouter.post(
    "/",
    validator.createUserValidator,
    handleValidationErrors,
    controller.create
);

userRouter.get(
    "/",
    controller.findAll
);

userRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.UserExistsValidator,
    handleValidationErrors,
    controller.findOne
);

userRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.UserExistsValidator,
    validator.updateUserValidator,
    handleValidationErrors,
    controller.update
);

userRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.UserExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const UserRoute = userRouter;
