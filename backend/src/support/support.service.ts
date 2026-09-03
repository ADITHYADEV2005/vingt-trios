import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async getTickets(params: { skip?: number; take?: number; status?: string; priority?: string; search?: string }) {
    const { skip = 0, take = 50, status, priority, search } = params;
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.OR = [{ subject: { contains: search } }, { customer: { name: { contains: search } } }];
    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true } },
          order: { select: { id: true, status: true, totalPrice: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip, take,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { tickets, total, skip, take };
  }

  async getTicketById(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        order: { include: { items: true } },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return {
      ...ticket,
      internalNotes: (() => { try { return JSON.parse(ticket.internalNotes); } catch { return []; } })(),
    };
  }

  async updateTicket(id: string, data: { status?: string; priority?: string; assigneeId?: string }) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async addInternalNote(id: string, note: string, staffName: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');
    let notes: any[] = [];
    try { notes = JSON.parse(ticket.internalNotes); } catch {}
    notes.push({ text: note, author: staffName, at: new Date().toISOString() });
    return this.prisma.supportTicket.update({ where: { id }, data: { internalNotes: JSON.stringify(notes) } });
  }

  async escalateTicket(id: string) {
    return this.prisma.supportTicket.update({ where: { id }, data: { priority: 'URGENT', status: 'IN_PROGRESS' } });
  }

  async createTicket(data: { customerId: string; subject: string; description: string; orderId?: string; priority?: string }) {
    return this.prisma.supportTicket.create({
      data: {
        customerId: data.customerId,
        subject: data.subject,
        description: data.description,
        orderId: data.orderId || null,
        priority: data.priority || 'NORMAL',
        updatedAt: new Date(),
      },
    });
  }

  async getCannedResponses() {
    return this.prisma.cannedResponse.findMany({ orderBy: { category: 'asc' } });
  }

  async createCannedResponse(data: { title: string; body: string; category?: string }) {
    return this.prisma.cannedResponse.create({ data: { ...data, category: data.category || 'GENERAL' } });
  }

  async deleteCannedResponse(id: string) {
    return this.prisma.cannedResponse.delete({ where: { id } });
  }
}
