import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new AllExceptionsFilter());

    const config = new DocumentBuilder()
      .setTitle('Pokemon Battle Simulator')
      .setDescription('Simulates battles between two teams of Pokemon')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
}
await bootstrap();
