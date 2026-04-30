import { Router } from "express";
import { SymptomsController } from "./symptoms.controller";

const symptomsRouter = Router();
const controller = new SymptomsController();

symptomsRouter.get("/", controller.findAll);

export const SymptomsRoute = symptomsRouter;
