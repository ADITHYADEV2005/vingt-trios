import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── KPI STATS ──────────────────────────────────────────────────────────────

  async getKpiStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      ordersToday, ordersWeek, ordersMonth,
      revenueToday, revenueWeek, revenueMonth,
      totalOrders, pendingOrders, inProductionOrders,
      shippedOrders, deliveredOrders, cancelledOrders,
      activeTailors, pendingTailorApplications,
      pendingDesignerApplications, openTickets,
      lowStockFabrics, totalCustomers,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.order.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: startOfToday }, status: { not: 'CANCELLED' } } }),
      this.prisma.order.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: startOfWeek }, status: { not: 'CANCELLED' } } }),
      this.prisma.order.aggregate({ _sum: { totalPrice: true }, where: { createdAt: { gte: startOfMonth }, status: { not: 'CANCELLED' } } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PAID' } }),
      this.prisma.order.count({ where: { status: 'PRODUCTION' } }),
      this.prisma.order.count({ where: { status: 'SHIPPED' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.tailorProfile.count({ where: { applicationStatus: 'APPROVED' } }),
      this.prisma.tailorProfile.count({ where: { applicationStatus: 'PENDING' } }),
      this.prisma.designerProfile.count({ where: { applicationStatus: 'PENDING' } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.fabric.count({ where: { stockLevel: { lt: 10 }, inStock: true } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
    ]);

    return {
      orders: { today: ordersToday, week: ordersWeek, month: ordersMonth, total: totalOrders },
      revenue: {
        today: revenueToday._sum.totalPrice || 0,
        week: revenueWeek._sum.totalPrice || 0,
        month: revenueMonth._sum.totalPrice || 0,
      },
      orderStatus: {
        paid: pendingOrders, assigned: 0, production: inProductionOrders,
        shipped: shippedOrders, delivered: deliveredOrders, cancelled: cancelledOrders,
      },
      activeTailors, pendingTailorApplications, pendingDesignerApplications,
      openTickets, lowStockFabrics, totalCustomers,
    };
  }

  // ─── RECENT ACTIVITY ────────────────────────────────────────────────────────

  async getRecentActivity(take = 20) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { actor: { select: { name: true, email: true } } },
    });
  }

  // ─── SUB-ACCOUNT MANAGEMENT ─────────────────────────────────────────────────

  async getAdminAccounts() {
    return this.prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, adminRole: true, createdAt: true, suspended: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAdminRole(userId: string, adminRole: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { adminRole },
      select: { id: true, name: true, email: true, adminRole: true },
    });
  }

  // ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

  async getNotifications(recipientId?: string) {
    return this.prisma.notification.findMany({
      where: recipientId ? { OR: [{ recipientId }, { recipientId: null }] } : { recipientId: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markNotificationRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async createNotification(data: { type: string; title: string; message: string; link?: string; recipientId?: string }) {
    return this.prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || '',
        recipientId: data.recipientId || null,
      },
    });
  }

  // ─── USER MANAGEMENT ────────────────────────────────────────────────────────

  async getAllUsers(params: { skip?: number; take?: number; search?: string; role?: string }) {
    const { skip = 0, take = 50, search, role } = params;
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, adminRole: true,
          suspended: true, banned: true, createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, skip, take };
  }

  async getUserDetail(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        measurements: { orderBy: { createdAt: 'desc' }, take: 1 },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true },
        },
        tickets: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async suspendUser(userId: string, suspended: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { suspended } });
  }

  async banUser(userId: string, banned: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { banned } });
  }

  async updateUserRole(userId: string, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}
