import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MeasurementsModule } from './measurements/measurements.module';

@Module({
  imports: [AuthModule, UsersModule, MeasurementsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
