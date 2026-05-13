import { Router } from 'express';
import { AuthController } from './login.controller';
import { AuthValidator } from './auth.validator';
import { handleValidationErrors } from '@/middlewares/validation.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();
const validator = new AuthValidator();

// POST /api/v1/auth/login
router.post(
  '/', 
  validator.validateAuth, 
  handleValidationErrors, 
  controller.login
);

router.get(
    '/me', 
    authMiddleware, // 🔒 Obligatorio: Esto valida el token e inyecta req.user
    controller.getMe
);

export const LoginRoute = router;

export default router;