import prompts from "prompts";
import pc from "picocolors";
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import {
  listTemplateItems,
  copyTemplateFile,
  itemLabel,
  type TemplateItem,
} from "../lib/copyTemplates.js";
import { AGENT_SKILL_DEPENDENCIES } from "../lib/agentSkillDependencies.js";
import { loadManifest, saveManifest, emptyManifest } from "../lib/manifest.js";
import { hashContent } from "../lib/diff.js";
import { getToolkitVersion } from "../lib/version.js";

export interface InitOptions {
  all?: boolean;
  cwd?: string;
}

const GITIGNORE_MANAGED_ENTRIES = [
  ".github/agents/",
  ".github/skills/",
  ".github/instructions/",
  ".github/ai-agents-team.lock.json",
];

async function ensureToolkitEntriesInGitignore(projectRoot: string): Promise<number> {
  const gitignorePath = join(projectRoot, ".gitignore");
  let existing = "";
  try {
    existing = await readFile(gitignorePath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      throw err;
    }
  }

  const lines = existing.split(/\r?\n/);
  const existingSet = new Set(lines.map((line) => line.trim()));
  const toAdd = GITIGNORE_MANAGED_ENTRIES.filter((entry) => !existingSet.has(entry));
  if (toAdd.length === 0) return 0;

  const sep = existing.length === 0 || existing.endsWith("\n") ? "" : "\n";
  const comment = "# ai-agents-team managed outputs";
  const addComment = !existingSet.has(comment);
  const appended = [
    ...(addComment ? [comment] : []),
    ...toAdd,
  ].join("\n");

  await writeFile(gitignorePath, `${existing}${sep}${appended}\n`, "utf8");
  return toAdd.length;
}

export async function init(options: InitOptions = {}): Promise<void> {
  const projectRoot = options.cwd ?? process.cwd();
  const version = await getToolkitVersion();
  const items = await listTemplateItems();

  if (items.length === 0) {
    console.log(pc.yellow("No templates found in this package. Nothing to install."));
    return;
  }

  let selected: TemplateItem[] = items;

  if (!options.all) {
    // Skills are never offered as a standalone choice: they're installed
    // automatically as a dependency of the agent(s) that need them.
    const selectableItems = items.filter((item) => item.category !== "skills");

    const { ids } = await prompts({
      type: "multiselect",
      name: "ids",
      message: "Select agents/instructions to install",
      choices: selectableItems.map((item) => ({
        title: itemLabel(item),
        value: itemLabel(item),
        selected: true,
      })),
      hint: "Space to toggle, Enter to confirm",
    });

    if (!ids || ids.length === 0) {
      console.log(pc.yellow("Nothing selected. Aborted."));
      return;
    }
    const chosen = selectableItems.filter((item) => ids.includes(itemLabel(item)));

    const requiredSkillIds = new Set(
      chosen
        .filter((item) => item.category === "agents")
        .flatMap((item) => AGENT_SKILL_DEPENDENCIES[item.id] ?? []),
    );
    const dependentSkills = items.filter(
      (item) => item.category === "skills" && requiredSkillIds.has(item.id),
    );

    selected = [...chosen, ...dependentSkills];
  }


  const existingManifest = (await loadManifest(projectRoot)) ?? emptyManifest(version);
  const manifest = { ...existingManifest, toolkitVersion: version };

  const failures: { targetRelative: string; error: Error }[] = [];
  let installedCount = 0;

  for (const item of selected) {
    for (const file of item.files) {
      try {
        const content = await copyTemplateFile(projectRoot, file);
        manifest.files[file.targetRelative] = {
          hash: hashContent(content),
          version,
        };
        console.log(pc.green("+"), file.targetRelative);
        installedCount += 1;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        failures.push({ targetRelative: file.targetRelative, error });
        console.log(pc.red("✗"), file.targetRelative, pc.dim(`(${error.message})`));
      }
    }
  }

  await saveManifest(projectRoot, manifest);

  let gitignoreAdded = 0;
  try {
    gitignoreAdded = await ensureToolkitEntriesInGitignore(projectRoot);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.log(pc.yellow(`! Failed to update .gitignore (${error.message})`));
  }

  console.log(pc.bold(`\nInstalled ${installedCount} file(s). ai-agents-team v${version}`));
  if (gitignoreAdded > 0) {
    console.log(pc.dim(`Updated .gitignore with ${gitignoreAdded} ai-agents-team entr${gitignoreAdded === 1 ? "y" : "ies"}.`));
  }
  if (failures.length > 0) {
    console.log(
      pc.yellow(
        `${failures.length} file(s) failed to install (see ✗ above, often a transient network error) — re-run \`init\` or \`sync\` to retry just those.`,
      ),
    );
  }
}
