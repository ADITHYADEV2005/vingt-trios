import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { DesignersService } from './designers.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('designers-admin')
export class DesignersController {
  constructor(private designersService: DesignersService, private auditService: AuditService) {}
  private ea(req: any) { if (req.user.role !== Role.ADMIN) throw new ForbiddenException('Admin only'); }

  @Get('queue') async queue(@Req() req: any, @Query('status') s?: string, @Query('skip') sk?: string, @Query('take') t?: string) {
    this.ea(req); return this.designersService.getApplicationQueue({ status: s || 'PENDING', skip: sk ? +sk : 0, take: t ? +t : 50 });
  }
  @Get() async getAll(@Req() req: any, @Query('search') search?: string, @Query('skip') sk?: string, @Query('take') t?: string) {
    this.ea(req); return this.designersService.getAllDesigners({ search, skip: sk ? +sk : 0, take: t ? +t : 50 });
  }
  @Get('usage-stats') async usageStats(@Req() req: any) { this.ea(req); return this.designersService.getDesignUsageStats(); }
  @Get(':id') async getProfile(@Req() req: any, @Param('id') id: string) { this.ea(req); return this.designersService.getDesignerProfile(id); }

  @Post(':id/approve')
  async approve(@Req() req: any, @Param('id') id: string, @Body() body: { approved: boolean }) {
    this.ea(req);
    const result = await this.designersService.approveApplication(id, body.approved);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: body.approved ? 'DESIGNER_APPROVED' : 'DESIGNER_REJECTED', target: `DesignerProfile:${id}` });
    return result;
  }
  @Patch(':id/royalty')
  async updateRoyalty(@Req() req: any, @Param('id') id: string, @Body() body: { rate: number }) {
    this.ea(req);
    const result = await this.designersService.updateRoyaltyRate(id, body.rate);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'DESIGNER_ROYALTY_UPDATED', target: `DesignerProfile:${id}`, payload: { rate: body.rate } });
    return result;
  }
  @Patch(':id/suspend')
  async suspend(@Req() req: any, @Param('id') id: string, @Body() body: { suspended: boolean }) {
    this.ea(req);
    const result = await this.designersService.suspendDesigner(id, body.suspended);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: body.suspended ? 'DESIGNER_SUSPENDED' : 'DESIGNER_UNSUSPENDED', target: `DesignerProfile:${id}` });
    return result;
  }
}
