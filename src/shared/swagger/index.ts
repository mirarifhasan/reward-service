import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function setupSwagger(app: INestApplication, port: number) {
  const swaggerDocPath = '/docs';

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Reward Service API Documentation')
    .setContact(
      'Mir Arif Hasan',
      'https://www.linkedin.com/in/mirarifhasan',
      'arif.ishan05@gmail.com',
    )
    .addServer(`http://localhost:${port}`)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerDocPath, app, swaggerDocument);
}
