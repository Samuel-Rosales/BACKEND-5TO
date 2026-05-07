import { Router } from 'express';
import { GastosController } from './gastos.controller';

const router = Router();

router.get('/summary', GastosController.getSummary);
router.get('/compras', GastosController.getCompras);
router.get('/servicios', GastosController.getServicios);
router.get('/nomina', GastosController.getNomina);

export const gastosRouter = router;