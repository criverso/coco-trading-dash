import { Body, Controller, Get, Post } from "@nestjs/common";
import { verificationAttemptSchema } from "@player2/shared";

import { CurrentUser } from "../common/current-user.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("verification")
export class VerificationController {
  constructor(private readonly storeService: StoreService) {}

  @Get("state")
  state(@CurrentUser() user: DemoUserRecord) {
    return {
      currentUser: user,
      featureFlags: this.storeService.getFeatureFlags(),
      reviewQueue: this.storeService.buildDashboardSnapshot(user.id).reviewQueue
    };
  }

  @Post("attempt")
  attempt(@CurrentUser() user: DemoUserRecord, @Body() body: unknown) {
    return this.storeService.submitVerification(user.id, verificationAttemptSchema.parse(body));
  }
}

