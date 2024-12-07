import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { RequestHandler } from 'express';

const router = Router();
const userController = new UserController();

router.post('/register', userController.create.bind(userController) as RequestHandler);
router.get('/profile', authMiddleware as RequestHandler, userController.getProfile.bind(userController) as RequestHandler);
router.put('/profile', authMiddleware as RequestHandler, userController.updateProfile.bind(userController) as RequestHandler);

export default router; 