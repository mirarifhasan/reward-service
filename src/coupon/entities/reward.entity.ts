import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coupon } from './coupon.entity';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  perDayLimit: number;

  @Column()
  totalLimit: number;

  @OneToMany(() => Coupon, (coupon) => coupon.reward)
  coupons: Coupon[];
}
