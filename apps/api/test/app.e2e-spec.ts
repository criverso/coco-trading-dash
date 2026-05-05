import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../src/app.module";

describe("Player 2 API", () => {
  let app: INestApplication;
  let memberToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    memberToken = (await request(app.getHttpServer()).get("/auth/demo/member")).body.token;
    adminToken = (await request(app.getHttpServer()).get("/auth/demo/admin")).body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns a dashboard snapshot for an authenticated member", async () => {
    const response = await request(app.getHttpServer())
      .get("/dashboard")
      .set("Authorization", `Bearer ${memberToken}`)
      .expect(200);

    expect(response.body.currentUser.username).toBe("@averyplays");
    expect(response.body.activities.length).toBeGreaterThan(0);
  });

  it("creates an activity for a verified member", async () => {
    const response = await request(app.getHttpServer())
      .post("/activities")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        activity: "Tennis",
        title: "Morning rally partner",
        summary: "Looking for one partner for a public-court warmup and rally session.",
        preferredGender: "any",
        minAge: 24,
        maxAge: 38,
        skillLevel: "casual",
        city: "Denver",
        state: "CO",
        distanceMiles: 10,
        whenLabel: "Tomorrow 8 AM"
      })
      .expect(201);

    expect(response.body.activity).toBe("Tennis");
    expect(response.body.createdBy.username).toBe("@averyplays");
  });

  it("queues a low-confidence verification for review", async () => {
    const response = await request(app.getHttpServer())
      .post("/verification/attempt")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        kind: "monthly_id",
        barcodeConfidence: 0.58,
        ocrConfidence: 0.62,
        faceMatchConfidence: 0.67,
        livenessConfidence: 0.7,
        imageQualityConfidence: 0.66,
        reportedUser: false
      })
      .expect(201);

    expect(response.body.decision).toBe("manual_review");
  });

  it("updates admin settings behind the admin role", async () => {
    const response = await request(app.getHttpServer())
      .post("/admin/settings")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        paymentsEnabled: false,
        adsEnabled: true,
        phoneVerificationEnabled: false,
        mediaRetentionDays: 10,
        rawIdRetentionDays: 7,
        selfieRetentionHours: 12,
        excludedStates: ["IL", "TX", "WA"]
      })
      .expect(201);

    expect(response.body.adsEnabled).toBe(true);
    expect(response.body.mediaRetentionDays).toBe(10);
  });
});
