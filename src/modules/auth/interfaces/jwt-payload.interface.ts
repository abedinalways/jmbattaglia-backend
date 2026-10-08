import { AdminRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
}

export interface SanitizedAdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
