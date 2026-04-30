import { Router } from "express";
import { DiagnosisController } from "./diagnosis.controller";

const diagnosisRouter = Router();
const controller = new DiagnosisController();

diagnosisRouter.get("/", controller.findAll);

export const DiagnosisRoute = diagnosisRouter;
