import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from './orders.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { IsnService } from '../isn/isn.service.js';
import {
  PortalOrderSubmissionDto,
  CustomerTypeEnum,
} from './dto/order-submission.dto.js';
import { OrderSyncStatus } from '@prisma/client';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;
  let isnService: IsnService;

  beforeEach(() => {
    prisma = {
      package: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      orderAuditLog: {
        create: vi.fn().mockResolvedValue({ id: 'log-uuid-1' }),
        update: vi.fn().mockResolvedValue({ id: 'log-uuid-1' }),
        findUnique: vi.fn(),
      },
    } as unknown as PrismaService;

    isnService = {
      getOrCreateClient: vi.fn().mockResolvedValue('client-uuid-100'),
      lookupAgent: vi.fn().mockResolvedValue(null),
      createDraftOrder: vi.fn().mockResolvedValue({ id: 'isn-ord-1', oid: 1001 }),
      getOrder: vi.fn().mockResolvedValue({ totalfee: 450 }),
      scheduleOrder: vi.fn().mockResolvedValue({ status: 'ok', id: 'isn-ord-1' }),
      getServices: vi.fn().mockResolvedValue([
        { id: 'srv-1', name: 'Home Inspection', fees: [{ amount: 400 }] },
        { id: 'srv-2', name: 'Radon', fees: [{ amount: 150 }] },
      ]),
    } as unknown as IsnService;

    service = new OrdersService(prisma, isnService);
  });

  const validPayload: PortalOrderSubmissionDto = {
    customerType: CustomerTypeEnum.BUYER,
    client: {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      phone: '555-1234',
    },
    property: {
      address1: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      zip: '75001',
      squareFeet: 2500,
      yearBuilt: 2010,
    },
    appointment: {
      dateTime: '2026-10-15 09:00:00',
      inspectorId: 'insp-1',
      durationMinutes: 180,
    },
    serviceIds: ['srv-1', 'srv-2'],
  };

  it('should process full order booking pipeline and return confirmed order', async () => {
    const result = await service.submitOrder(validPayload);

    expect(result).toMatchObject({
      isnOrderId: 'isn-ord-1',
      isnOid: 1001,
      status: OrderSyncStatus.CONFIRMED,
      totalFee: 450,
    });
    expect(isnService.getOrCreateClient).toHaveBeenCalled();
    expect(isnService.createDraftOrder).toHaveBeenCalled();
    expect(isnService.scheduleOrder).toHaveBeenCalled();
    expect(prisma.orderAuditLog.create).toHaveBeenCalled();
    expect(prisma.orderAuditLog.update).toHaveBeenCalled();
  });

  it('should mark audit log as FAILED if ISN draft creation fails', async () => {
    vi.spyOn(isnService, 'createDraftOrder').mockRejectedValue(
      new Error('ISN network timeout'),
    );

    await expect(service.submitOrder(validPayload)).rejects.toThrow();

    expect(prisma.orderAuditLog.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: OrderSyncStatus.FAILED }),
      }),
    );
  });

  it('should calculate estimated quote based on selected services', async () => {
    const quote = await service.calculateQuote({
      zip: '75001',
      serviceIds: ['srv-1', 'srv-2'],
    });

    expect(quote.totalEstimatedFee).toBe(550);
    expect(quote.servicesCount).toBe(2);
  });
});
