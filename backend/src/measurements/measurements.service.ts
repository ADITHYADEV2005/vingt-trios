import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MeasurementsService {
  constructor(private prisma: PrismaService) {}

  async createMeasurement(userId: string, data: {
    label: string;
    chest: number;
    waist: number;
    hips: number;
    shoulder: number;
    sleeveLen: number;
    neck: number;
  }) {
    // Find or create the user's profile first
    let profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.profile.create({
        data: { userId },
      });
    }

    return this.prisma.measurement.create({
      data: {
        profileId: profile.id,
        label: data.label,
        chest: data.chest,
        waist: data.waist,
        hips: data.hips,
        shoulder: data.shoulder,
        sleeveLen: data.sleeveLen,
        neck: data.neck,
      },
    });
  }

  async getMeasurements(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { measurements: true },
    });

    if (!profile) return [];
    return profile.measurements;
  }

  async getMeasurementById(userId: string, measurementId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const measurement = await this.prisma.measurement.findFirst({
      where: { id: measurementId, profileId: profile.id },
    });

    if (!measurement) throw new NotFoundException('Measurement not found');
    return measurement;
  }

  async updateMeasurement(userId: string, measurementId: string, data: {
    label?: string;
    chest?: number;
    waist?: number;
    hips?: number;
    shoulder?: number;
    sleeveLen?: number;
    neck?: number;
  }) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const measurement = await this.prisma.measurement.findFirst({
      where: { id: measurementId, profileId: profile.id },
    });

    if (!measurement) throw new NotFoundException('Measurement not found');

    return this.prisma.measurement.update({
      where: { id: measurementId },
      data,
    });
  }

  async deleteMeasurement(userId: string, measurementId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const measurement = await this.prisma.measurement.findFirst({
      where: { id: measurementId, profileId: profile.id },
    });

    if (!measurement) throw new NotFoundException('Measurement not found');

    await this.prisma.measurement.delete({ where: { id: measurementId } });
    return { message: 'Measurement deleted successfully' };
  }
}
