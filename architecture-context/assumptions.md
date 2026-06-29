# Assumptions

## Document Type

**Assumption** — beliefs taken as true pending validation. Must **never** be silently promoted to decisions. Requires explicit stakeholder agreement to become an ADR.

---

## Assumption Index

| ID | Assumption | Risk | Validation Owner | Status |
|----|------------|------|------------------|--------|
| A-001 | Enterprise IdP supports OAuth2 for portal users | Medium | IT Identity | **Validated 2026-06-27** |
| A-002 | Workflow engine has a trigger API | High | Workflow Team | **Validated 2026-06-27** |
| A-003 | Four-tier classification is sufficient | Medium | Security | **Validated 2026-06-27** — see ADR-013 |
| A-004 | Existing APIs can be registered with metadata only (Tier 1) without backend changes | Low | Domain Teams | **Validated 2026-06-27** |
| A-005 | Providers will participate in consumer approval | Medium | Product Owner | **Validated 2026-06-27** |
| A-006 | Demo data is sufficient for MVP validation | Low | Product Owner | **Validated 2026-06-27** |
| A-007 | Keyword search is sufficient for MVP discovery | Low | Product Owner | **Validated 2026-06-27** |
| A-008 | One portal team can build MVP without dedicated gateway team | Medium | Platform Team | **Validated 2026-06-27** |
| A-009 | OpenAPI is the standard API specification format across domains | Medium | Domain Architects | **Validated 2026-06-27** |
| A-010 | Internal embedding service will be available for Phase 2 AI features | Medium | AI Platform Team | **Validated 2026-06-27** |

---

## A-001: Enterprise IdP Supports OAuth2

**Assumption:** The enterprise has an identity provider that supports OAuth2 for authenticating portal users.

**Evidence:** Standard for enterprises of this scale; stated in brief as internal developer portal.

**Risk:** Medium — if no IdP, portal auth must be built separately.

**Validation:** **Validated 2026-06-27.** OAuth2 is confirmed available. Users of the portal authenticate via OAuth2. See ADR-003 (updated) and resolved OQ-002.

---

## A-002: Workflow Engine Has a Trigger API

**Assumption:** The existing workflow engine exposes an API to programmatically trigger workflow instances with a structured payload.

**Evidence:** Brief states engine exists and platform must integrate; most enterprise workflow engines expose APIs.

**Risk:** High — if no API, integration requires custom adapter or engine upgrade.

**Validation:** **Validated 2026-06-27.** Workflow engine confirmed to work as expected. Integration contracts in `integration-contracts.md` are authoritative. See resolved OQ-001.

---

## A-003: Four-Tier Classification Is Sufficient

**Assumption:** Public, Internal, Confidential, Restricted covers all enterprise API data sensitivity levels.

**Evidence:** Common enterprise pattern; proposed in ADR-009.

**Risk:** Medium — if enterprise has existing taxonomy, mapping required.

**Validation:** **Validated 2026-06-27.** The organization's official data classification standard uses the same four tiers with defined handling requirements. Portal adopts this taxonomy verbatim. See ADR-013 and resolved OQ-003.

---

## A-004: Tier 1 Registration Requires No Backend Changes

**Assumption:** Domain teams can register existing APIs in the portal (Tier 1 — metadata only) without modifying their backend systems, DNS, or routing.

**Evidence:** Tier 1 design explicitly separates metadata registration from traffic routing.

**Risk:** Low — Tier 1 is metadata-only by definition.

**Validation:** **Validated 2026-06-27.**

---

## A-005: Providers Will Participate in Consumer Approval

**Assumption:** API providers will actively review and accept/reject consumer subscription requests (ADR-007).

**Evidence:** Governance best practice; providers are accountable for their APIs.

**Risk:** Medium — provider apathy could bottleneck access grants. Mitigation: auto-accept after timeout (policy TBD); escalation to domain admin.

**Validation:** **Validated 2026-06-27.**

---

## A-006: Demo Data Sufficient for MVP

**Assumption:** MVP with demo data for 1-2 domains and simulated integrations is sufficient to validate the governance model and UX.

**Evidence:** Stated in brief as MVP approach.

**Risk:** Low — MVP is explicitly scoped as demonstration.

**Validation:** **Validated 2026-06-27.**

---

## A-007: Keyword Search Sufficient for MVP

**Assumption:** Keyword-based search (without semantic/AI search) is adequate for MVP discovery UX.

**Evidence:** Semantic search depends on embedding service (A-010); deferred to Phase 2.

**Risk:** Low — MVP validates governance flow, not search quality.

**Validation:** **Validated 2026-06-27.**

---

## A-008: One Team Can Build MVP

**Assumption:** The platform team can deliver MVP (portal + mock integrations) without a dedicated gateway engineering team.

**Evidence:** MVP uses gateway simulator, not production gateway.

**Risk:** Medium — Phase 2 gateway integration may require additional team capacity.

**Validation:** **Validated 2026-06-27.**

---

## A-009: OpenAPI Is Standard Spec Format

**Assumption:** Domain APIs can provide OpenAPI (Swagger) specifications for portal documentation.

**Evidence:** REST APIs dominate; OpenAPI is industry standard.

**Risk:** Medium — some legacy APIs may lack OpenAPI specs. Mitigation: manual documentation entry; spec generation tools.

**Validation:** **Validated 2026-06-27.**

---

## A-010: Embedding Service Available for Phase 2

**Assumption:** An internal embedding service (or accessible model API) will be available for semantic search and duplication detection in Phase 2.

**Evidence:** Brief mentions enterprise Model APIs and RAG services exist.

**Risk:** Medium — if unavailable, Phase 2 AI features delayed or require external service (governance concerns).

**Validation:** **Validated 2026-06-27.**

---

## Assumption Management Rules

1. **New assumptions** discovered during design → add here with risk rating.
2. **Validated assumptions** → if they drive architecture, promote to ADR in [`decisions.md`](decisions.md).
3. **Invalidated assumptions** → mark as **Invalidated**, document impact, propose ADR change if needed.
4. **Never** move an assumption to decisions without explicit stakeholder agreement.

---

## Related Documents

- [`decisions.md`](decisions.md) — promoted assumptions
- [`open-questions.md`](open-questions.md) — questions arising from assumptions
- [`current-state.md`](current-state.md) — facts vs assumptions about existing systems
