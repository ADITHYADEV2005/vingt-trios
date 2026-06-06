import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TailorsService {
  constructor(private prisma: PrismaService) {}

  // Get all orders assigned to this tailor
  async getMyOrders(tailorId: string) {
    return this.prisma.order.findMany({
      where: { tailorId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        garment: { include: { fabric: true } },
        measurement: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get one specific order assigned to this tailor
  async getOrderById(tailorId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tailorId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        garment: { include: { fabric: true } },
        measurement: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // Tailor updates production status
  async updateStatus(tailorId: string, orderId: string, status: string) {
    const validStatuses = [
      'CUTTING',
      'STITCHING',
      'QUALITY_CHECK',
      'DISPATCHED',
      'DELIVERED',
    ];

    if (!validStatuses.includes(status)) {
      throw new NotFoundException('Invalid status');
    }

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, tailorId },
    });

    if (!order) {
      throw new UnauthorizedException('Order not assigned to you');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        garment: { include: { fabric: true } },
        measurement: true,
      },
    });
  }

  // Get all tailors (admin only)
  async getAllTailors() {
    return this.prisma.user.findMany({
      where: { role: 'TAILOR' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
  }

  // Register a new tailor (admin only)
  async registerTailor(name: string, email: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) throw new NotFoundException('Email already registered');

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: null,
        role: 'TAILOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Get tailor stats
  async getTailorStats(tailorId: string) {
    const orders = await this.prisma.order.findMany({
      where: { tailorId },
    });

    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const inProgress = orders.filter(o =>
      ['CUTTING', 'STITCHING', 'QUALITY_CHECK'].includes(o.status)
    ).length;
    const pending = orders.filter(o => o.status === 'PAYMENT_CONFIRMED').length;

    return { total, delivered, inProgress, pending };
  }
}
