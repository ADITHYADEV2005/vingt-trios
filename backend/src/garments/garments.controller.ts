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
import { GarmentsService } from './garments.service';
import { JwtService } from '@nestjs/jwt';

@Controller('garments')
export class GarmentsController {
  constructor(
    private garmentsService: GarmentsService,
    private jwtService: JwtService,
  ) {}

  private getRole(auth: string): string {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = auth.split(' ')[1];
    const payload = this.jwtService.verify(token);
    return payload.role;
  }

  // Anyone can browse garments
  @Get()
  findAll() {
    return this.garmentsService.getAllGarments();
  }

  // Get customization options
  @Get('options')
  getOptions() {
    return this.garmentsService.getCustomizationOptions();
  }

  // Get one garment
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garmentsService.getGarmentById(id);
  }

  // Only ADMIN can create garments
  @Post()
  create(
    @Headers('authorization') auth: string,
    @Body() body: {
      name: string;
      basePrice: number;
      collar: string;
      sleeve: string;
      cuff: string;
      pocket: string;
      buttons: string;
      length: string;
      embroidery?: string;
      notes?: string;
      fabricId: string;
    },
  ) {
    const role = this.getRole(auth);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can create garments');
    }
    return this.garmentsService.createGarment(body);
  }

  // Only ADMIN can update garments
  @Patch(':id')
  update(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      basePrice?: number;
      collar?: string;
      sleeve?: string;
      cuff?: string;
      pocket?: string;
      buttons?: string;
      length?: string;
      embroidery?: string;
      notes?: string;
      fabricId?: string;
    },
  ) {
    const role = this.getRole(auth);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can update garments');
    }
    return this.garmentsService.updateGarment(id, body);
  }

  // Only ADMIN can delete garments
  @Delete(':id')
  remove(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const role = this.getRole(auth);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can delete garments');
    }
    return this.garmentsService.deleteGarment(id);
  }
}
