import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const prisma = new PrismaClient();
const authController = new AuthController();

// Route pour l'inscription
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'Cet email est déjà utilisé' });
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        role: UserRole.USER,
        isVerified: false
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

    res.status(201).json({ message: 'Inscription réussie', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Route pour la connexion
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Route pour la connexion super admin
router.post('/superadmin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const superAdmin = await prisma.user.findFirst({
      where: {
        email,
        role: UserRole.SUPER_ADMIN
      }
    });

    if (!superAdmin) {
      res.status(401).json({ message: "Accès non autorisé" });
      return;
    }

    const validPassword = await bcrypt.compare(password, superAdmin.password);
    if (!validPassword) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    const token = jwt.sign(
      { 
        id: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role,
        name: `${superAdmin.firstName} ${superAdmin.lastName}`
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role,
        name: `${superAdmin.firstName} ${superAdmin.lastName}`
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
});

export default router; 