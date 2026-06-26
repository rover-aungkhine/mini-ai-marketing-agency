# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

AgencyOS is a static, browser-only agency management dashboard built with vanilla JavaScript ES modules. It manages clients and projects in `localStorage` and generates rule-based marketing content packages without a backend, framework, build step, login, or API key.

The project evolved from the original Mini AI Marketing Agency single-page generator. The old `script.js` remains as backup/reference, but the active app uses `index.html`, `app.js`, page modules, `store.js`, `router.js`, and `generator.js`.

## How to Run

ES modules require a local server.

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Do not rely on `file://` for normal development.

There are no package install, lint, test, or build commands.

## Architecture

- `index.html` is the app shell with sidebar navigation, top bar, `<main id="main-content">`, and toast container.
- `app.js` imports page modules, registers routes, initializes the router, exposes `window.showToast`, and handles mobile sidebar toggling.
- `router.js` is a hash router with exact and `:id` route matching. It strips query strings for route matching.
- `store.js` is the localStorage data layer. Keys are prefixed with `agencyos_`.
- `generator.js` is the pure content generation module and exports only `generate(ctx)` and `interpolate(template, ctx)`.
- Files in `pages/` each export a default `render(container, params)` function and attach their own DOM listeners.
- `style.css` contains the dashboard design system, page layouts, forms, tables, cards, badges, generated content sections, toast, and responsive rules.

## Routes

- `#/` redirects to `#/dashboard`
- `#/dashboard`
- `#/clients`
- `#/clients/new`
- `#/clients/:id`
- `#/clients/:id/edit`
- `#/projects`
- `#/projects/new`
- `#/projects/new?client=<id>`
- `#/projects/:id`
- `#/projects/:id/edit`
- `#/generate`

## Generator Behavior

The generator context shape is:

```js
{
  name,
  type,
  product,
  audience,
  offer,
  platform,
  platformLabel,
  tone,
  language
}
```

The return shape is:

```js
{
  positioning,
  pillars,
  posts,
  captions,
  ads,
  creative
}
```

Project detail generation saves the returned object to `project.generatedContent`. The standalone `#/generate` page is temporary-only and must not create new localStorage records.

## Constraints

- Keep the app static and dependency-free.
- Preserve existing localStorage data compatibility.
- Do not remove `script.js` unless explicitly asked.
- Keep Burmese (`my`) generation and Noto Sans Myanmar support working.
- Prefer small, page-local changes over new global abstractions unless a pattern is already repeated.
