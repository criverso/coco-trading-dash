import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { ActivitiesModule } from "./activities/activities.module";
import { AdminModule } from "./admin/admin.module";
import { AuthModule } from "./auth/auth.module";
import { AuthGuard } from "./common/auth.guard";
import { RolesGuard } from "./common/roles.guard";
import { DashboardModule } from "./dashboard/dashboard.module";
import { FeedModule } from "./feed/feed.module";
import { HealthModule } from "./health/health.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { ClubsModule } from "./clubs/clubs.module";
import { StoreModule } from "./store/store.module";
import { VerificationModule } from "./verification/verification.module";

@Module({
  imports: [
    StoreModule,
    AuthModule,
    DashboardModule,
    ActivitiesModule,
    ClubsModule,
    FeedModule,
    ConversationsModule,
    VerificationModule,
    NotificationsModule,
    AdminModule,
    HealthModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
