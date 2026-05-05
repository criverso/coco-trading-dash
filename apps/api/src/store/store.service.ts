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
            username: "@averyplays",
            age: 29,
            bio: "Pick-up tennis, coffee walks, and trying new rec leagues without weird vibes.",
            city: "Denver",
            state: "CO",
            interests: ["Tennis", "Pilates", "Pickleball"],
            role: "member",
            avatarTone: "mint",
            trustScore: 78,
            friendCount: 12,
            badges: ["ID verified", "Meetup streak", "Trusted player"],
            identityVerified: true,
            idCheckDueAt: "2026-05-20T18:00:00.000Z",
            meetupFaceCheckRequired: true,
            biometricRestricted: false,
            email: "avery@player2.demo",
            passwordHash: "",
            emailVerified: true,
            suspended: false
          },
          {
            id: "user-mara",
            displayName: "Mara Chen",
            username: "@mara.rallies",
            age: 31,
            bio: "Always up for doubles, morning runs, and low-key clubs that actually meet.",
            city: "Seattle",
            state: "WA",
            interests: ["Running", "Tennis", "Hiking"],
            role: "club_owner",
            avatarTone: "orange",
            trustScore: 85,
            friendCount: 20,
            badges: ["Club owner", "Moderator", "Trusted player"],
            identityVerified: true,
            idCheckDueAt: "2026-05-18T18:00:00.000Z",
            meetupFaceCheckRequired: false,
            biometricRestricted: true,
            email: "mara@player2.demo",
            passwordHash: "",
            emailVerified: true,
            suspended: false
          },
          {
            id: "user-riley",
            displayName: "Riley Carter",
            username: "@riley.ops",
            age: 35,
            bio: "Trust and safety, moderation tooling, and too much espresso.",
            city: "Austin",
            state: "TX",
            interests: ["Ops", "Moderation", "Running"],
            role: "platform_admin",
            avatarTone: "blue",
            trustScore: 92,
            friendCount: 5,
            badges: ["Platform admin", "Safety lead"],
            identityVerified: true,
            idCheckDueAt: "2026-05-28T18:00:00.000Z",
            meetupFaceCheckRequired: false,
            biometricRestricted: true,
            email: "riley@player2.demo",
            passwordHash: "",
            emailVerified: true,
            suspended: false
          }
        ],
        activities: [
          {
            id: "activity-1",
            activity: "Tennis",
            title: "Hit for an hour after work",
            summary: "Looking for a woman in the 25-35 range to rally tonight. 3.0-3.5 pace, no pressure.",
            preferredGender: "female",
            ageRange: { min: 25, max: 35 },
            skillLevel: "casual",
            approximateArea: "Denver, CO · within 12 mi",
            distanceMiles: 12,
            whenLabel: "Tonight at 6:30 PM",
            createdBy: {
              id: "user-avery",
              displayName: "Avery Brooks",
              username: "@averyplays",
              avatarTone: "mint",
              trustScore: 78,
              identityVerified: true
            },
            status: "open",
            applicants: 3,
            verificationGate: "required",
            createdAt: "2026-04-28T18:30:00.000Z"
          },
          {
            id: "activity-2",
            activity: "Running",
            title: "5k buddy near Green Lake",
            summary: "Easy run, public route, sunrise start. New people welcome.",
            preferredGender: "any",
            ageRange: { min: 24, max: 40 },
            skillLevel: "beginner",
            approximateArea: "Seattle, WA · within 6 mi",
            distanceMiles: 6,
            whenLabel: "Tomorrow at 7:00 AM",
            createdBy: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.rallies",
              avatarTone: "orange",
              trustScore: 85,
              identityVerified: true
            },
            status: "open",
            applicants: 5,
            verificationGate: "manual_review",
            createdAt: "2026-04-28T17:40:00.000Z"
          }
        ],
        clubs: [
          {
            id: "club-1",
            name: "Mile High Rackets",
            slug: "mile-high-rackets",
            summary: "Casual tennis, rotating ladders, and public-court meetups with real moderation.",
            city: "Denver",
            state: "CO",
            membersCount: 164,
            privacy: "approval",
            tags: ["Tennis", "Doubles", "After work"],
            trustLevelRequired: 70,
            owner: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.rallies",
              avatarTone: "orange"
            }
          },
          {
            id: "club-2",
            name: "Sunrise Social Miles",
            slug: "sunrise-social-miles",
            summary: "Running club for people who want a friendly pace and actual follow-through.",
            city: "Seattle",
            state: "WA",
            membersCount: 91,
            privacy: "public",
            tags: ["Running", "Morning", "Community"],
            trustLevelRequired: 60,
            owner: {
              id: "user-mara",
              displayName: "Mara Chen",
              username: "@mara.rallies",
              avatarTone: "orange"
            }
          }
        ],
        events: [
          {
            id: "event-1",
            clubId: "club-1",
            title: "Tuesday ladder night",
            scheduleLabel: "Every Tuesday · 6:30 PM",
            locationLabel: "Washington Park courts",
            recurring: true,
            rsvps: 26
          },
          {
            id: "event-2",
            clubId: "club-2",
            title: "Saturday coffee run",
            scheduleLabel: "Saturday · 8:00 AM",
            locationLabel: "Green Lake east entrance",
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
              username: "@mara.rallies",
              avatarTone: "orange",
              trustScore: 85
            },
            clubId: "club-1",
            headline: "New-member safety reminder",
            body: "If you’re meeting someone new from the club, keep it on a public court and complete the pre-meet selfie check before you head out.",
            createdAt: "2026-04-28T15:10:00.000Z",
            comments: [
              {
                id: "comment-1",
                author: {
                  id: "user-avery",
                  displayName: "Avery Brooks",
                  username: "@averyplays",
                  avatarTone: "mint"
                },
                body: "This is exactly why I joined here instead of random group chats.",
                createdAt: "2026-04-28T15:21:00.000Z"
              }
            ],
            reactions: [
              { emoji: "👍", count: 11 },
              { emoji: "🎾", count: 6 }
            ]
          },
          {
            id: "post-2",
            author: {
              id: "user-avery",
              displayName: "Avery Brooks",
              username: "@averyplays",
              avatarTone: "mint",
              trustScore: 78
            },
            clubId: null,
            headline: "Court finder success",
            body: "Found a quiet public court through Player 2 and actually got a solid doubles session in. That feels rare and wonderful.",
            createdAt: "2026-04-28T13:15:00.000Z",
            comments: [],
            reactions: [
              { emoji: "👏", count: 8 },
              { emoji: "☕", count: 2 }
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
                username: "@averyplays",
                avatarTone: "mint",
                trustScore: 78
              },
              {
                id: "user-mara",
                displayName: "Mara Chen",
                username: "@mara.rallies",
                avatarTone: "orange",
                trustScore: 85
              }
            ],
            unreadCount: 2,
            liveCallEnabled: true,
            lastMessagePreview: "I can take court 3 if that works for you.",
            lastMessageAt: "2026-04-28T18:10:00.000Z"
          },
          {
            id: "conversation-2",
            kind: "club",
            title: "Mile High Rackets captains",
            participants: [
              {
                id: "user-mara",
                displayName: "Mara Chen",
                username: "@mara.rallies",
                avatarTone: "orange",
                trustScore: 85
              },
              {
                id: "user-riley",
                displayName: "Riley Carter",
                username: "@riley.ops",
                avatarTone: "blue",
                trustScore: 92
              }
            ],
            unreadCount: 0,
            liveCallEnabled: false,
            lastMessagePreview: "Moderation queue is clean again.",
            lastMessageAt: "2026-04-28T16:50:00.000Z"
          }
        ],
        messages: [
          {
            id: "message-1",
            conversationId: "conversation-1",
            authorId: "user-mara",
            body: "You still good for a public-court hit tonight?",
            attachmentLabel: null,
            createdAt: "2026-04-28T17:55:00.000Z"
          },
          {
            id: "message-2",
            conversationId: "conversation-1",
            authorId: "user-avery",
            body: "Yep. I’ll do the meetup face check now so we’re clear.",
            attachmentLabel: null,
            createdAt: "2026-04-28T18:02:00.000Z"
          },
          {
            id: "message-3",
            conversationId: "conversation-1",
            authorId: "user-mara",
            body: "I can take court 3 if that works for you.",
            attachmentLabel: null,
            createdAt: "2026-04-28T18:10:00.000Z"
          }
        ],
        notifications: [
          {
            id: "notification-1",
            channel: "in_app",
            title: "Monthly ID refresh due soon",
            body: "Complete your next ID check before May 20 to keep posting and sending media.",
            read: false,
            createdAt: "2026-04-28T12:00:00.000Z"
          },
          {
            id: "notification-2",
            channel: "web_push",
            title: "Meetup selfie ready",
            body: "You can clear the new-person face check now for tonight’s tennis hit.",
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
              username: "@mara.rallies",
              city: "Seattle",
              state: "WA",
              trustScore: 85
            },
            kind: "meetup_face",
            confidenceScore: 0.63,
            decision: "manual_review",
            reason: "Biometric state excluded from automated meet check",
            createdAt: "2026-04-28T18:04:00.000Z"
          },
          {
            id: "review-2",
            user: {
              id: "user-avery",
              displayName: "Avery Brooks",
              username: "@averyplays",
              city: "Denver",
              state: "CO",
              trustScore: 78
            },
            kind: "monthly_id",
            confidenceScore: 0.57,
            decision: "manual_review",
            reason: "OCR fallback did not meet confidence threshold",
            createdAt: "2026-04-28T11:12:00.000Z"
          }
        ],
        reports: [
          {
            id: "report-1",
            subjectType: "message",
            subjectLabel: "Direct message from @newfriend23",
            reason: "Asked to move the meetup off-platform too early",
            status: "open",
            createdAt: "2026-04-28T10:15:00.000Z"
          },
          {
            id: "report-2",
            subjectType: "post",
            subjectLabel: "Open run meetup near Capitol Hill",
            reason: "Missing public-location details",
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
            action: "Escalated verification",
            subject: "review-2",
            createdAt: "2026-04-28T11:15:00.000Z"
          }
        ]
      };

      await Promise.all(
        this.state.users.map(async (user) => {
          user.passwordHash = await argon2.hash("player2demo");
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
      bio: "Freshly joined Player 2.",
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
            : "Queued for human review before the meetup or monthly refresh clears",
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
