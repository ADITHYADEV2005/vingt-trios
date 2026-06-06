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
import { TailorsService } from './tailors.service';
import { JwtService } from '@nestjs/jwt';

@Controller('tailors')
export class TailorsController {
  constructor(
    private tailorsService: TailorsService,
    private jwtService: JwtService,
  ) {}

  private getPayload(auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = auth.split(' ')[1];
    return this.jwtService.verify(token);
  }

  // Admin gets all tailors
  @Get()
  getAllTailors(@Headers('authorization') auth: string) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can view all tailors');
    }
    return this.tailorsService.getAllTailors();
  }

  // Admin registers a new tailor
  @Post('register')
  registerTailor(
    @Headers('authorization') auth: string,
    @Body() body: { name: string; email: string },
  ) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can register tailors');
    }
    return this.tailorsService.registerTailor(body.name, body.email);
  }

  // Tailor gets their own orders
  @Get('my-orders')
  getMyOrders(@Headers('authorization') auth: string) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'TAILOR') {
      throw new UnauthorizedException('Only tailors can access this');
    }
    return this.tailorsService.getMyOrders(payload.sub);
  }

  // Tailor gets their stats
  @Get('my-stats')
  getMyStats(@Headers('authorization') auth: string) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'TAILOR') {
      throw new UnauthorizedException('Only tailors can access this');
    }
    return this.tailorsService.getTailorStats(payload.sub);
  }

  // Tailor gets one specific order
  @Get('my-orders/:id')
  getOrderById(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'TAILOR') {
      throw new UnauthorizedException('Only tailors can access this');
    }
    return this.tailorsService.getOrderById(payload.sub, id);
  }

  // Tailor updates production status
  @Patch('my-orders/:id/status')
  updateStatus(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const payload = this.getPayload(auth);
    if (payload.role !== 'TAILOR') {
      throw new UnauthorizedException('Only tailors can update status');
    }
    return this.tailorsService.updateStatus(payload.sub, id, body.status);
  }
}
