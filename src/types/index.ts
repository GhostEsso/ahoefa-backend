import { UserRole, AgentStatus, PropertyType, ListingType } from '@prisma/client';

export interface UserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  organization?: string;
  role?: UserRole;
  agentStatus?: AgentStatus;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  organization?: string;
  password?: string;
}

export interface ListingInput {
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  listingType: ListingType;
  location: string;
  address: string;
  images: string[];
  features: string[];
}

export interface MessageInput {
  content: string;
  receiverId: string;
  propertyId?: string;
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export { UserRole };
