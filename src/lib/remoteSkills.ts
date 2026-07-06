/**
 * Registry of skills that are fetched live from their upstream source at
 * `init`/`sync` time, instead of being vendored as static files in this
 * package. This guarantees the installed skill is always the latest
 * upstream version, at the cost of requiring network access during
 * `init`/`sync` and trusting the content served by the source URL at
 * that moment. Some large files ship a pinned local fallback (see
 * `fallbackSource`) used only if the live fetch keeps failing.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface RemoteSkillFile {
  /** URL the file's content is fetched from at install/sync time. */
  url: string;
  /** File name to write under `.github/skills/<skillId>/`. */
  targetName: string;
  /**
   * Absolute path to a pinned local snapshot used as a last-resort fallback
   * if every live fetch attempt fails (e.g. transient network error/rate
   * limit on an unusually large file). Omitted for small/stable files where
   * a stale local copy isn't worth maintaining.
   */
  fallbackSource?: string;
}

export interface RemoteSkillDefinition {
  id: string;
  files: RemoteSkillFile[];
}

/** Absolute path to the `templates/skills-fallback/` directory shipped with this package. */
export const SKILL_FALLBACKS_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "templates",
  "skills-fallback",
);

export const REMOTE_SKILLS: RemoteSkillDefinition[] = [
  {
    id: "ci-cd",
    files: [
      {
        url: "https://raw.githubusercontent.com/ahmedasmar/devops-claude-skills/main/ci-cd/skills/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "postgres",
    files: [
      {
        url: "https://raw.githubusercontent.com/planetscale/database-skills/main/skills/postgres/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "copywriting",
    files: [
      {
        url: "https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/copywriting/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "security",
    files: [
      {
        url: "https://raw.githubusercontent.com/openhands/skills/main/skills/security/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "writing-tests",
    files: [
      {
        url: "https://raw.githubusercontent.com/ntcoding/claude-skillz/main/writing-tests/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "design-taste-frontend",
    files: [
      {
        url: "https://raw.githubusercontent.com/Leonxlnx/taste-skill/main/skills/taste-skill/SKILL.md",
        targetName: "SKILL.md",
        // This file is unusually large (~85KB) compared to every other remote
        // skill in this registry, which makes it more prone to transient
        // network failures/timeouts. Fall back to a pinned local snapshot
        // (may lag behind upstream) rather than failing `init`/`sync` outright.
        fallbackSource: join(SKILL_FALLBACKS_ROOT, "design-taste-frontend", "SKILL.md"),
      },
    ],
  },
  {
    id: "frontend-design",
    files: [
      {
        url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md",
        targetName: "SKILL.md",
      },
      {
        url: "https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/LICENSE.txt",
        targetName: "LICENSE.txt",
      },
    ],
  },
  {
    id: "accessibility-general",
    files: [
      {
        url: "https://raw.githubusercontent.com/mgifford/accessibility-skills/main/skills/ACCESSIBILITY-general/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "forms-a11y",
    files: [
      {
        url: "https://raw.githubusercontent.com/mgifford/accessibility-skills/main/skills/forms/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "keyboard-a11y",
    files: [
      {
        url: "https://raw.githubusercontent.com/mgifford/accessibility-skills/main/skills/keyboard/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "color-contrast-a11y",
    files: [
      {
        url: "https://raw.githubusercontent.com/mgifford/accessibility-skills/main/skills/color-contrast/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "aria-live-regions-a11y",
    files: [
      {
        url: "https://raw.githubusercontent.com/mgifford/accessibility-skills/main/skills/aria-live-regions/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "frontend-a11y",
    files: [
      {
        url: "https://raw.githubusercontent.com/mikemai2awesome/agent-skills/main/skills/frontend-a11y/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "web-performance-optimization",
    files: [
      {
        url: "https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/skills/web-performance-optimization/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "seo-geo-aeo",
    files: [
      {
        url: "https://raw.githubusercontent.com/SNLabat/SEO-GEO-AEO-Skill/main/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "docs-maintenance",
    files: [
      {
        url: "https://raw.githubusercontent.com/jeffrigby/somepulp-agents/main/plugins/codebase-health/skills/docs-maintenance/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "code-review",
    files: [
      {
        url: "https://raw.githubusercontent.com/petyosi/rc/master/claude/skills/code-review/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "release-skills",
    files: [
      {
        url: "https://raw.githubusercontent.com/JimLiu/baoyu-skills/main/.claude/skills/release-skills/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "grilling",
    files: [
      {
        url: "https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
  {
    id: "caveman",
    files: [
      {
        url: "https://raw.githubusercontent.com/JuliusBrussee/caveman/main/skills/caveman/SKILL.md",
        targetName: "SKILL.md",
      },
    ],
  },
];

/**
 * Fetches a URL's text content with retries and a per-attempt timeout.
 * `sizeHint` ('small' | 'large') only affects the error message shown when
 * every attempt fails — large files are more prone to transient network
 * failures, so the message steers the user toward retrying rather than
 * assuming the URL is broken.
 */
export async function fetchRemoteText(
  url: string,
  options: { timeoutMs?: number; sizeHint?: "small" | "large" } = {},
): Promise<string> {
  const { timeoutMs = 15_000, sizeHint = "small" } = options;
  const maxAttempts = 3;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) {
        return await response.text();
      }
      lastError = new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      // Only retry on rate limiting / transient server errors.
      if (response.status !== 429 && response.status < 500) {
        throw lastError;
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        lastError = new Error(`Timed out after ${timeoutMs}ms fetching ${url}`);
      } else {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    } finally {
      clearTimeout(timer);
    }

    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  const sizeNote =
    sizeHint === "large"
      ? " (this file is unusually large, which makes transient failures more likely — re-running init/sync often succeeds)"
      : "";
  throw new Error(`${lastError?.message ?? `Failed to fetch ${url}`}${sizeNote}`);
}

/**
 * Reads a remote skill file's content: tries the live URL first (with
 * retries/timeout), and if that fails and a pinned local fallback exists,
 * uses the fallback instead of failing outright. Returns whether the
 * fallback was used so callers can surface a clear warning to the user.
 */
export async function readRemoteSkillFile(
  file: RemoteSkillFile,
): Promise<{ content: string; usedFallback: boolean }> {
  const sizeHint: "small" | "large" = file.fallbackSource ? "large" : "small";
  try {
    const content = await fetchRemoteText(file.url, { sizeHint });
    return { content, usedFallback: false };
  } catch (err) {
    if (!file.fallbackSource) throw err;
    const content = await readFile(file.fallbackSource, "utf8");
    return { content, usedFallback: true };
  }
}
