import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService, private auditService: AuditService) {}
  private ea(req: any) { if (req.user.role !== Role.ADMIN) throw new ForbiddenException('Admin only'); }

  // Fabrics
  @Get('fabrics') async getFabrics(@Req() req: any, @Query('search') s?: string, @Query('category') c?: string, @Query('skip') sk?: string, @Query('take') t?: string) {
    this.ea(req); return this.catalogService.getFabrics({ search: s, category: c, skip: sk ? +sk : 0, take: t ? +t : 50 });
  }
  @Post('fabrics') async createFabric(@Req() req: any, @Body() body: any) {
    this.ea(req);
    const r = await this.catalogService.createFabric(body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'FABRIC_CREATED', target: `Fabric:${r.id}` });
    return r;
  }
  @Patch('fabrics/:id') async updateFabric(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ea(req);
    const r = await this.catalogService.updateFabric(id, body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'FABRIC_UPDATED', target: `Fabric:${id}` });
    return r;
  }
  @Delete('fabrics/:id') async deleteFabric(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    const r = await this.catalogService.deleteFabric(id);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'FABRIC_DELETED', target: `Fabric:${id}` });
    return r;
  }
  @Get('fabrics/low-stock') async lowStock(@Req() req: any) { this.ea(req); return this.catalogService.getLowStockFabrics(); }

  // Styles
  @Get('styles') async getStyles(@Req() req: any, @Query('type') type?: string, @Query('category') cat?: string, @Query('skip') sk?: string, @Query('take') t?: string) {
    this.ea(req); return this.catalogService.getStyles({ type, category: cat, skip: sk ? +sk : 0, take: t ? +t : 50 });
  }
  @Post('styles') async createStyle(@Req() req: any, @Body() body: any) {
    this.ea(req);
    const r = await this.catalogService.createStyle(body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'STYLE_CREATED', target: `StyleOption:${r.id}` });
    return r;
  }
  @Patch('styles/:id') async updateStyle(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ea(req);
    const r = await this.catalogService.updateStyle(id, body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'STYLE_UPDATED', target: `StyleOption:${id}` });
    return r;
  }
  @Delete('styles/:id') async deleteStyle(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    await this.catalogService.deleteStyle(id);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'STYLE_DELETED', target: `StyleOption:${id}` });
    return { deleted: true };
  }

  // Pricing Rules
  @Get('pricing') async getPricing(@Req() req: any) { this.ea(req); return this.catalogService.getPricingRules(); }
  @Post('pricing') async createPricing(@Req() req: any, @Body() body: any) {
    this.ea(req);
    const r = await this.catalogService.createPricingRule(body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'PRICING_RULE_CREATED', target: `PricingRule:${r.id}` });
    return r;
  }
  @Patch('pricing/:id') async updatePricing(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ea(req);
    const r = await this.catalogService.updatePricingRule(id, body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'PRICING_RULE_UPDATED', target: `PricingRule:${id}` });
    return r;
  }
  @Delete('pricing/:id') async deletePricing(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    await this.catalogService.deletePricingRule(id);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'PRICING_RULE_DELETED', target: `PricingRule:${id}` });
    return { deleted: true };
  }

  // Garments
  @Get('garments') async getGarments(@Req() req: any, @Query('category') cat?: string, @Query('skip') sk?: string, @Query('take') t?: string) {
    this.ea(req); return this.catalogService.getGarments({ category: cat, skip: sk ? +sk : 0, take: t ? +t : 50 });
  }
  @Post('garments') async createGarment(@Req() req: any, @Body() body: any) {
    this.ea(req);
    const r = await this.catalogService.createGarment(body);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'GARMENT_CREATED', target: `Garment:${r.id}` });
    return r;
  }
  @Patch('garments/:id') async updateGarment(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    this.ea(req);
    return this.catalogService.updateGarment(id, body);
  }
  @Delete('garments/:id') async deleteGarment(@Req() req: any, @Param('id') id: string) {
    this.ea(req);
    await this.catalogService.deleteGarment(id);
    await this.auditService.log({ actorId: req.user.id, actorName: req.user.name, action: 'GARMENT_DELETED', target: `Garment:${id}` });
    return { deleted: true };
  }
}
