import { Module } from "@nestjs/common";

import { StoreModule } from "../store/store.module";
import { DashboardController } from "./dashboard.controller";

@Module({
  imports: [StoreModule],
  controllers: [DashboardController],
  providers: []
})
export class DashboardModule {}
