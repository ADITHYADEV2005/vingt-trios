import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { DesignerPortalService } from './designer-portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('designer-portal')
export class DesignerPortalController {
  constructor(private designerPortalService: DesignerPortalService) {}

  private ensureDesigner(req: any) {
    if (req.user.role !== Role.DESIGNER && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Designer portal access required');
    }
  }

  // Dashboard Overview
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    this.ensureDesigner(req);
    return this.designerPortalService.getDashboard(req.user.id);
  }

  // Design Catalog & Studio
  @Get('designs')
  async getDesigns(@Req() req: any, @Query('status') status?: string, @Query('search') search?: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    this.ensureDesigner(req);
    return this.designerPortalService.getDesigns(req.user.id, { status, search, skip: skip ? +skip : 0, take: take ? +take : 50 });
  }

  @Post('designs')
  async createDesign(@Req() req: any, @Body() body: any) {
    this.ensureDesigner(req);
    return this.designerPortalService.createDesign(req.user.id, body);
  }

  @Get('designs/:id')
  async getDesignDetail(@Req() req: any, @Param('id') id: string) {
    this.ensureDesigner(req);
    return this.designerPortalService.getDesignDetail(req.user.id, id);
  }

  @Patch('designs/:id')
  async updateDesign(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ensureDesigner(req);
    return this.designerPortalService.updateDesign(req.user.id, id, body);
  }

  @Post('designs/:id/comment')
  async addComment(@Req() req: any, @Param('id') id: string, @Body() body: { comment: string }) {
    this.ensureDesigner(req);
    return this.designerPortalService.addComment(req.user.id, id, body.comment);
  }

  // Monetization & Analytics
  @Get('monetization')
  async getMonetization(@Req() req: any) {
    this.ensureDesigner(req);
    return this.designerPortalService.getMonetization(req.user.id);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    this.ensureDesigner(req);
    return this.designerPortalService.getAnalytics(req.user.id);
  }

  // Brand Profile Setup
  @Get('profile')
  async getProfile(@Req() req: any) {
    this.ensureDesigner(req);
    return this.designerPortalService.getProfile(req.user.id);
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    this.ensureDesigner(req);
    return this.designerPortalService.updateProfile(req.user.id, body);
  }

  // Public Storefront & Follow Action
  @Get('public/:id')
  async getPublicStorefront(@Param('id') id: string) {
    return this.designerPortalService.getPublicStorefront(id);
  }

  @Post('public/:id/follow')
  async toggleFollow(@Req() req: any, @Param('id') id: string) {
    return this.designerPortalService.toggleFollow(req.user.id, id);
  }
}
