import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class IndexController {
  constructor(private configService: ConfigService) {}

  @Get()
  index() {
    const appPort = this.configService.get('PORT') || 3000;

    return {
      message: `reward service is up and running!`,
      api_documentation: `http://localhost:${appPort}/docs`,
    };
  }
}
