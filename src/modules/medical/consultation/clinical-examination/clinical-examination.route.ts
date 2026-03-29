import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ClinicalExaminationController } from "./clinical-examination.controller";
import { ClinicalExaminationValidator } from "./clinical-examination.validator";

const router = Router({ mergeParams: true });

const controller = new ClinicalExaminationController();
const validator = new ClinicalExaminationValidator();

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
    "/:clinicalExaminationId",
    validator.ClinicalExaminationIdParamValidator,
    validator.ClinicalExaminationExistsForConsultationValidator,
    validator.updateValidator,
    handleValidationErrors,
    controller.update
);

router.delete(
    "/:clinicalExaminationId",
    validator.ClinicalExaminationIdParamValidator,
    validator.ClinicalExaminationExistsForConsultationValidator,
    handleValidationErrors,
    controller.delete
);

export const ClinicalExaminationRoute = router;
