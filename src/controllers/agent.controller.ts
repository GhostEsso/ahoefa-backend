import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export class AgentController {
  async getAllAgents(req: Request, res: Response) {
    try {
      const agents = await prisma.user.findMany({
        where: {
          role: {
            in: [UserRole.AGENT, UserRole.AGENT_PREMIUM]
          }
        },
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
          listings: {
            select: {
              id: true
            }
          }
        }
      });

      res.json(agents);
    } catch (error) {
      console.error('Erreur lors de la récupération des agents:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des agents' });
    }
  }

  async togglePremium(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isPremium } = req.body;

      const agent = await prisma.user.update({
        where: { id },
        data: {
          isPremium,
          role: isPremium ? UserRole.AGENT_PREMIUM : UserRole.AGENT
        }
      });

      res.json(agent);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut premium:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut premium' });
    }
  }

  async getPublicAgents(req: Request, res: Response) {
    try {
      const agents = await prisma.user.findMany({
        where: {
          role: {
            in: [UserRole.AGENT, UserRole.AGENT_PREMIUM]
          },
          agentStatus: "APPROVED"
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          organization: true,
          isPremium: true,
          listings: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          isPremium: 'desc'
        }
      });

      res.json(agents);
    } catch (error) {
      console.error('Erreur lors de la récupération des agents:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des agents' });
    }
  }

  async getAgentDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agent = await prisma.user.findUnique({
        where: {
          id,
          role: {
            in: [UserRole.AGENT, UserRole.AGENT_PREMIUM]
          }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          organization: true,
          isPremium: true,
          listings: {
            where: { available: true },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  isPremium: true
                }
              }
            }
          }
        }
      });

      if (!agent) {
        return res.status(404).json({ message: "Agent non trouvé" });
      }

      res.json(agent);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'agent:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des détails de l\'agent' });
    }
  }
} 