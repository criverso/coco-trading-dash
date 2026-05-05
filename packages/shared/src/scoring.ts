import type { ActivityRequest, FeatureFlags } from "./domain";

export const BIOMETRIC_RESTRICTED_STATES = ["IL", "TX", "WA"] as const;

export function isBiometricRestrictedState(state: string): boolean {
  return BIOMETRIC_RESTRICTED_STATES.includes(state.toUpperCase() as (typeof BIOMETRIC_RESTRICTED_STATES)[number]);
}

export function computeApproximateArea(city: string, state: string, distanceMiles: number): string {
  return `${city}, ${state} · within ${distanceMiles} mi`;
}

export function scoreVerificationAttempt(input: {
  barcodeConfidence: number;
  ocrConfidence: number;
  faceMatchConfidence: number;
  livenessConfidence: number;
  imageQualityConfidence: number;
  reportedUser?: boolean;
}) {
  const weighted =
    input.barcodeConfidence * 0.2 +
    input.ocrConfidence * 0.15 +
    input.faceMatchConfidence * 0.3 +
    input.livenessConfidence * 0.25 +
    input.imageQualityConfidence * 0.1;

  const penalty = input.reportedUser ? 0.12 : 0;
  const score = Math.max(0, Math.min(1, weighted - penalty));

  if (score >= 0.82) {
    return { score, decision: "auto_pass" as const };
  }

  if (score >= 0.58) {
    return { score, decision: "manual_review" as const };
  }

  return { score, decision: "auto_fail" as const };
}

export function shouldPromoteTrustedFriend(input: {
  requesterConfirmed: boolean;
  responderConfirmed: boolean;
  previousTrustScore: number;
}) {
  return input.requesterConfirmed && input.responderConfirmed && input.previousTrustScore >= 55;
}

export function planRetention(featureFlags: FeatureFlags) {
  return {
    rawIdDays: featureFlags.rawIdRetentionDays,
    mediaDays: featureFlags.mediaRetentionDays,
    meetupSelfieHours: featureFlags.selfieRetentionHours
  };
}

export function canCreateClub(trustScore: number, featureFlags: FeatureFlags) {
  return trustScore >= 75 && !featureFlags.phoneVerificationEnabled;
}

export function sortActivitiesByFreshness(activities: ActivityRequest[]) {
  return [...activities].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
}

