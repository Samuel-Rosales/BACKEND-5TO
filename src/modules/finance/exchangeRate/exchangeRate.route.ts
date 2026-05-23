import { Router } from "express";
import { handleValidationErrors } from "@/middlewares/validation.middleware";
import { ExchangeRateController } from "./exchangeRate.controller";
import { ExchangeRateValidator } from "./exchangeRate.validator";

const exchangeRateRouter = Router();

const controller = new ExchangeRateController();
const validator = new ExchangeRateValidator();

exchangeRateRouter.post(
    "/",
    validator.createExchangeRateValidator,
    handleValidationErrors,
    controller.create
);

exchangeRateRouter.get(
    "/",
    controller.findAll
);

exchangeRateRouter.get(
    "/bcv",
    controller.fetchBcv
);

exchangeRateRouter.post(
    "/bcv/sync",
    controller.syncBcv
);

exchangeRateRouter.get(
    "/:id",
    validator.IdParamValidator,
    validator.ExchangeRateExistsValidator,
    handleValidationErrors,
    controller.findOne
);

exchangeRateRouter.put(
    "/:id",
    validator.IdParamValidator,
    validator.ExchangeRateExistsValidator,
    validator.updateExchangeRateValidator,
    handleValidationErrors,
    controller.update
);

exchangeRateRouter.delete(
    "/:id",
    validator.IdParamValidator,
    validator.ExchangeRateExistsValidator,
    handleValidationErrors,
    controller.delete
);

export const ExchangeRateRoute = exchangeRateRouter;
