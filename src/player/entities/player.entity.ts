import { PlayerCoupon } from '../../coupon/entities/player-coupon.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => PlayerCoupon, (playerCoupon) => playerCoupon.player)
  playerCoupons: PlayerCoupon[];
}
