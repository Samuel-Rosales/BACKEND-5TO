import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { DiagnosisController } from "./diagnosis.controller";
import { DiagnosisValidator } from "./diagnosis.validator";

const router = Router();

const controller = new DiagnosisController();
const validator = new DiagnosisValidator();

router.post(
    "/",
    validator.createDiagnosisValidator,
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
    validator.DiagnosisExistsValidator,
    handleValidationErrors,
    controller.findOne
);

router.put(
    "/:id",
    validator.IdParamValidator,
    validator.DiagnosisExistsValidator,
    validator.updateDiagnosisValidator,
    handleValidationErrors,
    controller.update
);

router.delete(
    "/:id",
    validator.IdParamValidator,
    validator.DiagnosisExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const DiagnosisRoute = router;
