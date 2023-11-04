import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Reward } from './entities/reward.entity';
import { PlayerCoupon } from './entities/player-coupon.entity';
import { CouponController } from './controllers/coupon.controller';
import { CouponService } from './services/coupon.service';
import { CouponRepository } from './repositories/coupon.repository';
import { PlayerCouponRepository } from './repositories/player-coupon.repository';
import { RewardRepository } from './repositories/reward.repository';
import { RewardService } from './services/reward.service';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    PlayerModule,
    TypeOrmModule.forFeature([Coupon, PlayerCoupon, Reward]),
  ],
  controllers: [CouponController],
  providers: [
    CouponService,
    RewardService,
    CouponRepository,
    PlayerCouponRepository,
    RewardRepository,
  ],
  exports: [],
})
export class CouponModule {}
