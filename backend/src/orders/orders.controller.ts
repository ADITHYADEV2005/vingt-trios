import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtService } from '@nestjs/jwt';

@Controller('orders')
export class OrdersController {
  constructor(
    private ordersService: OrdersService,
    private jwtService: JwtService,
  ) {}

  private getPayload(auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = auth.split(' ')[1];
    return this.jwtService.verify(token);
  }

  // Customer places an order
  @Post()
  create(
    @Headers('authorization') auth: string,
    @Body() body: {
      garmentId: string;
      measurementId: string;
      totalPrice: number;
    },
  ) {
    const payload = this.getPayload(auth);
    return this.ordersService.createOrder(payload.sub, body);
  }

  // Customer sees their own orders
  @Get('my')
  getMyOrders(@Headers('authorization') auth: string) {
    const payload = this.getPayload(auth);
    return this.ordersService.getMyOrders(payload.sub);
  }

  // Admin sees all orders
  @Get('all')
  getAllOrders(@Headers('authorization') auth: string) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can view all orders');
    }
    return this.ordersService.getAllOrders();
  }

  // Get one order by ID
  @Get(':id')
  getOne(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const payload = this.getPayload(auth);
    return this.ordersService.getOrderById(payload.sub, id);
  }

  // Confirm payment (called after Razorpay confirms)
  @Patch(':id/confirm-payment')
  confirmPayment(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can confirm payments');
    }
    return this.ordersService.confirmPayment(id);
  }

  // Tailor or admin updates production status
  @Patch(':id/status')
  updateStatus(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'ADMIN' && payload.role !== 'TAILOR') {
      throw new UnauthorizedException('Only admins or tailors can update status');
    }
    return this.ordersService.updateOrderStatus(id, body.status);
  }

  // Admin assigns tailor to order
  @Patch(':id/assign-tailor')
  assignTailor(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { tailorId: string },
  ) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can assign tailors');
    }
    return this.ordersService.assignTailor(id, body.tailorId);
  }
}
