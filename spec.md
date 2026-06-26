# AgencyOS Project Spec

## Overview

**Project:** AgencyOS
**Origin:** Mini AI Marketing Agency Assistant
**Stack:** Static HTML, CSS, and vanilla JavaScript ES modules
**Storage:** Browser `localStorage` only
**Deployment:** Any static file server

AgencyOS is a lightweight agency operations dashboard. It helps users manage clients, track projects, and generate marketing content packages without a backend, framework, login, or API key.

## Core Product Areas

### Dashboard

- Shows total clients, active clients, total projects, and in-progress projects.
- Provides quick actions for client creation, project creation, content generation, and client browsing.
- Shows recent client/project activity from local records.

### Client Management

Client records support:

- Brand/client name and business type.
- Contact person, phone, email, monthly fee, start date, status, notes.
- Purchased services.
- Linked project list on the client detail page.
- Search and status filtering on the client list.

### Project Management

Project records support:

- Project name and linked client.
- Service type, scope, start date, deadline, status, priority, approval status.
- Internal and client-facing notes.
- Optional generated content package saved on the project.
- Search, client filtering, and status filtering on the project list.

### Content Generation

`generator.js` is the pure generation engine. It exports:

```js
export { generate, interpolate };
```

`generate(ctx)` accepts:

```js
{
  name: string,
  type: string,
  product: string,
  audience: string,
  offer: string,
  platform: 'facebook' | 'instagram',
  platformLabel: 'Facebook' | 'Instagram',
  tone: 'friendly' | 'professional' | 'premium' | 'fun',
  language: 'en' | 'my'
}
```

It returns:

```js
{
  positioning: string,
  pillars: string[3],
  posts: string[5],
  captions: string[3],
  ads: string[2],
  creative: string
}
```

There are two generator surfaces:

- Project detail generator: saves output to the project record as `generatedContent`.
- Standalone generator at `#/generate`: temporary output for copying only; it does not save to localStorage.

## Routes

| Route | Purpose |
| --- | --- |
| `#/` | Redirects to `#/dashboard` |
| `#/dashboard` | Dashboard |
| `#/clients` | Client list |
| `#/clients/new` | Add client |
| `#/clients/:id` | Client detail |
| `#/clients/:id/edit` | Edit client |
| `#/projects` | Project list |
| `#/projects/new` | Add project |
| `#/projects/new?client=<id>` | Add project with client preselected |
| `#/projects/:id` | Project detail |
| `#/projects/:id/edit` | Edit project |
| `#/generate` | Standalone generator |

## Technical Constraints

- No backend, auth, payment, API keys, framework, package manager, or build step.
- ES modules require a local static server during development.
- All persistent app data stays in `localStorage` under `agencyos_` keys.
- `script.js` remains as a backup/reference for the original generator and is not loaded by the app shell.
- Burmese output must remain supported through the `my` template bank and Noto Sans Myanmar.

## Success Criteria

- [ ] All registered routes render without console errors.
- [ ] Query-string hashes such as `#/projects/new?client=<id>` match the correct route.
- [ ] Clients can be created, edited, viewed, searched, filtered, and deleted.
- [ ] Projects can be created, edited, viewed, searched, filtered, and deleted.
- [ ] Project creation from a client detail page preselects that client.
- [ ] Project detail generation persists content to the project record.
- [ ] Standalone generation renders all six output sections without saving.
- [ ] Per-section copy and copy-all work where supported by the browser clipboard API.
- [ ] Mobile sidebar toggles and closes after navigation.
- [ ] Desktop and mobile layouts remain readable without overlapping text.
