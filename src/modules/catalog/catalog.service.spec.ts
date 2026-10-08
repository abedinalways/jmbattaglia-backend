import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CatalogService } from './catalog.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { IsnService } from '../isn/isn.service.js';
import { ConflictException } from '@nestjs/common';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: PrismaService;
  let isnService: IsnService;

  beforeEach(() => {
    prisma = {
      package: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'pkg-1', slug: 'standard-home', name: 'Standard Home' },
        ]),
        findUnique: vi.fn(),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'pkg-1', ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'pkg-1', ...data })),
        delete: vi.fn().mockResolvedValue({ id: 'pkg-1' }),
      },
      serviceDefinition: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        upsert: vi.fn().mockImplementation(({ create }) => Promise.resolve({ id: 'srv-def-1', ...create })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'srv-def-1', ...data })),
      },
    } as unknown as PrismaService;

    isnService = {
      getServices: vi.fn().mockResolvedValue([
        { id: 'isn-srv-1', name: 'Structural Review', ancillary: 'No' },
        { id: 'isn-srv-2', name: 'Radon Testing', ancillary: 'Yes' },
      ]),
    } as unknown as IsnService;

    service = new CatalogService(prisma, isnService);
  });

  it('should return published packages', async () => {
    const packages = await service.getPublishedPackages();
    expect(packages.length).toBe(1);
    expect(packages[0].slug).toBe('standard-home');
  });

  it('should throw ConflictException when creating a package with existing slug', async () => {
    vi.spyOn(prisma.package, 'findUnique').mockResolvedValue({ id: 'existing-id' } as any);

    await expect(
      service.createPackage({
        slug: 'standard-home',
        name: 'Standard Home',
        shortDescription: 'Basic home review',
        serviceIds: ['srv-1'],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should sync services from ISN and upsert into service definitions', async () => {
    const result = await service.syncServicesFromISN();

    expect(result.syncedCount).toBe(2);
    expect(prisma.serviceDefinition.upsert).toHaveBeenCalledTimes(2);
  });
});
