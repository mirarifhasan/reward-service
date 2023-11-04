import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CouponRedeemOutputDto {
  @ApiProperty({ description: 'Coupon ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Coupon value' })
  @Expose()
  value: string;
}
