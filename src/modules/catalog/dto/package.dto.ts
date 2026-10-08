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
import { TargetAudience } from '@prisma/client';

export class PackageFeatureInputDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class PackageAddonInputDto {
  @IsString()
  @IsNotEmpty()
  addonServiceId!: string;

  @IsString()
  @IsOptional()
  pitchText?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  shortDescription!: string;

  @IsString()
  @IsOptional()
  detailedDescription?: string;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience = TargetAudience.ALL;

  @IsString()
  @IsOptional()
  isnPackageId?: string;

  @IsArray()
  @IsNotEmpty()
  serviceIds!: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageFeatureInputDto)
  features?: PackageFeatureInputDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageAddonInputDto)
  recommendedAddons?: PackageAddonInputDto[];
}

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsOptional()
  detailedDescription?: string;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience;

  @IsString()
  @IsOptional()
  isnPackageId?: string;

  @IsArray()
  @IsOptional()
  serviceIds?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageFeatureInputDto)
  features?: PackageFeatureInputDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PackageAddonInputDto)
  recommendedAddons?: PackageAddonInputDto[];
}

export class QueryPackagesDto {
  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isFeatured?: boolean;
}
