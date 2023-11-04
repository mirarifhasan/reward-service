import { ApiProperty } from '@nestjs/swagger';

export class BaseApiResponse<T> {
  @ApiProperty()
  public status_code?: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public errors?: string[];

  public data: T; // Swagger Decorator is added in the extended class below, since that will override this one.
}

export function SwaggerBaseApiResponse<T>(
  type: T,
  statusCode: number,
): typeof BaseApiResponse {
  class ExtendedBaseApiResponse<T> extends BaseApiResponse<T> {
    @ApiProperty({ type })
    public declare data: T;

    @ApiProperty({ default: statusCode })
    public declare status_code: number;
  }

  // NOTE : Overwrite the returned class name, otherwise whichever type calls this function in the last,
  // will overwrite all previous definitions. i.e., Swagger will have all response types as the same one.
  const isAnArray = Array.isArray(type) ? ' [ ] ' : '';
  Object.defineProperty(ExtendedBaseApiResponse, 'name', {
    value: `SwaggerBaseApiResponseFor ${type} ${isAnArray}`,
  });

  return ExtendedBaseApiResponse;
}

export class BaseApiErrorObject {
  @ApiProperty({ type: Number })
  public status_code: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public errors: string[];

  @ApiProperty({ default: null })
  public data: any;
}

export class BaseApiErrorResponse {
  public status_code: number;

  @ApiProperty()
  public message: string;

  @ApiProperty()
  public errors: string[];

  @ApiProperty({ default: null })
  public data: any;
}

export function SwaggerBaseApiErrorResponse(
  statusCode: number,
): typeof BaseApiErrorResponse {
  class ExtendedBaseApiErrorResponse extends BaseApiErrorResponse {
    @ApiProperty({ default: statusCode })
    public declare status: number;
  }

  // NOTE : Overwrite the returned class name, otherwise whichever type calls this function in the last,
  // will overwrite all previous definitions. i.e., Swagger will have all response types as the same one.
  //const isAnArray = Array.isArray(type) ? ' [ ] ' : '';
  Object.defineProperty(ExtendedBaseApiErrorResponse, 'name', {
    value: `SwaggerBaseApiErrorResponseFor ${statusCode}`,
  });

  return ExtendedBaseApiErrorResponse;
}
