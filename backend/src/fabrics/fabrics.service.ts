import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FabricsService {
  constructor(private prisma: PrismaService) {}

  async createFabric(data: {
    name: string;
    material: string;
    color: string;
    pricePerMtr: number;
    stock: number;
    isDeadstock?: boolean;
    origin?: string;
    imageUrl?: string;
  }) {
    return this.prisma.fabric.create({ data });
  }

  async getAllFabrics(filters?: {
    material?: string;
    isDeadstock?: boolean;
    maxPrice?: number;
  }) {
    return this.prisma.fabric.findMany({
      where: {
        ...(filters?.material && { material: filters.material }),
        ...(filters?.isDeadstock !== undefined && {
          isDeadstock: filters.isDeadstock,
        }),
        ...(filters?.maxPrice && {
          pricePerMtr: { lte: filters.maxPrice },
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFabricById(id: string) {
    const fabric = await this.prisma.fabric.findUnique({ where: { id } });
    if (!fabric) throw new NotFoundException('Fabric not found');
    return fabric;
  }

  async getDeadstockFabrics() {
    return this.prisma.fabric.findMany({
      where: { isDeadstock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFabric(id: string, data: {
    name?: string;
    material?: string;
    color?: string;
    pricePerMtr?: number;
    stock?: number;
    isDeadstock?: boolean;
    origin?: string;
    imageUrl?: string;
  }) {
    const fabric = await this.prisma.fabric.findUnique({ where: { id } });
    if (!fabric) throw new NotFoundException('Fabric not found');
    return this.prisma.fabric.update({ where: { id }, data });
  }

  async deleteFabric(id: string) {
    const fabric = await this.prisma.fabric.findUnique({ where: { id } });
    if (!fabric) throw new NotFoundException('Fabric not found');
    await this.prisma.fabric.delete({ where: { id } });
    return { message: 'Fabric deleted successfully' };
  }
}
