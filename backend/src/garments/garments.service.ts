import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GarmentsService {
  constructor(private prisma: PrismaService) {}

  async createGarment(data: {
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
  }) {
    // Verify fabric exists
    const fabric = await this.prisma.fabric.findUnique({
      where: { id: data.fabricId },
    });
    if (!fabric) throw new NotFoundException('Fabric not found');

    return this.prisma.garment.create({ data });
  }

  async getAllGarments() {
    return this.prisma.garment.findMany({
      include: { fabric: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGarmentById(id: string) {
    const garment = await this.prisma.garment.findUnique({
      where: { id },
      include: { fabric: true },
    });
    if (!garment) throw new NotFoundException('Garment not found');
    return garment;
  }

  async updateGarment(id: string, data: {
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
  }) {
    const garment = await this.prisma.garment.findUnique({ where: { id } });
    if (!garment) throw new NotFoundException('Garment not found');
    return this.prisma.garment.update({ where: { id }, data });
  }

  async deleteGarment(id: string) {
    const garment = await this.prisma.garment.findUnique({ where: { id } });
    if (!garment) throw new NotFoundException('Garment not found');
    await this.prisma.garment.delete({ where: { id } });
    return { message: 'Garment deleted successfully' };
  }

  async getCustomizationOptions() {
    return {
      collar: [
        'Classic Spread',
        'Button-Down',
        'Mandarin',
        'Cutaway',
        'Point',
        'Club',
      ],
      sleeve: [
        'Full Sleeve',
        'Half Sleeve',
        'Three-Quarter Sleeve',
      ],
      cuff: [
        'Single Button',
        'Double Button',
        'French Cuff',
        'Barrel Cuff',
      ],
      pocket: [
        'No Pocket',
        'Single Chest Pocket',
        'Dual Pockets',
        'Patch Pocket',
      ],
      buttons: [
        'Standard Plastic',
        'Mother of Pearl',
        'Metal',
        'Contrast Colour',
      ],
      length: [
        'Standard',
        'Long (Untucked)',
        'Short (Cropped)',
      ],
    };
  }
}
