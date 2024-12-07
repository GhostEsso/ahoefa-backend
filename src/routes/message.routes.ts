import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const messageController = new MessageController();

router.use(authMiddleware);

router.post('/send', messageController.send);
router.get('/conversations', messageController.getConversations);

export default router; 