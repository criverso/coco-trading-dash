import { z } from "zod";

export const registerBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2)
});

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8)
});

export const createActivityBodySchema = z.object({
  activity: z.string().min(2),
  title: z.string().min(4),
  summary: z.string().min(10),
  preferredGender: z.enum(["female", "male", "any"]),
  minAge: z.number().int().min(18),
  maxAge: z.number().int().max(99),
  skillLevel: z.enum(["beginner", "casual", "competitive"]),
  city: z.string().min(2),
  state: z.string().length(2),
  distanceMiles: z.number().int().min(1).max(100),
  whenLabel: z.string().min(3)
});

export const createFeedPostBodySchema = z.object({
  headline: z.string().min(3),
  body: z.string().min(8),
  clubId: z.string().nullable().optional()
});

export const sendMessageBodySchema = z.object({
  body: z.string().min(1),
  attachmentLabel: z.string().nullable().optional()
});

export const verificationAttemptSchema = z.object({
  kind: z.enum(["monthly_id", "meetup_face"]),
  barcodeConfidence: z.number().min(0).max(1),
  ocrConfidence: z.number().min(0).max(1),
  faceMatchConfidence: z.number().min(0).max(1),
  livenessConfidence: z.number().min(0).max(1),
  imageQualityConfidence: z.number().min(0).max(1),
  reportedUser: z.boolean().default(false)
});

export const adminSettingsBodySchema = z.object({
  paymentsEnabled: z.boolean(),
  adsEnabled: z.boolean(),
  phoneVerificationEnabled: z.boolean(),
  mediaRetentionDays: z.number().int().min(1),
  rawIdRetentionDays: z.number().int().min(1),
  selfieRetentionHours: z.number().int().min(1),
  excludedStates: z.array(z.string().length(2))
});

export const adminDecisionBodySchema = z.object({
  decision: z.enum(["auto_pass", "manual_review", "auto_fail"]),
  note: z.string().min(2)
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type CreateActivityBody = z.infer<typeof createActivityBodySchema>;
export type CreateFeedPostBody = z.infer<typeof createFeedPostBodySchema>;
export type SendMessageBody = z.infer<typeof sendMessageBodySchema>;
export type VerificationAttemptBody = z.infer<typeof verificationAttemptSchema>;
export type AdminSettingsBody = z.infer<typeof adminSettingsBodySchema>;
export type AdminDecisionBody = z.infer<typeof adminDecisionBodySchema>;

