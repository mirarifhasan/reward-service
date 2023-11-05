import { Module } from '@nestjs/common';
import typeorm from './typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlayerModule } from './player/player.module';
import { CouponModule } from './coupon/coupon.module';
import { IndexModule } from './index/index.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    IndexModule,
    PlayerModule,
    CouponModule,
  ],
})
export class AppModule {}
