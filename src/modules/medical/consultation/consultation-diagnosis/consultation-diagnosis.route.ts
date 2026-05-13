import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ConsultationDiagnosisController } from "./consultation-diagnosis.controller";
import { ConsultationDiagnosisValidator } from "./consultation-diagnosis.validator";

const router = Router({ mergeParams: true });

const controller = new ConsultationDiagnosisController();
const validator = new ConsultationDiagnosisValidator();

router.get(
    "/",
    controller.list
);

router.post(
    "/",
    validator.createValidator,
    handleValidationErrors,
    controller.create
);

router.put(
    "/:consultationDiagnosisId",
    validator.ConsultationDiagnosisIdParamValidator,
    validator.ConsultationDiagnosisExistsForConsultationValidator,
    validator.updateValidator,
    handleValidationErrors,
    controller.update
);

router.delete(
    "/:consultationDiagnosisId",
    validator.ConsultationDiagnosisIdParamValidator,
    validator.ConsultationDiagnosisExistsForConsultationValidator,
    handleValidationErrors,
    controller.delete
);

export const ConsultationDiagnosisRoute = router;
