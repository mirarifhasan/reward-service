import {
  HttpStatus,
  INestApplication,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  TEST_DB_NAME,
  createDBEntitiesAndSeed,
  resetDBBeforeTest,
} from '../test-utils';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../../src/shared/filters/http-exception.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../../src/player/entities/player.entity';
import { Reward } from '../../src/coupon/entities/reward.entity';
import { Coupon } from '../../src/coupon/entities/coupon.entity';
import { PlayerCoupon } from '../../src/coupon/entities/player-coupon.entity';
import { PlayerModule } from '../../src/player/player.module';
import { CouponModule } from '../../src/coupon/coupon.module';

describe('CouponController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await resetDBBeforeTest();
    await createDBEntitiesAndSeed();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PlayerModule,
        CouponModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: 'localhost',
          port: 3307,
          username: 'root',
          password: 'password',
          database: TEST_DB_NAME,
          entities: [Player, Reward, Coupon, PlayerCoupon],
          synchronize: false,
        }),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', {
      exclude: [{ path: '', method: RequestMethod.GET }],
    });
    app.enableVersioning({
      type: VersioningType.URI,
    });
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  describe('POST /redeem-coupon - successfully redeem a coupon', () => {
    it('should throw error when player not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 999,
          rewardId: 1,
        })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body).toEqual({
        status_code: 404,
        message: 'Player not found',
        errors: ['Not Found'],
        data: null,
      });
    });

    it('should throw an error when reward not found', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 1,
          rewardId: 999,
        })
        .expect(404);

      expect(response.body).toEqual({
        status_code: 404,
        message: 'Reward not found',
        errors: ['Not Found'],
        data: null,
      });
    });

    it('should redeem a coupon', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 1,
          rewardId: 1,
        })
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        status_code: 200,
        message: 'Coupon redeemed successfully',
        errors: [],
        data: {
          id: 1,
          value: `CPN-Airline ticket-1`,
        },
      });
    });

    it('should throw an error if reward daily limit reached', async () => {
      // Redeem extra coupon to reach daily limit
      await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 1,
          rewardId: 2,
        })
        .expect(HttpStatus.OK);

      const response = await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 1,
          rewardId: 2,
        })
        .expect(HttpStatus.NOT_ACCEPTABLE);

      expect(response.body).toEqual({
        status_code: 406,
        message: 'Total limit reached for this reward',
        errors: ['Not Acceptable'],
        data: null,
      });
    });

    it('should throw an error if reward campaign limit reached', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 1,
          rewardId: 2,
        })
        .expect(HttpStatus.NOT_ACCEPTABLE);

      expect(response.body).toEqual({
        status_code: 406,
        message: 'Total limit reached for this reward',
        errors: ['Not Acceptable'],
        data: null,
      });
    });

    it('should throw an error if player daily limit reached', async () => {
      // Redeem extra coupon to reach daily limit
      await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 1,
          rewardId: 3,
        })
        .expect(HttpStatus.OK);

      const response = await request(app.getHttpServer())
        .post('/api/v1/coupon/coupon-redeem')
        .send({
          playerId: 1,
          rewardId: 4,
        })
        .expect(HttpStatus.NOT_ACCEPTABLE);

      expect(response.body).toEqual({
        status_code: 406,
        message: 'Daily limit reached for this player',
        errors: ['Not Acceptable'],
        data: null,
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
