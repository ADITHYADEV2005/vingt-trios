import { Module } from '@nestjs/common';
import { TailorsService } from './tailors.service';
import { TailorsController } from './tailors.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [TailorsController],
  providers: [TailorsService, PrismaService],
})
export class TailorsModule {}
