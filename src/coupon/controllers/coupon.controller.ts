import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import {
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CouponRedeemInputDto } from '../dto/coupon-redeem-input.dto';
import { ResponseInterceptor } from 'src/shared/interceptors/response.interceptor';
import { CouponRedeemOutputDto } from '../dto/coupon-redeem-output.dto';
import {
  BaseApiResponse,
  SwaggerBaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from 'src/shared/dto/base-api-response.dto';

@ApiTags('Coupon')
@Controller({ path: 'coupon', version: '1' })
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Post('/coupon-redeem')
  @UseInterceptors(ResponseInterceptor)
  @ApiOkResponse({
    type: SwaggerBaseApiResponse(CouponRedeemOutputDto, HttpStatus.OK),
  })
  @ApiNotFoundResponse({
    type: SwaggerBaseApiErrorResponse(HttpStatus.NOT_FOUND),
  })
  @ApiNotAcceptableResponse({
    type: SwaggerBaseApiErrorResponse(HttpStatus.NOT_ACCEPTABLE),
  })
  @HttpCode(HttpStatus.OK)
  async redeemCoupon(
    @Body() body: CouponRedeemInputDto,
  ): Promise<BaseApiResponse<CouponRedeemOutputDto>> {
    const coupon = await this.couponService.redeemCoupon(body);

    return {
      message: 'Coupon redeemed successfully',
      data: coupon,
    };
  }
}
