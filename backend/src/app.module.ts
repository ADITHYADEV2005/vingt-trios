import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { TailorsModule } from './tailors/tailors.module';
import { DesignersModule } from './designers/designers.module';
import { CatalogModule } from './catalog/catalog.module';
import { FinanceModule } from './finance/finance.module';
import { SupportModule } from './support/support.module';
import { MarketingModule } from './marketing/marketing.module';
import { TailorPortalModule } from './tailor-portal/tailor-portal.module';
import { DesignerPortalModule } from './designer-portal/designer-portal.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    AuditModule,
    TailorsModule,
    DesignersModule,
    CatalogModule,
    FinanceModule,
    SupportModule,
    MarketingModule,
    TailorPortalModule,
    DesignerPortalModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

