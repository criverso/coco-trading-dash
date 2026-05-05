import { Body, Controller, Get, Post } from "@nestjs/common";
import { createFeedPostBodySchema } from "@player2/shared";

import { CurrentUser } from "../common/current-user.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("feed")
export class FeedController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  list() {
    return this.storeService.buildDashboardSnapshot("user-avery").feed;
  }

  @Post()
  create(@CurrentUser() user: DemoUserRecord, @Body() body: unknown) {
    return this.storeService.createFeedPost(user.id, createFeedPostBodySchema.parse(body));
  }
}

