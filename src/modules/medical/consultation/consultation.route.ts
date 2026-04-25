import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ConsultationController } from "./consultation.controller";
import { ConsultationValidator } from "./consultation.validator";
import { SymptomsConsultaRoute } from "./symptoms-consulta";
import { ClinicalExaminationRoute } from "./clinical-examination";
import { ConsultationDiagnosisRoute } from "./consultation-diagnosis";

const consultationRouter = Router();

const controller = new ConsultationController();
const validator = new ConsultationValidator();

consultationRouter.post(
    "/",
    validator.createConsultationValidator,
    handleValidationErrors,
    controller.create
);

consultationRouter.get(
    "/",
    controller.findAll
);

consultationRouter.get(
    "/doctor/:id",
    validator.finAllByDoctorValidator,
    handleValidationErrors,
    controller.findAllByDoctor
);




consultationRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    handleValidationErrors,
    controller.findOne
);

consultationRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    validator.updateConsultationValidator,
    handleValidationErrors,
    controller.update
);

consultationRouter.put(
    "/:id/finish",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    validator.finishConsultationValidator,
    handleValidationErrors,
    controller.finish
);

consultationRouter.use(
    "/:id/symptoms-consultas",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    handleValidationErrors,
    SymptomsConsultaRoute
);

consultationRouter.use(
    "/:id/clinical-examinations",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    handleValidationErrors,
    ClinicalExaminationRoute
);

consultationRouter.use(
    "/:id/consultation-diagnoses",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    handleValidationErrors,
    ConsultationDiagnosisRoute
);

consultationRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.ConsultationExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const ConsultationRoute = consultationRouter;