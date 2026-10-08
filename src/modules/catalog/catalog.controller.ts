import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CatalogService } from './catalog.service.js';
import {
  CreatePackageDto,
  UpdatePackageDto,
  QueryPackagesDto,
} from './dto/package.dto.js';
import { UpdateServiceDefinitionDto } from './dto/service.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('packages')
  @ApiOperation({
    summary: 'Get published inspection packages',
    description: 'Retrieves all active packages with included services, features, and add-on recommendations.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of packages.' })
  async getPackages(@Query() query: QueryPackagesDto) {
    return this.catalogService.getPublishedPackages(query);
  }

  @Get('packages/:slug')
  @ApiOperation({
    summary: 'Get package by slug',
    description: 'Fetches detailed information for a single inspection package by slug.',
  })
  @ApiParam({ name: 'slug', example: 'comprehensive-premier-bundle' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Package details.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Package not found.' })
  async getPackageBySlug(@Param('slug') slug: string) {
    return this.catalogService.getPackageBySlug(slug);
  }

  @Post('packages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new inspection package (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Package created.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'JWT authentication required.' })
  async createPackage(@Body() body: CreatePackageDto) {
    return this.catalogService.createPackage(body);
  }

  @Put('packages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update existing inspection package (Admin)' })
  @ApiParam({ name: 'id', description: 'Package UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Package updated.' })
  async updatePackage(
    @Param('id') id: string,
    @Body() body: UpdatePackageDto,
  ) {
    return this.catalogService.updatePackage(id, body);
  }

  @Delete('packages/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete inspection package (Admin)' })
  @ApiParam({ name: 'id', description: 'Package UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Package deleted.' })
  async deletePackage(@Param('id') id: string) {
    return this.catalogService.deletePackage(id);
  }

  @Get('services')
  @ApiOperation({
    summary: 'Get service definitions catalogue',
    description: 'Retrieves all available services, optionally filtered by add-on status.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of service definitions.' })
  async getServices(@Query('onlyAddons') onlyAddons?: string) {
    const isAddonFilter =
      onlyAddons === 'true' ? true : onlyAddons === 'false' ? false : undefined;
    return this.catalogService.getServices(isAddonFilter);
  }

  @Post('services/sync-isn')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Sync service catalogue from ISN (Admin)',
    description: 'Fetches active services from ISN REST API and upserts into PostgreSQL database.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Synchronization summary.' })
  async syncServicesFromISN() {
    return this.catalogService.syncServicesFromISN();
  }

  @Put('services/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update service definition content (Admin)' })
  @ApiParam({ name: 'id', description: 'Service Definition UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service updated.' })
  async updateService(
    @Param('id') id: string,
    @Body() body: UpdateServiceDefinitionDto,
  ) {
    return this.catalogService.updateServiceDefinition(id, body);
  }
}
