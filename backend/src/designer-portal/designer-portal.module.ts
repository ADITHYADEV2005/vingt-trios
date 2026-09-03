import { Module } from '@nestjs/common';
import { DesignerPortalController } from './designer-portal.controller';
import { DesignerPortalService } from './designer-portal.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DesignerPortalController],
  providers: [DesignerPortalService, PrismaService],
  exports: [DesignerPortalService],
})
export class DesignerPortalModule {}
