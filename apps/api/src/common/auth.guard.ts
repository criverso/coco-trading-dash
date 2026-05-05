import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_KEY } from "./public.decorator";
import { env } from "../env";
import { StoreService } from "../store/store.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly storeService: StoreService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined>; user?: unknown }>();

    const authorization = request.headers.authorization;

    if (!authorization) {
      if (isPublic) {
        return true;
      }

      throw new UnauthorizedException("Authentication required");
    }

    const token = authorization.replace(/^Bearer\s+/i, "");

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: env.jwtSecret
      });
      const user = this.storeService.findUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("Unknown user");
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}

