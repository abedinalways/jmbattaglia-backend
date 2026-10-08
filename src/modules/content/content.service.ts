import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import {
  CreateMediaDto,
  UpdateMediaDto,
  CreateTooltipDto,
  UpdateTooltipDto,
  CreateResourceDto,
  UpdateResourceDto,
} from './dto/content.dto.js';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getMedia(sectionKey?: string) {
    return this.prisma.educationalMedia.findMany({
      where: {
        isActive: true,
        sectionKey: sectionKey || undefined,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createMedia(dto: CreateMediaDto) {
    return this.prisma.educationalMedia.create({
      data: dto,
    });
  }

  async updateMedia(id: string, dto: UpdateMediaDto) {
    const existing = await this.prisma.educationalMedia.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    return this.prisma.educationalMedia.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMedia(id: string) {
    const existing = await this.prisma.educationalMedia.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Media with ID "${id}" not found`);
    }

    return this.prisma.educationalMedia.delete({ where: { id } });
  }

  async getTooltips(stepIndex?: number) {
    return this.prisma.tooltip.findMany({
      where: {
        isActive: true,
        stepIndex: stepIndex !== undefined ? stepIndex : undefined,
      },
      orderBy: { fieldKey: 'asc' },
    });
  }

  async getTooltipByField(fieldKey: string) {
    const tooltip = await this.prisma.tooltip.findUnique({
      where: { fieldKey },
    });
    if (!tooltip) {
      throw new NotFoundException(`Tooltip for field "${fieldKey}" not found`);
    }
    return tooltip;
  }

  async createTooltip(dto: CreateTooltipDto) {
    const existing = await this.prisma.tooltip.findUnique({
      where: { fieldKey: dto.fieldKey },
    });
    if (existing) {
      throw new ConflictException(`Tooltip for "${dto.fieldKey}" already exists`);
    }

    return this.prisma.tooltip.create({
      data: dto,
    });
  }

  async updateTooltip(id: string, dto: UpdateTooltipDto) {
    const existing = await this.prisma.tooltip.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Tooltip with ID "${id}" not found`);
    }

    return this.prisma.tooltip.update({
      where: { id },
      data: dto,
    });
  }

  async deleteTooltip(id: string) {
    const existing = await this.prisma.tooltip.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Tooltip with ID "${id}" not found`);
    }

    return this.prisma.tooltip.delete({ where: { id } });
  }

  async getResources(category?: string) {
    return this.prisma.resourceItem.findMany({
      where: {
        isActive: true,
        category: category || undefined,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createResource(dto: CreateResourceDto) {
    return this.prisma.resourceItem.create({
      data: dto,
    });
  }

  async updateResource(id: string, dto: UpdateResourceDto) {
    const existing = await this.prisma.resourceItem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Resource with ID "${id}" not found`);
    }

    return this.prisma.resourceItem.update({
      where: { id },
      data: dto,
    });
  }

  async deleteResource(id: string) {
    const existing = await this.prisma.resourceItem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Resource with ID "${id}" not found`);
    }

    return this.prisma.resourceItem.delete({ where: { id } });
  }
}
