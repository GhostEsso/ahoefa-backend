import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  next();
};