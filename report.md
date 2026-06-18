<!-- ch-3 personal-project report. Copy this file to ch-3/<your-github-username>/report.md -->
<!-- Before you pass: your project repo needs at least 3 GitHub stars (ask teammates
     to open your repo and click ⭐). This proves it is a real, shared project. -->
# ch-3 Personal Project — Report

github_username: rover-aungkhine
personal_repo_url: https://github.com/rover-aungkhine/mini-ai-marketing-agency
project_summary: A free browser-based marketing assistant that generates a complete starter marketing package (brand positioning, content pillars, post ideas, captions, ad copy, creative headlines) from an 8-field business brief — bilingual in English and Burmese, rule-based, no backend, no login.
slides_url: slides/pitch.md

## Methodology
<!-- How you worked: project-based approach + your git workflow (commit as you build). 2-4 sentences. -->

I built this project incrementally, starting with the HTML form scaffold and CSS layout, then the JavaScript generation engine, then the Ch-3 deliverables and documentation. Each piece was committed as it was completed: the form and styles first, the rule-based template engine second, and the docs (README, spec, skill, agent, pitch) third. I used a `first-version` branch locally and pushed to `main` on the remote, keeping a clean linear history. The full spec was written first so every implementation decision had a clear reference point.

## Evidence — Claude Code usage
<!-- List the ACTUAL paths in your personal repo. The validator checks these exist. -->

### MCP
- path: .mcp.json
- what: `claude-mem` plugin — used for memory and knowledge search across observations during development, building knowledge corpora, and querying project context. Helped track decisions as the template bank architecture evolved from spec to implementation.

### Skill
- path: .claude/skills/marketing-strategy/SKILL.md
- what: Marketing strategy skill — guides Claude to generate, explain, refine, and cross-check marketing output when a user fills in a business brief or asks for marketing content. Covers platform awareness (Facebook vs Instagram), 4 distinct tones (Friendly, Professional, Premium, Fun), and bilingual output (English + Burmese). Works from the rule-based template banks in `script.js` — no external API calls.

### Agent
- path: .claude/agents/marketing-assistant.md
- what: Marketing assistant agent — a bilingual SME marketing strategist that takes 8 business brief inputs and produces a complete 6-section marketing package. Platform-aware (different approaches for Facebook vs Instagram), tone-adaptive across 4 styles, and bilingual in English and Burmese. Constrained to work entirely from the local template banks with no backend, no login, and no API keys.
