import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'CUSTOMER',
      },
    });
  }

  async updateProfile(userId: string, data: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
