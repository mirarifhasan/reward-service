import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Reward } from './reward.entity';
import { PlayerCoupon } from './player-coupon.entity';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @ManyToOne(() => Reward)
  reward: Reward;

  @OneToMany(() => PlayerCoupon, (playerCoupon) => playerCoupon.coupon)
  playerCoupons: PlayerCoupon[];
}
