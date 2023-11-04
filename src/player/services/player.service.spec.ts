import { Test } from '@nestjs/testing';
import { PlayerRepository } from '../repositories/player.repository';
import { PlayerService } from './player.service';
import {
  PLAYER_CAMPAIGN_LIMIT_REACHED,
  PLAYER_DAILY_LIMIT_REACHED,
  PLAYER_NOT_FOUND,
} from '../../errors';
import { Player } from '../entities/player.entity';

describe('PlayerService', () => {
  let playerService: PlayerService;

  const mockedPlayerRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: PlayerRepository,
          useValue: mockedPlayerRepository,
        },
      ],
    }).compile();

    playerService = moduleRef.get<PlayerService>(PlayerService);
  });

  describe('createPlayer', () => {
    it('should create a player', async () => {
      const player = {
        id: 1,
        name: 'test',
      };
      jest.spyOn(mockedPlayerRepository, 'save').mockResolvedValueOnce(player);
      const result = await playerService.createPlayer({ name: player.name });
      expect(result).toEqual(player);
    });

    it('should create a player in DB using given name', async () => {
      const player = {
        id: 1,
        name: 'test',
      };
      expect(mockedPlayerRepository.save).toHaveBeenCalledWith({
        name: player.name,
      });
    });
  });

  describe('getPlayerWithPlayerCouponsOrThrow', () => {
    it('should throw an error if player not found', async () => {
      jest.spyOn(mockedPlayerRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(
        playerService.getPlayerWithPlayerCouponsOrThrow(1),
      ).rejects.toThrow(PLAYER_NOT_FOUND);
    });

    it('should return player if player found', async () => {
      const playerWithPlayerCoupons: Player = {
        id: 1,
        name: 'test',
        playerCoupons: [],
      };
      jest
        .spyOn(mockedPlayerRepository, 'findOne')
        .mockResolvedValueOnce(playerWithPlayerCoupons);

      const result = await playerService.getPlayerWithPlayerCouponsOrThrow(1);
      expect(result).toEqual(playerWithPlayerCoupons);
    });
  });

  describe('checkPlayerEligibleForRedeemOrThrow', () => {
    it('should throw an error if player reached campaign limit', async () => {
      const player: Player = {
        id: 1,
        name: 'test',
        playerCoupons: new Array(21),
      };
      expect(() => {
        playerService.checkPlayerEligibleForRedeemOrThrow(player);
      }).toThrowError(PLAYER_CAMPAIGN_LIMIT_REACHED);
    });

    it('should throw an error if player reached daily limit', async () => {
      const player: Player = {
        id: 1,
        name: 'test',
        playerCoupons: [
          { redeemedAt: new Date() } as any,
          { redeemedAt: new Date() } as any,
          { redeemedAt: new Date() } as any,
        ],
      };
      expect(() => {
        playerService.checkPlayerEligibleForRedeemOrThrow(player);
      }).toThrowError(PLAYER_DAILY_LIMIT_REACHED);
    });

    it('should throw an error if player obj missing/null playerCoupons key', async () => {
      const player = {
        id: 1,
        name: 'test',
        playerCoupons: undefined,
      };
      expect(() => {
        playerService.checkPlayerEligibleForRedeemOrThrow(player);
      }).toThrowError();
    });

    it('should return true if player is eligible for redeem', async () => {
      const player = {
        id: 1,
        name: 'test',
        playerCoupons: new Array(2),
      };
      const result = playerService.checkPlayerEligibleForRedeemOrThrow(player);
      expect(result).toEqual(true);
    });
  });
});
