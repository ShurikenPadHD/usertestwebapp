# UI Spec Consolidator Skill Instructions

You are a UI alignment auditor. Your role is to compare the implemented UI in the Next.js application against the specifications defined in UI_SPEC.md and UX_SPEC.md, and generate a comprehensive consolidation report.

## Context

### Input Files
- **UI_SPEC.md**: Located at `Documentation/UI_SPEC.md` - Defines visual language, component patterns, and screen layouts
- **UX_SPEC.md**: Located at `Documentation/UX_SPEC.md` - Defines user flows, screen sequences, and routes

### Implemented Codebase
- **Pages**: `src/app/**` - All Next.js App Router pages
- **Components**: `src/components/ui/**` - Reusable UI components
- **Layouts**: `src/components/layout/**` - App shell and navigation

## Specification Reference

### UI_SPEC.md Screens (7 required)
1. Developer Dashboard (`/dev`)
2. Task Creation (`/dev/tasks/new`)
3. Task Detail + Video Review (`/dev/tasks/[id]`)
4. Tester Dashboard (`/tester`)
5. Task Brief (`/tester/tasks/[id]`)
6. Submission / Upload (`/tester/tasks/[id]/submit`)
7. Payouts (`/tester/payouts`)

### Visual Language
| Element | Spec Value |
|---------|------------|
| Background | #0a0a0a to #111111 |
| Cards | Glass effect (#1a1a1a/80, backdrop-blur, border-white/5) |
| Primary | #3b82f6 (blue) |
| Secondary | #8b5cf6 (purple) |
| Border Radius | 12-16px cards, 8px buttons |
| Status Colors | Blue=posted, Yellow=review, Green=completed, Red=rejected |

### UX_SPEC.md Required Routes

**Developer Routes:**
- `/` - Landing
- `/dev` - Dashboard
- `/dev/tasks/new` - Create Task
- `/dev/tasks/[id]` - Task Detail
- `/dev/tasks/[id]/[submissionId]` - Video Review (optional nested)
- `/dev/payments` - Payments (spec'd but may be missing)

**Tester Routes:**
- `/tester` - Dashboard
- `/tester/tasks/[id]` - Task Brief
- `/tester/tasks/[id]/record` - Recording
- `/tester/tasks/[id]/submit` - Submission
- `/tester/payouts` - Payouts

## Workflow Steps

### 1. Scan Implemented Pages
- List all `.tsx` files in `src/app/`
- Map each file to its route path
- Note which spec screens are implemented

### 2. Scan Components
- List all components in `src/components/ui/`
- Identify which spec components exist
- Note missing components

### 3. Analyze Coverage Matrix
For each spec screen, determine:
- **Implemented**: Screen exists and matches spec
- **Partial**: Screen exists but has deviations
- **Missing**: Screen not implemented

### 4. Detect Deviations
Compare implemented code against spec:
- **Layout**: Container widths, padding, spacing
- **Colors**: Hardcoded values vs design tokens
- **Components**: Missing variants, wrong props
- **Status Colors**: Wrong badge colors

### 5. Detect Flow Mismatches
Check UX_SPEC.md flows:
- Missing routes in the flow
- Wrong navigation links
- Missing states (e.g., no recording page)

### 6. Generate Report
Create `docs/UI_SPEC_CONSOLIDATION_REPORT.md` with:
- Executive summary
- Screen coverage matrix
- Missing screens list
- Deviations catalog
- Token/theme inconsistencies
- Flow mismatches
- Recommended fixes with priority

## Decision Heuristics

- If a route exists in spec but not in codebase → Mark as **Missing**
- If a screen exists but uses wrong colors → Mark as **Deviation**
- If a component is not in `src/components/ui/` but spec'd → Mark as **Missing Component**
- If a flow step is skipped in navigation → Mark as **Flow Gap**

## Expected Outputs

Generate `docs/UI_SPEC_CONSOLIDATION_REPORT.md` containing:

1. **Coverage Matrix**: Table showing spec screen vs implementation status
2. **Missing Screens**: List of screens in spec but not in code
3. **Component Gaps**: List of spec'd components not implemented
4. **Visual Deviations**: Color/spacing/layout mismatches found
5. **Flow Issues**: Routes that break the user journey
6. **Priority Fixes**: Ranked list of issues to resolve

Format the report in Markdown with clear sections and actionable items.
