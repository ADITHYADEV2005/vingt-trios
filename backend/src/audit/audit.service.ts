import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    actorId?: string;
    actorName?: string;
    action: string;
    target: string;
    payload?: Record<string, any>;
    ip?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorName: params.actorName || 'System',
        action: params.action,
        target: params.target,
        payload: JSON.stringify(params.payload || {}),
        ip: params.ip || '',
      },
    });
  }

  async getAll(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    const where = search
      ? {
          OR: [
            { action: { contains: search } },
            { actorName: { contains: search } },
            { target: { contains: search } },
          ],
        }
      : undefined;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { actor: { select: { name: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, skip, take };
  }
}
