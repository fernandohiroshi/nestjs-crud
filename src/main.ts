import { NestFactory } from '@nestjs/core';

import appConfig from './app/config/app.config';
import { AppModule } from './app/app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appConfig(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());

    app.enableCors({
      origin: 'https://my-app.com',
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
