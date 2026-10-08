import { Controller, Get } from '@nestjs/common';
import { ContentService } from './content.service.js';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('educational')
  async getEducational() {
    return this.contentService.getEducationalContent();
  }
}
