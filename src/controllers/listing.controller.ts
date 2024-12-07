import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { ListingInput } from '../types';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UploadService } from '../services/upload.service';
import multer from 'multer';

const prisma = new PrismaClient();

// Configuration de multer pour le stockage temporaire des fichiers
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
  }
});

export class ListingController {
  private async checkMonthlyPostLimit(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return false;

    if (user.role === UserRole.AGENT_PREMIUM) return true;

    if (user.lastPostReset) {
      const lastReset = new Date(user.lastPostReset);
      const now = new Date();
      if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            monthlyPosts: 0,
            lastPostReset: now
          }
        });
        return true;
      }
    }

    return user.monthlyPosts < 4;
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const uploadMiddleware = upload.array('images', 10);

      uploadMiddleware(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        const files = req.files as Express.Multer.File[];
        const listingData = JSON.parse(req.body.data);

        // Upload des images vers Cloudinary
        const imageUrls = await Promise.all(
          files.map(file => UploadService.uploadImage(file))
        );

        // Création de l'annonce avec les URLs des images
        const listing = await prisma.listing.create({
          data: {
            ...listingData,
            images: imageUrls,
            userId: req.user!.id
          }
        });

        res.status(201).json(listing);
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      res.status(500).json({ error: 'Erreur lors de la création de l\'annonce' });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { type, listingType, minPrice, maxPrice, location } = req.query;
      
      const filters: any = {};
      
      if (type) filters.type = type;
      if (listingType) filters.listingType = listingType;
      if (location) filters.location = { contains: location, mode: 'insensitive' };
      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.gte = parseFloat(minPrice as string);
        if (maxPrice) filters.price.lte = parseFloat(maxPrice as string);
      }

      const listings = await prisma.listing.findMany({
        where: filters,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(listings);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la récupération des annonces' });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
              isPremium: true
            }
          }
        }
      });
      
      if (!listing) {
        return res.status(404).json({ error: 'Annonce non trouvée' });
      }
      
      res.json(listing);
    } catch (error) {
      res.status(400).json({ error: 'Erreur lors de la récupération de l\'annonce' });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const uploadMiddleware = upload.array('images', 10);

      uploadMiddleware(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        const files = req.files as Express.Multer.File[];
        const listingData = JSON.parse(req.body.data);

        // Récupérer l'annonce existante
        const existingListing = await prisma.listing.findUnique({
          where: { id }
        });

        if (!existingListing) {
          return res.status(404).json({ error: 'Annonce non trouvée' });
        }

        // Vérifier les permissions
        if (existingListing.userId !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
          return res.status(403).json({ error: 'Non autoris��' });
        }

        // Upload des nouvelles images si présentes
        let imageUrls = existingListing.images;
        if (files.length > 0) {
          const newImageUrls = await Promise.all(
            files.map(file => UploadService.uploadImage(file))
          );
          imageUrls = [...imageUrls, ...newImageUrls];
        }

        // Mise à jour de l'annonce
        const updatedListing = await prisma.listing.update({
          where: { id },
          data: {
            ...listingData,
            images: imageUrls
          }
        });

        res.json(updatedListing);
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'annonce:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'annonce' });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const listing = await prisma.listing.findUnique({
        where: { id }
      });

      if (!listing) {
        return res.status(404).json({ error: 'Annonce non trouvée' });
      }

      if (listing.userId !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Non autorisé' });
      }

      // Supprimer les images de Cloudinary
      await Promise.all(
        listing.images.map(async (imageUrl) => {
          const publicId = imageUrl.split('/').pop()?.split('.')[0];
          if (publicId) {
            await UploadService.deleteImage(`properties/${publicId}`);
          }
        })
      );

      // Supprimer l'annonce
      await prisma.listing.delete({
        where: { id }
      });

      res.json({ message: 'Annonce supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'annonce:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'annonce' });
    }
  }

  async getPublicListings(req: Request, res: Response) {
    try {
      console.log('Fetching public listings...');
      
      const listings = await prisma.listing.findMany({
        where: {
          available: true,
          user: {
            OR: [
              { role: UserRole.AGENT },
              { role: UserRole.AGENT_PREMIUM }
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
          {
            user: {
              isPremium: 'desc'
            }
          },
          {
            createdAt: 'desc'
          }
        ]
      });

      console.log('Found listings:', listings.length);
      res.json(listings);
    } catch (error) {
      console.error('Erreur lors de la récupération des propriétés:', error);
      res.status(500).json({ message: "Erreur lors de la récupération des propriétés" });
    }
  }
} 