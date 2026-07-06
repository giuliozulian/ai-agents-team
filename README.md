# ai-agents-team

A team of specialized AI agents (coordinator, security-reviewer, frontend-engineer, accessibility-auditor, performance-auditor, qa-test-engineer) for web development, distributed as a small CLI so every project can install and update them from one place instead of copy-pasting files by hand.

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
- `templates/agents/*.agent.md` — generic sub-agents (coordinator, security-reviewer, frontend-engineer, accessibility-auditor, performance-auditor, qa-test-engineer).
- `templates/skills/`, `templates/instructions/` — reserved for future generic skills/instructions (currently empty; project-specific instructions stay in each repo, see the plan doc §1 and §9).

## Self-sufficiency rule

Every template shipped in this package must be self-contained: an agent must never assume a skill or
instruction that isn't itself included under `templates/`. Since this package is published publicly,
anyone installing it on any machine must get fully-working agents with no dependency on files that only
exist in a particular user's local environment (e.g. personal `~/.claude/skills`).

## Agents included

Each agent ships as a single self-contained `.agent.md` file — no external skill dependency. The "skill"
column is the specific expertise/checklist each one applies (defined inline in the agent file itself).

| Agent | Skill it applies |
|---|---|
| `coordinator` | Breaks multi-concern tasks into steps and delegates each to the right specialist below, then integrates and verifies the combined result. |
| `security-reviewer` | OWASP Top 10-style review: injection, auth/access control, sensitive data exposure, input validation, vulnerable dependencies, insecure config, XSS/SSRF. |
| `frontend-engineer` | Implements/refactors UI matching existing project conventions (component structure, styling, state management), with accessibility-by-default. |
| `accessibility-auditor` | WCAG 2.1/2.2 AA audit: semantics, keyboard operability, screen-reader support, color contrast, form labeling, reduced-motion handling. |
| `performance-auditor` | Rendering, bundle size, network waterfalls, data-access (N+1/indexes), and asset optimization review. |
| `qa-test-engineer` | Test strategy and coverage review: contract-based test design, flaky-test diagnosis, matching existing test conventions. |

## Using it with GitHub Copilot, Claude Code, and Codex

`init` writes files to `.github/agents/*.agent.md`, which is the format **GitHub Copilot (VS Code)**
reads natively — no extra step needed there. Other hosts expect the same content in a different
location/format, since there is no shared standard across tools yet:

| Host | Where it looks for agents | What to do |
|---|---|---|
| **GitHub Copilot / VS Code** | `.github/agents/*.agent.md` | Nothing extra — this is exactly what `init` installs. |
| **Claude Code** | `.claude/agents/*.md` (project) or `~/.claude/agents/*.md` (user, all projects) | Copy the installed files there and drop the `.agent` part of the extension, e.g. `cp .github/agents/security-reviewer.agent.md .claude/agents/security-reviewer.md`. The YAML frontmatter (`name`, `description`) is compatible; Claude also supports an optional `tools:`/`model:` field you can add per agent. |
| **Codex CLI** | No dedicated per-agent file format at the time of writing — Codex reads a single `AGENTS.md` for instructions. | Reference the relevant agent file(s) from `AGENTS.md` (e.g. "When reviewing security, follow `.github/agents/security-reviewer.agent.md`"), or paste the agent's body into `AGENTS.md` directly. |

Because every agent file here is self-contained (see the self-sufficiency rule above), copying it
as-is to another host's expected location is safe — there's never a hidden skill/instruction
dependency to bring along separately.




