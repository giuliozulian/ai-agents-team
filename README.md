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

