import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CouponRedeemInputDto {
  @ApiProperty({ example: '1', description: 'Player ID' })
  @IsNumber()
  @Min(1)
  playerId: number;

  @ApiProperty({ example: '1', description: 'Reward ID' })
  @IsNumber()
  @Min(1)
  rewardId: number;
}
