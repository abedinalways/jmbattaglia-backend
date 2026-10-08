import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('packages')
  async getPackages() {
    return this.catalogService.getPublishedPackages();
  }

  @Get('services')
  async getServices() {
    return this.catalogService.getServicesCatalog();
  }
}
