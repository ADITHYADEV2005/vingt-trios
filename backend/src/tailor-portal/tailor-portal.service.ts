import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TailorPortalService {
  constructor(private prisma: PrismaService) {}

  private async getTailorProfile(userId: string) {
    let profile = await this.prisma.tailorProfile.findUnique({ where: { userId } });
    if (!profile) {
      // Auto-create profile if missing
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User account not found');
      profile = await this.prisma.tailorProfile.create({
        data: {
          userId,
          name: user.name,
          rating: 5.0,
          charge: 1500.0,
          applicationStatus: 'APPROVED',
        },
      });
    }
    return profile;
  }

  // ─── DASHBOARD & OVERVIEW ───────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const profile = await this.getTailorProfile(userId);

    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

    const [activeOrdersCount, dueThisWeekCount, totalCompleted, orders] = await Promise.all([
      this.prisma.order.count({
        where: { tailorId: userId, status: { in: ['ASSIGNED', 'CUTTING', 'STITCHING', 'QC', 'DISPATCH'] } },
      }),
      this.prisma.order.count({
        where: {
          tailorId: userId,
          status: { notIn: ['DELIVERED', 'CANCELLED'] },
          deadline: { lte: endOfWeek },
        },
      }),
      this.prisma.order.count({
        where: { tailorId: userId, status: 'DELIVERED' },
      }),
      this.prisma.order.findMany({
        where: { tailorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { items: true, customer: { select: { name: true, email: true } } },
      }),
    ]);

    const payouts = await this.prisma.payoutRecord.aggregate({
      _sum: { amount: true },
      where: { tailorId: userId, status: 'PENDING' },
    });

    const reviews = await this.prisma.tailorReviewResponse.findMany({
      where: { tailorProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      profile,
      stats: {
        activeOrders: activeOrdersCount,
        dueThisWeek: dueThisWeekCount,
        completedJobs: totalCompleted,
        pendingPayout: payouts._sum.amount || 0,
        rating: profile.rating,
        capacity: {
          max: profile.maxConcurrentOrders,
          current: activeOrdersCount,
          isAvailable: profile.isAvailable,
        },
      },
      recentOrders: orders,
      recentReviews: reviews,
    };
  }

  // ─── ORDER MANAGEMENT ───────────────────────────────────────────────────────

  async getOrders(userId: string, params: { status?: string; search?: string; skip?: number; take?: number }) {
    const { status, search, skip = 0, take = 50 } = params;
    const where: any = { tailorId: userId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { id: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: { select: { name: true, email: true } },
          progressPhotos: { orderBy: { createdAt: 'desc' } },
          measurementFlags: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => ({
        ...o,
        items: o.items.map((it) => {
          let parsedSpec = null;
          if (it.customSpec) {
            try { parsedSpec = JSON.parse(it.customSpec); } catch {}
          }
          return { ...it, customSpec: parsedSpec };
        }),
      })),
      total, skip, take,
    };
  }

  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, email: true } },
        progressPhotos: { orderBy: { createdAt: 'desc' } },
        measurementFlags: { orderBy: { createdAt: 'desc' } },
        chats: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { name: true, role: true } } },
        },
        timeline: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.tailorId !== userId) throw new ForbiddenException('Order not assigned to you');

    return {
      ...order,
      items: order.items.map((it) => {
        let parsedSpec = null;
        if (it.customSpec) {
          try { parsedSpec = JSON.parse(it.customSpec); } catch {}
        }
        return { ...it, customSpec: parsedSpec };
      }),
    };
  }

  async respondToOrder(userId: string, orderId: string, accept: boolean, rejectReason?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.tailorId !== userId) throw new ForbiddenException('Not your order');

    if (accept) {
      const updated = await this.prisma.order.update({
        where: { id: orderId },
        data: { acceptedByTailor: true, status: 'CUTTING' },
      });
      await this.prisma.orderTimeline.create({
        data: { orderId, status: 'CUTTING', note: 'Order accepted by tailor. Cutting stage started.', actorName: 'Tailor' },
      });
      return updated;
    } else {
      const updated = await this.prisma.order.update({
        where: { id: orderId },
        data: { acceptedByTailor: false, tailorId: null, status: 'PAID', rejectReason: rejectReason || 'Tailor unassigned' },
      });
      await this.prisma.orderTimeline.create({
        data: { orderId, status: 'PAID', note: `Order rejected by tailor: ${rejectReason || 'Capacity limit'}`, actorName: 'Tailor' },
      });
      return updated;
    }
  }

  async updateOrderStage(userId: string, orderId: string, stage: string, photoUrl?: string, note?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.tailorId !== userId) throw new ForbiddenException('Not your order');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: stage },
    });

    if (photoUrl) {
      await this.prisma.orderProgressPhoto.create({
        data: {
          orderId,
          stage,
          imageUrl: photoUrl,
          note: note || `Stage updated to ${stage}`,
        },
      });
    }

    await this.prisma.orderTimeline.create({
      data: {
        orderId,
        status: stage,
        note: note ? `Stage updated to ${stage}: ${note}` : `Stage updated to ${stage}`,
        actorName: 'Tailor',
      },
    });

    return updated;
  }

  async flagMeasurement(userId: string, orderId: string, issueDescription: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.tailorId !== userId) throw new ForbiddenException('Not your order');

    const profile = await this.getTailorProfile(userId);

    const flag = await this.prisma.measurementFlag.create({
      data: {
        orderId,
        tailorProfileId: profile.id,
        issueDescription,
        status: 'PENDING',
      },
    });

    // Notify admin
    await this.prisma.notification.create({
      data: {
        type: 'FLAGGED_ORDER',
        title: `Measurement Flagged on Order #${orderId.slice(0, 8)}`,
        message: `Tailor ${profile.name} flagged an issue: ${issueDescription}`,
        link: `/admin/orders/${orderId}`,
      },
    });

    return flag;
  }

  async updateShippingInfo(userId: string, orderId: string, trackingNumber: string, courierName: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.tailorId !== userId) throw new ForbiddenException('Not your order');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber,
        courierName,
        status: 'SHIPPED',
      },
    });

    await this.prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'SHIPPED',
        note: `Dispatched via ${courierName}. Tracking #: ${trackingNumber}`,
        actorName: 'Tailor',
      },
    });

    return updated;
  }

  // ─── CHAT THREAD ────────────────────────────────────────────────────────────

  async getChatMessages(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.tailorId !== userId && order.customerId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.orderChat.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { name: true, role: true } } },
    });
  }

  async sendChatMessage(userId: string, orderId: string, message: string, attachmentUrl?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.orderChat.create({
      data: {
        orderId,
        senderId: userId,
        senderRole: user.role,
        message,
        attachmentUrl: attachmentUrl || null,
      },
      include: { sender: { select: { name: true, role: true } } },
    });
  }

  // ─── EARNINGS & PAYOUTS ──────────────────────────────────────────────────────

  async getEarnings(userId: string) {
    const profile = await this.getTailorProfile(userId);

    const orders = await this.prisma.order.findMany({
      where: { tailorId: userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    const payouts = await this.prisma.payoutRecord.findMany({
      where: { tailorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalGross = orders.reduce((s, o) => s + o.totalPrice, 0);
    const totalTailorShare = totalGross * (profile.commissionRate / 100);
    const platformCut = totalGross - totalTailorShare;
    const paidPayouts = payouts.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + p.amount, 0);

    return {
      summary: {
        commissionRate: profile.commissionRate,
        totalGross,
        totalTailorShare,
        platformCut,
        paidPayouts,
        pendingPayouts: totalTailorShare - paidPayouts,
      },
      ordersBreakdown: orders.map(o => ({
        id: o.id,
        date: o.createdAt,
        status: o.status,
        grossPrice: o.totalPrice,
        tailorEarning: o.totalPrice * (profile.commissionRate / 100),
        platformCut: o.totalPrice * ((100 - profile.commissionRate) / 100),
      })),
      payoutsHistory: payouts,
    };
  }

  // ─── PROFILE & CAPACITY MANAGEMENT ─────────────────────────────────────────

  async getProfile(userId: string) {
    return this.getTailorProfile(userId);
  }

  async updateProfile(userId: string, data: any) {
    const profile = await this.getTailorProfile(userId);

    const updateData: any = {};
    if (data.shopName !== undefined) updateData.shopName = data.shopName;
    if (data.experienceYears !== undefined) updateData.experienceYears = +data.experienceYears;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.specializations !== undefined) updateData.specializations = data.specializations;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.portfolioImages !== undefined) updateData.portfolioImages = data.portfolioImages;
    if (data.isAvailable !== undefined) updateData.isAvailable = Boolean(data.isAvailable);
    if (data.maxConcurrentOrders !== undefined) updateData.maxConcurrentOrders = +data.maxConcurrentOrders;
    if (data.bankAccount !== undefined) updateData.bankAccount = typeof data.bankAccount === 'string' ? data.bankAccount : JSON.stringify(data.bankAccount);

    return this.prisma.tailorProfile.update({
      where: { id: profile.id },
      data: updateData,
    });
  }

  // ─── REVIEWS ────────────────────────────────────────────────────────────────

  async getReviews(userId: string) {
    const profile = await this.getTailorProfile(userId);
    return this.prisma.tailorReviewResponse.findMany({
      where: { tailorProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { id: true, items: true } } },
    });
  }

  async replyToReview(userId: string, reviewId: string, reply: string) {
    const profile = await this.getTailorProfile(userId);
    const review = await this.prisma.tailorReviewResponse.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.tailorProfileId !== profile.id) throw new ForbiddenException('Not your review');

    return this.prisma.tailorReviewResponse.update({
      where: { id: reviewId },
      data: { reply, updatedAt: new Date() },
    });
  }
}
