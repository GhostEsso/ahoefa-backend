import { Router, RequestHandler } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authMiddleware, isAgent } from '../middlewares/auth.middleware';

const router = Router();
const listingController = new ListingController();

// Routes publiques (l'ordre est important!)
router.get('/public', listingController.getPublicListings);
router.get('/', listingController.getAll);
router.get('/:id', listingController.getOne as RequestHandler);

// Routes protégées
router.post('/', 
    authMiddleware as RequestHandler,
    isAgent as RequestHandler,
    listingController.create as RequestHandler
);

router.put('/:id',
    authMiddleware as RequestHandler,
    listingController.update as RequestHandler
);

router.delete('/:id',
    authMiddleware as RequestHandler,
    listingController.delete as RequestHandler
);

export default router; 