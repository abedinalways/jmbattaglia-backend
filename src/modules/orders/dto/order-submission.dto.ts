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

export enum CustomerTypeEnum {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  AGENT = 'AGENT',
}

export class ClientInfoDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;
}

export class AgentInfoDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  agency?: string;
}

export class PropertyInfoDto {
  @IsString()
  @IsNotEmpty()
  address1!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  zip!: string;

  @IsNumber()
  @IsOptional()
  squareFeet?: number;

  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @IsString()
  @IsOptional()
  foundationType?: string;
}

export class AppointmentInfoDto {
  @IsString()
  @IsNotEmpty()
  dateTime!: string;

  @IsString()
  @IsNotEmpty()
  inspectorId!: string;

  @IsString()
  @IsOptional()
  inspectorName?: string;

  @IsNumber()
  @IsOptional()
  durationMinutes?: number;
}

export class PortalOrderSubmissionDto {
  @IsEnum(CustomerTypeEnum)
  @IsOptional()
  customerType?: CustomerTypeEnum = CustomerTypeEnum.BUYER;

  @ValidateNested()
  @Type(() => ClientInfoDto)
  @IsNotEmpty()
  client!: ClientInfoDto;

  @ValidateNested()
  @Type(() => AgentInfoDto)
  @IsOptional()
  agent?: AgentInfoDto;

  @ValidateNested()
  @Type(() => PropertyInfoDto)
  @IsNotEmpty()
  property!: PropertyInfoDto;

  @ValidateNested()
  @Type(() => AppointmentInfoDto)
  @IsNotEmpty()
  appointment!: AppointmentInfoDto;

  @IsString()
  @IsOptional()
  packageId?: string;

  @IsArray()
  @IsNotEmpty()
  serviceIds!: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  testMode?: boolean;
}

export class CalculateQuoteDto {
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @IsNumber()
  @IsOptional()
  squareFeet?: number;

  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @IsArray()
  @IsNotEmpty()
  serviceIds!: string[];

  @IsString()
  @IsOptional()
  packageId?: string;
}
