import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  IsnServiceItem,
  IsnPackageItem,
  IsnOrderType,
  IsnUserMe,
  IsnRawSlotWindow,
  IsnAvailableSlotsResponse,
  IsnOrderPayload,
  IsnClient,
  IsnAgent,
  IsnOrderDetails,
  IsnCreatedOrderResponse,
  BookableSlot,
} from './interfaces/isn.interface.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { IsnSlotSlicerService } from './services/isn-slot-slicer.service.js';

@Injectable()
export class IsnService {
  private readonly logger = new Logger(IsnService.name);
  private readonly baseUrl: string;
  private readonly companyKey: string;
  private readonly accessKey: string;
  private readonly secretAccessKey: string;
  private readonly officeUuid: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly slotSlicer: IsnSlotSlicerService,
  ) {
    this.baseUrl = this.configService.get<string>('isn.baseUrl', 'https://4isn.com');
    this.companyKey = this.configService.get<string>('isn.companyKey', '');
    this.accessKey = this.configService.get<string>('isn.accessKey', '');
    this.secretAccessKey = this.configService.get<string>('isn.secretAccessKey', '');
    this.officeUuid = this.configService.get<string>('isn.officeUuid', '');
  }

  private getBasicAuthHeader(): string {
    const credentials = Buffer.from(
      `${this.accessKey}:${this.secretAccessKey}`,
    ).toString('base64');
    return `Basic ${credentials}`;
  }

  private buildUrl(endpoint: string, queryParams?: Record<string, string>): string {
    const base = `${this.baseUrl}/${this.companyKey}/rest${endpoint}`;
    const url = new URL(base);

    if (this.officeUuid) {
      url.searchParams.set('office', this.officeUuid);
    }

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      });
    }

    return url.toString();
  }

  async getMe(): Promise<IsnUserMe | null> {
    try {
      const url = this.buildUrl('/me');
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      if (response.data?.status === 'ok') {
        return response.data.me as IsnUserMe;
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to verify ISN credentials via /me', error);
      return null;
    }
  }

  async getOrderTypes(): Promise<IsnOrderType[]> {
    try {
      const url = this.buildUrl('/ordertypes');
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      if (response.data?.status === 'ok') {
        return response.data.ordertypes ?? [];
      }
      return [];
    } catch (error) {
      this.logger.error('Failed to fetch ISN order types', error);
      return [];
    }
  }

  async getServices(): Promise<IsnServiceItem[]> {
    try {
      const url = this.buildUrl('/services', { withAssociations: 'true' });
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      const services: IsnServiceItem[] = response.data?.services ?? [];
      return services.filter((s) => s.visible !== 'No');
    } catch (error) {
      this.logger.error('Failed to fetch ISN services', error);
      return [];
    }
  }

  async getPackages(): Promise<IsnPackageItem[]> {
    try {
      const url = this.buildUrl('/packages');
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      const packages: IsnPackageItem[] = response.data?.packages ?? [];
      return packages.filter((pkg) => pkg.active === true && pkg.show === true);
    } catch (error) {
      this.logger.error('Failed to fetch ISN packages', error);
      return [];
    }
  }

  async lookupClient(email: string): Promise<IsnClient | null> {
    try {
      const encoded = encodeURIComponent(email.trim().toLowerCase());
      const url = this.buildUrl(`/client/lookup/${encoded}`);
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      if (response.data?.status === 'ok' && response.data?.client?.id) {
        return response.data.client as IsnClient;
      }
      return null;
    } catch (error) {
      this.logger.warn(`ISN client lookup error for ${email}: ${error}`);
      return null;
    }
  }

  async createClient(dto: CreateClientDto): Promise<string> {
    try {
      const url = this.buildUrl('/client');
      const response = await firstValueFrom(
        this.httpService.post(url, dto, {
          headers: {
            Authorization: this.getBasicAuthHeader(),
            'Content-Type': 'application/json',
          },
        }),
      );

      if (response.data?.status === 'ok' && response.data?.id) {
        return response.data.id;
      }

      throw new HttpException(
        response.data?.message || 'Failed to create client in ISN',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      this.logger.error('Failed to create client in ISN', error);
      throw error;
    }
  }

  async getOrCreateClient(dto: CreateClientDto): Promise<string> {
    const existing = await this.lookupClient(dto.emailaddress);
    if (existing?.id) {
      return existing.id;
    }
    return this.createClient(dto);
  }

  async lookupAgent(email: string): Promise<IsnAgent | null> {
    try {
      const encoded = encodeURIComponent(email.trim().toLowerCase());
      const url = this.buildUrl(`/agent/lookup/${encoded}`);
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      if (response.data?.status === 'ok' && response.data?.agent?.id) {
        return response.data.agent as IsnAgent;
      }
      return null;
    } catch (error) {
      this.logger.warn(`ISN agent lookup error for ${email}: ${error}`);
      return null;
    }
  }

  async getRawAvailableSlots(
    zip: string,
    services: string[],
    daysAhead = 7,
  ): Promise<IsnRawSlotWindow[]> {
    try {
      const base = `${this.baseUrl}/${this.companyKey}/rest/availableslots`;
      const url = new URL(base);
      url.searchParams.set('zip', zip.trim());
      url.searchParams.set('daysahead', String(daysAhead));
      if (this.officeUuid) {
        url.searchParams.set('office', this.officeUuid);
      }

      services.forEach((serviceId) => {
        url.searchParams.append('services[]', serviceId);
      });

      const response = await firstValueFrom(
        this.httpService.get<IsnAvailableSlotsResponse>(url.toString(), {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      return response.data?.slots ?? [];
    } catch (error) {
      this.logger.error('Failed to fetch available slots from ISN', error);
      return [];
    }
  }

  async getBookableSlots(
    zip: string,
    services: string[],
    daysAhead = 7,
    durationMinutes = 180,
  ): Promise<BookableSlot[]> {
    const windows = await this.getRawAvailableSlots(zip, services, daysAhead);
    return this.slotSlicer.sliceWindowsToBookableSlots(windows, durationMinutes);
  }

  async createDraftOrder(payload: IsnOrderPayload): Promise<IsnCreatedOrderResponse> {
    try {
      const url = this.buildUrl('/order');
      if (this.officeUuid && !payload.officeuuid) {
        payload.officeuuid = this.officeUuid;
      }

      const response = await firstValueFrom(
        this.httpService.post<IsnCreatedOrderResponse>(url, payload, {
          headers: {
            Authorization: this.getBasicAuthHeader(),
            'Content-Type': 'application/json',
          },
        }),
      );

      if (response.data?.status === 'error') {
        throw new HttpException(
          response.data.message || 'Failed to create order on ISN',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error('Error creating draft order on ISN', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<IsnOrderDetails | null> {
    try {
      const url = this.buildUrl(`/order/${orderId}`);
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );

      if (response.data?.status === 'ok' && response.data?.order) {
        return response.data.order as IsnOrderDetails;
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to fetch ISN order: ${orderId}`, error);
      return null;
    }
  }

  async scheduleOrder(
    orderId: string,
    scheduledTimestamp: string,
  ): Promise<IsnCreatedOrderResponse> {
    try {
      const url = this.buildUrl(`/order/${orderId}`);
      const payload = {
        inprogress: false,
        scheduled: scheduledTimestamp,
      };

      const response = await firstValueFrom(
        this.httpService.put<IsnCreatedOrderResponse>(url, payload, {
          headers: {
            Authorization: this.getBasicAuthHeader(),
            'Content-Type': 'application/json',
          },
        }),
      );

      if (response.data?.status === 'error') {
        throw new HttpException(
          response.data.message || 'Failed to schedule order on ISN',
          HttpStatus.BAD_REQUEST,
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to transition order ${orderId} to scheduled`, error);
      throw error;
    }
  }
}
