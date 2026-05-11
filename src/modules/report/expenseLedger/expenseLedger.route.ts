import { Router } from 'express';
import { ExpenseLedgerController } from './expenseLedger.controller';
// import { authenticateToken } from '../../../middlewares/authMiddleware'; // Assuming some auth middleware is used

const router = Router();

// router.get('/expense-ledger', authenticateToken, ExpenseLedgerController.getLedger);
router.get('/', ExpenseLedgerController.getLedger);

export const expenseLedgerRouter = router;
