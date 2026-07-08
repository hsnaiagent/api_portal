# Production-Readiness Audit Prompt — Reviewed & Improved

This file contains:

1. **A critique of the original prompt** — ambiguities and weaknesses found.
2. **The improved, paste-ready prompt** — copy the block under "Improved Prompt" into Agent/Plan mode.

The improvements are grounded in the actual codebase: a React 18 + TypeScript + Vite 6 + Tailwind v4 single-page app (`portal/src`), an Express server with **JSON file storage** (`portal/server`), a React Context + reducer store with persistence (`portal/src/store`), simulated AI/Gateway/Workflow adapters (`portal/src/mocks`), and an extensive specification set in `architecture-context/`.

---

## Part 1 — Critique of the Original Prompt

The original prompt is solid in breadth but has gaps that would lower the quality of the resulting plan:

**Ambiguities**

- **"production-ready" + "keep JSON storage" are in tension and undefined.** "Production-ready" usually implies a real database, auth, and scaling. The prompt never says what production-ready means *under the JSON constraint* (atomic writes, concurrency/locking, schema validation, backups, no data races), so the agent may either propose a DB migration (violating the constraint) or under-deliver on data safety.
- **No definition of "performance."** The wrapper calls this a "performance optimization roadmap," but the prompt body never mentions performance. Performance must be made concrete: bundle size / code-splitting, render performance (re-renders, memoization, large lists), data-layer I/O (full-file JSON rewrites), and network/round-trips.
- **"Review every page/section/element" with no discovery method.** The agent isn't told how to enumerate the surface area, so coverage will be inconsistent. The app already declares its routes in `portal/src/config/routes.ts` and personas/roles in `portal/src/lib/roles.ts` — the prompt should require building an inventory from these.
- **"Ask before guessing business logic" with no source of truth pointer.** The repo contains `architecture-context/` (requirements, decisions/ADRs, data-model, processes-and-workflows, security-model, open-questions, design-system, integration-contracts). Without pointing there, the agent will ask the user questions that are already answered in-repo, or guess. The prompt should require consulting these docs first and only escalate genuine unknowns (see `open-questions.md`).
- **No prioritization scheme.** "Prioritized" is stated but undefined — no impact/effort model, no severity tiers, no "quick wins vs. structural" split, so the output ordering will be arbitrary.
- **No output contract.** Format, granularity, evidence requirements (file:line citations), and per-item acceptance criteria are unspecified, so findings won't be verifiable or actionable.
- **Scope boundaries are fuzzy.** Unclear whether to keep AI/Gateway/Workflow simulated, whether real auth/IdP is in scope, and whether the live Gemini integration (`portal/src/lib/gemini.ts`, `VITE_GEMINI_API_KEY`) is in scope.
- **"Appearance/professional" criteria are unanchored.** The repo has a `design-system.md` and an authoritative palette (`portal/public/Brand Colors.csv`, tokens in `portal/src/index.css`, `portal/src/config/brand-colors.ts`). Polish should be judged against these, not invented.

**Strengthening opportunities**

- Force an **analysis-first, evidence-based** workflow with explicit gates (inventory → findings with citations → prioritized plan) so no solution is proposed before the code is read.
- Add **measurable success criteria** (TypeScript strictness, accessibility, responsive behavior, no console errors, build passes).
- Require each finding to carry **evidence (file:line), impact, effort, and acceptance criteria**.

---

## Part 2 — Improved Prompt

> Copy everything inside the fenced block below into Agent/Plan mode.

```text
ROLE
You are a senior staff engineer performing a production-readiness audit of this repository. Your output is a PLANNING ARTIFACT ONLY — do not modify any code in this pass.

OBJECTIVE
Produce a prioritized, evidence-based implementation plan to take this project from MVP to a production-ready, fully functional platform, PRIORITIZING the highest-impact improvements across four dimensions:
  (1) Performance, (2) Functionality/feature-completeness, (3) Appearance/UX, (4) Professionalism/code quality & reliability.

HARD CONSTRAINTS (do not violate)
- Keep the existing JSON-based storage. Do NOT propose migrating to a database. "Production-ready" here means making the JSON data layer SAFE and ROBUST: atomic writes, concurrency safety, schema validation, edge-case handling, and recoverability — not swapping the storage engine.
- Keep the simulated AI/Gateway/Workflow adapters as the integration boundary unless a doc in architecture-context/ states otherwise; treat their contracts as stable.
- Do not change product/business behavior on your own authority (see GROUNDING).
- This is a planning pass: NO code edits, NO refactors, NO new files except the plan itself if asked.

GROUNDING — DO THIS BEFORE PROPOSING ANYTHING
1. Read the specification set in architecture-context/ first and treat it as the source of truth:
   requirements.md, decisions.md (ADRs), data-model.md, processes-and-workflows.md,
   security-model.md, integration-contracts.md, design-system.md, current-state.md,
   actors-and-responsibilities.md, glossary.md, assumptions.md, open-questions.md.
   Most "business logic" questions are answered here — resolve them from these docs before asking me.
2. Build a complete surface-area INVENTORY from the code itself, not from guesswork:
   - Routes & pages from portal/src/config/routes.ts and portal/src/pages/**
   - Roles/personas from portal/src/lib/roles.ts and portal/src/config/**
   - State/data layer from portal/src/store/** (AppStore, reducer, actions, persistence)
     and the JSON server in portal/server/** (index.mjs, server/data)
   - Shared UI from portal/src/components/** and design tokens in portal/src/index.css,
     portal/src/config/brand-colors.ts, portal/public/Brand Colors.csv
   - AI integration in portal/src/lib/gemini.ts, portal/src/config/ai.ts, portal/src/mocks/**
3. Verify the project builds/runs and capture the baseline: run `npm run build` in portal/
   and note TypeScript errors, warnings, bundle size, and any console errors. Use this as evidence.

ANALYSIS PHASES (gate each phase on the previous one)
PHASE 1 — Inventory: produce the route/page/role/data-flow map described above.
PHASE 2 — Findings: walk every page, section, form, button, input, label, and every empty/loading/error
state, plus the data layer and shared components. For each issue record:
   - Location: file path + line range (cite real code; no invented references)
   - Category: Performance | Functionality | UX/Appearance | Data integrity | Error handling |
     Navigation/Routing | Validation | Accessibility | Code quality/Professionalism
   - Current behavior / problem (with evidence)
   - Required change (specific and concrete)
   - Impact (High/Med/Low) and Effort (S/M/L)
   - Acceptance criteria (how we verify it is fixed)
PHASE 3 — Plan: synthesize findings into a prioritized roadmap.

WHAT TO COVER (audit every item, but prioritize by impact)
- Performance: bundle size & code-splitting/lazy routes; unnecessary re-renders & missing memoization;
  large lists/tables (e.g. audit log, catalog) virtualization; JSON data-layer I/O patterns
  (full-file reads/writes, write amplification, blocking ops); network round-trips & caching;
  search-index build cost (portal/src/lib/search-index.ts).
- Feature completeness: find partially-implemented, stubbed, TODO, or dead features across all personas
  (consumer, provider, admin, llm-admin, developer). List what must be built to make each work end-to-end.
- UI/UX correctness: placeholder text, broken layouts, incomplete interactions, confusing flows, responsive
  breakage. Judge polish against design-system.md and the brand tokens — do not invent styles.
- Data layer integrity: validate all JSON reads/writes; handle missing fields, empty arrays, corrupt/partial
  state, and concurrent writes; ensure persistence (portal/src/store/persistence.ts) and the Express server
  agree on shape and stay consistent.
- Error handling & feedback: every user action needs explicit success/error/loading states
  (use existing primitives: useNotify, ToastContainer, AIThinkingOverlay where appropriate).
- Navigation & routing: confirm every route, link, redirect, and role-guard works; no dead ends or orphan pages.
- Validation & constraints: all forms/inputs enforce validation with meaningful messages.
- Professionalism: TypeScript strictness, consistent typing, no console errors, consistent styling/typography/
  spacing/copy tone, accessibility (labels, focus, keyboard, contrast).

PRIORITIZATION MODEL
Group the plan by AREA/PAGE. Within and across groups, rank using impact-vs-effort and assign severity tiers:
  P0 = broken/blocking or data-loss risk
  P1 = high-impact correctness, performance, or core-flow gaps
  P2 = meaningful UX/polish/consistency
  P3 = nice-to-have
Call out a "Quick Wins" list (high impact / low effort) and a "Structural" list (high impact / high effort) separately.

OUTPUT FORMAT
1. Executive summary (top 5 highest-impact opportunities, with the dimension each serves).
2. Baseline facts (build result, TS errors, bundle size, console errors).
3. Inventory map (routes × roles × data flows).
4. Prioritized plan grouped by area/page; each item in the PHASE 2 finding format above.
5. Quick Wins and Structural lists.
6. Open questions: ONLY genuine unknowns not resolved by architecture-context/ (cross-reference
   open-questions.md). For anything ambiguous about business logic, intended behavior, data rules, or UX
   intent that the docs do NOT settle — STOP and ASK me; do not guess.

RULES
- Cite real evidence (file + line) for every finding; never fabricate code references.
- No code changes in this pass.
- Prefer concrete, verifiable recommendations over generic advice.
```
