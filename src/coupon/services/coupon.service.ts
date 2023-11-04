import { Injectable, NotFoundException } from '@nestjs/common';
import { CouponRepository } from '../repositories/coupon.repository';
import { RewardService } from './reward.service';
import { CouponRedeemInputDto } from '../dto/coupon-redeem-input.dto';
import { PlayerService } from 'src/player/services/player.service';
import { PlayerCouponRepository } from '../repositories/player-coupon.repository';
import { Coupon } from '../entities/coupon.entity';
import { In } from 'typeorm';
import { PlayerCoupon } from '../entities/player-coupon.entity';
import { Reward } from '../entities/reward.entity';
import { plainToInstance } from 'class-transformer';
import { CouponRedeemOutputDto } from '../dto/coupon-redeem-output.dto';
import { COUPON_NOT_AVAILABLE } from 'src/errors';

@Injectable()
export class CouponService {
  constructor(
    private couponRepository: CouponRepository,
    private playerCouponRepository: PlayerCouponRepository,
    private rewardService: RewardService,
    private playerService: PlayerService,
  ) {}

  async createCoupon(couponValue, rewardId: number): Promise<Coupon> {
    return await this.couponRepository.save({
      value: couponValue,
      reward: { id: rewardId },
    });
  }

  async getPlayerCouponsByCouponIds(
    couponIds: number[],
  ): Promise<PlayerCoupon[]> {
    return await this.playerCouponRepository.find({
      where: {
        coupon: {
          id: In(couponIds),
        },
      },
      relations: ['coupon'],
    });
  }

  async getAvailableCouponOrThrow(rewardWithCoupons: Reward): Promise<Coupon> {
    const allCouponIds = rewardWithCoupons.coupons.map((coupon) => coupon.id);
    const redeemedPlayerCoupons =
      await this.getPlayerCouponsByCouponIds(allCouponIds);

    // Check reward has available coupon [daily limit, campaign limit stored in DB]
    await this.rewardService.checkRewardCouponAvailabilityOrThrow(
      rewardWithCoupons,
      redeemedPlayerCoupons,
    );

    // Find one available coupon
    const redeemedCouponIds = redeemedPlayerCoupons.map((pc) => pc.coupon.id);
    const availableCouponIndex = allCouponIds.findIndex(
      (couponId) => !redeemedCouponIds.includes(couponId),
    );

    if (availableCouponIndex === -1) {
      throw new NotFoundException(COUPON_NOT_AVAILABLE);
    }

    return rewardWithCoupons.coupons[availableCouponIndex];
  }

  async redeemCoupon(
    dto: CouponRedeemInputDto,
  ): Promise<CouponRedeemOutputDto> {
    // Check player exists
    const playerWithPlayerCoupons =
      await this.playerService.getPlayerWithPlayerCouponsOrThrow(dto.playerId);

    // Check player is eligible for reward [daily limit (3 coupons), campaign limit (21 coupons)]
    await this.playerService.checkPlayerEligibleForRedeemOrThrow(
      playerWithPlayerCoupons,
    );

    // Check reward exists
    const rewardWithCoupons =
      await this.rewardService.getActiveRewardWithCouponsOrThrow(dto.rewardId);

    const coupon = await this.getAvailableCouponOrThrow(rewardWithCoupons);

    await this.playerCouponRepository.save({
      redeemedAt: new Date(),
      player: { id: playerWithPlayerCoupons.id },
      coupon,
    });

    return plainToInstance(CouponRedeemOutputDto, coupon, {
      excludeExtraneousValues: true,
    });
  }
}
