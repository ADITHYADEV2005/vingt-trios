import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { FabricsService } from './fabrics.service';
import { JwtService } from '@nestjs/jwt';

@Controller('fabrics')
export class FabricsController {
  constructor(
    private fabricsService: FabricsService,
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

  // Anyone can browse fabrics
  @Get()
  findAll(
    @Query('material') material?: string,
    @Query('isDeadstock') isDeadstock?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.fabricsService.getAllFabrics({
      material,
      isDeadstock: isDeadstock === 'true' ? true : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  // Eco-Luxury deadstock section
  @Get('deadstock')
  getDeadstock() {
    return this.fabricsService.getDeadstockFabrics();
  }

  // Get one fabric by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fabricsService.getFabricById(id);
  }

  // Only ADMIN can create fabrics
  @Post()
  create(
    @Headers('authorization') auth: string,
    @Body() body: {
      name: string;
      material: string;
      color: string;
      pricePerMtr: number;
      stock: number;
      isDeadstock?: boolean;
      origin?: string;
      imageUrl?: string;
    },
  ) {
    const role = this.getRole(auth);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can add fabrics');
    }
    return this.fabricsService.createFabric(body);
  }

  // Only ADMIN can update fabrics
  @Patch(':id')
  update(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      material?: string;
      color?: string;
      pricePerMtr?: number;
      stock?: number;
      isDeadstock?: boolean;
      origin?: string;
      imageUrl?: string;
    },
  ) {
    const role = this.getRole(auth);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can update fabrics');
    }
    return this.fabricsService.updateFabric(id, body);
  }

  // Only ADMIN can delete fabrics
  @Delete(':id')
  remove(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const role = this.getRole(auth);
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can delete fabrics');
    }
    return this.fabricsService.deleteFabric(id);
  }
}
