import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: false,
  }),
);

  app.enableCors({
    origin: 'http://localhost:5173', // React dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(3000);
}
bootstrap();
