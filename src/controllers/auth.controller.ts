import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthController {
    loginSuperAdmin = async (req: Request, res: Response): Promise<void> => {
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

            res.status(200).json({
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
    };
} 