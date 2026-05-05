import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { DemoUserRecord } from "../store/store.service";

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DemoUserRecord | undefined => {
    const request = context.switchToHttp().getRequest<{ user?: DemoUserRecord }>();
    return request.user;
  }
);

