import { Router } from 'express';
import { ExpenseSummaryController } from './expenseSummary.controller';

const router = Router();

router.get('/', ExpenseSummaryController.getSummary);

export const expenseSummaryRouter = router;
