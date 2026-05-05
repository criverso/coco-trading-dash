import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { env } from "../env";
import { StoreModule } from "../store/store.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    StoreModule,
    JwtModule.register({
      secret: env.jwtSecret,
      signOptions: {
        expiresIn: "7d"
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}
