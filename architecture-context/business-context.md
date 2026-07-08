# Business Context

## Document Type

**Fact** — derived from enterprise brief and organizational context provided at project initiation.

---

## Organizational Context

The enterprise operates across **five independent business domains**:

| Domain | Typical API Concerns |
|--------|---------------------|
| HR | Employee data, payroll, benefits, org structure |
| Finance | Ledger, billing, budgeting, financial reporting |
| Operations | Production, logistics, asset management |
| Procurement | Vendors, contracts, purchase orders |
| Sales | CRM, orders, customer data, revenue |

Each domain has independently developed **thousands of REST APIs** over time, without a centralized governance or discovery mechanism.

---

## Business Drivers

### Primary Drivers

1. **Reduce duplicate API development** — developers recreate APIs because they cannot find existing ones.
2. **Accelerate time-to-integration** — consumers need a single place to discover, understand, and request access to APIs.
3. **Establish enterprise API governance** — consistent lifecycle, documentation, ownership, and approval processes.
4. **Improve visibility** — understand who consumes what, usage patterns, and provider/consumer relationships.
5. **Enforce data access governance** — integrate with existing permission approval workflows; do not bypass them.

### Secondary Drivers

6. **Promote API reuse** — measure and incentivize consumption of existing APIs over net-new development.
7. **Support AI-assisted discovery** — use semantic search and duplication detection to guide developers toward existing capabilities.
8. **Prepare for platform scale** — architecture must support thousands of APIs and hundreds of concurrent consumers.

---

## Problems Being Solved

| Problem | Business Impact |
|---------|-----------------|
| No unified discovery | Wasted development effort, inconsistent data exposure, shadow APIs |
| Fragmented lifecycle | Inconsistent documentation, no deprecation process, orphaned APIs |
| Lack of visibility | Cannot measure reuse, cannot audit access, cannot manage relationships |
| No centralized governance | Security gaps, duplicate sensitive data exposure, compliance risk |
| Manual, opaque access requests | Slow onboarding, unclear approval paths, developer frustration |

---

## Desired Outcomes

### Short-Term (MVP)

- Demonstrate end-to-end flow: discover API → request access → workflow approval → subscription granted → consume via sandbox.
- Prove governance model with demo data and simulated integrations.
- Validate UX for providers, consumers, and admins.

### Medium-Term

- Onboard first production domain with real APIs registered in the portal.
- Integrate with production workflow engine and gateway (Tier 2 registration).
- Launch semantic search and duplication detection for API proposals.

### Long-Term

- Majority of enterprise APIs registered and discoverable.
- Measurable reduction in duplicate API creation.
- Full analytics on technical and business metrics (calls, errors, reuse, high-demand domains).
- AI Marketplace module for governed access to model APIs, RAG services, and MCP tools.

---

## Success Metrics (Proposed)

| Metric | Target (TBD with stakeholders) |
|--------|-------------------------------|
| API catalog coverage | % of known enterprise APIs registered |
| Duplication prevention rate | % of new API proposals redirected to existing APIs |
| Time to access | Median days from subscription request to active access |
| Reuse ratio | New subscriptions / new API proposals |
| Gateway adoption | % of registered APIs at Tier 2+ |
| Workflow bypass incidents | Zero (mandatory constraint) |

---

## Constraints

1. **Must integrate with existing workflow engine** — the platform cannot replace or bypass enterprise data permission approvals.
2. **Multi-domain independence** — domains retain ownership of their APIs and data; the portal is a federation layer, not a central authority over domain systems.
3. **Incremental adoption** — cannot require big-bang migration of thousands of existing APIs.
4. **Security and compliance** — data classification and audit requirements apply from day one in the data model, even if MVP uses demo data.

---

## Stakeholders

| Stakeholder Group | Interest |
|-------------------|----------|
| API Providers (domain teams) | Publish APIs, manage lifecycle, approve/reject consumers |
| API Consumers (developers, teams) | Discover, request access, consume, test |
| Data Owners | Approve access to sensitive data via workflow engine |
| Platform Team | Build and operate portal and gateway |
| Enterprise Security / Compliance | Classification, audit, access control |
| Domain Architects | Domain API strategy, standards alignment |
| AI Platform Team | Model APIs, RAG, agents — interface with portal, not managed by it |

---

## Out of Scope (Business Level)

- Replacing the enterprise workflow engine
- Managing AI model training, fine-tuning, or RAG corpus internals (AI Platform team scope)
- Direct modification of backend domain systems
- External (public internet) API marketplace — this is an **internal** developer portal

---

## Related Documents

- [`current-state.md`](current-state.md) — existing capabilities and limitations
- [`requirements.md`](requirements.md) — functional and non-functional requirements
- [`target-architecture.md`](target-architecture.md) — proposed solution architecture
