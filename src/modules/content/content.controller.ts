import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ContentService } from './content.service.js';
import {
  CreateMediaDto,
  UpdateMediaDto,
  CreateTooltipDto,
  UpdateTooltipDto,
  CreateResourceDto,
  UpdateResourceDto,
} from './dto/content.dto.js';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('media')
  async getMedia(@Query('sectionKey') sectionKey?: string) {
    return this.contentService.getMedia(sectionKey);
  }

  @Post('media')
  async createMedia(@Body() body: CreateMediaDto) {
    return this.contentService.createMedia(body);
  }

  @Put('media/:id')
  async updateMedia(
    @Param('id') id: string,
    @Body() body: UpdateMediaDto,
  ) {
    return this.contentService.updateMedia(id, body);
  }

  @Delete('media/:id')
  async deleteMedia(@Param('id') id: string) {
    return this.contentService.deleteMedia(id);
  }

  @Get('tooltips')
  async getTooltips(@Query('stepIndex') stepIndex?: string) {
    const step = stepIndex ? Number(stepIndex) : undefined;
    return this.contentService.getTooltips(step);
  }

  @Get('tooltips/:fieldKey')
  async getTooltipByField(@Param('fieldKey') fieldKey: string) {
    return this.contentService.getTooltipByField(fieldKey);
  }

  @Post('tooltips')
  async createTooltip(@Body() body: CreateTooltipDto) {
    return this.contentService.createTooltip(body);
  }

  @Put('tooltips/:id')
  async updateTooltip(
    @Param('id') id: string,
    @Body() body: UpdateTooltipDto,
  ) {
    return this.contentService.updateTooltip(id, body);
  }

  @Delete('tooltips/:id')
  async deleteTooltip(@Param('id') id: string) {
    return this.contentService.deleteTooltip(id);
  }

  @Get('resources')
  async getResources(@Query('category') category?: string) {
    return this.contentService.getResources(category);
  }

  @Post('resources')
  async createResource(@Body() body: CreateResourceDto) {
    return this.contentService.createResource(body);
  }

  @Put('resources/:id')
  async updateResource(
    @Param('id') id: string,
    @Body() body: UpdateResourceDto,
  ) {
    return this.contentService.updateResource(id, body);
  }

  @Delete('resources/:id')
  async deleteResource(@Param('id') id: string) {
    return this.contentService.deleteResource(id);
  }
}
