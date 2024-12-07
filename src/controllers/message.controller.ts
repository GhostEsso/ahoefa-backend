import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MessageInput } from '../types';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export class MessageController {
  async send(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const { content, receiverId, propertyId }: MessageInput = req.body;
      
      // Vérifier si l'agent est premium
      const agent = await prisma.user.findUnique({
        where: { id: receiverId }
      });

      if (!agent?.isPremium) {
        return res.status(403).json({ 
          error: 'Seuls les agents premium peuvent recevoir des messages' 
        });
      }

      // Créer le message
      const message = await prisma.message.create({
        data: {
          content,
          senderId: req.user.id,
          receiverId,
          propertyId
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(400).json({ error: 'Erreur lors de l\'envoi du message' });
    }
  }

  async getConversations(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
      }

      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: req.user.id },
            { receiverId: req.user.id }
          ]
        },
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          receiver: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          property: {
            select: {
              title: true,
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.json(messages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(400).json({ error: 'Erreur lors de la récupération des messages' });
    }
  }
} 