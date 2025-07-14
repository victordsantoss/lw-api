import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './common/configs/swagger.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { corsConfig } from './common/configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  setupSwagger(app);
  app.enableCors(corsConfig);

  await app.listen(3000);
}
bootstrap();
