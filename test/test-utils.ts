import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CreateRewardDto } from '../src/coupon/dto/create-reward.dto';
import { Coupon } from '../src/coupon/entities/coupon.entity';
import { Reward } from '../src/coupon/entities/reward.entity';
import { Player } from '../src/player/entities/player.entity';
import { DataSource } from 'typeorm';
const path = require('path');

const campaignStartOn = new Date();
campaignStartOn.setHours(0, 0, 0, 0);
const campaignEndOn = new Date(campaignStartOn);
campaignEndOn.setDate(campaignStartOn.getDate() + 7);
const rewardObjs: CreateRewardDto[] = [
  {
    name: 'Airline ticket',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 1,
    totalLimit: 2,
  },
  {
    name: 'Nike shoes',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 1,
    totalLimit: 1,
  },
  {
    name: 'Apple watch SE',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 2,
    totalLimit: 4,
  },
  {
    name: 'AirPods Pro',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 2,
    totalLimit: 6,
  },
  {
    name: 'Power Bank',
    startDate: campaignStartOn,
    endDate: campaignEndOn,
    perDayLimit: 2,
    totalLimit: 8,
  },
];

export const dbConnectionConfig = {
  host: 'localhost',
  port: 3307,
  username: 'root',
  password: 'password',
  database: 'e2e_test_db',
};

export const resetDBBeforeTest = async (): Promise<void> => {
  console.log(
    `Dropping ${dbConnectionConfig.database} database and recreating it`,
  );
  const appDataSource = new DataSource({
    type: 'mysql',
    ...dbConnectionConfig,
  });
  await appDataSource.initialize();
  await appDataSource.query(
    `drop database if exists ${dbConnectionConfig.database}`,
  );
  await appDataSource.query(`create database ${dbConnectionConfig.database}`);
  await appDataSource.destroy();
};

export const createDBEntitiesAndSeed = async (): Promise<void> => {
  console.log(`Creating entities in ${dbConnectionConfig.database} database`);
  const appDataSource = new DataSource({
    type: 'mysql',
    ...dbConnectionConfig,
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    migrations: [path.join(__dirname + '/../migrations/*{.ts,.js}')],
    synchronize: false,
  });
  await appDataSource.initialize();
  await appDataSource.runMigrations();

  // Seed the database
  console.log(`Seeding ${dbConnectionConfig.database} database`);
  await seedDatabaseForE2E(appDataSource);

  await appDataSource.destroy();
};

async function seedDatabaseForE2E(appDataSource: DataSource) {
  const playerRepository = appDataSource.getRepository(Player);
  const rewardRepository = appDataSource.getRepository(Reward);
  const couponRepository = appDataSource.getRepository(Coupon);

  // Create 10 players
  for (let i = 0; i < 10; i++) {
    await playerRepository.save({ name: `player-${i + 1}` });
  }

  // Create 5 rewards and its coupons
  for (let i = 0; i < rewardObjs.length; i++) {
    const reward = await rewardRepository.save(rewardObjs[i]);

    for (let j = 0; j < reward.totalLimit; j++) {
      const couponValue = `CPN-${reward.name}-${j + 1}`;
      await couponRepository.save({
        value: couponValue,
        reward: { id: reward.id },
      });
    }
  }
}
