import { Router } from 'express';
import { SpecialtyDemandController } from './specialtyDemand.controller';

const router = Router();

router.get('/', SpecialtyDemandController.getSpecialtyDemand);

export default router;
