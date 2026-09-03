import { Module } from '@nestjs/common';
import { DesignersController } from './designers.controller';
import { DesignersService } from './designers.service';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuditModule],
  controllers: [DesignersController],
  providers: [DesignersService, PrismaService],
})
export class DesignersModule {}
