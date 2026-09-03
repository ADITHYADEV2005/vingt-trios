import { Module } from '@nestjs/common';
import { TailorsController } from './tailors.controller';
import { TailorsService } from './tailors.service';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuditModule],
  controllers: [TailorsController],
  providers: [TailorsService, PrismaService],
})
export class TailorsModule {}
