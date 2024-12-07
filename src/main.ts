import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import multipart from '@fastify/multipart';
import userAgent from 'fastify-user-agent';

import * as dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
    {
      bodyParser: true,
    },
  );
  await app.register(userAgent);
  await app.register(multipart);
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  Logger.log(`Server running on port ${process.env.PORT ?? 3000}`);
  Logger.log(`Timezone: ${process.env.TZ}`);
  Logger.log(`Server Started: ${new Date().toString()}`);
}

bootstrap();
