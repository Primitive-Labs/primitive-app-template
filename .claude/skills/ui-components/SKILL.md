---
name: ui-components
description: >
  UI component and styling guidelines for this project. Use whenever building or modifying UI —
  covers shadcn-vue component usage, TailwindCSS patterns, responsive design requirements,
  and component composition rules. Also covers v-model binding patterns for Reka UI-based components.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

# UI Component & Styling Guidelines

These are the UI and styling standards for this project. Apply them whenever building or
modifying user-facing components.

## Responsive Design

- Unless specifically directed otherwise, ALWAYS build UI that's responsive to desktop, tablet, and mobile phone sized screens.
- If you write UI components that utilize desktop UX patterns (like Dialogs) ALWAYS provide a phone pattern (like a Sheet) that is used on smaller screens.

## shadcn-vue & Component Library

- ALWAYS use shadcn-vue components without modification if possible.
- ALWAYS install needed shadcn-vue components if they are not available in the current project, ONLY using the command line installation tool: `pnpm dlx shadcn-vue@latest add [COMPONENT NAME]`
- NEVER build components from scratch. If a default shadcn-vue component does not meet the project needs, create new components by composing shadcn-vue components.
- NEVER modify code in `/src/components/ui/`. These are library-installed components.

## CSS & Styling

- ALWAYS use TailwindCSS classes rather than manual CSS.
- NEVER hard code colors, use Tailwind's color system.

## Component Binding Patterns

- ALWAYS use `v-model` for two-way binding with shadcn-vue Switch and Checkbox components. These components use Reka UI internally which expects `modelValue`/`update:modelValue`, NOT `checked`/`update:checked`. Using `:checked` + `@update:checked` will not work.
