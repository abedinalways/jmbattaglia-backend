import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  firstname!: string;

  @IsString()
  @IsNotEmpty()
  lastname!: string;

  @IsEmail()
  @IsNotEmpty()
  emailaddress!: string;

  @IsString()
  @IsOptional()
  mobilephone?: string;
}
