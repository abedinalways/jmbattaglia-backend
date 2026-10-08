import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@jmbattaglia.com' })
  @IsEmail({}, { message: 'Must provide a valid email address' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'AdminPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
