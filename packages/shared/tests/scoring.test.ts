import { describe, expect, it } from "vitest";

import {
  BIOMETRIC_RESTRICTED_STATES,
  canCreateClub,
  computeApproximateArea,
  isBiometricRestrictedState,
  planRetention,
  scoreVerificationAttempt,
  shouldPromoteTrustedFriend
} from "../src";

describe("shared safety logic", () => {
  it("keeps the restricted-state list stable", () => {
    expect(BIOMETRIC_RESTRICTED_STATES).toEqual(["IL", "TX", "WA"]);
    expect(isBiometricRestrictedState("il")).toBe(true);
    expect(isBiometricRestrictedState("CA")).toBe(false);
  });

  it("scores strong verification attempts as auto-pass", () => {
    const result = scoreVerificationAttempt({
      barcodeConfidence: 0.95,
      ocrConfidence: 0.88,
      faceMatchConfidence: 0.91,
      livenessConfidence: 0.9,
      imageQualityConfidence: 0.87
    });

    expect(result.decision).toBe("auto_pass");
    expect(result.score).toBeGreaterThan(0.82);
  });

  it("downgrades reported users into manual review", () => {
    const result = scoreVerificationAttempt({
      barcodeConfidence: 0.75,
      ocrConfidence: 0.72,
      faceMatchConfidence: 0.71,
      livenessConfidence: 0.72,
      imageQualityConfidence: 0.8,
      reportedUser: true
    });

    expect(result.decision).toBe("manual_review");
  });

  it("promotes trusted friends only after mutual confirmation", () => {
    expect(
      shouldPromoteTrustedFriend({
        requesterConfirmed: true,
        responderConfirmed: true,
        previousTrustScore: 68
      })
    ).toBe(true);

    expect(
      shouldPromoteTrustedFriend({
        requesterConfirmed: true,
        responderConfirmed: false,
        previousTrustScore: 68
      })
    ).toBe(false);
  });

  it("formats approximate areas and retention plans", () => {
    expect(computeApproximateArea("Austin", "TX", 12)).toBe("Austin, TX · within 12 mi");

    expect(
      planRetention({
        paymentsEnabled: false,
        adsEnabled: false,
        phoneVerificationEnabled: false,
        mediaRetentionDays: 30,
        rawIdRetentionDays: 7,
        selfieRetentionHours: 24,
        excludedStates: ["IL", "TX", "WA"]
      })
    ).toEqual({
      rawIdDays: 7,
      mediaDays: 30,
      meetupSelfieHours: 24
    });
  });

  it("gates club creation behind trust", () => {
    const flags = {
      paymentsEnabled: false,
      adsEnabled: false,
      phoneVerificationEnabled: false,
      mediaRetentionDays: 30,
      rawIdRetentionDays: 7,
      selfieRetentionHours: 24,
      excludedStates: ["IL", "TX", "WA"]
    };

    expect(canCreateClub(77, flags)).toBe(true);
    expect(canCreateClub(58, flags)).toBe(false);
  });
});
