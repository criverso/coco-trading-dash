import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { sendMessageBodySchema } from "@player2/shared";

import { CurrentUser } from "../common/current-user.decorator";
import type { DemoUserRecord } from "../store/store.service";
import { StoreService } from "../store/store.service";

@Controller("conversations")
export class ConversationsController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  list(@CurrentUser() user: DemoUserRecord) {
    return this.storeService.buildDashboardSnapshot(user.id).conversations;
  }

  @Get(":id/messages")
  messages(@Param("id") id: string) {
    return this.storeService.getConversationMessages(id);
  }

  @Post(":id/messages")
  send(
    @CurrentUser() user: DemoUserRecord,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    return this.storeService.sendMessage(user.id, id, sendMessageBodySchema.parse(body));
  }

  @Post(":id/call-room")
  callRoom(@Param("id") id: string) {
    return {
      conversationId: id,
      roomName: `player2-${id}`,
      token: "demo-livekit-token",
      mode: "1:1"
    };
  }
}

