import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import {
  CreatePackageDto,
  UpdatePackageDto,
  QueryPackagesDto,
} from './dto/package.dto.js';
import { UpdateServiceDefinitionDto } from './dto/service.dto.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('packages')
  async getPackages(@Query() query: QueryPackagesDto) {
    return this.catalogService.getPublishedPackages(query);
  }

  @Get('packages/:slug')
  async getPackageBySlug(@Param('slug') slug: string) {
    return this.catalogService.getPackageBySlug(slug);
  }

  @Post('packages')
  async createPackage(@Body() body: CreatePackageDto) {
    return this.catalogService.createPackage(body);
  }

  @Put('packages/:id')
  async updatePackage(
    @Param('id') id: string,
    @Body() body: UpdatePackageDto,
  ) {
    return this.catalogService.updatePackage(id, body);
  }

  @Delete('packages/:id')
  async deletePackage(@Param('id') id: string) {
    return this.catalogService.deletePackage(id);
  }

  @Get('services')
  async getServices(@Query('onlyAddons') onlyAddons?: string) {
    const isAddonFilter =
      onlyAddons === 'true' ? true : onlyAddons === 'false' ? false : undefined;
    return this.catalogService.getServices(isAddonFilter);
  }

  @Post('services/sync-isn')
  async syncServicesFromISN() {
    return this.catalogService.syncServicesFromISN();
  }

  @Put('services/:id')
  async updateService(
    @Param('id') id: string,
    @Body() body: UpdateServiceDefinitionDto,
  ) {
    return this.catalogService.updateServiceDefinition(id, body);
  }
}
