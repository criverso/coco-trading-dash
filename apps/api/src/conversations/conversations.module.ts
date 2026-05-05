import { Module } from "@nestjs/common";

import { StoreModule } from "../store/store.module";
import { ConversationsController } from "./conversations.controller";

@Module({
  imports: [StoreModule],
  controllers: [ConversationsController]
})
export class ConversationsModule {}
