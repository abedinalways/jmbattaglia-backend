import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IsnService } from './isn.service.js';
import { IsnController } from './isn.controller.js';
import { IsnSlotSlicerService } from './services/isn-slot-slicer.service.js';

@Module({
  imports: [HttpModule],
  controllers: [IsnController],
  providers: [IsnService, IsnSlotSlicerService],
  exports: [IsnService, IsnSlotSlicerService],
})
export class IsnModule {}
