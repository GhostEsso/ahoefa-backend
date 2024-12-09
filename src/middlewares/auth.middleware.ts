import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';

type CustomRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

interface JwtPayload {
  userId: string;
}

interface AuthRequest extends Request {
  user?: User;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token manquant' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (!decoded) {
      res.status(401).json({ message: 'Token invalide' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin: CustomRequestHandler = async (req, res, next) => {
    try {
        if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
            res.status(403).json({ message: 'Accès refusé' });
            return;
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
        return;
    }
};

export const isAgent: CustomRequestHandler = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }

        if (req.user.role !== UserRole.AGENT && 
            req.user.role !== UserRole.AGENT_PREMIUM) {
            res.status(403).json({ 
                message: 'Accès refusé. Seuls les agents peuvent créer des annonces.' 
            });
            return;
        }

        const agent = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (agent?.agentStatus !== 'APPROVED') {
            res.status(403).json({ 
                message: 'Votre compte agent doit être approuvé pour créer des annonces.' 
            });
            return;
        }

        next();
    } catch (error) {
        console.error('Erreur middleware isAgent:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const isSuperAdmin: CustomRequestHandler = async (req, res, next) => {
    try {
        if (req.user?.role !== UserRole.SUPER_ADMIN) {
            res.status(403).json({ message: 'Accès refusé. Rôle super admin requis.' });
            return;
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
        return;
    }
};

export const canDeleteListing: CustomRequestHandler = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Non authentifié' });
            return;
        }

        const listingId = req.params.id; // Assurez-vous que l'ID de l'annonce est dans les paramètres
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: { user: true } // Inclure l'utilisateur qui a créé l'annonce
        });

        if (!listing) {
            res.status(404).json({ message: 'Annonce non trouvée' });
            return;
        }

        if (listing.userId !== req.user.id) {
            res.status(403).json({ message: 'Accès refusé. Vous ne pouvez supprimer que vos propres annonces.' });
            return;
        }

        next();
    } catch (error) {
        console.error('Erreur middleware canDeleteListing:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

export const isAuthenticated: CustomRequestHandler = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
    }
    next();
};
