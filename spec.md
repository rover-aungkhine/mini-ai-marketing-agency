# Mini AI Marketing Agency Assistant — Project Spec

## Overview

**Project:** Mini AI Marketing Agency Assistant  
**Type:** Ch-3 Personal Project  
**Stack:** HTML, CSS, JavaScript only (no backend, no framework)  
**Deployment:** Static public web app  

A small AI-style marketing assistant for SMEs. The user fills in a business brief form and the app generates a starter marketing package using rule-based JavaScript logic — no API keys, no backend, no login.

---

## MVP Features

### 1. Business Brief Form

| Field            | Type          | Options / Notes                        |
| ---------------- | ------------- | -------------------------------------- |
| Business name    | text input    | free text                              |
| Business type    | text input    | free text (e.g. café, boutique, clinic)|
| Product/service  | text input    | free text                              |
| Target audience  | text input    | free text                              |
| Main offer       | text input    | free text                              |
| Platform         | select/dropdown | Facebook, Instagram                  |
| Tone             | select/dropdown | Friendly, Professional, Premium, Fun  |
| Language         | select/dropdown | English, Burmese (`my`)              |

### 2. Generated Output (rule-based JS)

1. **Brand positioning summary** — one-paragraph synthesis from inputs.
2. **3 content pillars** — thematic categories derived from business type + audience + offer.
3. **5 post ideas** — platform-appropriate content ideas with titles.
4. **3 captions** — ready-to-use social captions in the selected tone + language.
5. **2 ad copy options** — short-form paid ad scripts tailored to platform.
6. **1 static creative headline idea** — a visual ad headline for a banner/creative.

### 3. Result Page / Section

- Clean, readable layout for all output blocks.
- **Copy button** per section (or a single copy-all).
- **Reset button** to clear the form and start over.

---

## Technical Constraints

- **No backend.** All logic runs client-side.
- **No login / auth.**
- **No payment / monetization.**
- **No API key.** Generation is rule-based (templates, arrays, conditionals in JS).
- **Single page** — the form and results live on one HTML page.
- **Responsive** — works on mobile and desktop.

---

## File Structure (Ch-3 Deliverables)

```
mini-ai-marketing-agency/
├── index.html                  # Main app (form + results)
├── style.css                   # All styles
├── script.js                   # Rule-based generation engine
├── README.md                   # Project overview, commit guide
├── .mcp.json                   # MCP configuration
├── .claude/
│   ├── skills/
│   │   └── marketing-strategy/
│   │       └── SKILL.md        # Skill definition for marketing strategy
│   └── agents/
│       └── marketing-assistant.md  # Agent definition
└── slides/
    └── pitch.md                # Pitch deck / presentation outline
```

---

## Generation Engine Design (script.js)

### Rule-Based Approach

The generator uses template banks keyed by combinations of inputs:

```
tone × platform × language → template pool
business type → content pillar suggestions
target audience → tone-adjusted framing
```

Each output section draws from a curated set of templates, fills in `{placeholders}`, and applies random variation so repeated runs with the same inputs produce fresh results.

### Data Structures

- **`TEMPLATES`** — nested object keyed by `[language][tone][section]` containing arrays of template strings.
- **`CONTENT_PILLARS`** — object keyed by business type categories mapping to pillar triplets.
- **`AD_COPIES`** — object keyed by `[platform][tone]` with ad script templates.

### Generation Flow

1. Read form values on submit.
2. Validate all required fields.
3. Build context object from inputs.
4. For each output section, pick 1+ templates from the matching pool, interpolate placeholders, and render.
5. Scroll to results section.

---

## UI Design Notes

- **Clean, presentable.** Neutral palette with one accent color.
- **Card-based layout** for output sections.
- **Smooth scroll** from form to results.
- **Copy button** uses `navigator.clipboard.writeText()`.
- **Burmese font** — use system font stack or include a Myanmar font via Google Fonts (e.g. Noto Sans Myanmar).

---

## README.md Requirements

- Project description and goal.
- Screenshot placeholder.
- How to run (open `index.html`).
- Technology stack note.
- At least **3 commit suggestions** with descriptions:
  1. Initial scaffold — HTML structure + form layout
  2. Generation engine — rule-based JS logic + template banks
  3. Polish — styling, copy buttons, Burmese language support
- Step-by-step commit instructions.

---

## Success Criteria

- [ ] Form accepts all 8 fields and validates required inputs.
- [ ] All 6 output sections generate without errors.
- [ ] Changing tone, platform, or language produces different output.
- [ ] Copy button works for each section.
- [ ] Reset clears form and hides results.
- [ ] App is responsive on mobile screens.
- [ ] At least one Burmese-language output path works.
- [ ] All Ch-3 deliverable files present.
