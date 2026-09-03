import { Controller, Get, Post, Body, Param, Query, Res, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import type { Response } from 'express';
import { FinanceService } from './finance.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private financeService: FinanceService, private auditService: AuditService) {}
  private ea(req: any) { if (req.user.role !== Role.ADMIN) throw new ForbiddenException('Admin only'); }

  @Get('revenue') async getRevenue(@Req() req: any, @Query('period') period?: string, @Query('category') cat?: string, @Query('region') region?: string) {
    this.ea(req); return this.financeService.getRevenueDashboard({ period, category: cat, region });
  }
  @Get('payouts') async getPayouts(@Req() req: any, @Query('skip') sk?: string, @Query('take') t?: string) {
    this.ea(req); return this.financeService.getPayoutHistory({ skip: sk ? +sk : 0, take: t ? +t : 50 });
  }
  @Get('disputes') async getDisputes(@Req() req: any) { this.ea(req); return this.financeService.getDisputedOrders(); }

  @Post('refund/:orderId')
  async processRefund(@Req() req: any, @Param('orderId') orderId: string, @Body() body: { reason: string; amount: number }) {
    this.ea(req);
    const result = await this.financeService.processRefund(orderId, body.reason, body.amount);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'REFUND_PROCESSED', target: `Order:${orderId}`, payload: { reason: body.reason, amount: body.amount } });
    return result;
  }

  @Get('export/orders')
  async exportOrders(@Req() req: any, @Res() res: Response, @Query('period') period?: string) {
    this.ea(req);
    const csv = await this.financeService.exportOrdersCsv({ period });
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'ORDERS_EXPORTED_CSV', target: 'Finance', payload: { period } });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${period || 'month'}.csv"`);
    res.send(csv);
  }
}
