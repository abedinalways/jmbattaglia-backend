import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType = MediaType.VIDEO;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsNotEmpty()
  sectionKey!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateMediaDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  sectionKey?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateTooltipDto {
  @IsString()
  @IsNotEmpty()
  fieldKey!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  helpText!: string;

  @IsString()
  @IsOptional()
  exampleText?: string;

  @IsNumber()
  @IsOptional()
  stepIndex?: number;
}

export class UpdateTooltipDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsString()
  @IsOptional()
  exampleText?: string;

  @IsNumber()
  @IsOptional()
  stepIndex?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileType?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
