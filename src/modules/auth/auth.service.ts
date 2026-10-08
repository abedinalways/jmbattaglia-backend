import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import {
  JwtPayload,
  SanitizedAdminUser,
} from './interfaces/jwt-payload.interface.js';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<SanitizedAdminUser | null> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) {
      return null;
    }

    const { passwordHash: _, ...sanitized } = admin;
    return sanitized;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: SanitizedAdminUser }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
  }

  async createAdmin(dto: CreateAdminDto): Promise<SanitizedAdminUser> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Admin with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const admin = await this.prisma.adminUser.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: dto.name,
        role: dto.role ?? AdminRole.ADMIN,
      },
    });

    const { passwordHash: _, ...sanitized } = admin;
    return sanitized;
  }

  async seedInitialAdmin(
    dto?: CreateAdminDto,
  ): Promise<SanitizedAdminUser | { message: string }> {
    const count = await this.prisma.adminUser.count();
    if (count > 0) {
      return { message: 'Admin users already initialized' };
    }

    const defaultAdmin: CreateAdminDto = dto ?? {
      email: 'admin@jmbattaglia.com',
      password: 'AdminPassword123!',
      name: 'Super Administrator',
      role: AdminRole.SUPER_ADMIN,
    };

    this.logger.log(`Seeding initial super admin: ${defaultAdmin.email}`);
    return this.createAdmin(defaultAdmin);
  }

  async getProfile(userId: string): Promise<SanitizedAdminUser> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!admin || !admin.isActive) {
      throw new NotFoundException('Admin user not found or inactive');
    }

    const { passwordHash: _, ...sanitized } = admin;
    return sanitized;
  }
}
