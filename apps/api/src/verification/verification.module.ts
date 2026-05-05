import { Module } from "@nestjs/common";

import { StoreModule } from "../store/store.module";
import { VerificationController } from "./verification.controller";

@Module({
  imports: [StoreModule],
  controllers: [VerificationController]
})
export class VerificationModule {}
