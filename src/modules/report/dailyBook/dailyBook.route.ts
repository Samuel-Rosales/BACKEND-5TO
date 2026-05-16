import { Router } from 'express';
import { DailyBookController } from './dailyBook.controller';

const router = Router();

router.get('/pdf', DailyBookController.getPdf);

export const dailyBookRouter = router;
