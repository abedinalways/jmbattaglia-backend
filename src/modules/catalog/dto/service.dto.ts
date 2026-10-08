import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ServiceCategory } from '@prisma/client';

export class UpdateServiceDefinitionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  educationalText?: string;

  @IsEnum(ServiceCategory)
  @IsOptional()
  category?: ServiceCategory;

  @IsBoolean()
  @IsOptional()
  isAddon?: boolean;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
