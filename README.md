# Coco Trading Dash

Coco Trading Dash is a monorepo MVP for a cocoa trading dashboard: market watch, portfolio metrics, order tickets, desk notes, counterparty groups, messaging, account review, and an admin surface for operations.

## Workspace layout

- `apps/app`: trader-facing dashboard
- `apps/admin`: platform admin console
- `apps/api`: NestJS API with seeded demo trading state and feature-gating logic
- `packages/shared`: shared TypeScript domain models, zod schemas, and review logic
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

Trader app: `http://localhost:3000`

Admin app: `http://localhost:3001`

API: `http://localhost:4000`

Mail inbox: `http://localhost:8025`

MinIO console: `http://localhost:9001`

## Current implementation notes

- The API boots with seeded in-memory cocoa trading data so the dashboard is explorable immediately.
- Shared review logic covers trust scoring, restricted-state exclusions, verification scoring, retention planning, and group gating.
- Postgres, Redis, MinIO, and LiveKit are scaffolded for the intended production architecture, but this first pass keeps runtime state in memory to make the stack runnable without a migration step.
- Account review is modeled as automation plus manual review escalation.

## Production follow-up

- Swap the seeded store for Postgres repositories and Redis-backed jobs.
- Replace demo LiveKit token issuance with signed production credentials.
- Add document-processing workers for full account review.
- Wire SMTP, object-storage encryption keys, and domain-backed Caddy TLS.
