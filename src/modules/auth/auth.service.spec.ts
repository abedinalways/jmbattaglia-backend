import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockAdmin = {
    id: 'admin-uuid-1',
    email: 'admin@example.com',
    passwordHash: '$2a$10$hashedpasswordhere',
    name: 'Test Administrator',
    role: AdminRole.ADMIN,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      adminUser: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    jwtService = {
      sign: vi.fn().mockReturnValue('mocked-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return sanitized user when email and password match', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(mockAdmin);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.validateUser('admin@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result?.email).toBe('admin@example.com');
      expect((result as any)?.passwordHash).toBeUndefined();
    });

    it('should return null when admin is inactive', async () => {
      prisma.adminUser.findUnique.mockResolvedValue({ ...mockAdmin, isActive: false });

      const result = await service.validateUser('admin@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password does not match', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(mockAdmin);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      const result = await service.validateUser('admin@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when admin does not exist', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return accessToken and sanitized user on successful login', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(mockAdmin);
      prisma.adminUser.update.mockResolvedValue(mockAdmin);
      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login({
        email: 'admin@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mocked-jwt-token');
      expect(result.user.email).toBe('admin@example.com');
      expect(prisma.adminUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockAdmin.id },
        }),
      );
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'invalid@example.com',
          password: 'wrong',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createAdmin', () => {
    it('should create new admin and hash password', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(null);
      prisma.adminUser.create.mockResolvedValue(mockAdmin);
      vi.spyOn(bcrypt, 'hash').mockImplementation(async () => '$2a$10$hashedpassword');

      const result = await service.createAdmin({
        email: 'newadmin@example.com',
        password: 'SecurePassword123!',
        name: 'New Admin',
        role: AdminRole.ADMIN,
      });

      expect(result.email).toBe('admin@example.com');
      expect((result as any).passwordHash).toBeUndefined();
      expect(prisma.adminUser.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already taken', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(mockAdmin);

      await expect(
        service.createAdmin({
          email: 'admin@example.com',
          password: 'SecurePassword123!',
          name: 'Existing Admin',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('seedInitialAdmin', () => {
    it('should seed default super admin if count is 0', async () => {
      prisma.adminUser.count.mockResolvedValue(0);
      prisma.adminUser.findUnique.mockResolvedValue(null);
      prisma.adminUser.create.mockResolvedValue({
        ...mockAdmin,
        role: AdminRole.SUPER_ADMIN,
      });
      vi.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed');

      const result = await service.seedInitialAdmin();

      expect((result as any).role).toBe(AdminRole.SUPER_ADMIN);
      expect(prisma.adminUser.create).toHaveBeenCalled();
    });

    it('should skip seeding if admin already exists', async () => {
      prisma.adminUser.count.mockResolvedValue(1);

      const result = await service.seedInitialAdmin();

      expect((result as any).message).toContain('already initialized');
      expect(prisma.adminUser.create).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return sanitized user by id', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(mockAdmin);

      const result = await service.getProfile(mockAdmin.id);

      expect(result.id).toBe(mockAdmin.id);
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw NotFoundException if user not found or inactive', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
