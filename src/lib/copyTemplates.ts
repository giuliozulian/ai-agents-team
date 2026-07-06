import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { REMOTE_SKILLS, fetchRemoteText } from "./remoteSkills.js";

/** Absolute path to the `templates/` directory shipped with this package. */
export const TEMPLATES_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "templates",
);

export type TemplateCategory = "agents" | "skills" | "instructions";

export interface TemplateFile {
  /** Absolute path to the template source file. Mutually exclusive with `url`. */
  source?: string;
  /** URL to fetch the file's content from at install/sync time. Mutually exclusive with `source`. */
  url?: string;
  /** Path of the installed file, relative to the project root. */
  targetRelative: string;
}

export interface TemplateItem {
  category: TemplateCategory;
  /** Unique id within its category (filename or skill folder name, no extension). */
  id: string;
  files: TemplateFile[];
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

async function listAgentItems(templatesRoot: string): Promise<TemplateItem[]> {
  const dir = join(templatesRoot, "agents");
  const files = await safeReaddirFiles(dir);
  return files
    .filter((f) => f.endsWith(".agent.md"))
    .map((f) => ({
      category: "agents" as const,
      id: basename(f).replace(/\.agent\.md$/, ""),
      files: [
        {
          source: join(dir, f),
          targetRelative: join(".github", "agents", f),
        },
      ],
    }));
}

async function listInstructionItems(templatesRoot: string): Promise<TemplateItem[]> {
  const dir = join(templatesRoot, "instructions");
  const files = await safeReaddirFiles(dir);
  return files
    .filter((f) => f.endsWith(".instructions.md"))
    .map((f) => ({
      category: "instructions" as const,
      id: basename(f).replace(/\.instructions\.md$/, ""),
      files: [
        {
          source: join(dir, f),
          targetRelative: join(".github", "instructions", f),
        },
      ],
    }));
}

async function listSkillItems(templatesRoot: string): Promise<TemplateItem[]> {
  const dir = join(templatesRoot, "skills");
  let skillDirs: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    skillDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const items: TemplateItem[] = [];
  for (const skillId of skillDirs) {
    const skillDir = join(dir, skillId);
    const absoluteFiles = await walk(skillDir);
    items.push({
      category: "skills",
      id: skillId,
      files: absoluteFiles.map((absPath) => ({
        source: absPath,
        targetRelative: join(".github", "skills", skillId, relative(skillDir, absPath)),
      })),
    });
  }
  return items;
}

async function safeReaddirFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

function listRemoteSkillItems(): TemplateItem[] {
  return REMOTE_SKILLS.map((skill) => ({
    category: "skills" as const,
    id: skill.id,
    files: skill.files.map((file) => ({
      url: file.url,
      targetRelative: join(".github", "skills", skill.id, file.targetName),
    })),
  }));
}

/** Lists every template item (agent, skill, instructions file) available in the package. */
export async function listTemplateItems(
  templatesRoot: string = TEMPLATES_ROOT,
): Promise<TemplateItem[]> {
  const [agents, localSkills, instructions] = await Promise.all([
    listAgentItems(templatesRoot),
    listSkillItems(templatesRoot),
    listInstructionItems(templatesRoot),
  ]);
  return [...agents, ...localSkills, ...listRemoteSkillItems(), ...instructions];
}

/** Reads a template file's current content, without writing it anywhere. */
export async function readTemplateFileContent(file: TemplateFile): Promise<string> {
  return file.url ? await fetchRemoteText(file.url) : await readFile(file.source!, "utf8");
}

/** Copies (or fetches) a single template file to its destination under the project root. */
export async function copyTemplateFile(
  projectRoot: string,
  file: TemplateFile,
): Promise<string> {
  const destination = join(projectRoot, file.targetRelative);
  await mkdir(dirname(destination), { recursive: true });
  const content = await readTemplateFileContent(file);
  await writeFile(destination, content, "utf8");
  return content;
}

export function itemLabel(item: TemplateItem): string {
  return `${item.category}/${item.id}`;
}
