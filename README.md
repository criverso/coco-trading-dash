# Player 2

Player 2 is a monorepo MVP for a self-hosted social activity platform: request-board matching, clubs, social feed, messaging, video calls, safety verification, and a full moderation/admin surface.

## Workspace layout

- `apps/app`: member and club-owner PWA
- `apps/admin`: platform admin console
- `apps/api`: NestJS API with seeded demo state and feature-gating logic
- `packages/shared`: shared TypeScript domain models, zod schemas, and safety logic
- `infra`: local infrastructure config for Postgres, Redis, MinIO, LiveKit, Mailpit, and Caddy

## Quick start

1. Copy `.env.example` to `.env` if you want local overrides.
2. Start infra if you want the full local stack:

```bash
docker compose up -d postgres redis minio mailpit livekit
```

3. Install workspace dependencies:

```bash
npm install
```

4. Start the development apps:

```bash
npm run dev
```

Member app: `http://localhost:3000`

Admin app: `http://localhost:3001`

API: `http://localhost:4000`

Mail inbox: `http://localhost:8025`

MinIO console: `http://localhost:9001`

## Current implementation notes

- The API boots with a seeded in-memory demo state so the full product surface is explorable immediately.
- Shared safety logic covers trust scoring, biometric state exclusions, verification scoring, retention planning, and club gating.
- Postgres, Redis, MinIO, and LiveKit are scaffolded for the intended production architecture, but this first pass keeps runtime state in memory to make the stack runnable without a migration step.
- Verification is modeled as OSS-first automation plus manual review escalation.

## Production follow-up

- Swap the seeded store for Postgres repositories and Redis-backed jobs.
- Replace demo LiveKit token issuance with signed production credentials.
- Add OCR/barcode/liveness workers for full document processing.
- Wire SMTP, object-storage encryption keys, and domain-backed Caddy TLS.

