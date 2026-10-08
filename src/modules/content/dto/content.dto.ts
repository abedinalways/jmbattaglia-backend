import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class CreateMediaDto {
  @ApiProperty({ example: 'What to Expect During Your Inspection' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ enum: MediaType, default: MediaType.VIDEO })
  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType = MediaType.VIDEO;

  @ApiProperty({ example: 'https://assets.jmbattaglia.com/videos/walkthrough.mp4' })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/thumbnails/walkthrough.jpg' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 'package-selection' })
  @IsString()
  @IsNotEmpty()
  sectionKey!: string;

  @ApiPropertyOptional({ example: 'Brief 2-minute overview video' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: MediaType })
  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/videos/walkthrough-v2.mp4' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/thumbnails/thumb-v2.jpg' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'addons-selection' })
  @IsString()
  @IsOptional()
  sectionKey?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateTooltipDto {
  @ApiProperty({ example: 'squareFeet' })
  @IsString()
  @IsNotEmpty()
  fieldKey!: string;

  @ApiProperty({ example: 'Square Footage' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: 'Enter the approximate finished square feet of the home.' })
  @IsString()
  @IsNotEmpty()
  helpText!: string;

  @ApiPropertyOptional({ example: 'e.g. 2,450 sq ft' })
  @IsString()
  @IsOptional()
  exampleText?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  stepIndex?: number;
}

export class UpdateTooltipDto {
  @ApiPropertyOptional({ example: 'Square Footage' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ example: 'Updated guidance on calculating finished area.' })
  @IsString()
  @IsOptional()
  helpText?: string;

  @ApiPropertyOptional({ example: 'e.g. 2,500 sq ft' })
  @IsString()
  @IsOptional()
  exampleText?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  stepIndex?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateResourceDto {
  @ApiProperty({ example: 'Sample Inspection Report' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Interactive preview report' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://assets.jmbattaglia.com/reports/sample.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @ApiProperty({ example: 'REPORTS' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateResourceDto {
  @ApiPropertyOptional({ example: 'Updated Report Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/reports/sample-v2.pdf' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsString()
  @IsOptional()
  fileType?: string;

  @ApiPropertyOptional({ example: 'REPORTS' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
