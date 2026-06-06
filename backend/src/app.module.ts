import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { FabricsModule } from './fabrics/fabrics.module';

@Module({
  imports: [AuthModule, UsersModule, MeasurementsModule, FabricsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
