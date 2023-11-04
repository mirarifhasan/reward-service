import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PlayerService } from './player/services/player.service';
import { RewardService } from './coupon/services/reward.service';
import { CreateRewardDto } from './coupon/dto/create-reward.dto';
import { CouponService } from './coupon/services/coupon.service';

const campaignStartOn = new Date();
campaignStartOn.setHours(0, 0, 0, 0);

const campaignEndOn = new Date(campaignStartOn);
campaignEndOn.setDate(campaignStartOn.getDate() + 7);

const rewardObjs: CreateRewardDto[] = [
  {
    name: 'Airline ticket',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 1,
    totalLimit: 1,
  },
  {
    name: 'Nike shoes',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 2,
    totalLimit: 3,
  },
  {
    name: 'Apple watch SE',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 2,
    totalLimit: 4,
  },
  {
    name: 'AirPods Pro',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 2,
    totalLimit: 6,
  },
  {
    name: 'Power Bank',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 2,
    totalLimit: 8,
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const playerService = app.get(PlayerService);
  const rewardService = app.get(RewardService);
  const couponService = app.get(CouponService);

  // Create 10 players
  for (let i = 0; i < 10; i++) {
    await playerService.createPlayer({
      name: `Player ${i + 1}`,
    });
  }

  // Create 5 rewards and coupons
  for (let i = 0; i < rewardObjs.length; i++) {
    const reward = await rewardService.createReward(rewardObjs[i]);

    for (let j = 0; j < reward.totalLimit; j++) {
      const couponValue = `CPN-${reward.name}-${j + 1}`;
      await couponService.createCoupon(couponValue, reward.id);
    }
  }

  await app.close();
}
bootstrap();
