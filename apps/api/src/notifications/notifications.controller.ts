import { Controller, Get } from "@nestjs/common";

import { CurrentUser } from "../common/current-user.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  list(@CurrentUser() user: DemoUserRecord) {
    return this.storeService.getNotificationsForUser(user.id);
  }
}

