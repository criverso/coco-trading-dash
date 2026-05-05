import { Module } from "@nestjs/common";

import { StoreModule } from "../store/store.module";
import { ActivitiesController } from "./activities.controller";

@Module({
  imports: [StoreModule],
  controllers: [ActivitiesController]
})
export class ActivitiesModule {}
