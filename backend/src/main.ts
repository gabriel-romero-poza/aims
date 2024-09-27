import { APP_GUARD, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  app.enableCors({
    // Permite que se reciban y envien recursos entre diferentes dominios (a revisar en produccion)
    origin: 'http://localhost:3001', // URL del frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Se utilizan "Pipes" globales, las cuales tranforman y validan los datos(y los tipos de los mismos) que recibe el Backend
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //Creacion y configuracion de Swagger
  const config = new DocumentBuilder()
    .setTitle('Gestión Escolar API')
    .setDescription(
      'Documentación de la API para el sistema de gestión escolar',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //Inicializacion del Backend
  await app.listen(3000);
}

bootstrap();
