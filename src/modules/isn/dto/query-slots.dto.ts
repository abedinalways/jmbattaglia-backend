import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySlotsDto {
  @ApiProperty({ example: '78701', description: 'Property 5-digit US ZIP code' })
  @IsString()
  @IsNotEmpty()
  zip!: string;

  @ApiProperty({
    example: 'SRV-RES-STANDARD,SRV-RADON-TEST',
    description: 'Comma-separated ISN service IDs or array of service IDs',
  })
  @IsNotEmpty()
  services!: string | string[];

  @ApiPropertyOptional({ example: 7, description: 'Number of calendar days ahead to look for available slots' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  daysahead?: number;

  @ApiPropertyOptional({ example: 180, description: 'Total estimated duration of inspection appointment in minutes' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  durationMinutes?: number;
}
