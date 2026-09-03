import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuditModule],
  controllers: [CatalogController],
  providers: [CatalogService, PrismaService],
})
export class CatalogModule {}
