---
marp: true
paginate: true
transition: fade
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
- SME owners in Myanmar — café, boutique, clinic, salon operators
- No marketing budget, no agency, no time to learn complex tools
- Burmese-first — they think and sell in မြန်မာ, not English
- Need ready-to-post content, not another platform to figure out

---

<!-- slide 2 -->
# Their problem
- 150M+ SMEs worldwide can't afford marketing agencies
- Existing tools require API keys, logins, or subscriptions — instant friction
- Burmese marketing tools: **zero.** Completely empty market.
- They don't need to learn marketing — they need output they can copy-paste right now

---

<!-- slide 3 -->
# What I built
**Mini AI Marketing Agency** — free, static web app, no backend, no login.
- 8-field business brief form → 6 polished marketing assets
- Brand positioning, 3 content pillars, 5 post ideas, 3 captions, 2 ad copies, 1 creative headline
- Bilingual: English + Burmese (full template parity across all 4 tones)
- ~200 rule-based templates, copy buttons per section, clean responsive UI

---

<!-- slide 4 -->
# How I built it
- **MCP:** `.mcp.json` — `claude-mem` plugin for memory & knowledge search during development
- **Skill:** `.claude/skills/marketing-strategy/SKILL.md` — guides Claude to explain, refine, and cross-check generated marketing output across 4 tones × 2 platforms
- **Agent:** `.claude/agents/marketing-assistant.md` — role definition: bilingual SME strategist that works from the template banks in `script.js`
- Stack: HTML5 + CSS3 + vanilla JS. `TEMPLATES[language][tone]` object, `pick()` randomness, `interpolate()` placeholder engine, keyword-matched `PILLAR_MAP`

---

<!-- slide 5 -->
# Why it matters
- **Burmese-first:** zero competition in a fast-growing digital economy — first-mover advantage
- **Free forever:** rule-based engine has no API costs, no rate limits, no deprecation risk
- **Infinite shelf life:** template bank architecture — each new language is just another object key
- **Works offline:** open `index.html` from `file://` — no server, no install, no barrier

---

<!-- slide 6 -->
# Done checklist
- [ ] repo public — `github.com/rover-aungkhine/mini-ai-marketing-agency`
- [ ] MCP + skill + agent used — `.mcp.json`, `SKILL.md`, `marketing-assistant.md`
- [ ] report.md in team repo — README with commit guide + spec with success criteria
- [ ] 8-field form + 6 output sections + bilingual generation + responsive + copy buttons
- [ ] No backend, no login, no API keys — runs entirely in the browser
