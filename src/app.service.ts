import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHealth() {
    const appPort = this.configService.get('PORT');

    return {
      message: `reward service is up and running!`,
      api_documentation: `http://localhost:${appPort}/docs`,
    };
  }
}
