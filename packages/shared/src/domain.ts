import { z } from "zod";

export const roleSchema = z.enum([
  "member",
  "club_owner",
  "club_moderator",
  "platform_admin"
]);

export const privacySchema = z.enum(["public", "private", "approval"]);
export const requestStatusSchema = z.enum(["open", "matched", "closed"]);
export const verificationDecisionSchema = z.enum([
  "auto_pass",
  "manual_review",
  "auto_fail"
]);
export const reportStatusSchema = z.enum(["open", "triaged", "resolved"]);
export const notificationChannelSchema = z.enum([
  "in_app",
  "email",
  "web_push"
]);

export const profileSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  username: z.string(),
  age: z.number().int().min(18),
  bio: z.string(),
  city: z.string(),
  state: z.string().length(2),
  interests: z.array(z.string()),
  role: roleSchema,
  avatarTone: z.string(),
  trustScore: z.number().min(0).max(100),
  friendCount: z.number().int().min(0),
  badges: z.array(z.string()),
  identityVerified: z.boolean(),
  idCheckDueAt: z.string(),
  meetupFaceCheckRequired: z.boolean(),
  biometricRestricted: z.boolean()
});

export const ageRangeSchema = z.object({
  min: z.number().int().min(18),
  max: z.number().int().max(99)
});

export const activityRequestSchema = z.object({
  id: z.string(),
  activity: z.string(),
  title: z.string(),
  summary: z.string(),
  preferredGender: z.enum(["female", "male", "any"]),
  ageRange: ageRangeSchema,
  skillLevel: z.enum(["beginner", "casual", "competitive"]),
  approximateArea: z.string(),
  distanceMiles: z.number().min(1).max(100),
  whenLabel: z.string(),
  createdBy: profileSchema.pick({
    id: true,
    displayName: true,
    username: true,
    avatarTone: true,
    trustScore: true,
    identityVerified: true
  }),
  status: requestStatusSchema,
  applicants: z.number().int().min(0),
  verificationGate: z.enum(["required", "trusted_friend_only", "manual_review"]),
  createdAt: z.string()
});

export const clubSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  summary: z.string(),
  city: z.string(),
  state: z.string().length(2),
  membersCount: z.number().int().min(0),
  privacy: privacySchema,
  tags: z.array(z.string()),
  trustLevelRequired: z.number().int().min(0).max(100),
  owner: profileSchema.pick({
    id: true,
    displayName: true,
    username: true,
    avatarTone: true
  })
});

export const clubEventSchema = z.object({
  id: z.string(),
  clubId: z.string(),
  title: z.string(),
  scheduleLabel: z.string(),
  locationLabel: z.string(),
  recurring: z.boolean(),
  rsvps: z.number().int().min(0)
});

export const reactionSchema = z.object({
  emoji: z.string(),
  count: z.number().int().min(0)
});

export const commentSchema = z.object({
  id: z.string(),
  author: profileSchema.pick({
    id: true,
    displayName: true,
    username: true,
    avatarTone: true
  }),
  body: z.string(),
  createdAt: z.string()
});

export const feedPostSchema = z.object({
  id: z.string(),
  author: profileSchema.pick({
    id: true,
    displayName: true,
    username: true,
    avatarTone: true,
    trustScore: true
  }),
  clubId: z.string().nullable(),
  headline: z.string(),
  body: z.string(),
  createdAt: z.string(),
  comments: z.array(commentSchema),
  reactions: z.array(reactionSchema)
});

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  authorId: z.string(),
  body: z.string(),
  attachmentLabel: z.string().nullable(),
  createdAt: z.string()
});

export const conversationSchema = z.object({
  id: z.string(),
  kind: z.enum(["direct", "club"]),
  title: z.string(),
  participants: z.array(
    profileSchema.pick({
      id: true,
      displayName: true,
      username: true,
      avatarTone: true,
      trustScore: true
    })
  ),
  unreadCount: z.number().int().min(0),
  liveCallEnabled: z.boolean(),
  lastMessagePreview: z.string(),
  lastMessageAt: z.string()
});

export const verificationQueueItemSchema = z.object({
  id: z.string(),
  user: profileSchema.pick({
    id: true,
    displayName: true,
    username: true,
    city: true,
    state: true,
    trustScore: true
  }),
  kind: z.enum(["monthly_id", "meetup_face", "appeal", "report_triggered"]),
  confidenceScore: z.number().min(0).max(1),
  decision: verificationDecisionSchema,
  reason: z.string(),
  createdAt: z.string()
});

export const reportSchema = z.object({
  id: z.string(),
  subjectType: z.enum(["user", "club", "post", "message"]),
  subjectLabel: z.string(),
  reason: z.string(),
  status: reportStatusSchema,
  createdAt: z.string()
});

export const notificationSchema = z.object({
  id: z.string(),
  channel: notificationChannelSchema,
  title: z.string(),
  body: z.string(),
  read: z.boolean(),
  createdAt: z.string()
});

export const featureFlagsSchema = z.object({
  paymentsEnabled: z.boolean(),
  adsEnabled: z.boolean(),
  phoneVerificationEnabled: z.boolean(),
  mediaRetentionDays: z.number().int().min(1),
  rawIdRetentionDays: z.number().int().min(1),
  selfieRetentionHours: z.number().int().min(1),
  excludedStates: z.array(z.string().length(2))
});

export const dashboardSnapshotSchema = z.object({
  currentUser: profileSchema,
  activities: z.array(activityRequestSchema),
  clubs: z.array(clubSchema),
  events: z.array(clubEventSchema),
  feed: z.array(feedPostSchema),
  conversations: z.array(conversationSchema),
  messages: z.array(messageSchema),
  notifications: z.array(notificationSchema),
  reviewQueue: z.array(verificationQueueItemSchema),
  reports: z.array(reportSchema),
  featureFlags: featureFlagsSchema
});

export const adminSnapshotSchema = z.object({
  overview: z.object({
    activeUsers: z.number().int().min(0),
    openActivities: z.number().int().min(0),
    reviewBacklog: z.number().int().min(0),
    openReports: z.number().int().min(0),
    clubs: z.number().int().min(0),
    blockedUsers: z.number().int().min(0)
  }),
  reviewQueue: z.array(verificationQueueItemSchema),
  reports: z.array(reportSchema),
  featureFlags: featureFlagsSchema,
  moderationLog: z.array(
    z.object({
      id: z.string(),
      actor: z.string(),
      action: z.string(),
      subject: z.string(),
      createdAt: z.string()
    })
  )
});

export type Role = z.infer<typeof roleSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ActivityRequest = z.infer<typeof activityRequestSchema>;
export type Club = z.infer<typeof clubSchema>;
export type ClubEvent = z.infer<typeof clubEventSchema>;
export type FeedPost = z.infer<typeof feedPostSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type VerificationQueueItem = z.infer<typeof verificationQueueItemSchema>;
export type Report = z.infer<typeof reportSchema>;
export type Notification = z.infer<typeof notificationSchema>;
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
export type DashboardSnapshot = z.infer<typeof dashboardSnapshotSchema>;
export type AdminSnapshot = z.infer<typeof adminSnapshotSchema>;

