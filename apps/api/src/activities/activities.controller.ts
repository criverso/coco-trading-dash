import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { createActivityBodySchema } from "@player2/shared";

import { CurrentUser } from "../common/current-user.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("activities")
export class ActivitiesController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  list() {
    return this.storeService.buildDashboardSnapshot("user-avery").activities;
  }

  @Post()
  create(@CurrentUser() user: DemoUserRecord, @Body() body: unknown) {
    return this.storeService.createActivity(user.id, createActivityBodySchema.parse(body));
  }

  @Post(":id/respond")
  respond(@Param("id") id: string) {
    return {
      requestId: id,
      status: "responded"
    };
  }
}

