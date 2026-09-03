import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/request')
  async request2FA(@Req() req: any) {
    return this.authService.requestOtp(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2FA(@Req() req: any, @Body() body: { otp: string }) {
    return this.authService.verifyOtp(req.user.id, body.otp);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('measurements')
  async getMeasurements(@Req() req: any) {
    return this.authService.getMeasurements(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('measurements')
  async saveMeasurements(@Req() req: any, @Body() data: any) {
    return this.authService.saveMeasurements(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('saved-designs')
  async getSavedDesigns(@Req() req: any) {
    return this.authService.getSavedDesigns(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('saved-designs')
  async saveDesign(@Req() req: any, @Body() data: any) {
    return this.authService.saveDesign(req.user.id, data);
  }

  // --- ADMIN PORTAL ---
  @UseGuards(JwtAuthGuard)
  @Get('admin/users')
  async getAdminUsers(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden resource');
    }
    return this.authService.getAllUsersForAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/role')
  async adminUpdateUserRole(@Req() req: any, @Body() body: { userId: string; role: string }) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden resource');
    }
    return this.authService.updateUserRoleForAdmin(body.userId, body.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/audit')
  async getAuditLog(@Req() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new Error('Forbidden resource');
    }
    return this.authService.getAuditLog();
  }
}
