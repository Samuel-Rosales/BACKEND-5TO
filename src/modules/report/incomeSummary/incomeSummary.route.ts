import { Router } from 'express';
import { IncomeSummaryController } from './incomeSummary.controller';

const router = Router();

router.get('/', IncomeSummaryController.getSummary);
router.get('/pdf', IncomeSummaryController.getPdf);

export const incomeSummaryRouter = router;
