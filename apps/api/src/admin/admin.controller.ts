import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { adminDecisionBodySchema, adminSettingsBodySchema } from "@player2/shared";

import { CurrentUser } from "../common/current-user.decorator";
import { Roles } from "../common/roles.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("admin")
@Roles("platform_admin")
export class AdminController {
  constructor(private readonly storeService: StoreService) {}

  @Get("snapshot")
  snapshot() {
    return this.storeService.buildAdminSnapshot();
  }

  @Post("settings")
  updateSettings(@Body() body: unknown) {
    return this.storeService.updateFeatureFlags(adminSettingsBodySchema.parse(body));
  }

  @Post("reviews/:id")
  review(
    @CurrentUser() user: DemoUserRecord,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const parsed = adminDecisionBodySchema.parse(body);
    return this.storeService.applyAdminDecision({
      reviewId: id,
      decision: parsed.decision,
      note: parsed.note,
      actorName: user.displayName
    });
  }
}

