import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { TailorsService } from './tailors.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('tailors-admin')
export class TailorsController {
  constructor(private tailorsService: TailorsService, private auditService: AuditService) {}

  private ea(req: any) { if (req.user.role !== Role.ADMIN) throw new ForbiddenException('Admin only'); }

  @Get('queue')
  async getQueue(@Req() req: any, @Query('status') status?: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    this.ea(req);
    return this.tailorsService.getApplicationQueue({ status: status || 'PENDING', skip: skip ? +skip : 0, take: take ? +take : 50 });
  }

  @Get()
  async getAll(@Req() req: any, @Query('search') search?: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    this.ea(req);
    return this.tailorsService.getAllTailors({ search, skip: skip ? +skip : 0, take: take ? +take : 50 });
  }

  @Get(':id')
  async getProfile(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    return this.tailorsService.getTailorProfile(id);
  }

  @Post(':id/approve')
  async approve(@Req() req: any, @Param('id') id: string, @Body() body: { approved: boolean; reason?: string }) {
    this.ea(req);
    const result = await this.tailorsService.approveApplication(id, body.approved, body.reason);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: body.approved ? 'TAILOR_APPROVED' : 'TAILOR_REJECTED',
      target: `TailorProfile:${id}`, payload: { reason: body.reason },
    });
    return result;
  }

  @Patch(':id/commission')
  async updateCommission(@Req() req: any, @Param('id') id: string, @Body() body: { rate: number }) {
    this.ea(req);
    const result = await this.tailorsService.updateCommissionRate(id, body.rate);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: 'TAILOR_COMMISSION_UPDATED', target: `TailorProfile:${id}`, payload: { rate: body.rate },
    });
    return result;
  }

  @Patch(':id/suspend')
  async suspend(@Req() req: any, @Param('id') id: string, @Body() body: { suspended: boolean }) {
    this.ea(req);
    const result = await this.tailorsService.suspendTailor(id, body.suspended);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: body.suspended ? 'TAILOR_SUSPENDED' : 'TAILOR_UNSUSPENDED',
      target: `TailorProfile:${id}`,
    });
    return result;
  }

  @Post(':id/payout')
  async payout(@Req() req: any, @Param('id') id: string, @Body() body: { amount: number; notes?: string }) {
    this.ea(req);
    const result = await this.tailorsService.triggerPayout(id, body.amount, body.notes);
    await this.auditService.log({
      actorId: req.user.id, actorName: req.user.name,
      action: 'TAILOR_PAYOUT_TRIGGERED', target: `TailorProfile:${id}`,
      payload: { amount: body.amount, transferId: result.razorpayTransferId },
    });
    return result;
  }

  @Get(':id/payouts')
  async getPayouts(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    return this.tailorsService.getPayoutLedger(id);
  }
}
