import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Player } from './player/entities/player.entity';
import { Reward } from './coupon/entities/reward.entity';
import { Coupon } from './coupon/entities/coupon.entity';
import { PlayerCoupon } from './coupon/entities/player-coupon.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenvConfig({ path: '.env' });

const config: TypeOrmModuleOptions = {
  type: 'mysql',
  host: `${process.env.TYPEORM_HOST}`,
  port: +`${process.env.TYPEORM_PORT}`,
  username: `${process.env.TYPEORM_USERNAME}`,
  password: `${process.env.TYPEORM_PASSWORD}`,
  database: `${process.env.TYPEORM_DATABASE}`,
  entities: [Player, Reward, Coupon, PlayerCoupon],
  migrations: process.env.typeorm === 'true' ? ['migrations/*.ts'] : [],
  autoLoadEntities: true,
  synchronize: false,
  timezone: 'Z',
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
