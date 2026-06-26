# AgencyOS — Build Phases

## Phase 1: generator.js ✅ BUILDING NOW
Extract content generation engine from old script.js into modular ES module.
- Export `generate(ctx)` and `interpolate(template, ctx)`
- Same template banks, same logic
- Used by pages/project-detail.js and pages/generator.js

## Phase 2: app.js + index.html
Entry point + app shell rewrite.
- `app.js` — import all modules, register routes, init router
- `index.html` — sidebar nav, header, `<main id="main-content">`, load app.js as module

## Phase 3: style.css
Full design system rewrite for dashboard layout.
- Sidebar layout, stat cards, client cards, project table
- Detail pages, forms, filter bar, badges, responsive
- Replace old single-page styles entirely

## Phase 4: pages/generator.js + polish
Standalone generator page + final touches.
- Standalone content generator accessible from sidebar
- Empty states, transitions, mobile sidebar toggle
- Update README.md, spec.md, CLAUDE.md

---

## Build Order
Phase 1 → Phase 2 → Phase 3 → Phase 4 (sequential, each depends on prior)
