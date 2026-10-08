import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
  IsArray,
  IsEnum,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CustomerTypeEnum {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  AGENT = 'AGENT',
}

export class ClientInfoDto {
  @ApiProperty({ example: 'Alice' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '555-123-4567' })
  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class AgentInfoDto {
  @ApiPropertyOptional({ example: 'Bob Agent' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'bob.agent@realty.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '555-987-6543' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Premier Real Estate' })
  @IsString()
  @IsOptional()
  agency?: string;
}

export class PropertyInfoDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  address1!: string;

  @ApiProperty({ example: 'Austin' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'TX' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '78701' })
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  squareFeet?: number;

  @ApiPropertyOptional({ example: 1998 })
  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @ApiPropertyOptional({ example: 'Slab' })
  @IsString()
  @IsOptional()
  foundationType?: string;
}

export class AppointmentInfoDto {
  @ApiProperty({ example: '2026-10-15 09:00:00' })
  @IsString()
  @IsNotEmpty()
  dateTime!: string;

  @ApiProperty({ example: 'inspector-uuid-123' })
  @IsString()
  @IsNotEmpty()
  inspectorId!: string;

  @ApiPropertyOptional({ example: 'John Inspector' })
  @IsString()
  @IsOptional()
  inspectorName?: string;

  @ApiPropertyOptional({ example: 180 })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;
}

export class PortalOrderSubmissionDto {
  @ApiPropertyOptional({ enum: CustomerTypeEnum, default: CustomerTypeEnum.BUYER })
  @IsEnum(CustomerTypeEnum)
  @IsOptional()
  customerType?: CustomerTypeEnum = CustomerTypeEnum.BUYER;

  @ApiProperty({ type: ClientInfoDto })
  @ValidateNested()
  @Type(() => ClientInfoDto)
  @IsNotEmpty()
  client!: ClientInfoDto;

  @ApiPropertyOptional({ type: AgentInfoDto })
  @ValidateNested()
  @Type(() => AgentInfoDto)
  @IsOptional()
  agent?: AgentInfoDto;

  @ApiProperty({ type: PropertyInfoDto })
  @ValidateNested()
  @Type(() => PropertyInfoDto)
  @IsNotEmpty()
  property!: PropertyInfoDto;

  @ApiProperty({ type: AppointmentInfoDto })
  @ValidateNested()
  @Type(() => AppointmentInfoDto)
  @IsNotEmpty()
  appointment!: AppointmentInfoDto;

  @ApiPropertyOptional({ example: 'pkg-uuid-here' })
  @IsString()
  @IsOptional()
  packageId?: string;

  @ApiProperty({ example: ['SRV-RES-STANDARD', 'SRV-RADON-TEST'] })
  @IsArray()
  @IsNotEmpty()
  serviceIds!: string[];

  @ApiPropertyOptional({ example: 'Gate code is #1234' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  testMode?: boolean;
}

export class CalculateQuoteDto {
  @ApiProperty({ example: '78701' })
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsNumber()
  @IsOptional()
  squareFeet?: number;

  @ApiPropertyOptional({ example: 1998 })
  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @ApiProperty({ example: ['SRV-RES-STANDARD', 'SRV-RADON-TEST'] })
  @IsArray()
  @IsNotEmpty()
  serviceIds!: string[];

  @ApiPropertyOptional({ example: 'pkg-uuid-here' })
  @IsString()
  @IsOptional()
  packageId?: string;
}
