import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { MeasurementUnitController } from "./measurementUnit.controller";
import { MeasurementUnitValidator } from "./measurementUnit.validator";

const measurementUnitRouter = Router();

const controller = new MeasurementUnitController();
const validator = new MeasurementUnitValidator();

measurementUnitRouter.post(
    "/",
    validator.createMeasurementUnitValidator,
    handleValidationErrors,
    controller.create
);

measurementUnitRouter.get(
    "/",
    controller.findAll
);

measurementUnitRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.MeasurementUnitExistsValidator,
    handleValidationErrors,
    controller.findOne
);

measurementUnitRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.MeasurementUnitExistsValidator,
    validator.updateMeasurementUnitValidator,
    handleValidationErrors,
    controller.update
);

measurementUnitRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.MeasurementUnitExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const MeasurementUnitRoute = measurementUnitRouter;
