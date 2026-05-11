import { Router } from 'express';
import { AuthController } from './register.controller';
import { handleValidationErrors } from '@/middlewares/validation.middleware';
import { RegisterValidator } from './register.validator';

const router = Router();
const controller = new AuthController();
const validator = new RegisterValidator();
// POST /api/v1/auth/register
router.post(
  '/',
  validator.validateRegister,
  handleValidationErrors,
  controller.register
);

export const RegisterRoute = router;

export default router;
