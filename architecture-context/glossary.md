# Glossary

## Document Type

**Definition** — project-specific terms used across architecture context files.

---

## A

### AI Embedding Points (AI-1 through AI-15)
The 15 identified locations within the portal where AI agents are embedded to assist users. Organized by actor: Consumer (AI-1 to AI-5), Provider (AI-6 to AI-10), Admin/Governance (AI-11 to AI-13), Platform-wide (AI-14 to AI-15). All AI outputs are advisory — human confirmation is required before any action is taken. See [`target-architecture.md`](target-architecture.md) for the full table and [`requirements.md`](requirements.md) FR-8.

### Application Description (`application_description`)
Free-text natural language field on the Application entity. Written by the consumer to describe what their application does and what data it needs. Acts as shared AI context across AI-1 (Application Planner), AI-3 (Subscription Purpose Helper), AI-5 (Contextual SDK Snippets), and sandbox pre-fill. See ADR-015.

### Application Planner (AI-1)
A consumer-facing AI feature where the consumer describes their application in natural language and receives a ranked Proposed API Bundle — a set of catalog APIs matching their described need. The consumer selects from this bundle and can request access to multiple APIs in one action. The consumer's description is saved as `application_description` on their Application entity.

### API Gateway
Runtime layer that routes API traffic, enforces authentication and authorization, applies rate limits, and emits observability data. Distinct from the portal. See [`target-architecture.md`](target-architecture.md).

### API Provider
Person or team responsible for creating, maintaining, and owning an API. Manages lifecycle and reviews consumer requests. See [`actors-and-responsibilities.md`](actors-and-responsibilities.md).

### Application (Consumer Application)
Registered entity representing a machine consumer of APIs. Owns credentials. Belongs to a Team. Target of subscriptions. Carries `application_description` for AI context. See ADR-002.

### AI Marketplace Module
Portal module cataloging model APIs, RAG endpoints, and MCP tools as governed resources with the same lifecycle and subscription model as REST APIs. See ADR-006.

---

## C

### Classification (Data Classification)
Security label assigned to an API based on the sensitivity of data it exposes. Four tiers: Public, Internal, Confidential, Restricted. Drives visibility and access rules. See [`security-model.md`](security-model.md).

### Consumer (API Consumer)
Developer or technical lead who discovers APIs and requests subscriptions on behalf of their team's applications. Distinct from Consumer Application.

---

## D

### Data Owner
Individual accountable for specific data assets. Approves or denies access to Confidential/Restricted APIs via workflow engine. See [`actors-and-responsibilities.md`](actors-and-responsibilities.md).

### Domain
Independent business unit (HR, Finance, Operations, Procurement, Sales). APIs belong to a domain. Teams belong to a domain. Drives visibility for Confidential APIs.

### Duplication Detection
AI-powered analysis comparing a new API proposal against the existing catalog to suggest similar APIs and prevent redundant development. Advisory only. See ADR-004.

---

## G

### Gateway Registration Tier
Level of gateway integration for a registered API:
- **Tier 1 — Metadata Only:** Portal registration only; traffic bypasses gateway.
- **Tier 2 — Gateway Proxied:** Traffic routed through gateway with auth enforcement.
- **Tier 3 — Gateway Native:** Full platform-managed runtime.

See ADR-005.

### Governance Intelligence
Portal capabilities using AI for semantic search, duplication detection, intent-based suggestions, and auto-tagging. Advisory only. See [`target-architecture.md`](target-architecture.md).

---

## L

### Lifecycle (API Lifecycle)
State machine governing an API from creation to retirement. States: Draft, Proposed, UnderReview, Approved, InDevelopment, InTesting, Published, Deprecated, Retired, Rejected, EmergencyRetired. See ADR-011.

---

## P

### Portal (API Portal)
Human-facing platform for API discovery, registration, lifecycle management, subscriptions, developer experience, and governance. Not on the runtime critical path. See [`target-architecture.md`](target-architecture.md).

### Portal Admin
Platform team member with administrative privileges. Manages governance, RBAC, emergency actions. See [`actors-and-responsibilities.md`](actors-and-responsibilities.md).

### Purpose (Subscription Purpose)
Required free-text justification explaining why a consumer application needs access to an API. Used for audit and workflow approver context. Cannot be omitted.

---

## R

### RBAC (Role-Based Access Control)
Portal permission model based on assigned roles: consumer, provider, domain_admin, qa_reviewer, portal_admin, auditor. See [`security-model.md`](security-model.md).

---

## S

### Sandbox (Pre-Subscription Mode)
An interactive API request builder available to any eligible viewer of an API — no subscription required. Uses platform-managed demo credentials and returns mocked/sample responses. Allows consumers to evaluate an API before committing to an access request. Not available for Restricted APIs. See ADR-014.

### Sandbox (Post-Subscription Mode)
An interactive API request builder available to active subscribers. Uses the consumer's real OAuth2 credentials and routes to the live backend (or mock in MVP). Sits on the same "Sandbox" tab as the pre-subscription mode, switching automatically based on subscription status. See ADR-014.

### SDK (Code Snippet Generation)
The portal generates contextual code snippets from an API's OpenAPI spec on demand. Not a compiled library package. Available in: cURL, Python, JavaScript/TypeScript, Java, Go. Snippets are personalized using the consumer's `application_description` when available — functions are named for their use case, variables named for their domain. See ADR-015.

### Subscription
Formalized relationship stating "Consumer Application X is approved to use API Y for purpose Z." Provides access tracking and lifecycle management. See [`data-model.md`](data-model.md).

### Subscription Purpose
Required free-text justification explaining why a consumer application needs access to an API. Used for audit and workflow approver context. Cannot be omitted. AI-3 (Subscription Purpose Helper) can draft this field using the consumer's application description.

---

## T

### Team
Organizational unit within a domain. Owns one or more consumer applications. Users belong to teams.

---

## W

### Workflow Engine
Existing enterprise system that orchestrates data permission approvals. Determines approvers, sequences, and decisions. Authoritative source of truth for approval state. Portal integrates but does not replace. See ADR-001.

### Workflow Instance
Local portal record tracking the status of a workflow triggered for a subscription or lifecycle approval. Cache only — workflow engine is source of truth. See [`data-model.md`](data-model.md).

---

## Related Documents

- [`README.md`](README.md) — project overview
- [`decisions.md`](decisions.md) — decisions defining many of these terms
- [`data-model.md`](data-model.md) — entity definitions
