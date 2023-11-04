import {
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { RewardRepository } from '../repositories/reward.repository';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { Reward } from '../entities/reward.entity';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CouponService } from './coupon.service';
import { PlayerCoupon } from '../entities/player-coupon.entity';

@Injectable()
export class RewardService {
  constructor(
    private rewardRepository: RewardRepository,
    @Inject(forwardRef(() => CouponService))
    private couponService: CouponService,
  ) {}

  async createReward(rewardDto: CreateRewardDto): Promise<Reward> {
    return await this.rewardRepository.save(rewardDto);
  }

  async getActiveRewardWithCouponsOrThrow(rewardId: number): Promise<Reward> {
    const currentTimestamp = new Date();

    const rewardWithCoupons = await this.rewardRepository.findOne({
      where: {
        id: rewardId,
        startDate: LessThanOrEqual(currentTimestamp),
        endDate: MoreThanOrEqual(currentTimestamp),
      },
      relations: ['coupons'],
    });

    if (!rewardWithCoupons) {
      throw new NotFoundException('Reward not found');
    }

    return rewardWithCoupons;
  }

  async checkRewardCouponAvailabilityOrThrow(
    rewardWithCoupons: Reward,
    playerCoupons: PlayerCoupon[],
  ): Promise<boolean> {
    // Check if reward reached campaign limit
    if (playerCoupons.length >= rewardWithCoupons.totalLimit) {
      throw new NotAcceptableException('Total limit reached for this reward');
    }

    // Check reward reached daily limit
    const today = new Date();
    const todayCoupons = playerCoupons.filter(
      (playerCoupon) =>
        playerCoupon.redeemedAt.getDate() === today.getDate() &&
        playerCoupon.redeemedAt.getMonth() === today.getMonth() &&
        playerCoupon.redeemedAt.getFullYear() === today.getFullYear(),
    );

    if (todayCoupons.length >= rewardWithCoupons.perDayLimit) {
      throw new NotAcceptableException('Daily limit reached for this reward');
    }

    return true;
  }
}
