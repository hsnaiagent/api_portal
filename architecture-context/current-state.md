# Current State

## Document Type

**Fact** — as described in the enterprise brief. Gaps marked as **Assumption** or **Unknown**.

---

## Existing Landscape

### API Proliferation

- **Thousands of REST APIs** exist across HR, Finance, Operations, Procurement, and Sales domains.
- APIs were created independently by domain teams over time.
- No enterprise-wide API registry or catalog exists.
- Documentation quality and format vary widely (OpenAPI, ad-hoc wiki pages, inline code comments, or none).

### Discovery & Consumption Today

| Capability | Current State |
|------------|---------------|
| API discovery | Informal — word of mouth, internal wikis, direct contact with domain teams |
| API documentation | Fragmented, inconsistent, often outdated |
| Access requests | Ad-hoc emails, tickets, or domain-specific processes |
| Consumer tracking | Limited or none at enterprise level |
| Usage analytics | Per-system logging at best; no federated view |
| Credential management | Domain-specific; no standard pattern |

---

## Existing Enterprise Capabilities

### Workflow Engine (Confirmed)

**Fact:** An enterprise workflow engine already exists for **data permission approvals**.

| Attribute | Detail |
|-----------|--------|
| Purpose | Access to data requires approval from designated individuals |
| Orchestration | Engine determines required approvers, sequence, and decisions |
| Constraint | New platform **must integrate** with this engine and **must not bypass** it |

**Unknown (requires validation):**

- Workflow engine product/vendor and API surface
- Whether the engine supports webhooks/callbacks on state change
- Available workflow templates and how they map to API access scenarios
- Idempotency and retry semantics of trigger API

See [`open-questions.md`](open-questions.md) OQ-001.

### Identity & Access Management

**Assumption:** Enterprise has an IdP supporting SSO for internal users (likely SAML/OIDC).

**Unknown:**

- Specific IdP product
- Whether service accounts / OAuth2 client credentials are available for machine-to-machine
- Group/role structure for RBAC mapping

See [`open-questions.md`](open-questions.md) OQ-002.

### API Gateway

**Fact (from target vision):** A runtime gateway is **planned** as part of the target platform.

**Current state:** No unified enterprise API gateway governs all existing APIs today. Individual domains may use their own proxies, load balancers, or direct exposure.

### AI Capabilities

**Fact (from brief):** The enterprise has:

- Model APIs
- RAG services
- Internal AI agents
- MCP-based tools

**Current state:** These are not governed through a unified API portal. Relationship between AI services and REST APIs is undefined at enterprise level.

---

## Current Challenges (Detailed)

### 1. No Unified Discovery

Developers cannot:

- Search across domains for APIs matching a need
- Understand what data an API exposes without reading source code
- Identify API owners or escalation paths
- Determine whether an API is active, deprecated, or experimental

**Result:** Duplicate APIs, repeated development, inconsistent data models for the same business concepts.

### 2. Fragmented Lifecycle

No centralized process for:

- Proposing new APIs
- Reviewing and approving API designs
- Publishing with consistent metadata
- Deprecating and retiring APIs
- Notifying consumers of breaking changes

**Result:** API sprawl, orphaned endpoints, security and compliance blind spots.

### 3. Lack of Visibility

Enterprise leadership and platform teams cannot answer:

- Who is consuming which APIs?
- Which APIs are high-traffic vs unused?
- Which domains have the most duplication risk?
- Are access grants aligned with data classification policy?

**Result:** Cannot govern, optimize, or audit the API ecosystem.

---

## Technical Constraints

| Constraint | Source | Impact |
|------------|--------|--------|
| Workflow engine is authoritative for approvals | Enterprise policy | Portal triggers only; cannot embed approval logic |
| Thousands of existing APIs | Historical growth | Migration must be incremental (metadata-first) |
| Multi-domain independence | Organizational structure | Portal federates; does not centralize domain backends |
| Sensitive data across domains | Data classification policy | Visibility and access rules vary by classification |
| MVP uses demo/simulated data | Project phase | Real integrations deferred; contracts must be stable |

---

## What Does Not Exist Today

- Enterprise API portal / developer portal
- Unified API registry with lifecycle state machine
- Formal subscription model (Consumer X approved for API Y for purpose Z)
- Cross-domain semantic search over API catalog
- Federated analytics (technical + business metrics)
- Standard credential provisioning tied to subscriptions

---

## Migration Starting Point

Existing APIs will enter the ecosystem through a **tiered registration model** (see ADR-005 in [`decisions.md`](decisions.md)):

1. **Tier 1 — Metadata Only:** Registered for discovery and governance; traffic unchanged.
2. **Tier 2 — Gateway Proxied:** Traffic routed through new gateway with auth enforcement.
3. **Tier 3 — Gateway Native:** Fully managed through gateway runtime.

Most existing APIs are expected to begin at **Tier 1**.

---

## Interactive Mockup (`portal/`)

**Fact (2026-06-28):** A React + TypeScript interactive mockup exists under `portal/` covering consumer, provider, and admin flows with simulated AI and workflow adapters.

| Attribute | Detail |
|-----------|--------|
| Brand colors | `portal/public/Brand Colors.csv` — authoritative palette |
| Design system | [`design-system.md`](design-system.md) |
| Implementation | Tailwind v4 tokens in `portal/src/index.css`, config in `portal/src/config/brand-colors.ts` |

---

## Related Documents

- [`business-context.md`](business-context.md) — why change is needed
- [`integration-contracts.md`](integration-contracts.md) — how we integrate with workflow engine and gateway
- [`assumptions.md`](assumptions.md) — what we assume about existing systems
- [`open-questions.md`](open-questions.md) — unknowns about current-state systems
