import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  // Step 1 — Create a Razorpay order for a Vingt Trios order
  async createPaymentOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PAYMENT_PENDING') {
      throw new BadRequestException('Order is already paid or not pending');
    }

    // Create order in Razorpay
    const razorpayOrder = await this.razorpay.orders.create({
      amount: order.totalPrice * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `vt_${orderId.slice(-8)}`,
      notes: {
        orderId,
        userId,
      },
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalPrice,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId,
    };
  }

  // Step 2 — Verify payment signature after customer pays
  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
    userId: string;
  }) {
    // Verify the signature Razorpay sends back
    const body = data.razorpayOrderId + '|' + data.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature — possible fraud attempt');
    }

    // Signature is valid — confirm the order
    const order = await this.prisma.order.findFirst({
      where: { id: data.orderId, userId: data.userId },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Update order status to PAYMENT_CONFIRMED
    const updatedOrder = await this.prisma.order.update({
      where: { id: data.orderId },
      data: { status: 'PAYMENT_CONFIRMED' },
      include: {
        garment: { include: { fabric: true } },
        measurement: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      message: 'Payment verified successfully. Production will begin shortly.',
      order: updatedOrder,
      paymentId: data.razorpayPaymentId,
    };
  }

  // Get payment status for an order
  async getPaymentStatus(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      select: {
        id: true,
        status: true,
        totalPrice: true,
        createdAt: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
