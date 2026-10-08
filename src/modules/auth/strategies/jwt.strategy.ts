import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service.js';
import { JwtPayload, SanitizedAdminUser } from '../interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret', 'super-secret-jwt-key-replace-in-production'),
    });
  }

  async validate(payload: JwtPayload): Promise<SanitizedAdminUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin account is inactive or not found');
    }

    const { passwordHash: _, ...sanitized } = admin;
    return sanitized;
  }
}
