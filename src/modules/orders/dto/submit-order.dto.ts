import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class SubmitOrderDto {
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
  squarefeet?: number;

  @IsNumber()
  @IsOptional()
  yearbuilt?: number;

  @IsString()
  @IsNotEmpty()
  datetime!: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsNotEmpty()
  inspector1uuid!: string;

  @IsString()
  @IsOptional()
  ordertypeuuid?: string;

  @IsArray()
  services!: string[];

  @IsArray()
  @IsOptional()
  packages?: Array<{ package: string }>;

  @IsString()
  @IsNotEmpty()
  clientuuid!: string;

  @IsString()
  @IsOptional()
  buyersagentuuid?: string;

  @IsArray()
  @IsOptional()
  notes?: Array<{ text: string; owner?: string }>;
}
