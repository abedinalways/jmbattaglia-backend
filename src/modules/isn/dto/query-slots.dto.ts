import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySlotsDto {
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @IsNotEmpty()
  services!: string | string[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  daysahead?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationMinutes?: number;
}
