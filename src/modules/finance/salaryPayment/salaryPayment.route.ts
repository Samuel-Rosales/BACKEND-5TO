import { Router } from 'express';
import { SalaryPaymentController } from './salaryPayment.controller';

const router = Router();

router.get('/pending-summary', SalaryPaymentController.pendingSummary);
router.get('/', SalaryPaymentController.findAll);
router.get('/:id', SalaryPaymentController.findOne);
router.post('/', SalaryPaymentController.create);
router.patch('/:id', SalaryPaymentController.update);
router.delete('/:id', SalaryPaymentController.delete);

export const SalaryPaymentRoute = router;
