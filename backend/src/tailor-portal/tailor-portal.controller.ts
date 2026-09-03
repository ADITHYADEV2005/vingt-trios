import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { TailorPortalService } from './tailor-portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('tailor-portal')
export class TailorPortalController {
  constructor(private tailorPortalService: TailorPortalService) {}

  private ensureTailor(req: any) {
    if (req.user.role !== Role.TAILOR && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Tailor portal access required');
    }
  }

  // Dashboard Overview
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    this.ensureTailor(req);
    return this.tailorPortalService.getDashboard(req.user.id);
  }

  // Orders Queue & Detail
  @Get('orders')
  async getOrders(@Req() req: any, @Query('status') status?: string, @Query('search') search?: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    this.ensureTailor(req);
    return this.tailorPortalService.getOrders(req.user.id, { status, search, skip: skip ? +skip : 0, take: take ? +take : 50 });
  }

  @Get('orders/:id')
  async getOrderDetail(@Req() req: any, @Param('id') id: string) {
    this.ensureTailor(req);
    return this.tailorPortalService.getOrderDetail(req.user.id, id);
  }

  @Post('orders/:id/respond')
  async respondToOrder(@Req() req: any, @Param('id') id: string, @Body() body: { accept: boolean; rejectReason?: string }) {
    this.ensureTailor(req);
    return this.tailorPortalService.respondToOrder(req.user.id, id, body.accept, body.rejectReason);
  }

  @Post('orders/:id/stage')
  async updateStage(@Req() req: any, @Param('id') id: string, @Body() body: { stage: string; photoUrl?: string; note?: string }) {
    this.ensureTailor(req);
    return this.tailorPortalService.updateOrderStage(req.user.id, id, body.stage, body.photoUrl, body.note);
  }

  @Post('orders/:id/flag-measurement')
  async flagMeasurement(@Req() req: any, @Param('id') id: string, @Body() body: { issueDescription: string }) {
    this.ensureTailor(req);
    return this.tailorPortalService.flagMeasurement(req.user.id, id, body.issueDescription);
  }

  @Post('orders/:id/shipping')
  async updateShipping(@Req() req: any, @Param('id') id: string, @Body() body: { trackingNumber: string; courierName: string }) {
    this.ensureTailor(req);
    return this.tailorPortalService.updateShippingInfo(req.user.id, id, body.trackingNumber, body.courierName);
  }

  // Order Chat
  @Get('orders/:id/chat')
  async getChat(@Req() req: any, @Param('id') id: string) {
    this.ensureTailor(req);
    return this.tailorPortalService.getChatMessages(req.user.id, id);
  }

  @Post('orders/:id/chat')
  async sendChatMessage(@Req() req: any, @Param('id') id: string, @Body() body: { message: string; attachmentUrl?: string }) {
    this.ensureTailor(req);
    return this.tailorPortalService.sendChatMessage(req.user.id, id, body.message, body.attachmentUrl);
  }

  // Earnings & Payouts
  @Get('earnings')
  async getEarnings(@Req() req: any) {
    this.ensureTailor(req);
    return this.tailorPortalService.getEarnings(req.user.id);
  }

  // Profile & Capacity Setup
  @Get('profile')
  async getProfile(@Req() req: any) {
    this.ensureTailor(req);
    return this.tailorPortalService.getProfile(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    this.ensureTailor(req);
    return this.tailorPortalService.updateProfile(req.user.id, body);
  }

  // Reviews
  @Get('reviews')
  async getReviews(@Req() req: any) {
    this.ensureTailor(req);
    return this.tailorPortalService.getReviews(req.user.id);
  }

  @Post('reviews/:id/reply')
  async replyToReview(@Req() req: any, @Param('id') id: string, @Body() body: { reply: string }) {
    this.ensureTailor(req);
    return this.tailorPortalService.replyToReview(req.user.id, id, body.reply);
  }
}
