import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import configuration from './config/configuration.js';
import { DatabaseModule } from './database/database.module.js';
import { IsnModule } from './modules/isn/isn.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { ContentModule } from './modules/content/content.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const observeImports = process.env.OBSERVE_APP_KEY
  ? [
      ObserveModule.forRoot({
        appKey: process.env.OBSERVE_APP_KEY,
        appSecret: process.env.OBSERVE_APP_SECRET ?? '',
        serviceId: 'jmbattaglia-backend',
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    IsnModule,
    CatalogModule,
    OrdersModule,
    ContentModule,
    AuthModule,
    ...observeImports,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
