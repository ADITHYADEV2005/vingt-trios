import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Req, ForbiddenException
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRolesGuard } from '../common/admin-roles.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard, AdminRolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private auditService: AuditService,
  ) {}

  private ensureAdmin(req: any) {
    if (req.user.role !== Role.ADMIN) throw new ForbiddenException('Admin only');
  }

  // ─── KPIs ───────────────────────────────────────────────────────────────────

  @Get('kpi')
  async getKpi(@Req() req: any) {
    this.ensureAdmin(req);
    return this.adminService.getKpiStats();
  }

  @Get('activity')
  async getActivity(@Req() req: any, @Query('take') take?: string) {
    this.ensureAdmin(req);
    return this.adminService.getRecentActivity(take ? parseInt(take) : 20);
  }

  // ─── USERS ──────────────────────────────────────────────────────────────────

  @Get('users')
  async getUsers(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    this.ensureAdmin(req);
    return this.adminService.getAllUsers({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50,
      search,
      role,
    });
  }

  @Get('users/:id')
  async getUserDetail(@Req() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.adminService.getUserDetail(id);
  }

  @Patch('users/:id/suspend')
  async suspendUser(@Req() req: any, @Param('id') id: string, @Body() body: { suspended: boolean }) {
    this.ensureAdmin(req);
    const result = await this.adminService.suspendUser(id, body.suspended);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: body.suspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      target: `User:${id}`, payload: { suspended: body.suspended },
    });
    return result;
  }

  @Patch('users/:id/ban')
  async banUser(@Req() req: any, @Param('id') id: string, @Body() body: { banned: boolean }) {
    this.ensureAdmin(req);
    const result = await this.adminService.banUser(id, body.banned);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: body.banned ? 'USER_BANNED' : 'USER_UNBANNED',
      target: `User:${id}`, payload: { banned: body.banned },
    });
    return result;
  }

  @Patch('users/:id/role')
  async updateRole(@Req() req: any, @Param('id') id: string, @Body() body: { role: string }) {
    this.ensureAdmin(req);
    const result = await this.adminService.updateUserRole(id, body.role);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: 'USER_ROLE_CHANGED',
      target: `User:${id}`, payload: { newRole: body.role },
    });
    return result;
  }

  // ─── SUB-ACCOUNT MANAGEMENT ─────────────────────────────────────────────────

  @Get('accounts')
  async getAdminAccounts(@Req() req: any) {
    this.ensureAdmin(req);
    return this.adminService.getAdminAccounts();
  }

  @Patch('accounts/:id/admin-role')
  async updateAdminRole(@Req() req: any, @Param('id') id: string, @Body() body: { adminRole: string }) {
    this.ensureAdmin(req);
    const result = await this.adminService.updateAdminRole(id, body.adminRole);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: 'ADMIN_ROLE_CHANGED',
      target: `User:${id}`, payload: { adminRole: body.adminRole },
    });
    return result;
  }

  // ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

  @Get('notifications')
  async getNotifications(@Req() req: any) {
    this.ensureAdmin(req);
    return this.adminService.getNotifications(req.user.id);
  }

  @Patch('notifications/:id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.adminService.markNotificationRead(id);
  }
}
