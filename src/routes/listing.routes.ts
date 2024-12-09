import express from 'express';
import { getListingById, getListingsByAgent, removeListing, getPublicListings } from '../controllers/listing.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/listings/:id', isAuthenticated, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const result = await getListingById(req, res, next);
  return result;
});
router.get('/agent/listings', isAuthenticated, getListingsByAgent);
router.delete('/listings/:id', isAuthenticated, removeListing);
router.get('/public', getPublicListings);

export default router;