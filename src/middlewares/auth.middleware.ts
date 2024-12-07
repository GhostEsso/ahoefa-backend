import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole, User as PrismaUser } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    user?: PrismaUser;
}

interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}

type CustomRequestHandler = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

export const authMiddleware: CustomRequestHandler = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            res.status(401).json({ message: 'Token manquant' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            res.status(401).json({ message: 'Utilisateur non trouvé' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
        return;
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
        if (req.user?.role !== UserRole.AGENT && 
            req.user?.role !== UserRole.ADMIN && 
            req.user?.role !== UserRole.SUPER_ADMIN) {
            res.status(403).json({ message: 'Accès refusé. Rôle agent requis.' });
            return;
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
        return;
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
