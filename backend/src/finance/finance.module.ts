import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuditModule],
  controllers: [FinanceController],
  providers: [FinanceService, PrismaService],
})
export class FinanceModule {}
