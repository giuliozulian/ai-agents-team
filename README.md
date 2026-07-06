# ai-agents-team

A team of 15 specialized AI agents (coordinator, backend, frontend, design, accessibility, performance, security, testing, database, devops, geo, copy, code-review, release, pm) for web development, distributed as a small CLI so every project can install and update them from one place instead of copy-pasting files by hand.

See [agent-toolkit-package-plan.md](agent-toolkit-package-plan.md) for the original design doc.

## Usage

```bash
# build the CLI once (or after changing templates/src)
pnpm install
pnpm build

# in a consumer project
npx ai-agents-team init   # first install (interactive, or --all)
npx ai-agents-team sync   # update installed files to latest templates
npx ai-agents-team list   # show available vs installed
```

`init` copies selected agents/skills/instructions into `.github/` in the current project and writes a
`.github/ai-agents-team.lock.json` manifest (content hash + version per file). `sync` re-copies template
files whose local hash still matches the manifest (i.e. untouched since install) and **skips** files that
were customized locally, unless `--force` is passed.

## Repo layout

- `src/` — CLI source (TypeScript, ESM, built with `tsup`).
- `templates/agents/*.agent.md` — 15 generic sub-agents (coordinator, backend, frontend, design, accessibility, performance, security, testing, database, devops, geo, copy, code-review, release, pm).
- `templates/skills/frontend-design/` — bundled skill used by the `frontend` agent (Apache-2.0, from [anthropics/skills](https://github.com/anthropics/skills)).
- `templates/instructions/` — reserved for future generic instructions (currently empty; project-specific instructions stay in each repo, see the plan doc §1 and §9).

## Self-sufficiency rule

Every template shipped in this package must be self-contained: an agent must never assume a skill or
instruction that isn't itself included under `templates/`. Since this package is published publicly,
anyone installing it on any machine must get fully-working agents with no dependency on files that only
exist in a particular user's local environment (e.g. personal `~/.claude/skills`).

## Agents included

Each agent ships as a single `.agent.md` file. Most are fully self-contained (no external skill
dependency — the expertise/checklist is written inline in the agent file). Two exceptions:

- `frontend` uses the **bundled** [`frontend-design`](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) skill (Apache-2.0, copied into `templates/skills/frontend-design/`) — installed automatically by `init`, nothing extra to do.
- `accessibility` references community accessibility skills that are **not** bundled and must be installed globally (see note below the table).

| | Agent | Description | Skill it uses |
|---|---|---|---|
| 🧭 | `coordinator` | Coordinates multi-step engineering work across all the specialist agents below: plans, delegates, integrates, and verifies the result. | — (inline delegation logic only) |
| ⚙️ | `backend` | Implements and reviews server-side logic, APIs, business logic, and third-party integrations. | — (inline checklist only) |
| 🖥️ | `frontend` | Implements and refactors UI components/pages, matching existing project conventions. | Bundled: [`frontend-design`](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) (installed automatically, see `templates/skills/frontend-design/`). |
| 🎨 | `design` | Reviews and defines design tokens, layout, spacing, and visual/UX consistency. | — (inline checklist only) |
| ♿ | `accessibility` | Audits UI against WCAG for keyboard nav, screen readers, contrast, and semantics. | Community skills referenced in the plan doc: `forms`, `keyboard`, `color-contrast`, `aria-live-regions`, `ACCESSIBILITY-general` ([mgifford/accessibility-skills](https://github.com/mgifford/accessibility-skills)), `frontend-a11y` ([mikemai2awesome/agent-skills](https://github.com/mikemai2awesome/agent-skills)) — **not bundled**, install globally (see below). |
| ⚡ | `performance` | Reviews rendering, bundle size, network requests, and data-access performance. | — (inline checklist only) |
| 🔒 | `security` | Reviews code/designs for OWASP Top 10-style vulnerabilities and risky config/dependencies. | — (inline checklist only) |
| 🧪 | `testing` | Designs/writes automated tests, reviews coverage, diagnoses flaky failures. | — (inline checklist only) |
| 🗄️ | `database` | Designs and reviews schema, migrations, indexes, and constraints. | — (inline checklist only) |
| 🚀 | `devops` | Reviews/implements CI/CD pipelines, build/deploy config, and infrastructure as code. | — (inline checklist only) |
| 🌍 | `geo` | Implements and reviews geolocation, maps, and spatial queries (e.g. PostGIS). | — (inline checklist only) |
| ✍️ | `copy` | Centralizes UI strings, manages i18n/translations, keeps terminology consistent. | — (inline checklist only) |
| 🔍 | `code-review` | Reviews changes for quality/readability pre-merge and runs the lint/typecheck/build gate. | — (inline checklist only) |
| 🏷️ | `release` | Manages semantic versioning and changelog entries. | — (inline checklist only) |
| 📋 | `pm` | Maintains project documentation, changelog, and status tracking. | — (inline responsibilities only) |

**Installing the `accessibility` skills globally:** these are third-party skill packs, not part of
this package (per the self-sufficiency rule above, nothing here silently depends on them — the
`accessibility` agent's own inline WCAG checklist works without them). If you want the extra
coverage, clone/symlink them yourself into a global skills folder your host reads (e.g.
`~/.claude/skills/`, `~/.agents/skills/`, or `~/.copilot/skills/` depending on host), following each
repo's own install instructions.

## Using it with GitHub Copilot, Claude Code, and Codex

`init` writes files to `.github/agents/*.agent.md`, which is the format **GitHub Copilot (VS Code)**
reads natively — no extra step needed there. Other hosts expect the same content in a different
location/format, since there is no shared standard across tools yet:

| Host | Where it looks for agents | What to do |
|---|---|---|
| **GitHub Copilot / VS Code** | `.github/agents/*.agent.md` | Nothing extra — this is exactly what `init` installs. |
| **Claude Code** | `.claude/agents/*.md` (project) or `~/.claude/agents/*.md` (user, all projects) | Copy the installed files there and drop the `.agent` part of the extension, e.g. `cp .github/agents/security.agent.md .claude/agents/security.md`. The YAML frontmatter (`name`, `description`) is compatible; Claude also supports an optional `tools:`/`model:` field you can add per agent. |
| **Codex CLI** | No dedicated per-agent file format at the time of writing — Codex reads a single `AGENTS.md` for instructions. | Reference the relevant agent file(s) from `AGENTS.md` (e.g. "When reviewing security, follow `.github/agents/security.agent.md`"), or paste the agent's body into `AGENTS.md` directly. |

Because every agent file here is self-contained (see the self-sufficiency rule above), copying it
as-is to another host's expected location is safe — there's never a hidden skill/instruction
dependency to bring along separately.




