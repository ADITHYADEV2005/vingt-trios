import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async getFabrics(category?: string) {
    const fabrics = await this.prisma.fabric.findMany({
      where: {
        ...(category ? { category } : {}),
        inStock: true,
      },
    });

    return fabrics.map((f) => ({
      ...f,
      colors: f.colors ? f.colors.split(',') : [],
    }));
  }

  async getPreDesignedGarments(category?: string) {
    return this.prisma.preDesignedGarment.findMany({
      where: {
        ...(category ? { category } : {}),
        inStock: true,
      },
    });
  }

  async getPreDesignedGarmentById(id: string) {
    const garment = await this.prisma.preDesignedGarment.findUnique({
      where: { id },
    });
    if (!garment) {
      throw new NotFoundException('Garment not found');
    }
    return garment;
  }

  async getTailors() {
    const tailors = await this.prisma.tailorProfile.findMany();
    return tailors.map((t) => ({
      ...t,
      portfolioImages: t.portfolioImages ? t.portfolioImages.split(',') : [],
    }));
  }

  async getTailorById(id: string) {
    const t = await this.prisma.tailorProfile.findUnique({
      where: { id },
    });
    if (!t) {
      throw new NotFoundException('Tailor profile not found');
    }
    return {
      ...t,
      portfolioImages: t.portfolioImages ? t.portfolioImages.split(',') : [],
    };
  }
}
