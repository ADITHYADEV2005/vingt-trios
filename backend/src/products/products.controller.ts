import { Controller, Get, Query, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Category } from '../common/types';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('fabrics')
  async getFabrics(@Query('category') category?: Category) {
    return this.productsService.getFabrics(category);
  }

  @Get('garments')
  async getPreDesignedGarments(@Query('category') category?: Category) {
    return this.productsService.getPreDesignedGarments(category);
  }

  @Get('garments/:id')
  async getPreDesignedGarmentById(@Param('id') id: string) {
    return this.productsService.getPreDesignedGarmentById(id);
  }

  @Get('tailors')
  async getTailors() {
    return this.productsService.getTailors();
  }

  @Get('tailors/:id')
  async getTailorById(@Param('id') id: string) {
    return this.productsService.getTailorById(id);
  }
}
