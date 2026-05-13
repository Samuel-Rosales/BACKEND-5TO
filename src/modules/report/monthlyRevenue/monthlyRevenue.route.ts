import { Router } from 'express';
import { MonthlyRevenueController } from './monthlyRevenue.controller';

const router = Router();

router.get('/', MonthlyRevenueController.getMonthlyRevenue);

export const monthlyRevenueRouter = router;
