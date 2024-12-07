import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserInput, UpdateUserInput } from '../types';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const userData: UserInput = req.body;
      
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        }
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          organization: true,
          role: true,
          agentStatus: true,
          isPremium: true,
          createdAt: true,
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const updateData: UpdateUserInput = req.body;

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          organization: true,
          role: true,
          agentStatus: true,
          isPremium: true,
          createdAt: true,
        }
      });

      res.json(user);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
    }
  }
} 