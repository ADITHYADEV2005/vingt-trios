import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../prisma.service';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [AuditModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, Reflector],
  exports: [AdminService],
})
export class AdminModule {}
