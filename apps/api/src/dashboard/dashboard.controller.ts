import { Controller, Get } from "@nestjs/common";

import { CurrentUser } from "../common/current-user.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  snapshot(@CurrentUser() user: DemoUserRecord) {
    return this.storeService.buildDashboardSnapshot(user.id);
  }
}

