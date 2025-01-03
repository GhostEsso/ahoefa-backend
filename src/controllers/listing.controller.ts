import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getListingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id }
    });
    if (!listing) {
      res.status(404).json({ message: 'Annonce non trouvée' });
      return;
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListingsByAgent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { userId: req.user?.id }
    });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

export const removeListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.listing.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: 'Annonce supprimée' });
  } catch (error) {
    next(error);
  }
};

export const getPublicListings = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: {
          available: true,
          user: {
            OR: [
              { role: 'AGENT' },
              { role: 'AGENT_PREMIUM' }
            ]
          }
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              isPremium: true
            }
          }
        },
        orderBy: [
          { user: { isPremium: 'desc' } },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.listing.count({
        where: {
          available: true,
          user: {
            OR: [
              { role: 'AGENT' },
              { role: 'AGENT_PREMIUM' }
            ]
          }
        }
      })
    ]);
    
    res.json({
      listings,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des propriétés" });
  }
}; 