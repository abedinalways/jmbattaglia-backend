import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { SubmitOrderDto } from './dto/submit-order.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('submit')
  async submit(@Body() payload: SubmitOrderDto) {
    return this.ordersService.submitOrder(payload);
  }
}
