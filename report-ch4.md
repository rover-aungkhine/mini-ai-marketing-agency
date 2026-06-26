# ch-4 Personal Project — Report

github_username: rover-aungkhine
personal_repo_url: https://github.com/rover-aungkhine/mini-ai-marketing-agency
project_summary: AgencyOS is a browser-only agency management dashboard that combines client CRM, project tracking, content calendar, creative management, and AI-powered marketing content generation — all running client-side with no backend, no framework, and no API key.
slides_url: slides/pitch.md
live_url: <!-- Add your deployed URL here, e.g. https://your-app.netlify.app -->
license: MIT

## What I Built

AgencyOS evolved from a simple marketing content generator into a full agency workspace. The app now includes:

- **Dashboard** — real-time stats, quick actions, recent activity feed
- **Client CRM** — add/edit/search clients, track status (lead/active/archived)
- **Client Workspace** — 9 integrated tabs: Overview, Brief & Contract, Strategy, Content Calendar, Creatives, Ads & Reports, Meetings, Brand Assets, Shared Docs
- **Content Calendar** — week/month views, post scheduling with platform badges, status tracking (draft → approved → published)
- **Project Tracker** — link projects to clients, generate marketing packages per project
- **AI Content Generator** — rule-based marketing package generation (positioning, pillars, posts, captions, ads, creative headlines) in English and Burmese
- **Demo Data Seeding** — auto-populates sample clients, projects, and full workspace data on first load

## How I Built It

I started with the ch-3 marketing generator (HTML form + rule-based template engine in `script.js`). For ch-4, I rebuilt the architecture as a modular SPA:

1. **Architecture redesign** — replaced single-file `script.js` with ES modules: `app.js` (entry), `router.js` (hash router), `store.js` (localStorage CRUD), `generator.js` (content engine), and `pages/` directory
2. **Client workspace** — built a tabbed workspace shell with slide-out panels for editing calendar posts, meetings, creatives, campaigns, and assets
3. **Data layer** — generic `Store` object with CRUD, search, filter, plus workspace-specific helpers (`addCalendarItem`, `updateMeeting`, etc.)
4. **UI/UX polish** — purple/orange design system (Fira Sans typography), responsive calendar grid, today-highlight, status badges, progress chips, action queue
5. **Demo data** — seed function that populates 3 clients with full workspace data (calendar posts, creatives, campaigns, meetings, brand assets, shared docs) so the app looks real on first load

Each feature was built and committed incrementally on the `first-version` branch.

## Evidence — Claude Code Usage

### MCP
- path: .mcp.json
- what: `claude-mem` plugin for memory/knowledge search across development observations, tracking architectural decisions as the app evolved from generator to full dashboard.

### Skill
- path: .claude/skills/ui-ux-pro-max/
- what: UI/UX Pro Max design intelligence skill — used to generate the design system (color palette, typography, component patterns) for the dashboard. Recommended flat design with purple primary (#7C3AED) + orange CTA (#F97316), Fira Sans font, and accessibility guidelines.

### Agent
- path: .claude/agents/marketing-assistant.md
- what: Marketing assistant agent — generates bilingual marketing packages from business brief inputs. Integrated into the workspace's Brief & Strategy tabs for AI-assisted content expansion.

## Screenshots

1. ![Dashboard](screenshots/dashboard.png) — Overview with stats, action queue, recent activity
2. ![Clients](screenshots/clients.png) — Client list with status badges and search
3. ![Client Workspace - Calendar](screenshots/calendar.png) — Week view with scheduled posts
4. ![Client Workspace - Creatives](screenshots/creatives.png) — Creative asset tracking
5. ![Content Generator](screenshots/generator.png) — AI marketing package generation

## What I Learned

- Building a full SPA without frameworks teaches you real DOM fundamentals — routing, state management, and component lifecycle
- localStorage is powerful for prototyping but requires careful schema design (the `agencyos_` prefix pattern saved me from data collisions)
- Demo data is essential — an empty app looks broken; a seeded app looks alive
- Claude Code with skills (UI/UX Pro Max) accelerates design decisions significantly — the purple/orange palette came from a structured recommendation, not guesswork

## What's Next

- Deploy to GitHub Pages or Netlify for a live URL
- Add data export/import (JSON backup)
- Add drag-and-drop calendar reordering
- Integrate real AI API (optional) for content generation alongside the rule-based engine
