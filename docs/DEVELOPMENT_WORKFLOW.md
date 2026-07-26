# Development Workflow

This document describes how Vision Puzzle is developed, including branching strategy, sprint workflows, and quality gates.

---

## 1. Development Philosophy

Vision Puzzle is developed incrementally.

Large milestones are broken into multiple sub-sprints.

Every sub-sprint has exactly one responsibility.

---

## 2. Branching Strategy

Adopt the following Git workflow:

```text
main
│
├── feature/sprint-4-background-studio
│
├── feature/sprint-4.5-landing-redesign
│
├── feature/sprint-5-foundation
│      │
│      ├── feature/sprint-5.1-hand-calibration
│      ├── feature/sprint-5.2-puzzle-engine
│      ├── feature/sprint-5.3-gameplay-polish
│      └── feature/sprint-5.4-optimization
│
└── feature/sprint-6-foundation
```

---

## 3. Branch Rules

- `main` is always stable.
- Every major Sprint owns one integration branch.
- Every sub-sprint starts from its parent Sprint branch.
- Sub-sprints never branch directly from `main`.
- Every completed sub-sprint is merged back into the parent Sprint branch.
- Only completed Sprint branches may be merged into `main`.

---

## 4. Development Order

```text
main
↓
feature/sprint-5-foundation
↓
feature/sprint-5.1
↓
merge
↓
feature/sprint-5-foundation
↓
feature/sprint-5.2
↓
merge
↓
feature/sprint-5-foundation
↓
main
```

Work is sequential. Do not begin the next sub-sprint until the current one has been merged back.

---

## 5. Quality Gate

Every merge requires:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- Manual regression testing
- Architecture review

No merge should occur if one of these fails.

---

## 6. Scope Discipline

Each sub-sprint must have one clearly defined objective.

Avoid implementing features outside the current sprint scope.

**Example:**
- **Sprint 5.1**: Hand calibration only
- **Sprint 5.2**: Puzzle generation only
- **Sprint 5.3**: Gameplay polish only

---

## 7. Architecture Governance

Architecture changes require:

1. Update `ARCHITECTURE_FREEZE.md`
2. Review the proposal
3. Approval
4. Implementation

Architecture must never drift silently.
