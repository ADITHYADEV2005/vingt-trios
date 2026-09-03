import { Module } from '@nestjs/common';
import { TailorPortalController } from './tailor-portal.controller';
import { TailorPortalService } from './tailor-portal.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TailorPortalController],
  providers: [TailorPortalService, PrismaService],
  exports: [TailorPortalService],
})
export class TailorPortalModule {}
