import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from '@/resources/admin/admin.module';
import { UserModule } from '@/resources/user/user.module';
import { ProductModule } from '@/resources/product/product.module';
import { TransactionModule } from '@/resources/transaction/transaction.module';
import { PaymentModule } from '@/resources/payment/payment.module';
import { ShipmentModule } from '@/resources/shipment/shipment.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { JwtModule } from '@nestjs/jwt';
import { NoticeModule } from '@/resources/notice/notice.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 13306,
      username: 'root',
      password: '',
      database: 'service',
      entities: ['dist/**/*.entity{.ts,.js}'],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
      logging: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_HASH,
      signOptions: { expiresIn: '1d' },
    }),
    AdminModule,
    UserModule,
    ProductModule,
    TransactionModule,
    PaymentModule,
    ShipmentModule,
    NoticeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
