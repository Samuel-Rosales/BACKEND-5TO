import { Router } from "express";
import { RoleController } from "./role.controller";
import { RoleValidator } from "./role.validator";
import { handleValidationErrors } from "@/middlewares/validation.middleware";

const roleRouter = Router();

const controller = new RoleController();
const validator = new RoleValidator();

roleRouter.post(
    "/", 
    validator.createRoleValidator, 
    handleValidationErrors, 
    controller.create
);
roleRouter.get(
    "/", 
    controller.findAll
);

roleRouter.get(
    "/:id", 
    validator.IdParamValidator, 
    validator.RoleExistsValidator, 
    handleValidationErrors, 
    controller.findOne
);

roleRouter.put(
    "/:id", 
    validator.IdParamValidator, 
    validator.RoleExistsValidator, 
    validator.updateRoleValidator, 
    handleValidationErrors, 
    controller.update
);

roleRouter.delete(
    "/:id", 
    validator.IdParamValidator, 
    validator.RoleExistsValidator, 
    handleValidationErrors, 
    controller.delete
);

export const RoleRoute = roleRouter;