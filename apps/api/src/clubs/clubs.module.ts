import { Module } from "@nestjs/common";

import { StoreModule } from "../store/store.module";
import { ClubsController } from "./clubs.controller";

@Module({
  imports: [StoreModule],
  controllers: [ClubsController]
})
export class ClubsModule {}
