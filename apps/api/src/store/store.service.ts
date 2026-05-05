import { Injectable, OnModuleInit } from "@nestjs/common";
import argon2 from "argon2";
import {
  AdminSettingsBody,
  CreateActivityBody,
  CreateFeedPostBody,
  DashboardSnapshot,
  FeatureFlags,
  Notification,
  Profile,
  SendMessageBody,
  VerificationAttemptBody,
  AdminSnapshot,
  computeApproximateArea,
  scoreVerificationAttempt
} from "@player2/shared";

export type DemoUserRecord = Profile & {
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  suspended: boolean;
};

type ModerationLogItem = AdminSnapshot["moderationLog"][number];

type StoreState = Omit<DashboardSnapshot, "currentUser"> & {
  users: DemoUserRecord[];
  moderationLog: ModerationLogItem[];
};

function now() {
  return new Date().toISOString();
}

@Injectable()
export class StoreService implements OnModuleInit {
  private state!: StoreState;

  async onModuleInit() {
    if (!this.state) {
      this.state = {
        users: [
          {
            id: "user-avery",
            displayName: "Avery Brooks",
            username: "@avery.trades",
            age: 29,
            bio: "Cocoa futures, physical-lot pricing, and calm execution during fast markets.",
            city: "New York",
            state: "NY",
            interests: ["Cocoa", "Futures", "Risk"],
            role: "member",
            avatarTone: "mint",
            trustScore: 78,
            friendCount: 12,
            badges: ["Desk verified", "Risk cleared", "Trusted trader"],
            identityVerified: true,
            idCheckDueAt: "2026-05-20T18:00:00.000Z",
            meetupFaceCheckRequired: true,
            biometricRestricted: false,
            email: "avery@cocotradingdash.demo",
            passwordHash: "",
            emailVerified: true,
            suspended: false
          },
          {
            id: "user-mara",
            displayName: "Mara Chen",
            username: "@mara.cocoa",
            age: 31,
            bio: "Supply-chain notes, origin premiums, and institutional cocoa coverage.",
            city: "Chicago",
            state: "IL",
            interests: ["Origins", "Hedging", "Logistics"],
            role: "club_owner",
            avatarTone: "orange",
            trustScore: 85,
            friendCount: 20,
            badges: ["Desk owner", "Moderator", "Trusted trader"],
            identityVerified: true,
            idCheckDueAt: "2026-05-18T18:00:00.000Z",
            meetupFaceCheckRequired: false,
            biometricRestricted: true,
            email: "mara@cocotradingdash.demo",
            passwordHash: "",
            emailVerified: true,
            suspended: false
          },
          {
            id: "user-riley",
            displayName: "Riley Carter",
            username: "@riley.risk",
            age: 35,
            bio: "Risk controls, margin policy, and trade surveillance.",
            city: "Austin",
            state: "TX",
            interests: ["Risk", "Compliance", "Operations"],
            role: "platform_admin",
            avatarTone: "blue",
            trustScore: 92,
            friendCount: 5,
            badges: ["Platform admin", "Risk lead"],
            identityVerified: true,
            idCheckDueAt: "2026-05-28T18:00:00.000Z",
            meetupFaceCheckRequired: false,
            biometricRestricted: true,
            email: "riley@cocotradingdash.demo",
            passwordHash: "",
            emailVerified: true,
            suspended: false
          }
        ],
        activities: [
          {
            id: "activity-1",
            activity: "COCO",
            title: "Buy COCO May 26 pullback",
            summary: "Limit bid for cocoa exposure after the London close. Keep size tight until liquidity firms.",
            preferredGender: "any",
            ageRange: { min: 25, max: 35 },
            skillLevel: "competitive",
            approximateArea: "New York, NY · exchange desk",
            distanceMiles: 12,
            whenLabel: "Good for day",
            createdBy: {
              id: "user-avery",
              displayName: "Avery Brooks",
              username: "@avery.trades",
              avatarTone: "mint",
              trustScore: 78,
              identityVerified: true
            },
            status: "open",
            applicants: 8,
            verificationGate: "required",
            createdAt: "2026-04-28T18:30:00.000Z"
          },
          {
            id: "activity-2",
            activity: "CCK26",
            title: "Hedge May futures against origin lots",
            summary: "Working a staggered hedge for Ghana arrivals. Prefer partial fills before settlement.",
            preferredGender: "any",
            ageRange: { min: 24, max: 40 },
            skillLevel: "competitive",
            approximateArea: "Chicago, IL · risk desk",
            distanceMiles: 6,
            whenLabel: "Before settlement",
            createdBy: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.cocoa",
              avatarTone: "orange",
              trustScore: 85,
              identityVerified: true
            },
            status: "open",
            applicants: 14,
            verificationGate: "manual_review",
            createdAt: "2026-04-28T17:40:00.000Z"
          }
        ],
        clubs: [
          {
            id: "club-1",
            name: "Cocoa Origins Desk",
            slug: "cocoa-origins-desk",
            summary: "Origin premiums, crop flow, freight updates, and broker-reviewed cocoa market color.",
            city: "New York",
            state: "NY",
            membersCount: 1640,
            privacy: "approval",
            tags: ["Cocoa", "Origins", "Premiums"],
            trustLevelRequired: 70,
            owner: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.cocoa",
              avatarTone: "orange"
            }
          },
          {
            id: "club-2",
            name: "Macro Commodity Watch",
            slug: "macro-commodity-watch",
            summary: "Daily macro, currency, and weather context for cocoa and adjacent soft commodities.",
            city: "Chicago",
            state: "IL",
            membersCount: 910,
            privacy: "public",
            tags: ["Macro", "Weather", "FX"],
            trustLevelRequired: 60,
            owner: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.cocoa",
              avatarTone: "orange"
            }
          }
        ],
        events: [
          {
            id: "event-1",
            clubId: "club-1",
            title: "Daily origin premium call",
            scheduleLabel: "Weekdays · 8:30 AM",
            locationLabel: "Coco Trading Dash voice room",
            recurring: true,
            rsvps: 26
          },
          {
            id: "event-2",
            clubId: "club-2",
            title: "Weekly weather and crop review",
            scheduleLabel: "Friday · 2:00 PM",
            locationLabel: "Research desk",
            recurring: true,
            rsvps: 34
          }
        ],
        feed: [
          {
            id: "post-1",
            author: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.cocoa",
              avatarTone: "orange",
              trustScore: 85
            },
            clubId: "club-1",
            headline: "West Africa arrivals tighten nearby spreads",
            body: "Fresh port data points to slower bean arrivals this week. Keep an eye on nearby spreads and origin premium quotes before increasing size.",
            createdAt: "2026-04-28T15:10:00.000Z",
            comments: [
              {
                id: "comment-1",
                author: {
                  id: "user-avery",
                  displayName: "Avery Brooks",
                  username: "@avery.trades",
                  avatarTone: "mint"
                },
                body: "That matches the bid lift we saw after lunch. I’m keeping May exposure smaller until the next quote run.",
                createdAt: "2026-04-28T15:21:00.000Z"
              }
            ],
            reactions: [
              { emoji: "📈", count: 11 },
              { emoji: "☕", count: 6 }
            ]
          },
          {
            id: "post-2",
            author: {
              id: "user-avery",
              displayName: "Avery Brooks",
              username: "@avery.trades",
              avatarTone: "mint",
              trustScore: 78
            },
            clubId: null,
            headline: "Risk desk note",
            body: "Coco Trading Dash flagged a margin-light entry before the morning spike. Keeping alerts and order notes on one screen made the move easier to manage.",
            createdAt: "2026-04-28T13:15:00.000Z",
            comments: [],
            reactions: [
              { emoji: "📊", count: 8 },
              { emoji: "✅", count: 2 }
            ]
          }
        ],
        conversations: [
          {
            id: "conversation-1",
            kind: "direct",
            title: "Avery + Mara",
            participants: [
              {
                id: "user-avery",
                displayName: "Avery Brooks",
                username: "@avery.trades",
                avatarTone: "mint",
                trustScore: 78
              },
              {
                id: "user-mara",
                displayName: "Mara Chen",
                username: "@mara.cocoa",
                avatarTone: "orange",
                trustScore: 85
              }
            ],
            unreadCount: 2,
            liveCallEnabled: true,
            lastMessagePreview: "I can work the hedge in two clips if that fits risk.",
            lastMessageAt: "2026-04-28T18:10:00.000Z"
          },
          {
            id: "conversation-2",
            kind: "club",
            title: "Cocoa Origins Desk",
            participants: [
              {
                id: "user-mara",
                displayName: "Mara Chen",
                username: "@mara.cocoa",
                avatarTone: "orange",
                trustScore: 85
              },
              {
                id: "user-riley",
                displayName: "Riley Carter",
                username: "@riley.risk",
                avatarTone: "blue",
                trustScore: 92
              }
            ],
            unreadCount: 0,
            liveCallEnabled: false,
            lastMessagePreview: "Risk review is clean again.",
            lastMessageAt: "2026-04-28T16:50:00.000Z"
          }
        ],
        messages: [
          {
            id: "message-1",
            conversationId: "conversation-1",
            authorId: "user-mara",
            body: "You still good to work the May cocoa hedge this afternoon?",
            attachmentLabel: null,
            createdAt: "2026-04-28T17:55:00.000Z"
          },
          {
            id: "message-2",
            conversationId: "conversation-1",
            authorId: "user-avery",
            body: "Yep. I’ll keep the first clip small until the desk confirms the premium quote.",
            attachmentLabel: null,
            createdAt: "2026-04-28T18:02:00.000Z"
          },
          {
            id: "message-3",
            conversationId: "conversation-1",
            authorId: "user-mara",
            body: "I can work the hedge in two clips if that fits risk.",
            attachmentLabel: null,
            createdAt: "2026-04-28T18:10:00.000Z"
          }
        ],
        notifications: [
          {
            id: "notification-1",
            channel: "in_app",
            title: "Risk review due soon",
            body: "Complete your next account review before May 20 to keep placing larger cocoa orders.",
            read: false,
            createdAt: "2026-04-28T12:00:00.000Z"
          },
          {
            id: "notification-2",
            channel: "web_push",
            title: "Price alert triggered",
            body: "COCO crossed $9,400. Review open tickets before adding exposure.",
            read: false,
            createdAt: "2026-04-28T17:40:00.000Z"
          }
        ],
        reviewQueue: [
          {
            id: "review-1",
            user: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.cocoa",
              city: "Chicago",
              state: "IL",
              trustScore: 85
            },
            kind: "meetup_face",
            confidenceScore: 0.63,
            decision: "manual_review",
            reason: "Trade review required for restricted-state account automation",
            createdAt: "2026-04-28T18:04:00.000Z"
          },
          {
            id: "review-2",
            user: {
              id: "user-avery",
              displayName: "Avery Brooks",
              username: "@avery.trades",
              city: "New York",
              state: "NY",
              trustScore: 78
            },
            kind: "monthly_id",
            confidenceScore: 0.57,
            decision: "manual_review",
            reason: "Account document fallback did not meet confidence threshold",
            createdAt: "2026-04-28T11:12:00.000Z"
          }
        ],
        reports: [
          {
            id: "report-1",
            subjectType: "message",
            subjectLabel: "Direct message from @newcounterparty23",
            reason: "Asked to move settlement discussion off-platform too early",
            status: "open",
            createdAt: "2026-04-28T10:15:00.000Z"
          },
          {
            id: "report-2",
            subjectType: "post",
            subjectLabel: "Open cocoa hedge ticket",
            reason: "Missing price-limit details",
            status: "triaged",
            createdAt: "2026-04-28T09:20:00.000Z"
          }
        ],
        featureFlags: {
          paymentsEnabled: false,
          adsEnabled: false,
          phoneVerificationEnabled: false,
          mediaRetentionDays: 30,
          rawIdRetentionDays: 7,
          selfieRetentionHours: 24,
          excludedStates: ["IL", "TX", "WA"]
        },
        moderationLog: [
          {
            id: "log-1",
            actor: "Riley Carter",
            action: "Escalated risk review",
            subject: "review-2",
            createdAt: "2026-04-28T11:15:00.000Z"
          }
        ]
      };

      await Promise.all(
        this.state.users.map(async (user) => {
          user.passwordHash = await argon2.hash("cocodashdemo");
        })
      );
    }
  }

  findUserById(id: string) {
    return this.state.users.find((user) => user.id === id);
  }

  findUserByEmail(email: string) {
    return this.state.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  getFeatureFlags() {
    return this.state.featureFlags;
  }

  buildDashboardSnapshot(userId: string): DashboardSnapshot {
    const user = this.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      currentUser: user,
      activities: this.state.activities,
      clubs: this.state.clubs,
      events: this.state.events,
      feed: this.state.feed,
      conversations: this.state.conversations.filter((conversation) =>
        conversation.participants.some((participant) => participant.id === userId)
      ),
      messages: this.state.messages.filter((message) =>
        this.state.conversations
          .filter((conversation) =>
            conversation.participants.some((participant) => participant.id === userId)
          )
          .some((conversation) => conversation.id === message.conversationId)
      ),
      notifications: this.state.notifications,
      reviewQueue: this.state.reviewQueue.filter(
        (item) => item.user.id === userId || user.role === "platform_admin"
      ),
      reports: user.role === "platform_admin" ? this.state.reports : [],
      featureFlags: this.state.featureFlags
    };
  }

  buildAdminSnapshot(): AdminSnapshot {
    return {
      overview: {
        activeUsers: this.state.users.filter((user) => !user.suspended).length,
        openActivities: this.state.activities.filter((activity) => activity.status === "open").length,
        reviewBacklog: this.state.reviewQueue.length,
        openReports: this.state.reports.filter((report) => report.status !== "resolved").length,
        clubs: this.state.clubs.length,
        blockedUsers: this.state.users.filter((user) => user.suspended).length
      },
      reviewQueue: this.state.reviewQueue,
      reports: this.state.reports,
      featureFlags: this.state.featureFlags,
      moderationLog: this.state.moderationLog
    };
  }

  async createUser(input: {
    email: string;
    password: string;
    displayName: string;
    city: string;
    state: string;
  }) {
    const profile: DemoUserRecord = {
      id: `user-${crypto.randomUUID()}`,
      displayName: input.displayName,
      username: `@${input.displayName.toLowerCase().replace(/\s+/g, "")}`,
      age: 18,
      bio: "Freshly joined Coco Trading Dash.",
      city: input.city,
      state: input.state.toUpperCase(),
      interests: [],
      role: "member",
      avatarTone: "slate",
      trustScore: 40,
      friendCount: 0,
      badges: ["New account"],
      identityVerified: false,
      idCheckDueAt: now(),
      meetupFaceCheckRequired: true,
      biometricRestricted: this.state.featureFlags.excludedStates.includes(input.state.toUpperCase()),
      email: input.email,
      passwordHash: await argon2.hash(input.password),
      emailVerified: false,
      suspended: false
    };

    this.state.users.push(profile);
    return profile;
  }

  async verifyPassword(user: DemoUserRecord, password: string) {
    return argon2.verify(user.passwordHash, password);
  }

  createActivity(userId: string, input: CreateActivityBody) {
    const user = this.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.identityVerified) {
      throw new Error("Identity verification is required before posting activities");
    }

    const activity = {
      id: `activity-${crypto.randomUUID()}`,
      activity: input.activity,
      title: input.title,
      summary: input.summary,
      preferredGender: input.preferredGender,
      ageRange: {
        min: input.minAge,
        max: input.maxAge
      },
      skillLevel: input.skillLevel,
      approximateArea: computeApproximateArea(input.city, input.state.toUpperCase(), input.distanceMiles),
      distanceMiles: input.distanceMiles,
      whenLabel: input.whenLabel,
      createdBy: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        avatarTone: user.avatarTone,
        trustScore: user.trustScore,
        identityVerified: user.identityVerified
      },
      status: "open" as const,
      applicants: 0,
      verificationGate: "required" as const,
      createdAt: now()
    };

    this.state.activities.unshift(activity);
    return activity;
  }

  createFeedPost(userId: string, input: CreateFeedPostBody) {
    const user = this.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const post = {
      id: `post-${crypto.randomUUID()}`,
      author: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        avatarTone: user.avatarTone,
        trustScore: user.trustScore
      },
      clubId: input.clubId ?? null,
      headline: input.headline,
      body: input.body,
      createdAt: now(),
      comments: [],
      reactions: [{ emoji: "👍", count: 1 }]
    };

    this.state.feed.unshift(post);
    return post;
  }

  sendMessage(userId: string, conversationId: string, input: SendMessageBody) {
    const conversation = this.state.conversations.find((entry) => entry.id === conversationId);
    const user = this.findUserById(userId);

    if (!conversation || !user) {
      throw new Error("Conversation not found");
    }

    const message = {
      id: `message-${crypto.randomUUID()}`,
      conversationId,
      authorId: userId,
      body: input.body,
      attachmentLabel: input.attachmentLabel ?? null,
      createdAt: now()
    };

    this.state.messages.push(message);
    conversation.lastMessagePreview = input.body;
    conversation.lastMessageAt = message.createdAt;
    return message;
  }

  joinClub(userId: string, clubId: string) {
    const user = this.findUserById(userId);
    const club = this.state.clubs.find((entry) => entry.id === clubId);

    if (!club || !user) {
      throw new Error("Club not found");
    }

    if (user.trustScore < club.trustLevelRequired) {
      throw new Error("This club requires a higher trust score");
    }

    club.membersCount += 1;
    return club;
  }

  submitVerification(userId: string, attempt: VerificationAttemptBody) {
    const user = this.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const outcome = scoreVerificationAttempt(attempt);

    if (outcome.decision === "auto_pass") {
      user.identityVerified = true;
      user.trustScore = Math.min(100, user.trustScore + 4);
      user.idCheckDueAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
      user.meetupFaceCheckRequired = false;
    } else {
      const queueItem = {
        id: `review-${crypto.randomUUID()}`,
        user: {
          id: user.id,
          displayName: user.displayName,
          username: user.username,
          city: user.city,
          state: user.state,
          trustScore: user.trustScore
        },
        kind: attempt.kind,
        confidenceScore: Number(outcome.score.toFixed(2)),
        decision: outcome.decision,
        reason:
          outcome.decision === "auto_fail"
            ? "OSS verification score fell below the hard failure threshold"
            : "Queued for human review before the trade or account refresh clears",
        createdAt: now()
      };

      this.state.reviewQueue.unshift(queueItem);
    }

    return outcome;
  }

  updateFeatureFlags(input: AdminSettingsBody) {
    this.state.featureFlags = {
      ...input
    };

    return this.state.featureFlags;
  }

  applyAdminDecision(input: {
    reviewId: string;
    decision: "auto_pass" | "manual_review" | "auto_fail";
    note: string;
    actorName: string;
  }) {
    const review = this.state.reviewQueue.find((item) => item.id === input.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    review.decision = input.decision;
    review.reason = input.note;

    const user = this.findUserById(review.user.id);
    if (user && input.decision === "auto_pass") {
      user.identityVerified = true;
      user.trustScore = Math.min(100, user.trustScore + 3);
    }

    this.state.moderationLog.unshift({
      id: `log-${crypto.randomUUID()}`,
      actor: input.actorName,
      action: `Set ${input.reviewId} to ${input.decision}`,
      subject: review.user.username,
      createdAt: now()
    });

    return review;
  }

  getConversationMessages(conversationId: string) {
    return this.state.messages.filter((message) => message.conversationId === conversationId);
  }

  getNotificationsForUser(_userId: string): Notification[] {
    return this.state.notifications;
  }
}
