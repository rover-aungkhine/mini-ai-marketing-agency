# Marketing Strategy Skill

## Description

Generate a complete starter marketing package for SMEs from a business brief. This skill guides Claude through the rule-based generation engine to produce brand positioning, content pillars, post ideas, captions, ad copy, and creative headlines.

## When to Use

- User asks to generate marketing content for a small business.
- User fills out or references the business brief form in the Mini AI Marketing Agency app.
- User needs content ideas, ad copy, or captions for Facebook or Instagram.
- User wants to refine or regenerate specific sections of a marketing package.

## How It Works

The app at `index.html` + `script.js` already provides the full rule-based generation UI. This skill augments Claude's ability to:

1. **Explain** the generated output — why certain pillars, tones, or post formats were chosen.
2. **Refine** individual sections — if the user says "make the captions more casual," Claude edits the output manually.
3. **Suggest improvements** — cross-check generated content against best practices for the selected platform and audience.
4. **Translate nuance** — help users understand why certain tone/platform combinations produce different output.

## Input Shape

When invoked, expect the user to provide or reference:

| Field          | Description                            |
| -------------- | -------------------------------------- |
| Business name  | Name of the SME                        |
| Business type  | Category (café, clinic, boutique, …)   |
| Product/service| What they sell                         |
| Target audience| Who they sell to                       |
| Main offer     | Current promotion or value prop        |
| Platform       | Facebook or Instagram                  |
| Tone           | Friendly / Professional / Premium / Fun|
| Language       | English or Burmese                     |

## Output Sections

1. **Brand Positioning Summary** — 1-paragraph synthesis.
2. **3 Content Pillars** — thematic content categories.
3. **5 Post Ideas** — platform-specific content titles.
4. **3 Captions** — ready-to-publish social captions.
5. **2 Ad Copy Options** — short-form paid ad scripts.
6. **1 Static Creative Headline** — banner/visual ad headline.

## Platform & Tone Awareness

- **Facebook** favours longer-form storytelling, community engagement, and link-friendly posts.
- **Instagram** favours visual-first content, short captions with strong hooks, emoji, and hashtags.
- **Tones** should be consistently applied:
  - Friendly: warm, conversational, first-person plural.
  - Professional: measured, credible, third-person or formal first-person.
  - Premium: curated, aspirational, emotionally elevated.
  - Fun: energetic, playful, bold, meme-literate.

## Instruction

When this skill is loaded, read the business brief from the user or from the current form state in `index.html`. Then:

1. Validate all required fields are present.
2. Use the template banks in `script.js` as the reference content base.
3. Generate or refine the 6 output sections.
4. Present the output in a clean, card-style format matching the app's UI.
5. Offer to refine any section the user points to.

Do NOT call external APIs. All generation is rule-based from the template banks in `script.js`.
