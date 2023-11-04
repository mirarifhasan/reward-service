import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Logger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { setupSwagger } from './shared/swagger';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = +process.env.PORT || 3000;

  app.setGlobalPrefix('api', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  await setupSwagger(app, PORT);
  await app.listen(PORT);
  Logger.log(await app.getUrl(), 'App URL');
}
bootstrap();
