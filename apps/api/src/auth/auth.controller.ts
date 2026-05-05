import { Body, Controller, Get, Post } from "@nestjs/common";

import { CurrentUser } from "../common/current-user.decorator";
import { Public } from "../common/public.decorator";
import { AuthService } from "./auth.service";
import type { DemoUserRecord } from "../store/store.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get("demo/member")
  demoMember() {
    return this.authService.issueDemoToken("member");
  }

  @Public()
  @Get("demo/admin")
  demoAdmin() {
    return this.authService.issueDemoToken("admin");
  }

  @Public()
  @Post("register")
  register(@Body() body: unknown) {
    return this.authService.register(body);
  }

  @Public()
  @Post("login")
  login(@Body() body: unknown) {
    return this.authService.login(body);
  }

  @Get("me")
  me(@CurrentUser() user: DemoUserRecord) {
    return user;
  }
}

