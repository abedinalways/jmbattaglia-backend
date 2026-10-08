import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { IsnService } from './isn.service.js';
import { QuerySlotsDto } from './dto/query-slots.dto.js';
import { CreateClientDto } from './dto/create-client.dto.js';

@Controller('isn')
export class IsnController {
  constructor(private readonly isnService: IsnService) {}

  @Get('me')
  async getMe() {
    return this.isnService.getMe();
  }

  @Get('order-types')
  async getOrderTypes() {
    return this.isnService.getOrderTypes();
  }

  @Get('services')
  async getServices() {
    return this.isnService.getServices();
  }

  @Get('packages')
  async getPackages() {
    return this.isnService.getPackages();
  }

  @Get('slots')
  async getSlots(@Query() query: QuerySlotsDto) {
    const serviceList = Array.isArray(query.services)
      ? query.services
      : query.services
        ? query.services.split(',')
        : [];

    return this.isnService.getBookableSlots(
      query.zip,
      serviceList,
      query.daysahead ?? 7,
      query.durationMinutes ?? 180,
    );
  }

  @Get('client/lookup/:email')
  async lookupClient(@Param('email') email: string) {
    return this.isnService.lookupClient(email);
  }

  @Post('client')
  async createClient(@Body() body: CreateClientDto) {
    const clientId = await this.isnService.getOrCreateClient(body);
    return { id: clientId };
  }

  @Get('agent/lookup/:email')
  async lookupAgent(@Param('email') email: string) {
    return this.isnService.lookupAgent(email);
  }

  @Get('order/:id')
  async getOrder(@Param('id') id: string) {
    return this.isnService.getOrder(id);
  }
}
