import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  // ─── FABRICS ────────────────────────────────────────────────────────────────

  async getFabrics(params: { skip?: number; take?: number; search?: string; category?: string }) {
    const { skip = 0, take = 50, search, category } = params;
    const where: any = {};
    if (category) where.category = category;
    if (search) where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    const [fabrics, total] = await Promise.all([
      this.prisma.fabric.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.fabric.count({ where }),
    ]);
    return { fabrics, total, skip, take };
  }

  async createFabric(data: any) {
    return this.prisma.fabric.create({ data: { ...data, updatedAt: new Date() } });
  }

  async updateFabric(id: string, data: any) {
    return this.prisma.fabric.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async deleteFabric(id: string) {
    return this.prisma.fabric.delete({ where: { id } });
  }

  // ─── STYLES ─────────────────────────────────────────────────────────────────

  async getStyles(params: { skip?: number; take?: number; type?: string; category?: string }) {
    const { skip = 0, take = 50, type, category } = params;
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;
    const [styles, total] = await Promise.all([
      this.prisma.styleOption.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.styleOption.count({ where }),
    ]);
    return { styles, total, skip, take };
  }

  async createStyle(data: any) {
    return this.prisma.styleOption.create({ data });
  }

  async updateStyle(id: string, data: any) {
    return this.prisma.styleOption.update({ where: { id }, data });
  }

  async deleteStyle(id: string) {
    return this.prisma.styleOption.delete({ where: { id } });
  }

  // ─── PRICING RULES ──────────────────────────────────────────────────────────

  async getPricingRules() {
    return this.prisma.pricingRule.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPricingRule(data: { name: string; category: string; basePrice: number; modifiers?: any; bulkDiscounts?: any }) {
    return this.prisma.pricingRule.create({
      data: {
        name: data.name,
        category: data.category,
        basePrice: data.basePrice,
        modifiers: JSON.stringify(data.modifiers || {}),
        bulkDiscounts: JSON.stringify(data.bulkDiscounts || []),
        updatedAt: new Date(),
      },
    });
  }

  async updatePricingRule(id: string, data: any) {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.modifiers) updateData.modifiers = JSON.stringify(data.modifiers);
    if (data.bulkDiscounts) updateData.bulkDiscounts = JSON.stringify(data.bulkDiscounts);
    return this.prisma.pricingRule.update({ where: { id }, data: updateData });
  }

  async deletePricingRule(id: string) {
    return this.prisma.pricingRule.delete({ where: { id } });
  }

  // ─── GARMENTS ───────────────────────────────────────────────────────────────

  async getGarments(params: { skip?: number; take?: number; category?: string }) {
    const { skip = 0, take = 50, category } = params;
    const where: any = {};
    if (category) where.category = category;
    const [garments, total] = await Promise.all([
      this.prisma.preDesignedGarment.findMany({ where, skip, take }),
      this.prisma.preDesignedGarment.count({ where }),
    ]);
    return { garments, total, skip, take };
  }

  async createGarment(data: any) {
    return this.prisma.preDesignedGarment.create({ data });
  }

  async updateGarment(id: string, data: any) {
    return this.prisma.preDesignedGarment.update({ where: { id }, data });
  }

  async deleteGarment(id: string) {
    return this.prisma.preDesignedGarment.delete({ where: { id } });
  }

  // ─── SUMMARY ────────────────────────────────────────────────────────────────

  async getLowStockFabrics() {
    return this.prisma.fabric.findMany({ where: { stockLevel: { lt: 10 }, inStock: true }, orderBy: { stockLevel: 'asc' } });
  }
}
