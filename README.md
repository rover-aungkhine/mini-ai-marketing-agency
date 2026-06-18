# Mini AI Marketing Agency Assistant

A free, browser-based marketing assistant for small businesses. Fill in a business brief and get a complete starter marketing package — instantly. No API keys, no backend, no login.

![Mini AI Marketing Agency](screenshot.png)

## What It Does

| Input                          | Output                           |
| ------------------------------ | -------------------------------- |
| Business name & type           | Brand positioning summary        |
| Product or service             | 3 content pillars                |
| Target audience                | 5 post ideas                     |
| Main offer                     | 3 ready-to-use captions          |
| Platform (Facebook/Instagram)  | 2 ad copy options                |
| Tone (Friendly/Professional/Premium/Fun) | 1 static creative headline |
| Language (English / Burmese)   |                                  |

All generation is **rule-based** — templates, arrays, and string interpolation in vanilla JavaScript. Nothing leaves your browser.

## How to Run

```bash
# Option 1: Open directly
open index.html

# Option 2: Serve locally (if you prefer a local server)
python3 -m http.server 8000
# Then visit http://localhost:8000
```

That's it. No `npm install`, no build step, no environment variables.

## Tech Stack

- **HTML** — semantic, accessible form + results layout.
- **CSS** — custom properties, card-based design, responsive (mobile + desktop), Burmese font support via Google Fonts (Noto Sans Myanmar).
- **JavaScript (vanilla)** — form validation, template interpolation, DOM rendering, clipboard API for copy buttons.

## Project Files

```
mini-ai-marketing-agency/
├── index.html              # Main app — form + results
├── style.css               # All styles
├── script.js               # Rule-based generation engine
├── spec.md                 # Full project specification
├── README.md               # This file
├── .mcp.json               # MCP configuration
├── .claude/
│   ├── skills/
│   │   └── marketing-strategy/
│   │       └── SKILL.md    # Marketing strategy skill definition
│   └── agents/
│       └── marketing-assistant.md  # Agent role definition
└── slides/
    └── pitch.md            # Pitch deck outline
```

## How the Generation Engine Works

1. User fills in 8 form fields and clicks **Generate**.
2. `script.js` validates all required fields.
3. A context object is built from the form values.
4. Templates are selected from banks keyed by `[language][tone]` for each output section.
5. Content pillars are selected based on business type keyword matching (café, boutique, clinic, salon, gym, etc.).
6. Placeholders (`{name}`, `{product}`, `{audience}`, etc.) are interpolated with real values.
7. Results render into 6 cards with individual copy buttons.

Changing tone, platform, or language selects a different template pool, so output varies meaningfully across combinations.

## Suggested Commits

If you're building this step by step, here are 3 suggested commits:

### Commit 1: Initial scaffold — HTML structure + form layout

```
git add index.html style.css
git commit -m "feat: add business brief form with 8 fields and results section scaffold

- Semantic HTML5 form with all 8 required fields
- Responsive CSS card layout with custom properties
- Results section with 6 output cards (hidden until generation)
- Copy and reset button placeholders
- Google Fonts integration (Inter + Noto Sans Myanmar)
- Toast notification element for user feedback

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Commit 2: Generation engine — rule-based JS logic + template banks

```
git add script.js
git commit -m "feat: add rule-based generation engine with bilingual template banks

- Template banks for en/my × 4 tones × 2 platforms (~200 templates)
- Content pillar mapping by business type keyword (café, clinic, salon, etc.)
- Form validation with inline error messages
- Placeholder interpolation engine
- DOM rendering for all 6 output sections
- Clipboard API copy buttons (per section + copy all)
- Smooth scroll to results on generation
- Toast notifications for user actions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Commit 3: Polish — Ch-3 deliverables, README, and final touches

```
git add README.md spec.md .mcp.json .claude/ slides/
git commit -m "docs: add README, spec, and Ch-3 deliverables

- README.md with project overview, run instructions, and commit guide
- spec.md with full project specification and success criteria
- .mcp.json configuration for claude-mem plugin
- Marketing strategy skill definition (SKILL.md)
- Marketing assistant agent definition (marketing-assistant.md)
- Pitch deck outline with 11 slides (pitch.md)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Step-by-Step Commit Instructions

```bash
# 1. Stage and commit the scaffold
git add index.html style.css
git commit -m "feat: add business brief form with 8 fields and results section scaffold

- Semantic HTML5 form with all 8 required fields
- Responsive CSS card layout with custom properties
- Results section with 6 output cards (hidden until generation)
- Copy and reset button placeholders
- Google Fonts integration (Inter + Noto Sans Myanmar)
- Toast notification element for user feedback

Co-Authored-By: Claude <noreply@anthropic.com>"

# 2. Stage and commit the generation engine
git add script.js
git commit -m "feat: add rule-based generation engine with bilingual template banks

- Template banks for en/my × 4 tones × 2 platforms (~200 templates)
- Content pillar mapping by business type keyword (café, clinic, salon, etc.)
- Form validation with inline error messages
- Placeholder interpolation engine
- DOM rendering for all 6 output sections
- Clipboard API copy buttons (per section + copy all)
- Smooth scroll to results on generation
- Toast notifications for user actions

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Stage and commit documentation and Ch-3 deliverables
git add README.md spec.md .mcp.json .claude/ slides/
git commit -m "docs: add README, spec, and Ch-3 deliverables

- README.md with project overview, run instructions, and commit guide
- spec.md with full project specification and success criteria
- .mcp.json configuration for claude-mem plugin
- Marketing strategy skill definition (SKILL.md)
- Marketing assistant agent definition (marketing-assistant.md)
- Pitch deck outline with 11 slides (pitch.md)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Verify everything is committed
git status
```

## License

This project is a personal educational project. Use it however you like.
