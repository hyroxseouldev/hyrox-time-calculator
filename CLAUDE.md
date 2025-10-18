# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **HYROX Time Calculator** - a workout record calculator for tracking and analyzing HYROX (functional fitness) training sessions. The app calculates running totals, station times, roxzone times, and overall workout completion times.

**Tech Stack:**
- Next.js 15.5.6 with App Router
- React 19.1.0 with TypeScript
- Tailwind CSS v4 (latest)
- shadcn/ui component library (New York style)
- pnpm package manager

## Development Commands

### Running the Application
```bash
# Start development server (uses Turbopack)
pnpm dev

# Build for production (uses Turbopack)
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Testing
Currently no test framework is configured. When adding tests, update this section.

## Project Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Geist fonts
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles + Tailwind base
├── components/
│   └── ui/                # shadcn/ui components (53 components)
├── hooks/
│   └── use-mobile.ts      # Mobile breakpoint detection (<768px)
└── lib/
    └── utils.ts           # cn() utility for class merging
```

### Path Aliases
TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` → `./src/*`

shadcn/ui specific aliases in `components.json`:
- `@/components` → components directory
- `@/lib/utils` → utility functions
- `@/ui` → UI components
- `@/hooks` → custom hooks

### UI Component System

**shadcn/ui Configuration:**
- Style: `new-york` (more modern, cleaner aesthetic)
- Base color: `neutral`
- Icon library: `lucide-react`
- CSS variables enabled for theming
- All 53 components already installed

**Key Components Available:**
Forms: input, textarea, select, checkbox, radio-group, switch, slider, calendar, date-picker
Layout: card, separator, tabs, accordion, collapsible, resizable, scroll-area
Feedback: alert, alert-dialog, dialog, sheet, drawer, toast (sonner), progress
Navigation: navigation-menu, menubar, breadcrumb, pagination
Data: table, chart (recharts), carousel
Others: avatar, badge, button, tooltip, popover, hover-card, context-menu, dropdown-menu

### Styling System

**Tailwind CSS v4:**
- Configuration: uses `@tailwindcss/postcss` plugin
- Global styles: `src/app/globals.css`
- CSS variables for theme colors defined in `:root` and `.dark`
- Uses `cn()` utility from `@/lib/utils` for conditional class merging

**Dark Mode:**
- `next-themes` installed for theme management
- CSS variables approach for colors
- Not yet implemented in layout (needs ThemeProvider)

**Fonts:**
- Geist Sans (primary)
- Geist Mono (monospace)
- Loaded via `next/font/google`

### Responsive Design
- Mobile breakpoint: 768px (defined in `use-mobile.ts`)
- Use `useIsMobile()` hook for programmatic mobile detection
- Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

## Product Requirements (from plan/phase1.md)

**Core Features to Implement:**

1. **Workout Entry System**
   - Running times (multiple rounds supported)
   - Station exercises: Ski Erg, Sled Push, Sled Pull, Burpee Broad Jump, Rowing, Farmer's Carry, Sandbag Lunges, Wall Balls
   - Roxzone time (manual entry)
   - Input format: MM:SS

2. **Auto Calculation**
   - Running total: sum of all running times
   - Station total: sum of all station exercise times
   - Roxzone time: user-entered transition time
   - Overall total: running + stations + roxzone

3. **Phase 2 Features (Future)**
   - Photo OCR for automatic record entry
   - Data persistence (localStorage initially)
   - History tracking
   - Export to CSV/PDF

**Target Users:**
- CrossFit/functional fitness athletes
- HYROX competitors tracking WOD times
- Athletes analyzing workout performance

## Form Architecture Guidelines

When implementing workout forms:
- Use `react-hook-form` with `@hookform/resolvers`
- Validate with `zod` (v4.x)
- Use shadcn/ui Form components (if not installed, run: `npx shadcn@latest add form`)
- Time inputs should accept MM:SS format
- Support adding/removing running rounds dynamically

## Component Development Guidelines

### Adding New shadcn/ui Components
```bash
npx shadcn@latest add [component-name]
```

### Creating Custom Components
- Place in `src/components/` (not in `ui/` - reserved for shadcn)
- Use TypeScript with proper prop types
- Leverage existing UI components from `@/ui`
- Use `cn()` for className merging

### State Management
Currently no global state library. For complex state:
- React Context for theme/user preferences
- Local component state with `useState`/`useReducer`
- Consider Zustand or Jotai if global state needed

## Data Architecture

### Time Calculation Logic
All workout times should be:
- Stored internally as seconds (number)
- Displayed as MM:SS format
- Validated to prevent negative/invalid times
- Summed accurately across categories

### Storage Strategy (Phase 1)
- Use localStorage for MVP
- Structure: save complete workout sessions with metadata (date, notes)
- Clear migration path to backend in Phase 2

## Build & Deployment

**Turbopack:**
- Development and production builds use `--turbopack` flag
- Significantly faster than webpack
- No special configuration needed

**Production Checklist:**
1. Update metadata in `src/app/layout.tsx` (title, description)
2. Add proper favicon/app icons in `public/`
3. Test mobile responsiveness
4. Validate all calculations
5. Run `pnpm build` and check for errors
6. Deploy to Vercel (recommended) or other Next.js host

## Known Configuration Details

- **TypeScript:** Strict mode enabled
- **ESLint:** Next.js config with v9 ESLint
- **PostCSS:** Uses Tailwind v4 plugin
- **React:** Version 19 (latest)
- **Module Resolution:** `bundler` mode
- **CSS Variables:** Used extensively for theming
