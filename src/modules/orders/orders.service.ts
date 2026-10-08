import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { IsnService } from '../isn/isn.service.js';
import {
  PortalOrderSubmissionDto,
  CalculateQuoteDto,
} from './dto/order-submission.dto.js';
import { IsnOrderPayload } from '../isn/interfaces/isn.interface.js';
import { OrderSyncStatus, CustomerType } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly isnService: IsnService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `JMB-${timestamp}-${random}`;
  }

  private formatCurrentTime(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  async submitOrder(dto: PortalOrderSubmissionDto) {
    const orderNumber = this.generateOrderNumber();
    this.logger.log(`Initiating order booking [${orderNumber}] for: ${dto.client.email}`);

    const uniqueServices = Array.from(new Set(dto.serviceIds));
    let auditLogId: string | null = null;

    try {
      const clientUuid = await this.isnService.getOrCreateClient({
        firstname: dto.client.firstName.trim(),
        lastname: dto.client.lastName.trim(),
        emailaddress: dto.client.email.trim().toLowerCase(),
        mobilephone: dto.client.phone.trim(),
      });

      let buyersAgentUuid: string | undefined;
      const notesList: Array<{ text: string }> = [];

      if (dto.notes?.trim()) {
        notesList.push({ text: dto.notes.trim() });
      }

      if (dto.agent?.email) {
        const agent = await this.isnService.lookupAgent(dto.agent.email);
        if (agent?.id) {
          buyersAgentUuid = agent.id;
        } else {
          notesList.push({
            text: `Realtor details: ${dto.agent.name || ''} (${dto.agent.email}, Phone: ${dto.agent.phone || 'N/A'}, Agency: ${dto.agent.agency || 'N/A'})`,
          });
        }
      }

      let isnPackages: Array<{ package: string }> | undefined;
      if (dto.packageId) {
        try {
          const pkg = await this.prisma.package.findUnique({
            where: { id: dto.packageId },
          });
          if (pkg?.isnPackageId) {
            isnPackages = [{ package: pkg.isnPackageId }];
          }
        } catch {
          this.logger.warn(`Could not lookup local package: ${dto.packageId}`);
        }
      }

      const orderLog = await this.prisma.orderAuditLog.create({
        data: {
          orderNumber,
          status: OrderSyncStatus.PENDING,
          customerType: (dto.customerType as CustomerType) ?? CustomerType.BUYER,
          clientName: `${dto.client.firstName} ${dto.client.lastName}`.trim(),
          clientEmail: dto.client.email.trim().toLowerCase(),
          clientPhone: dto.client.phone.trim(),
          agentName: dto.agent?.name ?? null,
          agentEmail: dto.agent?.email ?? null,
          agentPhone: dto.agent?.phone ?? null,
          propertyAddress: dto.property.address1.trim(),
          city: dto.property.city.trim(),
          state: dto.property.state.trim(),
          zip: dto.property.zip.trim(),
          squareFeet: dto.property.squareFeet ?? null,
          yearBuilt: dto.property.yearBuilt ?? null,
          scheduledDateTime: new Date(dto.appointment.dateTime),
          estimatedDuration: dto.appointment.durationMinutes ?? 180,
          inspectorUuid: dto.appointment.inspectorId,
          inspectorName: dto.appointment.inspectorName ?? null,
          packageId: dto.packageId ?? null,
          selectedServices: uniqueServices,
        },
      });
      auditLogId = orderLog.id;

      const isnPayload: IsnOrderPayload = {
        address1: dto.property.address1.trim(),
        city: dto.property.city.trim(),
        state: dto.property.state.trim(),
        zip: dto.property.zip.trim(),
        squarefeet: dto.property.squareFeet,
        yearbuilt: dto.property.yearBuilt,
        datetime: dto.appointment.dateTime,
        duration: dto.appointment.durationMinutes ?? 180,
        inspector1uuid: dto.appointment.inspectorId,
        services: uniqueServices,
        packages: isnPackages,
        clientuuid: clientUuid,
        buyersagentuuid: buyersAgentUuid,
        sendemailevents: dto.testMode ? false : true,
        sendsmsevents: dto.testMode ? false : true,
        notes: notesList.length > 0 ? notesList : undefined,
      };

      const draftOrder = await this.isnService.createDraftOrder(isnPayload);
      this.logger.log(`ISN Draft order created [ID: ${draftOrder.id}, OID: ${draftOrder.oid}]`);

      await this.prisma.orderAuditLog.update({
        where: { id: auditLogId },
        data: {
          isnOrderId: draftOrder.id,
          isnOid: draftOrder.oid,
          status: OrderSyncStatus.DRAFT_CREATED,
          isnRequestPayload: isnPayload as any,
        },
      });

      let totalFee: number | null = null;
      try {
        const orderDetails = await this.isnService.getOrder(draftOrder.id);
        if (orderDetails?.totalfee !== undefined) {
          totalFee = orderDetails.totalfee;
        }
      } catch (err) {
        this.logger.warn(`Could not verify order details after draft creation: ${err}`);
      }

      await this.isnService.scheduleOrder(draftOrder.id, this.formatCurrentTime());
      this.logger.log(`ISN Order scheduled successfully: ${draftOrder.id}`);

      await this.prisma.orderAuditLog.update({
        where: { id: auditLogId },
        data: {
          status: OrderSyncStatus.CONFIRMED,
          calculatedQuote: totalFee !== null ? totalFee : undefined,
        },
      });

      return {
        orderNumber,
        isnOrderId: draftOrder.id,
        isnOid: draftOrder.oid,
        status: OrderSyncStatus.CONFIRMED,
        totalFee,
        scheduledDateTime: dto.appointment.dateTime,
        client: {
          name: `${dto.client.firstName} ${dto.client.lastName}`.trim(),
          email: dto.client.email,
        },
        property: {
          address: `${dto.property.address1}, ${dto.property.city}, ${dto.property.state} ${dto.property.zip}`,
        },
      };
    } catch (error: any) {
      this.logger.error(`Order booking failure for [${orderNumber}]`, error);

      if (auditLogId) {
        await this.prisma.orderAuditLog.update({
          where: { id: auditLogId },
          data: {
            status: OrderSyncStatus.FAILED,
            failureReason: error?.message || String(error),
          },
        });
      }

      throw new HttpException(
        error?.message || 'Order booking failed',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculateQuote(dto: CalculateQuoteDto) {
    const allServices = await this.isnService.getServices();
    const serviceMap = new Map(allServices.map((s) => [s.id, s]));

    let totalAmount = 0;
    const servicesBreakdown: Array<{ id: string; name: string; amount: number }> = [];

    for (const serviceId of dto.serviceIds) {
      const srv = serviceMap.get(serviceId);
      if (srv) {
        const defaultFee = srv.fees?.[0]?.amount ?? 0;
        totalAmount += defaultFee;
        servicesBreakdown.push({
          id: srv.id,
          name: srv.name,
          amount: defaultFee,
        });
      }
    }

    return {
      zip: dto.zip,
      totalEstimatedFee: totalAmount,
      servicesCount: servicesBreakdown.length,
      services: servicesBreakdown,
    };
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.prisma.orderAuditLog.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      throw new NotFoundException(`Order with reference ${orderNumber} not found`);
    }

    return order;
  }
}
