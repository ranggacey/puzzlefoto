# Sprint 3.5 — Architecture Cleanup & Refactor

## Objective
Solidify the project architecture by standardizing public APIs, removing dead code, and formalizing the definition of the codebase before introducing complex AI libraries in Sprint 4.

## Scope
- Perform a comprehensive codebase audit.
- Minimize public API surfaces across all existing features (Photo Booth, Layout, etc.).
- Standardize naming conventions and remove inconsistent terminology.
- Remove obsolete TODO/FIXME comments and dead code.
- Generate the official `ARCHITECTURE_FREEZE.md` document.
- *Out of Scope*: New feature implementations, UI redesigns, AI integration.

## Architecture Impact
- **Architecture Freeze**: Established the formal `ARCHITECTURE_FREEZE.md` contract, guaranteeing that feature development must adapt to the architecture and not the other way around.
- **Strict Encapsulation**: Enforced the rule that features can only expose explicitly required hooks/components via a barrel `index.ts`. All other implementation details are strictly private.

## Implementation Summary
The sprint focused entirely on reducing technical debt. All internal utilities, components, and types were audited. Obsolete structural remnants from early prototypes were purged. Naming inconsistencies (e.g. `capturedImage` vs `capturedPhoto`) were unified. We officially created the `ARCHITECTURE_FREEZE.md` document to govern Sprints 4 through 7.

## Major Decisions
1. **Preserve Shared Tooling**: Decided *not* to aggressively purge unused `shadcn/ui` primitives (`button`, `card`, `badge`) or generalized animations, as they provide necessary scaffolding for the upcoming Sprints.
2. **Architecture as a Contract**: Concluded that architecture must never drift silently. Any future architectural change requires an explicit proposal, review, and update to the documentation before code implementation.

## Verification
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Manual testing performed (Verified that no existing Photo Booth functionality was broken by the encapsulation changes).

## Known Issues
None.

## Lessons Learned
Taking a dedicated "half-sprint" exclusively for refactoring and documentation dramatically improves the clarity of the codebase. It creates a much safer foundation for integrating heavy, unpredictable machine learning dependencies.

## Next Sprint
**Sprint 4 — Background Studio**: Introduce AI-powered background removal using MediaPipe Selfie Segmentation, strictly adhering to the finalized Architecture Freeze.
