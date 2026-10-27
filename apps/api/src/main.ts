import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  // Swagger OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Wolaita Marketplace REST API')
    .setDescription(
      'REST API for Wolaita Sodo digital marketplace: Properties, Vehicles, Broker CRM, and Moderation.'
    )
    .setVersion('1.0')
    .addTag('Listings', 'Real Estate and Vehicle listing lifecycle')
    .addTag('Leads', 'Customer inquiries and broker CRM pipeline')
    .addTag('Appointments', 'Viewing schedules in Wolaita Sodo')
    .addTag('Admin', 'Moderation review queue and platform audit')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Wolaita Marketplace API running on http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
