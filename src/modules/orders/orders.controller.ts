import {
  Controller,
  Post,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import {
  PortalOrderSubmissionDto,
  CalculateQuoteDto,
} from './dto/order-submission.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('submit')
  async submit(@Body() payload: PortalOrderSubmissionDto) {
    return this.ordersService.submitOrder(payload);
  }

  @Post('quote')
  async calculateQuote(@Body() payload: CalculateQuoteDto) {
    return this.ordersService.calculateQuote(payload);
  }

  @Get('lookup/:orderNumber')
  async lookupOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }
}
