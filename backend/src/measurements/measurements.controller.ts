import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { JwtService } from '@nestjs/jwt';

@Controller('measurements')
export class MeasurementsController {
  constructor(
    private measurementsService: MeasurementsService,
    private jwtService: JwtService,
  ) {}

  private getUserId(auth: string): string {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = auth.split(' ')[1];
    const payload = this.jwtService.verify(token);
    return payload.sub;
  }

  @Post()
  create(
    @Headers('authorization') auth: string,
    @Body() body: {
      label: string;
      chest: number;
      waist: number;
      hips: number;
      shoulder: number;
      sleeveLen: number;
      neck: number;
    },
  ) {
    const userId = this.getUserId(auth);
    return this.measurementsService.createMeasurement(userId, body);
  }

  @Get()
  findAll(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    return this.measurementsService.getMeasurements(userId);
  }

  @Get(':id')
  findOne(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(auth);
    return this.measurementsService.getMeasurementById(userId, id);
  }

  @Patch(':id')
  update(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: {
      label?: string;
      chest?: number;
      waist?: number;
      hips?: number;
      shoulder?: number;
      sleeveLen?: number;
      neck?: number;
    },
  ) {
    const userId = this.getUserId(auth);
    return this.measurementsService.updateMeasurement(userId, id, body);
  }

  @Delete(':id')
  remove(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(auth);
    return this.measurementsService.deleteMeasurement(userId, id);
  }
}
