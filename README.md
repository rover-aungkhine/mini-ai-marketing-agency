# AgencyOS

AgencyOS is a small, browser-only agency management dashboard for solo operators and small teams. It grew out of the Mini AI Marketing Agency content generator and now combines client management, project tracking, and rule-based marketing content generation in one static app.

There is no backend, no framework, no build step, and no API key. Client and project records are stored in browser `localStorage` with the `agencyos_` prefix.

## Features

- Dashboard with client/project stats, quick actions, and recent activity.
- Client CRM: add, edit, search, filter, view details, and track purchased services.
- Project tracker: add, edit, filter, view details, track approval status, and link projects to clients.
- Project content generation: generate and persist a marketing package on a project.
- Standalone content generator: create a temporary package for copying without saving.
- English and Burmese template banks across friendly, professional, premium, and fun tones.

Generated packages include:

| Input | Output |
| --- | --- |
| Business name and type | Brand positioning summary |
| Product or service | 3 content pillars |
| Target audience | 5 post ideas |
| Main offer | 3 captions |
| Platform | 2 ad copy options |
| Tone and language | 1 creative headline |

## How to Run

ES modules need a local server, so do not open `index.html` directly with `file://`.

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

No `npm install`, build command, database, or environment variables are required.

## Routes

| Route | Purpose |
| --- | --- |
| `#/` | Redirects to dashboard |
| `#/dashboard` | Dashboard overview |
| `#/clients` | Client list |
| `#/clients/new` | New client form |
| `#/clients/:id` | Client detail |
| `#/clients/:id/edit` | Edit client form |
| `#/projects` | Project list |
| `#/projects/new` | New project form |
| `#/projects/new?client=<id>` | New project form with client preselected |
| `#/projects/:id` | Project detail and saved content generator |
| `#/projects/:id/edit` | Edit project form |
| `#/generate` | Temporary standalone content generator |

## Project Structure

```text
mini-ai-marketing-agency/
├── index.html              # AgencyOS app shell
├── app.js                  # ES module entry point and route registration
├── router.js               # Hash router with route params
├── store.js                # localStorage CRUD helpers
├── generator.js            # Pure rule-based generation engine
├── style.css               # Dashboard design system and responsive styles
├── pages/
│   ├── dashboard.js
│   ├── clients.js
│   ├── client-form.js
│   ├── client-detail.js
│   ├── projects.js
│   ├── project-form.js
│   ├── project-detail.js
│   └── generator.js
├── script.js               # Original generator kept as backup/reference
├── spec.md
├── CLAUDE.md
└── slides/
    └── pitch.md
```

## Architecture

- `index.html` provides the static shell: sidebar, top bar, `<main id="main-content">`, and toast container.
- `app.js` imports page modules, registers hash routes, initializes the router, and handles mobile sidebar behavior.
- `router.js` matches exact and parameterized routes, ignoring query strings for matching.
- `store.js` reads and writes client/project collections in browser `localStorage`.
- `generator.js` exports only `generate(ctx)` and `interpolate(template, ctx)`.
- Each page exports `render(container, params)` and owns its own DOM event listeners.

## Data Persistence

Client and project records persist only in the current browser profile. Clearing site data or using another browser will show a separate dataset. The standalone generator does not save output; generated content is persisted only when created from a project detail page.

## Verification Checklist

- Serve with `python3 -m http.server 8000`.
- Visit `#/dashboard`, `#/clients`, `#/projects`, and `#/generate`.
- Create a client, then create a project from the client detail page and confirm the client is preselected.
- Generate project content and confirm it remains on the project after navigation.
- Generate standalone content in English and Burmese and test section copy plus copy all.
- Resize to mobile width and confirm the sidebar toggles and closes after navigation.

## License

This project is a personal educational project. Use it however you like.
