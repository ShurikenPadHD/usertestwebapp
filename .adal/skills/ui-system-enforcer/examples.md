# UI System Enforcer Examples

## Example 1: Audit a Component

**Input:**
```
Use ui-system-enforcer to audit src/components/ui/Button.tsx
```

**Actions:**
1. Read Button.tsx and UI_SPEC.md
2. Check against design patterns:
   - Background: #0a0a0a
   - Border radius: 8px (buttons)
   - Colors: primary blue #3b82f6
3. Report any inconsistencies
4. Apply fixes if needed

**Output:**
```
## Audit Report: Button.tsx

✅ Correct: border-radius: rounded-lg (8px)
✅ Correct: Primary color using blue-500
⚠️ Issue: Missing focus:ring-1 focus:ring-blue-500
⚠️ Issue: Background should be bg-[#0a0a0a] not bg-gray-900

## Fix Applied:
- Added focus:ring-1 focus:ring-blue-500
- Changed bg-gray-900 to bg-[#0a0a0a]
```

## Example 2: Fix Card Component

**Input:**
```
Use ui-system-enforcer to fix src/components/ui/Card.tsx to match glassmorphism spec
```

**Actions:**
1. Read Card.tsx current implementation
2. Compare with UI_SPEC.md glass card pattern
3. Apply missing properties:
   - backdrop-blur
   - bg-[#1a1a1a]/80
   - border-white/5

**Output:**
```
## Before:
<div className="bg-gray-800 rounded-xl p-6">

## After:
<div className="bg-[#1a1a1a]/80 backdrop-blur border border-white/5 rounded-2xl p-6">

✅ Added backdrop-blur
✅ Changed bg-gray-800 to bg-[#1a1a1a]/80
✅ Added border-white/5
✅ Changed rounded-xl to rounded-2xl
```

## Example 3: Validate Page Layout

**Input:**
```
Use ui-system-enforcer to validate src/app/dev/page.tsx follows dark theme spec
```

**Actions:**
1. Read the page file
2. Check all elements against UI_SPEC.md
3. Report issues with colors, spacing, components

**Output:**
```
## Validation Report: dev/page.tsx

✅ Background: #0a0a0a applied
✅ StatCards use glass effect
✅ Status badges use correct colors
⚠️ 3 instances of hardcoded #333 found - should use #1a1a1a
⚠️ Missing backdrop-blur on 2 Card components

## Issues to Fix:
1. Line 45: bg-[#333] → bg-[#1a1a1a]
2. Line 67: bg-[#333] → bg-[#1a1a1a]
3. Line 89: missing backdrop-blur
```

## Example 4: Add Missing Design Tokens

**Input:**
```
Use ui-system-enforcer to check tailwind.config.ts for missing design tokens
```

**Actions:**
1. Read tailwind.config.ts
2. Compare with UI_SPEC.md required tokens
3. Add any missing tokens

**Output:**
```
## Tailwind Config Audit

✅ Has: colors.background (#0a0a0a)
✅ Has: colors.surface (#1a1a1a)
✅ Has: colors.primary (#3b82f6)
⚠️ Missing: colors.warning (#eab308)
⚠️ Missing: colors.error (#ef4444)

## Added to tailwind.config.ts:
colors: {
  ...existing,
  warning: '#eab308',
  error: '#ef4444',
}
```
