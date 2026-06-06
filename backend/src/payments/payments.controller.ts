import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtService } from '@nestjs/jwt';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private jwtService: JwtService,
  ) {}

  private getPayload(auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = auth.split(' ')[1];
    return this.jwtService.verify(token);
  }

  // Create a Razorpay payment order
  @Post('create-order/:orderId')
  createOrder(
    @Headers('authorization') auth: string,
    @Param('orderId') orderId: string,
  ) {
    const payload = this.getPayload(auth);
    return this.paymentsService.createPaymentOrder(orderId, payload.sub);
  }

  // Verify payment after customer pays
  @Post('verify')
  verifyPayment(
    @Headers('authorization') auth: string,
    @Body() body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      orderId: string;
    },
  ) {
    const payload = this.getPayload(auth);
    return this.paymentsService.verifyPayment({
      ...body,
      userId: payload.sub,
    });
  }

  // Get payment status
  @Get('status/:orderId')
  getStatus(
    @Headers('authorization') auth: string,
    @Param('orderId') orderId: string,
  ) {
    const payload = this.getPayload(auth);
    return this.paymentsService.getPaymentStatus(orderId, payload.sub);
  }
}
