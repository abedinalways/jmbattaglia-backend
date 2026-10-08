import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  IsnServiceItem,
  IsnPackageItem,
  IsnSlotItem,
  IsnAvailableSlotsResponse,
  IsnOrderPayload,
} from './interfaces/isn.interface.js';

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

  private getRequestUrl(endpoint: string): string {
    return `${this.baseUrl}/${this.companyKey}/rest${endpoint}`;
  }

  async getServices(): Promise<IsnServiceItem[]> {
    try {
      const url = this.getRequestUrl('/services?withAssociations');
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );
      return response.data?.services ?? [];
    } catch (error) {
      this.logger.error('Failed to fetch ISN services', error);
      return [];
    }
  }

  async getPackages(): Promise<IsnPackageItem[]> {
    try {
      const url = this.getRequestUrl('/packages');
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );
      return response.data?.packages ?? [];
    } catch (error) {
      this.logger.error('Failed to fetch ISN packages', error);
      return [];
    }
  }

  async getAvailableSlots(
    zip: string,
    services: string[],
    daysAhead = 7,
  ): Promise<IsnSlotItem[]> {
    try {
      const params = new URLSearchParams();
      params.append('zip', zip);
      params.append('daysahead', String(daysAhead));
      services.forEach((serviceId) => {
        params.append('services[]', serviceId);
      });

      const url = `${this.getRequestUrl('/availableslots')}?${params.toString()}`;
      const response = await firstValueFrom(
        this.httpService.get<IsnAvailableSlotsResponse>(url, {
          headers: { Authorization: this.getBasicAuthHeader() },
        }),
      );
      return response.data?.slots ?? [];
    } catch (error) {
      this.logger.error('Failed to fetch available slots from ISN', error);
      return [];
    }
  }

  async createDraftOrder(payload: IsnOrderPayload): Promise<{ id: string; oid: number }> {
    try {
      const url = this.getRequestUrl('/order');
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: this.getBasicAuthHeader(),
            'Content-Type': 'application/json',
          },
        }),
      );

      if (response.data?.status === 'error') {
        throw new HttpException(
          response.data.message || 'Failed to create ISN order',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        id: response.data.id,
        oid: response.data.oid,
      };
    } catch (error) {
      this.logger.error('Failed to create order on ISN', error);
      throw error;
    }
  }
}
