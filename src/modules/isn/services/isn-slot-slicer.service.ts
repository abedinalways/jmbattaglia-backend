import { Injectable } from '@nestjs/common';
import { IsnRawSlotWindow, BookableSlot } from '../interfaces/isn.interface.js';

@Injectable()
export class IsnSlotSlicerService {
  sliceWindowsToBookableSlots(
    windows: IsnRawSlotWindow[],
    durationMinutes = 180,
    intervalMinutes = 60,
  ): BookableSlot[] {
    const bookableSlots: BookableSlot[] = [];

    for (const win of windows) {
      const windowStart = this.parseIsnDateTime(win.start);
      const windowEnd = this.parseIsnDateTime(win.end);

      if (!windowStart || !windowEnd) {
        continue;
      }

      let currentCandidate = new Date(windowStart.getTime());

      while (
        currentCandidate.getTime() + durationMinutes * 60 * 1000 <=
        windowEnd.getTime()
      ) {
        const slotEnd = new Date(
          currentCandidate.getTime() + durationMinutes * 60 * 1000,
        );

        bookableSlots.push({
          date: this.formatDate(currentCandidate),
          formattedTime: this.formatTime12Hour(currentCandidate),
          startDateTime: this.formatIsnDateTime(currentCandidate),
          endDateTime: this.formatIsnDateTime(slotEnd),
          inspectorId: win.userid,
          inspectorName: win.userdisplay,
          durationMinutes,
        });

        currentCandidate = new Date(
          currentCandidate.getTime() + intervalMinutes * 60 * 1000,
        );
      }
    }

    return bookableSlots.sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
    );
  }

  private parseIsnDateTime(isnStr: string): Date | null {
    if (!isnStr) return null;
    const parts = isnStr.trim().split(' ');
    if (parts.length < 2) return null;

    const [datePart, timePart] = parts;
    const [month, day, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);

    if (!year || !month || !day || isNaN(hour) || isNaN(minute)) {
      return null;
    }

    return new Date(year, month - 1, day, hour, minute, 0);
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatIsnDateTime(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  }

  private formatTime12Hour(d: Date): string {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }
}
