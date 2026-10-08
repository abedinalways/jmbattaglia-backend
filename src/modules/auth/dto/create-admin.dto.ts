import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AdminRole } from '../../../common/enums/admin-role.enum.js';

export class CreateAdminDto {
  @ApiProperty({ example: 'newadmin@jmbattaglia.com' })
  @IsEmail({}, { message: 'Must provide a valid email address' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'AdminPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @ApiProperty({ example: 'John Manager' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ enum: AdminRole, default: AdminRole.ADMIN })
  @IsEnum(AdminRole, { message: 'Role must be SUPER_ADMIN, ADMIN, or EDITOR' })
  @IsOptional()
  role?: AdminRole;
}
