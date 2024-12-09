import { Router, RequestHandler } from 'express';
import { AgentController } from '../controllers/agent.controller';
import { authMiddleware, isSuperAdmin } from '../middlewares/auth.middleware';

const router = Router();
const agentController = new AgentController();

// Routes publiques (doivent être avant les middlewares)
router.get('/public', (agentController.getPublicAgents as RequestHandler));
router.get('/:id', (agentController.getAgentDetails as RequestHandler));

// Routes protégées
router.use(authMiddleware as RequestHandler);
router.use(isSuperAdmin as RequestHandler);
router.get('/all', (agentController.getAllAgents as RequestHandler));
router.put('/:id/premium', (agentController.togglePremium as RequestHandler));

export default router;