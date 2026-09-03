import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Razorpay = require('razorpay');

@Injectable()
export class TailorsService {
  private razorpay: any;
  private isMockMode = true;

  constructor(private prisma: PrismaService) {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    if (keyId && keySecret && !keyId.includes('mock')) {
      try {
        this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        this.isMockMode = false;
      } catch {}
    }
  }

  async getApplicationQueue(params: { skip?: number; take?: number; status?: string }) {
    const { skip = 0, take = 50, status = 'PENDING' } = params;
    const [tailors, total] = await Promise.all([
      this.prisma.tailorProfile.findMany({
        where: { applicationStatus: status },
        include: { user: { select: { id: true, name: true, email: true, suspended: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.tailorProfile.count({ where: { applicationStatus: status } }),
    ]);
    return { tailors, total, skip, take };
  }

  async getAllTailors(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    const where: any = { applicationStatus: 'APPROVED' };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }
    const [tailors, total] = await Promise.all([
      this.prisma.tailorProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, suspended: true, banned: true } },
          _count: { select: { payouts: true } },
        },
        orderBy: { rating: 'desc' },
        skip,
        take,
      }),
      this.prisma.tailorProfile.count({ where }),
    ]);
    return { tailors, total, skip, take };
  }

  async getTailorProfile(id: string) {
    const profile = await this.prisma.tailorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, suspended: true, banned: true } },
        payouts: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!profile) throw new NotFoundException('Tailor not found');

    const orders = await this.prisma.order.findMany({
      where: { tailorId: profile.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { items: true, customer: { select: { name: true } } },
    });

    return { profile, orders };
  }

  async approveApplication(id: string, approved: boolean, reason?: string) {
    const profile = await this.prisma.tailorProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Tailor application not found');

    return this.prisma.tailorProfile.update({
      where: { id },
      data: { applicationStatus: approved ? 'APPROVED' : 'REJECTED' },
    });
  }

  async updateCommissionRate(id: string, rate: number) {
    return this.prisma.tailorProfile.update({ where: { id }, data: { commissionRate: rate } });
  }

  async suspendTailor(tailorProfileId: string, suspended: boolean) {
    const profile = await this.prisma.tailorProfile.findUnique({ where: { id: tailorProfileId } });
    if (!profile) throw new NotFoundException('Tailor not found');
    return this.prisma.user.update({ where: { id: profile.userId }, data: { suspended } });
  }

  async triggerPayout(tailorProfileId: string, amount: number, notes?: string) {
    const profile = await this.prisma.tailorProfile.findUnique({
      where: { id: tailorProfileId },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Tailor not found');

    let transferId: string | null = null;
    let status = 'COMPLETED';

    if (!this.isMockMode && this.razorpay) {
      try {
        const transfer = await this.razorpay.transfers.create({
          account: profile.userId,
          amount: Math.round(amount * 100),
          currency: 'INR',
          notes: { reason: notes || 'Tailor commission payout' },
        });
        transferId = transfer.id;
      } catch (err) {
        console.error('Razorpay transfer failed:', err);
        status = 'FAILED';
      }
    } else {
      transferId = `mock_transfer_${Date.now()}`;
    }

    return this.prisma.payoutRecord.create({
      data: {
        tailorId: profile.userId,
        tailorProfileId: profile.id,
        amount,
        razorpayTransferId: transferId,
        status,
        notes: notes || '',
      },
    });
  }

  async getPayoutLedger(tailorProfileId: string) {
    const profile = await this.prisma.tailorProfile.findUnique({ where: { id: tailorProfileId } });
    if (!profile) throw new NotFoundException('Tailor not found');
    return this.prisma.payoutRecord.findMany({
      where: { tailorProfileId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
