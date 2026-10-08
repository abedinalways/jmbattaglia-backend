import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentService } from './content.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

describe('ContentService', () => {
  let service: ContentService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      educationalMedia: {
        findMany: vi.fn().mockResolvedValue([
          { id: 'media-1', title: 'Why Radon Test', sectionKey: 'radon' },
        ]),
        findUnique: vi.fn(),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'media-1', ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'media-1', ...data })),
        delete: vi.fn().mockResolvedValue({ id: 'media-1' }),
      },
      tooltip: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tip-1', ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'tip-1', ...data })),
        delete: vi.fn().mockResolvedValue({ id: 'tip-1' }),
      },
      resourceItem: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'res-1', ...data })),
        update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'res-1', ...data })),
        delete: vi.fn().mockResolvedValue({ id: 'res-1' }),
      },
    } as unknown as PrismaService;

    service = new ContentService(prisma);
  });

  it('should return educational media items', async () => {
    const media = await service.getMedia('radon');
    expect(media.length).toBe(1);
    expect(media[0].title).toBe('Why Radon Test');
  });

  it('should throw NotFoundException when tooltip does not exist', async () => {
    vi.spyOn(prisma.tooltip, 'findUnique').mockResolvedValue(null);

    await expect(service.getTooltipByField('unknown_field')).rejects.toThrow(
      NotFoundException,
    );
  });
});
