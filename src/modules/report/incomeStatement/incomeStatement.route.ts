import { Router } from 'express';
import { IncomeStatementController } from './incomeStatement.controller';

const router = Router();

router.get('/pdf', IncomeStatementController.getPdf);

export const incomeStatementRouter = router;