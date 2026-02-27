---
name: ui-system-enforcer
description: Ensure all UI across the app strictly follows the UserTest design system and visual language.
author: UserTest Team
version: 1.0.0
---

# UI System Enforcer

Use this skill when the user asks to unify, align, audit, or enforce UI consistency across pages or components.

## When to Use

Trigger when user mentions:
- "unify UI"
- "enforce design system"
- "align with landing page"
- "audit UI consistency"
- "fix styling inconsistencies"
- "make UI consistent"

## Design System Tokens

### Colors
| Token | Value |
|-------|-------|
| Background | `#0a0a0a` |
| Surface/Cards | `bg-white/5` to `bg-white/10` |
| Border | `border-white/10` |
| Primary Accent | Blue `#3b82f6` |
| Secondary Accent | Purple `#8b5cf6` |
| Text Primary | `text-white` |
| Text Secondary | `text-gray-400` |
| Text Muted | `text-gray-500` |

### Effects
| Token | Value |
|-------|-------|
| Glassmorphism | `backdrop-blur-xl` |
| Card BG | `bg-[#1a1a1a]/80` or `bg-black/20` |
| Hover Glow | `shadow-[0_0_15px_rgba(59,130,246,0.5)]` |
| Gradient | `bg-gradient-to-r from-blue-400 to-purple-500` |

### Spacing & Layout
| Token | Value |
|-------|-------|
| Container Max | `max-w-7xl mx-auto` |
| Section Padding | `py-24 px-6` |
| Card Padding | `p-6` to `p-8` |
| Border Radius | `rounded-xl` to `rounded-2xl` |
| Grid Gap | `gap-4` to `gap-6` |

### Typography
| Token | Value |
|-------|-------|
| Header | `text-3xl font-bold` |
| Subheader | `text-xl font-semibold` |
| Body | `text-base text-gray-300` |
| Caption | `text-sm text-gray-500` |

### Interactions
| Token | Value |
|-------|-------|
| Hover Duration | `150-250ms` |
| Transition | `transition-all duration-200` |

## Instructions

### Step 1: Analyze Current vs Target
1. Read the existing page/component
2. Compare against the landing page style (`src/app/(marketing)/page.tsx`)
3. Identify inconsistencies in:
   - Background colors
   - Card styling (glass effect)
   - Border colors
   - Spacing
   - Typography hierarchy
   - Icon usage
   - Button styles
   - Hover effects

### Step 2: Enforce Design Tokens
Replace inconsistent Tailwind classes with system tokens:

**Background:**
- ❌ `bg-gray-900`, `bg-zinc-900` 
- ✅ `bg-[#0a0a0a]`

**Cards:**
- ❌ `bg-gray-800`, `bg-slate-800`
- ✅ `bg-[#1a1a1a]/80 backdrop-blur border border-white/5`

**Borders:**
- ❌ `border-gray-700`, `border-zinc-700`
- ✅ `border-white/10`

**Text:**
- ❌ `text-gray-300` (for secondary)
- ✅ `text-gray-400`

**Buttons:**
- ❌ Generic styles
- ✅ Use `Button` component with `variant="primary"` or `variant="secondary"`

### Step 3: Preserve Layout Intent
- Never change the structure or layout
- Only adjust styling classes
- Keep all functionality intact

### Step 4: Report Changes
Provide:
- List of files modified
- Key token replacements made
- Consistency score (before/after)

## Example Transformation

**Before:**
```tsx
<div className="bg-gray-900 p-4 rounded-lg">
  <h3 className="text-lg font-semibold">Title</h3>
</div>
```

**After:**
```tsx
<Card variant="glass" className="p-6">
  <h3 className="text-xl font-semibold">Title</h3>
</Card>
```

## Supporting Files

- Landing page reference: `src/app/(marketing)/page.tsx`
- UI Components: `src/components/ui/`
- Design spec: `Documentation/UI_SPEC.md`
