import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '@prisma/client';

export class UpdateServiceDefinitionDto {
  @ApiPropertyOptional({ example: 'Continuous Monitor Radon Testing' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '48-hour continuous digital radon test.' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Full explanation about EPA safety action thresholds.' })
  @IsString()
  @IsOptional()
  educationalText?: string;

  @ApiPropertyOptional({ enum: ServiceCategory })
  @IsEnum(ServiceCategory)
  @IsOptional()
  category?: ServiceCategory;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isAddon?: boolean;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/icons/radon.svg' })
  @IsString()
  @IsOptional()
  iconUrl?: string;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/videos/radon.mp4' })
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/images/radon.jpg' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
