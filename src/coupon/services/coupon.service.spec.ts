import { PlayerService } from '../../player/services/player.service';
import { CouponService } from './coupon.service';
import { RewardService } from './reward.service';
import { PlayerCouponRepository } from '../repositories/player-coupon.repository';
import { CouponRepository } from '../repositories/coupon.repository';
import { Test } from '@nestjs/testing';
import { PlayerCoupon } from '../entities/player-coupon.entity';
import { Coupon } from '../entities/coupon.entity';
import { Player } from 'src/player/entities/player.entity';
import { Reward } from '../entities/reward.entity';

describe('CouponService', () => {
  let couponService: CouponService;

  let mockedCouponRepository = {
    save: jest.fn(),
    find: jest.fn(),
  };
  let mockedPlayerCouponRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };
  let mockedRewardService = {
    checkRewardCouponAvailabilityOrThrow: jest.fn(),
    getActiveRewardWithCouponsOrThrow: jest.fn(),
  };
  let mockedPlayerService = {
    getPlayerWithPlayerCouponsOrThrow: jest.fn(),
    checkPlayerEligibleForRedeemOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: CouponRepository,
          useValue: mockedCouponRepository,
        },
        {
          provide: PlayerCouponRepository,
          useValue: mockedPlayerCouponRepository,
        },
        {
          provide: RewardService,
          useValue: mockedRewardService,
        },
        {
          provide: PlayerService,
          useValue: mockedPlayerService,
        },
      ],
    }).compile();

    couponService = moduleRef.get<CouponService>(CouponService);
  });

  describe('createCoupon', () => {
    it('should create a coupon', async () => {
      const coupon = {
        id: 1,
        value: 'test',
        reward: { id: 1 },
      };
      jest.spyOn(mockedCouponRepository, 'save').mockResolvedValueOnce(coupon);

      const result = await couponService.createCoupon(
        coupon.value,
        coupon.reward.id,
      );
      expect(result).toEqual(coupon);
    });
  });

  describe('getPlayerCouponsByCouponIds', () => {
    it('should return player coupons', async () => {
      const dbPlayerCoupons: PlayerCoupon[] = [
        {
          id: 1,
          redeemedAt: new Date(),
          coupon: { id: 1 } as Coupon,
          player: undefined,
        },
      ];
      jest
        .spyOn(mockedPlayerCouponRepository, 'find')
        .mockResolvedValueOnce(dbPlayerCoupons);

      const result = await couponService.getPlayerCouponsByCouponIds([1]);
      expect(result).toEqual(dbPlayerCoupons);
    });

    it('should return empty array if no player coupons found', async () => {
      jest
        .spyOn(mockedPlayerCouponRepository, 'find')
        .mockResolvedValueOnce([]);

      const result = await couponService.getPlayerCouponsByCouponIds([1]);
      expect(result).toEqual([]);
    });
  });

  describe('getAvailableCouponOrThrow', () => {
    it('should throw an error if no coupon available', async () => {
      const rewardWithCoupons: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 1,
        perDayLimit: 1,
        coupons: [{ id: 1 } as Coupon],
      };

      // getPlayerCouponsByCouponIds
      jest.spyOn(mockedPlayerCouponRepository, 'find').mockResolvedValueOnce([
        {
          id: 1,
          redeemedAt: new Date(),
          coupon: { id: rewardWithCoupons.coupons[0].id },
        },
      ]);

      jest
        .spyOn(mockedRewardService, 'checkRewardCouponAvailabilityOrThrow')
        .mockResolvedValueOnce(true);

      await expect(
        couponService.getAvailableCouponOrThrow(rewardWithCoupons),
      ).rejects.toThrow('Coupon not available');
    });

    it('should throw an error if coupon not exist in database', async () => {
      const rewardWithCoupons: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 1,
        perDayLimit: 1,
        coupons: [],
      };

      await expect(
        couponService.getAvailableCouponOrThrow(rewardWithCoupons),
      ).rejects.toThrow('Coupon not available');
    });

    it('should return a coupon', async () => {
      const rewardWithCoupons: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 1,
        perDayLimit: 1,
        coupons: [{ id: 1 } as Coupon],
      };

      // getPlayerCouponsByCouponIds
      couponService.getPlayerCouponsByCouponIds = jest
        .fn()
        .mockResolvedValueOnce([]);

      jest
        .spyOn(mockedRewardService, 'checkRewardCouponAvailabilityOrThrow')
        .mockResolvedValueOnce(true);

      const result =
        await couponService.getAvailableCouponOrThrow(rewardWithCoupons);
      expect(result).toEqual(rewardWithCoupons.coupons[0]);
    });
  });

  describe('redeemCoupon', () => {
    it('should redeem a coupon', async () => {
      const playerWithPlayerCoupons: Player = {
        id: 1,
        name: 'test',
        playerCoupons: [],
      };
      const availableCoupon: Coupon = { id: 2, value: '' } as Coupon;
      const rewardWithCoupons: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 2,
        perDayLimit: 1,
        coupons: [{ id: 1 }, availableCoupon] as Coupon[],
      };

      jest
        .spyOn(mockedPlayerService, 'getPlayerWithPlayerCouponsOrThrow')
        .mockResolvedValueOnce(playerWithPlayerCoupons);

      jest
        .spyOn(mockedPlayerService, 'checkPlayerEligibleForRedeemOrThrow')
        .mockResolvedValueOnce(true);

      jest
        .spyOn(mockedRewardService, 'getActiveRewardWithCouponsOrThrow')
        .mockResolvedValueOnce(rewardWithCoupons);

      couponService.getAvailableCouponOrThrow = jest
        .fn()
        .mockResolvedValueOnce(availableCoupon);

      jest.spyOn(mockedPlayerCouponRepository, 'save').mockResolvedValueOnce({
        ...playerWithPlayerCoupons,
        playerCoupons: [availableCoupon],
      });

      const result = await couponService.redeemCoupon({
        playerId: playerWithPlayerCoupons.id,
        rewardId: rewardWithCoupons.id,
      });
      expect(result).toEqual(availableCoupon);
    });
  });
});
