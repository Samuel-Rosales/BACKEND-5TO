import { Router } from 'express';
import { IngresosController } from './ingresos.controller';

const router = Router();

router.get('/summary', IngresosController.getSummary);
router.get('/servicios', IngresosController.getServicios);
router.get('/cartera', IngresosController.getCartera);
router.get('/recaudacion', IngresosController.getRecaudacion);

export const ingresosRouter = router;