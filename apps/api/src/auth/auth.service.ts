import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { registerBodySchema, loginBodySchema } from "@player2/shared";

import { StoreService } from "../store/store.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly storeService: StoreService
  ) {}

  issueToken(userId: string) {
    return this.jwtService.sign({ sub: userId });
  }

  issueDemoToken(role: "member" | "admin") {
    const userId = role === "admin" ? "user-riley" : "user-avery";
    const user = this.storeService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException("Demo user not available");
    }

    return {
      token: this.issueToken(user.id),
      user
    };
  }

  async register(body: unknown) {
    const parsed = registerBodySchema.parse(body);
    const existing = this.storeService.findUserByEmail(parsed.email);

    if (existing) {
      throw new BadRequestException("Email already in use");
    }

    const user = await this.storeService.createUser(parsed);
    return {
      token: this.issueToken(user.id),
      user
    };
  }

  async login(body: unknown) {
    const parsed = loginBodySchema.parse(body);
    const user = this.storeService.findUserByEmail(parsed.email);

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await this.storeService.verifyPassword(user, parsed.password);

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return {
      token: this.issueToken(user.id),
      user
    };
  }
}

