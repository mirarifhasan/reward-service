import { Test } from '@nestjs/testing';
import { RewardRepository } from '../repositories/reward.repository';
import { RewardService } from './reward.service';
import { Reward } from '../entities/reward.entity';
import {
  REWARD_DAILY_LIMIT_REACHED,
  REWARD_NOT_FOUND,
  REWARD_TOTAL_LIMIT_REACHED,
} from '../../errors';

describe('PlayerService', () => {
  let rewardService: RewardService;

  const mockedRewardRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: RewardRepository,
          useValue: mockedRewardRepository,
        },
      ],
    }).compile();

    rewardService = moduleRef.get<RewardService>(RewardService);
  });

  describe('createReward', () => {
    it('should create a reward', async () => {
      const reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 1,
        perDayLimit: 1,
      };
      jest.spyOn(mockedRewardRepository, 'save').mockResolvedValueOnce(reward);

      let { id: _, ...input } = reward;
      const result = await rewardService.createReward(input);
      expect(result).toEqual(reward);
    });
  });

  describe('getActiveRewardWithCouponsOrThrow', () => {
    it('should throw an error if reward not found', async () => {
      jest.spyOn(mockedRewardRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        rewardService.getActiveRewardWithCouponsOrThrow(1),
      ).rejects.toThrow(REWARD_NOT_FOUND);
    });

    it('should return reward if found', async () => {
      const reward: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 1,
        perDayLimit: 1,
        coupons: [],
      };
      jest
        .spyOn(mockedRewardRepository, 'findOne')
        .mockResolvedValueOnce(reward);

      const result = await rewardService.getActiveRewardWithCouponsOrThrow(
        reward.id,
      );
      expect(result).toEqual(reward);
    });
  });

  describe('checkRewardCouponAvailabilityOrThrow', () => {
    it('should throw an error if reward reached campaign limit', async () => {
      const reward: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 1,
        perDayLimit: 1,
        coupons: [],
      };
      const playerCoupons = [{ redeemedAt: new Date() } as any];
      await expect(
        rewardService.checkRewardCouponAvailabilityOrThrow(
          reward,
          playerCoupons,
        ),
      ).rejects.toThrow(REWARD_TOTAL_LIMIT_REACHED);
    });

    it('should throw an error if reward reached daily limit', async () => {
      const reward: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 2,
        perDayLimit: 1,
        coupons: [],
      };
      const playerCoupons = [{ redeemedAt: new Date() } as any];
      await expect(
        rewardService.checkRewardCouponAvailabilityOrThrow(
          reward,
          playerCoupons,
        ),
      ).rejects.toThrow(REWARD_DAILY_LIMIT_REACHED);
    });

    it('should return true if reward is available', async () => {
      const reward: Reward = {
        id: 1,
        name: 'test',
        startDate: new Date(),
        endDate: new Date(),
        totalLimit: 2,
        perDayLimit: 2,
        coupons: [],
      };
      const playerCoupons = [{ redeemedAt: new Date() } as any];
      const result = await rewardService.checkRewardCouponAvailabilityOrThrow(
        reward,
        playerCoupons,
      );
      expect(result).toEqual(true);
    });
  });
});
