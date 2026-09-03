import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getRevenueDashboard(params: { period?: string; category?: string; region?: string }) {
    const { period = 'month', category, region } = params;
    const now = new Date();
    let startDate: Date;

    if (period === 'today') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') { startDate = new Date(now); startDate.setDate(now.getDate() - 7); }
    else if (period === 'month') { startDate = new Date(now.getFullYear(), now.getMonth(), 1); }
    else if (period === 'quarter') { startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1); }
    else { startDate = new Date(now.getFullYear(), 0, 1); } // year

    const where: any = { createdAt: { gte: startDate }, status: { not: 'CANCELLED' } };
    if (region) where.region = region;

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: true,
        customer: { select: { name: true } },
        tailor: { select: { name: true } },
        designer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by category at item level
    const filteredOrders = category
      ? orders.filter(o => o.items.some(i => i.category === category))
      : orders;

    const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalPrice, 0);
    const orderCount = filteredOrders.length;

    // By category
    const byCategory: Record<string, number> = {};
    for (const o of filteredOrders) {
      for (const item of o.items) {
        byCategory[item.category] = (byCategory[item.category] || 0) + item.price * item.quantity;
      }
    }

    // By status
    const allOrders = await this.prisma.order.findMany({ where: { createdAt: { gte: startDate } } });
    const byStatus: Record<string, number> = {};
    for (const o of allOrders) {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    }

    // By day (last 30 days for chart)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    const dailyOrders = await this.prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, totalPrice: true },
    });
    const byDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - (29 - i));
      const key = d.toISOString().split('T')[0];
      byDay[key] = 0;
    }
    for (const o of dailyOrders) {
      const key = o.createdAt.toISOString().split('T')[0];
      if (byDay[key] !== undefined) byDay[key] += o.totalPrice;
    }

    // Payout totals
    const payouts = await this.prisma.payoutRecord.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } });

    return {
      totalRevenue, orderCount, byCategory, byStatus, byDay,
      totalPayouts: payouts._sum.amount || 0,
      netRevenue: totalRevenue - (payouts._sum.amount || 0),
    };
  }

  async getPayoutHistory(params: { skip?: number; take?: number }) {
    const { skip = 0, take = 50 } = params;
    const [payouts, total] = await Promise.all([
      this.prisma.payoutRecord.findMany({
        orderBy: { createdAt: 'desc' },
        skip, take,
        include: { tailor: { select: { name: true, email: true } } },
      }),
      this.prisma.payoutRecord.count(),
    ]);
    return { payouts, total, skip, take };
  }

  async processRefund(orderId: string, reason: string, amount: number) {
    // Update order to cancelled
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
    });
    // Add timeline entry
    await this.prisma.orderTimeline.create({
      data: { orderId, status: 'CANCELLED', note: `Refund processed: ${reason}`, actorName: 'Admin' },
    });
    return { order, refundAmount: amount, message: 'Refund processed (mock)' };
  }

  async getDisputedOrders() {
    return this.prisma.supportTicket.findMany({
      where: { priority: 'URGENT', orderId: { not: null } },
      include: { order: true, customer: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportOrdersCsv(params: { period?: string }) {
    const { period = 'month' } = params;
    const now = new Date();
    const startDate = period === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), 0, 1);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        customer: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const csvRows = [
      'Order ID,Customer,Email,Status,Total (₹),Items,Date',
      ...orders.map(o =>
        `"${o.id}","${o.customer.name}","${o.customer.email}","${o.status}","${o.totalPrice.toFixed(2)}","${o.items.map(i => i.name).join('; ')}","${o.createdAt.toISOString()}"`
      ),
    ];

    return csvRows.join('\n');
  }
}
