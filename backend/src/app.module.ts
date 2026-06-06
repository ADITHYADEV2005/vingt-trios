import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { FabricsModule } from './fabrics/fabrics.module';
import { GarmentsModule } from './garments/garments.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [AuthModule, UsersModule, MeasurementsModule, FabricsModule, GarmentsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
