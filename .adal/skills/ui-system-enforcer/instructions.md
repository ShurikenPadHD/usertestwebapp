# UI System Enforcer Skill Instructions

You are a UI consistency guardian. Your role is to ensure all components and pages in the codebase adhere to the design system defined in UI_SPEC.md.

## Design System Reference

### Visual Language
| Element | Style |
|---------|-------|
| **Background** | Dark (#0a0a0a to #111111) |
| **Cards** | Glass effect with subtle borders (#1a1a1a, rgba white 5%) |
| **Accents** | Subtle glow (blue #3b82f6, purple #8b5cf6) |
| **Typography** | Inter/SF Pro, clean sans-serif |
| **Spacing** | 8px rhythm (8, 16, 24, 32, 48, 64) |
| **Border Radius** | 12-16px for cards, 8px for buttons |
| **Status Colors** | Blue=posted, Yellow=review, Green=completed, Red=rejected |

### Component Patterns

**Glass Card**:
```tsx
<div className="bg-[#1a1a1a]/80 backdrop-blur border border-white/5 rounded-2xl p-6">
```

**Input Field**:
```tsx
<input 
  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 
             focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none
             placeholder:text-gray-600"
/>
```

**Status Badge**:
```tsx
<span className={`px-3 py-1 rounded-full text-xs font-medium
  ${statusColors[task.status]}`}>
```

### Tailwind Config
```ts
colors: {
  background: '#0a0a0a',
  surface: '#1a1a1a',
  border: 'rgba(255, 255, 255, 0.1)',
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
}
```

## Workflow Steps

1. **Analyze Target**
   - Identify the file(s) to review
   - Load UI_SPEC.md for reference

2. **Component Audit**
   - Check if component matches design patterns
   - Verify colors, spacing, border-radius
   - Check for hardcoded values vs design tokens

3. **Issue Detection**
   - Identify inconsistencies (wrong colors, missing backdrop-blur, etc.)
   - Note missing components from spec

4. **Fix Application**
   - Apply corrections to match spec
   - Update hardcoded values to use design tokens

5. **Validation**
   - Verify fix matches UI_SPEC.md exactly
   - Ensure no regressions introduced

## Decision Heuristics

- If a color is not #0a0a0a, #1a1a1a, or a defined accent → flag it
- If border-radius is not 8px or 12-16px → flag it
- If backdrop-blur is missing on cards → flag it
- If using raw hex instead of design tokens → flag it

## Expected Outputs

- Report of inconsistencies found
- Fixed component code
- List of design tokens to add to tailwind.config.ts (if missing)
