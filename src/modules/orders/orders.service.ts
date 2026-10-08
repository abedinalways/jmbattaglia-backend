import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { IsnService } from '../isn/isn.service.js';
import { IsnOrderPayload } from '../isn/interfaces/isn.interface.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly isnService: IsnService,
  ) {}

  async submitOrder(payload: IsnOrderPayload) {
    this.logger.log(`Processing order submission for: ${payload.address1}`);
    return this.isnService.createDraftOrder(payload);
  }
}
