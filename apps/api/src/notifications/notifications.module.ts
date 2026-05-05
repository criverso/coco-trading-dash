import { Module } from "@nestjs/common";

import { StoreModule } from "../store/store.module";
import { NotificationsController } from "./notifications.controller";

@Module({
  imports: [StoreModule],
  controllers: [NotificationsController]
})
export class NotificationsModule {}
