# AgencyOS — Build Status

## What This Is
Evolving Mini AI Marketing Agency from a single-page content generator into a multi-module agency management dashboard.

---

## ✅ BUILT (files ready, logic complete)

| File | Lines | Purpose |
|------|-------|---------|
| `store.js` | 139 | localStorage CRUD — getAll, getById, create, update, delete, search, filter, count |
| `router.js` | 74 | Hash router — register routes, navigate, pattern match `:id` params |
| `pages/dashboard.js` | 118 | Dashboard — stat cards, quick actions, recent activity feed |
| `pages/clients.js` | 129 | Client list — card grid, search, status filter pills |
| `pages/client-form.js` | 167 | Add/edit client form — validation, services checkboxes |
| `pages/client-detail.js` | 124 | Client detail — info card, linked projects table, delete |
| `pages/projects.js` | 129 | Project list — table view, search, client dropdown, status filter |
| `pages/project-form.js` | 199 | Add/edit project form — client dropdown, all fields |
| `pages/project-detail.js` | 198 | Project detail — info card, inline content generator, copy buttons |

**Total built: ~1,277 lines across 9 files.**

---

## ❌ NOT BUILT YET

### Must-build to make it work:

| # | File | What It Does | Notes |
|---|------|-------------|-------|
| 1 | `generator.js` | Content generation engine | Extract from old `script.js`. Export `generate(ctx)` and `interpolate()`. Same template banks, same logic, just modularized. |
| 2 | `app.js` | Entry point | Import all pages + router + store. Register all routes. Init router. |
| 3 | `index.html` | App shell (REWRITE) | Sidebar nav, header, `<main id="main-content">`, import `app.js` as module. Replace old single-page form entirely. |
| 4 | `style.css` | Full design system (REWRITE) | Dashboard layout, sidebar, stat cards, client cards, project table, detail pages, forms, filter bar, responsive. Replace old styles. |

### Should-build for polish:

| # | File | What It Does |
|---|------|-------------|
| 5 | `pages/generator.js` | Standalone content generator page (original form experience, accessible from sidebar) |
| 6 | `README.md` | Updated project docs |
| 7 | `spec.md` | Updated spec for AgencyOS |
| 8 | `CLAUDE.md` | Updated project instructions |

---

## 🗺️ ROUTE MAP

```
#/              → redirect to #/dashboard
#/dashboard     → pages/dashboard.js
#/clients       → pages/clients.js
#/clients/new   → pages/client-form.js
#/clients/:id   → pages/client-detail.js
#/clients/:id/edit → pages/client-form.js (with params.id)
#/projects      → pages/projects.js
#/projects/new  → pages/project-form.js (?client=id preselects)
#/projects/:id  → pages/project-detail.js
#/projects/:id/edit → pages/project-form.js (with params.id)
#/generate      → pages/generator.js (standalone)
```

---

## 📐 ARCHITECTURE

```
index.html (app shell)
├── <aside> sidebar nav (fixed)
├── <header> top bar
└── <main id="main-content"> (pages render here)

app.js (entry point, type="module")
├── imports router.js
├── imports store.js
├── imports all pages/*
├── registers routes
└── calls router.init()

store.js
├── localStorage CRUD
├── collections: "clients", "projects"
└── helpers: getProjectsByClient(), getClientName(), getRecentActivity()

router.js
├── hash-based (#/path)
├── pattern matching (#/clients/:id)
└── renders page into #main-content
```

---

## 📦 DATA MODELS

### Client
```js
{ id, name, businessType, contactPerson, phone, email,
  services: [], monthlyFee, startDate, status, notes,
  createdAt, updatedAt }
```

### Project
```js
{ id, name, clientId, serviceType, scope, startDate, deadline,
  status, priority, internalNotes, clientNotes, approvalStatus,
  generatedContent: null, createdAt, updatedAt }
```

---

## 🔧 HOW TO CONTINUE

1. **Create `generator.js`** — copy template banks + `generate()` + `interpolate()` from old `script.js`, add `export`.
2. **Create `app.js`** — import everything, register routes, init.
3. **Rewrite `index.html`** — sidebar + header + `<main id="main-content">` + `<script type="module" src="app.js">`.
4. **Rewrite `style.css`** — dashboard layout, all new component styles.
5. **Create `pages/generator.js`** — standalone form page using generator engine.
6. **Test** — open index.html, verify all routes work, CRUD works, generator works.
7. **Update docs** — README.md, spec.md, CLAUDE.md.

---

## 💡 KEY DECISIONS

- **No backend** — all data in localStorage (persists per browser).
- **No framework** — vanilla JS with ES modules.
- **Hash routing** — `#/path` pattern, no server config needed.
- **Old script.js** — stays as backup. New `generator.js` extracts its logic.
- **Responsive** — sidebar collapses on mobile, cards stack.
