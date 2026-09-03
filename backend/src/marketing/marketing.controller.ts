import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('marketing')
export class MarketingController {
  constructor(private marketingService: MarketingService, private auditService: AuditService) {}
  private ea(req: any) { if (req.user.role !== Role.ADMIN) throw new ForbiddenException('Admin only'); }

  // Banners
  @Get('banners') async getBanners(@Req() req: any) { this.ea(req); return this.marketingService.getBanners(); }
  @Post('banners') async createBanner(@Req() req: any, @Body() body: any) {
    this.ea(req);
    const r = await this.marketingService.createBanner(body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'BANNER_CREATED', target: `Banner:${r.id}` });
    return r;
  }
  @Patch('banners/:id') async updateBanner(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ea(req); return this.marketingService.updateBanner(id, body);
  }
  @Delete('banners/:id') async deleteBanner(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    await this.marketingService.deleteBanner(id);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'BANNER_DELETED', target: `Banner:${id}` });
    return { deleted: true };
  }
  @Patch('banners/:id/toggle') async toggleBanner(@Req() req: any, @Param('id') id: string, @Body() body: { isActive: boolean }) {
    this.ea(req); return this.marketingService.toggleBanner(id, body.isActive);
  }

  // Coupons
  @Get('coupons') async getCoupons(@Req() req: any) { this.ea(req); return this.marketingService.getCoupons(); }
  @Post('coupons') async createCoupon(@Req() req: any, @Body() body: any) {
    this.ea(req);
    const r = await this.marketingService.createCoupon(body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'COUPON_CREATED', target: `Coupon:${r.id}`, payload: { code: r.code } });
    return r;
  }
  @Patch('coupons/:id') async updateCoupon(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ea(req); return this.marketingService.updateCoupon(id, body);
  }
  @Delete('coupons/:id') async deleteCoupon(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    await this.marketingService.deleteCoupon(id);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'COUPON_DELETED', target: `Coupon:${id}` });
    return { deleted: true };
  }
  @Get('coupons/validate/:code') async validateCoupon(@Req() req: any, @Param('code') code: string) { this.ea(req); return this.marketingService.validateCoupon(code); }

  // Campaigns
  @Post('campaigns/email') async emailCampaign(@Req() req: any, @Body() body: any) {
    this.ea(req);
    const r = await this.marketingService.triggerEmailCampaign(body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'EMAIL_CAMPAIGN_TRIGGERED', target: 'Marketing', payload: { subject: body.subject } });
    return r;
  }
  @Post('campaigns/push') async pushCampaign(@Req() req: any, @Body() body: any) {
    this.ea(req);
    return this.marketingService.triggerPushNotification(body);
  }
}
