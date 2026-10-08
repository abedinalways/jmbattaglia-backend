import { describe, it, expect } from 'vitest';
import { IsnSlotSlicerService } from './isn-slot-slicer.service.js';
import { IsnRawSlotWindow } from '../interfaces/isn.interface.js';

describe('IsnSlotSlicerService', () => {
  const service = new IsnSlotSlicerService();

  it('should slice a full working window into discrete bookable slots', () => {
    const mockWindows: IsnRawSlotWindow[] = [
      {
        userid: 'inspector-123',
        userdisplay: 'Sam Okafor',
        start: '10/6/2026 08:00',
        end: '10/6/2026 14:00',
      },
    ];

    const slots = service.sliceWindowsToBookableSlots(mockWindows, 180, 60);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toMatchObject({
      date: '2026-10-06',
      inspectorId: 'inspector-123',
      inspectorName: 'Sam Okafor',
      durationMinutes: 180,
    });
    expect(slots[0].startDateTime).toBe('2026-10-06 08:00:00');
    expect(slots[0].endDateTime).toBe('2026-10-06 11:00:00');
  });

  it('should return empty slots if window is shorter than inspection duration', () => {
    const shortWindow: IsnRawSlotWindow[] = [
      {
        userid: 'inspector-123',
        userdisplay: 'Sam Okafor',
        start: '10/6/2026 08:00',
        end: '10/6/2026 09:30',
      },
    ];

    const slots = service.sliceWindowsToBookableSlots(shortWindow, 180, 60);
    expect(slots.length).toBe(0);
  });
});
