import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { IsnService } from '../isn/isn.service.js';
import {
  CreatePackageDto,
  UpdatePackageDto,
  QueryPackagesDto,
} from './dto/package.dto.js';
import { UpdateServiceDefinitionDto } from './dto/service.dto.js';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly isnService: IsnService,
  ) {}

  async getPublishedPackages(query?: QueryPackagesDto) {
    const whereClause: any = { isActive: true };

    if (query?.targetAudience) {
      whereClause.targetAudience = {
        in: [query.targetAudience, 'ALL'],
      };
    }

    if (query?.isFeatured !== undefined) {
      whereClause.isFeatured = query.isFeatured;
    }

    return this.prisma.package.findMany({
      where: whereClause,
      orderBy: { displayOrder: 'asc' },
      include: {
        services: {
          orderBy: { displayOrder: 'asc' },
          include: {
            service: true,
          },
        },
        features: {
          orderBy: { displayOrder: 'asc' },
        },
        recommendedAddons: {
          orderBy: { displayOrder: 'asc' },
          include: {
            addonService: true,
          },
        },
      },
    });
  }

  async getPackageBySlug(slug: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { slug },
      include: {
        services: {
          orderBy: { displayOrder: 'asc' },
          include: {
            service: true,
          },
        },
        features: {
          orderBy: { displayOrder: 'asc' },
        },
        recommendedAddons: {
          orderBy: { displayOrder: 'asc' },
          include: {
            addonService: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with slug "${slug}" not found`);
    }

    return pkg;
  }

  async createPackage(dto: CreatePackageDto) {
    const existing = await this.prisma.package.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Package slug "${dto.slug}" already exists`);
    }

    return this.prisma.package.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        shortDescription: dto.shortDescription,
        detailedDescription: dto.detailedDescription,
        badge: dto.badge,
        displayOrder: dto.displayOrder ?? 0,
        isFeatured: dto.isFeatured ?? false,
        coverImageUrl: dto.coverImageUrl,
        targetAudience: dto.targetAudience ?? 'ALL',
        isnPackageId: dto.isnPackageId,
        services: {
          create: dto.serviceIds.map((serviceId, index) => ({
            serviceId,
            displayOrder: index,
          })),
        },
        features: dto.features
          ? {
              create: dto.features.map((feat, index) => ({
                title: feat.title,
                description: feat.description,
                displayOrder: feat.displayOrder ?? index,
              })),
            }
          : undefined,
        recommendedAddons: dto.recommendedAddons
          ? {
              create: dto.recommendedAddons.map((rec, index) => ({
                addonServiceId: rec.addonServiceId,
                pitchText: rec.pitchText,
                displayOrder: rec.displayOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        services: { include: { service: true } },
        features: true,
        recommendedAddons: { include: { addonService: true } },
      },
    });
  }

  async updatePackage(id: string, dto: UpdatePackageDto) {
    const existing = await this.prisma.package.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Package with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugConflict = await this.prisma.package.findUnique({
        where: { slug: dto.slug },
      });
      if (slugConflict) {
        throw new ConflictException(`Package slug "${dto.slug}" already in use`);
      }
    }

    if (dto.serviceIds) {
      await this.prisma.packageService.deleteMany({
        where: { packageId: id },
      });
    }

    if (dto.features) {
      await this.prisma.packageFeature.deleteMany({
        where: { packageId: id },
      });
    }

    if (dto.recommendedAddons) {
      await this.prisma.packageAddonRecommendation.deleteMany({
        where: { packageId: id },
      });
    }

    return this.prisma.package.update({
      where: { id },
      data: {
        slug: dto.slug,
        name: dto.name,
        shortDescription: dto.shortDescription,
        detailedDescription: dto.detailedDescription,
        badge: dto.badge,
        displayOrder: dto.displayOrder,
        isFeatured: dto.isFeatured,
        isActive: dto.isActive,
        coverImageUrl: dto.coverImageUrl,
        targetAudience: dto.targetAudience,
        isnPackageId: dto.isnPackageId,
        services: dto.serviceIds
          ? {
              create: dto.serviceIds.map((serviceId, index) => ({
                serviceId,
                displayOrder: index,
              })),
            }
          : undefined,
        features: dto.features
          ? {
              create: dto.features.map((feat, index) => ({
                title: feat.title,
                description: feat.description,
                displayOrder: feat.displayOrder ?? index,
              })),
            }
          : undefined,
        recommendedAddons: dto.recommendedAddons
          ? {
              create: dto.recommendedAddons.map((rec, index) => ({
                addonServiceId: rec.addonServiceId,
                pitchText: rec.pitchText,
                displayOrder: rec.displayOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        services: { include: { service: true } },
        features: true,
        recommendedAddons: { include: { addonService: true } },
      },
    });
  }

  async deletePackage(id: string) {
    const existing = await this.prisma.package.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Package with ID "${id}" not found`);
    }

    return this.prisma.package.delete({ where: { id } });
  }

  async syncServicesFromISN() {
    this.logger.log('Syncing service definitions from ISN catalogue...');
    const isnServices = await this.isnService.getServices();

    const synced: any[] = [];
    for (const [index, srv] of isnServices.entries()) {
      const upserted = await this.prisma.serviceDefinition.upsert({
        where: { isnServiceId: srv.id },
        update: {
          name: srv.name,
          isAddon: srv.ancillary === 'Yes',
        },
        create: {
          isnServiceId: srv.id,
          name: srv.name,
          shortDescription: srv.description,
          isAddon: srv.ancillary === 'Yes',
          displayOrder: index,
        },
      });
      synced.push(upserted);
    }

    this.logger.log(`Synced ${synced.length} services from ISN successfully.`);
    return {
      syncedCount: synced.length,
      services: synced,
    };
  }

  async getServices(onlyAddons?: boolean) {
    return this.prisma.serviceDefinition.findMany({
      where: {
        isActive: true,
        isAddon: onlyAddons !== undefined ? onlyAddons : undefined,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async updateServiceDefinition(id: string, dto: UpdateServiceDefinitionDto) {
    const existing = await this.prisma.serviceDefinition.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Service definition with ID "${id}" not found`);
    }

    return this.prisma.serviceDefinition.update({
      where: { id },
      data: dto,
    });
  }
}
