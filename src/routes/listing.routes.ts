import express from 'express';
import { getListingById, getListingsByAgent, removeListing, getPublicListings } from '../controllers/listing.controller';
import { isAuthenticated, isAgent } from '../middlewares/auth.middleware';
import { prisma } from '../prismaClient';

const router = express.Router();

router.post('/', isAuthenticated, isAgent, async (req: express.Request, res: express.Response) => {
  try {
    console.log('User:', req.user); // Debug
    console.log('Request body:', req.body); // Debug

    const listing = await prisma.listing.create({
      data: {
        ...req.body,
        userId: req.user?.id,
        available: true
      }
    });
    
    res.status(201).json(listing);
  } catch (error) {
    console.error('Erreur création annonce:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'annonce' });
  }
});

router.get('/public', getPublicListings);
router.get('/listings/:id', isAuthenticated, getListingById);
router.get('/agent/listings', isAuthenticated, getListingsByAgent);
router.delete('/listings/:id', isAuthenticated, removeListing);

export default router;