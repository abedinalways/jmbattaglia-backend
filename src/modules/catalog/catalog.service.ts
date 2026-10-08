import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { IsnService } from '../isn/isn.service.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly isnService: IsnService,
  ) {}

  async getPublishedPackages() {
    return {
      packages: [],
    };
  }

  async getServicesCatalog() {
    return this.isnService.getServices();
  }
}
