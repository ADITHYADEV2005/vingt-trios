import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DesignerPortalService {
  constructor(private prisma: PrismaService) {}

  private async getDesignerProfile(userId: string) {
    let profile = await this.prisma.designerProfile.findUnique({ where: { userId } });
    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User account not found');
      profile = await this.prisma.designerProfile.create({
        data: {
          userId,
          name: user.name,
          brandName: `${user.name} Couture`,
          applicationStatus: 'APPROVED',
        },
      });
    }
    return profile;
  }

  // ─── DASHBOARD & OVERVIEW ───────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const profile = await this.getDesignerProfile(userId);

    const [liveCount, pendingCount, totalEarnings, topDesign, recentProposals] = await Promise.all([
      this.prisma.designCatalogItem.count({
        where: { designerProfileId: profile.id, status: 'APPROVED' },
      }),
      this.prisma.designCatalogItem.count({
        where: { designerProfileId: profile.id, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      }),
      this.prisma.designCatalogItem.aggregate({
        _sum: { revenueGenerated: true },
        where: { designerProfileId: profile.id },
      }),
      this.prisma.designCatalogItem.findFirst({
        where: { designerProfileId: profile.id },
        orderBy: { ordersGenerated: 'desc' },
      }),
      this.prisma.designProposal.findMany({
        where: { designerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { order: { select: { id: true, customer: { select: { name: true } } } } },
      }),
    ]);

    return {
      profile,
      stats: {
        liveDesigns: liveCount,
        pendingApproval: pendingCount,
        totalEarnings: (totalEarnings._sum.revenueGenerated || 0) * (profile.royaltyRate / 100),
        topDesign: topDesign ? { id: topDesign.id, title: topDesign.title, orders: topDesign.ordersGenerated } : null,
        followersCount: profile.followersCount,
        royaltyRate: profile.royaltyRate,
      },
      recentProposals,
    };
  }

  // ─── DESIGN CATALOG & STUDIO ────────────────────────────────────────────────

  async getDesigns(userId: string, params: { status?: string; search?: string; skip?: number; take?: number }) {
    const profile = await this.getDesignerProfile(userId);
    const { status, search, skip = 0, take = 50 } = params;

    const where: any = { designerProfileId: profile.id };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const [designs, total] = await Promise.all([
      this.prisma.designCatalogItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { _count: { select: { versions: true, comments: true } } },
      }),
      this.prisma.designCatalogItem.count({ where }),
    ]);

    return { designs, total, skip, take };
  }

  async createDesign(userId: string, data: any) {
    const profile = await this.getDesignerProfile(userId);

    const design = await this.prisma.designCatalogItem.create({
      data: {
        designerProfileId: profile.id,
        title: data.title,
        description: data.description || '',
        tags: data.tags || '',
        category: data.category || 'SHIRT',
        compatibleFabrics: data.compatibleFabrics || 'ALL',
        mockupImageUrl: data.mockupImageUrl || '/image/BLAZER.jpg',
        sketchUrl: data.sketchUrl || null,
        status: data.isDraft ? 'DRAFT' : 'SUBMITTED',
        licensingTier: data.licensingTier || 'OPEN_USE',
      },
    });

    // Record initial version 1
    await this.prisma.designVersionHistory.create({
      data: {
        designId: design.id,
        version: 1,
        mockupImageUrl: design.mockupImageUrl,
        changelogNote: 'Initial design upload',
      },
    });

    return design;
  }

  async getDesignDetail(userId: string, designId: string) {
    const profile = await this.getDesignerProfile(userId);
    const design = await this.prisma.designCatalogItem.findUnique({
      where: { id: designId },
      include: {
        versions: { orderBy: { version: 'desc' } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { name: true, role: true } } },
        },
      },
    });

    if (!design) throw new NotFoundException('Design not found');
    if (design.designerProfileId !== profile.id) throw new ForbiddenException('Not your design');

    return design;
  }

  async updateDesign(userId: string, designId: string, data: any) {
    const profile = await this.getDesignerProfile(userId);
    const design = await this.prisma.designCatalogItem.findUnique({ where: { id: designId } });

    if (!design) throw new NotFoundException('Design not found');
    if (design.designerProfileId !== profile.id) throw new ForbiddenException('Not your design');

    const newVersion = design.version + 1;

    const updated = await this.prisma.designCatalogItem.update({
      where: { id: designId },
      data: {
        title: data.title || design.title,
        description: data.description !== undefined ? data.description : design.description,
        tags: data.tags !== undefined ? data.tags : design.tags,
        category: data.category || design.category,
        compatibleFabrics: data.compatibleFabrics || design.compatibleFabrics,
        mockupImageUrl: data.mockupImageUrl || design.mockupImageUrl,
        sketchUrl: data.sketchUrl !== undefined ? data.sketchUrl : design.sketchUrl,
        licensingTier: data.licensingTier || design.licensingTier,
        status: data.isSubmit ? 'SUBMITTED' : design.status,
        version: newVersion,
        updatedAt: new Date(),
      },
    });

    // Record version history
    await this.prisma.designVersionHistory.create({
      data: {
        designId,
        version: newVersion,
        mockupImageUrl: updated.mockupImageUrl,
        changelogNote: data.changelogNote || `Updated version ${newVersion}`,
      },
    });

    return updated;
  }

  async addComment(userId: string, designId: string, comment: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.designComment.create({
      data: {
        designId,
        senderId: userId,
        senderRole: user.role,
        comment,
      },
      include: { sender: { select: { name: true, role: true } } },
    });
  }

  // ─── MONETIZATION & ROYALTIES ────────────────────────────────────────────────

  async getMonetization(userId: string) {
    const profile = await this.getDesignerProfile(userId);

    const designs = await this.prisma.designCatalogItem.findMany({
      where: { designerProfileId: profile.id },
      orderBy: { revenueGenerated: 'desc' },
    });

    const totalGross = designs.reduce((s, d) => s + d.revenueGenerated, 0);
    const totalRoyalties = totalGross * (profile.royaltyRate / 100);

    return {
      summary: {
        royaltyRate: profile.royaltyRate,
        totalGrossGenerated: totalGross,
        totalRoyaltiesEarned: totalRoyalties,
        platformShare: totalGross - totalRoyalties,
      },
      designsBreakdown: designs.map(d => ({
        id: d.id,
        title: d.title,
        status: d.status,
        licensingTier: d.licensingTier,
        ordersGenerated: d.ordersGenerated,
        revenueGenerated: d.revenueGenerated,
        designerRoyalty: d.revenueGenerated * (profile.royaltyRate / 100),
      })),
    };
  }

  async getAnalytics(userId: string) {
    const profile = await this.getDesignerProfile(userId);
    return this.prisma.designCatalogItem.findMany({
      where: { designerProfileId: profile.id },
      orderBy: { ordersGenerated: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        viewsCount: true,
        favoritesCount: true,
        ordersGenerated: true,
        revenueGenerated: true,
      },
    });
  }

  // ─── BRAND PROFILE ──────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    return this.getDesignerProfile(userId);
  }

  async updateProfile(userId: string, data: any) {
    const profile = await this.getDesignerProfile(userId);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.brandName !== undefined) updateData.brandName = data.brandName;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.portfolioImages !== undefined) updateData.portfolioImages = data.portfolioImages;
    if (data.socialLinks !== undefined) updateData.socialLinks = typeof data.socialLinks === 'string' ? data.socialLinks : JSON.stringify(data.socialLinks);
    if (data.bankAccount !== undefined) updateData.bankAccount = typeof data.bankAccount === 'string' ? data.bankAccount : JSON.stringify(data.bankAccount);

    return this.prisma.designerProfile.update({
      where: { id: profile.id },
      data: updateData,
    });
  }

  // ─── PUBLIC STOREFRONT ──────────────────────────────────────────────────────

  async getPublicStorefront(designerProfileId: string) {
    const profile = await this.prisma.designerProfile.findUnique({
      where: { id: designerProfileId },
      include: {
        catalogItems: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) throw new NotFoundException('Designer profile not found');
    return profile;
  }

  async toggleFollow(userId: string, designerProfileId: string) {
    const existing = await this.prisma.designerFollower.findFirst({
      where: { designerProfileId, userId },
    });

    if (existing) {
      await this.prisma.designerFollower.delete({ where: { id: existing.id } });
      await this.prisma.designerProfile.update({
        where: { id: designerProfileId },
        data: { followersCount: { decrement: 1 } },
      });
      return { following: false };
    } else {
      await this.prisma.designerFollower.create({
        data: { designerProfileId, userId },
      });
      await this.prisma.designerProfile.update({
        where: { id: designerProfileId },
        data: { followersCount: { increment: 1 } },
      });
      return { following: true };
    }
  }
}
