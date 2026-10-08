import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getEducationalContent() {
    return {
      videos: [],
      tooltips: [],
      faqs: [],
    };
  }
}
