import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminRole } from '@prisma/client';

export class CreateAdminDto {
  @IsEmail({}, { message: 'Must provide a valid email address' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(AdminRole, { message: 'Role must be SUPER_ADMIN, ADMIN, or EDITOR' })
  @IsOptional()
  role?: AdminRole;
}
