import { Controller, Post, Get, Body, UseGuards, Req, Param, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderStatus, Role } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('create-payment')
  async createPayment(@Req() req: any, @Body() body: { items: any[]; tailorId?: string }) {
    return this.ordersService.createRazorpayOrder(req.user.id, body);
  }

  @Post('verify-payment')
  async verifyPayment(
    @Req() req: any,
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature?: string;
      items: any[];
      tailorId?: string;
      totalPrice: number;
    },
  ) {
    return this.ordersService.verifyAndCreateOrder(req.user.id, body);
  }

  @Get('customer')
  async getCustomerOrders(@Req() req: any) {
    return this.ordersService.getOrdersForCustomer(req.user.id);
  }

  @Get('detail/:id')
  async getOrderById(@Req() req: any, @Param('id') id: string) {
    const order = await this.ordersService.getOrderById(id);
    if (
      req.user.role === Role.CUSTOMER &&
      order.customerId !== req.user.id
    ) {
      throw new ForbiddenException('Forbidden resource');
    }
    if (
      req.user.role === Role.TAILOR &&
      order.tailorId !== req.user.id
    ) {
      throw new ForbiddenException('Forbidden resource');
    }
    return order;
  }

  // --- TAILOR PORTAL ---
  @Get('tailor/queue')
  async getTailorQueue(@Req() req: any) {
    if (req.user.role !== Role.TAILOR) {
      throw new ForbiddenException('Only tailors can view this queue');
    }
    return this.ordersService.getOrdersForTailor(req.user.id);
  }

  @Post('tailor/status')
  async updateStatus(
    @Req() req: any,
    @Body() body: { orderId: string; status: OrderStatus },
  ) {
    if (req.user.role !== Role.TAILOR) {
      throw new ForbiddenException('Only tailors can modify status');
    }
    return this.ordersService.updateOrderStatus(req.user.id, body.orderId, body.status);
  }

  // --- DESIGNER PORTAL ---
  @Get('designer/queue')
  async getDesignerQueue(@Req() req: any) {
    if (req.user.role !== Role.DESIGNER) {
      throw new ForbiddenException('Only fashion designers can access this queue');
    }
    return this.ordersService.getCustomOrdersForDesigner();
  }

  @Post('designer/proposal')
  async submitProposal(
    @Req() req: any,
    @Body() body: { orderId: string; mockupImageUrl: string; description: string },
  ) {
    if (req.user.role !== Role.DESIGNER) {
      throw new ForbiddenException('Only designers can submit proposals');
    }
    return this.ordersService.submitDesignerProposal(
      req.user.id,
      req.user.name,
      body.orderId,
      body,
    );
  }

  @Post('proposal/:id/respond')
  async respondToProposal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { approve: boolean },
  ) {
    if (req.user.role !== Role.CUSTOMER) {
      throw new ForbiddenException('Only customers can approve or reject proposals');
    }
    return this.ordersService.respondToProposal(req.user.id, id, body.approve);
  }

  // --- ADMIN PORTAL ---
  @Get('admin/list')
  async getAdminOrders(@Req() req: any) {
    if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can view all orders');
    }
    return this.ordersService.getAllOrdersForAdmin();
  }

  @Post('admin/update')
  async adminUpdateOrder(
    @Req() req: any,
    @Body() body: { orderId: string; status?: OrderStatus; tailorId?: string },
  ) {
    if (req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only administrators can edit orders');
    }
    return this.ordersService.adminUpdateOrder(body.orderId, body);
  }
}
