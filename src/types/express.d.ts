import { UserRole } from './enums';

interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    isPremium: boolean;
    lastPostReset?: Date;
}

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export interface AuthRequest extends Request {
    user: User;
} 