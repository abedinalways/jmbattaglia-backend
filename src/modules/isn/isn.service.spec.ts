import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IsnService } from './isn.service.js';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { IsnSlotSlicerService } from './services/isn-slot-slicer.service.js';
import { of } from 'rxjs';

describe('IsnService', () => {
  let service: IsnService;
  let httpService: HttpService;
  let configService: ConfigService;
  let slotSlicer: IsnSlotSlicerService;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string, defaultValue?: any) => {
        if (key === 'isn.baseUrl') return 'https://4isn.com';
        if (key === 'isn.companyKey') return 'testco';
        if (key === 'isn.accessKey') return 'acc123';
        if (key === 'isn.secretAccessKey') return 'sec123';
        return defaultValue;
      }),
    } as unknown as ConfigService;

    httpService = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    } as unknown as HttpService;

    slotSlicer = new IsnSlotSlicerService();

    service = new IsnService(configService, httpService, slotSlicer);
  });

  it('should lookup client and return null on miss', async () => {
    vi.spyOn(httpService, 'get').mockReturnValue(
      of({
        data: {
          status: 'error',
          client: '',
          message: 'could not locate client',
        },
      } as any),
    );

    const client = await service.lookupClient('unknown@example.com');
    expect(client).toBeNull();
  });

  it('should lookup client and return client object when found', async () => {
    vi.spyOn(httpService, 'get').mockReturnValue(
      of({
        data: {
          status: 'ok',
          client: { id: 'client-uuid-1', firstname: 'Jane', lastname: 'Doe' },
        },
      } as any),
    );

    const client = await service.lookupClient('jane@example.com');
    expect(client).toMatchObject({ id: 'client-uuid-1', firstname: 'Jane' });
  });

  it('should create client and return id', async () => {
    vi.spyOn(httpService, 'post').mockReturnValue(
      of({
        data: {
          status: 'ok',
          id: 'new-client-uuid',
        },
      } as any),
    );

    const id = await service.createClient({
      firstname: 'John',
      lastname: 'Smith',
      emailaddress: 'john@example.com',
      mobilephone: '555-0100',
    });

    expect(id).toBe('new-client-uuid');
  });

  it('should get or create client without duplicate creation if client exists', async () => {
    vi.spyOn(service, 'lookupClient').mockResolvedValue({
      id: 'existing-uuid',
      firstname: 'John',
      lastname: 'Smith',
      emailaddress: 'john@example.com',
    });
    const createSpy = vi.spyOn(service, 'createClient');

    const id = await service.getOrCreateClient({
      firstname: 'John',
      lastname: 'Smith',
      emailaddress: 'john@example.com',
    });

    expect(id).toBe('existing-uuid');
    expect(createSpy).not.toHaveBeenCalled();
  });
});
