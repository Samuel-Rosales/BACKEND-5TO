import { Router } from 'express';
import { OperativosController } from './operativos.controller';

const router = Router();

router.get('/overview', OperativosController.getOverview);
router.get('/citas', OperativosController.getCitas);
router.get('/tiempos', OperativosController.getTiempos);
router.get('/productividad', OperativosController.getProductividad);

export const operativosRouter = router;
