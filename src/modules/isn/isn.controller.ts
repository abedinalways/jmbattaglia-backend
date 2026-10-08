import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { IsnService } from './isn.service.js';
import { QuerySlotsDto } from './dto/query-slots.dto.js';
import { CreateClientDto } from './dto/create-client.dto.js';

@ApiTags('ISN Direct')
@Controller('isn')
export class IsnController {
  constructor(private readonly isnService: IsnService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Verify ISN credentials and company connectivity',
    description: 'Pings ISN API endpoint /me with HTTP Basic Auth to confirm credentials.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'ISN company profile and status.' })
  async getMe() {
    return this.isnService.getMe();
  }

  @Get('order-types')
  @ApiOperation({ summary: 'Get ISN configured order types' })
  async getOrderTypes() {
    return this.isnService.getOrderTypes();
  }

  @Get('services')
  @ApiOperation({ summary: 'Get raw services from ISN catalogue' })
  async getServices() {
    return this.isnService.getServices();
  }

  @Get('packages')
  @ApiOperation({ summary: 'Get raw package definitions from ISN' })
  async getPackages() {
    return this.isnService.getPackages();
  }

  @Get('slots')
  @ApiOperation({
    summary: 'Get discrete 15-minute appointment slots',
    description:
      'Fetches day availability from ISN and slices inspector working hours into discrete quarter-hour bookable appointment windows.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of sliced bookable appointment slots.' })
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
  @ApiOperation({ summary: 'Search ISN for existing customer by email' })
  @ApiParam({ name: 'email', example: 'client@example.com' })
  async lookupClient(@Param('email') email: string) {
    return this.isnService.lookupClient(email);
  }

  @Post('client')
  @ApiOperation({ summary: 'Get or create client profile in ISN' })
  async createClient(@Body() body: CreateClientDto) {
    const clientId = await this.isnService.getOrCreateClient(body);
    return { id: clientId };
  }

  @Get('agent/lookup/:email')
  @ApiOperation({ summary: 'Search ISN for real estate agent by email' })
  @ApiParam({ name: 'email', example: 'agent@realty.com' })
  async lookupAgent(@Param('email') email: string) {
    return this.isnService.lookupAgent(email);
  }

  @Get('order/:id')
  @ApiOperation({ summary: 'Retrieve full order details from ISN by UUID' })
  @ApiParam({ name: 'id', description: 'ISN Order UUID or ID' })
  async getOrder(@Param('id') id: string) {
    return this.isnService.getOrder(id);
  }
}
