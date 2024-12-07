import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class InitService {
    static async initializeSuperAdmin() {
        try {
            const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
            const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

            if (!superAdminEmail || !superAdminPassword) {
                throw new Error('Les credentials du super admin ne sont pas définis');
            }

            const existingSuperAdmin = await prisma.user.findFirst({
                where: {
                    email: superAdminEmail,
                    role: UserRole.SUPER_ADMIN
                }
            });

            if (!existingSuperAdmin) {
                const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
                
                const superAdmin = await prisma.user.create({
                    data: {
                        email: superAdminEmail,
                        password: hashedPassword,
                        firstName: 'Super',
                        lastName: 'Admin',
                        role: UserRole.SUPER_ADMIN,
                        isVerified: true
                    }
                });

                console.log('Super Admin créé:', superAdmin.email);
            } else {
                console.log('Super Admin existe déjà');
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du Super Admin:', error);
            throw error;
        }
    }
} 