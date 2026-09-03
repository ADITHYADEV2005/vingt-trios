import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DesignersService {
  constructor(private prisma: PrismaService) {}

  async getApplicationQueue(params: { skip?: number; take?: number; status?: string }) {
    const { skip = 0, take = 50, status = 'PENDING' } = params;
    const [designers, total] = await Promise.all([
      this.prisma.designerProfile.findMany({
        where: { applicationStatus: status },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take,
      }),
      this.prisma.designerProfile.count({ where: { applicationStatus: status } }),
    ]);
    return { designers, total, skip, take };
  }

  async getAllDesigners(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    const where: any = { applicationStatus: 'APPROVED' };
    if (search) where.OR = [{ name: { contains: search } }];
    const [designers, total] = await Promise.all([
      this.prisma.designerProfile.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, suspended: true } } },
        orderBy: { totalEarnings: 'desc' },
        skip, take,
      }),
      this.prisma.designerProfile.count({ where }),
    ]);
    return { designers, total, skip, take };
  }

  async getDesignerProfile(id: string) {
    const profile = await this.prisma.designerProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, suspended: true } } },
    });
    if (!profile) throw new NotFoundException('Designer not found');

    const proposals = await this.prisma.designProposal.findMany({
      where: { designerId: profile.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { order: { select: { id: true, totalPrice: true, status: true } } },
    });

    const orderCount = await this.prisma.order.count({ where: { designerId: profile.userId } });
    return { profile, proposals, orderCount };
  }

  async approveApplication(id: string, approved: boolean) {
    const profile = await this.prisma.designerProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Designer application not found');
    return this.prisma.designerProfile.update({ where: { id }, data: { applicationStatus: approved ? 'APPROVED' : 'REJECTED' } });
  }

  async updateRoyaltyRate(id: string, rate: number) {
    return this.prisma.designerProfile.update({ where: { id }, data: { royaltyRate: rate } });
  }

  async suspendDesigner(profileId: string, suspended: boolean) {
    const profile = await this.prisma.designerProfile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Designer not found');
    return this.prisma.user.update({ where: { id: profile.userId }, data: { suspended } });
  }

  async getDesignUsageStats() {
    const designers = await this.prisma.designerProfile.findMany({
      where: { applicationStatus: 'APPROVED' },
      include: { user: { select: { name: true } } },
    });
    const stats = await Promise.all(
      designers.map(async (d) => {
        const orderCount = await this.prisma.order.count({ where: { designerId: d.userId } });
        const revenue = await this.prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: { designerId: d.userId, status: { not: 'CANCELLED' } },
        });
        return { designer: d, orderCount, totalRevenue: revenue._sum.totalPrice || 0 };
      }),
    );
    return stats.sort((a, b) => b.orderCount - a.orderCount);
  }
}
