import { Router } from 'express';
import { ExpenseSummaryController } from './expenseSummary.controller';

const router = Router();

router.get('/', ExpenseSummaryController.getSummary);
router.get('/pdf', ExpenseSummaryController.getPdf);

export const expenseSummaryRouter = router;
