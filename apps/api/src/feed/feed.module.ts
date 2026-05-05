import { Module } from "@nestjs/common";

import { StoreModule } from "../store/store.module";
import { FeedController } from "./feed.controller";

@Module({
  imports: [StoreModule],
  controllers: [FeedController]
})
export class FeedModule {}
