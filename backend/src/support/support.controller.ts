import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { SupportService } from './support.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService, private auditService: AuditService) {}
  private ea(req: any) { if (req.user.role !== Role.ADMIN) throw new ForbiddenException('Admin only'); }

  @Get('tickets') async getTickets(@Req() req: any, @Query('status') s?: string, @Query('priority') p?: string, @Query('search') q?: string, @Query('skip') sk?: string, @Query('take') t?: string) {
    this.ea(req); return this.supportService.getTickets({ status: s, priority: p, search: q, skip: sk ? +sk : 0, take: t ? +t : 50 });
  }
  @Get('tickets/:id') async getTicket(@Req() req: any, @Param('id') id: string) { this.ea(req); return this.supportService.getTicketById(id); }

  @Patch('tickets/:id')
  async updateTicket(@Req() req: any, @Param('id') id: string, @Body() body: { status?: string; priority?: string; assigneeId?: string }) {
    this.ea(req);
    const r = await this.supportService.updateTicket(id, body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'TICKET_UPDATED', target: `SupportTicket:${id}`, payload: body });
    return r;
  }

  @Post('tickets/:id/note')
  async addNote(@Req() req: any, @Param('id') id: string, @Body() body: { note: string }) {
    this.ea(req); return this.supportService.addInternalNote(id, body.note, req.user.name);
  }

  @Post('tickets/:id/escalate')
  async escalate(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    const r = await this.supportService.escalateTicket(id);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'TICKET_ESCALATED', target: `SupportTicket:${id}` });
    return r;
  }

  @Post('tickets') async createTicket(@Req() req: any, @Body() body: any) { this.ea(req); return this.supportService.createTicket(body); }

  @Get('canned') async getCanned(@Req() req: any) { this.ea(req); return this.supportService.getCannedResponses(); }
  @Post('canned') async createCanned(@Req() req: any, @Body() body: any) { this.ea(req); return this.supportService.createCannedResponse(body); }
  @Delete('canned/:id') async deleteCanned(@Req() req: any, @Param('id') id: string) { this.ea(req); return this.supportService.deleteCannedResponse(id); }
}
