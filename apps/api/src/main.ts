import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { env } from "./env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true
    }
  });

  await app.listen(env.port);
  console.log(`Player 2 API listening on http://localhost:${env.port}`);
}

bootstrap();

