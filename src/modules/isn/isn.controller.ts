import { Controller, Get, Query } from '@nestjs/common';
import { IsnService } from './isn.service.js';

@Controller('isn')
export class IsnController {
  constructor(private readonly isnService: IsnService) {}

  @Get('services')
  async getServices() {
    return this.isnService.getServices();
  }

  @Get('packages')
  async getPackages() {
    return this.isnService.getPackages();
  }

  @Get('slots')
  async getSlots(
    @Query('zip') zip: string,
    @Query('services') services: string | string[],
    @Query('daysahead') daysAhead?: number,
  ) {
    const serviceList = Array.isArray(services)
      ? services
      : services
        ? services.split(',')
        : [];
    return this.isnService.getAvailableSlots(
      zip,
      serviceList,
      daysAhead ? Number(daysAhead) : 7,
    );
  }
}
