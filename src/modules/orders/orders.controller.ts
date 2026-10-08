import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import {
  PortalOrderSubmissionDto,
  CalculateQuoteDto,
} from './dto/order-submission.dto.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('submit')
  @ApiOperation({
    summary: 'Submit inspection order',
    description:
      'Orchestrates complete order submission: validates client, stores audit record, creates draft in ISN, verifies quote, and finalizes schedule in ISN.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order successfully created and scheduled in ISN.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid order input or missing required service details.',
  })
  async submit(@Body() payload: PortalOrderSubmissionDto) {
    return this.ordersService.submitOrder(payload);
  }

  @Post('quote')
  @ApiOperation({
    summary: 'Calculate dynamic inspection quote',
    description:
      'Computes live estimate based on selected package, square footage, ancillary services, and foundation.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Quote successfully computed.',
  })
  async calculateQuote(@Body() payload: CalculateQuoteDto) {
    return this.ordersService.calculateQuote(payload);
  }

  @Get('lookup/:orderNumber')
  @ApiOperation({
    summary: 'Lookup order by tracking number',
    description: 'Retrieves audit status and details by custom tracking number (e.g. JMB-xxxxxx).',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Custom order reference number (e.g., JMB-ABC12345)',
    example: 'JMB-MUZCFIR9-9848',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order details found.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found with provided tracking number.',
  })
  async lookupOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }
}
