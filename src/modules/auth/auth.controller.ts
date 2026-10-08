import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { CreateAdminDto } from './dto/create-admin.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { SanitizedAdminUser } from './interfaces/jwt-payload.interface.js';
import { AdminRole } from '../../common/enums/admin-role.enum.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login',
    description: 'Authenticates admin credentials and returns JWT Bearer access token.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authentication successful, returns JWT token and admin user profile.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or inactive admin account.',
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('seed')
  @ApiOperation({
    summary: 'Seed initial super admin account',
    description: 'Initializes the first super administrator if no admin exists in the database.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Initial admin created or message indicating already initialized.',
  })
  async seedAdmin(@Body() body?: CreateAdminDto) {
    return this.authService.seedInitialAdmin(body);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current authenticated admin profile',
    description: 'Returns profile of current admin decoded from Bearer JWT token.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Admin profile data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or expired token.' })
  async getProfile(@CurrentUser() user: SanitizedAdminUser) {
    return this.authService.getProfile(user.id);
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create new administrator (Super Admin only)',
    description: 'Allows super administrators to invite or provision other admins/editors.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Admin created.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Requires SUPER_ADMIN role.' })
  async createAdmin(@Body() body: CreateAdminDto) {
    return this.authService.createAdmin(body);
  }
}
