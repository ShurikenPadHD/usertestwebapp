# UI Spec Consolidator Examples

## Example 1: Run Full Audit

**Input:**
```
Use ui-spec-consolidator to run a full audit of the Next.js app
```

**Actions:**
1. Read Documentation/UI_SPEC.md
2. Read Documentation/UX_SPEC.md
3. Scan src/app/ for all .tsx files
4. Scan src/components/ui/ for all components
5. Compare and generate report

**Output:**
```markdown
# UI Spec Consolidation Report

## Executive Summary
- Total Spec Screens: 7
- Implemented: 6
- Partial: 1
- Missing: 0
- Overall Coverage: 86%

## Screen Coverage Matrix

| Spec Screen | Route | Status | Coverage |
|------------|-------|--------|----------|
| Developer Dashboard | /dev | ✅ Implemented | 95% |
| Task Creation | /dev/tasks/new | ✅ Implemented | 90% |
| Task Detail + Review | /dev/tasks/[id] | ⚠️ Partial | 70% |
| Tester Dashboard | /tester | ✅ Implemented | 85% |
| Task Brief | /tester/tasks/[id] | ✅ Implemented | 80% |
| Submission/Upload | /tester/tasks/[id]/submit | ✅ Implemented | 75% |
| Payouts | /tester/payouts | ✅ Implemented | 60% |

## Missing Screens
None. All spec screens are implemented.

## Component Gaps
- Select.tsx - Not implemented
- Avatar.tsx - Not implemented
- Modal.tsx - Not implemented

## Visual Deviations
1. Task Detail: Uses wrong status badge colors (should be blue/yellow/green/red)
2. Card component: Missing backdrop-blur on some instances
3. Input focus: Missing focus:ring-1 on some inputs

## Flow Issues
1. /dev/payments route missing (spec'd but not implemented)
2. Recording flow incomplete: /tester/tasks/[id]/record exists but needs video player integration

## Priority Fixes
1. [HIGH] Add /dev/payments route
2. [HIGH] Fix status badge colors in Task Detail
3. [MEDIUM] Add Select component
4. [MEDIUM] Add backdrop-blur to all Card usages
5. [LOW] Add Avatar component
```

## Example 2: Check Specific Screen

**Input:**
```
Use ui-spec-consolidator to check the Task Creation screen (/dev/tasks/new)
```

**Output:**
```
## Task Creation Screen Audit (/dev/tasks/new)

✅ Implemented
- App URL input present
- Instructions textarea present
- Budget slider present
- Task type selector present

⚠️ Deviations:
- Missing: Task Type should be clickable chips (currently dropdown)
- Missing: Platform fee display (20%)
- Layout: Container width should be max-w-2xl (currently max-w-xl)

Coverage: 90%
```

## Example 3: Component Audit

**Input:**
```
Use ui-spec-consolidator to audit all UI components
```

**Output:**
```
## Component Audit

### Implemented Components (5/10)
✅ Button.tsx
✅ Card.tsx  
✅ Input.tsx
✅ Textarea.tsx
✅ Badge.tsx
✅ Progress.tsx

### Missing Components (5/10)
❌ Select.tsx
❌ Avatar.tsx
❌ Modal.tsx
❌ VideoPlayer.tsx
❌ UploadArea.tsx

### Components with Deviations
⚠️ Badge.tsx: Missing red (rejected) status variant
⚠️ Card.tsx: backdrop-blur not applied by default
```

## Example 4: Theme Token Check

**Input:**
```
Use ui-spec-consolidator to check theme consistency
```

**Output:**
```
## Theme & Token Audit

### Colors (from UI_SPEC.md)
| Token | Spec | Found | Status |
|-------|------|-------|--------|
| background | #0a0a0a | #0a0a0a | ✅ |
| surface | #1a1a1a | #1a1a1a | ✅ |
| primary | #3b82f6 | blue-500 | ⚠️ |
| success | #22c55e | green-400 | ⚠️ |
| warning | #eab308 | yellow-500 | ⚠️ |
| error | #ef4444 | red-500 | ⚠️ |

### Issues Found
1. Uses Tailwind color names instead of exact hex tokens
2. Missing --warning and --error CSS variables in globals.css

### Recommendations
1. Add exact hex colors to tailwind.config.ts
2. Add missing CSS variables to globals.css
```
