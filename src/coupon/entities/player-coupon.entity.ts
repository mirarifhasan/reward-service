import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Player } from '../../player/entities/player.entity';
import { Coupon } from './coupon.entity';

@Entity()
export class PlayerCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Player, (player) => player.playerCoupons)
  player: Player;

  @ManyToOne(() => Coupon, (coupon) => coupon.playerCoupons)
  coupon: Coupon;

  @CreateDateColumn()
  redeemedAt: Date;
}
