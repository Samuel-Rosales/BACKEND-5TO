import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { SymptomsController } from "./symptoms.controller";
import { SymptomsValidator } from "./symptoms.validator";

const router = Router();

const controller = new SymptomsController();
const validator = new SymptomsValidator();

router.post(
    "/",
    validator.createSymptomValidator,
    handleValidationErrors,
    controller.create
);

router.get(
    "/",
    controller.findAll
);

router.get(
    "/:id",
    validator.IdParamValidator,
    validator.SymptomExistsValidator,
    handleValidationErrors,
    controller.findOne
);

router.put(
    "/:id",
    validator.IdParamValidator,
    validator.SymptomExistsValidator,
    validator.updateSymptomValidator,
    handleValidationErrors,
    controller.update
);

router.delete(
    "/:id",
    validator.IdParamValidator,
    validator.SymptomExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const SymptomsRoute = router;
