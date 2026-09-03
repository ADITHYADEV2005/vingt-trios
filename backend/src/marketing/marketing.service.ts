import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  // ─── BANNERS ────────────────────────────────────────────────────────────────

  async getBanners() { return this.prisma.banner.findMany({ orderBy: { createdAt: 'desc' } }); }
  async createBanner(data: any) { return this.prisma.banner.create({ data }); }
  async updateBanner(id: string, data: any) { return this.prisma.banner.update({ where: { id }, data }); }
  async deleteBanner(id: string) { return this.prisma.banner.delete({ where: { id } }); }
  async toggleBanner(id: string, isActive: boolean) { return this.prisma.banner.update({ where: { id }, data: { isActive } }); }

  // ─── COUPONS ────────────────────────────────────────────────────────────────

  async getCoupons() { return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }); }
  async createCoupon(data: { code: string; discountType: string; amount: number; usageLimit?: number; expiresAt?: string; isActive?: boolean }) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        amount: data.amount,
        usageLimit: data.usageLimit || 100,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive ?? true,
      },
    });
  }
  async updateCoupon(id: string, data: any) {
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    return this.prisma.coupon.update({ where: { id }, data });
  }
  async deleteCoupon(id: string) { return this.prisma.coupon.delete({ where: { id } }); }
  async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return { valid: false, reason: 'Coupon not found' };
    if (!coupon.isActive) return { valid: false, reason: 'Coupon is inactive' };
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return { valid: false, reason: 'Coupon expired' };
    if (coupon.usedCount >= coupon.usageLimit) return { valid: false, reason: 'Usage limit reached' };
    return { valid: true, coupon };
  }

  // ─── CAMPAIGNS (STUB) ────────────────────────────────────────────────────────

  async triggerEmailCampaign(data: { subject: string; body: string; audience: string }) {
    // Stub — integrate with SendGrid/Mailchimp in production
    console.log('Email campaign triggered (stub):', data.subject, 'to', data.audience);
    return { sent: true, message: 'Email campaign queued (stub mode)', audience: data.audience };
  }

  async triggerPushNotification(data: { title: string; body: string; audience: string }) {
    // Stub — integrate with FCM in production
    console.log('Push notification triggered (stub):', data.title);
    return { sent: true, message: 'Push notification queued (stub mode)' };
  }
}
