import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';
import Razorpay = require('razorpay');

@Injectable()
export class OrdersService {
  private razorpay: any;
  private isMockMode = false;

  constructor(private prisma: PrismaService) {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keyId || !keySecret || keyId.includes('mock') || keySecret.includes('mock')) {
      console.warn('Razorpay keys not configured. Operating in Mock Payment Mode.');
      this.isMockMode = true;
    } else {
      try {
        this.razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });
      } catch (err) {
        console.error('Failed to initialize Razorpay SDK. Operating in Mock Payment Mode.', err);
        this.isMockMode = true;
      }
    }
  }

  async createRazorpayOrder(customerId: string, data: { items: any[]; tailorId?: string }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let calculatedTotal = 0;

    for (const item of data.items) {
      if (item.isCustom) {
        let itemBase = 0;
        if (item.category === 'SHIRT') itemBase = 1999;
        else if (item.category === 'PANT') itemBase = 2499;
        else if (item.category === 'BLAZER') itemBase = 7999;

        let fabricPriceDelta = 0;
        if (item.fabricId) {
          const fabric = await this.prisma.fabric.findUnique({ where: { id: item.fabricId } });
          if (fabric) fabricPriceDelta = fabric.priceDelta;
        }

        let tailorCharge = 0;
        if (data.tailorId) {
          const tailor = await this.prisma.tailorProfile.findUnique({ where: { id: data.tailorId } });
          if (tailor) tailorCharge = tailor.charge;
        }

        calculatedTotal += (itemBase + fabricPriceDelta + tailorCharge) * (item.quantity || 1);
      } else {
        if (!item.preDesignedId) {
          throw new BadRequestException('Invalid item specification');
        }
        const pg = await this.prisma.preDesignedGarment.findUnique({ where: { id: item.preDesignedId } });
        if (!pg) {
          throw new NotFoundException(`Pre-designed garment ${item.preDesignedId} not found`);
        }
        calculatedTotal += pg.basePrice * (item.quantity || 1);
      }
    }

    const amountInPaise = Math.round(calculatedTotal * 100);
    let razorpayOrderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;

    if (!this.isMockMode && this.razorpay) {
      try {
        const order = await this.razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `receipt_order_${Date.now()}`,
        });
        razorpayOrderId = order.id;
      } catch (err) {
        console.error('Razorpay Order creation failed, falling back to mock Order ID', err);
      }
    }

    return {
      razorpayOrderId,
      amount: calculatedTotal,
      currency: 'INR',
      isMockMode: this.isMockMode,
    };
  }

  private parseCustomSpec(items: any[]) {
    return items.map((i) => {
      let customSpecObj = null;
      if (i.customSpec) {
        try {
          customSpecObj = typeof i.customSpec === 'string' ? JSON.parse(i.customSpec) : i.customSpec;
        } catch {
          customSpecObj = i.customSpec;
        }
      }
      return {
        ...i,
        customSpec: customSpecObj,
      };
    });
  }

  async verifyAndCreateOrder(
    customerId: string,
    data: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature?: string;
      items: any[];
      tailorId?: string;
      totalPrice: number;
    },
  ) {
    if (!this.isMockMode && this.razorpay && data.razorpaySignature) {
      const text = data.razorpayOrderId + '|' + data.razorpayPaymentId;
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(text)
        .digest('hex');

      if (generatedSignature !== data.razorpaySignature) {
        throw new BadRequestException('Payment signature verification failed');
      }
    }

    const order = await this.prisma.order.create({
      data: {
        customerId,
        tailorId: data.tailorId || null,
        totalPrice: data.totalPrice,
        paymentId: data.razorpayPaymentId,
        status: data.tailorId ? 'ASSIGNED' : 'PAID',
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity || 1,
            isCustom: item.isCustom || false,
            preDesignedId: item.preDesignedId || null,
            customSpec: item.customSpec ? JSON.stringify(item.customSpec) : null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return {
      message: 'Order created successfully',
      orderId: order.id,
      order: {
        ...order,
        items: this.parseCustomSpec(order.items),
      },
    };
  }

  async getOrdersForCustomer(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
        tailor: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      ...o,
      items: this.parseCustomSpec(o.items),
    }));
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        customer: {
          select: { name: true, email: true },
        },
        tailor: {
          select: { name: true, email: true },
        },
        proposals: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      ...order,
      items: this.parseCustomSpec(order.items),
    };
  }

  async getOrdersForTailor(tailorId: string) {
    const orders = await this.prisma.order.findMany({
      where: { tailorId },
      include: {
        items: true,
        customer: {
          select: { name: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return orders.map((o) => ({
      ...o,
      items: this.parseCustomSpec(o.items),
    }));
  }

  async updateOrderStatus(tailorId: string, orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.tailorId !== tailorId) {
      throw new ForbiddenException('You are not authorized to update this order');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return {
      ...updated,
      items: this.parseCustomSpec(updated.items),
    };
  }

  async getCustomOrdersForDesigner() {
    const orders = await this.prisma.order.findMany({
      where: {
        items: {
          some: { isCustom: true },
        },
      },
      include: {
        items: true,
        customer: {
          select: { name: true, email: true },
        },
        proposals: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => ({
      ...o,
      items: this.parseCustomSpec(o.items),
    }));
  }

  async submitDesignerProposal(
    designerId: string,
    designerName: string,
    orderId: string,
    data: { mockupImageUrl: string; description: string },
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.designerId) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { designerId },
      });
    }

    return this.prisma.designProposal.create({
      data: {
        orderId,
        designerId,
        designerName,
        mockupImageUrl: data.mockupImageUrl,
        description: data.description,
        status: 'PENDING',
      },
    });
  }

  async respondToProposal(customerId: string, proposalId: string, approve: boolean) {
    const proposal = await this.prisma.designProposal.findUnique({
      where: { id: proposalId },
      include: { order: true },
    });

    if (!proposal) {
      throw new NotFoundException('Design proposal not found');
    }

    if (proposal.order.customerId !== customerId) {
      throw new UnauthorizedException('You do not own this order');
    }

    const updated = await this.prisma.designProposal.update({
      where: { id: proposalId },
      data: {
        status: approve ? 'APPROVED' : 'REJECTED',
      },
    });

    return {
      message: approve ? 'Proposal approved successfully' : 'Proposal rejected',
      proposal: updated,
    };
  }

  async getAllOrdersForAdmin() {
    const orders = await this.prisma.order.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true } },
        tailor: { select: { id: true, name: true } },
        items: true,
        proposals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => ({
      ...o,
      items: o.items.map((it) => {
        let parsedSpec = null;
        if (it.customSpec) {
          try {
            parsedSpec = typeof it.customSpec === 'string' ? JSON.parse(it.customSpec) : it.customSpec;
          } catch {}
        }
        return { ...it, customSpec: parsedSpec };
      }),
    }));
  }

  async adminUpdateOrder(orderId: string, data: { status?: string; tailorId?: string }, actorName = 'Admin') {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.tailorId !== undefined) {
      updateData.tailorId = data.tailorId === '' ? null : data.tailorId;
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { tailor: true },
    });

    // Write timeline entry
    if (data.status && data.status !== order.status) {
      await this.prisma.orderTimeline.create({
        data: {
          orderId,
          status: data.status,
          note: data.tailorId ? `Status changed & tailor reassigned by ${actorName}` : `Status changed to ${data.status} by ${actorName}`,
          actorName,
        },
      });
    } else if (data.tailorId !== undefined) {
      await this.prisma.orderTimeline.create({
        data: {
          orderId,
          status: order.status,
          note: data.tailorId ? `Tailor reassigned by ${actorName}` : `Tailor unassigned by ${actorName}`,
          actorName,
        },
      });
    }

    return updated;
  }

  async getOrdersForAdminPaginated(params: { skip?: number; take?: number; status?: string; search?: string; category?: string }) {
    const { skip = 0, take = 50, status, search, category } = params;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
        { id: { contains: search } },
      ];
    }
    if (category) {
      where.items = { some: { category } };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          tailor: { select: { id: true, name: true } },
          items: true,
          timeline: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map(o => ({ ...o, items: o.items.map(i => {
        let parsedSpec = null;
        if (i.customSpec) { try { parsedSpec = JSON.parse(i.customSpec); } catch {} }
        return { ...i, customSpec: parsedSpec };
      }) })),
      total, skip, take,
    };
  }

  async bulkCancelOrders(orderIds: string[], reason: string, actorName = 'Admin') {
    await this.prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason },
    });
    for (const orderId of orderIds) {
      await this.prisma.orderTimeline.create({
        data: { orderId, status: 'CANCELLED', note: `Bulk cancelled by ${actorName}: ${reason}`, actorName },
      });
    }
    return { cancelled: orderIds.length };
  }

  async bulkReassignOrders(orderIds: string[], tailorId: string, actorName = 'Admin') {
    await this.prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { tailorId, status: 'ASSIGNED' },
    });
    for (const orderId of orderIds) {
      await this.prisma.orderTimeline.create({
        data: { orderId, status: 'ASSIGNED', note: `Bulk reassigned by ${actorName}`, actorName },
      });
    }
    return { reassigned: orderIds.length };
  }

  async getOrderTimeline(orderId: string) {
    return this.prisma.orderTimeline.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
