# API Portal — Interactive Mockup

Fully interactive React + TypeScript frontend mockup of the Enterprise API Portal.

## Run locally

```bash
cd portal
npm install
npm run dev
```

Open http://localhost:5173 — use demo personas on the login screen or OAuth2 sign-in.

## Features

- **Consumer:** Catalog, AI Application Planner, subscriptions, applications, API detail (Overview, Docs, Sandbox, SDK)
- **Provider:** Publish API (AI-assisted), lifecycle management, consumer request approvals
- **Admin:** Proposals queue, publishing queue, RBAC view, audit log with AI anomaly alerts
- **AI:** All 15 embedding points simulated via `src/mocks/AIAdapter.ts`
- **Configurable:** Brand, domains, classification, lifecycle, AI flags in `src/config/`
- **Design system:** [`../architecture-context/design-system.md`](../architecture-context/design-system.md) — colors from `public/Brand Colors.csv`

## Architecture

Matches `/architecture-context` — mock workflow and gateway adapters, in-memory state via React Context.
