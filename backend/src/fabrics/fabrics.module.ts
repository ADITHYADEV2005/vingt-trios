import { Module } from '@nestjs/common';
import { FabricsService } from './fabrics.service';
import { FabricsController } from './fabrics.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FabricsController],
  providers: [FabricsService, PrismaService],
})
export class FabricsModule {}
