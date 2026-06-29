# Architecture Decision Records (ADRs)

## Document Type

**Decision** — settled architecture decisions. Status: **Accepted** unless noted otherwise.

To propose a change, document the conflict and create a new ADR superseding the old one.

---

## ADR Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-001 | Portal triggers workflows; engine orchestrates | Accepted | 2026-06-27 |
| ADR-002 | Consumer identity = Application with Team ownership | Accepted | 2026-06-27 |
| ADR-003 | OAuth2 for portal auth and service account credentials | Accepted (updated) | 2026-06-27 |
| ADR-004 | AI suggests, human confirms, workflow triggers | Accepted | 2026-06-27 |
| ADR-005 | Three-tier gateway registration model | Accepted | 2026-06-27 |
| ADR-006 | Unified portal with AI Marketplace module | Accepted | 2026-06-27 |
| ADR-007 | Provider approval required after workflow | Accepted | 2026-06-27 |
| ADR-008 | Portal and gateway loosely coupled | Accepted | 2026-06-27 |
| ADR-009 | Classification-driven visibility | Accepted | 2026-06-27 |
| ADR-010 | Subscription binds to API with min version | Accepted | 2026-06-27 |
| ADR-011 | Refined API lifecycle state machine | Accepted | 2026-06-27 |
| ADR-012 | Mock implementation, not mock interface | Accepted | 2026-06-27 |
| ADR-013 | Adopt enterprise official data classification taxonomy | Accepted | 2026-06-27 |
| ADR-014 | Two-mode sandbox (pre-subscription and post-subscription) | Accepted | 2026-06-27 |
| ADR-015 | SDK = contextual code snippet generation from OpenAPI spec | Accepted | 2026-06-27 |
| ADR-016 | Adopt Brand Colors.csv as portal UI palette | Accepted | 2026-06-28 |

---

## ADR-001: Portal Triggers Workflows; Engine Orchestrates

**Status:** Accepted

**Context:** Enterprise has an existing workflow engine for data permission approvals. The portal needs to integrate without duplicating or bypassing approval logic.

**Decision:** The portal **triggers** workflow instances via the engine's API. The workflow engine **orchestrates** approver resolution, sequencing, and decisions. The portal maintains a local `WorkflowInstance` cache for display only — the engine is the source of truth.

**Consequences:**
- Portal must not embed approver resolution logic.
- Workflow engine must expose trigger API, status query API, and webhook callbacks.
- If webhooks unavailable, polling fallback required (Phase 2).

**Alternatives Rejected:**
- Portal fully orchestrates workflows — duplicates engine logic, violates constraint.
- Workflow engine embeds portal UI — wrong separation of concerns.

---

## ADR-002: Consumer Identity = Application with Team Ownership

**Status:** Accepted

**Context:** "Consumer" is ambiguous — could mean user, team, application, or service account. This affects subscriptions, credentials, audit, and gateway integration.

**Decision:** The consumer entity is an **Application** (registered machine consumer). Applications belong to a **Team**, which belongs to a **Domain**. Subscriptions bind to Applications, not individual users. Users act on behalf of teams but credentials belong to applications.

**Consequences:**
- Maps cleanly to OAuth2 client credentials / service accounts.
- Prevents personal credential sprawl.
- Audit trail: "Application X (owned by Team Y) accessed API Z."
- MVP must include Application entity from day one.

**Alternatives Rejected:**
- User-level subscriptions — credentials tied to individuals, poor audit, high churn.
- Team-level subscriptions — too coarse; multiple apps per team need separate access.

---

## ADR-003: OAuth2 for Portal Authentication and Service Account Credentials

**Status:** Accepted (updated 2026-06-27 — supersedes initial draft which deferred OAuth2 to Phase 2)

**Context:** Enterprise OAuth2 infrastructure is confirmed available. Users of the portal authenticate via OAuth2. Service account credentials (for consumer applications accessing APIs via gateway) are also OAuth2 client credentials. The previous assumption that OAuth2 would only be available in Phase 2 is now resolved.

**Decision:**
- **Portal human authentication (MVP):** OAuth2 Authorization Code flow. Users log in to the portal via the enterprise OAuth2 provider.
- **Application service account credentials (MVP):** OAuth2 Client Credentials grant. Consumer applications obtain credentials via enterprise OAuth2. API keys are eliminated from the credential strategy.
- **Restricted APIs:** mTLS in addition to OAuth2 (Future phase, unchanged).

**Consequences:**
- API keys are no longer part of the credential design at any phase. Remove references to API key generation from portal and gateway.
- MVP integrates directly with enterprise OAuth2 provider. No portal-managed password auth.
- Gateway validates tokens via OAuth2 introspection or JWT verification from day one.
- `integration-contracts.md` IdP-2 section is promoted from Phase 2 to MVP.

**Change from initial draft:** Initial draft accepted API keys for MVP sandbox and deferred OAuth2 to Phase 2. This is superseded. OAuth2 is available now and must be used from MVP.

**Alternatives Rejected:**
- API keys — weak rotation, no standard introspection, audit gaps; removed entirely.
- Portal-managed passwords — re-inventing identity infrastructure that already exists.
- mTLS for all APIs — operational overhead disproportionate for Internal/Public.

**Resolved:** OQ-002.

---

## ADR-004: AI Suggests, Human Confirms, Workflow Triggers

**Status:** Accepted

**Context:** Brief proposes AI that "triggers processes automatically" based on user intent. This creates governance and accountability gaps.

**Decision:** AI capabilities are **advisory only**:
- AI suggests similar APIs, recommended workflows, auto-tags.
- Human user **must confirm** before any workflow is triggered or lifecycle transition occurs.
- No autonomous access grants.

**Consequences:**
- Duplication prevention shows suggestions; provider confirms.
- Workflow type suggestion displayed; consumer/admin confirms before trigger.
- Accountability remains with human actors; AI actions logged as recommendations.

**Alternatives Rejected:**
- Fully autonomous AI workflow triggering — audit risk, incorrect approvals on sensitive data.

---

## ADR-005: Three-Tier Gateway Registration Model

**Status:** Accepted

**Context:** Thousands of existing APIs cannot be big-bang migrated to a new gateway.

**Decision:** APIs register at one of three tiers:

| Tier | Name | Traffic | Auth |
|------|------|---------|------|
| 1 | Metadata Only | Direct to backend | Backend responsibility |
| 2 | Gateway Proxied | Through gateway | Gateway enforced |
| 3 | Gateway Native | Through gateway | Full platform features |

Default for existing APIs: **Tier 1**. Migration is voluntary and phased.

**Consequences:**
- Portal provides value (discovery, governance) even without gateway migration.
- Gateway features (rate limiting, runtime auth) only apply to Tier 2+.
- Analytics from gateway limited to Tier 2+ APIs initially.

---

## ADR-006: Unified Portal with AI Marketplace Module

**Status:** Accepted

**Context:** Brief conflates API governance with AI platform management. Need clear boundary.

**Decision:** One unified portal with a dedicated **AI Marketplace module** for model APIs, RAG endpoints, and MCP tools. These AI resources follow the same lifecycle, subscription, and classification model as REST APIs.

AI platform internals (model training, prompt management, RAG corpus) remain **out of scope** — managed by AI Platform team.

**Consequences:**
- Single identity, RBAC, credential, and audit infrastructure.
- AI Marketplace is a Phase/Future module, not MVP.
- Avoids duplicate governance workflows and credential stores.

**Alternatives Rejected:**
- Separate AI marketplace platform — duplicate infrastructure, fragmented governance.

---

## ADR-007: Provider Approval Required After Workflow

**Status:** Accepted

**Context:** Question whether workflow approval alone can grant runtime access, or if provider must also accept.

**Decision:** Workflow approval alone does **not** grant runtime access. After workflow approval, the API provider must **accept** the consumer. Provider can reject even after workflow approval.

**Consequences:**
- Two-step access grant: workflow (policy) + provider (operational).
- Provider notified on every subscription request.
- Adds latency but ensures provider accountability.

**Alternatives Rejected:**
- Workflow-only grant — provider loses control over who consumes their API.

---

## ADR-008: Portal and Gateway Loosely Coupled

**Status:** Accepted

**Context:** Portal and gateway are distinct systems. Need integration pattern.

**Decision:**
- Portal provisions subscriptions and credentials to gateway via **admin API or event bus**.
- Gateway does **not** call portal at runtime.
- Portal is **never on the critical path** for API calls.

**Consequences:**
- Gateway must maintain local subscription cache (synced from portal).
- Gateway can operate during portal outage for already-provisioned subscriptions.
- Eventual consistency between portal and gateway (target: < 5 min).

---

## ADR-009: Classification-Driven Visibility

**Status:** Accepted

**Context:** Should all APIs be visible to all developers, or restricted?

**Decision:** Visibility tiered by **data classification**, not organizational hierarchy:

| Classification | Visibility | Access |
|----------------|------------|--------|
| Public | All internal users | Self-service |
| Internal | All internal users | Workflow approval |
| Confidential | Owning domain (+ explicit cross-domain grant) | Workflow + Data Owner |
| Restricted | Not searchable; invitation only | Workflow + Data Owner + Provider |

**Consequences:**
- `classification` and `domain_id` required on every API record from MVP.
- Cross-domain Confidential access requires explicit grant mechanism (Phase 2).

---

## ADR-010: Subscription Binds to API with Minimum Version

**Status:** Accepted

**Context:** Should subscriptions pin to a specific API version or the API entity?

**Decision:** Subscriptions bind to the **API entity** with a `min_version` constraint. Consumers receive access to the API at or above the minimum version. Patch updates do not require re-subscription.

**Consequences:**
- Avoids subscription explosion on patch releases.
- Major version breaking changes may require re-subscription (policy TBD).
- Gateway checks subscription against API ID + version compatibility.

---

## ADR-011: Refined API Lifecycle State Machine

**Status:** Accepted

**Context:** Brief's lifecycle (`Draft → Initiating → Under Review → ...`) is too coarse. Missing re-review, emergency retirement, rejection revision.

**Decision:** Adopt refined state machine:

`Draft → Proposed → UnderReview → Approved → InDevelopment → InTesting → Published → Deprecated → Retired`

Additional states: `Rejected` (with path back to Draft), `EmergencyRetired`.

See [`processes-and-workflows.md`](processes-and-workflows.md) W3 for transition matrix.

**Consequences:**
- More states to implement but clearer governance at each stage.
- Existing APIs can fast-track through development states.

---

## ADR-012: Mock Implementation, Not Mock Interface

**Status:** Accepted

**Context:** MVP uses demo data and simulated integrations. Risk of throwaway code if contracts are mocked incorrectly.

**Decision:** MVP mocks the **implementation** (in-memory workflow engine, local gateway simulator) but uses the **production interface contract** (same API schemas, payload formats, webhook events). Swapping mock for production requires no schema changes.

**Consequences:**
- `integration-contracts.md` defines stable contracts from day one.
- MVP code structured with adapter pattern for workflow and gateway integrations.
- WorkflowInstance and Subscription schemas match production expectations.

---

## ADR-013: Adopt Enterprise Official Data Classification Taxonomy

**Status:** Accepted (2026-06-27)

**Context:** OQ-003 asked whether the proposed four-tier classification (Public, Internal, Confidential, Restricted) matched an enterprise standard. The organization's official data classification standard was provided with defined tiers and handling requirements.

**Decision:** The portal adopts the organization's official data classification taxonomy **verbatim** with no modifications. The four tiers in descending sensitivity order are:

| Level | Description |
|-------|-------------|
| **Restricted** | Highly sensitive information whose disclosure could cause severe damage to the organization |
| **Confidential** | Sensitive business information not intended for public disclosure |
| **Internal** | Information intended for use within the vendor-organization relationship |
| **Public** | Information approved for public disclosure |

Handling requirements are authoritative and enforced by the portal and gateway. Full requirements in [`security-model.md`](security-model.md).

**Consequences:**
- The `classification` enum on the API entity uses values: `restricted`, `confidential`, `internal`, `public`.
- Handling requirements (encryption at rest for Restricted, TPC-52 compliance for Confidential, etc.) are enforced at the platform level.
- Restricted classification requires encryption of API metadata at rest in the portal database, not just in transit.
- "Named individual" access requirement for Restricted aligns with invitation-only subscription model (ADR-009) and Application ownership tracking (ADR-002).
- Policy reference TPC-52 (Confidential handling) is an enterprise internal policy; portal must ensure Confidential data transmitted through the gateway meets its requirements.

**Resolved:** OQ-003.

---

## ADR-014: Two-Mode Sandbox (Pre-Subscription and Post-Subscription)

**Status:** Accepted (2026-06-27)

**Context:** Initial requirements only covered a sandbox for testing after a subscription was active. The portal should allow any eligible viewer of an API to trial it before committing to an access request, lowering the barrier to discovery and reducing speculative subscriptions.

**Decision:** The API Detail page provides two distinct sandbox modes:

| Mode | Access Condition | Credentials Used | Data Served |
|------|-----------------|------------------|-------------|
| **Try Before Subscribe** | Any user who can view the API (visibility rules apply) | Demo credentials provided by platform | Mocked/sample responses — no real data |
| **Test With My Credentials** | Active subscriber only | Consumer's real OAuth2 token | Live backend (mock in MVP) |

Classification-based restrictions:
- **Public / Internal:** Full pre-subscription sandbox, sample data visible.
- **Confidential:** Sandbox available with masked/anonymized sample data only.
- **Restricted:** No pre-subscription sandbox access; invitation precedes all interaction.

**Consequences:**
- Sandbox request builder is a portal-native UI component (not an external Swagger UI embed in production, though the same interaction model).
- Pre-subscription sandbox uses platform-managed demo credentials — not the consumer's credentials.
- Sandbox does not bypass the visibility filter; users cannot sandbox-test APIs they cannot see.
- Sandbox pre-fills contextual request values from consumer's `application_description` when present (see ADR-015 and FR-4.7).

**Alternatives Rejected:**
- Post-subscription only — creates a chicken-and-egg problem: developers need to evaluate APIs before committing to an access request workflow.

---

## ADR-015: SDK = Contextual Code Snippet Generation from OpenAPI Spec

**Status:** Accepted (2026-06-27)

**Context:** The portal needs to provide SDK/code support for consumers. Three models were evaluated: generating full SDK library packages, linking to externally hosted SDKs, or generating inline code snippets from the API's OpenAPI spec.

**Decision:** The portal generates **contextual code snippets** from the API's OpenAPI spec on demand. The portal does not build, publish, or maintain SDK packages — that remains the API provider's responsibility.

Generation is parameterized by:
1. **OpenAPI spec** — read from `APIVersion.openapi_spec_content`
2. **Selected language** — cURL, Python, JavaScript/TypeScript, Java, Go
3. **Consumer's `application_description`** (if present on their Application entity) — AI uses this to personalize the snippet: named functions, contextual variable names, relevant comments, their described endpoint usage
4. **Credentials** — consumer's OAuth2 credentials injected (masked in display; real after subscription)

**Consequences:**
- `Application` entity gains a `application_description` field (see `data-model.md`).
- The same `application_description` field is used by AI-1 (Application Planner), AI-3 (Purpose Helper), AI-5 (Contextual SDK), and sandbox pre-fill — it is the unified AI context for a consumer application.
- Without a description, snippets fall back to generic templates from the spec.
- Providers are encouraged (not required) to include rich OpenAPI examples to improve snippet quality.

**Alternatives Rejected:**
- Full SDK package generation — high maintenance, diverges from provider ownership of their API client.
- External SDK links only — poor developer experience; no inline tryout.

---

## ADR-016: Adopt Brand Colors.csv as Portal UI Palette

**Status:** Accepted (2026-06-28)

**Context:** The portal mockup needs a consistent visual identity aligned with the official brand color export (`portal/public/Brand Colors.csv`). Ad-hoc colors and generic Tailwind palettes (e.g. default slate, purple accents) do not match stakeholder branding.

**Decision:** All portal UI colors must derive from **`Brand Colors.csv`**, exposed as:

1. Tailwind design tokens in `portal/src/index.css` (`brand-*` utilities)
2. TypeScript constants in `portal/src/config/brand-colors.ts`
3. Documented usage rules in `architecture-context/design-system.md`

Semantic mapping: **Dark Green** for primary actions, **Blue** for links, **Green** (`brand-accent`) for highlights, brand grays for neutrals (mapped to `slate-*` where existing components use them).

**Consequences:**
- New UI components must use `brand-*` classes — no inline hex in JSX.
- Cursor rule `.cursor/rules/portal-ui-design.mdc` enforces conventions for `portal/src/**`.
- Functional colors (error red, warning yellow, AI purple badges) remain allowed exceptions.

**Resolved:** Visual consistency requirement captured as NFR-6 in `requirements.md`.

---

## ADR-017: Three-Persona Portal Role Model

**Status:** Accepted (2026-06-28)

**Context:** The mockup originally used six portal roles (`consumer`, `provider`, `domain_admin`, `qa_reviewer`, `portal_admin`, `auditor`). This split consumer and provider into separate login personas, which does not reflect how enterprise developers typically work — they consume APIs first and may later earn publisher capability for a domain.

**Decision:** Replace the six-role model with **three portal personas**:

| Portal Role | Persona | Starting capability |
|-------------|---------|---------------------|
| `developer` | Enterprise developer | Consumer by default; may earn domain-scoped publisher access |
| `llm_admin` | LLM & AI Platform admin | Manages AI Platform (`dom_ai`) APIs and LLM access approvals |
| `portal_admin` | Platform administrator | Full platform control including provider elevation queue |

**Developer elevation:** Developers request publisher access per domain via `ProviderAccessRequest`. Portal Admin approves → `User.provider_domains[]` is updated → sidebar gains publisher navigation for granted domains only.

**Consequences:**
- QA publishing approval consolidated under `llm_admin` (for AI APIs) and `portal_admin` (platform-wide).
- `domain_admin`, `qa_reviewer`, and `auditor` roles removed from portal RBAC; audit access is a `portal_admin` function in MVP mockup.
- Provider pages filter APIs by `provider_domains`, not a separate login role.

---

## ADR-018: LLM API Access Requires ROI Justification Form

**Status:** Accepted (2026-06-28)

**Context:** LLM APIs carry cost, governance, and productivity justification requirements beyond standard API subscription purpose text. The LLM Admin must review business value before approving access.

**Decision:** When a developer requests access to any API in the AI Platform domain (`dom_ai`), the portal presents a mandatory **11-field ROI justification form** (`LLMSubscriptionRequest`) instead of the standard subscription modal:

1. Use Case Name
2. Estimated Value / Cost Savings
3. Admin Area using the use case
4. Deployment Date
5. Task the use case provides productivity for
6. Frequency of performing the task before (#)
7. Frequency of performing the task after (#)
8. Time spent on task before (minutes)
9. Time spent on task after (minutes)
10. Expected number of users
11. Contact

The form displays a **live ROI preview** (time saved per use, total weekly savings) as the user types. Submission creates both a `Subscription` (pending) and an `LLMSubscriptionRequest` routed to the LLM Admin queue.

**Consequences:**
- LLM Admin reviews expanded form fields before approve/reject.
- Standard workflow engine path may still apply for Confidential/Restricted LLM APIs; LLM Admin approval is an additional gate for all `dom_ai` APIs.
- Form component is reusable in API detail modal and LLM Admin review panel.

---

## Related Documents

- [`open-questions.md`](open-questions.md) — unresolved items that may produce new ADRs
- [`assumptions.md`](assumptions.md) — assumptions not yet promoted to decisions
- [`target-architecture.md`](target-architecture.md) — architecture reflecting these decisions
