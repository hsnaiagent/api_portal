# Enterprise API Portal — Architecture Context

## Purpose

This folder is the **single source of truth** for architectural context on the Enterprise API Portal initiative. It persists decisions, requirements, assumptions, and open questions across IDE conversations and team discussions.

**Do not rely on chat history alone.** Start every architecture conversation by reading the relevant files here.

---

## Vision

Build a governed, searchable, secure, reusable API ecosystem where developers can discover, publish, and consume APIs with minimal manual friction — without bypassing enterprise data access controls or duplicating existing workflow capabilities.

The platform consists of three distinct planes:

| Plane | Role |
|-------|------|
| **Portal** | Human interface for discovery, lifecycle, subscriptions, governance, and developer experience |
| **Gateway** | Runtime enforcement of auth, authorization, rate limits, traffic management, and observability |
| **Workflow Engine** (existing) | Authoritative orchestrator for data permission approvals |

---

## How to Use These Files

### Start of Conversation

1. Read this README for current status.
2. Read [`decisions.md`](decisions.md) for settled architecture decisions.
3. Read [`open-questions.md`](open-questions.md) for unresolved items.
4. Read any domain-specific files relevant to the topic.
5. For **portal UI** changes, read [`design-system.md`](design-system.md) and `portal/public/Brand Colors.csv`.

### Proposing Changes

- Check [`decisions.md`](decisions.md) first. If a proposal conflicts with a settled decision, explain the conflict explicitly.
- New requirements → update [`requirements.md`](requirements.md).
- New assumptions → update [`assumptions.md`](assumptions.md) (never promote to decisions without agreement).
- Resolved questions → move from [`open-questions.md`](open-questions.md) to [`decisions.md`](decisions.md).

### After Important Discussions

Proactively suggest updates to the relevant context files. Do not silently rewrite decisions.

---

## File Index

| File | Contents |
|------|----------|
| [`business-context.md`](business-context.md) | Business drivers, problems, outcomes, organizational context |
| [`current-state.md`](current-state.md) | Existing systems, APIs, limitations, constraints |
| [`target-architecture.md`](target-architecture.md) | Target architecture, components, integrations, design principles |
| [`actors-and-responsibilities.md`](actors-and-responsibilities.md) | Roles and responsibility matrices |
| [`processes-and-workflows.md`](processes-and-workflows.md) | Creation, publishing, consumption, and approval workflows |
| [`requirements.md`](requirements.md) | Functional and non-functional requirements |
| [`decisions.md`](decisions.md) | Architecture Decision Records (ADRs) |
| [`open-questions.md`](open-questions.md) | Unresolved items with options and impact |
| [`glossary.md`](glossary.md) | Project-specific term definitions |
| [`assumptions.md`](assumptions.md) | Documented assumptions (require explicit agreement to become decisions) |
| [`integration-contracts.md`](integration-contracts.md) | Workflow engine and gateway integration contracts |
| [`data-model.md`](data-model.md) | Core entity model and MVP schema constraints |
| [`security-model.md`](security-model.md) | Classification, RBAC, portal vs gateway security boundaries |
| [`concepts-for-data-scientists.md`](concepts-for-data-scientists.md) | Plain-language concept guide for non-developers; explaining and prompting |
| [`design-system.md`](design-system.md) | Brand colors, UI tokens, component conventions (see `portal/public/Brand Colors.csv`) |

---

## Current Status

| Attribute | Value |
|-----------|-------|
| **Phase** | Architecture initialization — pre-MVP |
| **Workspace** | Interactive React mockup in `portal/` + architecture context |
| **Last Updated** | 2026-06-28 |
| **Decisions Recorded** | 16 ADRs (see `decisions.md`) |
| **Open Questions** | 10 items (see `open-questions.md`) |
| **MVP Scope** | Demo data, simulated integrations, mock workflow interactions |

### Recent Decisions (Summary)

- Portal triggers workflows; workflow engine orchestrates (ADR-001)
- Consumer identity unit = Application with Team ownership (ADR-002)
- OAuth2/OIDC for production credentials; API keys MVP-only (ADR-003)
- AI suggests, human confirms, workflow triggers (ADR-004)
- Three-tier gateway registration model (ADR-005)
- Unified portal with AI Marketplace module (ADR-006)

### Blocking Items Before MVP Code

1. Confirm workflow engine callback/webhook capability (OQ-001)
2. Confirm enterprise identity provider (IdP) for OAuth2/OIDC (OQ-002)
3. Validate data classification taxonomy with security/compliance (OQ-003)

---

## Conversation Rules

1. **Distinguish** Fact, Requirement, Assumption, Recommendation, and Decision in all discussions.
2. **Challenge** assumptions in the brief when a superior approach exists.
3. **Do not invent** missing details — ask questions and record them in `open-questions.md`.
4. **Evaluate boundaries** — not every capability belongs in the same platform.

---

## Main Architecture Challenge

> How can an enterprise with thousands of independently created APIs build a governed, searchable, secure, reusable API ecosystem where developers can easily discover, publish, and consume APIs with minimal manual interaction?

This challenge is addressed across `target-architecture.md`, `processes-and-workflows.md`, and `decisions.md`.
