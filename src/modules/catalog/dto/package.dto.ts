import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TargetAudience } from '@prisma/client';

export class PackageFeatureInputDto {
  @ApiProperty({ example: 'Complete 400+ point full visual inspection' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Roof, attic, foundation, HVAC, electrical, and plumbing' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class PackageAddonInputDto {
  @ApiProperty({ example: 'uuid-of-radon-service' })
  @IsString()
  @IsNotEmpty()
  addonServiceId!: string;

  @ApiPropertyOptional({ example: 'Recommended for 1 out of 3 homes in this area.' })
  @IsString()
  @IsOptional()
  pitchText?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreatePackageDto {
  @ApiProperty({ example: 'comprehensive-premier-bundle' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'Comprehensive Premier Inspection' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Our most protective bundle with radon, termite, and thermal scan.' })
  @IsString()
  @IsNotEmpty()
  shortDescription!: string;

  @ApiPropertyOptional({ example: 'Designed for complete peace of mind with 4 major diagnostic services.' })
  @IsString()
  @IsOptional()
  detailedDescription?: string;

  @ApiPropertyOptional({ example: 'Best Value' })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/packages/premier.jpg' })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ enum: TargetAudience, default: TargetAudience.ALL })
  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience = TargetAudience.ALL;

  @ApiPropertyOptional({ example: 'ISN-PKG-PREMIER' })
  @IsString()
  @IsOptional()
  isnPackageId?: string;

  @ApiProperty({ example: ['SRV-RES-STANDARD', 'SRV-RADON-TEST'] })
  @IsArray()
  @IsNotEmpty()
  serviceIds!: string[];

  @ApiPropertyOptional({ type: [PackageFeatureInputDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageFeatureInputDto)
  features?: PackageFeatureInputDto[];

  @ApiPropertyOptional({ type: [PackageAddonInputDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageAddonInputDto)
  recommendedAddons?: PackageAddonInputDto[];
}

export class UpdatePackageDto {
  @ApiPropertyOptional({ example: 'comprehensive-premier-bundle' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Comprehensive Premier Inspection' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated short description.' })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  detailedDescription?: string;

  @ApiPropertyOptional({ example: 'Popular' })
  @IsString()
  @IsOptional()
  badge?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'https://assets.jmbattaglia.com/packages/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ enum: TargetAudience })
  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience;

  @ApiPropertyOptional({ example: 'ISN-PKG-01' })
  @IsString()
  @IsOptional()
  isnPackageId?: string;

  @ApiPropertyOptional({ example: ['SRV-RES-STANDARD'] })
  @IsArray()
  @IsOptional()
  serviceIds?: string[];

  @ApiPropertyOptional({ type: [PackageFeatureInputDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageFeatureInputDto)
  features?: PackageFeatureInputDto[];

  @ApiPropertyOptional({ type: [PackageAddonInputDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageAddonInputDto)
  recommendedAddons?: PackageAddonInputDto[];
}

export class QueryPackagesDto {
  @ApiPropertyOptional({ enum: TargetAudience })
  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;
}
