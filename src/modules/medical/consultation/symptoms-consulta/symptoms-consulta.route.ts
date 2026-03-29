import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { SymptomsConsultaController } from "./symptoms-consulta.controller";
import { SymptomsConsultaValidator } from "./symptoms-consulta.validator";

const router = Router({ mergeParams: true });

const controller = new SymptomsConsultaController();
const validator = new SymptomsConsultaValidator();

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
    "/:symptomsConsultaId",
    validator.SymptomsConsultaIdParamValidator,
    validator.SymptomsConsultaExistsForConsultationValidator,
    validator.updateValidator,
    handleValidationErrors,
    controller.update
);

router.delete(
    "/:symptomsConsultaId",
    validator.SymptomsConsultaIdParamValidator,
    validator.SymptomsConsultaExistsForConsultationValidator,
    handleValidationErrors,
    controller.delete
);

export const SymptomsConsultaRoute = router;
