import { Router } from 'express';
import { ReceptionistOverviewController } from './receptionistOverview.controller';

const router = Router();

router.get('/', ReceptionistOverviewController.getOverview);

export const receptionistOverviewRouter = router;
