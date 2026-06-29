# Requirements

## Document Type

**Requirement** — functional and non-functional requirements for the Enterprise API Portal. Tagged by phase: **MVP**, **Phase 2**, **Future**.

---

## Functional Requirements

### FR-1: API Discovery

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-1.1 | Users can search APIs by keyword | MVP | Must |
| FR-1.2 | Users can filter APIs by domain, classification, status, tags | MVP | Must |
| FR-1.3 | Search results respect visibility rules based on classification and user domain | MVP | Must |
| FR-1.4 | API detail page shows metadata, owner, documentation, version history | MVP | Must |
| FR-1.5 | Semantic / natural language search over API catalog | Phase 2 | Should |
| FR-1.6 | Restricted APIs excluded from search; accessible only via direct link/invitation | MVP | Must |

### FR-2: API Registration & Lifecycle

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-2.1 | Providers can register new or existing APIs with metadata | MVP | Must |
| FR-2.2 | APIs follow defined lifecycle state machine | MVP | Must |
| FR-2.3 | Providers can upload or link OpenAPI specifications | MVP | Must |
| FR-2.4 | Providers can assign data classification on registration | MVP | Must |
| FR-2.5 | Portal Admin can accept/reject API proposals | MVP | Must |
| FR-2.6 | QA Reviewer can approve/reject publishing | MVP | Should |
| FR-2.7 | Providers can deprecate and retire APIs with subscriber notification | Phase 2 | Should |
| FR-2.8 | Portal Admin can emergency-retire APIs | Phase 2 | Must |
| FR-2.9 | Duplication detection on new API proposals with similar-API suggestions | Phase 2 | Should |
| FR-2.10 | Providers select gateway registration tier (1/2/3) | MVP | Must |

### FR-3: Subscriptions & Access

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-3.1 | Consumers can register applications as consumption entities | MVP | Must |
| FR-3.2 | Consumers can request subscription to a Published API for a stated purpose | MVP | Must |
| FR-3.3 | Subscription requests trigger workflow engine for Internal+ classifications | MVP | Must |
| FR-3.4 | Public APIs support self-service subscription without workflow | MVP | Must |
| FR-3.5 | Provider must accept/reject consumer after workflow approval | MVP | Must |
| FR-3.6 | Active subscriptions provision credentials via gateway | MVP | Must |
| FR-3.7 | Consumers can view subscription status and history | MVP | Must |
| FR-3.8 | Subscriptions can be revoked by provider, admin, or consumer | Phase 2 | Must |
| FR-3.9 | Subscription records include purpose justification (audit) | MVP | Must |
| FR-3.10 | Subscriptions bind to API with minimum version constraint | MVP | Must |

### FR-4: Developer Experience

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-4.1 | API documentation rendered from OpenAPI spec | MVP | Must |
| FR-4.2 | Pre-subscription sandbox: any authenticated eligible user can try an API with demo credentials and mocked data before requesting access | MVP | Must |
| FR-4.3 | Post-subscription sandbox: active subscribers can test API calls with their real OAuth2 credentials | MVP | Must |
| FR-4.4 | Credential management UI for consumer applications | MVP | Must |
| FR-4.5 | SDK code snippet generation from OpenAPI spec for selected programming language (cURL, Python, JavaScript/TypeScript, Java, Go) | MVP | Must |
| FR-4.6 | SDK snippets personalized to consumer's application description — named functions, contextual variable names, their endpoint | MVP | Must |
| FR-4.7 | Sandbox request builder pre-filled with contextual values derived from consumer's application description | MVP | Should |
| FR-4.8 | Sandbox works for any language the consumer selects; response shown in that language's idiom | MVP | Should |
| FR-4.9 | Consumer application description field stored on Application entity; used as persistent AI context across SDK and sandbox | MVP | Must |

### FR-5: Workflow Integration

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-5.1 | Portal triggers workflow engine with structured payload | MVP | Must |
| FR-5.2 | Portal receives workflow state changes via webhook | MVP | Must |
| FR-5.3 | Portal displays workflow status on subscription and lifecycle records | MVP | Must |
| FR-5.4 | Polling fallback if webhook delivery fails | Phase 2 | Should |
| FR-5.5 | Portal never embeds approver resolution logic | MVP | Must |
| FR-5.6 | MVP supports mock workflow engine with same contract as production | MVP | Must |

### FR-6: Gateway Integration

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-6.1 | Portal provisions subscription records to gateway on access grant | MVP | Must |
| FR-6.2 | Gateway enforces authentication and subscription authorization at runtime | Phase 2 | Must |
| FR-6.3 | Gateway emits request metrics for analytics | Phase 2 | Should |
| FR-6.4 | Portal is not on runtime API call path | MVP | Must |
| FR-6.5 | MVP supports mock gateway with same contract as production | MVP | Must |
| FR-6.6 | Three-tier registration model supported | MVP | Must |

### FR-7: Analytics & Governance

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-7.1 | Dashboard showing API count by domain, status, classification | MVP | Should |
| FR-7.2 | Subscription count and active consumer relationships | MVP | Should |
| FR-7.3 | Technical metrics: call volume, error rate, latency (from gateway) | Phase 2 | Should |
| FR-7.4 | Business metrics: reuse rate, duplication prevention, high-demand domains | Phase 2 | Should |
| FR-7.5 | Audit log of all access requests, approvals, lifecycle transitions | MVP | Must |
| FR-7.6 | Export audit logs for compliance reporting | Phase 2 | Should |

### FR-8: AI Capabilities

FR-8 is expanded to cover all 15 identified AI embedding points, organized by actor. All AI outputs are **advisory** — human confirmation required before any action (ADR-004).

#### FR-8-C: Consumer-Side AI

| ID | AI Point | Requirement | Phase | Priority |
|----|----------|-------------|-------|----------|
| FR-8-C1 | AI-1: Application Planner | Consumer describes their application in natural language; AI maps description to a ranked set of relevant APIs from the catalog (Proposed API Bundle) | MVP | Must |
| FR-8-C2 | AI-1: Bundle Selection | Consumer reviews the proposed bundle, selects APIs, and can request access to the entire set in one action | MVP | Must |
| FR-8-C3 | AI-2: Semantic Search | Natural language search over API catalog; AI understands intent beyond keywords and returns ranked results with relevance explanation | Phase 2 | Should |
| FR-8-C4 | AI-3: Subscription Purpose Helper | On the subscription request form, AI drafts a business justification based on consumer's application description | MVP | Should |
| FR-8-C5 | AI-4: API Recommendations | On API detail page, AI suggests related APIs the consumer may also need, based on catalog similarity and usage patterns | Phase 2 | Should |
| FR-8-C6 | AI-5: Contextual SDK Snippets | AI uses stored application description to generate personalized SDK code: named functions matching consumer's use case, their variable names, their endpoint; works in any selected language | MVP | Must |

#### FR-8-P: Provider-Side AI

| ID | AI Point | Requirement | Phase | Priority |
|----|----------|-------------|-------|----------|
| FR-8-P1 | AI-6: Description Generator | Provider uploads OpenAPI spec; AI generates a human-readable API description | MVP | Should |
| FR-8-P2 | AI-7: Tag Suggester | AI analyzes spec and description to suggest relevant catalog tags with confidence scores | MVP | Should |
| FR-8-P3 | AI-8: Classification Advisor | AI analyzes spec field names, data types, and endpoint patterns to suggest the appropriate enterprise classification level with rationale | MVP | Must |
| FR-8-P4 | AI-9: Duplication Detector | On new API proposal, AI performs semantic comparison against existing catalog and presents ranked similar APIs; provider must confirm intent to proceed | MVP | Must |
| FR-8-P5 | AI-10: Spec Quality Checker | AI reviews uploaded OpenAPI spec for missing descriptions, missing examples, undocumented error codes, and suggests improvements as a checklist | Phase 2 | Should |

#### FR-8-A: Admin/Governance-Side AI

| ID | AI Point | Requirement | Phase | Priority |
|----|----------|-------------|-------|----------|
| FR-8-A1 | AI-11: Workflow Template Suggester | When admin reviews a proposal, AI recommends which workflow template to use based on classification, domain, and data sensitivity | Phase 2 | Should |
| FR-8-A2 | AI-12: Audit Anomaly Alerts | Background process detects unusual access patterns (off-hours spikes, volume anomalies, unusual consumer combinations) and surfaces alerts on admin dashboard | Phase 2 | Should |
| FR-8-A3 | AI-13: Catalog Health Summary | Admin dashboard includes a natural language governance report generated by AI (e.g., "3 APIs have been in Draft state for over 30 days; 2 domains have no published APIs") | MVP | Should |

#### FR-8-G: Platform-Wide AI

| ID | AI Point | Requirement | Phase | Priority |
|----|----------|-------------|-------|----------|
| FR-8-G1 | AI-14: Portal AI Assistant | Floating chat widget available on all portal pages; answers questions about the portal, catalog, workflows; can initiate the Application Planner flow; provides deep links to results | MVP | Must |
| FR-8-G2 | AI-15: Natural Language Global Search | All search bars support natural language queries; AI provides a context card above results explaining how the query was interpreted | Phase 2 | Should |

#### Legacy FR-8 entries (superseded or merged)

| ID | Requirement | Status |
|----|-------------|--------|
| FR-8.1 | Intent-based API suggestion on proposal form | Merged into FR-8-P4 (AI-9) |
| FR-8.2 | Duplication detection | Merged into FR-8-P4 (AI-9) |
| FR-8.3 | Auto-tagging | Merged into FR-8-P2 (AI-7) |
| FR-8.4 | AI suggests workflow type; human confirms | Merged into FR-8-A1 (AI-11) |
| FR-8.5 | AI Marketplace module | Unchanged — Future phase |
| FR-8.6 | AI-registered APIs follow same lifecycle model | Unchanged — Future phase |

### FR-9: Administration

| ID | Requirement | Phase | Priority |
|----|-------------|-------|----------|
| FR-9.1 | RBAC with defined portal roles | MVP | Must |
| FR-9.2 | Domain registry management | MVP | Must |
| FR-9.3 | Tag taxonomy management | Phase 2 | Should |
| FR-9.4 | Emergency API retirement | Phase 2 | Must |
| FR-9.5 | User and team management | MVP | Must |

---

## Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement | Phase | Target |
|----|-------------|-------|--------|
| NFR-1.1 | Portal page load time | MVP | < 3s P95 |
| NFR-1.2 | Search response time (keyword) | MVP | < 1s P95 |
| NFR-1.3 | Search response time (semantic) | Phase 2 | < 2s P95 |
| NFR-1.4 | Subscription provisioning after approval | MVP | < 5 min |
| NFR-1.5 | Gateway authorization check latency | Phase 2 | < 10ms P99 added latency |

### NFR-2: Availability

| ID | Requirement | Phase | Target |
|----|-------------|-------|--------|
| NFR-2.1 | Portal availability | Phase 2 | 99.9% |
| NFR-2.2 | Gateway availability | Phase 2 | 99.95% |
| NFR-2.3 | Portal not required for runtime API calls | MVP | 100% |

### NFR-3: Security

| ID | Requirement | Phase | Target |
|----|-------------|-------|--------|
| NFR-3.1 | All portal access via enterprise SSO | MVP | Must |
| NFR-3.2 | Data classification enforced on visibility and access | MVP | Must |
| NFR-3.3 | All actions audit-logged with actor, timestamp, payload | MVP | Must |
| NFR-3.4 | Credentials encrypted at rest | MVP | Must |
| NFR-3.5 | OAuth2/OIDC for production credentials | Phase 2 | Must |
| NFR-3.6 | mTLS for Restricted API tier | Future | Should |
| NFR-3.7 | No workflow bypass under any circumstance | MVP | Must |

### NFR-4: Scalability

| ID | Requirement | Phase | Target |
|----|-------------|-------|--------|
| NFR-4.1 | Support 10,000+ registered APIs | Phase 2 | Must |
| NFR-4.2 | Support 1,000+ concurrent users | Phase 2 | Must |
| NFR-4.3 | Gateway handles 10,000+ requests/sec aggregate | Future | Should |

### NFR-5: Maintainability

| ID | Requirement | Phase | Target |
|----|-------------|-------|--------|
| NFR-5.1 | MVP data model compatible with production evolution | MVP | Must |
| NFR-5.2 | Integration contracts versioned and documented | MVP | Must |
| NFR-5.3 | Mock implementations swappable without schema changes | MVP | Must |

### NFR-6: Usability & Visual Consistency

| ID | Requirement | Phase | Target |
|----|-------------|-------|--------|
| NFR-6.1 | Portal UI uses official brand palette from `Brand Colors.csv` | MVP | Must |
| NFR-6.2 | Colors exposed as design tokens (not hardcoded in components) | MVP | Must |
| NFR-6.3 | New UI components follow `design-system.md` conventions | MVP | Must |

---

## Constraints

| ID | Constraint | Source |
|----|------------|--------|
| C-1 | Must integrate with existing workflow engine | Enterprise policy |
| C-2 | Must not bypass workflow for data access approvals | Enterprise policy |
| C-3 | MVP uses demo data and simulated integrations | Project scope |
| C-4 | Multi-domain federation; portal does not own domain backends | Architecture |
| C-5 | Incremental API migration; no big-bang cutover | Architecture |

---

## MVP Scope Boundary

### In MVP

- API registry with lifecycle (core states)
- Keyword search with classification-based visibility
- Subscription request flow with mock workflow
- Application registration as consumer entity
- Provider accept/reject consumer
- Mock gateway credential provisioning
- API key credentials (sandbox only)
- Demo data for 1-2 domains
- Basic admin and provider dashboards
- Audit logging

### Out of MVP

- Production workflow engine integration
- Production gateway deployment
- Semantic search / AI duplication detection
- OAuth2/OIDC production credentials
- Live analytics from gateway metrics
- AI Marketplace module
- Deprecation/retirement automation
- Cross-domain Confidential access grants

---

## Requirements Traceability

| Requirement Area | Primary Context File |
|-----------------|---------------------|
| Discovery & visibility | `security-model.md`, `processes-and-workflows.md` W4 |
| Lifecycle | `processes-and-workflows.md` W3, `data-model.md` |
| Subscriptions | `processes-and-workflows.md` W5, `data-model.md` |
| Workflow integration | `integration-contracts.md` |
| Gateway integration | `integration-contracts.md`, `target-architecture.md` |
| AI capabilities | `target-architecture.md`, `decisions.md` ADR-004 |
| Security | `security-model.md` |
| Portal UI / branding | `design-system.md`, `portal/public/Brand Colors.csv` |

---

## Related Documents

- [`target-architecture.md`](target-architecture.md) — architectural solution
- [`decisions.md`](decisions.md) — decisions affecting requirements
- [`open-questions.md`](open-questions.md) — unresolved requirements dependencies
