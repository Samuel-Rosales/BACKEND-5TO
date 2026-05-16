import { Router } from 'express';
import { IncomeSummaryController } from './incomeSummary.controller';

const router = Router();

router.get('/', IncomeSummaryController.getSummary);

export const incomeSummaryRouter = router;
