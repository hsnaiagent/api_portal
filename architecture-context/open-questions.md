# Open Questions

## Document Type

**Unknown / Unresolved** — items requiring stakeholder input. When resolved, move to [`decisions.md`](decisions.md) and update status here.

---

## Summary

| ID | Question | Impact | Owner | Status |
|----|----------|--------|-------|--------|
| OQ-001 | Workflow engine webhook capability | **Blocking** | Platform Team | **Resolved 2026-06-27** |
| OQ-002 | Enterprise IdP for OAuth2/OIDC | **Blocking** | Platform Team / IT | **Resolved 2026-06-27** |
| OQ-003 | Data classification taxonomy validation | **High** | Security / Compliance | **Resolved 2026-06-27** — see ADR-013 |
| OQ-004 | Workflow engine API surface and templates | **High** | Platform Team | Open |
| OQ-005 | Gateway product selection | **High** | Platform Team | Open |
| OQ-006 | Cross-domain Confidential access policy | **Medium** | Domain Architects | Open |
| OQ-007 | Major version re-subscription policy | **Medium** | Platform Team | Open |
| OQ-008 | Audit log retention period | **Medium** | Security / Compliance | Open |
| OQ-009 | AI embedding service availability | **Medium** | AI Platform Team | Open |
| OQ-010 | MVP demo domain selection | **Low** | Product Owner | Open |

---

## OQ-001: Workflow Engine Webhook Capability

**Question:** Does the existing workflow engine support webhooks/callbacks on workflow state changes?

**Options:**
1. **Yes, native webhooks** — Portal subscribes to state change events. Preferred.
2. **No webhooks, polling only** — Portal polls status API on interval. Acceptable with delay.
3. **No API at all** — Blocking; requires workflow engine upgrade or adapter service.

**Impact:** **Blocking** for production integration. MVP can mock, but production architecture depends on this.

**Owner:** Platform Team

**Resolution (2026-06-27):** Resolved. Workflow engine confirmed to work as expected (all assumptions validated). Integration proceeds per contracts defined in `integration-contracts.md`.

---

## OQ-002: Enterprise IdP for OAuth2/OIDC

**Question:** Which identity provider will issue OAuth2 client credentials for consumer applications?

**Options:**
1. Existing enterprise IdP (Azure AD, Okta, Keycloak, etc.) with client credentials grant.
2. Portal-managed credentials (not recommended for production).
3. Gateway-managed credentials independent of IdP.

**Impact:** **Blocking** for credential strategy (ADR-003).

**Owner:** Platform Team / IT Identity

**Resolution (2026-06-27):** Resolved. OAuth2 is confirmed available. Portal users authenticate via OAuth2 from MVP. Service account client credentials for applications also use OAuth2 — no deferral to Phase 2. See updated ADR-003.

---

## OQ-003: Data Classification Taxonomy Validation

**Question:** Is the four-tier classification (Public, Internal, Confidential, Restricted) approved by enterprise security/compliance?

**Options:**
1. Adopt as-is — proceed with ADR-009 visibility model.
2. Modify tiers — adjust visibility rules and schema enum.
3. Map to existing enterprise data classification standard — portal uses enterprise taxonomy.

**Impact:** **High** — affects every API record, visibility rules, and workflow routing.

**Owner:** Security / Compliance

**Resolution (2026-06-27):** Resolved via option 3. The organization's official data classification standard was provided. The four tiers (Restricted, Confidential, Internal, Public) are confirmed as the authoritative taxonomy with defined handling requirements. Portal adopts this taxonomy verbatim. See ADR-013 and updated `security-model.md`.

---

## OQ-004: Workflow Engine API Surface and Templates

**Question:** What workflow templates exist for API access approval? What is the trigger API contract?

**Options:**
1. Single generic "data access approval" template — portal passes context in payload.
2. Multiple templates per classification level — portal selects template based on API classification.
3. Templates must be created — new workflow definitions needed before integration.

**Impact:** **High** — affects integration-contracts.md payload design and AI workflow suggestion logic.

**Owner:** Platform Team / Workflow Engine Team

---

## OQ-005: Gateway Product Selection

**Question:** Which API gateway product will be used for the runtime plane?

**Options:**
1. Kong — open source / enterprise
2. Apigee — Google Cloud
3. Azure API Management
4. AWS API Gateway
5. Custom / in-house gateway
6. Undecided — evaluate during Phase 2

**Impact:** **High** — affects gateway integration contract, credential format, rate limiting capabilities.

**Recommendation:** Defer to Phase 2 for production selection. MVP uses gateway simulator with abstract contract.

**Owner:** Platform Team

---

## OQ-006: Cross-Domain Confidential Access Policy

**Question:** Can a consumer from Domain A access a Confidential API owned by Domain B?

**Options:**
1. **Denied by default** — Confidential APIs visible only within owning domain.
2. **Allowed with explicit cross-domain grant** — Domain B admin pre-authorizes Domain A.
3. **Allowed via workflow only** — Consumer can request; Data Owner from Domain B approves via workflow.

**Impact:** **Medium** — affects visibility filter logic and workflow routing.

**Recommendation:** Option 3 for MVP (simplest). Option 2 for Phase 2 if cross-domain demand is high.

**Owner:** Domain Architects

---

## OQ-007: Major Version Re-Subscription Policy

**Question:** When an API publishes a new major version with breaking changes, must existing subscribers re-request access?

**Options:**
1. **Automatic** — existing subscriptions apply to new major version (min_version updated).
2. **Re-subscription required** — breaking changes trigger new workflow approval.
3. **Provider decides** — provider marks major version as requiring re-approval.

**Impact:** **Medium** — affects subscription lifecycle and gateway version routing.

**Recommendation:** Option 3 — provider control aligns with ADR-007 accountability principle.

**Owner:** Platform Team

---

## OQ-008: Audit Log Retention Period

**Question:** How long must audit logs (access requests, approvals, lifecycle transitions) be retained?

**Options:**
1. Per enterprise compliance standard (TBD — likely 3-7 years).
2. 1 year minimum for MVP.
3. Indefinite with archival strategy.

**Impact:** **Medium** — affects storage architecture and compliance reporting.

**Owner:** Security / Compliance

---

## OQ-009: AI Embedding Service Availability

**Question:** Is an internal embedding service available for semantic search and duplication detection?

**Options:**
1. Existing enterprise embedding API — integrate directly.
2. Use external model API (OpenAI, etc.) — governance concerns for internal data.
3. Build embedding pipeline as part of portal — significant scope increase.
4. Defer AI features to Phase 2 — MVP uses keyword search only.

**Impact:** **Medium** — affects Phase 2 AI feature timeline.

**Recommendation:** Option 4 for MVP. Validate option 1 with AI Platform Team for Phase 2 planning.

**Owner:** AI Platform Team

---

## OQ-010: MVP Demo Domain Selection

**Question:** Which 1-2 business domains should MVP demo data represent?

**Options:**
1. HR + Finance — high API volume, sensitive data examples.
2. Operations + Procurement — moderate complexity.
3. Single domain (HR) — simplest MVP.

**Impact:** **Low** — affects demo data content only; no architectural impact.

**Recommendation:** Option 3 for simplest MVP; expand to option 1 for richer demo.

**Owner:** Product Owner

---

## Resolution Process

1. Question raised → added here with options and impact.
2. Stakeholder discussion → recommendation documented.
3. Decision made → new ADR in [`decisions.md`](decisions.md).
4. Update status here to **Resolved** with link to ADR.

---

## Related Documents

- [`decisions.md`](decisions.md) — settled decisions
- [`assumptions.md`](assumptions.md) — assumptions pending validation
- [`integration-contracts.md`](integration-contracts.md) — depends on OQ-001, OQ-004
