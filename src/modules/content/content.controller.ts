import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ContentService } from './content.service.js';
import {
  CreateMediaDto,
  UpdateMediaDto,
  CreateTooltipDto,
  UpdateTooltipDto,
  CreateResourceDto,
  UpdateResourceDto,
} from './dto/content.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('media')
  @ApiOperation({ summary: 'Get educational media list' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of educational media items.' })
  async getMedia(@Query('sectionKey') sectionKey?: string) {
    return this.contentService.getMedia(sectionKey);
  }

  @Post('media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create educational media item (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Media item created.' })
  async createMedia(@Body() body: CreateMediaDto) {
    return this.contentService.createMedia(body);
  }

  @Put('media/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update educational media item (Admin)' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Media updated.' })
  async updateMedia(
    @Param('id') id: string,
    @Body() body: UpdateMediaDto,
  ) {
    return this.contentService.updateMedia(id, body);
  }

  @Delete('media/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete educational media item (Admin)' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Media deleted.' })
  async deleteMedia(@Param('id') id: string) {
    return this.contentService.deleteMedia(id);
  }

  @Get('tooltips')
  @ApiOperation({ summary: 'Get tooltips for booking wizard' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of field tooltips.' })
  async getTooltips(@Query('stepIndex') stepIndex?: string) {
    const step = stepIndex ? Number(stepIndex) : undefined;
    return this.contentService.getTooltips(step);
  }

  @Get('tooltips/:fieldKey')
  @ApiOperation({ summary: 'Get tooltip by field key' })
  @ApiParam({ name: 'fieldKey', example: 'squareFeet' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tooltip found.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tooltip not found.' })
  async getTooltipByField(@Param('fieldKey') fieldKey: string) {
    return this.contentService.getTooltipByField(fieldKey);
  }

  @Post('tooltips')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create form tooltip (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Tooltip created.' })
  async createTooltip(@Body() body: CreateTooltipDto) {
    return this.contentService.createTooltip(body);
  }

  @Put('tooltips/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update form tooltip (Admin)' })
  @ApiParam({ name: 'id', description: 'Tooltip UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tooltip updated.' })
  async updateTooltip(
    @Param('id') id: string,
    @Body() body: UpdateTooltipDto,
  ) {
    return this.contentService.updateTooltip(id, body);
  }

  @Delete('tooltips/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete form tooltip (Admin)' })
  @ApiParam({ name: 'id', description: 'Tooltip UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tooltip deleted.' })
  async deleteTooltip(@Param('id') id: string) {
    return this.contentService.deleteTooltip(id);
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get downloadable resources' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of downloadable resources.' })
  async getResources(@Query('category') category?: string) {
    return this.contentService.getResources(category);
  }

  @Post('resources')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create downloadable resource (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Resource created.' })
  async createResource(@Body() body: CreateResourceDto) {
    return this.contentService.createResource(body);
  }

  @Put('resources/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update downloadable resource (Admin)' })
  @ApiParam({ name: 'id', description: 'Resource UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource updated.' })
  async updateResource(
    @Param('id') id: string,
    @Body() body: UpdateResourceDto,
  ) {
    return this.contentService.updateResource(id, body);
  }

  @Delete('resources/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete downloadable resource (Admin)' })
  @ApiParam({ name: 'id', description: 'Resource UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Resource deleted.' })
  async deleteResource(@Param('id') id: string) {
    return this.contentService.deleteResource(id);
  }
}
