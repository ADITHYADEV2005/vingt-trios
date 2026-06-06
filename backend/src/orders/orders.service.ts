import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, data: {
    garmentId: string;
    measurementId: string;
    totalPrice: number;
  }) {
    // Verify garment exists
    const garment = await this.prisma.garment.findUnique({
      where: { id: data.garmentId },
    });
    if (!garment) throw new NotFoundException('Garment not found');

    // Verify measurement belongs to this user
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { measurements: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const measurement = profile.measurements.find(
      (m) => m.id === data.measurementId,
    );
    if (!measurement) {
      throw new BadRequestException('Measurement does not belong to this user');
    }

    return this.prisma.order.create({
      data: {
        userId,
        garmentId: data.garmentId,
        measurementId: data.measurementId,
        totalPrice: data.totalPrice,
        status: 'PAYMENT_PENDING',
      },
      include: {
        garment: { include: { fabric: true } },
        measurement: true,
      },
    });
  }

  async getMyOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        garment: { include: { fabric: true } },
        measurement: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        garment: { include: { fabric: true } },
        measurement: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async confirmPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAYMENT_CONFIRMED' },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = [
      'PAYMENT_PENDING',
      'PAYMENT_CONFIRMED',
      'CUTTING',
      'STITCHING',
      'QUALITY_CHECK',
      'DISPATCHED',
      'DELIVERED',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        garment: { include: { fabric: true } },
        measurement: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignTailor(orderId: string, tailorId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { tailorId },
    });
  }
}
