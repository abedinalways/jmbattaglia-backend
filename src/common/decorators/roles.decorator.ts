import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '../enums/admin-role.enum.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
