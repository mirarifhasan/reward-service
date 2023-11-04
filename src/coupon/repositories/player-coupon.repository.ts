import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PlayerCoupon } from '../entities/player-coupon.entity';

@Injectable()
export class PlayerCouponRepository extends Repository<PlayerCoupon> {
  constructor(private dataSource: DataSource) {
    super(PlayerCoupon, dataSource.createEntityManager());
  }
}
