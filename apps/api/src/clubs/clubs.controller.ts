import { Controller, Get, Param, Post } from "@nestjs/common";

import { CurrentUser } from "../common/current-user.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("clubs")
export class ClubsController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  list() {
    return this.storeService.buildDashboardSnapshot("user-avery").clubs;
  }

  @Get(":id/events")
  events(@Param("id") id: string) {
    return this.storeService
      .buildDashboardSnapshot("user-avery")
      .events.filter((event) => event.clubId === id);
  }

  @Post(":id/join")
  join(@CurrentUser() user: DemoUserRecord, @Param("id") id: string) {
    return this.storeService.joinClub(user.id, id);
  }
}

