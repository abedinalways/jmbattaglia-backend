import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAdmin(username: string, pass: string): Promise<any> {
    return null;
  }

  async login(credentials: { email: string; pass: string }) {
    if (!credentials.email) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      accessToken: 'dummy-token-until-jwt-setup',
    };
  }
}
