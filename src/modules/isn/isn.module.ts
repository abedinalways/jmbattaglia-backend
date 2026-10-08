import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IsnService } from './isn.service.js';
import { IsnController } from './isn.controller.js';

@Module({
  imports: [HttpModule],
  controllers: [IsnController],
  providers: [IsnService],
  exports: [IsnService],
})
export class IsnModule {}
