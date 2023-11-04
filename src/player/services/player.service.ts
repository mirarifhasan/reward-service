import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PlayerRepository } from '../repositories/player.repository';
import { CreatePlayerDto } from '../dto/create-player.dto';
import { Player } from '../entities/player.entity';
import {
  PLAYER_CAMPAIGN_LIMIT_REACHED,
  PLAYER_DAILY_LIMIT_REACHED,
  PLAYER_NOT_FOUND,
} from '../../errors';

@Injectable()
export class PlayerService {
  constructor(private playerRepository: PlayerRepository) {}

  PLAYER_DAILY_REWARD_LIMIT = 3;
  PLAYER_CAMPAIGN_REWARD_LIMIT = 21;

  async createPlayer(player: CreatePlayerDto): Promise<Player> {
    return await this.playerRepository.save(player);
  }

  async getPlayerWithPlayerCouponsOrThrow(playerId: number): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
      relations: ['playerCoupons'],
    });

    if (!player) throw new NotFoundException(PLAYER_NOT_FOUND);

    return player;
  }

  checkPlayerEligibleForRedeemOrThrow(player: Player): boolean {
    if (!player.hasOwnProperty('playerCoupons') || !player.playerCoupons) {
      throw new UnprocessableEntityException();
    }

    // Check if player reached campaign limit
    if (player.playerCoupons.length >= this.PLAYER_CAMPAIGN_REWARD_LIMIT) {
      throw new NotAcceptableException(PLAYER_CAMPAIGN_LIMIT_REACHED);
    }

    // Check if player reached daily limit
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const playerCouponsToday = player.playerCoupons.filter(
      (coupon) =>
        coupon.redeemedAt >= todayStart && coupon.redeemedAt <= todayEnd,
    );

    if (playerCouponsToday.length >= this.PLAYER_DAILY_REWARD_LIMIT) {
      throw new NotAcceptableException(PLAYER_DAILY_LIMIT_REACHED);
    }

    return true;
  }
}
