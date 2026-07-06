import pc from "picocolors";
import { join } from "node:path";
import {
  listTemplateItems,
  copyTemplateFile,
  readTemplateFileContent,
  itemLabel,
  type TemplateFile,
} from "../lib/copyTemplates.js";
import { loadManifest, saveManifest } from "../lib/manifest.js";
import { hashContent, hashFile } from "../lib/diff.js";
import { getToolkitVersion } from "../lib/version.js";

export interface SyncOptions {
  force?: boolean;
  cwd?: string;
}

export async function sync(options: SyncOptions = {}): Promise<void> {
  const projectRoot = options.cwd ?? process.cwd();
  const version = await getToolkitVersion();
  const manifest = await loadManifest(projectRoot);

  if (!manifest) {
    console.log(
      pc.yellow("No ai-agents-team.lock.json found. Run `ai-agents-team init` first."),
    );
    return;
  }

  const items = await listTemplateItems();
  const fileByTarget = new Map<string, TemplateFile>();
  const ownerByTarget = new Map<string, string>();
  for (const item of items) {
    for (const file of item.files) {
      fileByTarget.set(file.targetRelative, file);
      ownerByTarget.set(file.targetRelative, itemLabel(item));
    }
  }

  const knownTargets = new Set(Object.keys(manifest.files));
  const missingTargets = Array.from(ownerByTarget.keys()).filter(
    (targetRelative) => !knownTargets.has(targetRelative),
  );
  const missingTemplateItems = Array.from(
    new Set(
      missingTargets
        .map((targetRelative) => ownerByTarget.get(targetRelative))
        .filter((label): label is string => Boolean(label)),
    ),
  ).sort();

  let updated = 0;
  let skipped = 0;
  let unchanged = 0;
  let removed = 0;
  let failed = 0;

  for (const [targetRelative, entry] of Object.entries(manifest.files)) {
    const templateFile = fileByTarget.get(targetRelative);
    if (!templateFile) {
      // Template no longer exists in this version of the toolkit.
      console.log(pc.dim(`- ${targetRelative} (no longer provided by toolkit, left as-is)`));
      removed += 1;
      continue;
    }

    try {
      const localHash = await hashFile(join(projectRoot, targetRelative));
      const templateContent = await readTemplateFileContent(templateFile);
      const templateHash = hashContent(templateContent);

      const isLocallyModified = localHash !== null && localHash !== entry.hash;

      if (isLocallyModified && !options.force) {
        console.log(pc.yellow(`⚠ modificato localmente, sync saltato: ${targetRelative}`));
        skipped += 1;
        continue;
      }

      if (localHash === templateHash) {
        unchanged += 1;
        continue;
      }

      await copyTemplateFile(projectRoot, templateFile);
      manifest.files[targetRelative] = { hash: templateHash, version };
      console.log(pc.green("✓ updated"), targetRelative);
      updated += 1;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.log(pc.red("✗"), targetRelative, pc.dim(`(${error.message})`));
      failed += 1;
    }
  }

  manifest.toolkitVersion = version;
  await saveManifest(projectRoot, manifest);

  console.log(
    pc.bold(
      `\nSync complete (ai-agents-team v${version}): ${updated} updated, ${unchanged} unchanged, ${skipped} skipped (local changes), ${removed} no longer in toolkit, ${failed} failed.`,
    ),
  );

  if (missingTemplateItems.length > 0) {
    const preview = missingTemplateItems.slice(0, 6).join(", ");
    const suffix = missingTemplateItems.length > 6 ? ", ..." : "";
    console.log(
      pc.yellow(
        `New templates available but not installed yet (${missingTemplateItems.length}): ${preview}${suffix}`,
      ),
    );
    console.log(
      pc.dim("Run `ai-agents-team init` to install newly added agents/skills/instructions."),
    );
  }

  if (skipped > 0 && !options.force) {
    console.log(pc.dim("Re-run with --force to overwrite locally modified files."));
  }
}
